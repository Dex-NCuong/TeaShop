const mongoose = require('mongoose');

const productImageSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    imageUrl: { type: String, required: true },
    isMain: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProductImage', productImageSchema);
