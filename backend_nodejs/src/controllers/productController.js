const { Product, ProductWeight, ProductImage } = require('../models');

// GET /api/products - Lấy tất cả sản phẩm (có filter theo category)
exports.getAllProducts = async (req, res) => {
    try {
        const { categoryId, page = 1, limit = 10 } = req.query;
        const query = categoryId ? { categoryId } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [products, total] = await Promise.all([
            Product.find(query).populate('categoryId').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
            Product.countDocuments(query)
        ]);

        // Gắn thêm weights cho mỗi sản phẩm để lấy giá hiển thị
        const productsWithWeights = await Promise.all(products.map(async (p) => {
            const weights = await ProductWeight.find({ productId: p._id });
            return { ...p, weights };
        }));

        res.json({
            data: productsWithWeights,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/products/:id - Lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId').lean();
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        
        // Lấy thêm weights và images từ bảng riêng
        const [weights, images] = await Promise.all([
            ProductWeight.find({ productId: product._id }),
            ProductImage.find({ productId: product._id }).sort({ sortOrder: 1 })
        ]);

        res.json({ ...product, weights, images });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/products/category/:categoryId - Lấy sản phẩm theo danh mục
exports.getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({ categoryId: req.params.categoryId }).populate('categoryId');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/products - Tạo sản phẩm mới [ADMIN]
exports.createProduct = async (req, res) => {
    try {
        const { name, description, origin, categoryId } = req.body;
        let { weights, images } = req.body;

        // Xử lý ảnh đại diện chính
        let imageUrl = req.body.imageUrl || null;
        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        const product = new Product({
            name, description, origin, categoryId, imageUrl
        });

        const savedProduct = await product.save();

        // Lưu Weights vào bảng riêng
        if (weights) {
            const parsedWeights = typeof weights === 'string' ? JSON.parse(weights) : weights;
            const weightDocs = parsedWeights.map(w => ({ ...w, productId: savedProduct._id }));
            await ProductWeight.insertMany(weightDocs);
        }

        // Lưu Album ảnh vào bảng riêng
        if (images) {
            const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
            const imageDocs = parsedImages.map(img => ({ ...img, productId: savedProduct._id }));
            await ProductImage.insertMany(imageDocs);
        }

        res.status(201).json({ message: 'Tạo sản phẩm thành công!', product: savedProduct });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/products/:id - Cập nhật sản phẩm [ADMIN]
exports.updateProduct = async (req, res) => {
    try {
        const { name, description, origin, categoryId } = req.body;
        let { weights, images } = req.body;

        const updateData = { name, description, origin, categoryId };

        if (req.file) {
            updateData.imageUrl = `/uploads/products/${req.file.filename}`;
        } else if (req.body.imageUrl) {
            updateData.imageUrl = req.body.imageUrl;
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });

        // Cập nhật Weights (Xóa cũ thêm mới cho đơn giản)
        if (weights) {
            const parsedWeights = typeof weights === 'string' ? JSON.parse(weights) : weights;
            await ProductWeight.deleteMany({ productId: product._id });
            const weightDocs = parsedWeights.map(w => ({ ...w, productId: product._id }));
            await ProductWeight.insertMany(weightDocs);
        }

        // Cập nhật Images
        if (images) {
            const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
            await ProductImage.deleteMany({ productId: product._id });
            const imageDocs = parsedImages.map(img => ({ ...img, productId: product._id }));
            await ProductImage.insertMany(imageDocs);
        }

        res.json({ message: 'Cập nhật sản phẩm thành công!', product });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/products/:id - Xóa sản phẩm [ADMIN]
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });
        res.json({ message: 'Xóa sản phẩm thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
