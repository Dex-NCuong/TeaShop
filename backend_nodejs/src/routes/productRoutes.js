const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { handleUploadError, uploadSingleImage, setUploadFolder } = require('../middleware/uploadMiddleware');

const adminUpload = [
    authenticate,
    authorize('ADMIN'),
    setUploadFolder('products'),
    handleUploadError(uploadSingleImage)
];

// --- Public routes ---
router.get('/', productController.getAllProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

// --- Admin routes ---
router.post('/', ...adminUpload, productController.createProduct);
router.put('/:id', ...adminUpload, productController.updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.deleteProduct);

// --- Review routes (nằm trong product cho đúng cấu trúc /products/:productId/reviews) ---
router.get('/:productId/reviews', reviewController.getProductReviews);
router.post('/:productId/reviews', authenticate, reviewController.createReview);

module.exports = router;
