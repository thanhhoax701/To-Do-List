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
- Trang Admin yêu cầu đăng nhập Firebase Email/Password và UID được cấp quyền trong `adminAccess`.
- Tài khoản Phòng Ban phải nhập PIN, xác minh email bằng liên kết Firebase Authentication và được Admin duyệt yêu cầu truy cập trước khi vào ứng dụng.
- Lưu và cập nhật dữ liệu ứng dụng trên Firebase Realtime Database.
- Hỗ trợ lưu trữ tệp qua Firebase Storage.
- Admin có thể sắp xếp thứ tự công việc trong danh sách từng ngày; thứ tự được lưu trên Firebase.
- Trang quản trị để quản lý người dùng, công việc và xem nhật ký chỉnh sửa/đăng nhập. Nhật ký chỉnh sửa ghi nhận các thao tác công việc phát sinh từ khi tính năng được triển khai.
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
| `firebase.json` | Trỏ Firebase CLI tới tệp Realtime Database Rules. |
| `database.rules.json` | Rules cho dữ liệu ứng dụng, whitelist Admin và nhật ký. |
| `COMMENTS_GUIDE.md` | Hướng dẫn quy ước chú thích trong mã nguồn. |
| Các tệp backup JSON | Dữ liệu xuất/backup Firebase; không phải mã nguồn chạy của ứng dụng. |

## Chạy ứng dụng

1. Cấu hình thông tin Firebase của dự án trong `firebase.js`.
2. Trong Firebase Console, vào **Authentication → Sign-in method**, bật **Email/Password** và **Email link (passwordless sign-in)**. Email/Password dùng cho Admin; Email link dùng cho tài khoản Phòng Ban.
3. Với mỗi Admin/Super Admin, tạo tài khoản **Email/Password** trong **Authentication → Users**. Tạo thủ công nút `adminAccess/{UID}` trong Realtime Database, với `enabled: true`, `userId` là khóa hồ sơ trong `users`, và `role` trùng vai trò hồ sơ (`admin` hoặc `superadmin`). Không cấp quyền này từ client; Rules từ chối client ghi `adminAccess`.
4. Triển khai Rules trong `database.rules.json` bằng Firebase CLI (`firebase deploy --only database`) sau khi chọn đúng Firebase project. Có thể kiểm tra và triển khai riêng Rules trong Firebase Console.
5. Trong **Authentication → Settings → Authorized domains**, thêm domain nơi triển khai ứng dụng (ví dụ `localhost` khi chạy local).
6. Với tài khoản Phòng Ban, Admin cần cập nhật email trong mục **Quản lý người dùng**. Email này phải trùng email được xác minh qua Firebase.
7. Mở ứng dụng từ máy chủ web hoặc HTTPS; không mở trực tiếp bằng `file://` vì ứng dụng sử dụng ES modules.
8. Truy cập `index.html` để dùng ứng dụng chính; trang quản trị nằm tại `admin/index.html`.

Ứng dụng không có lệnh `npm run` hoặc bước build được cấu hình trong repository. Cần có kết nối Internet để tải Firebase SDK và các thư viện Excel từ CDN.

## Lưu ý bảo mật

Cấu hình Firebase ở phía trình duyệt không phải thông tin bí mật; việc mã hóa Base64 trong `firebase.js` chỉ làm mờ nội dung, không bảo vệ khóa hay dữ liệu. Hãy cấu hình Firebase Security Rules để giới hạn quyền đọc/ghi đúng theo yêu cầu. Không xem mã PIN hoặc kiểm soát giao diện phía trình duyệt là cơ chế phân quyền an toàn thay cho bảo vệ ở Firebase.

Admin đăng nhập ở trang quản trị bằng Email/Password Firebase và được đối chiếu với `adminAccess/{UID}`; trong ứng dụng chính, Admin vẫn nhập PIN hồ sơ cùng Email/Password Firebase. Tài khoản Phòng Ban cần PIN và link đăng nhập email do Firebase Authentication gửi; bấm link sẽ xác minh quyền sở hữu email. Sau khi PIN và email khớp, yêu cầu xuất hiện trong mục **Yêu cầu truy cập** của Admin. Admin có thể duyệt, chặn, hoặc gỡ chặn (gỡ chặn sẽ đưa tài khoản về trạng thái cần duyệt lại); email cũng phải được xác minh trước khi vào ứng dụng. Trạng thái yêu cầu được theo dõi trực tiếp, và phiên đang hoạt động sẽ bị đăng xuất khi Admin chặn hoặc thu hồi quyền. Đây là thông báo trực tiếp trong trang Admin, không phải email gửi đến hộp thư Admin.

Nhật ký chỉnh sửa lưu các thao tác thêm, cập nhật, đổi trạng thái, xóa, nhân bản, nhập và sắp xếp công việc. Nhật ký không được tạo ngược cho dữ liệu cũ; Admin xem tối đa 200 sự kiện mới nhất. Rules chỉ cho UID Admin đã được whitelist đọc nhật ký; client chỉ được thêm sự kiện mới khớp `userId`/`role` trong whitelist và không thể sửa/xóa sự kiện cũ. Nhật ký vẫn do trình duyệt ghi nên không phải bản ghi kiểm toán chống giả mạo.

**Giới hạn của Rules hiện tại:** để giữ quyền truy cập cũ theo phạm vi đã chọn, các nhánh dữ liệu ứng dụng như `users`, `tasks`, lịch và `accessRequests` vẫn được cấu hình đọc/ghi công khai. `loginLogs` cho phép ghi công khai để giữ luồng đăng nhập PIN hiện tại, nhưng chỉ Admin đã xác thực mới được đọc. Do đó thay đổi này khóa trang Admin và nhật ký chỉnh sửa, **không bảo vệ dữ liệu công việc/người dùng khỏi truy cập công khai**. Cần thiết kế lại quyền các nhánh ứng dụng riêng trước khi triển khai nếu muốn bảo mật toàn bộ dữ liệu.

Các thao tác duyệt/chặn và kiểm tra phiên hiện được thực thi ở phía trình duyệt. Chúng giúp kiểm soát luồng giao diện nhưng **không phải cơ chế bảo mật có thể chống sửa mã hoặc gọi trực tiếp Firebase API**. Không cấp quyền đọc dữ liệu nhạy cảm dựa trên trạng thái mà client tự khai báo.
