# Hướng dẫn chức năng và sử dụng To-Do-List

Tài liệu này tổng hợp các chức năng hiện có của ứng dụng, giải thích mục đích từng khu vực và hướng dẫn các thao tác thường dùng. Tên nút trong hướng dẫn theo giao diện tiếng Việt.

## 1. Đăng nhập và giao diện chính

### Đăng nhập

1. Mở `index.html`.
2. Nhập PIN 4 chữ số trên bàn phím hiển thị.
3. Nếu được cấp quyền quản trị, mở **Quản trị** ở cuối khung đăng nhập để vào trang quản trị.
4. Chọn **Đăng xuất** trên thanh trên cùng để kết thúc phiên.

Các chức năng quản lý lịch, danh mục nhân viên và nhập dữ liệu có thể yêu cầu quyền quản trị. Nếu nút không thực hiện thao tác, hãy liên hệ quản trị viên để kiểm tra quyền tài khoản.

### Lịch tháng và công việc trong ngày

- Dùng nút mũi tên hai bên tiêu đề để chuyển tháng.
- Chọn một ngày trên lịch để xem danh sách công việc của ngày đó.
- Dùng **Thêm công việc** để mở biểu mẫu tạo mới.
- Chọn một hoặc nhiều dòng trong danh sách để thao tác hàng loạt.
- Lịch có thể hiển thị dấu ngày nghỉ bù (NB), nghỉ lễ (NL) và số lượng công việc theo ngày.

### Tìm kiếm công việc

1. Nhập từ khóa vào ô tìm kiếm.
2. Chọn phạm vi **Tất cả**, **Theo ngày**, **Theo tuần**, **Theo tháng** hoặc **Theo năm**.
3. Nếu chọn phạm vi cụ thể, điền ngày, tháng hoặc năm tương ứng.
4. Chọn **Tìm kiếm**. Dùng nút xóa trong ô tìm kiếm hoặc xóa từ khóa và tìm lại để trở về danh sách ngày đang chọn.

## 2. Danh mục chức năng

Mở **Menu** để truy cập các nhóm chức năng sau:

| Nhóm | Chức năng | Mục đích |
| --- | --- | --- |
| Quản lý ngày NB / NL | Nghỉ bù (NB), Nghỉ lễ (NL) | Chọn ngày để đánh dấu, đổi hoặc xóa ngày NB/NL. |
| Lịch công tác | Lịch đi cửa hàng | Theo dõi ngày, giờ, nội dung xử lý, đơn vị, nhân sự và trạng thái chuyến đi. |
| Lịch công tác | Lịch bảo trì | Quản lý lịch bảo trì, thiết bị, chu kỳ, hạn, kết quả và tài liệu liên quan. |
| Lịch công tác | LỊCH NB - IT | Theo dõi NB, tăng ca, công tác, nghỉ lễ và nghỉ phép của nhân viên IT theo tháng/năm. |
| Import / Export | Nhập, xuất công việc; mẫu công việc | Trao đổi dữ liệu công việc với Excel và quản lý mẫu xuất. |
| Thao tác công việc | Nhân bản, xóa công việc | Tạo bản sao công việc hoặc xóa theo phạm vi ngày/tuần/tháng. |
| Nhân viên | Danh sách nhân viên | Tra cứu, lọc, chỉnh sửa hoặc nhập danh sách nhân viên. |

## 3. Công việc

### Tạo hoặc sửa công việc

1. Chọn ngày trên lịch rồi chọn **Thêm công việc**; để sửa, mở thao tác sửa tại dòng công việc cần cập nhật.
2. Điền các thông tin phù hợp: công việc, mô tả, người yêu cầu, đơn vị, người phụ trách, ngày bắt đầu/kết thúc, kết quả, hướng xử lý, trạng thái, phần trăm hoàn thành và ghi chú.
3. Có thể tìm và chọn người yêu cầu hoặc người phụ trách từ danh sách gợi ý. Các trường này hỗ trợ nhiều người, phân cách bằng dấu phẩy.
4. Chọn **Lưu công việc**.

Trạng thái công việc gồm **Chưa bắt đầu**, **Đang thực hiện**, **Hoàn thành** và **Chậm tiến độ**. Có thể cập nhật trạng thái và mức ưu tiên trực tiếp trên danh sách nếu các điều khiển đó được hiển thị.

### Nhân bản công việc

- Vào **Menu → Thao tác công việc → Nhân bản công việc**.
- Chọn công việc/ngày nguồn theo hướng dẫn trên màn hình.
- Trong hộp nhân bản nâng cao, chọn nhân bản sang nhiều ngày, một tuần hoặc một tháng; thêm ngày đích nếu chọn chế độ nhiều ngày.
- Kiểm tra lựa chọn và xác nhận nhân bản.

### Xóa công việc

