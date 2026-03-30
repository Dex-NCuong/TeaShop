const mongoose = require('mongoose');

const productWeightSchema = new mongoose.Schema({
    weight: { type: Number, required: true }, // gram
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    origin: String,
    imageUrl: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    weights: [productWeightSchema]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
