export interface Product {
  id: string;
  name: string;
  category: string;
  cuisine: 'Indian' | 'Italian' | 'Mexican' | 'Alternatives';
  price: number;
  description: string;
  brand?: string;
  dietary: {
    wheatFree: boolean;
    dairyFree: boolean;
  };
  image?: string;
}

export const products: Product[] = [
  // Indian Cuisine - Paneer
  {
    id: 'paneer-lemnos-200',
    name: 'Lemnos Paneer Cheese',
    category: 'Paneer',
    cuisine: 'Indian',
    price: 6.60,
    description: 'Fresh paneer cheese, perfect for Indian curries and dishes',
    brand: 'Lemnos',
    dietary: { wheatFree: true, dairyFree: false },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp',
  },
  {
    id: 'paneer-westhaven-500',
    name: 'Tasmania\'s Westhaven Tasmanian Paneer',
    category: 'Paneer',
    cuisine: 'Indian',
    price: 10.25,
    description: 'Premium 500g paneer cheese from Tasmania',
    brand: 'Tasmania\'s Westhaven',
    dietary: { wheatFree: true, dairyFree: false },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp',
  },
  {
    id: 'paneer-westhaven-1kg',
    name: 'Tasmania\'s Westhaven Paneer Cheese',
    category: 'Paneer',
    cuisine: 'Indian',
    price: 13.80,
    description: 'Large 1kg paneer cheese block for bulk cooking',
    brand: 'Tasmania\'s Westhaven',
    dietary: { wheatFree: true, dairyFree: false },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp',
  },

  // Indian Cuisine - Rice
  {
    id: 'rice-woolworths-1kg',
    name: 'Woolworths Basmati Rice',
    category: 'Rice',
    cuisine: 'Indian',
    price: 3.50,
    description: 'Premium basmati rice, 1kg pack',
    brand: 'Woolworths',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp',
  },
  {
    id: 'rice-sunrice-2kg',
    name: 'SunRice Basmati Rice',
    category: 'Rice',
    cuisine: 'Indian',
    price: 5.50,
    description: 'Quality basmati rice, 2kg pack',
    brand: 'SunRice',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp',
  },

  // Indian Cuisine - Ready Meals
  {
    id: 'ready-mtr-palak-paneer',
    name: 'MTR Minute Meals Palak Paneer',
    category: 'Ready Meals',
    cuisine: 'Indian',
    price: 4.20,
    description: 'Ready-to-eat palak paneer, convenient meal option',
    brand: 'MTR',
    dietary: { wheatFree: true, dairyFree: false },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/indian-cuisine-card-c7EJvGxbnSxu59HPEbXZVc.webp',
  },

  // Italian Cuisine - Pasta
  {
    id: 'pasta-barilla-rigatoni',
    name: 'Barilla Rigatoni Pasta',
    category: 'Pasta',
    cuisine: 'Italian',
    price: 3.50,
    description: 'Classic rigatoni pasta made from durum wheat, 500g',
    brand: 'Barilla',
    dietary: { wheatFree: false, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },
  {
    id: 'pasta-barilla-spaghettoni',
    name: 'Barilla Spaghettoni Pasta',
    category: 'Pasta',
    cuisine: 'Italian',
    price: 3.50,
    description: 'Thick spaghetti pasta, 500g pack',
    brand: 'Barilla',
    dietary: { wheatFree: false, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },
  {
    id: 'pasta-barilla-penne',
    name: 'Barilla Penne Pasta',
    category: 'Pasta',
    cuisine: 'Italian',
    price: 3.50,
    description: 'Penne pasta tubes, 500g pack',
    brand: 'Barilla',
    dietary: { wheatFree: false, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },
  {
    id: 'pasta-barilla-gf-fusilli',
    name: 'Barilla Gluten Free Fusilli',
    category: 'Pasta',
    cuisine: 'Italian',
    price: 4.50,
    description: 'Gluten-free fusilli pasta, 500g',
    brand: 'Barilla',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },

  // Italian Cuisine - Cheese
  {
    id: 'cheese-mozzarella',
    name: 'Fresh Mozzarella',
    category: 'Cheese',
    cuisine: 'Italian',
    price: 5.80,
    description: 'Creamy fresh mozzarella for pasta dishes and salads',
    brand: 'Various',
    dietary: { wheatFree: true, dairyFree: false },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },
  {
    id: 'cheese-parmesan',
    name: 'Parmesan Cheese',
    category: 'Cheese',
    cuisine: 'Italian',
    price: 7.20,
    description: 'Aged Parmesan cheese, perfect for pasta and risotto',
    brand: 'Various',
    dietary: { wheatFree: true, dairyFree: false },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },

  // Italian Cuisine - Sauces
  {
    id: 'sauce-barilla-bolognese',
    name: 'Barilla Bolognese Pasta Sauce',
    category: 'Sauces',
    cuisine: 'Italian',
    price: 3.20,
    description: 'Traditional bolognese sauce, 400g',
    brand: 'Barilla',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },
  {
    id: 'sauce-barilla-napoletana',
    name: 'Barilla Napoletana Pasta Sauce',
    category: 'Sauces',
    cuisine: 'Italian',
    price: 3.20,
    description: 'Classic Napoletana tomato sauce, 400g',
    brand: 'Barilla',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/italian-cuisine-card-meZ24dhNamyiNFrQq45f6J.webp',
  },

  // Mexican Cuisine - Tortillas
  {
    id: 'tortilla-old-el-paso-corn',
    name: 'Old El Paso Corn Tortillas',
    category: 'Tortillas',
    cuisine: 'Mexican',
    price: 3.50,
    description: 'Authentic corn tortillas, 10 pack',
    brand: 'Old El Paso',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/mexican-cuisine-card-FdPPan9imdw7JMsFUBFwQr.webp',
  },
  {
    id: 'tortilla-old-el-paso-wheat',
    name: 'Old El Paso Wheat Flour Tortillas',
    category: 'Tortillas',
    cuisine: 'Mexican',
    price: 3.50,
    description: 'Soft wheat flour tortillas, 8 pack',
    brand: 'Old El Paso',
    dietary: { wheatFree: false, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/mexican-cuisine-card-FdPPan9imdw7JMsFUBFwQr.webp',
  },

  // Mexican Cuisine - Beans
  {
    id: 'beans-black-canned',
    name: 'Canned Black Beans',
    category: 'Beans',
    cuisine: 'Mexican',
    price: 1.50,
    description: 'Ready-to-use black beans, 400g can',
    brand: 'Various',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/mexican-cuisine-card-FdPPan9imdw7JMsFUBFwQr.webp',
  },
  {
    id: 'beans-kidney-canned',
    name: 'Canned Kidney Beans',
    category: 'Beans',
    cuisine: 'Mexican',
    price: 1.50,
    description: 'Ready-to-use kidney beans, 400g can',
    brand: 'Various',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/mexican-cuisine-card-FdPPan9imdw7JMsFUBFwQr.webp',
  },

  // Mexican Cuisine - Salsa & Chips
  {
    id: 'salsa-temole-avocado',
    name: 'Temole Avocado Chips Tomato Salsa',
    category: 'Salsa & Chips',
    cuisine: 'Mexican',
    price: 3.00,
    description: 'Avocado and tomato salsa with chips, 40g',
    brand: 'Temole',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/mexican-cuisine-card-FdPPan9imdw7JMsFUBFwQr.webp',
  },
  {
    id: 'chips-corn-tortilla',
    name: 'Corn Tortilla Chips',
    category: 'Salsa & Chips',
    cuisine: 'Mexican',
    price: 2.80,
    description: 'Crispy corn chips, 200g bag',
    brand: 'Various',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/mexican-cuisine-card-FdPPan9imdw7JMsFUBFwQr.webp',
  },

  // Milk Alternatives
  {
    id: 'milk-vitasoy-almond',
    name: 'Vitasoy Almond Milk',
    category: 'Plant-Based Milk',
    cuisine: 'Alternatives',
    price: 2.50,
    description: 'Creamy almond milk, 1L carton',
    brand: 'Vitasoy',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/hero-background-PyebGsAGmo6coKknxm6kGG.webp',
  },
  {
    id: 'milk-vitasoy-soy',
    name: 'Vitasoy Soy Milk',
    category: 'Plant-Based Milk',
    cuisine: 'Alternatives',
    price: 2.50,
    description: 'Protein-rich soy milk, 1L carton',
    brand: 'Vitasoy',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/hero-background-PyebGsAGmo6coKknxm6kGG.webp',
  },
  {
    id: 'milk-oat-milk',
    name: 'Oat Milk',
    category: 'Plant-Based Milk',
    cuisine: 'Alternatives',
    price: 3.00,
    description: 'Smooth oat milk, 1L carton',
    brand: 'Various',
    dietary: { wheatFree: true, dairyFree: true },
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663339693286/oGCPgQubmJjVL5WWWqAguQ/hero-background-PyebGsAGmo6coKknxm6kGG.webp',
  },
];
