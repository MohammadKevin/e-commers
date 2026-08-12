require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

function getAdapter() {
  const url = new URL(process.env.DATABASE_URL || 'mysql://root:@localhost:3306/E-commers');
  return new PrismaMariaDb({
    host: url.hostname, port: url.port ? parseInt(url.port) : 3306,
    user: url.username ? decodeURIComponent(url.username) : 'root',
    password: url.password ? decodeURIComponent(url.password) : '',
    database: url.pathname.replace(/^\//, '') || 'E-commers', connectionLimit: 10,
  });
}
const prisma = new PrismaClient({ adapter: getAdapter() });

const STORE_ID = '5f4261d9-d557-405d-a5e3-8568a360fe5e';

const CATEGORIES = [
  { name: 'Elektronik', slug: 'elektronik' },
  { name: 'Fashion Pria', slug: 'fashion-pria' },
  { name: 'Fashion Wanita', slug: 'fashion-wanita' },
  { name: 'Aksesoris', slug: 'aksesoris' },
  { name: 'Sepatu & Sandal', slug: 'sepatu-sandal' },
  { name: 'Tas & Koper', slug: 'tas-koper' },
  { name: 'Olahraga', slug: 'olahraga' },
  { name: 'Kesehatan & Kecantikan', slug: 'kesehatan-kecantikan' },
  { name: 'Rumah & Dapur', slug: 'rumah-dapur' },
  { name: 'Buku & Alat Tulis', slug: 'buku-alat-tulis' },
];

const PRODUCTS = [
  // === ELEKTRONIK ===
  { name: 'Laptop Gaming ASUS ROG Strix G15', cat: 'elektronik', price: 18500000, stock: 25, img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop', variants: [{n:'8GB/512GB',p:18500000,s:15},{n:'16GB/1TB',p:22000000,s:10}] },
  { name: 'Laptop MacBook Air M2', cat: 'elektronik', price: 16900000, stock: 20, img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026&auto=format&fit=crop', variants: [{n:'8GB/256GB',p:16900000,s:12},{n:'16GB/512GB',p:21000000,s:8}] },
  { name: 'Smartphone Samsung Galaxy S24 Ultra', cat: 'elektronik', price: 14999000, stock: 40, img: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop', variants: [{n:'12GB/256GB Phantom Black',p:14999000,s:20},{n:'12GB/512GB Titanium Gray',p:17499000,s:20}] },
  { name: 'iPhone 15 Pro Max 256GB', cat: 'elektronik', price: 19500000, stock: 30, img: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=2070&auto=format&fit=crop', variants: [{n:'256GB Natural Titanium',p:19500000,s:15},{n:'512GB Black Titanium',p:23000000,s:15}] },
  { name: 'Headphone Sony WH-1000XM5', cat: 'elektronik', price: 4500000, stock: 50, img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Hitam',p:4500000,s:30},{n:'Putih',p:4500000,s:20}] },
  { name: 'TWS Airpods Pro 2nd Gen', cat: 'elektronik', price: 3800000, stock: 60, img: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?q=80&w=2070&auto=format&fit=crop', variants: [{n:'White',p:3800000,s:60}] },
  { name: 'Monitor Gaming LG 27" 4K 144Hz', cat: 'elektronik', price: 7200000, stock: 18, img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2070&auto=format&fit=crop', variants: [{n:'27 inch 4K',p:7200000,s:18}] },
  { name: 'Keyboard Mechanical Razer BlackWidow', cat: 'elektronik', price: 1850000, stock: 35, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Green Switch',p:1850000,s:20},{n:'Yellow Switch',p:1850000,s:15}] },
  { name: 'Mouse Gaming Logitech G502 X', cat: 'elektronik', price: 899000, stock: 45, img: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=2065&auto=format&fit=crop', variants: [{n:'Hitam',p:899000,s:30},{n:'Putih',p:899000,s:15}] },
  { name: 'Kamera Mirrorless Sony A7 IV', cat: 'elektronik', price: 32000000, stock: 10, img: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Body Only',p:32000000,s:5},{n:'Kit 28-70mm',p:38000000,s:5}] },
  { name: 'Tablet iPad Pro 12.9" M4', cat: 'elektronik', price: 18000000, stock: 20, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2033&auto=format&fit=crop', variants: [{n:'256GB WiFi',p:18000000,s:10},{n:'512GB WiFi+5G',p:22000000,s:10}] },
  { name: 'Smartwatch Apple Watch Series 9', cat: 'elektronik', price: 6500000, stock: 35, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', variants: [{n:'41mm Silver',p:6500000,s:20},{n:'45mm Midnight',p:7200000,s:15}] },
  // === FASHION PRIA ===
  { name: 'Kemeja Flannel Premium Pria', cat: 'fashion-pria', price: 289000, stock: 80, img: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=2070&auto=format&fit=crop', variants: [{n:'S',p:289000,s:20},{n:'M',p:289000,s:30},{n:'L',p:289000,s:20},{n:'XL',p:289000,s:10}] },
  { name: 'Celana Jeans Slim Fit Denim', cat: 'fashion-pria', price: 349000, stock: 70, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1926&auto=format&fit=crop', variants: [{n:'28',p:349000,s:15},{n:'30',p:349000,s:20},{n:'32',p:349000,s:20},{n:'34',p:349000,s:15}] },
  { name: 'Polo Shirt Pria Casual', cat: 'fashion-pria', price: 199000, stock: 100, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', variants: [{n:'S Putih',p:199000,s:25},{n:'M Putih',p:199000,s:30},{n:'L Navy',p:199000,s:30},{n:'XL Hitam',p:199000,s:15}] },
  { name: 'Jaket Bomber Pria Premium', cat: 'fashion-pria', price: 499000, stock: 45, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop', variants: [{n:'M Hitam',p:499000,s:15},{n:'L Hitam',p:499000,s:20},{n:'XL Army Green',p:499000,s:10}] },
  { name: 'Sweater Hoodie Oversize Pria', cat: 'fashion-pria', price: 279000, stock: 90, img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?q=80&w=1887&auto=format&fit=crop', variants: [{n:'M Abu-abu',p:279000,s:30},{n:'L Hitam',p:279000,s:35},{n:'XL Coklat',p:279000,s:25}] },
  // === FASHION WANITA ===
  { name: 'Dress Midi Floral Wanita', cat: 'fashion-wanita', price: 329000, stock: 60, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1946&auto=format&fit=crop', variants: [{n:'S Merah',p:329000,s:15},{n:'M Biru',p:329000,s:20},{n:'L Pink',p:329000,s:15},{n:'XL Kuning',p:329000,s:10}] },
  { name: 'Blouse Chiffon Elegan Wanita', cat: 'fashion-wanita', price: 219000, stock: 75, img: 'https://images.unsplash.com/photo-1485518882345-15568b007407?q=80&w=2070&auto=format&fit=crop', variants: [{n:'S Putih',p:219000,s:25},{n:'M Krem',p:219000,s:30},{n:'L Mint',p:219000,s:20}] },
  { name: 'Rok A-Line Casual Wanita', cat: 'fashion-wanita', price: 189000, stock: 55, img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1887&auto=format&fit=crop', variants: [{n:'S Navy',p:189000,s:20},{n:'M Hitam',p:189000,s:20},{n:'L Coklat',p:189000,s:15}] },
  { name: 'Cardigan Rajut Premium Wanita', cat: 'fashion-wanita', price: 259000, stock: 65, img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop', variants: [{n:'S Abu-abu',p:259000,s:20},{n:'M Krem',p:259000,s:25},{n:'L Pink Dusty',p:259000,s:20}] },
  // === AKSESORIS ===
  { name: 'Jam Tangan Analog Klasik', cat: 'aksesoris', price: 899000, stock: 40, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop', variants: [{n:'Silver',p:899000,s:20},{n:'Gold',p:999000,s:20}] },
  { name: 'Kacamata Sunglasses Polarized', cat: 'aksesoris', price: 349000, stock: 55, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080&auto=format&fit=crop', variants: [{n:'Hitam',p:349000,s:25},{n:'Coklat',p:349000,s:15},{n:'Biru',p:349000,s:15}] },
  { name: 'Gelang Titanium Premium', cat: 'aksesoris', price: 299000, stock: 50, img: 'https://images.unsplash.com/photo-1573408301185-9519f94815b1?q=80&w=2070&auto=format&fit=crop', variants: [{n:'18cm',p:299000,s:20},{n:'20cm',p:299000,s:20},{n:'22cm',p:299000,s:10}] },
  { name: 'Topi Baseball Cap Distro', cat: 'aksesoris', price: 129000, stock: 80, img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1936&auto=format&fit=crop', variants: [{n:'Hitam',p:129000,s:30},{n:'Navy',p:129000,s:25},{n:'Putih',p:129000,s:25}] },
  // === SEPATU ===
  { name: 'Sepatu Sneakers Nike Air Max', cat: 'sepatu-sandal', price: 1350000, stock: 45, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop', variants: [{n:'39',p:1350000,s:10},{n:'40',p:1350000,s:15},{n:'41',p:1350000,s:12},{n:'42',p:1350000,s:8}] },
  { name: 'Sepatu Lari Adidas Ultraboost', cat: 'sepatu-sandal', price: 2200000, stock: 38, img: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=2000&auto=format&fit=crop', variants: [{n:'40 Hitam',p:2200000,s:10},{n:'41 Putih',p:2200000,s:15},{n:'42 Abu-abu',p:2200000,s:13}] },
  { name: 'Sepatu Formal Pria Kulit', cat: 'sepatu-sandal', price: 599000, stock: 30, img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop', variants: [{n:'40',p:599000,s:8},{n:'41',p:599000,s:10},{n:'42',p:599000,s:8},{n:'43',p:599000,s:4}] },
  { name: 'Sandal Slide Casual Unisex', cat: 'sepatu-sandal', price: 159000, stock: 70, img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=1887&auto=format&fit=crop', variants: [{n:'37',p:159000,s:20},{n:'38',p:159000,s:20},{n:'39',p:159000,s:20},{n:'40',p:159000,s:10}] },
  // === TAS ===
  { name: 'Tas Ransel Laptop Kulit Sintetis', cat: 'tas-koper', price: 489000, stock: 35, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Hitam',p:489000,s:20},{n:'Coklat',p:489000,s:15}] },
  { name: 'Tas Selempang Pria Canvas', cat: 'tas-koper', price: 259000, stock: 45, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=2069&auto=format&fit=crop', variants: [{n:'Hitam',p:259000,s:20},{n:'Abu-abu',p:259000,s:15},{n:'Coklat Muda',p:259000,s:10}] },
  { name: 'Handbag Wanita Kulit Premium', cat: 'tas-koper', price: 799000, stock: 25, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop', variants: [{n:'Merah',p:799000,s:8},{n:'Hitam',p:799000,s:10},{n:'Nude',p:799000,s:7}] },
  // === OLAHRAGA ===
  { name: 'Sepatu Running Asics Gel-Kayano', cat: 'olahraga', price: 1850000, stock: 30, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop', variants: [{n:'40',p:1850000,s:8},{n:'41',p:1850000,s:12},{n:'42',p:1850000,s:10}] },
  { name: 'Matras Yoga Premium 6mm', cat: 'olahraga', price: 299000, stock: 50, img: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=2080&auto=format&fit=crop', variants: [{n:'Ungu',p:299000,s:20},{n:'Biru',p:299000,s:15},{n:'Hijau',p:299000,s:15}] },
  { name: 'Dumbbell Set 10kg Adjustable', cat: 'olahraga', price: 750000, stock: 25, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', variants: [{n:'10kg/pair',p:750000,s:15},{n:'20kg/pair',p:1200000,s:10}] },
  { name: 'Jersey Bola Printing Custom', cat: 'olahraga', price: 185000, stock: 60, img: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=2049&auto=format&fit=crop', variants: [{n:'S',p:185000,s:15},{n:'M',p:185000,s:20},{n:'L',p:185000,s:15},{n:'XL',p:185000,s:10}] },
  // === KESEHATAN ===
  { name: 'Vitamin C 1000mg Premium 30 Tablet', cat: 'kesehatan-kecantikan', price: 89000, stock: 150, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop', variants: [{n:'30 Tablet',p:89000,s:80},{n:'60 Tablet',p:159000,s:70}] },
  { name: 'Masker Sheet Korea 10 Lembar', cat: 'kesehatan-kecantikan', price: 79000, stock: 200, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Hyaluronic',p:79000,s:100},{n:'Collagen',p:89000,s:100}] },
  { name: 'Serum Vitamin C Brightening 30ml', cat: 'kesehatan-kecantikan', price: 199000, stock: 80, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1887&auto=format&fit=crop', variants: [{n:'30ml',p:199000,s:50},{n:'50ml',p:299000,s:30}] },
  // === RUMAH & DAPUR ===
  { name: 'Blender Portable Mini USB Rechargeable', cat: 'rumah-dapur', price: 159000, stock: 70, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Putih',p:159000,s:35},{n:'Pink',p:159000,s:35}] },
  { name: 'Set Peralatan Makan Stainless 4pcs', cat: 'rumah-dapur', price: 129000, stock: 90, img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=2080&auto=format&fit=crop', variants: [{n:'Silver',p:129000,s:50},{n:'Rose Gold',p:149000,s:40}] },
  { name: 'Lampu LED Smart WiFi RGB 9W', cat: 'rumah-dapur', price: 79000, stock: 120, img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop', variants: [{n:'E27',p:79000,s:70},{n:'E14',p:79000,s:50}] },
  { name: 'Termos Tumbler Stainless 500ml', cat: 'rumah-dapur', price: 149000, stock: 85, img: 'https://images.unsplash.com/photo-1625708458528-802ec79b1ed8?q=80&w=1770&auto=format&fit=crop', variants: [{n:'Hitam Matte',p:149000,s:30},{n:'Silver',p:149000,s:30},{n:'Rose Gold',p:149000,s:25}] },
  // === BUKU ===
  { name: 'Buku Atomic Habits - James Clear', cat: 'buku-alat-tulis', price: 129000, stock: 60, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Softcover',p:129000,s:40},{n:'Hardcover',p:179000,s:20}] },
  { name: 'Jurnal Bullet Notebook A5 Dotted', cat: 'buku-alat-tulis', price: 89000, stock: 100, img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=2064&auto=format&fit=crop', variants: [{n:'Hitam',p:89000,s:35},{n:'Biru Navy',p:89000,s:35},{n:'Merah Marun',p:89000,s:30}] },
  { name: 'Set Pulpen Premium Gel 0.5mm 12pcs', cat: 'buku-alat-tulis', price: 59000, stock: 150, img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2072&auto=format&fit=crop', variants: [{n:'12 Warna',p:59000,s:80},{n:'Hitam Semua 12pcs',p:49000,s:70}] },
];

const VOUCHERS = [
  { code: 'HEMAT10', discountPercent: 10, minPurchase: 100000, quota: 500, daysValid: 30 },
  { code: 'DISKON50K', discountAmount: 50000, minPurchase: 200000, quota: 300, daysValid: 14 },
  { code: 'CASHBACK20', discountPercent: 20, minPurchase: 500000, maxDiscount: 100000, quota: 200, daysValid: 7 },
  { code: 'WELCOME15', discountPercent: 15, minPurchase: 150000, quota: 1000, daysValid: 60 },
  { code: 'FLASH30', discountPercent: 30, minPurchase: 300000, maxDiscount: 75000, quota: 100, daysValid: 3 },
];

async function main() {
  console.log('\n🌱 Memulai seed database sakserShop...\n');

  // 1. Buat categories
  console.log('📂 Membuat kategori...');
  const catMap = {};
  for (const c of CATEGORIES) {
    let cat = await prisma.category.findFirst({ where: { slug: c.slug } });
    if (!cat) cat = await prisma.category.create({ data: { name: c.name, slug: c.slug } });
    catMap[c.slug] = cat.id;
    process.stdout.write('.');
  }
  console.log(' ✅\n');

  // 2. Tambah produk
  console.log(`📦 Menambahkan ${PRODUCTS.length} produk...`);
  let ok = 0, fail = 0;
  for (const p of PRODUCTS) {
    const catId = catMap[p.cat];
    if (!catId) { fail++; continue; }
    const slug = p.name.toLowerCase()
      .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i')
      .replace(/[òóôõö]/g,'o').replace(/[ùúûü]/g,'u')
      .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-')
      + '-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random()*999);
    try {
      await prisma.product.create({
        data: {
          storeId: STORE_ID, categoryId: catId, name: p.name,
          slug, description: `${p.name} - Produk berkualitas tinggi dengan bahan premium. Garansi resmi 1 tahun. Pengiriman cepat ke seluruh Indonesia. Stok terbatas, pesan sekarang!`,
          isPublished: true,
          images: { create: [{ imageUrl: p.img, isPrimary: true, sortOrder: 0 }] },
          variants: {
            create: p.variants.map((v, i) => ({
              sku: `SKU-${slug.slice(0,12).toUpperCase()}-${i+1}`,
              name: v.n, price: v.p, stock: v.s, weight: 500 + Math.floor(Math.random()*2000),
            }))
          },
        }
      });
      ok++; process.stdout.write('.');
    } catch(e) { fail++; process.stdout.write('x'); }
  }
  console.log(`\n  ✅ ${ok} berhasil, ${fail} gagal\n`);

  // 3. Buat voucher
  console.log('🎟  Membuat voucher...');
  const storeObj = await prisma.store.findUnique({ where: { id: STORE_ID } });
  for (const v of VOUCHERS) {
    const existing = await prisma.voucher.findFirst({ where: { code: v.code } });
    if (existing) { process.stdout.write('.'); continue; }
    const now = new Date();
    const end = new Date(now.getTime() + v.daysValid * 86400000);
    await prisma.voucher.create({
      data: {
        code: v.code,
        discountPercent: v.discountPercent ?? null,
        discountAmount: v.discountAmount ? v.discountAmount : null,
        minPurchase: v.minPurchase,
        maxDiscount: v.maxDiscount ?? null,
        quota: v.quota, usedCount: Math.floor(Math.random() * (v.quota * 0.3)),
        startDate: now, endDate: end, isActive: true,
        storeId: null,
      }
    });
    process.stdout.write('.');
  }
  console.log(' ✅\n');

  // 4. Summary
  const [prodCount, catCount, voucherCount] = await Promise.all([
    prisma.product.count(), prisma.category.count(), prisma.voucher.count()
  ]);
  console.log('📊 Hasil akhir database:');
  console.log(`   Kategori : ${catCount}`);
  console.log(`   Produk   : ${prodCount}`);
  console.log(`   Voucher  : ${voucherCount}`);
  console.log('\n🎉 Seed selesai! Buka http://localhost:3000 untuk melihat hasilnya.\n');
}

main().catch(e => { console.error('\n❌ ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
