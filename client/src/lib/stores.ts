export interface StoreLocation {
  id: string;
  name: string;
  chain: 'Woolworths' | 'Coles' | 'Aldi' | 'IGA' | 'Local Market';
  address: string;
  suburb: string;
  postcode: string;
  latitude: number;
  longitude: number;
  distance?: number; // in km from user location
  hours: {
    open: string;
    close: string;
  };
  rating: number; // 1-5
}

export interface ProductPrice {
  productId: string;
  storeId: string;
  price: number;
  inStock: boolean;
  lastUpdated: string;
}

export const stores: StoreLocation[] = [
  {
    id: 'woolworths-clayton',
    name: 'Woolworths Clayton',
    chain: 'Woolworths',
    address: '20 Bettina Street',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9123,
    longitude: 145.1234,
    hours: { open: '07:00', close: '22:00' },
    rating: 4.5,
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
    hours: { open: '07:00', close: '23:00' },
    rating: 4.3,
  },
  {
    id: 'coles-clayton',
    name: 'Coles Clayton',
    chain: 'Coles',
    address: '100 Mountain Highway',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9234,
    longitude: 145.1345,
    hours: { open: '06:00', close: '23:00' },
    rating: 4.2,
  },
  {
    id: 'aldi-clayton',
    name: 'Aldi Clayton',
    chain: 'Aldi',
    address: '50 Princes Highway',
    suburb: 'Clayton',
    postcode: '3168',
    latitude: -37.9345,
    longitude: 145.1456,
    hours: { open: '08:00', close: '21:00' },
    rating: 4.4,
  },
  {
    id: 'iga-southyarra',
    name: 'IGA South Yarra',
    chain: 'IGA',
    address: '200 Toorak Road',
    suburb: 'South Yarra',
    postcode: '3141',
    latitude: -37.8567,
    longitude: 145.0345,
    hours: { open: '07:00', close: '22:00' },
    rating: 4.1,
  },
];

export const productPrices: ProductPrice[] = [
  // Paneer prices
  { productId: 'paneer-lemnos-200', storeId: 'woolworths-clayton', price: 6.60, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'paneer-lemnos-200', storeId: 'coles-clayton', price: 6.80, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'paneer-lemnos-200', storeId: 'aldi-clayton', price: 6.40, inStock: false, lastUpdated: '2026-03-14' },
  { productId: 'paneer-lemnos-200', storeId: 'woolworths-southyarra', price: 6.70, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'paneer-westhaven-500', storeId: 'woolworths-clayton', price: 10.25, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'paneer-westhaven-500', storeId: 'coles-clayton', price: 10.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'paneer-westhaven-500', storeId: 'iga-southyarra', price: 10.80, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'paneer-westhaven-1kg', storeId: 'woolworths-clayton', price: 13.80, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'paneer-westhaven-1kg', storeId: 'coles-clayton', price: 14.20, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'paneer-westhaven-1kg', storeId: 'aldi-clayton', price: 13.50, inStock: true, lastUpdated: '2026-03-14' },

  // Rice prices
  { productId: 'rice-woolworths-1kg', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'rice-woolworths-1kg', storeId: 'coles-clayton', price: 3.60, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'rice-woolworths-1kg', storeId: 'aldi-clayton', price: 3.30, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'rice-sunrice-2kg', storeId: 'woolworths-clayton', price: 5.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'rice-sunrice-2kg', storeId: 'coles-clayton', price: 5.70, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'rice-sunrice-2kg', storeId: 'iga-southyarra', price: 5.90, inStock: true, lastUpdated: '2026-03-14' },

  // Ready meals
  { productId: 'ready-mtr-palak-paneer', storeId: 'woolworths-clayton', price: 4.20, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'ready-mtr-palak-paneer', storeId: 'coles-clayton', price: 4.50, inStock: false, lastUpdated: '2026-03-14' },
  { productId: 'ready-mtr-palak-paneer', storeId: 'iga-southyarra', price: 4.40, inStock: true, lastUpdated: '2026-03-14' },

  // Pasta prices
  { productId: 'pasta-barilla-rigatoni', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'pasta-barilla-rigatoni', storeId: 'coles-clayton', price: 3.60, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'pasta-barilla-rigatoni', storeId: 'aldi-clayton', price: 3.20, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'pasta-barilla-spaghettoni', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'pasta-barilla-spaghettoni', storeId: 'coles-clayton', price: 3.60, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'pasta-barilla-penne', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'pasta-barilla-penne', storeId: 'aldi-clayton', price: 3.20, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'pasta-barilla-gf-fusilli', storeId: 'woolworths-clayton', price: 4.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'pasta-barilla-gf-fusilli', storeId: 'coles-clayton', price: 4.80, inStock: true, lastUpdated: '2026-03-14' },

  // Cheese prices
  { productId: 'cheese-mozzarella', storeId: 'woolworths-clayton', price: 5.80, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'cheese-mozzarella', storeId: 'coles-clayton', price: 6.00, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'cheese-mozzarella', storeId: 'iga-southyarra', price: 6.20, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'cheese-parmesan', storeId: 'woolworths-clayton', price: 7.20, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'cheese-parmesan', storeId: 'coles-clayton', price: 7.50, inStock: true, lastUpdated: '2026-03-14' },

  // Sauce prices
  { productId: 'sauce-barilla-bolognese', storeId: 'woolworths-clayton', price: 3.20, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'sauce-barilla-bolognese', storeId: 'coles-clayton', price: 3.30, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'sauce-barilla-napoletana', storeId: 'woolworths-clayton', price: 3.20, inStock: true, lastUpdated: '2026-03-14' },

  // Tortilla prices
  { productId: 'tortilla-old-el-paso-corn', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'tortilla-old-el-paso-corn', storeId: 'coles-clayton', price: 3.60, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'tortilla-old-el-paso-wheat', storeId: 'woolworths-clayton', price: 3.50, inStock: true, lastUpdated: '2026-03-14' },

  // Beans prices
  { productId: 'beans-black-canned', storeId: 'woolworths-clayton', price: 1.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'beans-black-canned', storeId: 'coles-clayton', price: 1.60, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'beans-black-canned', storeId: 'aldi-clayton', price: 1.30, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'beans-kidney-canned', storeId: 'woolworths-clayton', price: 1.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'beans-kidney-canned', storeId: 'coles-clayton', price: 1.60, inStock: true, lastUpdated: '2026-03-14' },

  // Salsa prices
  { productId: 'salsa-temole-avocado', storeId: 'woolworths-clayton', price: 3.00, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'salsa-temole-avocado', storeId: 'coles-clayton', price: 3.20, inStock: true, lastUpdated: '2026-03-14' },

  { productId: 'chips-corn-tortilla', storeId: 'woolworths-clayton', price: 2.80, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'chips-corn-tortilla', storeId: 'aldi-clayton', price: 2.50, inStock: true, lastUpdated: '2026-03-14' },

  // Milk alternatives
  { productId: 'milk-vitasoy-almond', storeId: 'woolworths-clayton', price: 2.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'milk-vitasoy-almond', storeId: 'coles-clayton', price: 2.60, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'milk-vitasoy-soy', storeId: 'woolworths-clayton', price: 2.50, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'milk-vitasoy-soy', storeId: 'aldi-clayton', price: 2.30, inStock: true, lastUpdated: '2026-03-14' },
  { productId: 'milk-oat-milk', storeId: 'woolworths-clayton', price: 3.00, inStock: true, lastUpdated: '2026-03-14' },
];
