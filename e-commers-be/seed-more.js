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

const MORE_PRODUCTS = [
  // Elektronik lanjutan
  { name: 'Power Bank Anker 20000mAh Fast Charging', cat: 'elektronik', price: 399000, img: 'https://images.unsplash.com/photo-1609592420073-d9f6e7709d8f?q=80&w=2070&auto=format&fit=crop', variants: [{n:'20000mAh Hitam',p:399000,s:60},{n:'20000mAh Putih',p:399000,s:40}] },
  { name: 'Charger GaN 65W USB-C Multi Port', cat: 'elektronik', price: 299000, img: 'https://images.unsplash.com/photo-1609592420073-d9f6e7709d8f?q=80&w=2070&auto=format&fit=crop', variants: [{n:'1 Port',p:299000,s:50},{n:'3 Port',p:449000,s:30}] },
  { name: 'SSD External Portable 1TB Samsung T7', cat: 'elektronik', price: 1250000, img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070&auto=format&fit=crop', variants: [{n:'500GB',p:750000,s:25},{n:'1TB',p:1250000,s:20}] },
  { name: 'Webcam 4K Logitech C930e Pro', cat: 'elektronik', price: 1800000, img: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop', variants: [{n:'1080p',p:850000,s:20},{n:'4K',p:1800000,s:10}] },
  { name: 'Speaker Bluetooth JBL Charge 5', cat: 'elektronik', price: 2100000, img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=2069&auto=format&fit=crop', variants: [{n:'Hitam',p:2100000,s:25},{n:'Biru',p:2100000,s:20},{n:'Merah',p:2100000,s:15}] },
  { name: 'Smart TV 43" LED 4K Android', cat: 'elektronik', price: 4500000, img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?q=80&w=2070&auto=format&fit=crop', variants: [{n:'43 inch',p:4500000,s:12},{n:'55 inch',p:6500000,s:8}] },
  { name: 'Router WiFi 6 TP-Link AX3000', cat: 'elektronik', price: 750000, img: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Single Band',p:450000,s:30},{n:'Dual Band AX3000',p:750000,s:20}] },
  { name: 'RAM DDR5 32GB Kingston Fury', cat: 'elektronik', price: 1200000, img: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070&auto=format&fit=crop', variants: [{n:'16GB',p:650000,s:25},{n:'32GB',p:1200000,s:15}] },
  // Fashion Pria lanjutan
  { name: 'Kemeja Oxford Slim Fit Pria', cat: 'fashion-pria', price: 219000, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1888&auto=format&fit=crop', variants: [{n:'S Putih',p:219000,s:20},{n:'M Biru Muda',p:219000,s:25},{n:'L Abu-abu',p:219000,s:20},{n:'XL Hitam',p:219000,s:15}] },
  { name: 'Celana Cargo Premium Pria', cat: 'fashion-pria', price: 389000, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1897&auto=format&fit=crop', variants: [{n:'M Khaki',p:389000,s:20},{n:'L Hitam',p:389000,s:20},{n:'XL Army',p:389000,s:15}] },
  { name: 'Kaos Polos Premium Cotton 30s', cat: 'fashion-pria', price: 89000, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop', variants: [{n:'S',p:89000,s:50},{n:'M',p:89000,s:60},{n:'L',p:89000,s:50},{n:'XL',p:89000,s:30},{n:'XXL',p:99000,s:20}] },
  // Fashion Wanita lanjutan
  { name: 'Gamis Maxi Dress Motif Batik', cat: 'fashion-wanita', price: 259000, img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=1887&auto=format&fit=crop', variants: [{n:'S',p:259000,s:20},{n:'M',p:259000,s:25},{n:'L',p:259000,s:20},{n:'XL',p:269000,s:15}] },
  { name: 'Celana Kulot Wanita Warna Pastel', cat: 'fashion-wanita', price: 149000, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4cd8?q=80&w=2080&auto=format&fit=crop', variants: [{n:'S Sage Green',p:149000,s:25},{n:'M Dusty Rose',p:149000,s:30},{n:'L Cream',p:149000,s:20}] },
  { name: 'Kemeja Wanita Oversized Linen', cat: 'fashion-wanita', price: 179000, img: 'https://images.unsplash.com/photo-1485518882345-15568b007407?q=80&w=2070&auto=format&fit=crop', variants: [{n:'S Off White',p:179000,s:20},{n:'M Sky Blue',p:179000,s:25},{n:'L Terracotta',p:179000,s:15}] },
  // Aksesoris lanjutan
  { name: 'Dompet Kulit Slim Card Holder', cat: 'aksesoris', price: 189000, img: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1974&auto=format&fit=crop', variants: [{n:'Hitam',p:189000,s:35},{n:'Coklat',p:189000,s:30},{n:'Navy',p:189000,s:20}] },
  { name: 'Ikat Pinggang Canvas Casual', cat: 'aksesoris', price: 79000, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Hitam',p:79000,s:40},{n:'Coklat',p:79000,s:35}] },
  { name: 'Kalung Perak Sterling Silver 925', cat: 'aksesoris', price: 459000, img: 'https://images.unsplash.com/photo-1573408301185-9519f94815b1?q=80&w=2070&auto=format&fit=crop', variants: [{n:'40cm',p:459000,s:20},{n:'45cm',p:489000,s:20}] },
  { name: 'Sarung Tangan Winter Touchscreen', cat: 'aksesoris', price: 119000, img: 'https://images.unsplash.com/photo-1510120853100-a86ca5e0a9a7?q=80&w=2070&auto=format&fit=crop', variants: [{n:'S/M Hitam',p:119000,s:30},{n:'L/XL Hitam',p:119000,s:25},{n:'S/M Abu',p:119000,s:20}] },
  // Sepatu lanjutan
  { name: 'Sepatu Vans Old Skool Classic', cat: 'sepatu-sandal', price: 950000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop', variants: [{n:'39 Hitam',p:950000,s:10},{n:'40 Hitam',p:950000,s:15},{n:'41 Putih',p:950000,s:12},{n:'42 Checkerboard',p:950000,s:8}] },
  { name: 'Sepatu Safety Boots Proyek', cat: 'sepatu-sandal', price: 450000, img: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=2070&auto=format&fit=crop', variants: [{n:'39',p:450000,s:10},{n:'40',p:450000,s:12},{n:'41',p:450000,s:10},{n:'42',p:450000,s:8}] },
  { name: 'Sepatu Slip-On Wanita Flatform', cat: 'sepatu-sandal', price: 249000, img: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?q=80&w=1887&auto=format&fit=crop', variants: [{n:'36 Putih',p:249000,s:15},{n:'37 Hitam',p:249000,s:15},{n:'38 Nude',p:249000,s:12},{n:'39 Hitam',p:249000,s:10}] },
  // Tas lanjutan
  { name: 'Backpack Laptop 17 inch Waterproof', cat: 'tas-koper', price: 599000, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Hitam',p:599000,s:20},{n:'Abu-abu',p:599000,s:15}] },
  { name: 'Koper Kabin Hardcase 20 inch', cat: 'tas-koper', price: 899000, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Merah',p:899000,s:10},{n:'Hitam',p:899000,s:12},{n:'Biru Navy',p:899000,s:8}] },
  // Olahraga lanjutan
  { name: 'Kaos Olahraga Dry-Fit Quick Dry', cat: 'olahraga', price: 99000, img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop', variants: [{n:'S Hitam',p:99000,s:30},{n:'M Biru',p:99000,s:35},{n:'L Merah',p:99000,s:25},{n:'XL Hijau',p:99000,s:20}] },
  { name: 'Raket Badminton Yonex Astrox 7', cat: 'olahraga', price: 350000, img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2069&auto=format&fit=crop', variants: [{n:'Standard',p:350000,s:20}] },
  { name: 'Sepatu Futsal Specs Metasala', cat: 'olahraga', price: 399000, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop', variants: [{n:'39',p:399000,s:10},{n:'40',p:399000,s:12},{n:'41',p:399000,s:10},{n:'42',p:399000,s:8}] },
  { name: 'Tali Skipping Jump Rope Speed', cat: 'olahraga', price: 59000, img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Standar',p:59000,s:50},{n:'Speed Ball Bearing',p:129000,s:30}] },
  // Kesehatan lanjutan
  { name: 'Minyak Zaitun Extra Virgin 250ml', cat: 'kesehatan-kecantikan', price: 75000, img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=2070&auto=format&fit=crop', variants: [{n:'250ml',p:75000,s:60},{n:'500ml',p:130000,s:40}] },
  { name: 'Sunscreen SPF 50 PA++++ 50ml', cat: 'kesehatan-kecantikan', price: 115000, img: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=1887&auto=format&fit=crop', variants: [{n:'50ml',p:115000,s:70},{n:'100ml',p:195000,s:50}] },
  { name: 'Masker N95 Box 50 Pcs', cat: 'kesehatan-kecantikan', price: 75000, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2030&auto=format&fit=crop', variants: [{n:'Box 50 Pcs',p:75000,s:100}] },
  // Rumah & Dapur lanjutan
  { name: 'Wajan Anti Lengket PFOA-Free 28cm', cat: 'rumah-dapur', price: 249000, img: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=2070&auto=format&fit=crop', variants: [{n:'24cm',p:199000,s:30},{n:'28cm',p:249000,s:25},{n:'30cm',p:289000,s:20}] },
  { name: 'Tempat Tidur Lipat Portable Single', cat: 'rumah-dapur', price: 450000, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop', variants: [{n:'Single 90x190cm',p:450000,s:15},{n:'Queen 160x200cm',p:850000,s:10}] },
  { name: 'Rice Cooker Digital 1.8L Smart', cat: 'rumah-dapur', price: 350000, img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop', variants: [{n:'1.2L',p:280000,s:20},{n:'1.8L',p:350000,s:25}] },
  // Buku lanjutan
  { name: 'Buku Rich Dad Poor Dad Indonesia', cat: 'buku-alat-tulis', price: 99000, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Softcover',p:99000,s:40}] },
  { name: 'Buku The Psychology of Money', cat: 'buku-alat-tulis', price: 115000, img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1887&auto=format&fit=crop', variants: [{n:'Softcover',p:115000,s:35}] },
  { name: 'Highlighter Set Pastel 6 Warna', cat: 'buku-alat-tulis', price: 45000, img: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=2072&auto=format&fit=crop', variants: [{n:'6 Warna',p:45000,s:80},{n:'12 Warna',p:79000,s:50}] },
];

async function main() {
  console.log('\n📦 Menambahkan produk tambahan...\n');
  const cats = await prisma.category.findMany();
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  let ok = 0, skip = 0;

  for (const p of MORE_PRODUCTS) {
    const catId = catMap[p.cat];
    if (!catId) { skip++; continue; }
    const slug = p.name.toLowerCase()
      .replace(/[^a-z0-9\s]/gi, '').trim()
      .replace(/\s+/g, '-') + '-' + Date.now().toString().slice(-7) + '-' + Math.floor(Math.random()*999);
    try {
      await prisma.product.create({
        data: {
          storeId: STORE_ID, categoryId: catId, name: p.name, slug,
          description: `${p.name} — Produk pilihan terbaik dengan kualitas premium. Garansi resmi. Pengiriman cepat ke seluruh Indonesia!`,
          isPublished: true,
          images: { create: [{ imageUrl: p.img, isPrimary: true, sortOrder: 0 }] },
          variants: {
            create: p.variants.map((v, i) => ({
              sku: `SKU-${slug.slice(0,10).toUpperCase().replace(/-/g,'')}-${i+1}`,
              name: v.n, price: v.p, stock: v.s, weight: 300 + Math.floor(Math.random()*2000),
            }))
          },
        }
      });
      ok++; process.stdout.write('.');
    } catch(e) { skip++; process.stdout.write('x'); }
  }

  const total = await prisma.product.count();
  console.log(`\n\n✅ +${ok} produk baru. Total sekarang: ${total} produk. ${skip} dilewati.\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
