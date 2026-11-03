# 💍 Hỷ Sự - Ứng Dụng Lên Kế Hoạch & Quản Lý Chi Tiêu Đám Cưới (Android Mobile)

**Hỷ Sự** là ứng dụng di động dành cho các cặp đôi chuẩn bị tổ chức đám cưới tại Việt Nam. Ứng dụng giúp bạn lên kế hoạch chỉn chu từ A - Z, kiểm soát chi tiêu chặt chẽ, quản lý hợp đồng cưới kèm ảnh chụp các điều khoản, theo dõi tiến độ công việc, quản lý khách mời, sổ ghi tiền mừng cưới, điểm danh khách tham dự tiệc tại bàn đón khách và **tự động đồng bộ thời gian thực lên Google Sheets khi có bất kỳ thay đổi nào**.

---

## 🌟 Tính Năng Mới Cập Nhật

### 1. 🔄 Tự Động Đồng Bộ Lên Google Sheets Khi Thay Đổi Dữ Liệu (Auto-Sync)
- **Tự động sao lưu ngầm (Background Sync)**: Không cần phải bấm nút đồng bộ thủ công nữa! Mỗi khi bạn:
  - Thêm, sửa, hoặc xóa một khoản chi tiêu.
  - Tick hoàn thành một công việc trong kế hoạch.
  - Thêm khách mời hoặc ghi nhận phong bì tiền mừng cưới.
  - Điểm danh khách có mặt tại bàn đón tiệc (+người đi cùng).
  - Thêm hợp đồng mới hoặc chụp thêm ảnh hợp đồng.
  - Chỉnh sửa thông tin ngày cưới, địa điểm, ngân sách.
  Ứng dụng sẽ **tự động đồng bộ ngầm sau 2.5 giây** (cơ chế chống nghẽn Debounce) lên Google Sheets cá nhân của bạn.
- **Chỉ báo trạng thái trực quan**:
  - Khi đang tự động đồng bộ: Icon Google Sheet trên thanh tiêu đề sẽ tự động xoay tròn và hiển thị `Đang đồng bộ...`.
  - Khi đồng bộ thành công: Hiển thị chấm xanh và lưu mốc giờ cập nhật gần nhất.
- **Công tắc Bật / Tắt**: Bạn có thể bật hoặc tắt tính năng tự động đồng bộ bất cứ lúc nào trong cửa sổ kết nối Google Sheets.

### 2. 🔤 Khắc Phục Lỗi Khoảng Cách Tên Cô Dâu & Chú Rể Khi Không Dấu
- Tích hợp bộ font chuẩn tiếng Việt **`Be Vietnam Pro`** với `tracking-normal`, thiết kế khối inline-flex đồng nhất. Dù viết có dấu hay không dấu đều chuẩn đẹp, không bị giãn cách hay ngắt chữ.

### 3. 🌞 Tối Ưu Độ Tương Phản Thông Tin Ngày & Giờ Cưới
- Đặt thông tin Ngày cưới, Giờ cử hành và Sảnh tiệc vào **khối kính mờ tối màu chống chói** (`bg-black/35 backdrop-blur-md border border-white/20`) với các viên thuốc (pills) màu trắng và icon vàng kim nổi bật, sắc nét trong mọi điều kiện ánh sáng.

### 4. 📑 Quản Lý Hợp Đồng Cưới & Lưu Trữ Ảnh Hợp Đồng
- Lưu thông tin hợp đồng nhà hàng, studio, váy cưới, xe hoa, tráp lễ...
- Chụp ảnh trực tiếp từ Camera điện thoại hoặc tải ảnh từ Thư viện.
- Tự động nén ảnh giữ chữ rõ nét và xem ảnh toàn màn hình (Photo Viewer).

### 5. 🍽️ Danh Sách Khách Tham Dự Tiệc & Điểm Danh (Bàn Đón Khách)
- Bộ đếm thời gian thực tại bàn đón khách, tính tổng suất ăn (khách + người đi cùng), suất ăn chay.
- Điểm danh 1 chạm có ghi nhận chính xác mốc giờ đến (`11:15`).
- Xem theo Danh sách tìm kiếm nhanh hoặc Sơ đồ gom theo bàn tiệc.

### 6. 🔗 Chia Sẻ Ứng Dụng (Share Modal)
- Nút **"Chia sẻ"** trực tiếp trên thanh tiêu đề: hiển thị mã QR Code để quét mở ngay trên điện thoại, hỗ trợ copy link, xuất file APK và chia sẻ dữ liệu qua Google Sheets hoặc file JSON.

