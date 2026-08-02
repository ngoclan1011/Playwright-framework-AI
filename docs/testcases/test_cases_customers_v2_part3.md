# Manual Test Cases — Module Customers · Part 3: Chi tiết, Xoá & Contacts

| Thông tin | Nội dung |
|---|---|
| Phần | **Part 3/4** — Billing & Shipping, CSRF, trang chi tiết, xoá khách hàng, quản lý liên hệ |
| REQ bao phủ | REQ-CUST-25, REQ-CUST-27 → REQ-CUST-46 |
| Số TC | 40 (`CRM_CUST_TC_077` → `CRM_CUST_TC_116`) |
| Index | [test_cases_customers_v2_index.md](test_cases_customers_v2_index.md) — Assumptions, coverage toàn module |
| Nguồn requirement | [requirements_customers.md](../requirements/requirements_customers.md) |
| Phiên bản | 2.0 |

> ⚠️ **Chỉ xoá khách hàng do chính test tạo ra và chưa phát sinh dữ liệu liên quan** (ASM-07, RISK-10). Nhánh xoá khách hàng đang có hoá đơn/dự án/hợp đồng **nằm ngoài phạm vi** — xem Gap #2 trong index.
> 📌 Locator liên hệ phải giới hạn trong phạm vi `#contact` (`#email`, `#firstname`, `#lastname` xuất hiện nhiều nơi trên trang). Công tắc quyền định vị bằng `input[name="permissions[]"]`, **không dùng `#1`…`#6`** (RISK-05).

---

## Nhóm 3.1 — Địa chỉ thanh toán & giao hàng

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_077 | REQ-CUST-25 | Customers | Medium | Nhập đủ bộ địa chỉ Billing và lưu đúng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700488`<br>2. Chuyển sang tab `Billing & Shipping`<br>3. Nhập Billing Street: `12 Le Duan`, City: `Da Nang`, State: `Hai Chau`, Zip: `550000`, Country: `Vietnam`<br>4. Click `Save`<br>5. Mở lại form sửa, sang tab Billing & Shipping, đọc 5 giá trị vừa nhập | Company: `Auto_Customer_1785700488`<br>Billing: `12 Le Duan` / `Da Nang` / `Hai Chau` / `550000` / `Vietnam` | 3. Các ô nhận đúng giá trị<br>4. Tạo thành công, chuyển tới trang chi tiết<br>5. Cả 5 trường Billing hiển thị đúng giá trị đã nhập | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_078 | REQ-CUST-25 | Customers | Medium | Bộ địa chỉ Shipping độc lập với Billing | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700489`<br>2. Sang tab `Billing & Shipping`<br>3. Nhập Billing City: `Da Nang`<br>4. Nhập Shipping City: `Ha Noi` (khác Billing)<br>5. Click `Save`<br>6. Mở lại form sửa, đọc Billing City và Shipping City | Billing City: `Da Nang`<br>Shipping City: `Ha Noi` | 4. Hai ô nhận hai giá trị khác nhau, không đồng bộ tự động<br>5. Tạo thành công<br>6. Billing City = `Da Nang`, Shipping City = `Ha Noi` — hai bộ địa chỉ lưu độc lập | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_079 | REQ-CUST-25 | Customers | Low | Dropdown Country của Billing và Shipping đều có 251 lựa chọn | Đang ở `/admin/clients/client`, tab `Billing & Shipping` | 1. Mở dropdown `#billing_country`, đếm số option<br>2. Mở dropdown `#shipping_country`, đếm số option | — | 1. `#billing_country` có đúng 251 lựa chọn<br>2. `#shipping_country` có đúng 251 lựa chọn | Low | Yes | UI | @Regression |

---

