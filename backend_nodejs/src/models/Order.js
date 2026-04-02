const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    orderDate: { type: Date, default: Date.now },
    totalAmount: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    status: { type: String, default: 'Pending' },
    shippingName: String,
    shippingPhone: String,
    shippingEmail: String,
    shippingAddress: String,
    paymentMethod: String,
    vnpTxnRef: String,
    details: [orderDetailSchema]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
