const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Tiêu đề bài viết
    summary: { type: String }, // Tóm tắt ngắn gọn nội dung
    content: { type: String, required: true }, // Nội dung chi tiết bài viết (HTML)
    imageUrl: { type: String }, // Đường dẫn ảnh đại diện cho bài viết
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true }, // Mã danh mục bài viết (quan hệ)
    views: { type: Number, default: 0 } // Số lượt xem bài viết
}, { timestamps: true }); // Tự động thêm ngày tạo (createdAt) và ngày cập nhật (updatedAt)

module.exports = mongoose.model('Blog', blogSchema);