## Nhóm 3.2 — Bảo vệ CSRF

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_080 | REQ-CUST-27 | Customers | High | Form khách hàng có chứa token CSRF ẩn | Đang ở `/admin/clients/client` | 1. Đọc DOM của form tạo khách hàng<br>2. Tìm input ẩn mang tên `csrf_token_name` | — | 2. Form chứa `<input type="hidden" name="csrf_token_name">` với giá trị không rỗng | High | Yes | UI | @Security @Regression |
| CRM_CUST_TC_081 | REQ-CUST-27 | Customers | High | Submit form với token CSRF sai bị hệ thống từ chối | Đã đăng nhập, đang ở `/admin/clients/client` | 1. Sửa giá trị input ẩn `csrf_token_name` thành `invalid_token_1785700490`<br>2. Nhập Company: `Auto_Customer_1785700490`<br>3. Click `Save`<br>4. Đọc phản hồi của hệ thống<br>5. Mở `/admin/clients`, tìm `Auto_Customer_1785700490` | Company: `Auto_Customer_1785700490`<br>csrf_token_name: `invalid_token_1785700490` | 3. Request được gửi đi<br>4. Hệ thống trả HTTP 403, hiển thị trang lỗi `419 Page Expired!`<br>5. KHÔNG tìm thấy bản ghi nào — khách hàng không được tạo | High | Yes | UI | @Security @CriticalPath |

---

## Nhóm 3.3 — Trang chi tiết khách hàng

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_082 | REQ-CUST-28 | Customers | Medium | Trang chi tiết hiển thị đầy đủ các tab hồ sơ | Tồn tại `Auto_Customer_1785700491` với ID đã biết | 1. Mở `/admin/clients/client/{id}` của khách hàng này<br>2. Chờ trang tải xong<br>3. Đọc danh sách tab hiển thị | Company: `Auto_Customer_1785700491` | 2. Trang chi tiết hiển thị, tiêu đề bằng tên công ty<br>3. Có đủ 20 tab bao gồm: `profile`, `contacts`, `notes`, `statement`, `invoices`, `payments`, `proposals`, `credit_notes`, `estimates`, `subscriptions`, `expenses`, `contracts`, `projects`, `tasks`, `tickets`, `attachments`, `vault`, `reminders`, `map` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_083 | REQ-CUST-29 | Customers | Medium | Truy cập tab trực tiếp bằng URL mở đúng tab | Tồn tại `Auto_Customer_1785700491` với ID đã biết | 1. Mở trực tiếp `/admin/clients/client/{id}?group=contacts`<br>2. Chờ trang tải xong<br>3. Đọc tab đang được kích hoạt | URL: `?group=contacts` | 2. Trang chi tiết tải thành công<br>3. Tab `Contacts` đang được kích hoạt, hiển thị bảng liên hệ — URL của tab chia sẻ/bookmark được | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_084 | REQ-CUST-29 | Customers | Low | Truy cập tab bằng tham số group không hợp lệ | Tồn tại `Auto_Customer_1785700491` với ID đã biết | 1. Mở `/admin/clients/client/{id}?group=khong_ton_tai_1785700491`<br>2. Chờ trang phản hồi<br>3. Quan sát kết quả | URL: `?group=khong_ton_tai_1785700491` | 2. Trang phản hồi<br>3. Hệ thống KHÔNG lỗi 500 — hiển thị tab mặc định (`profile`) hoặc trang lỗi 404 có kiểm soát | Low | Yes | UI | @Negative @Regression |

---

