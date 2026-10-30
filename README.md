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
- Tài khoản Phòng Ban phải nhập PIN, xác minh email bằng liên kết Firebase Authentication và được Admin duyệt yêu cầu truy cập trước khi vào ứng dụng.
- Lưu và cập nhật dữ liệu ứng dụng trên Firebase Realtime Database.
- Hỗ trợ lưu trữ tệp qua Firebase Storage.
- Trang quản trị để quản lý người dùng, công việc và xem nhật ký chỉnh sửa/đăng nhập.
- Hỗ trợ xử lý dữ liệu bảng tính Excel.
- Lịch NB - IT nhận diện mã `TL` (trực lễ) khi nhập Excel và hiển thị riêng trên lịch.

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
2. Trong Firebase Console, vào **Authentication → Sign-in method**, bật **Email/Password** và **Email link (passwordless sign-in)**. Các email hiện có trong Firebase Authentication có thể dùng với luồng email-link.
3. Trong **Authentication → Settings → Authorized domains**, thêm domain nơi triển khai ứng dụng (ví dụ `localhost` khi chạy local).
4. Với tài khoản Phòng Ban, Admin cần cập nhật email trong mục **Quản lý người dùng**. Email này phải trùng email được xác minh qua Firebase.
5. Mở ứng dụng từ máy chủ web hoặc HTTPS; không mở trực tiếp bằng `file://` vì ứng dụng sử dụng ES modules.
6. Truy cập `index.html` để dùng ứng dụng chính; trang quản trị nằm tại `admin/index.html`.

Ứng dụng không có lệnh `npm run` hoặc bước build được cấu hình trong repository. Cần có kết nối Internet để tải Firebase SDK và các thư viện Excel từ CDN.

## Lưu ý bảo mật

Cấu hình Firebase ở phía trình duyệt không phải thông tin bí mật; việc mã hóa Base64 trong `firebase.js` chỉ làm mờ nội dung, không bảo vệ khóa hay dữ liệu. Hãy cấu hình Firebase Security Rules để giới hạn quyền đọc/ghi đúng theo yêu cầu. Không xem mã PIN hoặc kiểm soát giao diện phía trình duyệt là cơ chế phân quyền an toàn thay cho bảo vệ ở Firebase.

Tài khoản Phòng Ban cần PIN và link đăng nhập email do Firebase Authentication gửi; bấm link sẽ xác minh quyền sở hữu email. Sau khi PIN và email khớp, yêu cầu xuất hiện trong mục **Yêu cầu truy cập** của Admin. Admin có thể duyệt, chặn, hoặc gỡ chặn (gỡ chặn sẽ đưa tài khoản về trạng thái cần duyệt lại); email cũng phải được xác minh trước khi vào ứng dụng. Trạng thái yêu cầu được theo dõi trực tiếp, và phiên đang hoạt động sẽ bị đăng xuất khi Admin chặn hoặc thu hồi quyền. Đây là thông báo trực tiếp trong trang Admin, không phải email gửi đến hộp thư Admin.

Các thao tác duyệt/chặn và kiểm tra phiên hiện được thực thi ở phía trình duyệt. Chúng giúp kiểm soát luồng giao diện nhưng **không phải cơ chế bảo mật có thể chống sửa mã hoặc gọi trực tiếp Firebase API**. Để bảo vệ dữ liệu thật sự, cần xác thực và phân quyền bằng Firebase Security Rules/Cloud Functions; không cấp quyền ghi `accessRequests` hay đọc dữ liệu nhạy cảm dựa trên trạng thái mà client tự khai báo.
