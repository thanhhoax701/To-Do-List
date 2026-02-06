# Hướng dẫn Comments cho script.js

## 📋 Danh sách các phần chính và chú thích

### 1. **IMPORT FIREBASE** (Dòng 1-2)
- ✅ Đã cập nhật Tiếng Việt
- Nhập Firebase Realtime Database và các hàm cần thiết

---

### 2. **DOM ELEMENTS** (Dòng 4-57)
- ✅ Đã cập nhật Tiếng Việt chi tiết
- Lấy các phần tử HTML từ DOM để sử dụng trong JavaScript

**Các element chính:**
- Lịch và tiêu đề tháng
- Nút chuyển tháng
- Dropdown xóa (ngày/tuần/tháng/công việc chọn)
- Modal thêm/sửa công việc
- Input fields cho công việc
- Loading indicator

---

### 3. **BIẾN TOÀN CỤC** (Dòng 59-62)
- Lưu trạng thái ứng dụng
- `currentDate`: Ngày đang hiển thị trên lịch
- `selectedDate`: Ngày được chọn hiện tại (YYYY-MM-DD)
- `multiDates`: Danh sách ngày cho nhân bản liên tiếp

---

### 4. **HÀM LỊCH** (Dòng 64-120)
#### `renderCalendar()`
- **Chức năng**: Vẽ lịch tháng hiện tại
- **Ghi chú cần thêm**:
  - Tính toán first day (thứ của ngày 1)
  - Thêm ô trống cho ngày tháng trước
  - Tạo các element cho từng ngày
  - Đánh dấu hôm nay bằng class

#### `pad(n)`
- **Chức năng**: Chuyển số sang chuỗi 2 chữ số (5 → "05")
- **Sử dụng**: Định dạng YYYY-MM-DD

---

### 5. **HỖ TRỢ NGÀY THÁNG** (Dòng 122-210)
#### `toYMDLocal(d)`
- Chuyển Date object → YYYY-MM-DD (dùng giờ địa phương)

#### `parseYMD(ds)`
- Chuyển YYYY-MM-DD → Date object (dùng giờ địa phương)

#### `getWeekNumber(ds)`
- **Chức năng chính**: Tính số tuần (week1, week2, ...)
- **Logic**:
  - week1 = ngày trước thứ 2 đầu tiên
  - week2+ = bắt từ thứ 2, mỗi lô 7 ngày

#### `getWeekStartEnd(year, month, weekNum)`
- Lấy ngày bắt đầu (thứ 2) và kết thúc (chủ nhật) của tuần

#### `populateWeekSelect(dateStr)`
- Tạo dropdown tuần với các tuần của tháng hiện tại

---

### 6. **MODAL TÙYCHỈNH** (Dòng 232-280)
✅ _Đã cập nhật đầy đủ_

#### `hideCustomAlert()`
- Ẩn modal

#### `showCustomAlert(html)`
- Hiển thị thông báo (chỉ nút OK)
- Trả về Promise

#### `showCustomConfirm(html)`
- Hiển thị xác nhận (OK + Hủy)
- Trả về Promise<boolean>

#### `showLoading()` / `hideLoading()`
- Hiển thị/ẩn vòng xoay loading

#### `formatDisplayDate(ds)`
- Chuyển YYYY-MM-DD → DD-MM-YYYY (hiển thị)

#### `selectDate(ds, el)`
- Xử lý khi người dùng chọn ngày
- Highlight ngày
- Tải công việc của ngày đó
- Cập nhật tuần dropdown

---

### 7. **PHÂN LOẠI MÀU** (Dòng 309-325)
✅ _Đã cập nhật_

#### `priorityClass(v)`
- priority-low: "Thấp"
- priority-medium: "Trung bình"
- priority-high: "Cao"

#### `statusClass(v)`
- status-pending: "Chưa xử lý"
- status-doing: "Đang xử lý"
- status-done: "Đã xử lý"

#### `createColorSelect(options, value, getClass, callback)`
✅ _Đã cập nhật_
- Tạo dropdown với class CSS động
- Khi thay đổi: cập nhật class + gọi callback (lưu DB)

---

### 8. **LOAD & HIỂN THỊ CÔNG VIỆC** (Dòng 328-475)
✅ _Đã cập nhật chi tiết_

#### `loadTasks(ds)`
- **Chức năng**: Tải công việc của 1 ngày cụ thể
- **Logic**:
  - Lấy dữ liệu từ Firebase Realtime (`onValue` listener)
  - Tạo hàng bảng cho mỗi công việc
  - Thêm checkbox, dropdown ưu tiên/trạng thái
  - Bind nút nhân bản, sửa, xóa

---

### 9. **MODAL THÊM/SỮA** (Dòng 477-542)
✅ _Đã cập nhật_

#### `openModal(title, id, t)`
- Mở modal với dữ liệu (thêm mới hoặc sửa)

#### `saveTaskBtn.onclick`
- Lưu công việc mới hoặc cập nhật
- Kiểm tra: có ID? → update : push

---

### 10. **NÚT CHUYỂN THÁNG** (Dòng 542-556)
#### `nextBtn.onclick`
- Chuyển tháng tiếp theo

#### `prevBtn.onclick`
- Chuyển tháng trước

---

### 11. **TỰ ĐỘNG CHỌN HÔM NAY** (Dòng 558-574)
✅ _Đã cập nhật_

#### `startApp()`
- Khởi tạo ứng dụng sau khi login
- Vẽ lịch
- Áp dụng quyền hạn
- Tự động chọn hôm nay

---

