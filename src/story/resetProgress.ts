import { prisma } from '../db';
import { ensureChapter1State } from './ensureChapter1';

/** Contatos / minigames do episódio atual (Capítulo 1). */
const EPISODE_1 = {
  chapterId: '1',
  contactIds: ['lowe'] as string[],
  gameIds: ['pendrive_match3'] as string[],
};

/**
 * Reinicia só o episódio atual (Cap. 1), mantendo a conta e o perfil.
 */
export async function resetCurrentEpisode(playerId: string) {
  const player = await prisma.player.findUniqueOrThrow({
    where: { id: playerId },
  });

  await prisma.$transaction([
    prisma.chatState.deleteMany({
      where: {
        playerId,
        contactId: { in: EPISODE_1.contactIds },
      },
    }),
    prisma.minigameProgress.deleteMany({
      where: {
        playerId,
        gameId: { in: EPISODE_1.gameIds },
      },
    }),
    prisma.chapterProgress.deleteMany({
      where: {
        playerId,
        chapterId: EPISODE_1.chapterId,
      },
    }),
  ]);

  await ensureChapter1State(playerId, player.displayName);
  return { ok: true as const, mode: 'episode' as const, chapterId: EPISODE_1.chapterId };
}

/**
 * Reinicia toda a história (todos os capítulos / chats / minigames),
 * mantendo a conta e o perfil.
 */
export async function resetFullStory(playerId: string) {
  const player = await prisma.player.findUniqueOrThrow({
    where: { id: playerId },
  });

  await prisma.$transaction([
    prisma.chatState.deleteMany({ where: { playerId } }),
    prisma.minigameProgress.deleteMany({ where: { playerId } }),
    prisma.chapterProgress.deleteMany({ where: { playerId } }),
  ]);

  await ensureChapter1State(playerId, player.displayName);
  return { ok: true as const, mode: 'story' as const };
}
