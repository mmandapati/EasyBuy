import express from 'express';
import products from '../sampleProductdata.js';
import Product from '../models/productModel.js';

const productSeedRouter = express.Router();

productSeedRouter.get('/', async (req, res) => {
  const createdProducts = await Product.insertMany(products);
  res.send(createdProducts);
});

export default productSeedRouter;