## Nhóm 3.4 — Xoá khách hàng

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_085 | REQ-CUST-30 | Customers | Critical | Xoá khách hàng hiển thị hộp thoại xác nhận | Tồn tại `Auto_Customer_1785700492` **do test tạo, chưa có dữ liệu liên quan** | 1. Mở trang chi tiết `Auto_Customer_1785700492`<br>2. Click nút dropdown (caret) cạnh tên khách hàng<br>3. Click `Delete`<br>4. Đọc nội dung hộp thoại xác nhận | Company: `Auto_Customer_1785700492` | 2. Menu dropdown mở ra có mục `Delete`<br>3. Trình duyệt hiện hộp thoại xác nhận<br>4. Nội dung nguyên văn: `Are you sure you want to perform this action?` | Critical | Yes | UI | @Smoke @CriticalPath |
| CRM_CUST_TC_086 | REQ-CUST-30 | Customers | Critical | Chọn Cancel trên hộp thoại xác nhận giữ nguyên bản ghi | Tồn tại `Auto_Customer_1785700492` | 1. Mở trang chi tiết `Auto_Customer_1785700492`<br>2. Click dropdown → `Delete`<br>3. Chọn `Cancel` trên hộp thoại xác nhận<br>4. Đọc URL hiện tại<br>5. Tải lại trang chi tiết | Company: `Auto_Customer_1785700492` | 3. Hộp thoại đóng lại<br>4. Vẫn ở `/admin/clients/client/{id}`, không chuyển hướng<br>5. Khách hàng vẫn tồn tại, dữ liệu không thay đổi | Critical | Yes | UI | @CriticalPath @Negative |
| CRM_CUST_TC_087 | REQ-CUST-30, REQ-CUST-31 | Customers | Critical | Chọn OK xoá bản ghi và chuyển về danh sách | Tồn tại `Auto_Customer_1785700492` (ID đã biết), chưa có dữ liệu liên quan | 1. Mở trang chi tiết `Auto_Customer_1785700492`<br>2. Click dropdown → `Delete`<br>3. Chọn `OK` trên hộp thoại xác nhận<br>4. Chờ trang xử lý xong, đọc URL<br>5. Tìm `Auto_Customer_1785700492` tại danh sách | Company: `Auto_Customer_1785700492` | 3. Hộp thoại đóng, request xoá được gửi<br>4. Chuyển hướng về `/admin/clients`<br>5. Không tìm thấy bản ghi nào khớp — đã bị xoá | Critical | Yes | UI | @Smoke @CriticalPath |
| CRM_CUST_TC_088 | REQ-CUST-31 | Customers | High | Truy cập lại khách hàng đã xoá trả về trang 404 | Đã xoá `Auto_Customer_1785700492`, còn nhớ ID cũ | 1. Mở trực tiếp `/admin/clients/client/{id_da_xoa}`<br>2. Chờ trang phản hồi<br>3. Đọc nội dung trang | ID: `{id_da_xoa}` | 2. Trang phản hồi<br>3. Hiển thị trang lỗi `404 Page Not Found` — không lộ dữ liệu cũ, không lỗi 500 | High | Yes | UI | @Regression @Negative |
| CRM_CUST_TC_089 | REQ-CUST-32 | Customers | High | Xoá khách hàng kéo theo xoá liên hệ trực thuộc | Tồn tại `Auto_Customer_1785700493` có đúng 1 liên hệ `auto_contact_1785700493@auto.test` | 1. Mở `/admin/clients/all_contacts`, tìm `auto_contact_1785700493@auto.test`, xác nhận có kết quả<br>2. Mở trang chi tiết `Auto_Customer_1785700493`<br>3. Xoá khách hàng, xác nhận `OK`<br>4. Quay lại `/admin/clients/all_contacts`, tìm lại email trên | Company: `Auto_Customer_1785700493`<br>Contact: `auto_contact_1785700493@auto.test` | 1. Tìm thấy đúng 1 liên hệ<br>3. Xoá thành công, chuyển về `/admin/clients`<br>4. KHÔNG còn tìm thấy liên hệ nào — liên hệ bị xoá theo dây chuyền | High | Yes | UI | @CriticalPath @Regression |

---

