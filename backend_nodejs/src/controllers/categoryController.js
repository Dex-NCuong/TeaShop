const { Category } = require('../models');

// GET /api/categories - Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/categories/:id - Lấy 1 danh mục
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục!' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/categories - Tạo danh mục [ADMIN]
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const exists = await Category.findOne({ name });
        if (exists) return res.status(400).json({ message: 'Tên danh mục đã tồn tại!' });

        const category = new Category({ name, description });
        await category.save();
        res.status(201).json({ message: 'Tạo danh mục thành công!', category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/categories/:id - Cập nhật danh mục [ADMIN]
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục!' });
        res.json({ message: 'Cập nhật danh mục thành công!', category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/categories/:id - Xóa danh mục [ADMIN]
exports.deleteCategory = async (req, res) => {
    try {
        const { Product } = require('../models');
        // Bước quan trọng: Kiểm tra xem có sản phẩm nào đang thuộc danh mục này không
        // Điều này ngăn chặn việc xóa danh mục làm cho các sản phẩm bị "mồ côi" (không có danh mục)
        const productCount = await Product.countDocuments({ categoryId: req.params.id });
        if (productCount > 0) {
            return res.status(400).json({
                message: `Không thể xóa! Danh mục này đang có ${productCount} sản phẩm.`
            });
        }

        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục!' });
        res.json({ message: 'Xóa danh mục thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
