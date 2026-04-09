const { Review } = require('../models');

// Lấy tất cả các đánh giá (dùng cho trang quản trị Admin)
exports.getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('productId', 'name imageUrl')
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });
        
        // Map lại để Frontend (đang tìm .product) thấy dữ liệu
        const reviewsWithProduct = reviews.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                product: obj.productId // Nhân bản productId sang product
            };
        });

        res.json({ data: reviewsWithProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách các đánh giá cho một sản phẩm cụ thể
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .populate('productId', 'name imageUrl')
            .populate('userId', 'fullName')
            .sort({ createdAt: -1 });

        const reviewsWithProduct = reviews.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                product: obj.productId
            };
        });

        res.json({ data: reviewsWithProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo một đánh giá mới cho sản phẩm
exports.createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;
        
        console.log('📝 NHẬN ĐÁNH GIÁ MỚI:', { productId, userId, body: req.body });

        const review = new Review({ ...req.body, productId, userId });
        const savedReview = await review.save();
        
        console.log('✅ ĐÃ LƯU ĐÁNH GIÁ:', savedReview._id);
        
        res.status(201).json({ message: 'Đánh giá thành công!', review: savedReview });
    } catch (error) {
        console.error('❌ LỖI LƯU ĐÁNH GIÁ:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Xóa một đánh giá dựa trên mã ID
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá!' });
        res.json({ message: 'Xóa đánh giá thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