### 12. **NHÂN BẢN NÂNG CAO** (Dòng 576-950)
- Nhân bản công việc sang:
  - Nhiều ngày cụ thể
  - Tuần khác
  - Tháng khác

**Các hàm**:
- `populateTargetWeeks()`: Populate dropdown tuần tiếp theo
- `confirmAdvBtn.onclick`: Thực hiện nhân bản (có loading)

---

### 13. **LOAD CÔNG VIỆC CỦA TUẦN** (Dòng 952-1020)
#### `loadTasksForWeek(y, m, weekId)`
- Tải tất cả công việc của 1 tuần
- Sắp xếp các ngày theo thứ tự

---

### 14. **ĐẾM CÔNG VIỆC** (Dòng 1022-1170)
#### `countTasksForDay(date)` → number
- Đếm công việc của 1 ngày

#### `countTasksForWeek(date)` → number
- Đếm công việc của 1 tuần

#### `countTasksForWeekById(y, m, weekId)` → number
- Đếm công việc của 1 tuần cụ thể

#### `countTasksForMonth(date)` → number
- Đếm công việc của 1 tháng

#### `countDaysAndTasksForMonth(date)` → {daysCount, tasksCount, details}
- Đếm ngày + công việc của tháng (có chi tiết per-date)

#### `countDaysAndTasksForWeekById(y, m, weekId)` → {daysCount, tasksCount, details}
- Đếm ngày + công việc của tuần (có chi tiết per-date)

---

### 15. **XÓA NGÀY/TUẦN/THÁNG** (Dòng 1172-1280)
#### `deleteSelectMain.onchange`
- Dropdown xóa chính
- **3 trường hợp**:
  - `type === "day"`: Xóa 1 ngày
    - Đếm công việc → Xác nhận → Xóa (có loading)
  - `type === "week"`: Xóa 1 tuần
    - Hiển thị chi tiết ngày → Xác nhận → Xóa (có loading)
  - `type === "month"`: Xóa 1 tháng
    - Hiển thị chi tiết ngày → Xác nhận → Xóa (có loading)

---

### 16. **XÓA CÔNG VIỆC CHỌN** (Dòng 1282-1314)
#### `selectAllCheckbox.onchange`
- Chọn/bỏ chọn tất cả checkbox

#### `deleteSelect.onchange`
- Xóa đã chọn
- **Logic**:
  1. Xác nhận xóa
  2. Hiển thị loading
  3. Lặp mỗi checkbox chọn → xóa từ DB
  4. Ẩn loading → Hiển thị thông báo

---

### 17. **LOGIN & PIN** (Dòng 1316-1465)
✅ _Đã cập nhật_

#### `updatePinDots()`
- Cập nhật hiển thị 4 điểm

#### `attemptLogin(pin)`
- **Logic**:
  1. Hiển thị loading
  2. Lấy danh sách users từ DB
  3. Tìm PIN khớp
  4. Nếu đúng: Lưu session → Hiển thị main → Gọi startApp()
  5. Nếu sai: Rung (shake) → Xóa PIN

#### `onLoginFail()`
- Hiệu ứng rung + xóa PIN

#### Keyboard support
- Phím số 0-9: Nhập PIN
- Phím C: Xóa tất cả
- Backspace: Xóa 1 số
- Enter: Đăng nhập

#### `updateUserDisplay()`
- Hiển thị tên user đăng nhập

#### `getLoggedInUserRole()`
- Lấy role từ sessionStorage

#### `isMember()` / `isAdmin()`
- Kiểm tra role

#### `getTodayString()`
- Lấy YYYY-MM-DD hôm nay

#### `checkMemberAccess(dateStr)`
- Kiểm tra: Member chỉ được xem hôm nay?

#### `applyRolePermissions()`
- Ẩn/hiện UI dựa trên role
- **Member không thể**:
  - Nhân bản
  - Xóa
  - Sửa (nhưng xem được)

#### Logout
- Xóa session → Ẩn main → Hiện login overlay

#### Auto-login
- Nếu có session, tự động đăng nhập

---

## 📝 Tóm tắt

| Phần | Trạng thái | % Chi tiết |
|------|-----------|-----------|
| Import | ✅ | 100% |
| DOM Elements | ✅ | 90% |
| Biến Toàn Cục | ✅ | 80% |
| Hàm Lịch | ⚠️ | 60% |
| Hỗ Trợ Ngày Tháng | ⚠️ | 70% |
| Modal Tùychỉnh | ✅ | 95% |
| Phân Loại Màu | ✅ | 95% |
| Load Công Việc | ✅ | 90% |
| Modal Thêm/Sửa | ✅ | 90% |
| Nút Chuyển Tháng | ⚠️ | 50% |
| Tự Động Chọn Hôm Nay | ✅ | 90% |
| Nhân Bản Nâng Cao | ⚠️ | 40% |
| Load Tuần | ⚠️ | 50% |
| Đếm Công Việc | ✅ | 85% |
| Xóa Ngày/Tuần/Tháng | ⚠️ | 60% |
| Xóa Công Việc Chọn | ✅ | 90% |
| Login & PIN | ✅ | 85% |
| Quyền Hạn | ✅ | 90% |

---

## 🎯 Các phần cần bổ sung chi tiết hơn:

1. **Hàm Lịch** - Thêm chi tiết về tính toán ngày
2. **Hỗ Trợ Ngày Tháng** - Giải thích công thức tuần
3. **Nhân Bản Nâng Cao** - Ghi chú về cách tính offset ngày
4. **Load Tuần** - Giải thích cách sắp xếp ngày

---

_Cập nhật: 6 tháng 2, 2026_
