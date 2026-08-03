# Tài Liệu Yêu Cầu — Module Customers (Perfex CRM)

| Thông tin | Nội dung |
|---|---|
| Hệ thống | CRM (Perfex CRM — Anh Tester Demo) |
| Module | Customers (Khách hàng) |
| URL chính | https://crm.anhtester.com/admin/clients |
| URL liên quan | `/admin/clients/client` (tạo mới) · `/admin/clients/client/{id}` (chi tiết) · `/admin/clients/import` (nhập CSV) · `/admin/clients/all_contacts` (danh bạ liên hệ) |
| Tài khoản khảo sát | `admin@example.com` / `123456` (role: Administrator) |
| Phương pháp | Inspect DOM thực tế bằng Playwright MCP — viewport 1920×1080, headed mode. Đã tạo/xoá dữ liệu thật để kiểm chứng hành vi |
| Ngày khảo sát | 2026-08-02 |
| Bằng chứng | [Danh sách khách hàng](evidence/customers_list_1920x1080.png) · [Form tạo mới](evidence/customer_new_form_1920x1080.png) |
| Tài liệu liên quan | [requirements_login.md](../login/requirements_login.md) |
| **Dải mã đã dùng** | `REQ-CUST-01` → `REQ-CUST-53` · `AMB-01` → `AMB-11` · `RISK-01` → `RISK-10` |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-CUST-54` · `AMB-12` · `RISK-11` — **KHÔNG đánh lại từ 01** |
| Phiên bản | 1.0 |

> **Ghi chú về dữ liệu test:** Trong quá trình khảo sát đã tạo 3 khách hàng và 1 liên hệ với dữ liệu traceable (`Auto_Customer_1785627049`), sau đó **đã xoá toàn bộ**. Số liệu hệ thống trước và sau khảo sát trùng khớp (1431 khách hàng / 360 liên hệ đang hoạt động) — môi trường được trả về nguyên trạng.

---

## 1. Tổng Quan (Overview)

Module Customers quản lý toàn bộ vòng đời hồ sơ khách hàng của CRM. Mỗi khách hàng (Customer) là một **pháp nhân/công ty**, bên dưới có nhiều **liên hệ (Contacts)** — chính là tài khoản đăng nhập vào Client Portal. Khách hàng là thực thể trung tâm được tham chiếu bởi hầu hết các module nghiệp vụ khác (Invoices, Estimates, Projects, Contracts, Tickets…).

**Phạm vi tài liệu:**
- ✅ Trong phạm vi: danh sách khách hàng (tìm kiếm, lọc, sắp xếp, phân trang, xuất dữ liệu, thao tác hàng loạt), tạo/sửa/xoá khách hàng, quản lý liên hệ (Contacts) kèm phân quyền và thông báo email, bật/tắt trạng thái hoạt động, nhập khẩu CSV, bảng thống kê tổng quan.
- ❌ Ngoài phạm vi: nội dung nghiệp vụ của 20 tab con trên trang chi tiết khách hàng (Invoices, Projects, Contracts…) — mỗi tab thuộc module riêng; giao diện Client Portal phía khách hàng; cấu hình mặc định tại Setup → Settings → Customers.

**Đặc điểm kỹ thuật quan trọng:**
- Danh sách dùng **DataTables (server-side processing)** với ID bảng `#clients`.
- Form dùng **jQuery Validation** — validate phía client trước khi submit.
- Form liên hệ nằm trong **modal** (`#contact`), submit qua AJAX tới `/admin/clients/form_contact/{customer_id}`.
- Kiểm tra trùng email liên hệ được thực hiện **realtime qua AJAX** tới `/admin/misc/contact_email_exists`.

---

## 2. Yêu Cầu Chức Năng (Functional Requirements)

### 2.1. Danh sách khách hàng

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-CUST-01 | Hiển thị danh sách khách hàng | Trang `/admin/clients` hiển thị bảng khách hàng dạng DataTables | Bảng `#clients` với 9 cột: `-` (checkbox), `#`, `Company`, `Primary Contact`, `Primary Email`, `Phone`, `Active`, `Groups`, `Date Created` | UI thực tế |
| REQ-CUST-02 | Bảng thống kê tổng quan | Khu vực "Customers Summary" hiển thị 6 chỉ số | Hiển thị: `Total Customers`, `Active Customers`, `Inactive Customers`, `Active Contacts`, `Inactive Contacts`, `Contacts Logged In Today` | UI thực tế |
| REQ-CUST-03 | Chỉ số thống kê cập nhật theo dữ liệu | Số liệu phản ánh đúng sau khi thêm/xoá/đổi trạng thái | Tắt Active 1 khách hàng → tải lại trang → `Active Customers` giảm 1, `Inactive Customers` tăng 1 | Kiểm chứng thực tế |
| REQ-CUST-04 | Tìm kiếm khách hàng | Ô "Search..." lọc danh sách theo từ khoá | Nhập `Auto_Customer_1785627049` → hiển thị `Showing 1 to 1 of 1 entries (filtered from 1,433 total entries)` | Kiểm chứng thực tế |
| REQ-CUST-05 | Phân trang & chọn số dòng | Người dùng chọn số bản ghi mỗi trang | Dropdown `clients_length` có các lựa chọn: `10`, `25`, `50`, `100`, `All`. Mặc định `25` | UI thực tế |
| REQ-CUST-06 | Nhảy nhanh tới trang | Có dropdown chọn số trang trực tiếp | Dropdown `#dt-page-jump-clients` liệt kê các số trang khả dụng | UI thực tế |
| REQ-CUST-07 | Bộ lọc nâng cao theo điều kiện | Chức năng "New Filter" cho phép thêm luật lọc | Dropdown `#clientsRules` có 15 tiêu chí: `Phone`, `Active`, `Invoices`, `Estimates`, `Proposals`, `Projects`, `Contracts Types`, `City`, `Zip Code`, `State`, `Country`, `Responsible admin`, `Groups`, `Customers assigned to me`, `Requires Registration Confirmation` | UI thực tế |
| REQ-CUST-08 | Xuất dữ liệu | Nút "Export" cho phép xuất bảng ra tệp | Menu Export có 4 lựa chọn: `Excel`, `CSV`, `PDF`, `Print` | Kiểm chứng thực tế |
| REQ-CUST-09 | Thao tác hàng loạt | Nút "Bulk Actions" áp dụng cho nhiều khách hàng đã chọn | Modal Bulk Actions cung cấp: `Mass Delete` và gán vào `Groups` | UI thực tế |
| REQ-CUST-10 | Chọn khách hàng bằng checkbox | Mỗi dòng có checkbox mang `value` là ID khách hàng | Checkbox cột đầu tiên có `value` bằng ID khách hàng (VD `9180`) | DOM thực tế |
| REQ-CUST-11 | Thao tác nhanh trên từng dòng | Hover vào tên công ty hiện các liên kết thao tác | Hiện `View` \| `Delete`; nếu khách hàng đã có liên hệ thì hiện `View` \| `Contacts` \| `Delete` | Kiểm chứng thực tế |
| REQ-CUST-12 | Bật/tắt trạng thái hoạt động tại danh sách | Công tắc ở cột `Active` đổi trạng thái ngay không cần vào trang chi tiết | Click công tắc → gọi `/admin/clients/change_client_status` → trạng thái được lưu (kiểm chứng bằng tải lại trang) | Kiểm chứng thực tế |
| REQ-CUST-13 | Ý nghĩa của trạng thái Inactive | Khách hàng Inactive không xuất hiện trong dropdown khi tạo bản ghi mới | Tooltip của công tắc ghi: `Won't be shown in dropdowns when creating new records` | UI thực tế |

