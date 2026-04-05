const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket/socketHandler');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        // Tạo HTTP server từ Express app
        const httpServer = http.createServer(app);

        // Khởi tạo Socket.IO
        const io = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || '*',
                methods: ['GET', 'POST']
            }
        });

        // Lưu io vào app để controllers dùng được (req.app.get('io'))
        app.set('io', io);

        // Đăng ký socket events
        initSocket(io);

        // Lắng nghe kết nối
        httpServer.listen(PORT, () => {
            console.log(`🚀 Node.js Server is running on port ${PORT}`);
            console.log(`🔌 Socket.IO is ready`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
