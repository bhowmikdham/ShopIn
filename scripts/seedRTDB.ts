/**
 * Seed Firebase Realtime Database with ShopIn demo data
 * Run: npx tsx scripts/seedRTDB.ts
 */
import 'dotenv/config';
import admin from 'firebase-admin';

// ── Init Admin SDK ───────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
const databaseURL = process.env.VITE_FIREBASE_DATABASE_URL
  || `https://${serviceAccount.project_id}-default-rtdb.asia-southeast1.firebasedatabase.app`;

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL,
});

const db = admin.database(app);

// ── Stores ───────────────────────────────────────────────────
const stores: Record<string, any> = {
  'woolworths-clayton': {
    name: 'Woolworths Clayton',
    chain: 'Woolworths',
    address: '20 Bettina Street',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9123,
    longitude: 145.1234,
    hoursOpen: '07:00',
    hoursClose: '22:00',
    rating: 4.5,
    isActive: true,
  },
  'woolworths-southyarra': {
    name: 'Woolworths South Yarra',
    chain: 'Woolworths',
    address: '1 Chapel Street',
    suburb: 'South Yarra',
    postcode: '3141',
    latitude: -37.8456,
    longitude: 145.0234,
    hoursOpen: '07:00',
    hoursClose: '23:00',
    rating: 4.3,
    isActive: true,
  },
  'woolworths-caulfield': {
    name: 'Woolworths Caulfield',
    chain: 'Woolworths',
    address: '860 Dandenong Road',
    suburb: 'Caulfield East',
    postcode: '3145',
    latitude: -37.8765,
    longitude: 145.0432,
    hoursOpen: '06:00',
    hoursClose: '23:00',
    rating: 4.4,
    isActive: true,
  },
  'woolworths-glen-waverley': {
    name: 'Woolworths Glen Waverley',
    chain: 'Woolworths',
    address: '235 Springvale Road',
    suburb: 'Glen Waverley',
    postcode: '3150',
    latitude: -37.878,
    longitude: 145.165,
    hoursOpen: '07:00',
    hoursClose: '22:00',
    rating: 4.6,
    isActive: true,
  },
  'coles-clayton': {
    name: 'Coles Clayton',
    chain: 'Coles',
    address: '100 Mountain Highway',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9234,
    longitude: 145.1345,
    hoursOpen: '06:00',
    hoursClose: '23:00',
    rating: 4.2,
    isActive: true,
  },
  'coles-oakleigh': {
    name: 'Coles Oakleigh',
    chain: 'Coles',
    address: '41-43 Portman Street',
    suburb: 'Oakleigh',
    postcode: '3166',
    latitude: -37.8989,
    longitude: 145.0891,
    hoursOpen: '06:00',
    hoursClose: '23:00',
    rating: 4.1,
    isActive: true,
  },
  'coles-burwood': {
    name: 'Coles Burwood',
    chain: 'Coles',
    address: '172 Burwood Highway',
    suburb: 'Burwood',
    postcode: '3125',
    latitude: -37.8502,
    longitude: 145.112,
    hoursOpen: '06:00',
    hoursClose: '00:00',
    rating: 4.3,
    isActive: true,
  },
  'aldi-clayton': {
    name: 'Aldi Clayton',
    chain: 'Aldi',
    address: '50 Princes Highway',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9345,
    longitude: 145.1456,
    hoursOpen: '08:00',
    hoursClose: '21:00',
    rating: 4.4,
    isActive: true,
  },
  'aldi-murrumbeena': {
    name: 'Aldi Murrumbeena',
    chain: 'Aldi',
    address: '388 Neerim Road',
    suburb: 'Murrumbeena',
    postcode: '3163',
    latitude: -37.893,
    longitude: 145.068,
    hoursOpen: '08:30',
    hoursClose: '20:00',
    rating: 4.2,
    isActive: true,
  },
  'aldi-mount-waverley': {
    name: 'Aldi Mount Waverley',
    chain: 'Aldi',
    address: '275 Blackburn Road',
    suburb: 'Mount Waverley',
    postcode: '3149',
    latitude: -37.869,
    longitude: 145.128,
    hoursOpen: '08:30',
    hoursClose: '20:00',
    rating: 4.0,
    isActive: true,
  },
  'iga-southyarra': {
    name: 'IGA South Yarra',
    chain: 'IGA',
    address: '200 Toorak Road',
    suburb: 'South Yarra',
    postcode: '3141',
    latitude: -37.8567,
    longitude: 145.0345,
    hoursOpen: '07:00',
    hoursClose: '22:00',
    rating: 4.1,
    isActive: true,
  },
  'iga-malvern': {
    name: 'IGA Malvern',
    chain: 'IGA',
    address: '1 Station Street',
    suburb: 'Malvern',
    postcode: '3144',
    latitude: -37.869,
    longitude: 145.029,
    hoursOpen: '07:00',
    hoursClose: '21:00',
    rating: 4.0,
    isActive: true,
  },
  'local-market-clayton': {
    name: 'Clayton Fresh Market',
    chain: 'Local Market',
    address: '315 Clayton Road',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.918,
    longitude: 145.119,
    hoursOpen: '06:00',
    hoursClose: '18:00',
    rating: 4.7,
    isActive: true,
  },
  'local-market-springvale': {
    name: 'Springvale Asian Grocery',
    chain: 'Local Market',
    address: '12 Balmoral Avenue',
    suburb: 'Springvale',
    postcode: '3171',
    latitude: -37.951,
    longitude: 145.153,
    hoursOpen: '08:00',
    hoursClose: '19:00',
    rating: 4.8,
    isActive: true,
  },
};

