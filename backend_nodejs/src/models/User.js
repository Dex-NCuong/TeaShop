const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    address: String,
    province: String,
    district: String,
    ward: String,
    profileImage: String,
    roles: [String] // ["USER", "ADMIN"]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
