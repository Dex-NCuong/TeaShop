const path = require('path');
const fs = require('fs');

/**
 * POST /api/upload/image - Upload 1 ảnh
 * Body: form-data với field "image"
 */
exports.uploadImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Không có file được upload!' });
    }

    const folder = req.uploadFolder || 'misc';
    const fileUrl = `/uploads/${folder}/${req.file.filename}`;

    res.status(201).json({
        message: 'Upload ảnh thành công!',
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
    });
};

/**
 * POST /api/upload/images - Upload nhiều ảnh (tối đa 10)
 * Body: form-data với field "images"
 */
exports.uploadImages = (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'Không có file được upload!' });
    }

    const folder = req.uploadFolder || 'misc';
    const files = req.files.map(file => ({
        url: `/uploads/${folder}/${file.filename}`,
        filename: file.filename,
        originalName: file.originalname,
        size: file.size
    }));

    res.status(201).json({
        message: `Upload ${files.length} ảnh thành công!`,
        files
    });
};

/**
 * DELETE /api/upload/:folder/:filename - Xóa file đã upload [ADMIN]
 */
exports.deleteFile = (req, res) => {
    const { folder, filename } = req.params;

    // Chỉ cho phép các folder hợp lệ để chống path traversal
    const allowedFolders = ['products', 'avatars', 'misc'];
    if (!allowedFolders.includes(folder)) {
        return res.status(400).json({ message: 'Thư mục không hợp lệ!' });
    }

    const filePath = path.join(__dirname, '../uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File không tồn tại!' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Xóa file thành công!' });
};
