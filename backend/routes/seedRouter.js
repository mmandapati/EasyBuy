import express from 'express';
import data from '../data.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
  await Product.deleteMany({});
  const createdProducts = await Product.insertMany(data.products);
  await User.deleteMany({});
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdProducts, createdUsers });
});

seedRouter.get('/users', async (req, res) => {
  console.log('date', new Date(2023, 4, 8));
  //const users = await User.find({ createdAt: { $gte: new Date(2023, 4, 8) } });
  //await User.deleteMany({ createdAt: { $gte: new Date(2023, 4, 8) } });
  const createdUsers = await User.insertMany(data.users);
  res.send({ createdUsers });
});

export default seedRouter;
