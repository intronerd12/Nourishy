// Utility script: Upload local product images to Cloudinary and attach to Product docs
// Usage: npm run import-images

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../models/product');
const { cloudinary, configureCloudinary } = require('../config/cloudinary');

// Load env from backend/config/.env
dotenv.config({ path: path.join(__dirname, '../config/.env') });

const connectDatabase = require('../config/database');

// Resolve the images directory relative to repo root
const IMAGES_DIR = path.resolve(__dirname, '../../frontend/public/images/products');

function normalizeName(filename) {
  // Strip extension and normalize separators to spaces, trim
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .replace(/[\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function uploadFileToCloudinary(filePath, productName) {
  const folder = 'products';
  const options = { folder, width: 800, crop: 'scale' };
  // Optional: attach original filename as context
  try {
    const res = await cloudinary.uploader.upload(filePath, options);
    return { public_id: res.public_id, url: res.secure_url };
  } catch (err) {
    throw new Error(`Cloudinary upload failed for ${path.basename(filePath)}: ${err.message}`);
  }
}

async function run() {
  console.log('Starting import of local product images → Cloudinary');
  console.log('Images directory:', IMAGES_DIR);

  // Verify directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images directory not found. Expected at:', IMAGES_DIR);
    process.exit(1);
  }

  // Connect DB first
  await connectDatabase();

  // Configure Cloudinary
  configureCloudinary();

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(f));

  if (files.length === 0) {
    console.log('No image files found to import.');
    await mongoose.connection.close();
    return;
  }

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const filename of files) {
    const productName = normalizeName(filename);
    try {
      const product = await Product.findOne({ name: productName });
      if (!product) {
        console.warn(`SKIP: No product found with name '${productName}' (from '${filename}')`);
        skippedCount++;
        continue;
      }

      const fullPath = path.join(IMAGES_DIR, filename);
      const imageObj = await uploadFileToCloudinary(fullPath, productName);

      // Avoid duplicates if same URL already present
      const exists = (product.images || []).some(img => img.url === imageObj.url || img.public_id === imageObj.public_id);
      if (!exists) {
        product.images = [...(product.images || []), imageObj];
        await product.save();
        console.log(`Linked '${filename}' → Product '${product.name}'`);
        successCount++;
      } else {
        console.log(`SKIP: Image already linked for '${product.name}' from '${filename}'`);
        skippedCount++;
      }
    } catch (err) {
      console.error(`ERROR processing '${filename}': ${err.message}`);
      errorCount++;
    }
  }

  console.log('\nImport summary:');
  console.log(`  Uploaded/linked: ${successCount}`);
  console.log(`  Skipped:         ${skippedCount}`);
  console.log(`  Errors:          ${errorCount}`);

  await mongoose.connection.close();
  console.log('Done.');
}

run().catch(async (e) => {
  console.error('Fatal error:', e);
  try { await mongoose.connection.close(); } catch (_) {}
  process.exit(1);
});