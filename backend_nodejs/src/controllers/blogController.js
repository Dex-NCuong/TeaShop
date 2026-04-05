const { Blog } = require('../models');

exports.getAllBlogs = async (req, res) => {
    try {
        const { categoryId } = req.query;
        const query = categoryId ? { categoryId } : {};
        const blogs = await Blog.find(query).populate('categoryId').sort({ createdAt: -1 });
        res.json({ data: blogs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('categoryId');
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết!' });
        blog.views += 1;
        await blog.save();
        res.json({ data: blog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBlog = async (req, res) => {
    try {
        const blog = new Blog(req.body);
        await blog.save();
        res.status(201).json({ message: 'Thêm bài viết thành công!', blog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết!' });
        res.json({ message: 'Cập nhật bài viết thành công!', blog });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) return res.status(404).json({ message: 'Không tìm thấy bài viết!' });
        res.json({ message: 'Xóa bài viết thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
