const mongoose = require('mongoose');
const { Order, Product, OrderDetail, ProductWeight } = require('../models');
const ExcelJS = require('exceljs');

// GET /api/orders - Lấy tất cả đơn hàng [ADMIN]
exports.getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : {};
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            Order.find(query)
                .populate('userId', 'fullName email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Order.countDocuments(query)
        ]);

        const ordersWithDetails = await Promise.all(orders.map(async (o) => {
            try {
                const details = await OrderDetail.find({ orderId: o._id });
                const detailsWithInfo = await Promise.all(details.map(async (detail) => {
                    try {
                        const product = await Product.findById(detail.productId);
                        const image = await mongoose.model('ProductImage').findOne({ productId: detail.productId });
                        
                        const realName = product ? product.name : (detail.productName || 'Sản phẩm');
                        // SỬA Ở ĐÂY: Dùng imageUrl thay vì url/mainImage
                        const realImage = image ? image.imageUrl : (product ? product.imageUrl : null);

                        return {
                            ...detail.toObject(),
                            productName: realName,
                            productImage: realImage,
                            product: {
                                name: realName,
                                imageUrl: realImage
                            }
                        };
                    } catch (e) {
                        return { ...detail.toObject(), productName: detail.productName || 'Sản phẩm' };
                    }
                }));
                return { ...o, details: detailsWithInfo };
            } catch (e) {
                return { ...o, details: [] };
            }
        }));

        res.json({
            data: ordersWithDetails,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/orders/my-orders - Lấy đơn hàng của user hiện tại [USER]
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        
        const ordersWithDetails = await Promise.all(orders.map(async (o) => {
            try {
                const details = await OrderDetail.find({ orderId: o._id });
                const detailsWithInfo = await Promise.all(details.map(async (detail) => {
                    try {
                        const product = await Product.findById(detail.productId);
                        const image = await mongoose.model('ProductImage').findOne({ productId: detail.productId });
                        
                        const realName = product ? product.name : (detail.productName || 'Sản phẩm');
                        // SỬA Ở ĐÂY: Dùng imageUrl
                        const realImage = image ? image.imageUrl : (product ? product.imageUrl : null);

                        return {
                            ...detail.toObject(),
                            productName: realName,
                            productImage: realImage,
                            product: {
                                name: realName,
                                imageUrl: realImage
                            }
                        };
                    } catch (e) {
                        return { ...detail.toObject(), productName: detail.productName || 'Sản phẩm' };
                    }
                }));
                return { ...o, details: detailsWithInfo };
            } catch (err) {
                return { ...o, details: [] };
            }
        }));

        res.json(ordersWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/orders/user/:userId - Lấy đơn hàng theo userId [ADMIN]
exports.getOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId }).lean();
        const ordersWithDetails = await Promise.all(orders.map(async (o) => {
            const details = await OrderDetail.find({ orderId: o._id });
            const detailsWithInfo = await Promise.all(details.map(async (detail) => {
                const product = await Product.findById(detail.productId);
                const image = await mongoose.model('ProductImage').findOne({ productId: detail.productId });
                
                const realName = product ? product.name : (detail.productName || 'Sản phẩm');
                const realImage = image ? image.imageUrl : (product ? product.imageUrl : null);

                return {
                    ...detail.toObject(),
                    productName: realName,
                    productImage: realImage,
                    product: {
                        name: realName,
                        imageUrl: realImage
                    }
                };
            }));
            return { ...o, details: detailsWithInfo };
        }));
        res.json(ordersWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/orders/:id - Lấy chi tiết 1 đơn hàng
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'fullName email phone')
            .lean();
        
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });

        if (!req.user.roles.includes('ADMIN') && order.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này!' });
        }

        const details = await OrderDetail.find({ orderId: order._id });
        const detailsWithInfo = await Promise.all(details.map(async (detail) => {
            const product = await Product.findById(detail.productId);
            const image = await mongoose.model('ProductImage').findOne({ productId: detail.productId });
            
            const realName = product ? product.name : (detail.productName || 'Sản phẩm');
            const realImage = image ? image.imageUrl : (product ? product.imageUrl : null);

            return {
                ...detail.toObject(),
                product: {
                    name: realName,
                    imageUrl: realImage
                },
                productName: realName,
                productImage: realImage
            };
        }));
        
        res.json({ ...order, details: detailsWithInfo });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/orders - Tạo đơn hàng mới với TRANSACTION [USER]
