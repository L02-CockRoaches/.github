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

### 1. Khái niệm và Lợi ích
CI/CD (Continuous Integration / Continuous Deployment) là quy trình tự động hóa việc tích hợp và triển khai mã nguồn.
- **Lợi ích cho nhóm môn học**:
  - **Tránh xung đột mã nguồn**: Khi nhiều thành viên cùng code, CI sẽ chạy test để đảm bảo code mới không làm hỏng tính năng cũ.
  - **Phản hồi nhanh**: Biết ngay build fail/pass sau khi push, không cần đợi đến lúc tích hợp thủ công.
  - **Triển khai rảnh tay**: Code pass test sẽ tự động lên server Render, nhóm có thể demo cho giảng viên bất cứ lúc nào.

### 2. Quy trình Pipeline (Build -> Test -> Docker -> Deploy)
Mỗi khi nhóm push code hoặc merge PR vào branch `WebService-Cloud`, pipeline sẽ tự động chạy:
1. **Build & Test**: Sử dụng Jest để test module `Scores`, đảm bảo logic tính điểm chuẩn xác.
2. **Dockerize**: Pipeline chạy `docker build` để đóng gói backend thành một "container" độc lập, dễ dàng chạy trên bất kỳ hệ điều hành nào.
3. **Deploy**: Sau khi test xong, GitHub Actions gửi lệnh (Webhook) yêu cầu Render cập nhật phiên bản mới nhất.

### 3. Secrets Management
Các API Key, Database URL được lưu trữ an toàn trong **GitHub Secrets**, đảm bảo an toàn thông tin tuyệt đối cho Cloud Provider.

---

## Phần 4 – Gợi ý mở rộng & Monitoring

### 1. Managed Database (Neon/Supabase)
Dự án sử dụng **Neon PostgreSQL** - một dịch vụ database trên cloud hoàn toàn miễn phí cho sinh viên, hỗ trợ tự động mở rộng và có sẵn bộ gom kết nối (Connection Pooler).

### 2. Logging & Monitoring (Cloud Cloud)
- **Health Check (Terminus)**: Theo dõi sức khỏe hệ thống tại route `/health`. Nếu database bị ngắt kết nối, route này sẽ báo lỗi để Admin xử lý kịp thời.
- **Logging Interceptor**: Toàn bộ các yêu cầu API gửi lên đều được ghi nhật ký (Log) chi tiết về thời gian phản hồi tại `logging.interceptor.ts`.

### 3. Tách rời Frontend & Backend
Hệ thống triển khai theo kiến trúc **Decoupled**:
- **Backend**: NestJS chạy trên Render (Cloud Run/Web Service).
- **Frontend**: Ứng dụng React Native liên kết qua endpoint URL chuẩn.

---
*Tài liệu được cập nhật phù hợp với ứng dụng Game L02. Chúc nhóm thực hiện tốt bài tập lớn!*
