const crypto = require('crypto');
const moment = require('moment');
const { Order, OrderDetail, Product } = require('../models');

// Hàm sắp xếp các thuộc tính của object theo thứ tự bảng chữ cái (alphabetical order)
function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            str.push(key);
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = obj[str[key]];
    }
    return sorted;
}

// Hàm tạo yêu cầu thanh toán gửi sang VNPAY
exports.createPayment = async (req, res) => {
    try {
        const { amount, orderId, orderData, bankCode, orderInfo } = req.body;
        const txnRef = moment().format('YYYYMMDDHHmmss');
        const date = moment().format('YYYYMMDDHHmmss');

        const tmnCode = process.env.VNP_TMN_CODE; 
        const secretKey = process.env.VNP_HASH_SECRET;

        let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5173/payment-result';

        let finalAmount = amount;

        // Trường hợp 1: Đã có đơn hàng từ trước (Chuẩn)
        if (orderId) {
            const order = await Order.findById(orderId);
            if (order) {
                // Lưu txnRef để đối soát khi VNPAY trả kết quả về
                order.vnpTxnRef = txnRef;
                await order.save();
                finalAmount = order.totalAmount; // Dùng tiền thực tế trong DB cho an toàn
            }
        } 
        // Trường hợp 2: Tạo đơn hàng mới trực tiếp (Nếu cần)
        else if (orderData) {
            const newOrder = new Order({
                userId: orderData.userId,
                totalAmount: amount,
                shippingFee: orderData.shippingInfo?.shippingFee || 0,
                shippingName: orderData.shippingInfo?.fullName,
                shippingPhone: orderData.shippingInfo?.phone,
                shippingEmail: orderData.shippingInfo?.email,
                shippingAddress: orderData.shippingInfo?.address,
                paymentMethod: 'VNPAY',
                status: 'Pending',
                vnpTxnRef: txnRef,
                orderDate: new Date()
            });
            await newOrder.save();

            // Lưu các mặt hàng
            for (const item of orderData.items || []) {
                const product = await Product.findById(item.productId);
                await OrderDetail.create({
                    orderId: newOrder._id,
                    productId: item.productId,
                    productName: product ? product.name : 'Sản phẩm không xác định',
                    weight: item.weight || item.selectedWeight || 0,
                    price: item.price || 0,
                    quantity: item.quantity,
                    subtotal: (item.price || 0) * item.quantity
                });
            }
            finalAmount = amount;
        }

        if (!finalAmount) {
            throw new Error("Số tiền thanh toán (amount) không hợp lệ!");
        }

        // Cấu hình các tham số cần thiết để gửi sang VNPAY
        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = txnRef;
        vnp_Params['vnp_OrderInfo'] = (orderInfo || 'Thanh_toan_don_hang').replace(/\s/g, '_');
        vnp_Params['vnp_OrderType'] = 'other'; 
        vnp_Params['vnp_Amount'] = finalAmount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = req.ip || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = date;
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        // Sắp xếp và băm (hash)
        vnp_Params = sortObject(vnp_Params);
        
        let signData = Object.keys(vnp_Params)
            .sort()
            .map((key) => {
                let value = vnp_Params[key];
                if (value === null || value === undefined) return '';
                return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
            })
            .filter(item => item !== '')
            .join('&');

        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex").toUpperCase();
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(vnp_Params)) {
            searchParams.append(key, value);
        }
        const finalUrl = vnpUrl + '?' + searchParams.toString();

        res.json({ url: finalUrl });
    } catch (error) {
        console.error('Lỗi tạo VNPAY:', error);
        res.status(500).json({ message: error.message });
    }
};

// Hàm xử lý kết quả trả về từ VNPAY sau khi người dùng thực hiện thanh toán
exports.vnpayReturn = async (req, res) => {
    try {
        let vnp_Params = req.query;
        let secureHash = vnp_Params['vnp_SecureHash'];

        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];

        vnp_Params = sortObject(vnp_Params);
        const secretKey = process.env.VNP_HASH_SECRET;
        
        let signData = Object.keys(vnp_Params)
            .sort()
            .map((key) => {
                let value = vnp_Params[key];
                if (value === null || value === undefined) return '';
                return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
            })
            .filter(item => item !== '')
            .join('&');

        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

        if (secureHash.toLowerCase() === signed.toLowerCase()) {
            // Kiểm tra xem dữ liệu trong db có khớp với dữ liệu vnpay trả về không
            const responseCode = vnp_Params['vnp_ResponseCode'];
            const txnRef = vnp_Params['vnp_TxnRef'];
            
            if (responseCode === "00") {
                // Thanh toán thành công, cập nhật đơn hàng
                await Order.findOneAndUpdate({ vnpTxnRef: txnRef }, { status: 'Paid' });
                res.status(200).json({ status: 'success', code: responseCode });
            } else {
                // Thanh toán thất bại
                res.status(200).json({ status: 'failed', code: responseCode });
            }
        } else {
            console.log(">>> SIGNATURE MISMATCH!");
            res.status(200).json({ status: 'failed', message: 'Checksum failed' });
        }
    } catch (error) {
        console.error('Lỗi xử lý VNPAY:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