exports.createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            shippingName,
            shippingPhone,
            shippingEmail,
            shippingAddress,
            paymentMethod,
            items
        } = req.body;

        const userId = req.user.id;

        let totalAmount = 0;
        const orderDetails = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                throw new Error(`Sản phẩm với ID ${item.productId} không tồn tại!`);
            }

            // Tìm chi tiết khối lượng/giá (Tiered pricing)
            // Parse weight từ "100g", "200g" -> 100, 200 (hoặc nếu là số thì dùng thẳng)
            const weightValue = typeof item.selectedWeight === 'string' 
                ? parseInt(item.selectedWeight) 
                : item.selectedWeight;

            const pw = await ProductWeight.findOne({ productId: item.productId, weight: weightValue }).session(session);
            if (!pw) {
                throw new Error(`Sản phẩm ${product.name} không có tùy chọn khối lượng ${item.selectedWeight}!`);
            }

            if (pw.stock < item.quantity) {
                throw new Error(`Số lượng trong kho của ${product.name} (${item.selectedWeight}) không đủ!`);
            }

            // Trừ tồn kho ở bảng ProductWeight (vì Product không có stock)
            pw.stock -= item.quantity;
            await pw.save({ session });

            const itemPrice = pw.price;
            totalAmount += itemPrice * item.quantity;

            orderDetails.push({
                productId: item.productId,
                productName: product.name,
                price: itemPrice,
                quantity: item.quantity,
                weight: weightValue,
                subtotal: itemPrice * item.quantity // Cần thêm field subtotal theo model OrderDetail
            });
        }

        const order = new Order({
            userId,
            totalAmount,
            shippingName,
            shippingPhone,
            shippingEmail,
            shippingAddress,
            paymentMethod,
            status: 'Pending',
            orderDate: new Date()
        });

        await order.save({ session });

        // Lưu details vào bảng riêng
        for (const detail of orderDetails) {
            const orderDetail = new OrderDetail({
                orderId: order._id,
                ...detail
            });
            await orderDetail.save({ session });
        }

        await session.commitTransaction();
        res.status(201).json(order);
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

// PUT /api/orders/:id/status - Cập nhật trạng thái [ADMIN]
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/orders/:id - Hủy đơn hàng [USER/ADMIN]
exports.cancelOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
        }

        const details = await OrderDetail.find({ orderId: order._id }).session(session);

        if (!req.user.roles.includes('ADMIN')) {
            if (order.userId.toString() !== req.user.id) {
                await session.abortTransaction();
                return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này!' });
            }
            if (order.status !== 'Pending') {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Chỉ có thể hủy đơn hàng đang ở trạng thái Pending!' });
            }
        }

        for (const item of details) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }

        order.status = 'Cancelled';
        await order.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Hủy đơn hàng thành công!', order });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const allOrders = await Order.find({ status: { $in: ['Paid', 'Completed'] } });
        const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalUsers = await mongoose.model('User').countDocuments();
        
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            totalProducts,
            latestOrders,
            ordersThisMonth,
            ordersLastMonth,
            revenueThisMonth,
            revenueLastMonth
        ] = await Promise.all([
            Product.countDocuments(),
            Order.find()
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .limit(5),
            Order.countDocuments({ createdAt: { $gte: startOfCurrentMonth } }),
            Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
            Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ])
        ]);

        const calcTrend = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        const totalRevLastMonth = revenueLastMonth[0]?.total || 0;
        const totalRevThisMonth = revenueThisMonth[0]?.total || 0;

        res.json({
            totalOrders,
            totalRevenue,
            totalUsers,
            totalProducts,
            latestOrders,
            orderTrend: calcTrend(ordersThisMonth, ordersLastMonth),
            revenueTrend: calcTrend(totalRevThisMonth, totalRevLastMonth),
            totalRevThisMonth,
            totalRevLastMonth
        });
    } catch (error) {
        console.error('Lỗi thống kê dashboard:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.exportOrdersToExcel = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'fullName email');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        worksheet.columns = [
            { header: 'Order ID', key: '_id', width: 25 },
            { header: 'Customer', key: 'customer', width: 25 },
            { header: 'Amount', key: 'totalAmount', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date', key: 'createdAt', width: 20 }
        ];

        orders.forEach(order => {
            worksheet.addRow({
                _id: order._id.toString(),
                customer: order.userId ? order.userId.fullName : 'Guest',
                totalAmount: order.totalAmount,
                status: order.status,
                createdAt: order.createdAt
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
