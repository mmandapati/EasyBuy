import mongoose from 'mongoose';

const recommendSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectID, ref: 'User' },
    contentProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    ],
    collabProducts: [
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

const Recommend = mongoose.model('Recommend', recommendSchema);
export default Recommend;
