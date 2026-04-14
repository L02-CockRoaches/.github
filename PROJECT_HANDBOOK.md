# PROJECT HANDBOOK: Brain Training Game (L02-CockRoaches)

Tài liệu này tổng hợp toàn bộ kiến thức, cấu trúc và hướng dẫn triển khai cho dự án **Mobile App & Backend Service** của nhóm **L02-CockRoaches**, tập trung vào trò chơi phát triển trí tuệ và sự phối hợp song phương (Bimanual Coordination).

---

## Phần 1 – Web Service với NestJS

### 1. Tại sao chọn NestJS cho dự án luyện não?
NestJS là một framework Node.js tiến bộ được xây dựng với TypeScript, cung cấp cấu trúc rõ ràng (Modular Architecture), cực kỳ phù hợp để xây dựng backend cho các trò chơi có tính logic cao.
- **Tính năng chủ chốt được sử dụng**:
  - **Modular Architecture**: Phân tách logic giữa Quản lý Game, Lưu trữ Điểm số (Scores) và Người dùng (Auth).
  - **Ecosystem**: Tích hợp sẵn Swagger cho việc test API nhanh chóng và Prisma để tương tác DB an toàn.

### 2. Cấu trúc dự án Backend (Monorepo)
Backend nằm trong thư mục `main-app/backend/` với các module chính:
- `src/auth`: Xử lý đăng ký/đăng nhập của người chơi.
- `src/games`: Quản lý thông tin metadata của các game (GameTwoShape, Brain Training).
- `src/scores`: Module quan trọng nhất, xử lý việc lưu High Score và tính toán Bảng xếp hạng (Leaderboard).
- `src/health`: Giám sát trạng thái server & database.

### 3. Best Practices đã triển khai
- **API Versioning**: Toàn bộ API đều sử dụng prefix `/v1` để đảm bảo khả năng mở rộng.
- **Validation & DTO**: Sử dụng `class-validator` để đảm bảo điểm số gửi lên backend là số nguyên dương và hình thức dữ liệu sạch.
- **Security**: Toàn bộ endpoint lưu điểm (`POST /scores`) đều được bảo vệ bởi **JWT Auth Guard**, chỉ cho phép người chơi đã đăng nhập lưu dữ liệu.
- **Swagger Documentation**: Bạn có thể truy cập `/api` (local) để xem toàn bộ tài liệu API tự động.

### 4. Advanced Techniques (Demo)
- **Monitoring (Terminus)**: Triển khai kiểm tra sức khỏe hệ thống (Health Check) tại route `/health`.
- **Database Integration (Prisma)**: Sử dụng Prisma Client để đảm bảo an toàn kiểu dữ liệu từ DB lên tới tầng Controller.

---

## Phần 2 – Cloud Provider cho dự án Game

### 1. Phân tích các dịch vụ phù hợp
Dự án Brain Training yêu cầu độ trễ thấp và khả năng scale nhanh:
- **Render / Railway**: Phù hợp nhất để deploy Backend NestJS do hỗ trợ triển khai từ Docker Hub và tự động hóa CI/CD.
- **Azure for Students**: Tận dụng Credit $100 miễn phí để triển khai database PostgreSQL hoặc server app chính.

### 2. Ưu điểm trong học tập
- Sử dụng **Render** giúp nhóm không tốn phí duy trì server ban đầu nhưng vẫn có SSL và Domain chuẩn.

---

## Phần 3 – CI/CD với GitHub Actions

### 1. Quy trình Pipeline tự động
Mỗi khi nhóm push code lên GitHub, một pipeline sẽ tự động chạy:
1. **Linter & Test**: Kiểm tra cú pháp và chạy unit test cho module Scores.
2. **Build**: Build ứng dụng NestJS.
3. **Dockerize**: Tạo Docker image và đẩy lên Docker Hub.
4. **Deploy**: Tự động thông báo cho Cloud Provider kéo image mới nhất về (Webhook).

### 2. Secrets Management
Các API Key, Database URL được lưu trữ an toàn trong **GitHub Secrets**, không bao giờ bị lộ trong mã nguồn.

---

## Phần 4 – Gợi ý mở rộng tương lai

1. **Leaderboard Nâng cao**: Tích hợp Redis để tính toán bảng xếp hạng thời gian thực khi lượng người chơi lên tới hàng ngàn.
2. **Game Analytics**: Lưu trữ thêm thông tin về "Accuracy" và "TimeSpent" để phân tích xu hướng tiến bộ não bộ của người chơi.
3. **Managed SQL**: Sử dụng Azure Database for PostgreSQL để đảm bảo dữ liệu game được backup tự động.

---
*Tài liệu được cập nhật phù hợp với ứng dụng Game L02. Chúc nhóm thực hiện tốt bài tập lớn!*
