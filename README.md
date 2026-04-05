# 🍃 WebTra AI Assistant - Hệ Thống Quản Lý Trà Thông Minh

Chào mừng bạn đến với **WebTra**, một nền tảng thương mại điện tử chuyên biệt về trà, kết hợp với trợ lý ảo **AI Chatbot** thông minh giúp gắn kết khách hàng và tối ưu hóa trải nghiệm mua sắm.

## 🚀 Công nghệ sử dụng (Tech Stack)

Hệ thống được xây dựng theo mô hình **MERN Stack** (MongoDB, Express, React, Node.js) và tuân thủ kiến trúc **RESTful API**.

- **Backend**: Node.js, Express framework.
- **Database**: MongoDB Atlas (Cloud Database).
- **ORM/ODM**: Mongoose.
- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Framer Motion.
- **AI Integration**: Custom Rule-based & Keyword Matching NLP (Xử lý ngôn ngữ tự nhiên).

## ✨ Tính năng nổi bật của Chatbot AI

Chatbot của WebTra không chỉ trả lời tin nhắn mà còn là một nhân viên bán hàng thực thụ:
- 🔍 **Tìm kiếm thông minh**: Tìm trà theo tên, vùng miền hoặc đặc điểm (vd: "Trà xanh Thái Nguyên").
- 💰 **Lọc giá linh hoạt**: Tìm sản phẩm phù hợp ngân sách (vd: "Tìm trà dưới 500k", "trà giá rẻ").
- ⚖️ **Chọn khối lượng ngay trong Chat**: Cho phép người dùng chọn gói 100g, 200g, 500g trực tiếp.
- 🛒 **Thêm vào giỏ hàng & Thanh toán**: Tích hợp nút mua nhanh và nút chuyển hướng thanh toán siêu tốc.
- 📦 **Tra cứu đơn hàng**: Kiểm tra trạng thái vận đơn thực tế từ hệ thống chỉ với mã đơn (vd: #123).

## 🛠 Hướng dẫn cài đặt & Chạy dự án

### 1. Cấu hình Biến môi trường (.env)
Tạo file `.env` trong thư mục `backend_nodejs` với các nội dung sau:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
# VNPAY Sandbox (Mặc định)
VNP_TMN_CODE=2QXG293Q
VNP_HASH_SECRET=NGH8S0797Y99849202476100
VNP_RETURN_URL=http://localhost:5173/payment-result
```

### 2. Chạy Backend (Node.js)
```bash
cd backend_nodejs
npm install
npm run dev
```
*Backend sẽ chạy tại: [http://localhost:5000](http://localhost:5000)*

### 3. Chạy Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
*Frontend sẽ chạy tại: [http://localhost:5173](http://localhost:5173)*

---

## 📂 Cấu trúc thư mục Backend (RESTful MVC)
```text
backend_nodejs/
├── src/
│   ├── config/       # Cấu hình Database (Mongoose)
│   ├── controllers/  # Xử lý logic nghiệp vụ
│   ├── models/       # Định nghĩa Schema MongoDB
│   ├── routes/       # Khai báo các API Endpoints
│   ├── services/     # Logic AI Chatbot & Xử lý NLP
│   └── app.js        # Cấu hình Express
└── server.js         # Điểm đầu vào (Entry point)
```

## 📝 Ghi chú quan trọng
- Hệ thống đã được cấu hình **CORS** để Frontend và Backend có thể giao tiếp mượt mà.
- **Bảo mật**: File `.env` và thư mục `node_modules` đã được chặn trong `.gitignore`.
- **Database**: Dữ liệu hiện đang kết nối trực tiếp tới MongoDB Atlas của dự án.

---
*Chúc bạn có những trải nghiệm tuyệt vời cùng Trà Thơm WebTra!* 🍵✨