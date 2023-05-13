import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';
import moment from 'moment';
import { generateToken, isAdmin, isAuth, isSellerOrAdmin } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const seller = req.query.seller || '';
    const sellerFilter = seller ? { seller } : {};

    const orders = await Order.find({ ...sellerFilter }).populate(
      'user',
      'name'
    );
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentInfo: req.body.paymentInfo,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
      seller: req.body.orderItems[0].seller,
    });
    const order = await newOrder.save();
    res.status(201).send({ message: 'New order created', order });
  })
);

orderRouter.get(
  '/summary',
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: 'null',
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    res.send({ users, orders, dailyOrders, productCategories });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.get(
  '/seller',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const sllr = req.query.seller || '';
    const sellerFilter = sllr ? { sllr } : {};
    const sellId = new mongoose.Types.ObjectId(req.query.seller);

    const orders = await Order.aggregate([
      {
        $match: {
          seller: sellId,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

    const users = await Order.aggregate([
      {
        $match: {
          seller: sellId,
        },
      },
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    const dailyOrders = await Order.aggregate([
      {
        $match: {
          seller: sellId,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productCategories = await Product.aggregate([
      {
        $match: {
          seller: sellId,
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const products = await Product.find({ seller: sellId })
      .sort({ counter: -1 }) // sort by counter in descending order
      .limit(5); // limit results to 5

    const startDate = moment().subtract(7, 'days').startOf('day').toDate();
    const endDate = moment().endOf('day').toDate();

    const results = await Order.find(
      {
        seller: sellId,
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      { orderItems: 1 }
    );

    const productMap = new Map();
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results[i].orderItems.length; j++) {
        const productId = results[i].orderItems[j]._id.toString();
        const productQuantity = results[i].orderItems[j].quantity;
        const productName = results[i].orderItems[j].name;
        const productValue = { name: productName, quantity: productQuantity };

        if (productMap.has(productId)) {
          let counterValue = productMap.get(productId);
          counterValue.quantity = productQuantity + counterValue.quantity;
          productMap.set(productId, counterValue);
        } else {
          productMap.set(productId, productValue);
        }
      }
    }

    var sortedEntries = [...productMap.entries()].sort(
      (a, b) => b[1].quantity - a[1].quantity
    );
    sortedEntries = sortedEntries.slice(0, 5);

    const arrayDetails30 = await Product.aggregate([
      {
        $match: {
          price: { $lt: 30 },
        },
      },
      {
        $group: {
          _id: '$category',
          totalCounter30: { $sum: '$counter' },
        },
      },
    ]);

    const arrayDetails60 = await Product.aggregate([
      {
        $match: {
          price: { $gte: 31, $lte: 60 },
        },
      },
      {
        $group: {
          _id: '$category',
          totalCounter60: { $sum: '$counter' },
        },
      },
    ]);

    const arrayDetails90 = await Product.aggregate([
      {
        $match: {
          price: { $gte: 60 },
        },
      },
      {
        $group: {
          _id: '$category',
          totalCounter90: { $sum: '$counter' },
        },
      },
    ]);

    let combinedArray = [
      ...arrayDetails30,
      ...arrayDetails60,
      ...arrayDetails90,
    ];

    let categoriesSet = new Set();
    categoriesSet.add('Jeans');
    categoriesSet.add('Dresses');
    categoriesSet.add('Tshirts');
    categoriesSet.add('Skirts');
    categoriesSet.add('Overcoats');
    categoriesSet.add('Caps');

    let resultArray = Array.from(categoriesSet).map((category) => {
      let matchingObjects = combinedArray.filter((obj) => obj._id === category);
      if (matchingObjects.length === 0) {
        return {
          _id: category,
          totalCounter30: 0,
          totalCounter60: 0,
          totalCounter90: 0,
        };
      } else {
        let mergedObj = Object.assign({}, ...matchingObjects);
        if (!mergedObj.hasOwnProperty('totalCounter30')) {
          mergedObj.totalCounter30 = 0;
        }
        if (!mergedObj.hasOwnProperty('totalCounter60')) {
          mergedObj.totalCounter60 = 0;
        }
        if (!mergedObj.hasOwnProperty('totalCounter90')) {
          mergedObj.totalCounter90 = 0;
        }
        return mergedObj;
      }
    });

    console.log('resultArray' + JSON.stringify(resultArray));

    res.send({
      users,
      orders,
      dailyOrders,
      productCategories,
      products,
      results,
      sortedEntries,
      resultArray,
    });
  })
);

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      order.orderItems.map(async (orderProduct) => {
        const product = await Product.findById(orderProduct.product);
        if (product) {
          product.countInStock = product.countInStock - orderProduct.quantity;
          product.counter =
            (product.counter ? product.counter : 0) + orderProduct.quantity;
          await product.save();
        }
      });
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isSellerOrAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);
export default orderRouter;
