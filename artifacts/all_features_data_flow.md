# Luồng Dữ Liệu Tương Tác Giữa Frontend Và Backend (Tất Cả Chức Năng)

Hệ thống Food Map được chia thành **3 cổng giao diện chính (Portals)** phục vụ cho 3 đối tượng người dùng khác nhau: **Tourist** (Khách du lịch), **Merchant** (Chủ quán/Doanh nghiệp), và **Admin** (Quản trị viên). Dưới đây là bức tranh toàn cảnh về cách Frontend tương tác với Backend cho từng chức năng.

---

## 1. Cơ Chế Kết Nối Cốt Lõi (Core Interaction)

Tất cả các giao tiếp với Backend đều đi qua một cơ chế xử lý trung tâm (Hàm `apiFetch` trong `src/http`).

- **Authentication (Xác thực):** Sau khi đăng nhập thành công, Backend trả về một chuỗi JWT (JSON Web Token). Frontend lưu trữ token này vào LocalStorage và Zustand Store (Global State). 
- **Gửi Yêu Cầu (Requests):** Bất cứ lúc nào user thao tác (xem chi tiết, tạo lịch trình, thanh toán...), hàm `apiFetch` tự động lấy Token đó đính kèm vào HTTP Header (`Authorization: Bearer <token>`). Các tham số như `Accept-Language` cũng được đính kèm để Backend biết cần trả về tiếng Việt hay tiếng Anh.
- **Xử lý Lỗi (Error Handling):** Bất kỳ lỗi 401 (Hết hạn Token), `apiFetch` sẽ bắt ngay để điều hướng user về trang đăng nhập.

---

## 2. Luồng Dữ Liệu Cúa Phân Khu KHÁCH DU LỊCH (Tourist)

Đây là chức năng chính và chứa nhiều luồng dữ liệu phức tạp nhất để phục vụ trải nghiệm người dùng cuối.

### 2.1. Phân hệ Bản đồ và Địa điểm (Map & POI)
- **Luồng hoạt động:** 
  - Khách du lịch mở `MapPage`, Frontend đẩy lên tọa độ (Lat, Lng) của khách qua API `location.ts / poi.ts`.
  - Backend truy vấn cơ sở dữ liệu (vd: Redis Geospatial hoặc MongoDB GIS) trả về danh sách các nhà hàng, địa điểm ẩm thực (POI) quanh đó.
  - Khi người dùng click vào một POI (`PoiPage`), Frontend gọi API `getPoiById` để hiển thị ảnh, thông tin, bảng giá.
  - **Chỉ đường (Directions):** Thông qua `directions.ts`, Frontend gửi điểm Đi và Đến, Backend định tuyến đường bộ và trả về chuỗi Polyline. Frontend dùng Google Maps SDK hoặc Mapbox để vẽ đường đi này lên map.

### 2.2. Phân hệ Khuyến mãi và Đánh giá (Promotions & Reviews)
- **Lấy Khuyến mãi:** Frontend gọi qua `promotion.ts` lấy danh sách Voucher của quán đó. 
- **Claim Voucher:** Khi user bấm "Nhận", API `POST /claimVoucher` từ `userVouchers.ts` xác thực người dùng đã lưu Voucher, sinh ra 1 Mã Code duy nhất. User mang mã này đưa cho chủ quán quét.
- **Đánh giá (Review):** User nhập sao và điền chữ. Gửi request qua `reviews.ts` lên Backend. Backend cập nhật điểm trung bình của nhà hàng và lưu review, sau đó Frontend tự động refetch để hiển thị.

### 2.3. Tạo Lịch Trình Tự Động (Smart Tours)
- Khách điền nhu cầu: *"Tôi muốn lịch trình 3 ngày ở Hà Nội, đi bộ, ăn đồ truyền thống, chỉ ăn 3 bữa, giá rẻ"*.
- Frontend gọi API `POST` đến `tours.ts`. 
- **Tại Backend:** Thuật toán (hoặc AI tích hợp) lấy tham số -> sàng lọc POI -> sắp xếp logic (gần nhau) -> trả về một mảng gồm các chặng đường đi theo ngày và theo giờ. 
- Frontend nhận file JSON này, vẽ ra một Timeline các địa điểm, cho phép lưu lại (`userSavedTours.ts`) và đánh dấu đã đi (`userTours.ts`).

