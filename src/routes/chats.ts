import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware, getAuth } from '../auth';
import {
  CONTACTS,
  choiceReplies,
  getNode,
  getStartNodeId,
  liveChoicesForNode,
  playFromNode,
  resolveChoice,
} from '../story/engine';
import { ensureChapter1State } from '../story/ensureChapter1';
import type { ChatEvent, RenderedMessage, StoryChoice } from '../story/types';

export const chatsRouter = Router();
chatsRouter.use(authMiddleware);

async function applyEvents(
  playerId: string,
  events: ChatEvent[],
  flags: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  const nextFlags = { ...flags };
  for (const ev of events) {
    if (ev.type === 'set_flag') nextFlags[ev.flag] = true;
    if (ev.type === 'chapter_complete') {
      await prisma.chapterProgress.update({
        where: { playerId_chapterId: { playerId, chapterId: ev.chapterId } },
        data: { status: 'completed' },
      });
    }
    if (ev.type === 'unlock_minigame') {
      nextFlags[`unlock_${ev.gameId}`] = true;
    }
  }
  return nextFlags;
}

chatsRouter.get('/:contactId', async (req, res) => {
  const { playerId } = getAuth(req);
  const contactId = req.params.contactId;
  const contact = CONTACTS.find((c) => c.id === contactId);
  if (!contact) {
    res.status(404).json({ error: 'Contact not found' });
    return;
  }

  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });

  if (contactId === 'lowe') {
    await ensureChapter1State(playerId, player.displayName);
  }

  let chat = await prisma.chatState.findUnique({
    where: { playerId_contactId: { playerId, contactId } },
  });

  if (!chat && contactId === 'lowe') {
    const startId = getStartNodeId('lowe')!;
    const played = playFromNode(startId, player.displayName);
    chat = await prisma.chatState.create({
      data: {
        playerId,
        contactId,
        messages: played.newMessages,
        currentNodeId: played.currentNodeId,
        pendingChoices: played.pendingChoices,
        unread: 0,
      },
    });
  }

  if (!chat && contact.unlocked) {
    chat = await prisma.chatState.create({
      data: {
        playerId,
        contactId,
        messages: [],
        currentNodeId: null,
        pendingChoices: null,
        unread: 0,
      },
    });
  }

  if (!chat) {
    res.status(404).json({ error: 'Chat not available' });
    return;
  }

  await prisma.chatState.update({
    where: { id: chat.id },
    data: { unread: 0 },
  });

  // Sempre sincroniza opções com o nó vivo do roteiro (evita pending stale)
  const liveChoices = liveChoicesForNode(chat.currentNodeId);
  if (
    liveChoices &&
    JSON.stringify(liveChoices) !== JSON.stringify(chat.pendingChoices)
  ) {
    chat = await prisma.chatState.update({
      where: { id: chat.id },
      data: { pendingChoices: liveChoices },
    });
  }

  const chapter = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });
  const flags = (chapter?.flags as Record<string, boolean>) ?? {};

  res.json({
    contact,
    messages: chat.messages,
    currentNodeId: chat.currentNodeId,
    pendingChoices: liveChoices ?? chat.pendingChoices,
    events: flags.unlock_pendrive_match3 && !flags.pendrive_decrypted
      ? [{ type: 'unlock_minigame', gameId: 'pendrive_match3' }]
      : [],
    flags,
    storyVersion: 3,
  });
});

const choiceSchema = z.object({
  choiceId: z.string(),
});

chatsRouter.post('/:contactId/choice', async (req, res) => {
  const { playerId } = getAuth(req);
  const contactId = req.params.contactId;
  const parsed = choiceSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'choiceId required' });
    return;
  }

  const chat = await prisma.chatState.findUnique({
    where: { playerId_contactId: { playerId, contactId } },
  });
  if (!chat?.currentNodeId) {
    res.status(400).json({ error: 'No active chat node' });
    return;
  }

  const pending = (chat.pendingChoices as StoryChoice[] | null) ?? null;
  const choice = resolveChoice(
    chat.currentNodeId,
    parsed.data.choiceId,
    pending,
  );
  if (!choice) {
    res.status(400).json({
      error: 'Invalid choice for current node',
      currentNodeId: chat.currentNodeId,
      choiceId: parsed.data.choiceId,
      available: (pending ?? liveChoicesForNode(chat.currentNodeId) ?? []).map(
        (c) => c.id,
      ),
    });
    return;
  }

  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const replies = choiceReplies(choice);
  const played = playFromNode(choice.next, player.displayName, replies);

  const existing = (chat.messages as RenderedMessage[]) ?? [];
  const merged = [...existing, ...played.newMessages];

  const chapter = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });
  const flags = (chapter?.flags as Record<string, boolean>) ?? {};
  const nextFlags = await applyEvents(playerId, played.events, flags);

  await prisma.$transaction([
    prisma.chatState.update({
      where: { id: chat.id },
      data: {
        messages: merged,
        currentNodeId: played.currentNodeId,
        pendingChoices: played.pendingChoices,
      },
    }),
    prisma.chapterProgress.update({
      where: { playerId_chapterId: { playerId, chapterId: '1' } },
      data: {
        currentNodeId: played.currentNodeId,
        flags: nextFlags,
      },
    }),
  ]);

  res.json({
    newMessages: played.newMessages,
    messages: merged,
    currentNodeId: played.currentNodeId,
    pendingChoices: played.pendingChoices as StoryChoice[] | null,
    events: played.events,
    flags: nextFlags,
  });
});

chatsRouter.get('/:contactId/node', async (req, res) => {
  const nodeId = String(req.query.nodeId ?? '');
  const node = getNode(nodeId);
  if (!node) {
    res.status(404).json({ error: 'Node not found' });
    return;
  }
  res.json({ node: { id: node.id, choices: node.choices ?? [] } });
});
