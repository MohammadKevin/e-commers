require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

function getAdapter() {
  const dbUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/E-commers';
  const url = new URL(dbUrl);

  return new PrismaMariaDb({
    host: url.hostname || 'localhost',
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: url.username ? decodeURIComponent(url.username) : 'root',
    password: url.password ? decodeURIComponent(url.password) : '',
    database: url.pathname.replace(/^\//, '') || 'E-commers',
    connectionLimit: 10,
  });
}

const prisma = new PrismaClient({ adapter: getAdapter() });

const adjs = ["Keren", "Super", "Mewah", "Elegan", "Premium", "Klasik", "Modern", "Minimalis", "Pro", "Max"];
const nouns = ["Sepatu Lari", "Jam Tangan", "Headphone", "Kamera", "Kacamata", "Tas Ransel", "Laptop", "Smartphone", "Tablet", "Monitor", "Keyboard Mekanikal", "Mouse Gaming", "Jaket Kulit", "Kemeja Flanel", "Celana Jeans", "Sneakers", "Topi", "Parfum", "Buku Catatan", "Lampu Meja"];
const images = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop", // Sepatu
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop", // Jam
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop", // Headphone
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop", // Kamera
  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop", // Kacamata
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=2015&auto=format&fit=crop", // Tas
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop", // Laptop
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop", // Smartphone
  "https://images.unsplash.com/photo-1585565804112-f201f68c48b4?q=80&w=2070&auto=format&fit=crop", // Celana
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2000&auto=format&fit=crop", // Sepatu 2
  "https://images.unsplash.com/photo-1593998066526-65fcab3021a2?q=80&w=2069&auto=format&fit=crop", // Jam 2
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2065&auto=format&fit=crop", // Headphone 2
];
const cats = ["Elektronik", "Fashion Pria", "Fashion Wanita", "Aksesoris", "Gaya Hidup"];

async function main() {
  console.log('Menyiapkan 50 data produk secara random...');

  // 1. Siapkan Kategori
  const categoryIds = [];
  for (const c of cats) {
    let cat = await prisma.category.findFirst({ where: { name: c } });
    if (!cat) {
      cat = await prisma.category.create({
        data: { name: c, slug: c.toLowerCase().replace(/\s+/g, '-') }
      });
    }
    categoryIds.push(cat.id);
  }

  // 2. Siapkan Toko
  let store = await prisma.store.findFirst();
  if (!store) {
    const user = await prisma.user.findFirst();
    if(!user) throw new Error("Belum ada User!");
    store = await prisma.store.create({
      data: {
        name: "Toko Saksershop",
        slug: "toko-saksershop",
        description: "Toko resmi Saksershop",
        city: "Jakarta",
        members: {
          create: { userId: user.id, role: "OWNER" }
        }
      }
    });
  }

  const storeId = store.id;

  // 3. Generate 50 Produk
  let successCount = 0;
  for (let i = 1; i <= 50; i++) {
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const adj = adjs[Math.floor(Math.random() * adjs.length)];
    const name = `${noun} ${adj}`;
    
    // Harga antara 50rb sd 5jt
    const price = Math.floor(Math.random() * 50) * 100000 + 50000;
    
    const catId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    const imgUrl = images[Math.floor(Math.random() * images.length)];
    
    const slug = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-5) + '-' + i;

    try {
      await prisma.product.create({
        data: {
          storeId: storeId,
          categoryId: catId,
          name: name,
          slug: slug,
          description: `Ini adalah ${name} kualitas terbaik. Dibuat dengan material premium, sangat awet, dan nyaman dipakai sehari-hari.`,
          isPublished: true,
          images: {
            create: [
              { imageUrl: imgUrl, isPrimary: true, sortOrder: 1 }
            ]
          },
          variants: {
            create: [
              {
                sku: 'SKU-' + slug.substring(0, 10).toUpperCase() + '-' + i,
                name: 'Default',
                price: price,
                stock: Math.floor(Math.random() * 100) + 10,
                weight: Math.floor(Math.random() * 900) + 100,
                imageUrl: imgUrl
              }
            ]
          }
        }
      });
      successCount++;
    } catch (e) {
      console.error(`❌ Gagal buat: ${name}`, e.message);
    }
  }

  console.log(`\n🎉 Berhasil menambahkan ${successCount} produk baru ke Database!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
