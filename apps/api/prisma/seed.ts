import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Очистка существующих данных
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Создаем пользователей
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie Brown',
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana Prince',
      },
    }),
    prisma.user.create({
      data: {
        email: 'eve@example.com',
        name: 'Eve Adams',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Создаем комнаты с игроками
  const room1 = await prisma.room.create({
    data: {
      name: 'Game Room #1',
      players: {
        connect: [
          { id: users[0].id },
          { id: users[1].id },
          { id: users[2].id },
        ],
      },
    },
    include: {
      players: true,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: 'Game Room #2',
      players: {
        connect: [{ id: users[2].id }, { id: users[3].id }],
      },
    },
    include: {
      players: true,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: 'VIP Lounge',
      players: {
        connect: [{ id: users[0].id }, { id: users[4].id }],
      },
    },
    include: {
      players: true,
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: 'Tournament Arena',
      players: {
        connect: [
          { id: users[1].id },
          { id: users[2].id },
          { id: users[3].id },
          { id: users[4].id },
        ],
      },
    },
    include: {
      players: true,
    },
  });

  const room5 = await prisma.room.create({
    data: {
      name: 'Chill Zone',
      players: {
        connect: [{ id: users[0].id }],
      },
    },
    include: {
      players: true,
    },
  });

  console.log(`✅ Created 5 rooms`);

  console.log('\n📊 Summary:');
  console.log(`- ${room1.name}: ${room1.players.length} players`);
  console.log(`- ${room2.name}: ${room2.players.length} players`);
  console.log(`- ${room3.name}: ${room3.players.length} players`);
  console.log(`- ${room4.name}: ${room4.players.length} players`);
  console.log(`- ${room5.name}: ${room5.players.length} players`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
