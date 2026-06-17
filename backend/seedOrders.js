const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User'); // to get a user ID if not provided

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const seedOrders = async () => {
  try {
    // Option 1: Use a specific user ID (replace with your actual test user ID)
    let testUserId = '69ff18a2acc04f5e41bef86f'; // <-- PASTE YOUR USER ID HERE
    
    // Option 2: If you don't know the ID, fetch the first user (e.g., the first registered user)
    if (testUserId === '69ff18a2acc04f5e41bef86f') {
      const firstUser = await User.findOne();
      if (!firstUser) {
        console.error('No user found in database. Please register a user first.');
        process.exit(1);
      }
      testUserId = firstUser._id;
      console.log(`Using first user: ${firstUser.email} (ID: ${testUserId})`);
    }

    // Find products by slug (or name) to use in orders
    const woolenBlanket = await Product.findOne({ slug: 'woolen-crochet-blanket' });
    const teddyBear = await Product.findOne({ slug: 'amigurumi-teddy-bear' });
    const warmScarf = await Product.findOne({ slug: 'warm-crochet-scarf' });

    if (!woolenBlanket || !teddyBear || !warmScarf) {
      console.error('Required products not found. Make sure seeder has run first.');
      process.exit(1);
    }

    // Dummy orders (3 different statuses)
    const dummyOrders = [
      {
        user: testUserId,
        orderItems: [{
          product: woolenBlanket._id,
          name: woolenBlanket.name,
          price: woolenBlanket.price,
          quantity: 2,
          image: woolenBlanket.images[0].url,
        }],
        shippingAddress: {
          street: '123 Main St', city: 'Lahore', state: 'Punjab', zipCode: '54000', country: 'Pakistan', phone: '03001234567',
        },
        paymentMethod: 'cod',
        itemsPrice: woolenBlanket.price * 2,
        taxPrice: 5.00,
        shippingPrice: 0,
        totalPrice: (woolenBlanket.price * 2) + 5.00,
        orderStatus: 'delivered',
        paymentStatus: 'paid',
        createdAt: new Date('2025-05-15T10:00:00Z'),
      },
      {
        user: testUserId,
        orderItems: [{
          product: teddyBear._id,
          name: teddyBear.name,
          price: teddyBear.price,
          quantity: 1,
          image: teddyBear.images[0].url,
        }],
        shippingAddress: {
          street: '456 Park Ave', city: 'Karachi', state: 'Sindh', zipCode: '75500', country: 'Pakistan', phone: '03111234567',
        },
        paymentMethod: 'cod',
        itemsPrice: teddyBear.price,
        taxPrice: 1.25,
        shippingPrice: 0,
        totalPrice: teddyBear.price + 1.25,
        orderStatus: 'processing',
        paymentStatus: 'pending',
        createdAt: new Date('2025-05-20T14:30:00Z'),
      },
      {
        user: testUserId,
        orderItems: [{
          product: warmScarf._id,
          name: warmScarf.name,
          price: warmScarf.price,
          quantity: 3,
          image: warmScarf.images[0].url,
        }],
        shippingAddress: {
          street: '789 Garden Road', city: 'Islamabad', state: 'ICT', zipCode: '44000', country: 'Pakistan', phone: '03451234567',
        },
        paymentMethod: 'cod',
        itemsPrice: warmScarf.price * 3,
        taxPrice: 2.85,
        shippingPrice: 0,
        totalPrice: (warmScarf.price * 3) + 2.85,
        orderStatus: 'cancelled',
        paymentStatus: 'failed',
        createdAt: new Date('2025-05-10T09:15:00Z'),
      },
    ];

    // Clear existing orders for this user (optional, to avoid duplicates)
    await Order.deleteMany({ user: testUserId });
    console.log(`🗑️ Removed existing orders for user ${testUserId}`);

    const inserted = await Order.insertMany(dummyOrders);
    console.log(`✅ ${inserted.length} dummy orders inserted for user ${testUserId}`);
    console.log('🎉 Order seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Order seeding failed:', err);
    process.exit(1);
  }
};

seedOrders();