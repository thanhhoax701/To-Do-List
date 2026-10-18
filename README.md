# Quản lý công việc

Ứng dụng web quản lý công việc theo lịch, lưu dữ liệu trên Firebase và có giao diện quản trị người dùng, công việc cùng nhật ký hệ thống.

## Ngôn ngữ và công nghệ

- **HTML5**: cấu trúc giao diện chính và trang quản trị.
- **CSS3**: giao diện, bố cục và kiểu hiển thị.
- **JavaScript (ES modules)**: xử lý giao diện, lịch, dữ liệu và các thao tác quản trị.
- **Firebase JavaScript SDK 10.7.1**:
  - **Realtime Database**: lưu dữ liệu ứng dụng và nhật ký.
  - **Cloud Storage**: lưu trữ tệp.
- **SheetJS (xlsx 0.18.5)** và **ExcelJS (4.4.0)**: hỗ trợ xử lý bảng tính Excel.
- Thư viện Firebase và Excel được tải từ CDN; dự án hiện không có bước build hoặc manifest quản lý package.

## Tính năng chính

- Đăng nhập bằng mã PIN và quản lý công việc theo lịch.
- Tài khoản Phòng Ban phải nhập email khớp hồ sơ và được Admin duyệt yêu cầu truy cập trước khi vào ứng dụng.
- Lưu và cập nhật dữ liệu ứng dụng trên Firebase Realtime Database.
- Hỗ trợ lưu trữ tệp qua Firebase Storage.
- Trang quản trị để quản lý người dùng, công việc và xem nhật ký chỉnh sửa/đăng nhập.
- Hỗ trợ xử lý dữ liệu bảng tính Excel.

## Cấu trúc thư mục

| Tệp | Mô tả |
| --- | --- |
| `index.html` | Giao diện ứng dụng chính. |
| `style.css` | Kiểu giao diện dùng chung. |
| `script.js` | Logic ứng dụng chính và thao tác dữ liệu. |
| `firebase.js` | Khởi tạo Firebase và xuất các dịch vụ được sử dụng. |
| `login-log.js` | Ghi nhật ký đăng nhập lên Firebase. |
| `admin/index.html` | Giao diện quản trị. |
| `admin/admin.css` | Kiểu giao diện quản trị. |
| `admin/admin.js` | Logic quản trị và thao tác dữ liệu. |
| `COMMENTS_GUIDE.md` | Hướng dẫn quy ước chú thích trong mã nguồn. |
| `*.json` | Các tệp dữ liệu xuất/backup Firebase; không phải mã nguồn chạy của ứng dụng. |

## Chạy ứng dụng

1. Cấu hình thông tin Firebase của dự án trong `firebase.js`.
2. Với các tài khoản Phòng Ban đã có, Admin cần cập nhật email trong mục **Quản lý người dùng**.
3. Mở thư mục dự án bằng một máy chủ web tĩnh hoặc triển khai lên dịch vụ hosting hỗ trợ HTTPS. Không mở trực tiếp bằng `file://`, vì ứng dụng dùng JavaScript ES modules và tải Firebase SDK từ CDN.
4. Truy cập `index.html` để dùng ứng dụng chính; trang quản trị nằm tại `admin/index.html`.

Ứng dụng không có lệnh `npm run` hoặc bước build được cấu hình trong repository. Cần có kết nối Internet để tải Firebase SDK và các thư viện Excel từ CDN.

## Lưu ý bảo mật

Cấu hình Firebase ở phía trình duyệt không phải thông tin bí mật; việc mã hóa Base64 trong `firebase.js` chỉ làm mờ nội dung, không bảo vệ khóa hay dữ liệu. Hãy cấu hình Firebase Security Rules để giới hạn quyền đọc/ghi đúng theo yêu cầu. Không xem mã PIN hoặc kiểm soát giao diện phía trình duyệt là cơ chế phân quyền an toàn thay cho bảo vệ ở Firebase.

Luồng email hiện chỉ đối chiếu email người dùng nhập với email trong hồ sơ Firebase; **không gửi mã OTP hoặc xác minh quyền sở hữu hộp thư**. Yêu cầu duyệt được lưu trong Realtime Database và hiển thị theo thời gian thực ở mục **Yêu cầu truy cập** của trang Admin; không có email thông báo gửi ra ngoài. Để dùng xác thực email thực sự và bảo vệ trạng thái duyệt khỏi việc sửa từ trình duyệt, cần tích hợp Firebase Authentication hoặc backend/Cloud Functions cùng Firebase Security Rules phù hợp.
