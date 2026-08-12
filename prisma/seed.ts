import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed idempotente do Capítulo 1.
 * Contatos e diálogos vivem no código (`src/story`);
 * o progresso do jogador é criado no `POST /auth/guest`.
 */
async function main() {
  console.log('Darksoot seed — Capítulo 1');
  console.log('Story source: server/src/story/chapter1/lowe.ts');
  console.log('Contacts: Lowe (unlocked), Luke/Olivia/Scar (locked stubs)');
  const players = await prisma.player.count();
  const chapters = await prisma.chapterProgress.count();
  const chats = await prisma.chatState.count();
  console.log(`DB snapshot → players=${players} chapters=${chapters} chats=${chats}`);
  console.log('Seed OK');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
