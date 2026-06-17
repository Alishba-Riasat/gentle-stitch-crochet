const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Categories (6)
const categories = [
  { name: 'Blankets', slug: 'blankets', images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }], description: 'Warm crochet blankets', isActive: true },
  { name: 'Toys', slug: 'toys', images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }],description: 'Cute amigurumi toys', isActive: true },
  { name: 'Scarves', slug: 'scarves',images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }], description: 'Cozy crochet scarves', isActive: true },
  { name: 'Hats', slug: 'hats', images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }],description: 'Stylish crochet hats', isActive: true },
  { name: 'Bags', slug: 'bags', images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }],description: 'Handmade crochet bags', isActive: true },
  { name: 'Home Decor', slug: 'home-decor',images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }], description: 'Crochet home decorations', isActive: true },
];

// Dummy user ID (must be a valid ObjectId – any works for seeding)
const dummyUserId = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');

// Products (15 total) – some with reviews
const products = [
  // Blankets (5)
  {
    name: 'Woolen Crochet Blanket',
    slug: 'woolen-crochet-blanket',
    description: 'Soft woolen blanket perfect for winter.',
    price: 49.99,
    comparePrice: 69.99,
    stock: 12,
    images: [{ url: 'https://picsum.photos/id/20/300/200', public_id: 'blanket1', isMain: true }],
    isActive: true,
    featured: true,
    isNew: false,
    isBestSeller: true,
    reviews: [
      {
        user: dummyUserId,
        name: 'Neha',
        rating: 5,
        comment: 'Really Loved The Quality 10/10 ⭐️ Best premium packaging.',
        createdAt: new Date(),
      },
      {
        user: dummyUserId,
        name: 'Fiza A.',
        rating: 5,
        comment: 'This is my second purchase, and once again I’m impressed. Great quality!',
        createdAt: new Date(),
      },
    ],
  },
  {
    name: 'Cotton Crochet Blanket',
    slug: 'cotton-crochet-blanket',
    description: 'Lightweight cotton blanket for summer.',
    price: 39.99,
    comparePrice: 49.99,
    stock: 8,
    images: [{ url: 'https://picsum.photos/id/30/300/200', public_id: 'blanket2', isMain: true }],
    isActive: true,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    name: 'Baby Crochet Blanket',
    slug: 'baby-crochet-blanket',
    description: 'Soft and safe for babies.',
    price: 29.99,
    comparePrice: 39.99,
    stock: 20,
    images: [{ url: 'https://picsum.photos/id/40/300/200', public_id: 'blanket3', isMain: true }],
    isActive: true,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    name: 'Knitted Throw Blanket',
    slug: 'knitted-throw-blanket',
    description: 'Chunky knit throw, handmade.',
    price: 59.99,
    comparePrice: 79.99,
    stock: 5,
    images: [{ url: 'https://picsum.photos/id/25/300/200', public_id: 'blanket4', isMain: true }],
    isActive: true,
    featured: false,
    isNew: false,
    isBestSeller: false,
  },
  {
    name: 'Granny Square Blanket',
    slug: 'granny-square-blanket',
    description: 'Colorful granny square design.',
    price: 44.99,
    comparePrice: 54.99,
    stock: 10,
    images: [{ url: 'https://picsum.photos/id/26/300/200', public_id: 'blanket5', isMain: true }],
    isActive: true,
    featured: true,
    isNew: false,
    isBestSeller: true,
  },
  // Toys (5)
  {
    name: 'Amigurumi Teddy Bear',
    slug: 'amigurumi-teddy-bear',
    description: 'Handmade teddy bear, 12 inches tall.',
    price: 24.99,
    comparePrice: 29.99,
    stock: 15,
    images: [{ url: 'https://picsum.photos/id/50/300/200', public_id: 'toy1', isMain: true }],
    isActive: true,
    featured: true,
    isNew: false,
    isBestSeller: true,
    reviews: [
      {
        user: dummyUserId,
        name: 'Mahi',
        rating: 5,
        comment: 'I have received my order – Mashaallah good quality ❤️',
        createdAt: new Date(),
      },
      {
        user: dummyUserId,
        name: 'Noor E. H.',
        rating: 5,
        comment: 'Received, thank you!',
        createdAt: new Date(),
      },
    ],
  },
  {
    name: 'Crochet Bunny Rabbit',
    slug: 'crochet-bunny-rabbit',
    description: 'Cute bunny for Easter gift.',
    price: 19.99,
    comparePrice: 24.99,
    stock: 10,
    images: [{ url: 'https://picsum.photos/id/60/300/200', public_id: 'toy2', isMain: true }],
    isActive: true,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    name: 'Crochet Elephant',
    slug: 'crochet-elephant',
    description: 'Soft elephant toy, perfect for nursery.',
    price: 22.99,
    comparePrice: 27.99,
    stock: 7,
    images: [{ url: 'https://picsum.photos/id/70/300/200', public_id: 'toy3', isMain: true }],
    isActive: true,
    featured: false,
    isNew: false,
    isBestSeller: false,
  },
  {
    name: 'Crochet Fox',
    slug: 'crochet-fox',
    description: 'Adorable fox stuffed toy.',
    price: 21.99,
    comparePrice: 26.99,
    stock: 9,
    images: [{ url: 'https://picsum.photos/id/100/300/200', public_id: 'toy4', isMain: true }],
    isActive: true,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    name: 'Crochet Owl',
    slug: 'crochet-owl',
    description: 'Cute owl with big eyes.',
    price: 18.99,
    comparePrice: 23.99,
    stock: 12,
    images: [{ url: 'https://picsum.photos/id/31/300/200', public_id: 'toy5', isMain: true }],
    isActive: true,
    featured: false,
    isNew: false,
    isBestSeller: true,
  },
  // Scarves (5)
  {
    name: 'Warm Crochet Scarf',
    slug: 'warm-crochet-scarf',
    description: 'Cozy scarf in neutral color.',
    price: 18.99,
    comparePrice: 24.99,
    stock: 25,
    images: [{ url: 'https://picsum.photos/id/80/300/200', public_id: 'scarf1', isMain: true }],
    isActive: true,
    featured: true,
    isNew: false,
    isBestSeller: true,
    reviews: [
      {
        user: dummyUserId,
        name: 'Sarah',
        rating: 5,
        comment: 'Love love loved it! Many compliments.',
        createdAt: new Date(),
      },
    ],
  },
  {
    name: 'Striped Crochet Scarf',
    slug: 'striped-crochet-scarf',
    description: 'Colorful striped design.',
    price: 21.99,
    comparePrice: 26.99,
    stock: 18,
    images: [{ url: 'https://picsum.photos/id/90/300/200', public_id: 'scarf2', isMain: true }],
    isActive: true,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    name: 'Infinity Crochet Scarf',
    slug: 'infinity-crochet-scarf',
    description: 'Endless loop style, very trendy.',
    price: 22.99,
    comparePrice: 29.99,
    stock: 14,
    images: [{ url: 'https://picsum.photos/id/15/300/200', public_id: 'scarf3', isMain: true }],
    isActive: true,
    featured: false,
    isNew: false,
    isBestSeller: false,
  },
  {
    name: 'Plaid Crochet Scarf',
    slug: 'plaid-crochet-scarf',
    description: 'Classic plaid pattern.',
    price: 24.99,
    comparePrice: 34.99,
    stock: 10,
    images: [{ url: 'https://picsum.photos/id/12/300/200', public_id: 'scarf4', isMain: true }],
    isActive: true,
    featured: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    name: 'Chunky Knit Scarf',
    slug: 'chunky-knit-scarf',
    description: 'Super thick and warm.',
    price: 27.99,
    comparePrice: 34.99,
    stock: 8,
    images: [{ url: 'https://picsum.photos/id/8/300/200', public_id: 'scarf5', isMain: true }],
    isActive: true,
    featured: true,
    isNew: false,
    isBestSeller: true,
  },
];

