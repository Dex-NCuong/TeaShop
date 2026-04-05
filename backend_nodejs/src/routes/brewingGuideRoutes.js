const express = require('express');
const router = express.Router();
const brewingGuideController = require('../controllers/brewingGuideController');

const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', brewingGuideController.getAllBrewingGuides);
router.get('/:id', brewingGuideController.getBrewingGuideById);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), brewingGuideController.createBrewingGuide);
router.put('/:id', authenticate, authorize('ADMIN'), brewingGuideController.updateBrewingGuide);
router.delete('/:id', authenticate, authorize('ADMIN'), brewingGuideController.deleteBrewingGuide);

module.exports = router;
