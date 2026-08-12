import { Router } from 'express';
import { prisma } from '../db';
import { authMiddleware, getAuth } from '../auth';
import {
  resetCurrentEpisode,
  resetFullStory,
} from '../story/resetProgress';

export const chaptersRouter = Router();
chaptersRouter.use(authMiddleware);

chaptersRouter.get('/1', async (req, res) => {
  const { playerId } = getAuth(req);
  const progress = await prisma.chapterProgress.findUnique({
    where: { playerId_chapterId: { playerId, chapterId: '1' } },
  });
  const minigame = await prisma.minigameProgress.findUnique({
    where: {
      playerId_gameId: { playerId, gameId: 'pendrive_match3' },
    },
  });

  res.json({
    chapter: {
      id: '1',
      title: 'O número na estrela',
      status: progress?.status ?? 'locked',
      currentNodeId: progress?.currentNodeId,
      flags: progress?.flags ?? {},
    },
    minigame: {
      gameId: 'pendrive_match3',
      score: minigame?.score ?? 0,
      completed: Boolean(minigame?.completedAt),
    },
  });
});

/** Reinicia o episódio atual (Capítulo 1), mantém conta/perfil. */
chaptersRouter.post('/1/reset', async (req, res) => {
  const { playerId } = getAuth(req);
  const result = await resetCurrentEpisode(playerId);
  res.json(result);
});

/** Reinicia toda a história, mantém conta/perfil. */
chaptersRouter.post('/reset-story', async (req, res) => {
  const { playerId } = getAuth(req);
  const result = await resetFullStory(playerId);
  res.json(result);
});