- Xóa từng dòng bằng thao tác trên dòng đó; hoặc chọn nhiều dòng rồi dùng **Xóa đã chọn**.
- Xóa theo phạm vi: vào **Menu → Thao tác công việc → Xóa công việc**, chọn ngày, tuần hoặc tháng, xác định phạm vi và xác nhận.
- Các thao tác xóa có bước xác nhận. Kiểm tra phạm vi trước khi đồng ý vì dữ liệu đã xóa có thể không khôi phục được từ giao diện.

## 4. Quản lý ngày nghỉ NB / NL

1. Vào **Menu → Quản lý ngày NB / NL** rồi chọn **Nghỉ bù (NB)** hoặc **Nghỉ lễ (NL)**.
2. Chọn chức năng lựa chọn ngày để mở lịch tương ứng; chọn năm/tháng và ngày cần đánh dấu theo giao diện.
3. Để đổi hoặc xóa ngày đã đánh dấu, chọn ngày đó ở trường **Chọn NB/NL cần chỉnh**, sau đó chọn **Đổi ngày** hoặc **Xóa**.
4. Xác nhận thông báo trước khi hoàn tất.

Ngày NB và NL được đánh dấu trên lịch chính. Không thể chuyển một ngày sang ngày đã có NB hoặc NL.

## 5. Lịch công tác

Vào **Menu → LỊCH CÔNG TÁC**, sau đó chọn một trong ba lịch.

### Lịch đi cửa hàng

1. Chọn **Lịch đi cửa hàng → Thêm lịch**.
2. Nhập ngày, giờ, nội dung xử lý, đơn vị/cửa hàng, người thực hiện, trạng thái và ghi chú.
3. Có thể chọn tối đa 5 người thực hiện từ danh sách gợi ý.
4. Chọn **Lưu lịch**. Dùng thao tác sửa trên dòng lịch để cập nhật; nút làm mới tải lại danh sách.

Các trạng thái bao gồm chưa bắt đầu, đang thực hiện, chậm tiến độ, đã lên lịch, hoàn thành, chờ và đã hủy. Nếu lịch đang ở trạng thái cho phép chưa xác định ngày, ngày/giờ có thể không bắt buộc.

### Lịch bảo trì

1. Chọn **Lịch bảo trì → Tạo lịch bảo trì**.
2. Nhập đơn vị/phòng ban, người phụ trách, thiết bị/hệ thống, nội dung, chu kỳ và khoảng thời gian.
3. Có thể điền ngày đến hạn, trạng thái, kết quả, ghi chú và liên kết; có thể tải lên bằng chứng/biên bản.
4. Chọn **Lưu lịch**. Bằng chứng tải lên tối đa 10 MB.

Trang bảo trì có các thẻ tổng quan về lịch đến hạn, lịch hoàn tất và thiết bị cần chú ý. Chọn **Cần chú ý** cho lịch cần theo dõi.

### Nhập và xuất lịch công tác

- Dùng **Nhập Excel** để thêm dữ liệu từ `.xlsx`, `.xls` hoặc `.csv` (tối đa 10 MB). Hệ thống hiển thị xác nhận số lịch sẽ thêm; dữ liệu hiện tại được giữ lại.
- Dùng **Xuất Excel** để tải danh sách lịch của loại đang mở.
- Kiểm tra cột tiêu đề và định dạng ngày trong file trước khi nhập. Dữ liệu không hợp lệ sẽ không được nhận diện thành lịch.

## 6. LỊCH NB - IT

Lịch NB - IT thể hiện nhân viên theo hàng và ngày trong tháng theo cột. Bộ lọc năm và tháng cho phép xem cả năm hoặc một tháng cụ thể. Màu ô biểu thị loại lịch; nội dung ô có thể được bấm để sửa.

### Thêm hoặc cập nhật lịch

1. Chọn **＋ Thêm lịch** hoặc bấm dấu cộng tại ô trống tương ứng với nhân viên/ngày.
2. Chọn loại: **NB**, **TC**, **HD - Công tác**, **NL** hoặc **NP**; nhập nội dung hiển thị nếu cần và chọn ngày bắt đầu/kết thúc.
3. Với **HD - Công tác**, có thể chọn nhiều nhân viên. Với các loại khác, chỉ chọn một nhân viên.
4. Chọn **Lưu lịch**. Để sửa, bấm vào ô lịch hiện có rồi lưu thay đổi; lịch HD được cập nhật cho cả nhóm nhân viên cùng chuyến.
5. Khi xóa lịch HD đã gộp, xác nhận để xóa lịch của cả nhóm.

Không thể lưu lịch trùng khoảng ngày cho cùng một nhân viên. Nếu thông báo có lịch trùng, điều chỉnh nhân viên hoặc khoảng ngày rồi thử lại.

### Thêm nhanh NB và chọn nhiều ô

- Có thể bấm đúp vào ô trống hoặc nhập phím tắt `NB` trên ô trống để thêm nhanh NB, tùy thiết bị/trình duyệt.
- Chọn **Chọn nhiều ngày NB**, bấm các ô trống muốn thêm, rồi chọn **Thêm NB đã chọn**.
- Dùng **Bỏ chọn** để xóa các ô đã đánh dấu trước khi lưu.

