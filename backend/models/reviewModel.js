import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    name: { type: String },
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectID, ref: 'Product' },
    comment: { type: String },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model('Review', reviewSchema);
export default Review;
