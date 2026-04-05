const { User, Role, UserRole } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/register - Đăng ký tài khoản
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body;

        // Kiểm tra email
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã được sử dụng!' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await user.save();

        // Gán quyền USER mặc định cho người mới
        const userRole = await Role.findOne({ name: 'USER' });
        if (userRole) {
            await UserRole.create({ userId: user._id, roleId: userRole._id });
        }

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/auth/login - Đăng nhập
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });
        }

        // Lấy quyền hạn của người dùng từ bảng riêng
        const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
        const roles = userRoles.map(ur => ur.roleId.name);

        const token = jwt.sign(
            { id: user._id, roles },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email, roles, profileImage: user.profileImage }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/me - Lấy thông tin cá nhân [USER]
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').lean();
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user!' });
        
        const userRoles = await UserRole.find({ userId: user._id }).populate('roleId');
        user.roles = userRoles.map(ur => ur.roleId.name);
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/auth/me - Cập nhật thông tin cá nhân [USER]
exports.updateMe = async (req, res) => {
    try {
        const { fullName, phone, address, province, district, ward } = req.body;
        const updateData = { fullName, phone, address, province, district, ward };

        // Nếu có upload ảnh đại diện
        if (req.file) {
            updateData.profileImage = `/uploads/avatars/${req.file.filename}`;
        }

        const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select('-password');
        res.json({ message: 'Cập nhật thông tin thành công!', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/auth/change-password - Đổi mật khẩu [USER]
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/auth/users - Lấy danh sách tất cả user [ADMIN]
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find().select('-password').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
            User.countDocuments()
        ]);

        res.json({ data: users, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/auth/users/:id/role - Cập nhật role của user [ADMIN]
exports.updateUserRole = async (req, res) => {
    try {
        const { roles } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { roles }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user!' });
        res.json({ message: 'Cập nhật quyền thành công!', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/auth/users/:id - Xóa user [ADMIN]
exports.deleteUser = async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình!' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user!' });
        res.json({ message: 'Xóa user thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