### 2.2. Tạo & sửa khách hàng

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-CUST-14 | Mở form tạo khách hàng mới | Nút "+ New Customer" dẫn tới form tạo mới | Điều hướng tới `/admin/clients/client`, tiêu đề trang `Add new customer` | Kiểm chứng thực tế |
| REQ-CUST-15 | Bố cục form theo 2 tab | Form chia thành 2 tab để nhóm thông tin | Tab `Customer Details` (`#contact_info`) và tab `Billing & Shipping` (`#billing_and_shipping`) | DOM thực tế |
| REQ-CUST-16 | Company là trường bắt buộc | Không lưu được khách hàng khi bỏ trống Company | Submit với Company rỗng → hiện lỗi inline `This field is required.` dưới ô Company, form không submit | Kiểm chứng thực tế |
| REQ-CUST-17 | Tạo khách hàng thành công | Lưu thành công thì chuyển sang trang chi tiết | Điền Company hợp lệ → bấm Save → chuyển tới `/admin/clients/client/{id}`, tiêu đề trang bằng tên công ty | Kiểm chứng thực tế |
| REQ-CUST-18 | Cho phép trùng tên Company | Hệ thống KHÔNG chặn hai khách hàng cùng tên công ty | Tạo khách hàng thứ hai với Company y hệt → tạo thành công với ID mới, không có cảnh báo | Kiểm chứng thực tế |
| REQ-CUST-19 | Lưu và tạo liên hệ ngay | Nút "Save and create contact" lưu khách hàng rồi mở luôn form liên hệ | Nút `Save and create contact` tồn tại bên cạnh nút `Save` | UI thực tế |
| REQ-CUST-20 | Gán nhóm khách hàng | Chọn một hoặc nhiều nhóm cho khách hàng | Trường `groups_in[]` là multi-select có tìm kiếm; hỗ trợ `Select All` / `Deselect All` | DOM thực tế |
| REQ-CUST-21 | Tạo nhóm mới ngay trong form | Có modal tạo nhóm không cần rời trang | Modal có trường `* Name` bắt buộc, submit tới `/admin/clients/group` | DOM thực tế |
| REQ-CUST-22 | Thiết lập tiền tệ riêng | Chọn đơn vị tiền tệ mặc định cho khách hàng | Dropdown `default_currency`: rỗng (mặc định hệ thống), `USD`, `EUR` | DOM thực tế |
| REQ-CUST-23 | Thiết lập ngôn ngữ riêng | Chọn ngôn ngữ mặc định của khách hàng | Dropdown `default_language` có 27 lựa chọn, mặc định `System Default` | DOM thực tế |
| REQ-CUST-24 | Chọn quốc gia từ danh mục | Quốc gia chọn từ danh sách chuẩn, không nhập tự do | Dropdown `country` có 251 lựa chọn kèm ô tìm kiếm | DOM thực tế |
| REQ-CUST-25 | Địa chỉ thanh toán & giao hàng | Tab Billing & Shipping cho phép nhập 2 bộ địa chỉ độc lập | Bộ `billing_*` (street, city, state, zip, country) và bộ `shipping_*` tương ứng | DOM thực tế |
| REQ-CUST-26 | Tuỳ chọn hiển thị tên liên hệ chính | Checkbox quyết định có in tên liên hệ chính lên chứng từ | Checkbox `show_primary_contact`, nhãn: `Show primary contact full name on Invoices, Estimates, Payments, Credit Notes`. Mặc định **không tick** | DOM thực tế |
| REQ-CUST-27 | Bảo vệ CSRF cho form khách hàng | Form kèm token ẩn bắt buộc | Form chứa `<input type="hidden" name="csrf_token_name">`; request sai token bị từ chối (HTTP 403 — xem [REQ-LOGIN-15](../login/requirements_login.md)) | DOM thực tế |

### 2.3. Trang chi tiết khách hàng

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-CUST-28 | Hồ sơ khách hàng dạng nhiều tab | Trang chi tiết gom dữ liệu liên quan theo tab | Có 20 tab dạng `?group=<tên>`: `profile`, `contacts`, `notes`, `statement`, `invoices`, `payments`, `proposals`, `credit_notes`, `estimates`, `subscriptions`, `expenses`, `contracts`, `projects`, `tasks`, `tickets`, `attachments` (Files), `vault`, `reminders`, `map` | Kiểm chứng thực tế |
| REQ-CUST-29 | Điều hướng tab bằng URL | Mỗi tab có URL riêng, chia sẻ/bookmark được | Truy cập `/admin/clients/client/{id}?group=contacts` mở đúng tab Contacts | Kiểm chứng thực tế |
| REQ-CUST-30 | Xoá khách hàng có xác nhận | Thao tác xoá yêu cầu xác nhận trước khi thực hiện | Click `Delete` trong dropdown → hiện hộp thoại xác nhận của trình duyệt: `Are you sure you want to perform this action?` | Kiểm chứng thực tế |
| REQ-CUST-31 | Kết quả sau khi xoá | Xoá xong quay về danh sách và bản ghi biến mất | Xác nhận xoá → chuyển về `/admin/clients`; truy cập lại `/admin/clients/client/{id}` → trang `404 Page Not Found` | Kiểm chứng thực tế |
| REQ-CUST-32 | Xoá khách hàng kéo theo liên hệ | Xoá khách hàng thì các liên hệ thuộc khách hàng đó cũng bị xoá | Xoá khách hàng có 1 liên hệ → tổng `Active Contacts` giảm đúng 1 | Kiểm chứng thực tế |

