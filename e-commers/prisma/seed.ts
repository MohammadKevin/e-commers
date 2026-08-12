import { PrismaClient, GlobalRole, StoreRole, UserTier } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/e_commers_shop';
const url = new URL(dbUrl);
const adapter = new PrismaMariaDb({
  host: url.hostname || 'localhost',
  port: url.port ? parseInt(url.port, 10) : 3306,
  user: url.username ? decodeURIComponent(url.username) : 'root',
  password: url.password ? decodeURIComponent(url.password) : '',
  database: url.pathname.replace(/^\//, '') || 'e_commers_shop',
  connectionLimit: 10,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting Database Seeding for PasarIndo Multi-Role Accounts...');

  const defaultPassword = await bcrypt.hash('Password123!', 10);

  // 1. SUPER ADMIN
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@pasarindo.com' },
    update: {},
    create: {
      email: 'admin@pasarindo.com',
      passwordHash: defaultPassword,
      fullName: 'Super Admin PasarIndo',
      phone: '081211110001',
      globalRole: GlobalRole.SUPER_ADMIN,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);




  console.log('\n🎉 ALL ROLE ACCOUNTS SEEDED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
