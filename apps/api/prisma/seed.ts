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
	await prisma.chat.deleteMany();
	await prisma.message.deleteMany();

	// Создаем пользователей
	const users = await Promise.all([
		prisma.user.create({
			data: {
				username: 'Aliceqwerty',
				email: 'alice@example.com',
				name: 'Alice',
				password: 'Q2!fweR7',
			},
		}),
		prisma.user.create({
			data: {
				username: 'bob2-123',
				email: 'bob@example.com',
				name: 'Bob',
				password: 'B0bSecure!',
			},
		}),
		prisma.user.create({
			data: {
				username: 'charlie_456',
				email: 'charlie@example.com',
				name: 'Charlie',
				password: 'Ch@rlie123',
			},
		}),
		prisma.user.create({
			data: {
				username: 'diana789',
				email: 'diana@example.com',
				name: 'Diana',
				password: 'D!anaPass',
			},
		}),
		prisma.user.create({
			data: {
				username: 'eve-007',
				email: 'eve@example.com',
				name: 'Eve',
				password: 'Ev3Secret!',
			},
		}),
	]);

	console.log(`✅ Created ${users.length} users`);

	// Создаем комнаты с игроками
	const room1 = await prisma.room.create({
		data: {
			name: 'Game Room #1',
			description:
				'Casual room for quick matches. Say hi in chat and start playing.',
			players: {
				connect: [
					{ id: users[0].id },
					{ id: users[1].id },
					{ id: users[2].id },
				],
			},
			chat: {
				create: {
					messages: {
						createMany: {
							data: [
								{ content: 'Hello everyone!', senderId: users[0].id },
								{ content: 'Hi Alice!', senderId: users[1].id },
								{ content: 'Ready to play?', senderId: users[2].id },
							],
						},
					},
				},
			},
		},
		include: {
			players: true,
		},
	});

	const room2 = await prisma.room.create({
		data: {
			name: 'Game Room #2',
			description: 'Duo room for a focused 2-player game.',
			players: {
				connect: [{ id: users[2].id }, { id: users[3].id }],
			},
			chat: { create: {} },
		},
		include: {
			players: true,
		},
	});

	const room3 = await prisma.room.create({
		data: {
			name: 'VIP Lounge',
			description: 'Private lounge for VIP players. Keep it friendly.',
			players: {
				connect: [{ id: users[0].id }, { id: users[4].id }],
			},
			chat: { create: {} },
		},
		include: {
			players: true,
		},
	});

	const room4 = await prisma.room.create({
		data: {
			name: 'Tournament Arena',
			description: 'Competitive room for tournaments and brackets.',
			players: {
				connect: [
					{ id: users[1].id },
					{ id: users[2].id },
					{ id: users[3].id },
					{ id: users[4].id },
				],
			},
			chat: { create: {} },
		},
		include: {
			players: true,
		},
	});

	const room5 = await prisma.room.create({
		data: {
			name: 'Chill Zone',
			description: 'Relaxed room for warming up and experimenting.',
			players: {
				connect: [{ id: users[0].id }],
			},
			chat: { create: {} },
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