### 2.4. Quản lý liên hệ (Contacts)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-CUST-33 | Danh sách liên hệ của khách hàng | Tab Contacts liệt kê các liên hệ | Bảng 6 cột: `Full Name`, `Email`, `Position`, `Phone`, `Active`, `Last Login`. Khi chưa có dữ liệu hiển thị `No entries found` | Kiểm chứng thực tế |
| REQ-CUST-34 | Thêm liên hệ mới | Nút "New Contact" mở modal `Add new contact` | Modal `#contact` mở ra, tiêu đề `Add new contact`, hiển thị tên khách hàng đang thao tác | Kiểm chứng thực tế |
| REQ-CUST-35 | Trường bắt buộc của liên hệ | 4 trường bắt buộc khi tạo liên hệ | `First Name`, `Last Name`, `Email`, `Password` — bỏ trống đều hiện `This field is required.` | Kiểm chứng thực tế |
| REQ-CUST-36 | Kiểm tra định dạng email liên hệ | Email phải đúng định dạng | Nhập `khong-phai-email` → hiện `Please enter a valid email address.` | Kiểm chứng thực tế |
| REQ-CUST-37 | Email liên hệ phải là duy nhất | Hệ thống kiểm tra trùng email theo thời gian thực | Nhập email đã tồn tại → gọi AJAX `/admin/misc/contact_email_exists` → hiện `Email already exists`. Email chưa tồn tại → không báo lỗi | Kiểm chứng thực tế |
| REQ-CUST-38 | Mật khẩu bắt buộc có điều kiện | Password chỉ bắt buộc khi không gửi email đặt mật khẩu | Không tick `Send SET password email` → Password bắt buộc. Tick vào → ô Password **bị ẩn** và không còn bắt buộc | Kiểm chứng thực tế |
| REQ-CUST-39 | Liên hệ chính mặc định | Liên hệ đầu tiên được đánh dấu là liên hệ chính | Checkbox `Primary Contact` (`#contact_primary`) **mặc định được tick** khi mở modal | Kiểm chứng thực tế |
| REQ-CUST-40 | Tuỳ chọn không gửi email chào mừng | Cho phép tạo liên hệ mà không gửi email | Checkbox `Do not send welcome email`, mặc định **không tick** | DOM thực tế |
| REQ-CUST-41 | Phân quyền liên hệ | Gán quyền truy cập Client Portal cho từng liên hệ | 6 công tắc quyền: `Invoices`, `Estimates`, `Contracts`, `Proposals`, `Support`, `Projects` — mặc định **tất cả đều bật**. Ghi chú trên UI: `Make sure to set appropriate permissions for this contact` | Kiểm chứng thực tế |
| REQ-CUST-42 | Cấu hình thông báo email | Chọn loại email hệ thống gửi tới liên hệ | 7 công tắc: `Invoice`, `Estimate`, `Credit Note`, `Project`, `Tickets`, `Task`, `Contract` — mặc định **tất cả đều bật** | Kiểm chứng thực tế |
| REQ-CUST-43 | Ảnh đại diện liên hệ | Cho phép tải lên ảnh đại diện | Trường `profile_image` kiểu `file` | DOM thực tế |
| REQ-CUST-44 | Hướng hiển thị văn bản | Hỗ trợ ngôn ngữ viết từ phải sang trái | Dropdown `direction`: rỗng (mặc định hệ thống), `LTR`, `RTL` | DOM thực tế |
| REQ-CUST-45 | Tạo liên hệ thành công | Lưu xong modal đóng và bảng cập nhật ngay | Modal đóng, dòng mới xuất hiện trong bảng với `Active = Yes`, không cần tải lại trang | Kiểm chứng thực tế |
| REQ-CUST-46 | Danh bạ liên hệ toàn hệ thống | Trang riêng liệt kê liên hệ của mọi khách hàng | `/admin/clients/all_contacts` — bảng 8 cột: `First Name`, `Last Name`, `Email`, `Company`, `Phone`, `Position`, `Last Login`, `Active` | Kiểm chứng thực tế |

### 2.5. Nhập khẩu khách hàng (Import)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-CUST-47 | Nhập khẩu hàng loạt từ CSV | Trang `/admin/clients/import` cho phép tải tệp CSV | Trường `* Choose CSV File` (`file_csv`) là bắt buộc | Kiểm chứng thực tế |
| REQ-CUST-48 | Tải tệp mẫu | Có nút tải tệp CSV mẫu đúng định dạng | Nút `Download Sample` submit tham số `download_sample` | DOM thực tế |
| REQ-CUST-49 | Cấu trúc cột tệp nhập khẩu | Tệp CSV phải theo đúng thứ tự cột quy định | 27 cột; bắt buộc (`*`): `Firstname`, `Lastname`, `Email` (3 trường thuộc liên hệ) và `Company`. Các cột còn lại tuỳ chọn | UI thực tế |
| REQ-CUST-50 | Ràng buộc định dạng tệp | Quy tắc bắt buộc khi chuẩn bị tệp | Nguyên văn: dòng đầu là tiêu đề cột; tệp phải mã hoá **UTF-8**; cột ngày định dạng **Y-m-d** (VD `2026-08-02`) | UI thực tế |
| REQ-CUST-51 | Bỏ qua bản ghi email trùng | Dòng có email đã tồn tại sẽ không được nhập | Nguyên văn: `Duplicate email rows won't be imported.` | UI thực tế |
| REQ-CUST-52 | Gán nhóm khi nhập khẩu | Có thể gán tất cả khách hàng nhập vào một/nhiều nhóm | Trường `groups_in[]` trên trang Import | DOM thực tế |
| REQ-CUST-53 | Mật khẩu mặc định khi nhập khẩu | Đặt chung một mật khẩu cho mọi liên hệ được nhập | Trường `Default password for all contacts` (`default_pass_all`) | DOM thực tế |

---

## 3. Đặc Tả Trường Dữ Liệu (Field Specifications)

### 3.1. Form Khách hàng — tab `Customer Details`

| Field (Label) | Loại UI | Định danh DOM | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|---|
| Company | Textbox | `#company` / `name="company"` | ✅ **Có** (chỉ phía client) | Không có `maxlength`/`pattern`. Mặc định rỗng. **Cho phép trùng** | REQ-CUST-16, 17, 18 | ⚠️ Server KHÔNG kiểm tra bắt buộc — xem AMB-01 |
| VAT Number | Textbox | `#vat` / `name="vat"` | ❌ | Không ràng buộc định dạng | REQ-CUST-17 | — |
| Phone | Textbox | `#phonenumber` | ❌ | Kiểu `text` — không validate định dạng số | REQ-CUST-17 | Xem AMB-03 |
| Website | Textbox | `#website` | ❌ | Kiểu `text` — không validate định dạng URL | REQ-CUST-17 | Xem AMB-03 |
| Groups | Multi-select | `#groups_in[]` / `name="groups_in[]"` | ❌ | Nguồn dữ liệu: danh sách nhóm hiện có (305 lựa chọn tại thời điểm khảo sát). Có ô tìm kiếm, `Select All`/`Deselect All` | REQ-CUST-20, 21 | Dùng plugin `selectpicker` |
| Currency | Dropdown | `#default_currency` | ❌ | 3 lựa chọn: rỗng, `USD`, `EUR`. Mặc định rỗng (theo hệ thống) | REQ-CUST-22 | — |
| Default Language | Dropdown | `#default_language` | ❌ | 27 lựa chọn. Mặc định `System Default` | REQ-CUST-23 | — |
| Address | Textarea | `#address` | ❌ | Không giới hạn ký tự khai báo | REQ-CUST-17 | — |
| City | Textbox | `#city` | ❌ | — | REQ-CUST-17 | — |
| State | Textbox | `#state` | ❌ | — | REQ-CUST-17 | — |
| Zip Code | Textbox | `#zip` | ❌ | Kiểu `text` — chấp nhận cả chữ | REQ-CUST-17 | — |
| Country | Dropdown | `#country` | ❌ | 251 lựa chọn + ô tìm kiếm. Mặc định rỗng | REQ-CUST-24 | — |
| Show primary contact full name… | Checkbox | `#show_primary_contact` | ❌ | Mặc định **không tick** | REQ-CUST-26 | Nhãn đầy đủ: `Show primary contact full name on Invoices, Estimates, Payments, Credit Notes` |

