import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Content from '../models/contentModel.js';

const contentRouter = express.Router();

contentRouter.get('/content/:id', async (req, res) => {
  const content = await Content.findOne({ user: req.params.id });
  if (content) {
    res.status(201).send({
      message: 'Content Recommendations fetched',
      productIds: content.products,
    });
  } else {
    res.status(404).send({ message: 'No Content Recommendations found' });
  }
});

export default contentRouter;
