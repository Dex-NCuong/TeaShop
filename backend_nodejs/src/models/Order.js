const mongoose = require('mongoose');

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
    vnpTxnRef: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
