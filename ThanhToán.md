# Hướng dẫn Kiểm tra (Test) Thanh toán VNPAY Sandbox (Node.js)

Dự án hiện đã hoàn tất migration sang **Node.js**. Dưới đây là cách bạn thực hiện một giao dịch thanh toán giả lập trên localhost.

### 🚀 Bước 1: Khởi động hệ thống
1. **Backend**: Chạy tại `http://localhost:5000` (lệnh `npm run dev` trong thư mục `backend_nodejs`).
2. **Frontend**: Chạy tại `http://localhost:5173` (lệnh `npm run dev` trong thư mục `frontend`).
3. **BẮT BUỘC (Để nhận IPN - Cập nhật đơn hàng ngầm)**:
   - Mở terminal mới, chạy lệnh: `./ngrok http 5000`
   - Copy link ngrok (Ví dụ: `https://abcd-123.ngrok-free.dev`) dán vào cấu hình Merchant trên VNPAY hoặc ít nhất là bạn phải dùng link này để VNPAY gọi về.

### 💳 Bước 2: Thông tin Thẻ Test (Sandbox)
Khi được chuyển hướng tới trang VNPAY, hãy sử dụng thông tin sau:
- **Ngân hàng**: NCB (Đã chọn sẵn)
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mật khẩu OTP**: `123456`

### ✅ Bước 3: Kiểm tra Kết quả
1. Sau khi nhập OTP thành công, bạn sẽ được tự động chuyển về trang:
   `http://localhost:5173/payment-result`
2. **Kiểm tra Backend**: Trong Terminal của Node.js, bạn sẽ thấy dòng log debug:
   `>>> VNPAY IPN: Thanh toán thành công cho đơn hàng #XXXXXX`
   (Trạng thái đơn hàng trong MongoDB sẽ tự động chuyển từ `Pending` sang `Confirmed`).

---
> [!IMPORTANT]
> Nếu bạn thấy lỗi **Code 72 (Không tìm thấy website)**, hãy đảm bảo rằng file `.env` của bạn đã có đủ 3 biến: `VNP_TMN_CODE`, `VNP_HASH_SECRET` và `VNP_RETURN_URL` (trỏ về localhost:5173).