## Nhóm 3.5 — Danh sách liên hệ & mở modal

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_090 | REQ-CUST-33 | Customers | Medium | Tab Contacts của khách hàng chưa có liên hệ hiển thị trạng thái rỗng | Tồn tại `Auto_Customer_1785700494` **chưa có** liên hệ nào | 1. Mở `/admin/clients/client/{id}?group=contacts`<br>2. Chờ bảng liên hệ tải xong<br>3. Đọc hàng tiêu đề và vùng dữ liệu của bảng | Company: `Auto_Customer_1785700494` (0 liên hệ) | 2. Tab Contacts hiển thị<br>3. Bảng có đủ 6 cột: `Full Name`, `Email`, `Position`, `Phone`, `Active`, `Last Login`; vùng dữ liệu hiển thị `No entries found` | Medium | Yes | UI | @Regression @Boundary |
| CRM_CUST_TC_091 | REQ-CUST-34 | Customers | High | Nút "New Contact" mở modal thêm liên hệ | Đang ở tab Contacts của `Auto_Customer_1785700494` | 1. Click nút `New Contact`<br>2. Chờ modal mở xong<br>3. Đọc tiêu đề modal và tên khách hàng hiển thị trong modal | Company: `Auto_Customer_1785700494` | 1. Modal bắt đầu mở<br>2. Modal `#contact` hiển thị đầy đủ<br>3. Tiêu đề modal là `Add new contact`, có hiển thị tên khách hàng đang thao tác | High | Yes | UI | @Smoke @CriticalPath |

---

## Nhóm 3.6 — Validation trường bắt buộc của liên hệ

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_092 | REQ-CUST-35 | Customers | Critical | Bỏ trống First Name hiển thị lỗi bắt buộc | Modal `Add new contact` đang mở. Đã xoá trắng mọi ô để tránh autofill (RISK-06) | 1. Xoá trắng ô `#contact #firstname`<br>2. Nhập Last Name: `Auto`, Email: `auto_contact_1785700495@auto.test`, Password: `Auto@12345`<br>3. Click `Save` trong modal<br>4. Đọc thông báo lỗi | First Name: (rỗng)<br>Last Name: `Auto`<br>Email: `auto_contact_1785700495@auto.test` | 3. Modal KHÔNG đóng, liên hệ không được tạo<br>4. Hiện lỗi `This field is required.` trong `#firstname-error` | Critical | Yes | UI | @Smoke @Negative @CriticalPath |
| CRM_CUST_TC_093 | REQ-CUST-35 | Customers | Critical | Bỏ trống Last Name hiển thị lỗi bắt buộc | Modal `Add new contact` đang mở, đã xoá trắng mọi ô | 1. Nhập First Name: `Auto`<br>2. Xoá trắng ô `#contact #lastname`<br>3. Nhập Email: `auto_contact_1785700496@auto.test`, Password: `Auto@12345`<br>4. Click `Save` trong modal<br>5. Đọc thông báo lỗi | Last Name: (rỗng) | 4. Modal KHÔNG đóng<br>5. Hiện lỗi `This field is required.` trong `#lastname-error` | Critical | Yes | UI | @Negative @Regression |
| CRM_CUST_TC_094 | REQ-CUST-35 | Customers | Critical | Bỏ trống Email hiển thị lỗi bắt buộc | Modal `Add new contact` đang mở, đã xoá trắng mọi ô | 1. Nhập First Name: `Auto`, Last Name: `Contact`<br>2. Xoá trắng ô `#contact #email`<br>3. Nhập Password: `Auto@12345`<br>4. Click `Save` trong modal<br>5. Đọc thông báo lỗi | Email: (rỗng) | 4. Modal KHÔNG đóng<br>5. Hiện lỗi `This field is required.` trong `#email-error` | Critical | Yes | UI | @Negative @Regression |
| CRM_CUST_TC_095 | REQ-CUST-35, REQ-CUST-38 | Customers | High | Bỏ trống Password khi không tick "Send SET password email" | Modal `Add new contact` đang mở, checkbox `#send_set_password_email` KHÔNG được tick | 1. Nhập First Name: `Auto`, Last Name: `Contact`, Email: `auto_contact_1785700497@auto.test`<br>2. Xoá trắng ô Password<br>3. Xác nhận `#send_set_password_email` không được tick<br>4. Click `Save` trong modal<br>5. Đọc thông báo lỗi | Password: (rỗng)<br>Send SET password email: không tick | 4. Modal KHÔNG đóng<br>5. Hiện lỗi `This field is required.` trong `#password-error` | High | Yes | UI | @Negative @Regression |

---

