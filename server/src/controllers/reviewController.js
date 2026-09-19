import Joi from 'joi';
import { Review } from '../models/Review.js';

// A Mongo id is 24 hex characters. Joi has no built-in ObjectId type.
const objectId = Joi.string().hex().length(24);

// POST: all rules from README section 1
const createSchema = Joi.object({
  courseCode: Joi.string().trim().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().allow(''),
  reviewedBy: objectId
});

// PATCH: same rules, but every field is optional (at least one required)
const updateSchema = Joi.object({
  courseCode: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
  comment: Joi.string().allow(''),
  reviewedBy: objectId
}).min(1);

// GET /summary: courseCode must be a plain string. This also blocks
// NoSQL injection like ?courseCode[$ne]=x, because .aggregate() does NOT
// cast or sanitize values the way .find() does.
const summaryQuerySchema = Joi.object({
  courseCode: Joi.string().trim().required()
});

// Without this check, a bad id makes Mongoose throw a CastError (-> 500).
// A malformed id is the client's mistake, so we answer 400 instead.
function isBadId(id) {
  return objectId.validate(id).error !== undefined;
}

// Only expose name/email of the reviewer. The User document also holds the
// password hash, and a bare .populate('reviewedBy') would send it to clients.
const REVIEWER_FIELDS = 'name email';

const DUPLICATE_MESSAGE = 'This user has already reviewed this course';

// GET /api/reviews/summary?courseCode=CS101
export async function getCourseSummary(req, res, next) {
  try {
    const { value, error } = summaryQuerySchema.validate(req.query, { stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    // The pipeline runs inside MongoDB; only one small result document
    // comes back to Node instead of every matching review.
    const [summary] = await Review.aggregate([
      // 1. keep only this course's reviews (uses the courseCode index prefix)
      { $match: { courseCode: value.courseCode } },
      // 2. collapse them into a single group: average + count
      {
        $group: {
          _id: '$courseCode',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      },
      // 3. reshape to the README format and round to 2 decimals
      {
        $project: {
          _id: 0,
          courseCode: '$_id',
          averageRating: { $round: ['$averageRating', 2] },
          reviewCount: 1
        }
      }
    ]);

    // No matching reviews -> $group emits nothing, so `summary` is undefined.
    // A course with zero reviews is a valid state, not an error.
    res.json(summary ?? { courseCode: value.courseCode, averageRating: null, reviewCount: 0 });
  } catch (err) { next(err); }
}

// GET /api/reviews
export async function getAllReviews(req, res, next) {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('reviewedBy', REVIEWER_FIELDS);
    res.json({ reviews });
  } catch (err) { next(err); }
}

// GET /api/reviews/:id
export async function getReview(req, res, next) {
  try {
    if (isBadId(req.params.id)) return res.status(400).json({ message: 'Invalid review id' });

    const review = await Review.findById(req.params.id).populate('reviewedBy', REVIEWER_FIELDS);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) { next(err); }
}

// POST /api/reviews
export async function createReview(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    const review = await Review.create(value);
    res.status(201).json({ review });
  } catch (err) {
    // 11000 = duplicate key. The unique index on { courseCode, reviewedBy }
    // is the real guarantee of "one review per user per course"; a
    // findOne-then-create check would be racy under concurrent requests.
    if (err.code === 11000) return res.status(409).json({ message: DUPLICATE_MESSAGE });
    next(err);
  }
}

// PATCH /api/reviews/:id
export async function updateReview(req, res, next) {
  try {
    if (isBadId(req.params.id)) return res.status(400).json({ message: 'Invalid review id' });

    const { value, error } = updateSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) return res.status(400).json({ message: error.message });

    // new: true            -> return the updated doc, not the old one
    // runValidators: true  -> update queries skip schema validators by default
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: value },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ review });
  } catch (err) {
    // Changing courseCode/reviewedBy can collide with an existing review.
    if (err.code === 11000) return res.status(409).json({ message: DUPLICATE_MESSAGE });
    next(err);
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req, res, next) {
  try {
    if (isBadId(req.params.id)) return res.status(400).json({ message: 'Invalid review id' });

    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}