### 3.2. Form Khách hàng — tab `Billing & Shipping`

| Field (Label) | Loại UI | Định danh DOM | Required | Ràng buộc | REQ liên quan |
|---|---|---|---|---|---|
| Street (Billing) | Textarea | `#billing_street` | ❌ | — | REQ-CUST-25 |
| City (Billing) | Textbox | `#billing_city` | ❌ | — | REQ-CUST-25 |
| State (Billing) | Textbox | `#billing_state` | ❌ | — | REQ-CUST-25 |
| Zip Code (Billing) | Textbox | `#billing_zip` | ❌ | — | REQ-CUST-25 |
| Country (Billing) | Dropdown | `#billing_country` | ❌ | 251 lựa chọn | REQ-CUST-25 |
| Street (Shipping) | Textarea | `#shipping_street` | ❌ | — | REQ-CUST-25 |
| City (Shipping) | Textbox | `#shipping_city` | ❌ | — | REQ-CUST-25 |
| State (Shipping) | Textbox | `#shipping_state` | ❌ | — | REQ-CUST-25 |
| Zip Code (Shipping) | Textbox | `#shipping_zip` | ❌ | — | REQ-CUST-25 |
| Country (Shipping) | Dropdown | `#shipping_country` | ❌ | 251 lựa chọn | REQ-CUST-25 |

### 3.3. Modal Liên hệ (`#contact`)

| Field (Label) | Loại UI | Định danh DOM | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|---|
| Profile image | File | `#profile_image` | ❌ | Không khai báo thuộc tính `accept` | REQ-CUST-43 | Xem AMB-05 |
| First Name | Textbox | `#firstname` | ✅ | Không có ràng buộc độ dài | REQ-CUST-35 | — |
| Last Name | Textbox | `#lastname` | ✅ | Không có ràng buộc độ dài | REQ-CUST-35 | — |
| Position | Textbox | `#title` / `name="title"` | ❌ | — | REQ-CUST-34 | Nhãn hiển thị là `Position`, tên trường là `title` |
| Email | Textbox (email) | `#email` | ✅ | Đúng định dạng email **và** không trùng với email liên hệ đã có (kiểm tra AJAX) | REQ-CUST-35, 36, 37 | — |
| Phone | Textbox | `name="phonenumber"` | ❌ | Không validate định dạng | REQ-CUST-34 | — |
| Direction | Dropdown | `#direction` | ❌ | 3 lựa chọn: rỗng, `LTR`, `RTL` | REQ-CUST-44 | — |
| Password | Textbox (password) | `name="password"` | ⚠️ **Có điều kiện** | Bắt buộc khi KHÔNG tick `Send SET password email`. Không có ràng buộc độ dài tối thiểu phía client | REQ-CUST-38 | Nằm trong wrapper `.client_password_set_wrapper`, bị ẩn bằng class `hide` |
| Primary Contact | Checkbox | `#contact_primary` / `name="is_primary"` | ❌ | **Mặc định TICK** | REQ-CUST-39 | — |
| Do not send welcome email | Checkbox | `#donotsendwelcomeemail` | ❌ | Mặc định không tick | REQ-CUST-40 | — |
| Send SET password email | Checkbox | `#send_set_password_email` | ❌ | Mặc định không tick. Khi tick → ẩn ô Password | REQ-CUST-38 | — |
| Permissions (6 mục) | Công tắc | `name="permissions[]"`, `id` = `1`…`6` | ❌ | Thứ tự id 1→6: `Invoices`, `Estimates`, `Contracts`, `Proposals`, `Support`, `Projects`. **Mặc định bật tất cả** | REQ-CUST-41 | ⚠️ `id` là số thuần — xem RISK-05 |
| Email Notifications (7 mục) | Công tắc | `invoice_emails`, `estimate_emails`, `credit_note_emails`, `project_emails`, `ticket_emails`, `task_emails`, `contract_emails` | ❌ | **Mặc định bật tất cả** | REQ-CUST-42 | — |

### 3.4. Form Nhập khẩu (`/admin/clients/import`)

| Field (Label) | Loại UI | Định danh DOM | Required | Ràng buộc | REQ liên quan |
|---|---|---|---|---|---|
| Choose CSV File | File | `#file_csv` | ✅ | Định dạng CSV, mã hoá UTF-8 | REQ-CUST-47, 50 |
| Groups | Multi-select | `#groups_in[]` | ❌ | Gán cho toàn bộ bản ghi nhập vào | REQ-CUST-52 |
| Default password for all contacts | Textbox | `#default_pass_all` | ❌ | Áp dụng chung cho mọi liên hệ được nhập | REQ-CUST-53 |

**27 cột của tệp CSV** (theo đúng thứ tự trên UI; `*` = bắt buộc):
`*Firstname`, `*Lastname`, `*Email`, `Contact phonenumber`, `Position`, `*Company`, `Vat`, `Phonenumber`, `Country`, `City`, `Zip`, `State`, `Address`, `Website`, `Billing street`, `Billing city`, `Billing state`, `Billing zip`, `Billing country`, `Shipping street`, `Shipping city`, `Shipping state`, `Shipping zip`, `Shipping country`, `Longitude`, `Latitude`, `Stripe id`

---

## 4. Business Rules & Validation Messages

> Lỗi hiển thị **inline** ngay dưới ô nhập, trong thẻ `<p id="<tên-trường>-error" class="text-danger">`; đồng thời `.form-group` bao ngoài được thêm class `has-error`.

| REQ ID | Rule / Trigger | Thông báo lỗi mong đợi (nguyên văn) | Nơi hiển thị |
|---|---|---|---|
| REQ-CUST-16 | Bỏ trống Company khi lưu khách hàng | `This field is required.` | Inline dưới ô Company |
| REQ-CUST-35 | Bỏ trống First Name | `This field is required.` | `#firstname-error` |
| REQ-CUST-35 | Bỏ trống Last Name | `This field is required.` | `#lastname-error` |
| REQ-CUST-35 | Bỏ trống Email liên hệ | `This field is required.` | `#email-error` |
| REQ-CUST-36 | Email liên hệ sai định dạng | `Please enter a valid email address.` | `#email-error` |
| REQ-CUST-37 | Email liên hệ đã tồn tại | `Email already exists` | `#email-error` |
| REQ-CUST-38 | Bỏ trống Password (khi không tick `Send SET password email`) | `This field is required.` | `#password-error` |
| REQ-CUST-21 | Bỏ trống Name khi tạo nhóm mới | `This field is required.` | Inline trong modal nhóm |
| REQ-CUST-30 | Bấm xoá khách hàng | `Are you sure you want to perform this action?` | Hộp thoại `confirm` của trình duyệt |
| REQ-CUST-27 | CSRF token sai/thiếu | `419 Page Expired!` (HTTP 403) | Trang lỗi toàn màn hình |
| REQ-CUST-31 | Truy cập khách hàng đã bị xoá | `404 Page Not Found` | Trang lỗi toàn màn hình |

**Quy tắc nghiệp vụ bổ sung (không có thông báo lỗi):**

