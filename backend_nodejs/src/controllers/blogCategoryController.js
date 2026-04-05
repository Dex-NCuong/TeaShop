const { BlogCategory } = require('../models');

exports.getAllBlogCategories = async (req, res) => {
    try {
        const categories = await BlogCategory.find();
        res.json({ data: categories });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBlogCategoryById = async (req, res) => {
    try {
        const category = await BlogCategory.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục blog!' });
        res.json({ data: category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBlogCategory = async (req, res) => {
    try {
        const category = new BlogCategory(req.body);
        await category.save();
        res.status(201).json({ message: 'Thêm danh mục blog thành công!', category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục blog!' });
        res.json({ message: 'Cập nhật danh mục blog thành công!', category });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Không tìm thấy danh mục blog!' });
        res.json({ message: 'Xóa danh mục blog thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
