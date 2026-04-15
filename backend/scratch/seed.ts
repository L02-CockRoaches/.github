import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const game = await prisma.game.upsert({
    where: { title: 'GameTwoShape' },
    update: {},
    create: {
      title: 'GameTwoShape',
      description: 'Train your brain, both sides at once by drawing different shapes simultaneously.',
    },
  });
  console.log({ game });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
