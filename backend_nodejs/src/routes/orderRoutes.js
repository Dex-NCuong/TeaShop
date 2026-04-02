const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// --- User routes (cần đăng nhập) ---
router.post('/', authenticate, orderController.createOrder);              // Tạo đơn hàng (có transaction)
router.get('/my-orders', authenticate, orderController.getMyOrders);      // Xem đơn hàng của mình
router.delete('/:id/cancel', authenticate, orderController.cancelOrder);  // Hủy đơn hàng (có transaction)

// --- Admin routes ---
router.get('/', authenticate, authorize('ADMIN'), orderController.getAllOrders);               // Lấy tất cả đơn
router.get('/dashboard', authenticate, authorize('ADMIN'), orderController.getDashboardStats); // Thống kê dashboard
router.get('/export', authenticate, authorize('ADMIN'), orderController.exportOrdersToExcel);    // Xuất Excel
router.get('/user/:userId', authenticate, authorize('ADMIN'), orderController.getOrdersByUserId); // Đơn theo user

// --- Shared (user xem đơn của mình, admin xem tất cả) ---
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authenticate, authorize('ADMIN'), orderController.updateOrderStatus); // Cập nhật trạng thái

module.exports = router;
