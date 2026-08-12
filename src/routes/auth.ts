import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authMiddleware, getAuth, signToken } from '../auth';
import { ensureChapter1State } from '../story/ensureChapter1';
import { rewritePlayerNameInText } from '../story/engine';
import type { RenderedMessage } from '../story/types';

export const authRouter = Router();

const guestSchema = z.object({
  deviceId: z.string().min(8).max(128),
  displayName: z.string().min(1).max(40).optional(),
});

authRouter.post('/guest', async (req, res) => {
  const parsed = guestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { deviceId, displayName } = parsed.data;

  let player = await prisma.player.findUnique({ where: { deviceId } });
  if (!player) {
    player = await prisma.player.create({
      data: {
        deviceId,
        displayName: displayName ?? 'Mc',
      },
    });
  }

  await ensureChapter1State(player.id, player.displayName);

  const token = signToken({ playerId: player.id, deviceId: player.deviceId });
  res.json({
    token,
    player: {
      id: player.id,
      displayName: player.displayName,
      deviceId: player.deviceId,
    },
    storyVersion: 3,
  });
});

const profileSchema = z.object({
  displayName: z.string().min(1).max(40),
});

authRouter.patch('/me', authMiddleware, async (req, res) => {
  const { playerId } = getAuth(req);
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'displayName inválido' });
    return;
  }

  const newName = parsed.data.displayName.trim();
  if (!newName) {
    res.status(400).json({ error: 'displayName inválido' });
    return;
  }

  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const oldName = player.displayName;

  if (oldName === newName) {
    res.json({
      player: {
        id: player.id,
        displayName: player.displayName,
        deviceId: player.deviceId,
      },
    });
    return;
  }

  const chats = await prisma.chatState.findMany({ where: { playerId } });
  await prisma.$transaction(async (tx) => {
    await tx.player.update({
      where: { id: playerId },
      data: { displayName: newName },
    });

    for (const chat of chats) {
      const messages = (chat.messages as RenderedMessage[]) ?? [];
      const rewritten = messages.map((m) => ({
        ...m,
        text: m.text
          ? rewritePlayerNameInText(m.text, oldName, newName)
          : m.text,
        caption: m.caption
          ? rewritePlayerNameInText(m.caption, oldName, newName)
          : m.caption,
      }));
      await tx.chatState.update({
        where: { id: chat.id },
        data: { messages: rewritten },
      });
    }
  });

  const updated = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  res.json({
    player: {
      id: updated.id,
      displayName: updated.displayName,
      deviceId: updated.deviceId,
    },
  });
});
