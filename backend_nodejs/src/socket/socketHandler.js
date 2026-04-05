const jwt = require('jsonwebtoken');

/**
 * Khởi tạo Socket.IO với xác thực JWT
 * @param {import('socket.io').Server} io
 */
const initSocket = (io) => {
    // Middleware xác thực socket bằng JWT (optional - client gửi token khi connect)
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
                socket.user = decoded; // { id, roles }
            } catch {
                // Token không hợp lệ, vẫn cho kết nối nhưng không có thông tin user
                socket.user = null;
            }
        } else {
            socket.user = null;
        }
        next();
    });

    io.on('connection', (socket) => {
        const userId = socket.user?.id || 'Khách';
        const roles = socket.user?.roles || [];
        console.log(`🔌 Socket connected: ${socket.id} | User: ${userId}`);

        // Tự động join room theo user (để nhận thông báo cá nhân)
        if (socket.user?.id) {
            socket.join(`user-${socket.user.id}`);
        }

        // Admin join phòng admin để nhận thông báo mới đơn hàng
        if (roles.includes('ADMIN')) {
            socket.join('admin-room');
            console.log(`👑 Admin joined admin-room: ${socket.id}`);
        }

        // --- Events từ client ---

        // Client gửi tin nhắn chat (nếu có chat realtime)
        socket.on('send-message', (data) => {
            // Broadcast tin nhắn đến tất cả mọi người (hoặc room cụ thể)
            io.emit('receive-message', {
                from: socket.user?.id || 'Anonymous',
                message: data.message,
                timestamp: new Date().toISOString()
            });
        });

        // Client yêu cầu join một room cụ thể
        socket.on('join-room', (roomName) => {
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room: ${roomName}`);
        });

        // Client rời room
        socket.on('leave-room', (roomName) => {
            socket.leave(roomName);
        });

        // Client ping để kiểm tra kết nối
        socket.on('ping', (callback) => {
            if (typeof callback === 'function') callback({ status: 'pong', time: Date.now() });
        });

        socket.on('disconnect', (reason) => {
            console.log(`❌ Socket disconnected: ${socket.id} | Lý do: ${reason}`);
        });
    });

    console.log('✅ Socket.IO đã khởi tạo thành công!');
};

module.exports = { initSocket };
