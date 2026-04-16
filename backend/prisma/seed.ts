import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const games = [
    {
      title: 'Memory Match',
      description: 'Luyện tập trí nhớ bằng cách tìm các cặp thẻ bài giống nhau.',
    },
    {
      title: 'Shape Sorter',
      description: 'Phân loại các hình khối vào đúng vị trí để rèn luyện khả năng quan sát không gian.',
    },
    {
      title: 'Speed Calc',
      description: 'Thử thách tính nhẩm nhanh với các phép tính cơ bản trong thời gian giới hạn.',
    },
  ];

  console.log('Đang bắt đầu seeding games...');

  for (const game of games) {
    const upsertedGame = await prisma.game.upsert({
      where: { title: game.title },
      update: {},
      create: game,
    });
    console.log(`Đã seed game: ${upsertedGame.title}`);
  }

  console.log('Hoàn thành seeding games!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
