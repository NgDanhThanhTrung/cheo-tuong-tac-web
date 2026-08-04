# Hướng Dẫn Deploy Lên Render - Chi Tiết

## Tổng quan
Ứng dụng Chéo Tương Tác được cấu trúc dưới dạng Monorepo để deploy 1-click lên Render với **MongoDB database**.

## Kiến trúc Deployment
```
Render Web Service (Node.js)
├── Backend: Express Server (Port 5000)
├── Frontend: React Build (Static files)
└── Database: MongoDB (MongoDB Atlas hoặc Render MongoDB)
```

## Bước 1: Chuẩn bị Repository GitHub

### 1.1. Kiểm tra cấu trúc thư mục
```
cheo-tuong-tac-monorepo/
├── package.json          # Root package.json (Render build command)
├── server.js             # Express backend
├── .gitignore
├── client/               # React frontend
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── README.md
```

### 1.2. Đảm bảo .gitignore đúng
```
node_modules/
dist/
.env
.DS_Store
```

### 1.3. Push lên GitHub
```bash
git init
git add .
git commit -m "Initial commit: Chéo Tương Tác Monorepo"
git branch -M main
git remote add origin https://github.com/TEN_BAN/cheo-tuong-tac-monorepo.git
git push -u origin main
```

## Bước 2: Cấu hình trên Render

### 2.1. Đăng nhập Render
- Truy cập: https://dashboard.render.com/
- Đăng nhập bằng GitHub/GitLab/Bitbucket

### 2.2. Tạo Web Service mới
1. Nhấn **New +** (góc trên bên phải)
2. Chọn **Web Service**
3. Render sẽ yêu cầu kết nối GitHub - **Connect** tài khoản của bạn

### 2.3. Chọn Repository
- Tìm repository `cheo-tuong-tac-monorepo`
- Nhấn **Connect**

### 2.4. Cấu hình Build & Start
Điền thông tin sau:

**Basic Configuration:**
- **Name**: `cheo-tuong-tac` (tùy chỉnh)
- **Region**: Singapore (hoặc gần Việt Nam nhất)
- **Branch**: `main`

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

## Bước 4: Cấu hình MongoDB (Quan trọng)

### 4.1. Tạo MongoDB Atlas (Khuyên dùng)
1. Đăng ký miễn phí tại: https://www.mongodb.com/cloud/atlas
2. Tạo cluster (Free tier: 512MB)
3. Tạo database user và whitelist IP
4. Lấy connection string (URI)

### 4.2. Hoặc sử dụng Render MongoDB
1. Trong Render Dashboard, chọn **New +** -> **MongoDB**
2. Đặt tên cho database
3. Copy connection string từ phần settings

## Bước 5: Cấu hình Environment Variables (Quan trọng)
Trong phần **Environment Variables**, thêm các biến sau:
- **Key**: `ADMIN_PASSWORD`
  - **Value**: (nhập mật khẩu admin của bạn - BẮT BUỘC!)
- **Key**: `MONGODB_URI`
  - **Value**: (nhập MongoDB connection string - BẮT BUỘC!)

**Lưu ý**: Bắt buộc phải đặt cả 2 biến môi trường để server hoạt động!

### 2.5. Review & Deploy
- Nhấn **Create Web Service**
- Render sẽ bắt đầu quá trình deploy

## Bước 3: Quan sát quá trình Deploy

### 3.1. Các bước thực hiện
Render sẽ thực hiện tuần tự:
1. **Cloning**: Clone repository từ GitHub
2. **Installing**: Cài đặt dependencies (root + client)
3. **Building**: Build React frontend (`npm run build`)
4. **Starting**: Khởi động Node.js server (`npm start`)

### 3.2. Thời gian
- **Lần đầu**: 3-5 phút
- **Lần sau (code thay đổi)**: 1-2 phút

### 3.3. Xem logs
- Trên dashboard Render, chọn Web Service
- Tab **Logs** để xem tiến trình
- Tab **Events** để xem lịch sử deploy

## Bước 4: Kiểm tra ứng dụng

### 4.1. Truy cập URL
Sau khi deploy thành công, Render sẽ cung cấp URL:
```
https://cheo-tuong-tac.onrender.com
```

### 4.2. Test các tính năng
- ✅ Đăng nhập/Đăng ký bằng SĐT
- ✅ Xem danh sách thành viên (ẩn danh)
- ✅ Bấm "Xác nhận đã chéo" → Nút chuyển xanh
- ✅ Xem bảng xếp hạng cập nhật điểm
- ✅ Thêm nhiệm vụ mới (sau khi đăng nhập)

### 4.3. Test bảo mật
- ✅ Không đăng nhập: Chỉ thấy "Anh Tuấn #1024 (***5678)"
- ✅ Đăng nhập: Thấy thông tin đầy đủ của chính mình
- ✅ Không thể xem thông tin đầy đủ của người khác

## Bước 5: Troubleshooting

### 5.1. Deploy fail
**Lỗi: Build failed**
- Kiểm tra logs ở tab **Logs**
- Thường là do thiếu dependencies hoặc syntax error

**Lỗi: Port không đúng**
- Đảm bảo server.js dùng `process.env.PORT || 5000`
- Render sẽ tự động gán PORT

### 5.2. Frontend không load
**Lỗi: Blank page**
- Kiểm tra `client/dist` có được tạo không
- Đảm bảo `vite.config.js` có `build.outDir: 'dist'`

**Lỗi: API không connect**
- Kiểm tra proxy trong `vite.config.js` (chỉ cho dev)
- Production: React build gọi API trực tiếp đến server

### 5.3. Dữ liệu bị mất
**Nguyên nhân:**
- Render Free Tier restart server hàng ngày
- In-memory database sẽ bị reset

**Giải pháp:**
- Upgrade lên Starter ($7/tháng) để ít restart hơn
- Hoặc nâng cấp database sang PostgreSQL

## Bước 6: Cấu hình nâng cấp (Tùy chọn)

### 6.1. Thêm PostgreSQL
Cập nhật `server.js`:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
```

Trên Render:
1. Tạo **PostgreSQL** service
2. Copy **Internal Database URL**
3. Thêm vào Web Service → **Environment Variables**
4. Key: `DATABASE_URL`, Value: (paste URL)

### 6.2. Custom Domain
1. Trên Web Service → **Settings**
2. **Domains** → **Add Custom Domain**
3. Nhập domain của bạn (ví dụ: cheo.example.com)
4. Cấu hình DNS theo hướng dẫn Render

## Bước 7: CI/CD (Tự động deploy)

### 7.1. Auto-deploy khi push code
Render mặc định sẽ:
- Tự động deploy khi có push mới vào branch `main`
- Không cần cấu hình thêm

### 7.2. Deploy branch khác
- Trên Web Service → **Settings**
- **Branches** → **Add Branch**
- Chọn branch (ví dụ: `develop`)

## Bước 8: Monitoring

### 8.1. Xem metrics
- Trên dashboard Render → Web Service
- Tab **Metrics** xem CPU, Memory, Response time

### 8.2. Alerting
- **Settings** → **Alerts**
- Cấu hình cảnh báo khi CPU > 80%, Memory > 80%

## Tóm tắt lệnh nhanh

```bash
# 1. Commit & push code mới
git add .
git commit -m "Fix bug"
git push

# 2. Render tự động deploy (1-2 phút)

# 3. Kiểm tra logs trên Render Dashboard
# 4. Test ứng dụng tại URL của bạn
```

## Liên hệ hỗ trợ
- Render Documentation: https://render.com/docs
- Render Support: support@render.com
- GitHub Issues: Nếu có lỗi từ code