// Danh sách các câu trả lời mặc định dựa trên ý định (intent) của người dùng
const INTENT_RESPONSES = {
    "chào": "Chào bạn! 👋 WebTra rất vui được hỗ trợ bạn. Bạn muốn tìm trà thơm, xem bài viết hay cần hướng dẫn pha trà?",
    "hi": "Chào bạn! 👋 WebTra rất vui được hỗ trợ bạn.",
    "hello": "Chào bạn! 👋 WebTra rất vui được hỗ trợ bạn.",
    "alo": "Chào bạn! 👋 WebTra rất vui được hỗ trợ bạn.",
    "địa chỉ": "📍 WebTra tọa lạc tại: 123 Đường Trà, Quận 1, TP. Hồ Chí Minh. Rất mong được đón tiếp bạn!",
    "liên hệ": "📞 Bạn có thể gọi Hotline: 0123.456.789 hoặc nhắn tin qua Fanpage WebTra nhé.",
    "sđt": "📞 Hotline của chúng tôi là: 0123.456.789.",
    "facebook": "🌐 Fanpage chính thức: facebook.com/webtra.vn. Bạn inbox để được tư vấn kĩ hơn nhé!",
    "ship": "🚚 WebTra giao hàng toàn quốc! Miễn phí ship cho đơn hàng trên 500k. Nội thành HCM nhận hàng trong 24h.",
    "thanh toán": "💳 Chúng tôi hỗ trợ thanh toán COD (khi nhận hàng), chuyển khoản ngân hàng hoặc ví điện tử MoMo/ZaloPay.",
    "cảm ơn": "Dạ không có gì ạ! 🥰 Chúc bạn một ngày tràn đầy năng lượng và thưởng trà thật ngon.",
    "giá": "Mỗi loại trà có mức giá khác nhau tùy trọng lượng. Bạn hãy nhập tên trà (vd: Ô long) để tôi báo giá chi tiết nhé!",
    "khuyến mãi": "🎁 WebTra đang có ưu đãi giảm 10% cho đơn hàng đầu tiên khi đăng ký thành viên đó ạ!",
    "ngon": "Trà WebTra đều được tuyển chọn kỹ lưỡng từ các vùng trà nổi tiếng. Bạn thử dùng Trà Xanh Thái Nguyên hoặc Ô Long xem sao nhé!",
    "bán gì": "Dạ, WebTra chuyên cung cấp các loại trà đặc sản như Trà Xanh, Ô Long, Trà Sen, Trà Nhài và phụ kiện pha trà cao cấp."
};

// Hàm lấy danh sách các gợi ý (suggestions) dựa trên ý định của người dùng
const getSuggestionsForIntent = (intent) => {
    switch (intent) {
        case "chào": case "hi": case "hello":
            return ["Tìm trà ngon", "Trà dưới 500k", "Khuyến mãi"];
        case "giá":
            return ["Trà Thái Nguyên", "Trà Ô long", "Dưới 200k"];
        default:
            return ["Sản phẩm mới", "Hướng dẫn pha trà", "Liên hệ"];
    }
};

// Thuật toán tính khoảng cách Levenshtein để so sánh độ tương đồng giữa hai chuỗi văn bản
// Giúp nhận diện từ viết sai chính tả (ví dụ: "tra" và "trà")
const calculateLevenshteinDistance = (s1, s2) => {
    // Tạo ma trận 2 chiều (dp table) để lưu kết quả trung gian
    const dp = Array(s1.length + 1).fill(null).map(() => Array(s2.length + 1).fill(0));
    
    // Khởi tạo hàng đầu tiên và cột đầu tiên
    for (let i = 0; i <= s1.length; i++) dp[i][0] = i;
    for (let j = 0; j <= s2.length; j++) dp[0][j] = j;
    
    // Duyệt qua từng ký tự của hai chuỗi
    for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
            // Nếu hai ký tự giống nhau, chi phí (cost) là 0, ngược lại là 1
            const cost = (s1.charAt(i - 1) === s2.charAt(j - 1)) ? 0 : 1;
            
            // Tính giá trị nhỏ nhất từ 3 hướng: xóa, thêm, hoặc thay thế ký tự
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,      // Xóa ký tự
                dp[i][j - 1] + 1,      // Thêm ký tự
                dp[i - 1][j - 1] + cost // Thay thế ký tự
            );
        }
    }
    // Trả về giá trị ở ô cuối cùng - chính là số bước biến đổi tối thiểu
    return dp[s1.length][s2.length];
};

// Trích xuất ngưỡng giá từ câu hỏi của người dùng (ví dụ: "dưới 500k", "tầm 1 triệu")
const extractPriceThreshold = (query) => {
    // Biểu thức chính quy (Regex) để tìm các cụm từ liên quan đến giá:
    // Nhóm 1: tiền tố (dưới, tầm, khoảng...)
    // Nhóm 2: số tiền (con số có thể có dấu chấm)
    // Nhóm 3: đơn vị (k, tr, triệu, đ...)
    const pattern = /(dưới|tầm|khoảng|giá|rẻ)?\s*(\d+[.\d]*)\s*(k|tr|triệu|đ|vnđ)?/i;
    const match = query.match(pattern);
    if (!match) return null;

    let numStr = match[2].replace(/\./g, ''); // Xóa dấu chấm phân cách hàng nghìn nếu có
    let unit = match[3];
    let prefix = match[1];

    if (!prefix && !unit) return null; // Tránh bắt nhầm các số ngẫu nhiên không phải giá

    let value = parseFloat(numStr);
    
    // Quy đổi đơn vị về con số chuẩn (VND)
    if (unit) {
        unit = unit.toLowerCase();
        if (unit === 'k') value *= 1000;
        else if (unit === 'tr' || unit === 'triệu') value *= 1000000;
    } else if (value < 1000) {
        // Nếu không có đơn vị mà số nhỏ (vd: "dưới 500"), tự hiểu là k
        value *= 1000;
    }
    return value;
};

// Tìm câu trả lời nâng cao bằng cách kết hợp nhận diện ý định, mã đơn hàng và lọc giá
const findAdvancedResponse = (query) => {
    const lowerQuery = query.toLowerCase().trim();
    const result = {};

    const orderPattern = /(đơn hàng|mã đơn|#)\s*(\d+)/i;
    const orderMatch = lowerQuery.match(orderPattern);
    if (orderMatch) {
        result.orderId = parseInt(orderMatch[2]);
        result.reasoning = `Tôi sẽ kiểm tra trạng thái đơn hàng #${orderMatch[2]} cho bạn.`;
        return result;
    }

    const maxPrice = extractPriceThreshold(lowerQuery);
    if (maxPrice) {
        result.maxPrice = maxPrice;
        result.reasoning = `Tôi sẽ tìm các sản phẩm có giá dưới ${new Intl.NumberFormat('vi-VN').format(maxPrice)}đ cho bạn.`;
    }

    for (const [key, value] of Object.entries(INTENT_RESPONSES)) {
        if (lowerQuery === key || lowerQuery.startsWith(key + " ") || lowerQuery.endsWith(" " + key)) {
            result.message = value;
            result.suggestions = getSuggestionsForIntent(key);
            return result;
        }
    }

    return Object.keys(result).length > 0 ? result : null;
};

module.exports = { findAdvancedResponse };
