
# 🪳 L02-CockRoaches

Welcome to the GitHub organization for the **Mobile Development course – Class L02**.

This organization is used to manage repositories for:

- 📱 Mobile Development assignments
- 👥 Team projects
- 🧪 Experiments and practice repositories
- 📚 Course-related resources

---

## 📦 Repositories

Each repository in this organization corresponds to:

- A team project
- A course assignment

Students collaborate using **Git**, **GitHub Issues**, and **Pull Requests**.

---

## 👥 Team

Class: **L02 – Mobile Development**

Members collaborate here to develop Android / mobile applications during the course.

---

## 🛠 Technologies

Projects in this organization may use:

- Android Studio
- Kotlin / Java
- Gradle
- Firebase
- REST APIs

---
## 📌 Purpose & Goals

The goal of this organization is to:

- Practice **version control**
- Learn **team collaboration**
- Develop **real mobile applications**

---

⭐ Maintained for the **Mobile Development course**
# GameTwoShape

## 1. Project Overview

**Project Name:** GameTwoShape

**Slogan:**  
- Tiếng Việt: "Kích thích hai bán cầu, hoàn hảo đôi tay"  
- Tiếng Anh: "Train your brain, both sides at once"

Ứng dụng cung cấp:  
- Công cụ "tập thể dục não bộ" dựa trên các nghiên cứu khoa học.  
- Môi trường cạnh tranh lành mạnh giữa bạn bè thông qua hệ thống tính điểm.

---

## 2. Market Research

### Các sản phẩm tương tự trên thị trường:

1. **Lumosity / Elevate**  
   - Ưu điểm: Các app luyện não hàng đầu.  
   - Nhược điểm: Quá nặng về các bài tập toán học, ngôn ngữ, ghi nhớ; ít các bài tập phản xạ vẽ tay đồng thời.

2. **Brain It On!**  
   - Loại: Game giải đố vật lý bằng cách vẽ.  
   - Nhược điểm: Chỉ dùng một tay để suy luận logic, không yêu cầu chia đôi sự chú ý (*divided attention*).

3. **2 Cars (Ketchapp)**  
   - Loại: Điều khiển 2 xe né chướng ngại vật cùng lúc bằng 2 tay.  
   - Nhược điểm: Chỉ là thao tác chạm (*tap/swipe*) đơn giản, không phải thao tác vẽ phức tạp đòi hỏi nhận diện hình học.

4. **Trí tuệ siêu phàm (Các game vẽ tay chung)**  
   - Loại: Yêu cầu vẽ theo mẫu.  
   - Nhược điểm: Thường chỉ dành cho trẻ em hoặc vẽ tuần tự từng hình một.

5. **Osu! / Các game nhịp điệu**  
   - Loại: Luyện tay mắt cực tốt.
   - Nhược điểm: Đòi hỏi phải có âm thanh/nhạc, không dựa trên nghiên cứu luyện não tĩnh.

### Opportunities (Cơ hội)
- Hiện tại rất thiếu game tập trung hoàn toàn vào **vẽ bimanual** (hai tay hai hình).  
- **GameTwoShape** lấp đầy khoảng trống này bằng một **cơ chế cốt lõi duy nhất**:
  - Cơ chế rèn luyện trí não thuần túy và hiệu quả. 
  - Dễ hiểu, dễ gây nghiện (người chơi dễ bị ức chế khi vẽ sai và muốn chơi lại ngay).
  - Có thể lan truyền tốt trên mạng xã hội (ví dụ: thử thách quay video chơi game).
    
## 3. Business Model Canvas
.....
Ứng dụng luyện phối hợp hai tay bằng cách vẽ hai hình khác nhau cùng lúc (ví dụ: hình tròn và hình vuông).

| **Problem** | **Solution** | **Unique Value Proposition** |
|---|---|---|
| - Ít ứng dụng tập trung vào luyện khả năng phối hợp hai tay (ambidexterity). <br> - Nhiều app brain training quá phức tạp. <br> - Người dùng cần bài tập đơn giản để rèn luyện tập trung. | - Canvas để vẽ hai hình cùng lúc. <br> - Nhận dạng hình tùy cấp độ. <br> - Hệ thống chấm điểm theo độ chính xác. <br> - Nhiều level thử thách. | Một bài tập đơn giản giúp rèn luyện khả năng phối hợp hai tay và sự tập trung của não bộ chỉ trong vài phút. |

