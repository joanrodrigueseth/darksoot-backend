import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, getAuth } from '../auth';
import { CONTACTS } from '../story/engine';
import { buildCharacterProfile } from '../story/profiles';

export const contactsRouter = Router();
contactsRouter.use(authMiddleware);

async function isContactUnlocked(
  playerId: string,
  contactId: string,
): Promise<boolean> {
  const base = CONTACTS.find((c) => c.id === contactId);
  if (!base) return false;
  if (base.unlocked) return true;

  const chapter = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });
  const flags = (chapter?.flags as Record<string, boolean>) ?? {};
  return Boolean(flags[`contact_${contactId}`]);
}

contactsRouter.get('/', async (req, res) => {
  const { playerId } = getAuth(req);
  const chats = await prisma.chatState.findMany({ where: { playerId } });
  const byContact = new Map(chats.map((c) => [c.contactId, c]));

  const chapter = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });
  const flags = (chapter?.flags as Record<string, boolean>) ?? {};

  const list = CONTACTS.map((c) => {
    const chat = byContact.get(c.id);
    const messages = (chat?.messages as { text?: string; kind?: string }[]) ?? [];
    const last = messages[messages.length - 1];
    return {
      ...c,
      unlocked: c.unlocked || Boolean(flags[`contact_${c.id}`]),
      unread: chat?.unread ?? 0,
      lastMessage:
        last?.kind === 'image'
          ? '📷 Foto'
          : last?.text?.slice(0, 80) ?? (c.unlocked ? 'Nova conversa' : 'Bloqueado'),
    };
  });

  res.json({ contacts: list });
});

contactsRouter.get('/:contactId/profile', async (req, res) => {
  const { playerId } = getAuth(req);
  const contactId = req.params.contactId;
  const unlocked = await isContactUnlocked(playerId, contactId);
  const profile = buildCharacterProfile(contactId, unlocked);
  if (!profile) {
    res.status(404).json({ error: 'Contact not found' });
    return;
  }
  res.json({
    profile: unlocked ? profile : { ...profile, mediaKeys: [], link: '' },
  });
});
