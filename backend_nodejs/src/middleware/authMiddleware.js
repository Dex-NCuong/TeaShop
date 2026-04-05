const jwt = require('jsonwebtoken');
const { UserRole, Role } = require('../models');

/**
 * Middleware xác thực JWT token
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy token. Vui lòng đăng nhập!' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // Truy vấn thêm ROLES từ bảng riêng để đảm bảo tính thời gian thực
        const userRoles = await UserRole.find({ userId: decoded.id }).populate('roleId');
        const roles = userRoles.map(ur => ur.roleId.name);

        req.user = { ...decoded, roles }; // Gán đầy đủ thông tin + roles
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
};

/**
 * Middleware phân quyền theo role
 * @param {...string} roles - Danh sách roles được phép truy cập (VD: 'ADMIN', 'USER')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Chưa xác thực!' });
        }

        const hasRole = roles.some(role => req.user.roles && req.user.roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này!' });
        }

        next();
    };
};

module.exports = { authenticate, authorize };