### Nhập, xuất và làm mới lịch NB - IT

- **Nhập Excel** nhận mẫu lịch NB - IT theo cấu trúc các khu vực tháng. Hệ thống đối chiếu mã nhân viên và bỏ qua các ô đã có lịch/trùng dữ liệu.
- **Xuất Excel** tải lịch của năm hoặc tháng đang chọn; file có bảng theo tháng và trang chi tiết.
- Chọn **Tải lại** để đọc dữ liệu lịch mới nhất.
- **Xóa toàn bộ lịch** xóa tất cả lịch NB - IT của tài khoản hiện tại ở mọi năm; chỉ thực hiện sau khi kiểm tra kỹ và xác nhận.

## 7. Nhập / xuất công việc và mẫu Excel

### Xuất công việc

1. Vào **Menu → Import / Export → Xuất công việc**.
2. Chọn ngày, tuần, tháng hoặc khoảng thời gian rồi chọn mốc tương ứng.
3. Chọn **Xuất** để tải file Excel. Có thể cần tải mẫu công việc lên trước khi xuất.

### Nhập công việc

1. Vào **Menu → Import / Export → Nhập công việc**.
2. Chọn kiểu nhập tự động, tuần, tháng hoặc khoảng thời gian.
3. Chọn file `.xlsx` đúng cấu trúc file xuất.
4. Dùng **Xem trước** để kiểm tra dữ liệu rồi chọn **Nhập**.

File có thể gồm nhiều sheet (mỗi sheet đại diện cho ngày) hoặc một sheet có cột **Ngày**. Ở chế độ tuần/tháng, dòng thiếu ngày có thể được gán ngày bắt đầu của phạm vi; ở chế độ khoảng thời gian, chỉ các dòng có ngày hợp lệ trong khoảng được nhập.

### Mẫu công việc

Vào **Menu → Import / Export → Mẫu công việc** để tải mẫu `.xlsx` (tối đa 5 MB), xem trước các sheet, tải lại dữ liệu mẫu hoặc xóa mẫu đã lưu. Tải mẫu lên trước khi xuất nếu hệ thống yêu cầu.

## 8. Danh sách nhân viên

Vào **Menu → Nhân viên** để:

- Tìm theo tên, mã nhân viên hoặc số điện thoại.
- Lọc theo tên bộ phận hiện tại và chuyển trang (50 hoặc 100 nhân viên/trang).
- Chọn một nhân viên để sửa thông tin như mã, họ tên, nơi làm việc, bộ phận, chức danh, liên hệ và trạng thái.
- Dùng **Tải lên Excel** để nhập danh sách `.xlsx`, `.xls` hoặc `.csv`.
- Xóa một nhân viên hoặc xóa toàn bộ danh sách khi có quyền phù hợp; thao tác xóa toàn bộ cần được xác nhận cẩn thận.

Danh sách nhân viên được dùng làm nguồn gợi ý người yêu cầu/người phụ trách và nhân viên IT trong các biểu mẫu khác.

## 9. Trang quản trị

Mở **Quản trị** ở màn hình đăng nhập hoặc trang `admin/admin.html`, sau đó đăng nhập bằng PIN có quyền quản trị.

| Khu vực | Chức năng |
| --- | --- |
| Tổng quan | Xem số lượng tài khoản theo nhóm quyền và lối tắt đến công cụ quản trị. |
| Người dùng | Thêm/sửa tài khoản, cập nhật PIN và vai trò; tìm tài khoản theo tên hoặc PIN. |
| Công việc | Chọn tài khoản để tra cứu công việc của tài khoản đó. |
| Nhật ký chỉnh sửa | Khu vực đang phát triển; hiện chưa cung cấp nhật ký chỉnh sửa đầy đủ. |
| Nhật ký đăng nhập | Xem, tìm kiếm và tải lại các sự kiện đăng nhập được hệ thống ghi nhận. |

Các vai trò tài khoản hiện có: **Thành viên**, **Phòng Ban**, **Quản trị viên** và **Quản trị viên cấp cao**. Chỉ người được phân quyền phù hợp mới có thể mở các thao tác quản trị hoặc sửa dữ liệu nhạy cảm.

## 10. Lưu ý khi thao tác

- Dùng nút **Hủy** hoặc nút đóng để rời biểu mẫu chưa lưu.
- Đợi thông báo lưu thành công trước khi đóng trang hoặc chuyển tài khoản.
- Khi nhập Excel, giữ nguyên cấu trúc cột và tiêu đề của mẫu để hệ thống nhận diện dữ liệu.
- Kiểm tra kỹ năm, tháng, khoảng ngày, tài khoản và phạm vi trước khi nhập/xóa hàng loạt.
- Nếu dữ liệu chưa cập nhật lên màn hình, dùng **Tải lại** ở khu vực tương ứng.
