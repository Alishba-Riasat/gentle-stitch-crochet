const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const fixRatings = async () => {
  const products = await Product.find({ 'reviews.0': { $exists: true } });
  for (let product of products) {
    const numReviews = product.reviews.length;
    const sum = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const rating = sum / numReviews;
    await Product.updateOne({ _id: product._id }, { rating, numReviews });
    console.log(`Updated product ${product.name}: rating=${rating}, numReviews=${numReviews}`);
  }
  console.log('✅ All ratings fixed');
  process.exit(0);
};

fixRatings();