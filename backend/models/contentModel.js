import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User' },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Content = mongoose.model('Content', contentSchema);
export default Content;
