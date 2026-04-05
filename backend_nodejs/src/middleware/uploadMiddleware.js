const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu file vào disk
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = req.uploadFolder || 'misc'; // products | avatars | misc
        const folderPath = path.join(uploadDir, subFolder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Bộ lọc chỉ cho phép ảnh
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new Error('Chỉ được phép upload file ảnh (jpeg, jpg, png, gif, webp)!'));
};

// Upload ảnh đơn (1 file)
const uploadSingleImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Tối đa 5MB
    fileFilter: imageFileFilter
}).single('image');

// Upload nhiều ảnh (tối đa 10 file)
const uploadMultipleImages = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageFileFilter
}).array('images', 10);

// Middleware đặt subfolder trước khi upload
const setUploadFolder = (folder) => (req, res, next) => {
    req.uploadFolder = folder;
    next();
};

// Xử lý lỗi multer
const handleUploadError = (uploadFn) => (req, res, next) => {
    uploadFn(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File quá lớn! Kích thước tối đa là 5MB.' });
            }
            return res.status(400).json({ message: `Lỗi upload: ${err.message}` });
        }
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

module.exports = {
    uploadSingleImage,
    uploadMultipleImages,
    setUploadFolder,
    handleUploadError
};
