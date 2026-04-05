const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true }, // Lưu tên để backup nếu sp bị xóa
    weight: { type: Number, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