## Nhóm 3.7 — Validation Email liên hệ

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_096 | REQ-CUST-36 | Customers | Critical | Email sai định dạng (thiếu @) hiển thị lỗi định dạng | Modal `Add new contact` đang mở, đã xoá trắng ô Email (RISK-06) | 1. Nhập First Name: `Auto`, Last Name: `Contact`<br>2. Nhập Email: `khong-phai-email`<br>3. Rời khỏi ô Email (blur)<br>4. Đọc thông báo lỗi | Email: `khong-phai-email` | 3. Validation phía client kích hoạt<br>4. Hiện lỗi nguyên văn `Please enter a valid email address.` trong `#email-error` | Critical | Yes | UI | @Smoke @Negative @CriticalPath |
| CRM_CUST_TC_097 | REQ-CUST-36 | Customers | High | Email thiếu phần domain hiển thị lỗi định dạng | Modal `Add new contact` đang mở, đã xoá trắng ô Email | 1. Nhập Email: `auto_contact_1785700498@`<br>2. Rời khỏi ô Email (blur)<br>3. Đọc thông báo lỗi | Email: `auto_contact_1785700498@` | 2. Validation kích hoạt<br>3. Hiện lỗi `Please enter a valid email address.` trong `#email-error` | High | Yes | UI | @Negative @Regression |
| CRM_CUST_TC_098 | REQ-CUST-36 | Customers | Medium | Email chứa nhiều ký tự @ hiển thị lỗi định dạng | Modal `Add new contact` đang mở, đã xoá trắng ô Email | 1. Nhập Email: `auto@contact@1785700499.test`<br>2. Rời khỏi ô Email (blur)<br>3. Đọc thông báo lỗi | Email: `auto@contact@1785700499.test` | 2. Validation kích hoạt<br>3. Hiện lỗi `Please enter a valid email address.` trong `#email-error` | Medium | Yes | UI | @Negative @Boundary |
| CRM_CUST_TC_099 | REQ-CUST-37 | Customers | Critical | Email đã tồn tại bị chặn qua kiểm tra AJAX thời gian thực | Modal `Add new contact` đang mở. Đã tồn tại liên hệ `auto_contact_1785700500@auto.test` trong hệ thống | 1. Nhập First Name: `Auto`, Last Name: `Contact`<br>2. Nhập Email: `auto_contact_1785700500@auto.test` (email đã tồn tại)<br>3. Rời khỏi ô Email (blur), chờ phản hồi AJAX từ `/admin/misc/contact_email_exists`<br>4. Đọc thông báo lỗi | Email: `auto_contact_1785700500@auto.test` (trùng) | 3. Trình duyệt gửi request tới `/admin/misc/contact_email_exists`, nhận phản hồi<br>4. Hiện lỗi nguyên văn `Email already exists` trong `#email-error`; không thể lưu cho tới khi đổi email | Critical | Yes | UI | @Smoke @CriticalPath @Negative |
| CRM_CUST_TC_100 | REQ-CUST-37 | Customers | High | Email chưa tồn tại không bị báo lỗi trùng | Modal `Add new contact` đang mở, đã xoá trắng ô Email | 1. Nhập Email chưa từng dùng: `auto_contact_1785700501@auto.test`<br>2. Rời khỏi ô Email (blur), chờ phản hồi AJAX<br>3. Đọc trạng thái vùng lỗi `#email-error` | Email: `auto_contact_1785700501@auto.test` (mới) | 2. Request kiểm tra trùng được gửi và phản hồi<br>3. `#email-error` rỗng, ô Email không có class `has-error` — không báo lỗi trùng | High | Yes | UI | @Regression |
| CRM_CUST_TC_101 | REQ-CUST-37 | Customers | Medium | Email của liên hệ đã bị xoá được dùng lại | Đã tạo rồi xoá liên hệ dùng email `auto_contact_1785700502@auto.test` (xoá qua việc xoá khách hàng chủ quản) | 1. Mở modal `Add new contact` của một khách hàng traceable khác<br>2. Nhập First Name: `Auto`, Last Name: `Contact`<br>3. Nhập lại Email: `auto_contact_1785700502@auto.test`<br>4. Rời khỏi ô Email, chờ phản hồi AJAX<br>5. Nhập Password `Auto@12345` và click `Save` | Email: `auto_contact_1785700502@auto.test` (đã bị xoá trước đó) | 4. Theo ASM-14: KHÔNG hiện lỗi `Email already exists`<br>5. Liên hệ được tạo thành công — email của bản ghi đã xoá được tái sử dụng | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_102 | REQ-CUST-36 | Customers | Medium | Email chứa mã XSS không được thực thi | Modal `Add new contact` đang mở, đã xoá trắng ô Email | 1. Nhập Email: `<script>alert(1)</script>@auto.test`<br>2. Rời khỏi ô Email (blur)<br>3. Quan sát trang và thông báo lỗi | Email: `<script>alert(1)</script>@auto.test` | 2. Validation kích hoạt<br>3. KHÔNG có hộp thoại alert bật lên; hiện lỗi `Please enter a valid email address.`; chuỗi hiển thị dạng văn bản thuần trong ô nhập | Medium | Yes | UI | @Security @Negative |

