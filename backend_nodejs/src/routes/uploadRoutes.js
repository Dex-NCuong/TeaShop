const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
    handleUploadError,
    uploadSingleImage,
    uploadMultipleImages,
    setUploadFolder
} = require('../middleware/uploadMiddleware');

// POST /api/upload/image - Upload 1 ảnh (cần đăng nhập)
router.post(
    '/image',
    authenticate,
    setUploadFolder('misc'),
    handleUploadError(uploadSingleImage),
    uploadController.uploadImage
);

// POST /api/upload/images - Upload nhiều ảnh sản phẩm (cần đăng nhập ADMIN)
router.post(
    '/images',
    authenticate,
    authorize('ADMIN'),
    setUploadFolder('products'),
    handleUploadError(uploadMultipleImages),
    uploadController.uploadImages
);

// POST /api/upload/product-image - Upload ảnh sản phẩm [ADMIN]
router.post(
    '/product-image',
    authenticate,
    authorize('ADMIN'),
    setUploadFolder('products'),
    handleUploadError(uploadSingleImage),
    uploadController.uploadImage
);

// DELETE /api/upload/:folder/:filename - Xóa file [ADMIN]
router.delete('/:folder/:filename', authenticate, authorize('ADMIN'), uploadController.deleteFile);

module.exports = router;