| REQ ID | Quy tắc |
|---|---|
| REQ-CUST-18 | Tên Company **được phép trùng lặp** giữa các khách hàng |
| REQ-CUST-37 | Email liên hệ **phải là duy nhất trên toàn hệ thống**, không chỉ trong phạm vi một khách hàng |
| REQ-CUST-32 | Xoá khách hàng sẽ xoá theo toàn bộ liên hệ trực thuộc |
| REQ-CUST-38 | Password của liên hệ bắt buộc **có điều kiện** — phụ thuộc checkbox `Send SET password email` |
| REQ-CUST-39 | Liên hệ mới **mặc định** là liên hệ chính (Primary Contact) |
| REQ-CUST-41, 42 | Liên hệ mới **mặc định được cấp toàn bộ 6 quyền và 7 loại thông báo email** |
| REQ-CUST-13 | Khách hàng Inactive vẫn tồn tại nhưng không xuất hiện trong dropdown khi tạo bản ghi mới |
| REQ-CUST-51 | Khi nhập khẩu, dòng có email trùng bị **bỏ qua** (không báo lỗi dừng toàn bộ) |

---

## 5. Ma Trận Phân Quyền

### 5.1. Phân quyền theo role nhân viên (Staff)

**Chưa kiểm chứng được.** Chỉ được cung cấp **một tài khoản Administrator** (`admin@example.com`). Perfex CRM có hệ thống phân quyền theo role với 4 quyền riêng cho module Customers (`View`, `Create`, `Edit`, `Delete`), nhưng không có tài khoản role thấp hơn để xác minh hành vi thực tế — xem AMB-06.

Ma trận quan sát được với role Administrator:

| Hành động | Administrator |
|---|---|
| Xem danh sách khách hàng | ✅ |
| Tạo khách hàng mới | ✅ |
| Sửa khách hàng | ✅ |
| Xoá khách hàng | ✅ |
| Xoá hàng loạt (Mass Delete) | ✅ |
| Nhập khẩu CSV | ✅ |
| Xuất dữ liệu (Excel/CSV/PDF/Print) | ✅ |
| Thêm/sửa/xoá liên hệ | ✅ |
| Bật/tắt trạng thái Active | ✅ |
| Xem danh bạ liên hệ toàn hệ thống | ✅ |

### 5.2. Phân quyền của Liên hệ (Contact) trên Client Portal

Đây là ma trận **đã kiểm chứng được** — cấu hình ngay trong modal liên hệ:

| Quyền | ID checkbox | Mặc định | Ý nghĩa |
|---|---|---|---|
| Invoices | `1` | ✅ Bật | Liên hệ xem được hoá đơn trên Client Portal |
| Estimates | `2` | ✅ Bật | Liên hệ xem được báo giá |
| Contracts | `3` | ✅ Bật | Liên hệ xem được hợp đồng |
| Proposals | `4` | ✅ Bật | Liên hệ xem được đề xuất |
| Support | `5` | ✅ Bật | Liên hệ tạo/xem được ticket hỗ trợ |
| Projects | `6` | ✅ Bật | Liên hệ xem được dự án |

---

## 6. Ma Trận Trạng Thái

### 6.1. Trạng thái Khách hàng (Customer)

| Trạng thái hiện tại | Hành động | Trạng thái kế tiếp | Ai được thực hiện | Kết quả quan sát được |
|---|---|---|---|---|
| (chưa tồn tại) | Tạo mới với Company hợp lệ | **Active** | Administrator | Chuyển tới trang chi tiết; `Total` và `Active Customers` cùng tăng 1 |
| Active | Tắt công tắc ở cột `Active` | **Inactive** | Administrator | `Active Customers` giảm 1, `Inactive Customers` tăng 1 (cập nhật sau khi tải lại trang) |
| Inactive | Bật lại công tắc | **Active** | Administrator | Số liệu đảo ngược tương ứng |
| Active / Inactive | Xoá (đơn lẻ hoặc Mass Delete) | **Đã xoá** | Administrator | Về `/admin/clients`; truy cập lại ID → `404 Page Not Found`; liên hệ trực thuộc bị xoá theo |

> Trạng thái khách hàng là **nhị phân** (Active/Inactive), không có luồng phê duyệt nhiều bước.

### 6.2. Trạng thái Liên hệ (Contact)

| Trạng thái hiện tại | Hành động | Trạng thái kế tiếp | Ghi chú |
|---|---|---|---|
| (chưa tồn tại) | Tạo liên hệ hợp lệ | **Active** (`Active = Yes`) | Mặc định là Primary Contact nếu là liên hệ đầu tiên |
| Active | Tắt trạng thái | **Inactive** | Phản ánh vào chỉ số `Inactive Contacts` ở bảng tổng quan |
| Active / Inactive | Xoá khách hàng chủ quản | **Đã xoá** | Xoá theo dây chuyền (REQ-CUST-32) |

---

## 7. Điểm Mơ Hồ (Ambiguities)

