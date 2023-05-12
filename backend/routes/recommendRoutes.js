import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Recommend from '../models/recommendModel.js';

const recommendRouter = express.Router();

recommendRouter.get('/:id', async (req, res) => {
  const recommend = await Recommend.findOne({ user: req.params.id });
  if (recommend) {
    res
      .status(201)
      .send({
        contentProducts: recommend.contentProducts,
        collabProducts: recommend.collabProducts,
      });
  } else {
    res.status(404).send({ message: 'No Content Recommendations found' });
  }
});

export default recommendRouter;
