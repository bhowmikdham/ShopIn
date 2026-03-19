/**
 * Demo / fallback data for when no database (MySQL or Firebase) is connected.
 * Real stores around the Clayton / Melbourne area so the map looks convincing.
 * When you connect Firebase or MySQL, this file is bypassed automatically.
 */

export interface DemoStore {
  id: string;
  name: string;
  chain: 'Woolworths' | 'Coles' | 'Aldi' | 'IGA' | 'Local Market';
  address: string;
  suburb: string;
  postcode: string;
  latitude: number;
  longitude: number;
  hoursOpen: string;
  hoursClose: string;
  rating: number;
  isActive: boolean;
}

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  cuisine: string;
  basePrice: number;
  description: string;
  brand: string;
  isWheatFree: boolean;
  isDairyFree: boolean;
  imageUrl: string;
}

export interface DemoPrice {
  productId: string;
  storeId: string;
  price: number;
  inStock: boolean;
  lastUpdatedAt: Date;
}

// ─── STORES ──────────────────────────────────────────────────
export const DEMO_STORES: DemoStore[] = [
  // Woolworths locations
  {
    id: 'woolworths-clayton',
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
  {
    id: 'woolworths-southyarra',
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
  {
    id: 'woolworths-caulfield',
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
  {
    id: 'woolworths-glen-waverley',
    name: 'Woolworths Glen Waverley',
    chain: 'Woolworths',
    address: '235 Springvale Road',
    suburb: 'Glen Waverley',
    postcode: '3150',
    latitude: -37.8780,
    longitude: 145.1650,
    hoursOpen: '07:00',
    hoursClose: '22:00',
    rating: 4.6,
    isActive: true,
  },
  // Coles locations
  {
    id: 'coles-clayton',
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
  {
    id: 'coles-oakleigh',
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
  {
    id: 'coles-burwood',
    name: 'Coles Burwood',
    chain: 'Coles',
    address: '172 Burwood Highway',
    suburb: 'Burwood',
    postcode: '3125',
    latitude: -37.8502,
    longitude: 145.1120,
    hoursOpen: '06:00',
    hoursClose: '00:00',
    rating: 4.3,
    isActive: true,
  },
  // Aldi locations
  {
    id: 'aldi-clayton',
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
  {
    id: 'aldi-murrumbeena',
    name: 'Aldi Murrumbeena',
    chain: 'Aldi',
    address: '388 Neerim Road',
    suburb: 'Murrumbeena',
    postcode: '3163',
    latitude: -37.8930,
    longitude: 145.0680,
    hoursOpen: '08:30',
    hoursClose: '20:00',
    rating: 4.2,
    isActive: true,
  },
  {
    id: 'aldi-mount-waverley',
    name: 'Aldi Mount Waverley',
    chain: 'Aldi',
    address: '275 Blackburn Road',
    suburb: 'Mount Waverley',
    postcode: '3149',
    latitude: -37.8690,
    longitude: 145.1280,
    hoursOpen: '08:30',
    hoursClose: '20:00',
    rating: 4.0,
    isActive: true,
  },
  // IGA locations
  {
    id: 'iga-southyarra',
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
  {
    id: 'iga-malvern',
    name: 'IGA Malvern',
    chain: 'IGA',
    address: '1 Station Street',
    suburb: 'Malvern',
    postcode: '3144',
    latitude: -37.8690,
    longitude: 145.0290,
    hoursOpen: '07:00',
    hoursClose: '21:00',
    rating: 4.0,
    isActive: true,
  },
  // Local Market
  {
    id: 'local-market-clayton',
    name: 'Clayton Fresh Market',
    chain: 'Local Market',
    address: '315 Clayton Road',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9180,
    longitude: 145.1190,
    hoursOpen: '06:00',
    hoursClose: '18:00',
    rating: 4.7,
    isActive: true,
  },
  {
    id: 'local-market-springvale',
    name: 'Springvale Asian Grocery',
    chain: 'Local Market',
    address: '12 Balmoral Avenue',
    suburb: 'Springvale',
    postcode: '3171',
    latitude: -37.9510,
    longitude: 145.1530,
    hoursOpen: '08:00',
    hoursClose: '19:00',
    rating: 4.8,
    isActive: true,
  },
];

// ─── PRODUCTS ────────────────────────────────────────────────
const IMG_INDIAN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp';
const IMG_ITALIAN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp';

export const DEMO_PRODUCTS: DemoProduct[] = [
  { id: 'paneer-lemnos-200', name: 'Lemnos Paneer Cheese', category: 'Paneer', cuisine: 'Indian', basePrice: 6.60, description: 'Fresh paneer cheese, 200g', brand: 'Lemnos', isWheatFree: true, isDairyFree: false, imageUrl: IMG_INDIAN },
  { id: 'paneer-westhaven-500', name: "Westhaven Tasmanian Paneer", category: 'Paneer', cuisine: 'Indian', basePrice: 10.25, description: 'Premium 500g paneer', brand: 'Westhaven', isWheatFree: true, isDairyFree: false, imageUrl: IMG_INDIAN },
  { id: 'paneer-westhaven-1kg', name: "Westhaven Paneer Cheese 1kg", category: 'Paneer', cuisine: 'Indian', basePrice: 13.80, description: 'Large 1kg paneer block', brand: 'Westhaven', isWheatFree: true, isDairyFree: false, imageUrl: IMG_INDIAN },
  { id: 'rice-woolworths-1kg', name: 'Woolworths Basmati Rice', category: 'Rice', cuisine: 'Indian', basePrice: 3.50, description: 'Premium basmati rice, 1kg', brand: 'Woolworths', isWheatFree: true, isDairyFree: true, imageUrl: IMG_INDIAN },
  { id: 'rice-sunrice-2kg', name: 'SunRice Basmati Rice', category: 'Rice', cuisine: 'Indian', basePrice: 5.50, description: 'Quality basmati rice, 2kg', brand: 'SunRice', isWheatFree: true, isDairyFree: true, imageUrl: IMG_INDIAN },
  { id: 'ready-mtr-palak-paneer', name: 'MTR Palak Paneer', category: 'Ready Meals', cuisine: 'Indian', basePrice: 4.20, description: 'Ready-to-eat palak paneer', brand: 'MTR', isWheatFree: true, isDairyFree: false, imageUrl: IMG_INDIAN },
  { id: 'pasta-barilla-rigatoni', name: 'Barilla Rigatoni', category: 'Pasta', cuisine: 'Italian', basePrice: 3.50, description: 'Classic rigatoni, 500g', brand: 'Barilla', isWheatFree: false, isDairyFree: true, imageUrl: IMG_ITALIAN },
  { id: 'pasta-barilla-spaghettoni', name: 'Barilla Spaghettoni', category: 'Pasta', cuisine: 'Italian', basePrice: 3.50, description: 'Thick spaghetti, 500g', brand: 'Barilla', isWheatFree: false, isDairyFree: true, imageUrl: IMG_ITALIAN },
  { id: 'pasta-barilla-penne', name: 'Barilla Penne', category: 'Pasta', cuisine: 'Italian', basePrice: 3.50, description: 'Classic penne, 500g', brand: 'Barilla', isWheatFree: false, isDairyFree: true, imageUrl: IMG_ITALIAN },
  { id: 'cheese-mozzarella', name: 'Mozzarella Cheese', category: 'Cheese', cuisine: 'Italian', basePrice: 5.80, description: 'Fresh mozzarella, 250g', brand: 'Bega', isWheatFree: true, isDairyFree: false, imageUrl: IMG_ITALIAN },
  { id: 'cheese-parmesan', name: 'Parmesan Cheese', category: 'Cheese', cuisine: 'Italian', basePrice: 7.20, description: 'Grated parmesan, 250g', brand: 'Perfect Italiano', isWheatFree: true, isDairyFree: false, imageUrl: IMG_ITALIAN },
];

// ─── PRICES ──────────────────────────────────────────────────
const now = new Date();

export const DEMO_PRICES: DemoPrice[] = [
  // Paneer 200g
  { productId: 'paneer-lemnos-200', storeId: 'woolworths-clayton', price: 6.60, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-lemnos-200', storeId: 'woolworths-glen-waverley', price: 6.70, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-lemnos-200', storeId: 'coles-clayton', price: 6.80, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-lemnos-200', storeId: 'coles-oakleigh', price: 6.75, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-lemnos-200', storeId: 'aldi-clayton', price: 6.40, inStock: false, lastUpdatedAt: now },
  { productId: 'paneer-lemnos-200', storeId: 'iga-southyarra', price: 7.00, inStock: true, lastUpdatedAt: now },

  // Paneer 500g
  { productId: 'paneer-westhaven-500', storeId: 'woolworths-clayton', price: 10.25, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-westhaven-500', storeId: 'coles-clayton', price: 10.50, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-westhaven-500', storeId: 'iga-southyarra', price: 10.80, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-westhaven-500', storeId: 'local-market-springvale', price: 9.90, inStock: true, lastUpdatedAt: now },

  // Paneer 1kg
  { productId: 'paneer-westhaven-1kg', storeId: 'woolworths-clayton', price: 13.80, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-westhaven-1kg', storeId: 'coles-clayton', price: 14.20, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-westhaven-1kg', storeId: 'aldi-clayton', price: 13.50, inStock: true, lastUpdatedAt: now },
  { productId: 'paneer-westhaven-1kg', storeId: 'local-market-springvale', price: 12.90, inStock: true, lastUpdatedAt: now },

  // Rice
  { productId: 'rice-woolworths-1kg', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdatedAt: now },
  { productId: 'rice-woolworths-1kg', storeId: 'coles-clayton', price: 3.60, inStock: true, lastUpdatedAt: now },
  { productId: 'rice-woolworths-1kg', storeId: 'aldi-clayton', price: 3.30, inStock: true, lastUpdatedAt: now },
  { productId: 'rice-sunrice-2kg', storeId: 'woolworths-clayton', price: 5.50, inStock: true, lastUpdatedAt: now },
  { productId: 'rice-sunrice-2kg', storeId: 'coles-clayton', price: 5.70, inStock: true, lastUpdatedAt: now },
  { productId: 'rice-sunrice-2kg', storeId: 'iga-southyarra', price: 5.90, inStock: true, lastUpdatedAt: now },

  // Ready meal
  { productId: 'ready-mtr-palak-paneer', storeId: 'woolworths-clayton', price: 4.20, inStock: true, lastUpdatedAt: now },
  { productId: 'ready-mtr-palak-paneer', storeId: 'coles-clayton', price: 4.50, inStock: false, lastUpdatedAt: now },
  { productId: 'ready-mtr-palak-paneer', storeId: 'iga-southyarra', price: 4.40, inStock: true, lastUpdatedAt: now },
  { productId: 'ready-mtr-palak-paneer', storeId: 'local-market-springvale', price: 3.80, inStock: true, lastUpdatedAt: now },

  // Pasta
  { productId: 'pasta-barilla-rigatoni', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdatedAt: now },
  { productId: 'pasta-barilla-rigatoni', storeId: 'coles-clayton', price: 3.60, inStock: true, lastUpdatedAt: now },
  { productId: 'pasta-barilla-rigatoni', storeId: 'aldi-clayton', price: 3.20, inStock: true, lastUpdatedAt: now },
  { productId: 'pasta-barilla-spaghettoni', storeId: 'woolworths-caulfield', price: 3.50, inStock: true, lastUpdatedAt: now },
  { productId: 'pasta-barilla-spaghettoni', storeId: 'coles-burwood', price: 3.60, inStock: true, lastUpdatedAt: now },
  { productId: 'pasta-barilla-penne', storeId: 'woolworths-glen-waverley', price: 3.50, inStock: true, lastUpdatedAt: now },
  { productId: 'pasta-barilla-penne', storeId: 'aldi-mount-waverley', price: 3.20, inStock: true, lastUpdatedAt: now },

  // Cheese
  { productId: 'cheese-mozzarella', storeId: 'woolworths-clayton', price: 5.80, inStock: true, lastUpdatedAt: now },
  { productId: 'cheese-mozzarella', storeId: 'coles-clayton', price: 6.00, inStock: true, lastUpdatedAt: now },
  { productId: 'cheese-mozzarella', storeId: 'iga-southyarra', price: 6.20, inStock: true, lastUpdatedAt: now },
  { productId: 'cheese-parmesan', storeId: 'woolworths-clayton', price: 7.20, inStock: true, lastUpdatedAt: now },
  { productId: 'cheese-parmesan', storeId: 'coles-oakleigh', price: 7.50, inStock: true, lastUpdatedAt: now },
];