const importData = async () => {
  try {
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('🗑️ Existing data cleared');

    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ ${insertedCategories.length} categories inserted`);

    const catMap = {
      blankets: insertedCategories.find(c => c.slug === 'blankets')._id,
      toys: insertedCategories.find(c => c.slug === 'toys')._id,
      scarves: insertedCategories.find(c => c.slug === 'scarves')._id,
    };

    const productsWithCategory = products.map(p => {
      let categoryId;
      if (p.name.toLowerCase().includes('blanket')) categoryId = catMap.blankets;
      else if (p.name.toLowerCase().includes('teddy') || p.name.toLowerCase().includes('bunny') || p.name.toLowerCase().includes('elephant') || p.name.toLowerCase().includes('fox') || p.name.toLowerCase().includes('owl')) categoryId = catMap.toys;
      else if (p.name.toLowerCase().includes('scarf')) categoryId = catMap.scarves;
      else throw new Error(`No category match for ${p.name}`);
      return { ...p, category: categoryId };
    });


// ========== ORDERS ==========
// Replace this ObjectId with your actual test user's _id from MongoDB Atlas
// You can also set it via environment variable: process.env.TEST_USER_ID
const testUserId = process.env.TEST_USER_ID || new mongoose.Types.ObjectId('69ff18a2acc04f5e41bef86f'); // <-- CHANGE THIS

const dummyOrders = [
  {
    user: testUserId,
    orderItems: [
      {
        product: new mongoose.Types.ObjectId(), // will be replaced by real product ID later
        name: 'Woolen Crochet Blanket',
        price: 49.99,
        quantity: 2,
        image: 'https://picsum.photos/id/20/80',
      }
    ],
    shippingAddress: {
      street: '123 Main St',
      city: 'Lahore',
      state: 'Punjab',
      zipCode: '54000',
      country: 'Pakistan',
      phone: '03001234567',
    },
    paymentMethod: 'cod',
    itemsPrice: 99.98,
    taxPrice: 5.00,
    shippingPrice: 0,
    totalPrice: 104.98,
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    createdAt: new Date('2025-05-15T10:00:00Z'),
  },
  {
    user: testUserId,
    orderItems: [
      {
        product: new mongoose.Types.ObjectId(),
        name: 'Amigurumi Teddy Bear',
        price: 24.99,
        quantity: 1,
        image: 'https://picsum.photos/id/50/80',
      }
    ],
    shippingAddress: {
      street: '456 Park Ave',
      city: 'Karachi',
      state: 'Sindh',
      zipCode: '75500',
      country: 'Pakistan',
      phone: '03111234567',
    },
    paymentMethod: 'cod',
    itemsPrice: 24.99,
    taxPrice: 1.25,
    shippingPrice: 0,
    totalPrice: 26.24,
    orderStatus: 'processing',
    paymentStatus: 'pending',
    createdAt: new Date('2025-05-20T14:30:00Z'),
  },
  {
    user: testUserId,
    orderItems: [
      {
        product: new mongoose.Types.ObjectId(),
        name: 'Warm Crochet Scarf',
        price: 18.99,
        quantity: 3,
        image: 'https://picsum.photos/id/80/80',
      }
    ],
    shippingAddress: {
      street: '789 Garden Road',
      city: 'Islamabad',
      state: 'ICT',
      zipCode: '44000',
      country: 'Pakistan',
      phone: '03451234567',
    },
    paymentMethod: 'cod',
    itemsPrice: 56.97,
    taxPrice: 2.85,
    shippingPrice: 0,
    totalPrice: 59.82,
    orderStatus: 'cancelled',
    paymentStatus: 'failed',
    createdAt: new Date('2025-05-10T09:15:00Z'),
  },
];

// ========== IMPORT FUNCTION ==========
const importData = async () => {
  try {
    // Clear collections
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();   // <-- clear orders as well
    console.log('🗑️ Existing data cleared');

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ ${insertedCategories.length} categories inserted`);

    // Insert products (same logic as before)
    const catMap = {
      blankets: insertedCategories.find(c => c.slug === 'blankets')._id,
      toys: insertedCategories.find(c => c.slug === 'toys')._id,
      scarves: insertedCategories.find(c => c.slug === 'scarves')._id,
    };

    const productsWithCategory = products.map(p => {
      let categoryId;
      if (p.name.toLowerCase().includes('blanket')) categoryId = catMap.blankets;
      else if (p.name.toLowerCase().includes('teddy') || p.name.toLowerCase().includes('bunny') || p.name.toLowerCase().includes('elephant') || p.name.toLowerCase().includes('fox') || p.name.toLowerCase().includes('owl')) categoryId = catMap.toys;
      else if (p.name.toLowerCase().includes('scarf')) categoryId = catMap.scarves;
      else throw new Error(`No category match for ${p.name}`);
      return { ...p, category: categoryId };
    });

    const insertedProducts = await Product.insertMany(productsWithCategory);
    console.log(`✅ ${insertedProducts.length} products inserted`);

    // Now update order items with real product IDs (use first product of each category as example)
    const blanketProduct = insertedProducts.find(p => p.name.toLowerCase().includes('blanket'));
    const toyProduct = insertedProducts.find(p => p.name.toLowerCase().includes('teddy'));
    const scarfProduct = insertedProducts.find(p => p.name.toLowerCase().includes('scarf'));

    if (blanketProduct && toyProduct && scarfProduct) {
      dummyOrders[0].orderItems[0].product = blanketProduct._id;
      dummyOrders[1].orderItems[0].product = toyProduct._id;
      dummyOrders[2].orderItems[0].product = scarfProduct._id;
    }

    // Insert orders
    const insertedOrders = await Order.insertMany(dummyOrders);
    console.log(`✅ ${insertedOrders.length} orders inserted`);

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};





    const insertedProducts = await Product.insertMany(productsWithCategory);
    console.log(`✅ ${insertedProducts.length} products inserted`);
    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

importData();