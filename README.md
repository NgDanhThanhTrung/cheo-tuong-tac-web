# Quản Lý Chéo Tương Tác (Monorepo)

Ứng dụng web Full-stack hỗ trợ chéo tương tác cộng đồng tích hợp sẵn cơ chế bảo mật ẩn danh (masking thông tin) phía Server, lưu trữ dữ liệu bằng **MongoDB** và tối ưu hóa 1-click deploy lên **Render**.

## ✨ Tính năng mới

### 🎯 Categories (Phân loại hình thức chéo)
- **Chéo sự kiện Shopee**: Like, comment, share sản phẩm Shopee
- **Chém giá TikTok**: Thả tim, comment, share video TikTok
- **Chéo Facebook**: Like, comment, share bài viết Facebook
- **Chéo YouTube**: View, like, subscribe kênh YouTube
- **Tùy chỉnh**: Admin có thể thêm/sửa/xóa categories

### � Hệ thống điểm & lượt
- **Người dùng mới**: Tự động được cấp 10 điểm khởi đầu
- **Hoàn thành nhiệm vụ**: Được cộng 1 điểm cho mỗi lần hoàn thành
- **Tạo nhiệm vụ**: Mất 10 điểm để tạo 1 nhiệm vụ mới
- **Giới hạn lượt**: Mỗi nhiệm vụ có tối đa 10 lượt thực hiện
- **Giới hạn TikTok**: Chém giá TikTok giới hạn 3 lần/ngày cho mỗi người
- **Hiển thị**: Số lượt còn lại trên mỗi task (ví dụ: 7/10 lượt)
- **Bảng xếp hạng**: Tổng điểm = Điểm hiện tại (khởi đầu + kiếm được - đã tiêu)

### ⭐ Hệ thống Level & XP
- **XP System**: Mỗi lần hoàn thành nhiệm vụ được cộng 10 XP
- **Level Formula**: Level = 1 + floor(sqrt(XP / 100))
  - Level 1: 0-99 XP
  - Level 2: 100-399 XP
  - Level 3: 400-899 XP
  - Level 4: 900-1599 XP
  - ... tiếp tục theo công thức
- **Ưu tiên hiển thị**: Task của user level cao hơn sẽ hiển thị trước
- **Tự động ẩn**: Task đã đủ lượt sẽ tự động ẩn để cho task khác cơ hội
- **Thống kê**: Tổng số nhiệm vụ đã hoàn thành
- **Hiển thị**: Level và XP hiển thị trên header và leaderboard

### 🤝 Nhiệm vụ Đối Tác (Co-op Tasks)
- **Co-op Task**: Nhiệm vụ đòi hỏi 2 người cùng hoàn thành
- **Chi phí cao**: Tạo co-op task tốn 20 điểm (thay vì 10)
- **Double points**: Co-op task cho 2 điểm (thay vì 1)
- **XP Bonus**: +50% XP khi hoàn thành co-op task (15 XP thay vì 10)
- **Matching system**: Tự động ghép đôi người có cùng category
- **Auto match**: Khi đủ người tham gia, task chuyển sang trạng thái matched
- **Status tracking**: pending → matched → completed
- **Ưu tiên hiển thị**: Co-op task luôn hiển thị trước regular task
- **Filter**: Có thể lọc theo loại task (co-op/regular)

### 🏆 Hệ thống Badge & Achievement
- **Task Badges**: Huy hiệu cho từng loại task
  - TikTok: Beginner (5), Intermediate (20), Expert (50), Master (100)
  - Facebook: Starter (5), Pro (20), Expert (50), Master (100)
  - Shopee: Novice (5), Regular (20), Expert (50), Master (100)
  - YouTube: Beginner (5), Regular (20), Expert (50), Master (100)
- **Streak Badges**: Huy hiệu cho chuỗi hoàn thành liên tục
  - Hot Streak 3, 7, 14, 30, 100 ngày
- **Time Badges**: Huy hiệu cho người dùng lâu năm
  - Newcomer (1 tuần), Regular (1 tháng), Veteran (3 tháng), Expert (6 tháng), Master (1 năm), Legend (2 năm)
- **Auto-earning**: Tự động cấp badge khi đạt điều kiện
- **UI Display**: Hiển thị badge count trên header và leaderboard
- **Achievements Modal**: Modal xem tất cả badges và progress

### �🔐 Admin Panel
- **Truy cập**: `/admin` (nhập mật khẩu từ biến môi trường)
- **Quản lý đầy đủ**:
  - **Categories**: Thêm, sửa, xóa loại hình thức chéo
  - **Users**: Thêm, sửa, xóa người dùng (tùy chỉnh điểm)
  - **Tasks**: Thêm, sửa, xóa nhiệm vụ (tùy chỉnh điểm, lượt)
  - **Logs**: Xem hoạt động, xóa tất cả logs