// ── Products ─────────────────────────────────────────────────
const products: Record<string, any> = {
  'paneer-lemnos-200': {
    name: 'Lemnos Paneer Cheese',
    brand: 'Lemnos',
    category: 'Dairy',
    cuisine: 'Indian',
    unit: '200g',
    imageUrl: null,
  },
  'paneer-westhaven-500': {
    name: 'Westhaven Tasmanian Paneer',
    brand: 'Westhaven',
    category: 'Dairy',
    cuisine: 'Indian',
    unit: '500g',
    imageUrl: null,
  },
  'paneer-westhaven-1kg': {
    name: 'Westhaven Paneer Cheese 1kg',
    brand: 'Westhaven',
    category: 'Dairy',
    cuisine: 'Indian',
    unit: '1kg',
    imageUrl: null,
  },
  'rice-woolworths-1kg': {
    name: 'Woolworths Basmati Rice',
    brand: 'Woolworths',
    category: 'Grains',
    cuisine: 'Indian',
    unit: '1kg',
    imageUrl: null,
  },
  'rice-sunrice-2kg': {
    name: 'SunRice Basmati Rice',
    brand: 'SunRice',
    category: 'Grains',
    cuisine: 'Indian',
    unit: '2kg',
    imageUrl: null,
  },
  'ready-mtr-palak-paneer': {
    name: 'MTR Palak Paneer',
    brand: 'MTR',
    category: 'Ready Meals',
    cuisine: 'Indian',
    unit: '300g',
    imageUrl: null,
  },
  'pasta-barilla-rigatoni': {
    name: 'Barilla Rigatoni',
    brand: 'Barilla',
    category: 'Pasta',
    cuisine: 'Italian',
    unit: '500g',
    imageUrl: null,
  },
  'pasta-barilla-spaghettoni': {
    name: 'Barilla Spaghettoni',
    brand: 'Barilla',
    category: 'Pasta',
    cuisine: 'Italian',
    unit: '500g',
    imageUrl: null,
  },
  'pasta-barilla-penne': {
    name: 'Barilla Penne',
    brand: 'Barilla',
    category: 'Pasta',
    cuisine: 'Italian',
    unit: '500g',
    imageUrl: null,
  },
  'cheese-mozzarella': {
    name: 'Mozzarella Cheese',
    brand: 'Devondale',
    category: 'Dairy',
    cuisine: 'Italian',
    unit: '250g',
    imageUrl: null,
  },
  'cheese-parmesan': {
    name: 'Parmesan Cheese',
    brand: 'Perfect Italiano',
    category: 'Dairy',
    cuisine: 'Italian',
    unit: '250g',
    imageUrl: null,
  },
};