| Mã | Câu hỏi cần làm rõ với PO/BA | Nguy cơ nếu không giải quyết | Mức độ | Assumption tạm (dùng để viết test) |
|---|---|---|---|---|
| AMB-01 | Trường **Company** chỉ được kiểm tra bắt buộc ở phía client. Khi gửi request bỏ qua tầng JS, hệ thống **vẫn tạo khách hàng với tên rỗng** (đã kiểm chứng — tạo được bản ghi ID 12123 với Company rỗng). Đây là lỗi hay chấp nhận được? | Dữ liệu rác không tên lọt vào hệ thống qua API/import; test case "bắt buộc nhập" sẽ mâu thuẫn giữa tầng UI và tầng API | 🔴 High | Coi đây là **lỗi thiếu validation phía server**, cần báo dev. Test UI vẫn assert theo hành vi client (hiện lỗi inline) | 
| AMB-02 | Tên Company được phép trùng hoàn toàn (đã kiểm chứng). Đây có phải chủ đích nghiệp vụ không? Có tiêu chí nào khác để phân biệt hai khách hàng cùng tên? | Nếu thực tế cần chặn trùng, hàng loạt test "tạo khách hàng" đang PASS sai; người dùng khó phân biệt bản ghi trùng tên | 🟡 Medium | Tạm coi trùng tên là **hành vi đúng** (REQ-CUST-18) và ghi rõ trong test case |
| AMB-03 | Các trường **Phone**, **Website**, **VAT Number**, **Zip Code** đều là `text` thuần, không có bất kỳ ràng buộc định dạng nào. Có yêu cầu validate không (số điện thoại chỉ chứa số, website phải là URL hợp lệ)? | Không có tiêu chí PASS/FAIL cho nhóm test nhập liệu sai định dạng — không biết nên kỳ vọng lỗi hay chấp nhận | 🟡 Medium | Tạm giả định **không có ràng buộc định dạng** — mọi giá trị chuỗi đều được chấp nhận |
| AMB-04 | Độ dài tối đa của các trường (Company, Address, VAT…) là bao nhiêu? Không trường nào khai báo `maxlength` trên HTML | Không thiết kế được test giá trị biên; nhập chuỗi rất dài có thể gây lỗi 500 hoặc cắt dữ liệu âm thầm | 🟡 Medium | Không kiểm chứng bằng chuỗi cực dài để tránh tạo dữ liệu rác trên môi trường dùng chung. Tạm giả định giới hạn theo schema CSDL (`VARCHAR`) và **loại khỏi test tự động** cho tới khi có xác nhận |
| AMB-05 | Trường **Profile image** không khai báo thuộc tính `accept` — hệ thống chấp nhận định dạng ảnh nào, dung lượng tối đa bao nhiêu? | Không test được nhánh tải tệp sai định dạng/quá dung lượng; rủi ro bảo mật nếu cho tải tệp thực thi | 🟡 Medium | Tạm giả định chỉ chấp nhận ảnh thông dụng (jpg/png/gif) và bị chặn ở phía server. **Cần dev xác nhận** |
| AMB-06 | Nhân viên (Staff) với role không phải Administrator sẽ thấy và làm được gì trong module này? Perfex có 4 quyền riêng (View/Create/Edit/Delete) cho Customers | Ma trận phân quyền tại mục 5.1 bị bỏ trống → không có test phân quyền, rủi ro rò rỉ dữ liệu khách hàng | 🔴 High | Chưa có tài khoản để kiểm chứng. **Đề nghị PO cấp ít nhất 1 tài khoản Staff quyền hạn chế** trước khi viết bộ test phân quyền |
| AMB-07 | Xoá khách hàng đang có dữ liệu ràng buộc (hoá đơn, dự án, hợp đồng) thì hệ thống xử lý ra sao — chặn lại, xoá theo dây chuyền, hay để mồ côi? | Nhánh test quan trọng nhất của chức năng xoá bị bỏ sót; rủi ro mất dữ liệu tài chính | 🔴 High | Chỉ kiểm chứng được với khách hàng **không có dữ liệu ràng buộc** (chỉ có 1 liên hệ → bị xoá theo). Không thử trên khách hàng có hoá đơn để tránh phá dữ liệu demo. Tạm giả định hệ thống **chặn** và cần xác nhận |
| AMB-08 | Chức năng **Mass Delete** có hiển thị xác nhận riêng không, và có giới hạn số bản ghi mỗi lần không? | Thao tác nguy hiểm nhất của module chưa có tiêu chí kiểm thử | 🔴 High | **Không thực thi thử** trên môi trường dùng chung để tránh xoá nhầm dữ liệu người khác. Cần môi trường riêng để kiểm chứng |
| AMB-09 | Trạng thái **Inactive** ngoài việc ẩn khỏi dropdown còn ảnh hưởng gì khác (liên hệ có đăng nhập Client Portal được không, có nhận email không)? | Test trạng thái chỉ dừng ở mức bề mặt, bỏ sót tác động nghiệp vụ thực sự | 🟡 Medium | Chỉ giả định theo tooltip nguyên văn: `Won't be shown in dropdowns when creating new records` |
| AMB-10 | Danh sách nhóm khách hàng (Groups) hiện có **305 mục** với rất nhiều tên trùng nhau (`aaa`, `afk`, `ctp group` lặp hơn 10 lần). Hệ thống có chặn tạo nhóm trùng tên không? | Dropdown khó dùng; test chọn nhóm theo tên sẽ chọn nhầm mục | 🟢 Low | Tạm giả định **không chặn trùng tên nhóm**. Automation phải chọn nhóm theo `value` (ID), tuyệt đối không theo tên |
| AMB-11 | Bảng tổng quan chỉ cập nhật khi tải lại trang, không cập nhật ngay sau khi đổi trạng thái. Đây là thiết kế hay thiếu sót? | Test assert số liệu ngay sau thao tác sẽ fail không rõ lý do | 🟢 Low | Ghi nhận hành vi hiện tại: **phải tải lại trang** mới thấy số liệu mới (REQ-CUST-03) |

---

## 8. Rủi Ro Kiểm Thử (Risks)

| Mã | Tên rủi ro | Mô tả | Mitigation (cách giảm thiểu khi test) |
|---|---|---|---|
| RISK-01 | Test tạo dữ liệu rác trên môi trường dùng chung | Mỗi lần chạy test tạo khách hàng/liên hệ mới trên `crm.anhtester.com` — nơi nhiều người cùng dùng. Bằng chứng: hệ thống đã có sẵn dữ liệu rác kiểu `Project_Auto_Company_1785391074` | Dùng dữ liệu **traceable** (`Auto_Customer_<timestamp>`); **bắt buộc** dọn dẹp ở `afterEach`/`afterAll`; không bao giờ tạo dữ liệu mà không có bước xoá tương ứng |
| RISK-02 | Xoá nhầm dữ liệu của người khác | Chức năng Mass Delete và bộ lọc thao tác trên dữ liệu dùng chung; một lệnh chọn sai có thể xoá hàng loạt bản ghi thật | **Không automate Mass Delete** trên môi trường dùng chung; chỉ xoá đúng ID do chính test tạo ra; không dùng "select all" |
| RISK-03 | Xoá bằng phương thức GET, không có xác nhận phía server | URL `/admin/clients/delete/{id}` xoá bản ghi ngay khi được **truy cập** — hộp thoại xác nhận chỉ tồn tại phía client. Đã kiểm chứng: gọi trực tiếp URL là bản ghi biến mất | Đưa vào phạm vi security testing (nguy cơ CSRF/prefetch). Với automation chức năng: luôn thao tác qua UI để cũng kiểm chứng được hộp thoại xác nhận |
| RISK-04 | Danh sách rất lớn, DataTables xử lý phía server | 1.431 khách hàng, 366 liên hệ; bảng tải theo trang qua AJAX | Không assert theo chỉ số dòng cố định; luôn **tìm kiếm theo dữ liệu traceable** rồi mới thao tác; chờ AJAX hoàn tất bằng web-first assertion, không dùng sleep cứng |
| RISK-05 | Locator của công tắc phân quyền dùng `id` là số thuần | Các checkbox quyền có `id="1"`…`id="6"` — vừa dễ trùng với element khác, vừa là selector CSS không hợp lệ nếu viết trực tiếp (`#1`) | Định vị bằng `input[name="permissions[]"]` kèm chỉ số, hoặc theo nhãn quyền; tuyệt đối không dùng `#1` |
| RISK-06 | Trình duyệt tự điền dữ liệu vào form | Trong quá trình khảo sát, Chrome đã **tự điền `admin@example.com`** vào ô Email của modal liên hệ, khiến validation hiển thị sai thông báo và suýt ghi nhận nhầm thành lỗi ứng dụng | Chạy test với profile trình duyệt sạch, tắt autofill; luôn `fill('')` xoá trắng trước khi nhập; kiểm chứng lại giá trị thực tế của field trước khi assert lỗi |
| RISK-07 | Kiểm tra trùng email là lời gọi AJAX bất đồng bộ | Thông báo `Email already exists` chỉ xuất hiện sau khi request tới `/admin/misc/contact_email_exists` phản hồi — dễ gây flaky nếu assert quá sớm | Dùng web-first assertion chờ đúng thông báo trong `#email-error`; không assert ngay sau khi gõ xong |
| RISK-08 | Dropdown Groups có 305 mục, nhiều tên trùng | Chọn nhóm theo nhãn sẽ chọn nhầm mục | Chọn theo `value` (ID nhóm); nếu test cần nhóm cụ thể thì tự tạo nhóm mới với tên traceable rồi xoá sau |
| RISK-09 | Trường bắt buộc chỉ được bảo vệ ở tầng client | Company bắt buộc phía UI nhưng server chấp nhận rỗng (AMB-01) | Tách rõ 2 nhóm test: **UI** assert lỗi inline; **API** ghi nhận hành vi hiện tại là khiếm khuyết, gắn nhãn `known-issue` thay vì để test fail liên tục |
| RISK-10 | Dữ liệu nghiệp vụ liên kết chằng chịt | Khách hàng được tham chiếu bởi hoá đơn, dự án, hợp đồng, ticket… Xoá khách hàng có thể gây hệ quả dây chuyền chưa lường hết (AMB-07) | Test xoá **chỉ thực hiện trên khách hàng do chính test tạo, chưa phát sinh dữ liệu liên quan** |

