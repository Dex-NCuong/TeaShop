const { Product, Category, Order, User } = require('../models');
const chatbotService = require('../services/chatbotService');

const translateStatus = (status) => {
    const map = {
        'Pending': 'Chờ xác nhận',
        'Processing': 'Đang chuẩn bị hàng',
        'Completed': 'Giao hàng thành công',
        'Cancelled': 'Đã hủy'
    };
    return map[status] || status;
};

exports.chatbotSearch = async (req, res) => {
    try {
        const query = req.query.query || "";
        const userId = req.query.userId;
        const queryLower = query.toLowerCase().trim();

        const advancedResponse = chatbotService.findAdvancedResponse(queryLower);
        const responseData = {};

        // 1. Order search by ID
        if (advancedResponse && advancedResponse.orderId) {
            // Check if it's a valid ObjectId, otherwise it's likely a numeric ID from legacy system
            // In Mongo, IDs are 24-chars hex. If orderId is number, we might need a numeric field or just tell it's not found
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(advancedResponse.orderId)) {
                const order = await Order.findById(advancedResponse.orderId);
                if (order) {
                    responseData.message = `📦 Đơn hàng #${order._id} đang ở trạng thái: **${translateStatus(order.status)}**. Tổng tiền: ${new Intl.NumberFormat('vi-VN').format(order.totalAmount)}đ.`;
                    responseData.suggestions = ["Kiểm tra đơn khác", "Tìm trà"];
                    return res.json(responseData);
                }
            }
        }

        // 2. Intents
        if (advancedResponse && advancedResponse.message) {
            if (queryLower.includes("ngon") || queryLower.includes("tìm trà") || queryLower.includes("gợi ý")) {
                // fall through
            } else {
                return res.json(advancedResponse);
            }
        }

        // 3. User Orders
        if (queryLower.includes("kiểm tra đơn hàng") || queryLower.includes("đơn hàng của tôi")) {
            if (userId) {
                const userOrders = await Order.find({ userId }).sort({ _id: -1 }).limit(3);
                if (userOrders.length > 0) {
                    let msg = `📦 Bạn có **${userOrders.length}** đơn gần nhất:\n\n`;
                    userOrders.forEach(o => msg += `- **#${o._id}**: ${translateStatus(o.status)} (${new Intl.NumberFormat('vi-VN').format(o.totalAmount)}đ)\n`);
                    return res.json({ message: msg, suggestions: ["Tìm trà ngon", "Liên hệ hỗ trợ"], reasoning: "Tôi đã tra cứu danh sách đơn hàng của bạn." });
                }
            } else {
                return res.json({ message: "Vui lòng **Đăng nhập** để kiểm tra đơn hàng hoặc nhập mã đơn (#...) trực tiếp nhé!", suggestions: ["Đăng nhập", "Tìm trà"] });
            }
        }

        // 4. DB Search
        let cleanedQuery = queryLower.replace(/^(tìm|mua|xem|cho|tôi|cần|muốn|là|gì|đâu|nào|hỏi về|thông tin về|biết về|bán|có|trà|ai|kiểm tra|check|dưới|khoảng|tầm|giá|rẻ)\s+/i, "");
        const keywords = cleanedQuery.split(/\s+/).filter(k => k.length > 0);
        
        let mongoQuery = {};
        if (keywords.length > 0) {
            // Basic regex search for keywords in name or description
            mongoQuery.$and = keywords.map(k => ({
                $or: [
                    { name: { $regex: k, $options: 'i' } },
                    { description: { $regex: k, $options: 'i' } }
                ]
            }));
        }

        if (advancedResponse && advancedResponse.maxPrice) {
            mongoQuery.price = { $lte: advancedResponse.maxPrice };
        }

        let products = await Product.find(mongoQuery).populate('categoryId').limit(15);

        if (advancedResponse && advancedResponse.maxPrice) {
            products = products.sort((a,b) => b.price - a.price);
        }

        const formattedProducts = products.slice(0, 10).map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            imageUrl: p.imageUrl,
            origin: p.origin,
            categoryName: p.categoryId ? p.categoryId.name : null,
            weights: p.weights
        }));

        res.json({
            ...responseData,
            message: responseData.message || (formattedProducts.length > 0 ? `Dạ, đây là các sản phẩm phù hợp:` : `Xin lỗi, tôi chưa tìm thấy "${query}".`),
            products: formattedProducts,
            hasMore: products.length > 10,
            total: products.length,
            suggestions: ["Trà Ô Long", "Trà Sen Tuyết", "Cách pha trà"]
        });

    } catch (error) {
        console.error("Chatbot Controller Error:", error);
        res.status(500).json({ message: "Hệ thống bận, vui lòng thử lại sau! 🍵" });
    }
};