---

## Nhóm 3.8 — Password có điều kiện

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_103 | REQ-CUST-38 | Customers | High | Tick "Send SET password email" ẩn ô Password và bỏ ràng buộc bắt buộc | Modal `Add new contact` đang mở, ô Password đang hiển thị | 1. Xác nhận ô Password đang hiển thị<br>2. Tick checkbox `#send_set_password_email`<br>3. Quan sát wrapper `.client_password_set_wrapper`<br>4. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700503@auto.test` rồi click `Save` | Send SET password email: tick<br>Password: (không nhập) | 1. Ô Password hiển thị<br>3. Wrapper `.client_password_set_wrapper` được thêm class `hide` — ô Password bị ẩn<br>4. Liên hệ tạo thành công dù không nhập Password, không có lỗi `#password-error` | High | Yes | UI | @CriticalPath @Regression |
| CRM_CUST_TC_104 | REQ-CUST-38 | Customers | Medium | Bỏ tick "Send SET password email" hiện lại ô Password và khôi phục ràng buộc | Modal `Add new contact` đang mở, đã tick `#send_set_password_email` | 1. Bỏ tick checkbox `#send_set_password_email`<br>2. Quan sát wrapper `.client_password_set_wrapper`<br>3. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700504@auto.test`, để trống Password<br>4. Click `Save`<br>5. Đọc thông báo lỗi | Send SET password email: bỏ tick<br>Password: (rỗng) | 2. Wrapper mất class `hide` — ô Password hiển thị trở lại<br>4. Modal KHÔNG đóng<br>5. Hiện lỗi `This field is required.` trong `#password-error` — ràng buộc bắt buộc được khôi phục | Medium | Yes | UI | @Regression @Negative |
| CRM_CUST_TC_105 | REQ-CUST-38 | Customers | Medium | Password 1 ký tự vẫn được chấp nhận ở tầng client | Modal `Add new contact` đang mở, `#send_set_password_email` không tick | 1. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700505@auto.test`<br>2. Nhập Password: `1`<br>3. Click `Save`<br>4. Quan sát kết quả | Password: `1` | 3. Theo ASM-12: form submit, KHÔNG có ràng buộc độ dài tối thiểu phía client<br>4. Liên hệ được tạo thành công. **Ghi nhận là điểm yếu bảo mật** — cần dev xác nhận chính sách mật khẩu | Medium | Yes | UI | @Security @Boundary |

---

## Nhóm 3.9 — Checkbox & tuỳ chọn mặc định của liên hệ

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_106 | REQ-CUST-39 | Customers | Medium | Checkbox Primary Contact mặc định được tick khi mở modal | Đang ở tab Contacts của một khách hàng traceable | 1. Click `New Contact` để mở modal<br>2. Đọc trạng thái checkbox `#contact_primary` | — | 2. Checkbox `#contact_primary` ở trạng thái **đã tick** ngay khi modal vừa mở | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_107 | REQ-CUST-40 | Customers | Medium | Checkbox "Do not send welcome email" mặc định không được tick | Modal `Add new contact` đang mở | 1. Đọc trạng thái checkbox `#donotsendwelcomeemail`<br>2. Đọc nhãn đi kèm checkbox | — | 1. Checkbox ở trạng thái **không tick**<br>2. Nhãn hiển thị `Do not send welcome email` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_108 | REQ-CUST-44 | Customers | Low | Dropdown Direction có đúng 3 lựa chọn | Modal `Add new contact` đang mở | 1. Mở dropdown `#direction`<br>2. Đọc danh sách option và giá trị mặc định | — | 2. Có đúng 3 lựa chọn: rỗng (mặc định hệ thống), `LTR`, `RTL`; giá trị đang chọn mặc định là rỗng | Low | Yes | UI | @Regression |

