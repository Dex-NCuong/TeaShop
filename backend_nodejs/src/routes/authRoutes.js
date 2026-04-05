const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { handleUploadError, uploadSingleImage, setUploadFolder } = require('../middleware/uploadMiddleware');

// --- Public routes ---
router.post('/register', authController.register);
router.post('/login', authController.login);

// --- User routes (cần đăng nhập) ---
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, setUploadFolder('avatars'), handleUploadError(uploadSingleImage), authController.updateMe);
router.put('/change-password', authenticate, authController.changePassword);

// --- Admin routes ---
router.get('/users', authenticate, authorize('ADMIN'), authController.getAllUsers);
router.put('/users/:id/role', authenticate, authorize('ADMIN'), authController.updateUserRole);
router.delete('/users/:id', authenticate, authorize('ADMIN'), authController.deleteUser);

module.exports = router;
