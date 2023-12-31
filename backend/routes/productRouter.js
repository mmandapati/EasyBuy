import express from 'express';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';
import expressAsyncHandler from 'express-async-handler';
import {
  isAuth,
  isAdmin,
  mailgun,
  notifyEmailTemplate,
  isSellerOrAdmin,
  isSeller,
} from '../utils.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
  const products = await Product.find().populate({
    path: 'seller',
    select: 'seller.name seller.logo',
  });
  res.send(products);
});
const PAGE_SIZE = 12;

productRouter.post(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: req.body.name,
      seller: req.user._id,
      image: req.body.image,
      price: req.body.price,
      category: req.body.category,
      brand: req.body.brand,
      countInStock: req.body.countInStock,
      rating: 0,
      numReviews: 0,
      description: req.body.description,
    });
    const product = await newProduct.save();
    res.send({ message: 'Product Created', product });
  })
);

productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.reviews.find((x) => x.name === req.user.name)) {
        return res
          .status(400)
          .send({ message: 'You already submitted a review' });
      }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review Created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.put(
  '/:id/notified',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      if (product.notified.find((x) => x == req.user._id)) {
        return res
          .status(400)
          .send({ message: 'You were already enrolled to notify' });
      }

      product.notified.push(req.user._id);
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Successfully enrolled',
        user: updatedProduct.notified[updatedProduct.notified.length - 1],
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.send({ message: 'Product Deleted' });
    } else {
      res.status(404).send({ message: 'Product not found' });
    }
  })
);

productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/seller',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};

    const products = await Product.find({ ...sellerFilter })
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate({
        path: 'seller',
        select: 'seller.name seller.logo',
      });
    const countProducts = await Product.countDocuments({ ...sellerFilter });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/seller/productsOutOfStock',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};

    const sellId = new mongoose.Types.ObjectId(req.query.seller);

    const productsOutOfStock = await Product.find(
      {
        seller: sellId,
        countInStock: 0,
        notified: { $gt: [] },
      },
      { productId: 1, name: '$name', notifiedSize: { $size: '$notified' } }
    );

    console.log('notified length', productsOutOfStock);

    res.send(productsOutOfStock);
  })
);

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize)
      .populate({
        path: 'seller',
        select: 'seller.name seller.logo',
      });

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);
productRouter.put(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate({
      path: 'notified',
      select: 'email name',
    });
    let notify = false;
    let notified = product.notified;

    if (product) {
      //check if the product is outofstock
      if (
        product.countInStock === 0 &&
        product.countInStock !== req.body.countInStock
      ) {
        notify = true;
        // console.log('should notify: ', notify);
      }

      product.name = req.body.name;
      product.price = req.body.price;
      product.image = req.body.image;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      product.notified = [];
      await product.save();

      if (notify) {
        if (notified.length > 0) {
          notified.map((x) => {
            //const userInformation = user.populate('email name');
            // To Do:
            // create a mailgun account with easybuy mail id
            // Upload on cloud and create a domain to get unauthorized mails to be sent
            // console.log('user email', x.email);
            // console.log('user name', x.name);
            mailgun()
              .messages()
              .send(
                {
                  from: 'EasyBuy <easybuy.bio@gmail.com>',
                  to: `${x.name} <${x.email}>`,
                  subject: 'Wait is over, Back in stock',
                  html: notifyEmailTemplate(product, x.name),
                },
                (error, body) => {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log(body);
                  }
                }
              );
          });
        }
      }

      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

productRouter.get('/slug/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).populate({
    path: 'seller',
    select: 'seller.name seller.rating seller.numReviews',
  });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product Not Found' });
  }
});

export default productRouter;