| **Customer Segments** | **Channels** | **Advantage** |
|---|---|---|
| - Sinh viên và người trẻ. <br> - Người thích brain training. <br> - Người chơi casual games để giải trí khi đi tàu xe. | - Google Play / App Store. <br> - Mạng xã hội. <br> - Demo trong lớp học hoặc cộng đồng sinh viên. | - Ý tưởng bài tập vẽ hai hình bằng hai tay khá hiếm. <br> - Gameplay đơn giản dễ tiếp cận. <br> - Dễ phát triển thành MVP. |

| **Cost Structure** | **Revenue Streams** | **Key Metrics** |
|---|---|---|
| - Phát triển ứng dụng. <br> - Thiết kế UI/UX. <br> - Kiểm thử. <br> - Chi phí tài khoản developer store. | - Quảng cáo trong app. <br> - Phiên bản premium không quảng cáo. <br> - Gói level/challenge bổ sung. | - Số lượt tải. <br> - Thời gian chơi trung bình. <br> - Số level hoàn thành. <br> - Tỷ lệ người dùng quay lại sau các khoảng thời gian 1 ngày, 7 ngày và 30 ngày. |
---
## 4. MVP Features & Prioritization (Impact-Effort Matrix)

Để phát hành bản **Minimum Viable Product (MVP)**, nhóm áp dụng **ma trận Impact-Effort** để chọn lọc tính năng:

### Impact-Effort Matrix

| Effort \ Impact  | Low Impact | High Impact |
|----------------- |------------|-------------|
| **Low Effort**   |- Tùy chỉnh màu nền<br>- Avatar người chơi | - Giao diện chia đôi màn hình dọc/ngang hỗ trợ multi-touch<br>- Thuật toán nhận diện các hình cơ bản (Tròn, Vuông, Tam giác, Đường chéo)<br>- Core logic: Sinh hình ngẫu nhiên, Đếm ngược thời gian, Tăng tốc độ, Tính điểm<br>- Lưu điểm cao nhất (High Score) ở Local (trên máy) |
| **High Effort** | - (Cân nhắc sau) | - Bảng xếp hạng Online (Global Leaderboard)<br>- Nhận diện các hình phức tạp (Ngôi sao, Hình ziczac...) |

### Danh sách tính năng MVP được chọn

1. **Core Game Engine (Multi-touch)**  
   Cho phép màn hình ghi nhận **2 nét vẽ cùng lúc**.

2. **Basic Shape Recognition**  
   Nhận diện và so khớp nét vẽ của người dùng với **hình mẫu**.

3. **Time & Score System**  
   Hệ thống đếm ngược, tự động làm khó (giảm thời gian) và cộng điểm khi vẽ đúng.
## 5. User Flows

Dưới đây là luồng người dùng cho **2 tính năng quan trọng nhất của MVP**:

### Flow 1: Luồng chơi game cốt lõi (Core Gameplay Loop)

1. **Mở ứng dụng**  
   Hiển thị **Màn hình chính (Start Menu)** với **High Score**.

2. **Người dùng nhấn Play**  
   Chuyển sang **màn hình chơi (chia đôi)**.  
   Đếm ngược: **3.. 2.. 1.. Bắt đầu!**

3. **Hệ thống hiển thị 2 hình mẫu** ở 2 bên.  
   Thời gian (**thanh progress bar**) bắt đầu chạy.

4. **Người dùng vẽ hình**  
   - Nếu vẽ **đúng cả 2 hình** trước khi hết giờ → **Cộng điểm**, reset thanh thời gian (nhanh hơn một chút), hiển thị 2 hình mới.  
   - Nếu **hết giờ mà chưa vẽ xong hoặc vẽ sai** → **Game Over**.

5. **Hiển thị Màn hình Kết quả**  
   - Điểm hiện tại & Điểm cao nhất  
   - Chọn **Replay** (quay lại bước 3) hoặc **Home** (quay lại bước 1).

---

### Flow 2: Luồng xử lý và nhận diện nét vẽ (Hệ thống ẩn dưới UI)

1. **Màn hình chờ thao tác chạm (Touch Events)**.

2. **Người dùng đặt tay và vuốt**  
   - Trên **Màn hình Trái** và **Màn hình Phải**.  
   - Ứng dụng ghi nhận **2 mảng tọa độ (path/gesture) độc lập**.

3. **Người dùng nhấc tay lên (Touch End)**.

4. **So sánh nét vẽ với hình mẫu**  
   - Tọa độ nét vẽ **Trái** → hàm **So Sánh Hình mẫu Trái**  
   - Tọa độ nét vẽ **Phải** → hàm **So Sánh Hình mẫu Phải**

5. **Kết quả trả về**  
   - Trái: Pass/Fail  
   - Phải: Pass/Fail  
   - Chỉ khi (**Trái == Pass && Phải == Pass**) → **hệ thống kích hoạt luồng cộng điểm**





