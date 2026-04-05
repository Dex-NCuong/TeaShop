const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// ========================
// Middleware
// ========================
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Phục vụ file tĩnh từ thư mục uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========================
// Routes
// ========================
const chatbotRoutes = require('./routes/chatbotRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const blogRoutes = require('./routes/blogRoutes');
const blogCategoryRoutes = require('./routes/blogCategoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const brewingGuideRoutes = require('./routes/brewingGuideRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blog-categories', blogCategoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/brewing-guides', brewingGuideRoutes);
app.use('/api/payment', paymentRoutes);

// ========================
// Health check
// ========================
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'WebTra Node.js API is running...',
        version: '2.0.0',
        features: ['CRUD', 'Authentication', 'Authorization', 'Upload', 'Transaction', 'Socket.IO']
    });
});

// ========================
// Global Error Handler
// ========================
app.use((err, req, res, next) => {
    console.error('❌ Global Error:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Lỗi server nội bộ!'
    });
});

module.exports = app;