- **Tùy chỉnh**: Đổi tên, icon, màu sắc cho mỗi category
- **Bảo mật**: Cần mật khẩu để truy cập trang admin
- **Cấu hình**: Bắt buộc phải đặt biến môi trường `ADMIN_PASSWORD`

### 🎨 Giao diện cải tiến
- **Lọc theo Category**: Chọn loại hình thức để xem nhiệm vụ tương ứng
- **Hiển thị trực quan**: Icon và màu sắc cho từng category
- **Responsive**: Tối ưu cho mobile và desktop

### 🗄️ MongoDB Database
- **Lưu trữ**: Dữ liệu được lưu trữ trong MongoDB
- **Yêu cầu**: Bắt buộc phải có MongoDB connection string
- **Thiết lập MongoDB Atlas**:
  1. Đăng ký miễn phí tại: https://www.mongodb.com/cloud/atlas
  2. Tạo cluster (Free tier: 512MB)
  3. Tạo database user và whitelist IP (0.0.0.0/0)
  4. Lấy connection string (URI)
  5. Cập nhật vào file `.env` hoặc biến môi trường
- **Seeding**: Tự động tạo dữ liệu mẫu khi khởi động (lần đầu tiên)
- **Scalability**: Có thể mở rộng với nhiều người dùng
- **Persistence**: Dữ liệu không bị mất khi server restart

### ⏰ Auto Delete Tasks
- **Xóa theo giờ**: Tự động xóa các nhiệm vụ vào 0:00 giờ Việt Nam mỗi ngày
- **TikTok đặc biệt**: Nhiệm vụ TikTok được xóa sau 24h từ khi tạo
- **Cron jobs**: Sử dụng node-cron để chạy theo lịch tự động
- **Khu vực**: Tất cả đều theo giờ Việt Nam (Asia/Ho_Chi_Minh)

## Cấu trúc thư mục
```
cheo-tuong-tac-monorepo/
├── package.json          # Script điều khiển chung cho Render
├── server.js             # Express Backend + MongoDB Connection
├── .env                  # Environment variables (ADMIN_PASSWORD, MONGODB_URI)
├── .gitignore
├── models/               # Mongoose Models
│   ├── User.js
│   ├── Category.js
│   ├── Task.js
│   └── CrossLog.js
└── client/               # React Frontend (Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── main.jsx
        └── index.css
```

## Hướng dẫn Deploy lên Render

### Bước 1: Push lên GitHub
```bash
git init
git add .
git commit -m "Initial commit: Chéo Tương Tác Monorepo"
git branch -M main
git remote add origin https://github.com/USERNAME/cheo-tuong-tac-monorepo.git
git push -u origin main
```

### Bước 2: Tạo Web Service trên Render
1. Đăng nhập vào [Render Dashboard](https://dashboard.render.com/)
2. Nhấn **New +** -> **Web Service**
3. Chọn Repository GitHub vừa tạo
4. Cấu hình cài đặt như sau:
   - **Name**: `cheo-tuong-tac` (hoặc tên bạn muốn)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (hoặc paid nếu cần)
5. Nhấn **Create Web Service**

### Bước 3: Quan sát quá trình Deploy
- Render sẽ tự động:
  1. Clone repository
  2. Cài đặt dependencies (root và client)
  3. Build React Frontend
  4. Khởi động Node.js Server
- Quá trình mất khoảng 2-5 phút

### Bước 4: Truy cập ứng dụng
- Sau khi deploy thành công, Render sẽ cung cấp URL như: `https://cheo-tuong-tac.onrender.com`
- Truy cập URL này để sử dụng ứng dụng

### Tính năng hoạt động trên Render
- ✅ Dữ liệu được lưu trữ in-memory trên server
- ✅ Tất cả thành viên đồng bộ dữ liệu theo thời gian thực
- ✅ Bảo mật thông tin: Server tự động ẩn SĐT và tên đầy đủ
- ✅ Giao diện đầy đủ: Đăng nhập, Quản lý nhiệm vụ, Bảng xếp hạng

### Lưu ý quan trọng
- Dữ liệu được lưu trữ trong MongoDB (không bị mất khi server restart)
- Bắt buộc phải cấu hình biến môi trường `ADMIN_PASSWORD` và `MONGODB_URI`
- Deploy lên Render: Cần cấu hình MongoDB Atlas hoặc sử dụng Render MongoDB