---

## Nhóm 3.10 — Phân quyền & thông báo email của liên hệ

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_109 | REQ-CUST-41 | Customers | High | Sáu công tắc phân quyền mặc định bật hết | Modal `Add new contact` đang mở | 1. Định vị các công tắc bằng `input[name="permissions[]"]` (KHÔNG dùng `#1`…`#6`)<br>2. Đếm số công tắc<br>3. Đọc trạng thái từng công tắc | — | 2. Có đúng 6 công tắc theo thứ tự: `Invoices`, `Estimates`, `Contracts`, `Proposals`, `Support`, `Projects`<br>3. Cả 6 công tắc đều ở trạng thái **bật** | High | Yes | UI | @Security @Regression |
| CRM_CUST_TC_110 | REQ-CUST-41 | Customers | High | Tắt một quyền và lưu — quyền được ghi nhận đúng | Modal `Add new contact` đang mở | 1. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700506@auto.test`, Password `Auto@12345`<br>2. Tắt công tắc quyền `Support` (định vị qua `input[name="permissions[]"]`)<br>3. Click `Save`<br>4. Mở lại liên hệ vừa tạo để sửa<br>5. Đọc trạng thái 6 công tắc quyền | Email: `auto_contact_1785700506@auto.test`<br>Tắt quyền: `Support` | 2. Công tắc `Support` chuyển sang tắt<br>3. Liên hệ tạo thành công, modal đóng<br>5. Quyền `Support` ở trạng thái tắt, 5 quyền còn lại vẫn bật | High | Yes | UI | @Security @CriticalPath |
| CRM_CUST_TC_111 | REQ-CUST-42 | Customers | Medium | Bảy công tắc thông báo email mặc định bật hết | Modal `Add new contact` đang mở | 1. Định vị 7 công tắc thông báo email theo `name`<br>2. Đếm số công tắc<br>3. Đọc trạng thái từng công tắc | — | 2. Có đúng 7 công tắc: `invoice_emails`, `estimate_emails`, `credit_note_emails`, `project_emails`, `ticket_emails`, `task_emails`, `contract_emails`<br>3. Cả 7 công tắc đều ở trạng thái **bật** | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_112 | REQ-CUST-42 | Customers | Medium | Tắt một loại thông báo email và lưu đúng | Modal `Add new contact` đang mở | 1. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700507@auto.test`, Password `Auto@12345`<br>2. Tắt công tắc `ticket_emails`<br>3. Click `Save`<br>4. Mở lại liên hệ vừa tạo để sửa<br>5. Đọc trạng thái 7 công tắc thông báo | Email: `auto_contact_1785700507@auto.test`<br>Tắt: `ticket_emails` | 2. Công tắc `ticket_emails` chuyển sang tắt<br>3. Tạo thành công<br>5. `ticket_emails` ở trạng thái tắt, 6 công tắc còn lại vẫn bật | Medium | Yes | UI | @Regression |

---

