const express = require('express');
const router = express.Router();
const blogCategoryController = require('../controllers/blogCategoryController');

const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', blogCategoryController.getAllBlogCategories);
router.get('/:id', blogCategoryController.getBlogCategoryById);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), blogCategoryController.createBlogCategory);
router.put('/:id', authenticate, authorize('ADMIN'), blogCategoryController.updateBlogCategory);
router.delete('/:id', authenticate, authorize('ADMIN'), blogCategoryController.deleteBlogCategory);

module.exports = router;