---

## 3. Luồng Dữ Liệu Của Phân Khu CHỦ QUÁN (Merchant)

Chủ quán dùng ứng dụng dạng B2B.

### 3.1. Quản lý Địa điểm và POS (Point of Sale)
- Component `ContentSection.tsx` của nhà hàng gửi sửa đổi qua `merchant.ts`. Frontend nén hình ảnh, gửi form dạng Multipart (hoặc Base64) để upload ảnh lên Backend.
- Chủ quán thiết lập Giờ mở cửa, mô tả. 
- Chủ quán dùng App scan mã giảm giá của Khách -> Frontend gọi API scan mã -> Backend kiểm tra tính hợp lệ của mã (Chưa dùng, Đúng chi nhánh) -> trừ tồn kho -> trả về thành công kết thúc luồng.

### 3.2. Analytics và Báo cáo (Tracking Logs & Analytics)
- Mỗi khi Khách du lịch ấn vào xem quán của họ, `trackingLogs.ts` sẽ ghi nhận ở Background 1 sự kiện (Event Logging) mà không làm lag giao diện của khách.
- Khi chủ quán mở trang Dasbhoard của mình: Frontend gọi `analytics.ts` -> Backend móc dữ liệu từ Log DB, group lại theo ngày (GroupBy) để tính số lượt xem, số lượt lấy Voucher, doanh thu quy đổi từ Voucher. Frontend vẽ Biểu đồ bằng ChartJS / Recharts.

### 3.3. Thanh toán (Payment & Finance)
- Luồng tạo gói thành viên (Premium Listing). Frontend gọi API lên `payment.ts` hoặc `finance.ts`. Backend tạo một URL thanh toán bảo mật (VNPay, Momo, hoặc Stripe) -> Frontend redirect người dùng sang trang kia.
- Khi thanh toán xong, đối tác thứ 3 Webhook ngầm về Backend -> Backend xác nhận, gỡ khóa tính năng Vip cho chủ quán.

---

## 4. Luồng Dữ Liệu Của Phân Khu QUẢN TRỊ VIÊN (Admin)

Đây là nơi điều khiển toàn bộ nền tảng (CMS).

- **Kiểm duyệt (Approve/Reject):** Khi có một Merchant mới đăng ký tài khoản và tạo nhà hàng, trạng thái của nó ở database là "Pending". 
- **Quản lý Users/Merchants:**  Frontend quản trị gọi `admin.ts`. Nó tải về hàng nghìn record sử dụng luồng "Phân trang (Pagination) và Lọc (Filtering)". Tham số gửi đi như `GET /admin/merchants?page=1&limit=50&status=pending`.
- Admin xem xét hồ sơ, bấm nút **Duyệt**. Frontend gửi lệnh `POST /admin/poi/123/approve`. Backend cập nhật CSDL thành "Approved", gửi thông báo cho Merchant.

---

## 5. Tóm Lược Về Flow Giao Tiếp Chung

Mô hình này là mô hình **Client-Server RESTful Tiêu Chuẩn**:

1. **State Management:** Mọi thứ thuộc về "thông tin cá nhân của phiên" sẽ được lưu vào Zustand. (`src/shared/store/appStore.ts`).
2. **HTTP Client:** Chịu trách nhiệm bảo mật và gắn kết nối. Mọi Service API đều là thuần túy Input-Output.
3. **Data Caching:** Nhưng điểm đặc biệt ở đây là tích hợp nhiều hệ phân tán dữ liệu Cache (như đã nói ở tính năng TTS), hay việc lưu Offline các bản đồ mini.
4. **Data Syncing:** Dữ liệu được refetch (tải lại) tuỳ vào hành vi của user. Ví dụ: Vừa Add Review thì lập tức Refetch list Reviews để thấy ngay trên UI.
