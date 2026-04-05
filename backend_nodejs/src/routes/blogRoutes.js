const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), blogController.createBlog);
router.put('/:id', authenticate, authorize('ADMIN'), blogController.updateBlog);
router.delete('/:id', authenticate, authorize('ADMIN'), blogController.deleteBlog);

module.exports = router;