---

## ⚡ Hướng Dẫn Đưa Lên Mạng Trực Tuyến Bằng Vercel (Khuyên Dùng - Nhanh & Ổn Định)

Vercel là dịch vụ lưu trữ đám mây cao cấp, miễn phí, tải trang tức thì và tự động tối ưu hóa cho ứng dụng web/di động.

### Cách 1: Triển khai 1-Click bằng file có sẵn (Không cần cài đặt phức tạp)
1. Trong thư mục dự án, bấm đúp chuột vào file:
   **`Deploy-Len-Vercel.bat`**
2. Nhấn phím `Y` để đồng ý đưa lên.
3. Nếu là lần đầu chạy, Vercel sẽ tự mở trình duyệt web: Bạn chỉ cần bấm đăng nhập bằng Google hoặc GitHub.
4. Màn hình console sẽ tự động build và cung cấp cho bạn đường link trực tuyến:
   `https://ung-dung-xxxx.vercel.app`

### Cách 2: Kết nối GitHub với Vercel (Tự động cập nhật web mỗi khi sửa code)
1. Đẩy code lên GitHub bằng file `Day-Len-Github.bat`.
2. Truy cập [vercel.com/new](https://vercel.com/new) và đăng nhập bằng tài khoản GitHub.
3. Tại danh sách repositories, bấm **Import** dự án `hy-su` (hoặc tên kho bạn vừa đặt).
4. Vercel sẽ tự nhận diện Framework là **Vite** và Output directory là **dist**.
5. Bấm nút **Deploy**. Chỉ sau 30 giây, bạn sẽ nhận được đường link web trực tuyến hoàn chỉnh!

---

## 🌐 Hướng Dẫn Đưa Lên Mạng Trực Tuyến Bằng GitHub (GitHub Pages)

Dự án đã tích hợp sẵn GitHub Actions workflow tự động tại `.github/workflows/deploy.yml`. Bạn chỉ cần đưa code lên GitHub:

1. **Tạo repository mới trên GitHub:**
   - Vào [github.com/new](https://github.com/new), đặt tên kho ví dụ `hy-su`, chọn **Public** rồi bấm **Create repository**.
2. **Đẩy code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Khoi tao ung dung Hy Su"
   git branch -M main
   git remote add origin https://github.com/<TEN-TAI-KHOAN>/hy-su.git
   git push -u origin main
   ```
3. **Bật GitHub Pages:**
   - Vào **Settings** của repository trên GitHub ➔ **Pages** (cột bên trái).
   - Tại mục **Build and deployment > Source**, chọn **GitHub Actions**.
4. **Hoàn thành:**
   - Sau khoảng 1 phút, GitHub sẽ hoàn tất build và cung cấp cho bạn link trực tuyến:
     `https://<TEN-TAI-KHOAN>.github.io/hy-su/`
   - Bất kỳ ai trên thế giới đều có thể truy cập qua điện thoại hay máy tính mà không cần cùng mạng WiFi.

---

## 🚀 Hướng Dẫn Sử Dụng & Trải Nghiệm Trên Android

### Cách 1: Sử dụng ngay trên điện thoại Android (PWA - Khuyên dùng)
1. Đảm bảo điện thoại Android và máy tính cùng kết nối chung một mạng WiFi.
2. Mở trình duyệt **Google Chrome** trên Android, truy cập vào:
   ```
   http://192.168.200.30:5173/
   ```
3. Nhấn vào biểu tượng **Ba chấm (⋮)** ở góc trên bên phải Chrome ➡️ Chọn **"Thêm vào Màn hình chính"** (Add to Home screen) hoặc **"Cài đặt ứng dụng"**.
4. Ứng dụng **Hỷ Sự** sẽ xuất hiện trên màn hình điện thoại Android, mở toàn màn hình, mượt mà và lưu dữ liệu offline không lo mất mát.

---

### Cách 2: Mở và Build APK trong Android Studio (Capacitor Native)
Dự án Android nguyên bản đã được đồng bộ sẵn sàng trong thư mục `android/`:
```powershell
npm.cmd run cap:open
```
Lệnh này sẽ khởi động **Android Studio**, bạn có thể cắm cáp điện thoại Android để cài trực tiếp hoặc xuất file `.apk`.
