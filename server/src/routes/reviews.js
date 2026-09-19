import { Router } from 'express';
import {
  getAllReviews,
  getReview,
  getCourseSummary,
  createReview,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = Router();

router.get('/', getAllReviews);

// MUST be registered before '/:id'. Express tries routes in registration
// order and '/:id' matches ANY single path segment, so a request to
// GET /api/reviews/summary would be captured by '/:id' with id = 'summary'
// and never reach getCourseSummary.
router.get('/summary', getCourseSummary);

router.get('/:id', getReview);
router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

export default router;
