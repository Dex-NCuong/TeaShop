const mongoose = require('mongoose');

const brewingGuideProductSchema = new mongoose.Schema({
    brewingGuideId: { type: mongoose.Schema.Types.ObjectId, ref: 'BrewingGuide', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }
}, { timestamps: true });

// Tránh lập lại hướng dẫn cho cùng 1 sản phẩm
brewingGuideProductSchema.index({ brewingGuideId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('BrewingGuideProduct', brewingGuideProductSchema);
