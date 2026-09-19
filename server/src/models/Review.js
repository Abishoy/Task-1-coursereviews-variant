import mongoose from 'mongoose';


const reviewSchema = new mongoose.Schema(
  {
  

    // Field 1 of 4: courseCode | String | required
    courseCode: {
      type: String,
      required: true
    },

    // Field 2 of 4: rating | Number | required, integer, min 1, max 5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'rating must be an integer'
      }
    },

    // Field 3 of 4: comment | String | optional (so no "required")
    comment: {
      type: String
    },

    // Field 4 of 4: reviewedBy | ObjectId ref User | optional (so no "required")
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }

    // ══════ end of TODO #2 ══════
  },
  { timestamps: true } // already in the starter file
);

reviewSchema.index(
  { courseCode: 1, reviewedBy: 1 },
  { unique: true, partialFilterExpression: { reviewedBy: { $type: 'objectId' } } }
);
// ══════ end of TODO #3 ══════

export const Review = mongoose.model('Review', reviewSchema);
