import mongoose from 'mongoose';

// TODO: define the Review schema per README.md section 1.

const reviewSchema = new mongoose.Schema(
  {
    // TODO
  },
  { timestamps: true }
);

// TODO: add the uniqueness constraint described in README.md section 1.

export const Review = mongoose.model('Review', reviewSchema);
