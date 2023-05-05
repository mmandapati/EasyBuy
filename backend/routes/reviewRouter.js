import express from 'express';
import Review from '../models/reviewModel.js';
import { isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';

const reviewRouter = express.Router();

reviewRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.id });

    res.send(reviews);
  })
);

reviewRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const existReview = await Review.findOne({
      user: req.body.user,
      product: req.body.product,
    });
    if (existReview) {
      return res
        .status(400)
        .send({ message: 'You already submitted a review' });
    }
    const newReview = new Review({
      name: req.body.name,
      user: req.body.user,
      product: req.body.product,
      comment: req.body.comment,
      rating: req.body.rating,
    });
    const review = await newReview.save();
    if (review) {
      const product = await Product.findById(req.body.product);
      product.numReviews = product.numReviews + 1;
      product.rating = (product.rating + req.body.rating) / product.numReviews;
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review Created',
        review: review,
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: 'Review not created' });
    }
  })
);

export default reviewRouter;
