const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String },
    content: { type: String, required: true },
    imageUrl: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true },
    views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
