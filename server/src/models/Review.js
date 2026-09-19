import mongoose from 'mongoose';

// TODO #1 (original line 3): delete this comment, it's only a note.

const reviewSchema = new mongoose.Schema(
  {
    // ══════ TODO #2 (original line 7): replace the bare "// TODO" with these 4 fields ══════

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

// ══════ TODO #3 (original line 12): replace the comment with this index ══════
reviewSchema.index(
  { courseCode: 1, reviewedBy: 1 },
  { unique: true, partialFilterExpression: { reviewedBy: { $type: 'objectId' } } }
);
// ══════ end of TODO #3 ══════

export const Review = mongoose.model('Review', reviewSchema);