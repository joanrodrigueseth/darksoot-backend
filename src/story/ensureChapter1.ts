import { prisma } from '../db';
import { getStartNodeId, liveChoicesForNode, playFromNode } from '../story/engine';

/** Suba só quando o roteiro mudar de forma incompatível. */
export const CHAPTER1_STORY_VERSION = 3;

const LEGACY_NODES = new Set([
  'lowe_intro',
  'lowe_after_choice1',
  'lowe_after_choice2',
]);

type Flags = Record<string, unknown>;

/**
 * Garante que o jogador tem capítulo/chat.
 * NÃO apaga progresso salvo — só migra saves legados inválidos.
 */
export async function ensureChapter1State(
  playerId: string,
  displayName: string,
): Promise<void> {
  const startId = getStartNodeId('lowe');
  if (!startId) return;

  let chapter = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });

  let chat = await prisma.chatState.findUnique({
    where: { playerId_contactId: { playerId, contactId: 'lowe' } },
  });

  const flags = ((chapter?.flags as Flags) ?? {}) as Flags;
  const version = Number(flags.storyVersion ?? 0);
  const isLegacyNode = !!chat?.currentNodeId && LEGACY_NODES.has(chat.currentNodeId);

  // Save válido no roteiro atual: só garante flag de versão e choices ao vivo
  if (chat && chapter && !isLegacyNode && version >= CHAPTER1_STORY_VERSION) {
    const live = liveChoicesForNode(chat.currentNodeId);
    if (live && JSON.stringify(live) !== JSON.stringify(chat.pendingChoices)) {
      await prisma.chatState.update({
        where: { id: chat.id },
        data: { pendingChoices: live },
      });
    }
    return;
  }

  // Save legado (nós antigos): precisa resetar uma vez
  if (chat && isLegacyNode) {
    const played = playFromNode(startId, displayName);
    await prisma.chapterProgress.update({
      where: { id: chapter!.id },
      data: {
        status: 'active',
        currentNodeId: played.currentNodeId,
        flags: { storyVersion: CHAPTER1_STORY_VERSION },
      },
    });
    await prisma.chatState.update({
      where: { id: chat.id },
      data: {
        messages: played.newMessages,
        currentNodeId: played.currentNodeId,
        pendingChoices: played.pendingChoices,
        unread: played.newMessages.length,
      },
    });
    return;
  }

  // Save atual com versão antiga mas nó válido: só atualiza a flag (mantém mensagens)
  if (chat && chapter && !isLegacyNode && version < CHAPTER1_STORY_VERSION) {
    await prisma.chapterProgress.update({
      where: { id: chapter.id },
      data: {
        flags: { ...flags, storyVersion: CHAPTER1_STORY_VERSION },
      },
    });
    const live = liveChoicesForNode(chat.currentNodeId);
    if (live) {
      await prisma.chatState.update({
        where: { id: chat.id },
        data: { pendingChoices: live },
      });
    }
    return;
  }

  // Primeiro acesso: cria do zero
  const played = playFromNode(startId, displayName);
  const nextFlags = { storyVersion: CHAPTER1_STORY_VERSION };

  if (!chapter) {
    await prisma.chapterProgress.create({
      data: {
        playerId,
        chapterId: '1',
        status: 'active',
        currentNodeId: played.currentNodeId,
        flags: nextFlags,
      },
    });
  } else {
    await prisma.chapterProgress.update({
      where: { id: chapter.id },
      data: {
        status: 'active',
        currentNodeId: played.currentNodeId,
        flags: nextFlags,
      },
    });
  }

  if (!chat) {
    await prisma.chatState.create({
      data: {
        playerId,
        contactId: 'lowe',
        messages: played.newMessages,
        currentNodeId: played.currentNodeId,
        pendingChoices: played.pendingChoices,
        unread: played.newMessages.length,
      },
    });
  }

  await prisma.minigameProgress.upsert({
    where: { playerId_gameId: { playerId, gameId: 'pendrive_match3' } },
    create: { playerId, gameId: 'pendrive_match3' },
    update: {},
  });
}
