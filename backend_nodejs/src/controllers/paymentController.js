const crypto = require('crypto');
const moment = require('moment');
const { Order } = require('../models');
require('dotenv').config();

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

exports.createPayment = async (req, res) => {
    try {
        const { amount, orderData } = req.body;
        const txnRef = moment().format('YYYYMMDDHHmmss');
        const date = moment().format('YYYYMMDDHHmmss');

        // LẤY TRỰC TIẾP TỪ .ENV (BỘ MÃ GIỐNG SPRING BOOT CỦA BẠN)
        const tmnCode = process.env.VNP_TMN_CODE; 
        const secretKey = process.env.VNP_HASH_SECRET;

        let vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
        const returnUrl = 'http://localhost:5173/payment-result';

        const order = new Order({
            userId: orderData.userId,
            totalAmount: amount,
            shippingFee: orderData.shippingInfo.shippingFee || 0,
            shippingName: orderData.shippingInfo.fullName,
            shippingPhone: orderData.shippingInfo.phone,
            shippingEmail: orderData.shippingInfo.email,
            shippingAddress: orderData.shippingInfo.address,
            paymentMethod: 'VNPAY',
            status: 'Pending',
            vnpTxnRef: txnRef,
            orderDate: new Date()
        });
        await order.save();

        // LƯU CHI TIẾT ĐƠN HÀNG VÀO BẢNG ORDERDETAILS (MỚI CHUẨN HÓA)
        const { OrderDetail, Product } = require('../models');
        for (const item of orderData.items) {
            const product = await Product.findById(item.productId);
            await OrderDetail.create({
                orderId: order._id,
                productId: item.productId,
                productName: product ? product.name : 'Sản phẩm không xác định',
                weight: item.weight || 0,
                price: item.price,
                quantity: item.quantity
            });
        }

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = txnRef;
        vnp_Params['vnp_OrderInfo'] = 'Thanh_toan_don_hang'; // Không dấu, không cách
        vnp_Params['vnp_OrderType'] = 'other'; 
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = date;
        vnp_Params['vnp_BankCode'] = 'NCB'; 

        vnp_Params = sortObject(vnp_Params);
        
        let signData = Object.keys(vnp_Params)
            .sort()
            .map((key) => {
                let value = vnp_Params[key];
                if (value === null || value === undefined) return '';
                // Quan trọng: Phải encoded giá trị và đổi %20 thành + giống Java
                return `${key}=${encodeURIComponent(value).replace(/%20/g, '+')}`;
            })
            .filter(item => item !== '')
            .join('&');

        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex").toUpperCase();
        
        vnp_Params['vnp_SecureHash'] = signed;
        
        // Tạo URL cuối cùng cũng phải dùng cùng một kiểu encode
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(vnp_Params)) {
            searchParams.append(key, value);
        }
        const finalUrl = vnpUrl + '?' + searchParams.toString();

        console.log(">>> FINAL VNPAY URL (CANONICAL):", finalUrl);
        res.json({ url: finalUrl });
    } catch (error) {
        console.error('Lỗi tạo VNPAY:', error);
        res.status(500).json({ message: error.message });
    }
};

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
