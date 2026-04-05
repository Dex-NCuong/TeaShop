const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Tạo URL thanh toán VNPAY (POST /api/payment/create-payment)
router.post('/create-payment', paymentController.createPayment);

// Hứng kết quả thanh toán từ VNPAY (IPN) (GET /api/payment/vnpay-return)
router.get('/vnpay-return', paymentController.vnpayReturn);
router.get('/ipn', paymentController.vnpayReturn); // IPN URL

module.exports = router;
