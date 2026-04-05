const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    origin: String,
    imageUrl: String, // Ảnh đại diện chính
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Liên kết ảo sang bảng ProductWeight
productSchema.virtual('weights', {
    ref: 'ProductWeight',
    localField: '_id',
    foreignField: 'productId'
});

// Liên kết ảo sang bảng ProductImage
productSchema.virtual('images', {
    ref: 'ProductImage',
    localField: '_id',
    foreignField: 'productId'
});

module.exports = mongoose.model('Product', productSchema);
