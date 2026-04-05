const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', reviewController.getAllReviews); // for Admin
router.delete('/:id', authenticate, authorize('ADMIN'), reviewController.deleteReview);

module.exports = router;