---

## 9. Luồng Xử Lý (User Flows)

### 9.1. Luồng chính — Tạo khách hàng mới (Happy Path)

```
1. Đăng nhập, vào menu Customers (/admin/clients)
2. Click "+ New Customer" → mở /admin/clients/client
3. Tab "Customer Details": nhập Company (bắt buộc)
4. (Tuỳ chọn) Nhập VAT, Phone, Website, Groups, Currency, Language, Address, City, State, Zip, Country
5. (Tuỳ chọn) Chuyển tab "Billing & Shipping" nhập địa chỉ thanh toán/giao hàng
6. Click "Save"
7. Hệ thống tạo bản ghi → chuyển tới /admin/clients/client/{id}
   → Tiêu đề trang bằng tên công ty; khách hàng ở trạng thái Active
```

### 9.2. Luồng phụ — Thiếu trường bắt buộc

```
1..2. Như luồng chính
3. Để trống ô Company
4. Click "Save"
5. Form KHÔNG submit; ô Company được bọc class "has-error"
   và hiện lỗi inline "This field is required."
```

### 9.3. Luồng chính — Thêm liên hệ cho khách hàng

```
1. Mở trang chi tiết khách hàng → tab "Contacts"
2. Click "New Contact" → mở modal "Add new contact"
3. Nhập First Name, Last Name, Email (bắt buộc)
4. Nhập Password — HOẶC tick "Send SET password email" để hệ thống gửi email đặt mật khẩu
   (khi tick, ô Password tự động ẩn và không còn bắt buộc)
5. (Tuỳ chọn) Nhập Position, Phone, Direction, ảnh đại diện
6. (Tuỳ chọn) Điều chỉnh 6 quyền và 7 loại thông báo email — mặc định bật hết
7. Click "Save"
8. Modal đóng; dòng liên hệ mới xuất hiện ngay trong bảng với Active = Yes
```

### 9.4. Luồng phụ — Email liên hệ bị trùng

```
1..3. Như luồng 9.3, nhập email đã tồn tại trong hệ thống
4. Rời khỏi ô Email (blur) → hệ thống gọi AJAX kiểm tra
   /admin/misc/contact_email_exists
5. Hiện lỗi inline "Email already exists" dưới ô Email
6. Không thể lưu cho tới khi đổi sang email khác
```

### 9.5. Luồng — Bật/tắt trạng thái hoạt động

```
1. Tại danh sách khách hàng, tìm khách hàng cần đổi trạng thái
2. Click công tắc ở cột "Active"
3. Hệ thống gửi request tới /admin/clients/change_client_status
4. Công tắc đổi trạng thái ngay lập tức
5. Tải lại trang → bảng tổng quan cập nhật:
   Active Customers và Inactive Customers thay đổi tương ứng
```

### 9.6. Luồng — Xoá khách hàng

```
1. Mở trang chi tiết khách hàng
2. Click nút dropdown (caret) cạnh tên khách hàng
3. Click "Delete"
4. Trình duyệt hiện hộp thoại: "Are you sure you want to perform this action?"
5a. Chọn Cancel → không có gì thay đổi
5b. Chọn OK  → xoá bản ghi, chuyển về /admin/clients
                 các liên hệ trực thuộc bị xoá theo
                 truy cập lại ID cũ → 404 Page Not Found
```

### 9.7. Luồng — Nhập khẩu khách hàng từ CSV

```
1. Tại danh sách, click "Import Customers" → mở /admin/clients/import
2. Click "Download Sample" để tải tệp mẫu đúng cấu trúc 27 cột
3. Chuẩn bị tệp CSV: dòng đầu là tiêu đề cột, mã hoá UTF-8,
   cột ngày theo định dạng Y-m-d
4. Chọn tệp tại "Choose CSV File"
5. (Tuỳ chọn) Chọn Groups áp dụng cho toàn bộ bản ghi
6. (Tuỳ chọn) Nhập "Default password for all contacts"
7. Submit → hệ thống nhập dữ liệu
   → Các dòng có email trùng bị bỏ qua, không được nhập
```

### 9.8. Luồng — Tìm kiếm và xuất dữ liệu

```
1. Tại danh sách, nhập từ khoá vào ô "Search..."
2. Bảng lọc lại qua AJAX, dòng thông tin hiển thị:
   "Showing X to Y of Z entries (filtered from N total entries)"
3. (Tuỳ chọn) Thêm điều kiện lọc nâng cao qua "New Filter" (15 tiêu chí)
4. Click "Export" → chọn Excel / CSV / PDF / Print
```

---

## 10. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

| Hạng mục | Ghi nhận từ khảo sát thực tế |
|---|---|
| Khả năng chịu tải dữ liệu | Danh sách hoạt động bình thường với **1.431 khách hàng** và **366 liên hệ** nhờ DataTables xử lý phía server (mỗi lần chỉ tải 25 dòng) |
| Bảo mật kênh truyền | Toàn bộ module chạy trên HTTPS |
| Chống CSRF | Mọi form đều có token ẩn `csrf_token_name`; request sai token trả HTTP 403. ⚠️ **Ngoại lệ:** thao tác xoá qua URL GET không được bảo vệ bằng token (xem RISK-03) |
| Kiểm soát truy cập | Mọi URL của module đều bị chặn khi chưa đăng nhập, chuyển hướng về trang login (xem [REQ-LOGIN-18](../login/requirements_login.md)) |
| Trải nghiệm nhập liệu | Validation hiển thị **inline ngay tại ô nhập**, không cần tải lại trang (khác hẳn module Login) |
| Đa ngôn ngữ | Hệ thống hỗ trợ 27 ngôn ngữ; có thể đặt ngôn ngữ riêng cho từng khách hàng. Giao diện admin đang ở tiếng Anh |
| Hỗ trợ RTL | Liên hệ có thiết lập `Direction` (LTR/RTL) phục vụ ngôn ngữ viết từ phải sang trái |
| Khả năng tiếp cận (Accessibility) | Các trường đều có `<label for="...">` liên kết đúng. ⚠️ Các công tắc phân quyền không có nhãn liên kết trực tiếp với checkbox (`id` là số thuần) — bất lợi cho trình đọc màn hình |
| Khả năng tích hợp | Có cột `Stripe id` trong tệp nhập khẩu → module có liên kết với cổng thanh toán Stripe |

