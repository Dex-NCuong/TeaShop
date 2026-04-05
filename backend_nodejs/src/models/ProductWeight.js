const mongoose = require('mongoose');

const productWeightSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    weight: { type: Number, required: true }, // gram
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProductWeight', productWeightSchema);