## Nhóm 3.11 — Ảnh đại diện & tạo liên hệ thành công

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_113 | REQ-CUST-43 | Customers | Medium | Tải lên ảnh đại diện định dạng hợp lệ | Modal `Add new contact` đang mở. Có sẵn tệp `auto_avatar_1785700508.png` (kích thước ~50 KB) | 1. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700508@auto.test`, Password `Auto@12345`<br>2. Chọn tệp `auto_avatar_1785700508.png` cho trường `#profile_image`<br>3. Click `Save`<br>4. Mở lại liên hệ vừa tạo, quan sát ảnh đại diện | Ảnh: `auto_avatar_1785700508.png` (PNG, ~50 KB) | 2. Tên tệp hiển thị trên trường chọn tệp<br>3. Liên hệ tạo thành công, modal đóng<br>4. Ảnh đại diện hiển thị đúng, không phải ảnh mặc định | Medium | Partial | UI | @Regression |
| CRM_CUST_TC_114 | REQ-CUST-43 | Customers | High | Tải lên tệp thực thi vào ô ảnh đại diện bị chặn (TC thăm dò bảo mật) | Modal `Add new contact` đang mở. Có sẵn tệp `auto_probe_1785700509.exe` (tệp giả, ~1 KB) | 1. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700509@auto.test`, Password `Auto@12345`<br>2. Chọn tệp `auto_probe_1785700509.exe` cho trường `#profile_image`<br>3. Click `Save`<br>4. Quan sát phản hồi của hệ thống | Tệp: `auto_probe_1785700509.exe` | 2. Trường chọn tệp nhận tệp (không có thuộc tính `accept` để chặn ở client)<br>3. Request được gửi<br>4. Theo ASM-05: hệ thống **chặn ở tầng server**, hiện thông báo lỗi định dạng tệp và không lưu tệp. Nếu tệp `.exe` được chấp nhận và lưu → **FAIL**, mở bug bảo mật mức High | High | No | N/A | @Security @ManualOnly |
| CRM_CUST_TC_115 | REQ-CUST-45 | Customers | Critical | Tạo liên hệ thành công cập nhật bảng ngay không cần tải lại trang | Đang ở tab Contacts của `Auto_Customer_1785700510`, bảng chưa có liên hệ nào | 1. Click `New Contact` mở modal<br>2. Nhập First Name `Auto`, Last Name `Contact`, Email `auto_contact_1785700510@auto.test`, Password `Auto@12345`<br>3. Click `Save`<br>4. Quan sát modal và bảng liên hệ (KHÔNG tải lại trang) | Email: `auto_contact_1785700510@auto.test` | 3. Request lưu được gửi tới `/admin/clients/form_contact/{customer_id}`<br>4. Modal đóng lại; dòng liên hệ mới xuất hiện ngay trong bảng với `Full Name` = `Auto Contact` và cột `Active` = `Yes` | Critical | Yes | UI | @Smoke @CriticalPath |
| CRM_CUST_TC_116 | REQ-CUST-46 | Customers | Medium | Trang danh bạ liên hệ toàn hệ thống hiển thị đủ 8 cột và tìm được liên hệ | Đã tồn tại liên hệ `auto_contact_1785700510@auto.test` | 1. Mở `/admin/clients/all_contacts`<br>2. Chờ bảng tải xong, đọc hàng tiêu đề<br>3. Nhập `auto_contact_1785700510@auto.test` vào ô tìm kiếm<br>4. Đọc dòng kết quả | Từ khoá: `auto_contact_1785700510@auto.test` | 2. Bảng có đủ 8 cột: `First Name`, `Last Name`, `Email`, `Company`, `Phone`, `Position`, `Last Login`, `Active`<br>4. Hiển thị đúng 1 dòng, cột `Company` bằng `Auto_Customer_1785700510` | Medium | Yes | UI | @Regression |

---

> **Trước đó:** [Part 2 — Tạo & sửa khách hàng](test_cases_customers_v2_part2.md) · **Tiếp theo:** [Part 4 — Import CSV & Non-functional](test_cases_customers_v2_part4.md)