// ── Prices  (productId → storeId → priceData) ───────────────
const prices: Record<string, Record<string, any>> = {
  'paneer-lemnos-200': {
    'woolworths-clayton':      { price: 6.60, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-glen-waverley': { price: 6.70, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 6.80, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-oakleigh':          { price: 6.75, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-clayton':            { price: 6.40, inStock: true, lastUpdated: new Date().toISOString() },
    'iga-southyarra':          { price: 7.00, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'paneer-westhaven-500': {
    'woolworths-clayton':      { price: 10.50, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-caulfield':    { price: 10.50, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 11.00, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-burwood':           { price: 10.80, inStock: false, lastUpdated: new Date().toISOString() },
    'aldi-murrumbeena':        { price: 9.99, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'paneer-westhaven-1kg': {
    'woolworths-clayton':      { price: 18.00, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-oakleigh':          { price: 18.50, inStock: true, lastUpdated: new Date().toISOString() },
    'local-market-clayton':    { price: 15.99, inStock: true, lastUpdated: new Date().toISOString() },
    'local-market-springvale': { price: 14.50, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'rice-woolworths-1kg': {
    'woolworths-clayton':      { price: 4.50, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-southyarra':   { price: 4.50, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-caulfield':    { price: 4.50, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-glen-waverley': { price: 4.50, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'rice-sunrice-2kg': {
    'woolworths-clayton':      { price: 9.00, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 8.80, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-oakleigh':          { price: 9.00, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-clayton':            { price: 7.99, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-mount-waverley':     { price: 7.99, inStock: true, lastUpdated: new Date().toISOString() },
    'local-market-springvale': { price: 7.50, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'ready-mtr-palak-paneer': {
    'woolworths-clayton':      { price: 4.00, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 4.20, inStock: true, lastUpdated: new Date().toISOString() },
    'iga-southyarra':          { price: 4.50, inStock: true, lastUpdated: new Date().toISOString() },
    'local-market-clayton':    { price: 3.50, inStock: true, lastUpdated: new Date().toISOString() },
    'local-market-springvale': { price: 3.20, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'pasta-barilla-rigatoni': {
    'woolworths-clayton':      { price: 3.50, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-southyarra':   { price: 3.50, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 3.40, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-burwood':           { price: 3.40, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-clayton':            { price: 2.99, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'pasta-barilla-spaghettoni': {
    'woolworths-caulfield':    { price: 3.50, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-oakleigh':          { price: 3.60, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-murrumbeena':        { price: 2.99, inStock: true, lastUpdated: new Date().toISOString() },
    'iga-malvern':             { price: 3.80, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'pasta-barilla-penne': {
    'woolworths-glen-waverley': { price: 3.50, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 3.30, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-mount-waverley':     { price: 2.89, inStock: true, lastUpdated: new Date().toISOString() },
    'iga-southyarra':          { price: 3.70, inStock: false, lastUpdated: new Date().toISOString() },
  },
  'cheese-mozzarella': {
    'woolworths-clayton':      { price: 5.50, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-southyarra':   { price: 5.50, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-clayton':           { price: 5.80, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-clayton':            { price: 4.99, inStock: true, lastUpdated: new Date().toISOString() },
    'iga-malvern':             { price: 6.20, inStock: true, lastUpdated: new Date().toISOString() },
  },
  'cheese-parmesan': {
    'woolworths-clayton':      { price: 7.00, inStock: true, lastUpdated: new Date().toISOString() },
    'woolworths-caulfield':    { price: 7.00, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-oakleigh':          { price: 7.50, inStock: true, lastUpdated: new Date().toISOString() },
    'coles-burwood':           { price: 7.50, inStock: true, lastUpdated: new Date().toISOString() },
    'aldi-murrumbeena':        { price: 6.49, inStock: true, lastUpdated: new Date().toISOString() },
    'iga-southyarra':          { price: 8.00, inStock: true, lastUpdated: new Date().toISOString() },
  },
};

// ── Meal Plans ───────────────────────────────────────────────
const mealPlans: Record<string, any> = {
  'palak-paneer-meal': {
    name: 'Palak Paneer with Rice',
    cuisine: 'Indian',
    servings: 4,
    prepTime: 30,
    ingredients: ['paneer-lemnos-200', 'rice-woolworths-1kg'],
    description: 'Classic North Indian spinach and paneer curry served with basmati rice.',
  },
  'pasta-night': {
    name: 'Classic Pasta Night',
    cuisine: 'Italian',
    servings: 4,
    prepTime: 25,
    ingredients: ['pasta-barilla-rigatoni', 'cheese-mozzarella', 'cheese-parmesan'],
    description: 'Rigatoni with melted mozzarella and parmesan cheese.',
  },
  'quick-paneer-dinner': {
    name: 'Quick Paneer Dinner',
    cuisine: 'Indian',
    servings: 2,
    prepTime: 10,
    ingredients: ['ready-mtr-palak-paneer', 'rice-sunrice-2kg'],
    description: 'Ready-made palak paneer with premium basmati rice — dinner in 10 minutes.',
  },
  'spaghetti-parmesan': {
    name: 'Spaghetti al Parmigiano',
    cuisine: 'Italian',
    servings: 3,
    prepTime: 20,
    ingredients: ['pasta-barilla-spaghettoni', 'cheese-parmesan'],
    description: 'Simple spaghettoni tossed with freshly grated parmesan.',
  },
};

// ── Seed ─────────────────────────────────────────────────────
async function seed() {
  console.log('🔥 Seeding Firebase Realtime Database...');
  console.log(`   URL: ${databaseURL}`);

  const ref = db.ref();

  // Write all data in one multi-path update for atomicity
  const updates: Record<string, any> = {};

  for (const [id, store] of Object.entries(stores)) {
    updates[`stores/${id}`] = { ...store, createdAt: new Date().toISOString() };
  }

  for (const [id, product] of Object.entries(products)) {
    updates[`products/${id}`] = { ...product, createdAt: new Date().toISOString() };
  }

  for (const [productId, storePrices] of Object.entries(prices)) {
    for (const [storeId, priceData] of Object.entries(storePrices)) {
      updates[`prices/${productId}/${storeId}`] = priceData;
    }
  }

  for (const [id, plan] of Object.entries(mealPlans)) {
    updates[`mealPlans/${id}`] = plan;
  }

  // Metadata
  updates['_metadata/lastSeeded'] = new Date().toISOString();
  updates['_metadata/version'] = '1.0.0';
  updates['_metadata/storeCount'] = Object.keys(stores).length;
  updates['_metadata/productCount'] = Object.keys(products).length;
  updates['_metadata/mealPlanCount'] = Object.keys(mealPlans).length;

  await ref.update(updates);

  const storeCount = Object.keys(stores).length;
  const productCount = Object.keys(products).length;
  const priceCount = Object.values(prices).reduce((sum, sp) => sum + Object.keys(sp).length, 0);
  const mealCount = Object.keys(mealPlans).length;

  console.log(`✅ Seeded successfully:`);
  console.log(`   ${storeCount} stores`);
  console.log(`   ${productCount} products`);
  console.log(`   ${priceCount} price entries`);
  console.log(`   ${mealCount} meal plans`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