---

## 11. Gợi Ý Locator Cho Automation

Các locator dưới đây đã được **kiểm chứng trực tiếp** trên DOM thực tế (viewport 1920×1080):

### Danh sách khách hàng

| Element | Playwright (ưu tiên semantic) | Selenium (Java) |
|---|---|---|
| Nút New Customer | `page.getByRole('link', { name: 'New Customer' })` | `By.cssSelector("a[href$='/clients/client']")` |
| Nút Import Customers | `page.getByRole('link', { name: 'Import Customers' })` | `By.cssSelector("a[href$='/clients/import']")` |
| Nút Contacts | `page.getByRole('link', { name: 'Contacts' })` | `By.cssSelector("a[href$='/all_contacts']")` |
| Bảng khách hàng | `page.locator('#clients')` | `By.id("clients")` |
| Ô tìm kiếm | `page.getByPlaceholder('Search...')` | `By.cssSelector("#clients_filter input")` |
| Dòng thông tin phân trang | `page.locator('#clients_info')` | `By.id("clients_info")` |
| Công tắc Active của 1 dòng | `page.locator(\`label.onoffswitch-label[for="${id}"]\`) | `By.cssSelector("label.onoffswitch-label[for='"+id+"']")` |
| Số dòng mỗi trang | `page.locator('select[name="clients_length"]')` | `By.name("clients_length")` |

### Form khách hàng

| Element | Playwright | Selenium (Java) |
|---|---|---|
| Company | `page.getByLabel('Company')` | `By.id("company")` |
| VAT Number | `page.getByLabel('VAT Number')` | `By.id("vat")` |
| Phone | `page.locator('#phonenumber')` | `By.id("phonenumber")` |
| Website | `page.getByLabel('Website')` | `By.id("website")` |
| Country | `page.locator('#country')` | `By.id("country")` |
| Nút Save | `page.locator('button.only-save')` | `By.cssSelector("button.only-save")` |
| Nút Save and create contact | `page.locator('button.save-and-add-contact')` | `By.cssSelector("button.save-and-add-contact")` |
| Lỗi inline của 1 trường | `page.locator('#company-error')` | `By.id("company-error")` |

### Modal liên hệ

| Element | Playwright | Selenium (Java) |
|---|---|---|
| Modal | `page.locator('#contact')` | `By.id("contact")` |
| First Name | `page.locator('#contact #firstname')` | `By.id("firstname")` |
| Last Name | `page.locator('#contact #lastname')` | `By.id("lastname")` |
| Email | `page.locator('#contact #email')` | `By.id("email")` |
| Password | `page.locator('#contact input[name="password"]')` | `By.cssSelector("#contact input[name='password']")` |
| Primary Contact | `page.locator('#contact_primary')` | `By.id("contact_primary")` |
| Send SET password email | `page.locator('#send_set_password_email')` | `By.id("send_set_password_email")` |
| Công tắc quyền thứ n | `page.locator('#contact input[name="permissions[]"]').nth(n)` | `By.cssSelector("#contact input[name='permissions[]']")` |
| Lỗi email | `page.locator('#email-error')` | `By.id("email-error")` |

> ⚠️ **Lưu ý locator:**
> - Không dùng `#1`…`#6` cho công tắc phân quyền — `id` số thuần không phải selector CSS hợp lệ (xem RISK-05).
> - Ô `#email`, `#firstname`, `#lastname` xuất hiện ở nhiều nơi trên trang → **luôn giới hạn trong phạm vi `#contact`**.
> - Chọn Groups theo `value` (ID nhóm), không theo nhãn — có nhiều nhóm trùng tên (xem RISK-08).

---

## 12. Bước Tiếp Theo

Tài liệu này (có mã REQ ID) là input chuẩn cho các workflow sau:

| Workflow | Mục đích |
|---|---|
| `/generate_testcases_manual_rbt` | Sinh manual test cases theo quy trình AI-RBT 6 bước (có đánh giá rủi ro) |
| `/generate_testcases_from_requirements` | Sinh nhanh manual test cases (QUICK mode) |
| `/generate_automation_from_testcases` | Chuyển manual test cases thành automation scripts |
| `/generate_cross_module_test_plan` | Phân tích luồng xuyên module (Customer → Invoice → Payment…) |
| `/generate_traceability_matrix` | Sinh ma trận truy vết RTM: Requirements ↔ Test Cases ↔ Automation |

**Cần PO/BA phản hồi trước khi hoàn thiện bộ test** — 4 điểm mức 🔴 High:

| Mã | Nội dung | Vì sao chặn |
|---|---|---|
| AMB-01 | Company không được validate phía server | Quyết định test case "trường bắt buộc" ở tầng API là PASS hay FAIL |
| AMB-06 | Chưa có tài khoản Staff quyền hạn chế | Không thể viết bất kỳ test phân quyền nào |
| AMB-07 | Hành vi xoá khách hàng đang có dữ liệu ràng buộc | Nhánh rủi ro cao nhất của chức năng xoá đang bỏ trống |
| AMB-08 | Quy tắc của Mass Delete | Thao tác nguy hiểm nhất module, chưa dám kiểm chứng trên môi trường dùng chung |

**Đề xuất bổ sung:** xin cấp **môi trường test riêng** (không dùng chung `crm.anhtester.com`) để có thể kiểm chứng an toàn các thao tác phá huỷ dữ liệu (Mass Delete, xoá khách hàng có ràng buộc, nhập khẩu số lượng lớn) — hiện các nhánh này buộc phải bỏ trống vì rủi ro ảnh hưởng người dùng khác.

---

**Tổng kết số lượng:** 53 yêu cầu chức năng (REQ-CUST-01 → 53) · 11 điểm mơ hồ (AMB-01 → 11) · 10 rủi ro (RISK-01 → 10)

---

## Nhật Ký Thay Đổi (Changelog)

> **Cách đọc:** mới nhất lên trên. Đây là bộ nhớ liền mạch của tài liệu.
>
> **Quy ước trạng thái REQ:** 🟢 Active · 🟡 Changed (TC phải review) · 🔴 Deprecated (TC phải archive) · ⚪ Chưa implement.
> **REQ không được ghi trạng thái = 🟢 Active.**
>
> Cập nhật bằng `/update_requirements_from_ticket`.

| Ngày | Nguồn | REQ ảnh hưởng | Loại | Tóm tắt thay đổi | TC cần xử lý |
|---|---|---|---|---|---|
| 2026-08-02 | UI recon (Playwright MCP) | REQ-CUST-01 → 53 | 🟢 Thêm | Khởi tạo tài liệu từ khảo sát UI thực tế | — |

**Trạng thái hiện tại:** 🟢 Active 53 · 🟡 Changed 0 · 🔴 Deprecated 0 · ⚪ Chưa implement 0
**Ambiguity:** 11/11 còn treo (❓) — AMB-01, AMB-06, AMB-07, AMB-08 mức 🔴 High
