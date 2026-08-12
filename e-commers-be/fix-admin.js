const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function run() {
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@saksershop.com' },
    update: { passwordHash, globalRole: 'SUPER_ADMIN' },
    create: {
      email: 'admin@saksershop.com',
      fullName: 'Super Admin',
      passwordHash,
      globalRole: 'SUPER_ADMIN'
    }
  });
  console.log('admin@saksershop.com created/updated with password123');
}
run().catch(console.error).finally(() => prisma.$disconnect());
