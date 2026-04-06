import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Models
import Product from '../models/Product.js';
import Media from '../models/Media.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const images = [
  {
    path: 'C:\\Users\\asus\\.gemini\\antigravity\brain\\112fc060-88a3-452f-9943-a638d105d5e3\\luxury_noir_silk_long_kurti_gold_embroidery_fashion_photography_minimalist_noir_background_cinematic_1731610400003_png_1775237417475.png',
    name: 'Noir Luxe Silk Kurti',
    category: 'Rayon',
    price: 4999,
    originalPrice: 7999,
    description: 'A masterpiece of elegance. This long noir silk kurti features intricate gold floral embroidery on the neckline, perfect for high-end evening wear.',
    badge: 'Bestseller',
    collection: 'Noir Luxury'
  },
  {
    path: 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\112fc060-88a3-452f-9943-a638d105d5e3\\premium_short_kurti_modern_chic_noir_gold_accents_fashion_editorial_dark_atmospheric_background_1731610400004_png_1775237442815.png',
    name: 'Gilded Noir Short Kurti',
    category: 'Cotton',
    price: 2999,
    originalPrice: 4500,
    description: 'Modern chic meets traditional craftsmanship. This short kurti with gold accents provides a sophisticated silhouette for the contemporary woman.',
    badge: 'New',
    collection: 'Minimalist Gold'
  },
  {
    path: 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\112fc060-88a3-452f-9943-a638d105d5e3\\minimalist_black_cotton_kurti_premium_texture_luxury_lighting_minimalist_aesthetic_noir_background_1731610400005_png_1775237526489.png',
    name: 'Obsidian Cotton Kurti',
    category: 'Cotton',
    price: 3499,
    originalPrice: 5200,
    description: 'Pure obsidian black cotton kurti with a premium texture. Designed for comfort without compromising on the luxury aesthetic.',
    badge: 'Limited',
    collection: 'Noir Luxury'
  },
  {
    path: 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\112fc060-88a3-452f-9943-a638d105d5e3\\premium_obsidian_black_champagne_gold_kurta_set_elegant_drape_high_end_fabric_texture_soft_luxury_lighting_minimalist_nirvaha_1731610400002_png_1775237364974.png',
    name: 'Champagne Gold Kurta Set',
    category: 'Chikankari',
    price: 5999,
    originalPrice: 9500,
    description: 'An elegant drape of champagne gold on obsidian black. This full kurta set represents the pinnacle of NIRVAHA fashion.',
    badge: 'Bestseller',
    collection: 'Noir Luxury'
  }
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is missing');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected.');

    // Clear existing
    console.log('Clearing old products and media...');
    await Product.deleteMany({});
    await Media.deleteMany({});
    console.log('Cleared.');

    for (const item of images) {
      if (!fs.existsSync(item.path)) {
        console.warn(`File not found: ${item.path}`);
        continue;
      }

      console.log(`Processing ${item.name}...`);
      const buffer = fs.readFileSync(item.path);
      const stats = fs.statSync(item.path);

      const media = new Media({
        name: path.basename(item.path),
        data: buffer,
        contentType: 'image/png',
        size: stats.size
      });

      await media.save();

      const product = new Product({
        name: item.name,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice,
        description: item.description,
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        badge: item.badge,
        collection: item.collection,
        imageId: media._id
      });

      await product.save();
      console.log(`Successfully added ${item.name}`);
    }

    console.log('\n✅ Seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
