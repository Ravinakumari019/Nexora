/**
 * Nexora — Database Seed Script
 *
 * Creates an initial admin user for development and testing.
 * Run with: bun run seed (or bunx ts-node prisma/seed.ts)
 *
 * This script is idempotent — it uses upsert to avoid duplicates.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Nexora database...\n');

  // --- Admin User ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexora.dev' },
    update: {},
    create: {
      name: 'Nexora Admin',
      email: 'admin@nexora.dev',
      image: 'https://api.dicebear.com/9.x/initials/svg?seed=NA',
    },
  });

  console.log(`  ✓ Admin user: ${admin.name} (${admin.email})`);

  // --- Demo User ---
  const demo = await prisma.user.upsert({
    where: { email: 'demo@nexora.dev' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@nexora.dev',
      image: 'https://api.dicebear.com/9.x/initials/svg?seed=DU',
    },
  });

  console.log(`  ✓ Demo user:  ${demo.name} (${demo.email})`);

  // --- Sample Conversation ---
  const conversation = await prisma.conversation.create({
    data: {
      title: 'Welcome to Nexora',
      participants: {
        connect: [{ id: admin.id }, { id: demo.id }],
      },
      messages: {
        create: [
          {
            content: 'Welcome to Nexora! 🎉 This is your first conversation.',
            authorId: admin.id,
          },
          {
            content: 'Hey! Excited to try this out. The UI looks amazing!',
            authorId: demo.id,
          },
          {
            content:
              'Feel free to explore the features. You can chat in real-time, use the AI assistant, and customize your settings.',
            authorId: admin.id,
          },
        ],
      },
    },
  });

  console.log(
    `  ✓ Conversation: "${conversation.title}" (${3} messages)\n`
  );

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
