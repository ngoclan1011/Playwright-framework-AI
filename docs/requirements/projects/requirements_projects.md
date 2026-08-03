# Tài Liệu Yêu Cầu — Module Projects (Perfex CRM)

| Thông tin | Nội dung |
|---|---|
| Hệ thống | CRM (Perfex CRM — Anh Tester Demo) |
| Module | Projects (Dự án) |
| URL chính | https://crm.anhtester.com/admin/projects |
| URL liên quan | `/admin/projects/project` (tạo mới) · `/admin/projects/project/{id}` (sửa) · `/admin/projects/view/{id}` (chi tiết) · `/admin/projects/gantt` (Gantt toàn hệ thống) · `/admin/projects/delete/{id}` (xoá) · `/admin/projects/pin_action/{id}` (ghim) · `/admin/projects/export_project_data/{id}` (xuất dữ liệu dự án) |
| Tài khoản khảo sát | `admin@example.com` / `123456` (role: Administrator) |
| Phương pháp | Inspect DOM thực tế bằng Playwright MCP — viewport 1920×1080, headed mode. Đã tạo/xoá dữ liệu thật để kiểm chứng hành vi |
| Ngày khảo sát | 2026-08-02 |
| Bằng chứng | [Danh sách dự án](evidence/projects_list_1920x1080.png) · [Form tạo mới](evidence/project_new_form_1920x1080.png) · [Tab Project Settings](evidence/project_settings_tab_1920x1080.png) · [Trang chi tiết](evidence/project_view_overview_1920x1080.png) |
| Tài liệu liên quan | [requirements_customers.md](../customers/requirements_customers.md) · [requirements_login.md](../login/requirements_login.md) |
| **Dải mã đã dùng** | `REQ-PRJ-01` → `REQ-PRJ-65` · `AMB-01` → `AMB-12` · `RISK-01` → `RISK-12`<br>(đợt 1 — UI recon 2026-08-02: 01→65) |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-PRJ-66` · `AMB-13` · `RISK-13` — **KHÔNG đánh lại từ 01** |
| Phiên bản | 1.0 |

> **Ghi chú về dữ liệu test:** Trong quá trình khảo sát đã tạo **1 dự án** với dữ liệu traceable (`REQ_RECON_1785679141788`, ID `2651`) để kiểm chứng luồng lưu thành công, sau đó **đã xoá**. Đã xác minh: truy cập `/admin/projects/view/2651` trả về trang `not_found` — môi trường được trả về nguyên trạng (94 dự án).

---

## 1. Tổng Quan (Overview)

Module Projects quản lý vòng đời dự án của CRM. Mỗi **Project** luôn thuộc về đúng **một Customer** (xem [requirements_customers.md](../customers/requirements_customers.md)) và là thực thể trung tâm gom nhóm 17 loại dữ liệu nghiệp vụ con: Tasks, Timesheets, Milestones, Files, Discussions, Gantt, Tickets, Contracts, Proposals, Estimates, Invoices, Subscriptions, Expenses, Credit Notes, Notes, Activity.

Điểm đặc thù của module: **mỗi dự án tự mang theo bộ cấu hình phân quyền riêng cho phía khách hàng** (18 checkbox trong tab *Project Settings*) và bộ **Visible Tabs** quyết định khách hàng nhìn thấy tab nào trên Client Portal. Đây là phần logic nghiệp vụ nặng nhất của module và cũng là vùng dễ sót test nhất.

**Phạm vi tài liệu:**
- ✅ Trong phạm vi: danh sách dự án (thống kê, tìm kiếm, lọc nâng cao, sắp xếp, phân trang, xuất dữ liệu), tạo/sửa/xoá dự án, sao chép dự án (Copy Project), đổi trạng thái nhanh, ghim dự án, xuất dữ liệu dự án, cấu hình quyền khách hàng và Visible Tabs, các chỉ số trên trang tổng quan dự án.
- ❌ Ngoài phạm vi: nghiệp vụ bên trong 17 tab con của trang chi tiết (Tasks, Milestones, Invoices…) — mỗi tab thuộc module riêng; màn hình Gantt toàn hệ thống; giao diện Client Portal phía khách hàng; cấu hình mặc định tại Setup → Settings.

**Đặc điểm kỹ thuật quan trọng:**
- Danh sách dùng **DataTables (server-side processing)**, ID bảng `#projects`.
- Form dùng **jQuery Validation** — validate phía client trước khi submit; lỗi hiển thị trong phần tử `#<field>-error`.
- Dropdown **Customer** (`#clientid`) là **bootstrap-select có tìm kiếm AJAX** — danh sách `<option>` rỗng cho tới khi người dùng gõ từ khoá.
- Form chia **2 tab**: `#tab_project` (thông tin dự án) và `#tab_settings` (cấu hình quyền khách hàng).
- Nhiều trường **ẩn/hiện động** theo `Billing Type`, `Status` và `Send contacts notifications`.

---

## 2. Yêu Cầu Chức Năng (Functional Requirements)

### 2.1. Danh sách dự án

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-01 | Hiển thị danh sách dự án | Trang `/admin/projects` hiển thị bảng dự án dạng DataTables | Bảng `#projects` với 8 cột: `#`, `Project Name`, `Customer`, `Tags`, `Start Date`, `Deadline`, `Members`, `Status` | UI thực tế |
| REQ-PRJ-02 | Bảng thống kê "Projects Summary" | Khu vực đầu trang hiển thị số lượng dự án theo từng trạng thái | Hiển thị 5 chỉ số: `Not Started`, `In Progress`, `On Hold`, `Cancelled`, `Finished` kèm số đếm (thời điểm khảo sát: 30 / 66 / 2 / 2 / 1) | UI thực tế |
| REQ-PRJ-03 | Lọc nhanh theo trạng thái từ bảng thống kê | Mỗi chỉ số trong Projects Summary là liên kết lọc danh sách | Các mục là thẻ `<a href="#">` — click để lọc bảng theo trạng thái tương ứng | DOM thực tế |
| REQ-PRJ-04 | Sắp xếp theo cột | Toàn bộ 8 cột đều sắp xếp được | Mọi `<th>` mang class `sorting`; mặc định sắp xếp theo cột `Deadline` tăng dần (`sorting_asc`) | DOM thực tế |
| REQ-PRJ-05 | Chọn số dòng mỗi trang | Người dùng chọn số bản ghi hiển thị | Dropdown có các lựa chọn: `10`, `25`, `50`, `100`, `All`. Mặc định `25` | UI thực tế |
| REQ-PRJ-06 | Phân trang | Danh sách chia trang, có điều hướng Previous/Next | Hiển thị `Showing 1 to 25 of 94 entries` kèm các nút số trang và `Previous` / `Next` | UI thực tế |
| REQ-PRJ-07 | Tìm kiếm nhanh | Ô `Search...` lọc danh sách theo từ khoá | Ô tìm kiếm `#search_input` phía trên bảng, lọc qua AJAX server-side | DOM thực tế |
| REQ-PRJ-08 | Bộ lọc nâng cao (Create Filter) | Cho phép tạo bộ luật lọc nhiều điều kiện | Modal `Create Filter` có 6 tiêu chí: `Project Name`, `Start Date`, `Deadline`, `Billing Type`, `Status`, `Members`; hỗ trợ `Add Rule`, toán tử `and`/`or`, `Apply` | DOM thực tế |
| REQ-PRJ-09 | Lưu bộ lọc để dùng lại | Bộ lọc vừa tạo có thể lưu lại | Modal có checkbox `projectsSaveFilter` và nút `Save Filter`; bộ lọc đã lưu có thao tác `Delete Filter` | DOM thực tế |
| REQ-PRJ-10 | Xuất dữ liệu danh sách | Nút `Export` xuất bảng ra tệp | Menu Export có 4 lựa chọn: `Excel`, `CSV`, `PDF`, `Print` | Kiểm chứng thực tế |
| REQ-PRJ-11 | Thao tác nhanh trên từng dòng | Hover vào tên dự án hiện các liên kết thao tác | Hiện `View` \| `Copy Project` \| `Edit` \| `Delete` | Kiểm chứng thực tế |
| REQ-PRJ-12 | Truy cập Gantt toàn hệ thống | Có nút mở biểu đồ Gantt tổng hợp mọi dự án | Nút bên cạnh `New Project` trỏ tới `/admin/projects/gantt` | DOM thực tế |
| REQ-PRJ-13 | Mở form tạo dự án mới | Nút `New Project` dẫn tới form tạo mới | Điều hướng tới `/admin/projects/project`, tiêu đề trang `Add new project` | Kiểm chứng thực tế |

### 2.2. Tạo & sửa dự án — tab *Project*

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-14 | Bố cục form theo 2 tab | Form chia thành 2 tab để nhóm thông tin | Tab `Project` (`#tab_project`) và tab `Project Settings` (`#tab_settings`) | DOM thực tế |
| REQ-PRJ-15 | Project Name là trường bắt buộc | Không lưu được dự án khi bỏ trống tên | Submit với `name` rỗng → hiện lỗi inline `This field is required.` dưới ô Project Name, form không submit | Kiểm chứng thực tế |
| REQ-PRJ-16 | Customer là trường bắt buộc | Phải chọn khách hàng mới lưu được dự án | Submit với `clientid` rỗng → `.form-group` của Customer nhận class `has-error` (viền đỏ), form không submit — **nhưng không hiện thông báo lỗi rõ ràng**, xem [AMB-01](#7-điểm-mơ-hồ-ambiguities) | Kiểm chứng thực tế |
| REQ-PRJ-17 | Chọn khách hàng bằng tìm kiếm AJAX | Dropdown Customer nạp dữ liệu theo từ khoá, không nạp sẵn toàn bộ | Trước khi gõ: `<select id="clientid">` chỉ có 1 option rỗng. Gõ `GM` → nạp danh sách khách hàng khớp (VD `9150 = Công ty GM`) | Kiểm chứng thực tế |
| REQ-PRJ-18 | Thông báo khi không tìm thấy khách hàng | Từ khoá không khớp thì báo rõ cho người dùng | Gõ từ khoá không tồn tại → dropdown hiển thị nguyên văn `No results found` | Kiểm chứng thực tế |
| REQ-PRJ-19 | Start Date là trường bắt buộc | Không lưu được dự án khi bỏ trống ngày bắt đầu | Xoá trắng `start_date` rồi submit → hiện lỗi inline `This field is required.` | Kiểm chứng thực tế |
| REQ-PRJ-20 | Start Date mặc định là ngày hiện tại | Form tạo mới điền sẵn ngày hôm nay | Mở `/admin/projects/project` → `start_date` có sẵn giá trị ngày hiện tại theo định dạng `dd-mm-yyyy` (khảo sát: `02-08-2026`) | Kiểm chứng thực tế |
| REQ-PRJ-21 | Deadline là trường tuỳ chọn | Dự án có thể lưu mà không cần deadline | Nhãn `Deadline` không có dấu `*`; tạo dự án thành công với Deadline rỗng | Kiểm chứng thực tế |
| REQ-PRJ-22 | Billing Type là trường bắt buộc | Phải chọn hình thức tính phí | Nhãn `* Billing Type`; dropdown `billing_type` có 3 lựa chọn: `Fixed Rate`, `Project Hours`, `Task Hours`. Mặc định `Task Hours` | DOM thực tế |
| REQ-PRJ-23 | Billing Type điều khiển trường giá | Trường nhập giá hiện/ẩn theo hình thức tính phí | `Fixed Rate` → hiện `Total Rate`, ẩn `Rate Per Hour`. `Project Hours` → hiện `Rate Per Hour`, ẩn `Total Rate`. `Task Hours` → ẩn cả hai | Kiểm chứng thực tế |
| REQ-PRJ-24 | Estimated Hours luôn hiển thị | Trường giờ ước tính không phụ thuộc Billing Type | `Estimated Hours` hiển thị ở cả 3 giá trị Billing Type | Kiểm chứng thực tế |
| REQ-PRJ-25 | Gợi ý ý nghĩa Billing Type | Chọn hình thức tính phí thì hiện mô tả kèm theo | Chọn `Task Hours` → hiện dòng mô tả `Based on task hourly rate` | Kiểm chứng thực tế |
| REQ-PRJ-26 | Trạng thái dự án | Dự án có 5 trạng thái, mặc định là In Progress | Dropdown `status` có 5 lựa chọn với giá trị: `1=Not Started`, `2=In Progress`, `3=On Hold`, `5=Cancelled`, `4=Finished`. Mặc định `2 = In Progress` | DOM thực tế |
| REQ-PRJ-27 | Tính tiến độ tự động theo tasks | Mặc định tiến độ dự án được tính từ tasks | Checkbox `Calculate progress through tasks` được **tick sẵn**; khi tick, thanh trượt tiến độ ở trạng thái `ui-slider-disabled` (không kéo được) | Kiểm chứng thực tế |
| REQ-PRJ-28 | Nhập tiến độ thủ công | Bỏ tick tính tự động thì được kéo tiến độ bằng tay | Bỏ tick `Calculate progress through tasks` → thanh trượt `.project_progress_slider` **mất** class `ui-slider-disabled` → kéo được | Kiểm chứng thực tế |
| REQ-PRJ-29 | Gán thành viên dự án | Chọn một hoặc nhiều nhân viên tham gia dự án | `project_members[]` là multi-select; mặc định chọn sẵn nhân viên đang đăng nhập (`Admin Example`) | Kiểm chứng thực tế |
| REQ-PRJ-30 | Gắn thẻ (Tags) cho dự án | Dự án có thể gắn nhiều thẻ tự do | Trường `tags` dùng plugin `tagsinput`, mỗi thẻ hiện dạng chip có nút `×` để gỡ | DOM thực tế |
| REQ-PRJ-31 | Mô tả dự án dạng rich text | Ô mô tả hỗ trợ định dạng văn bản | `description` là TinyMCE với thanh công cụ: `File`, `Edit`, `View`, `Insert`, `Format`, `Tools`, `Table` | DOM thực tế |
| REQ-PRJ-32 | Gửi email thông báo tạo dự án | Có tuỳ chọn gửi email khi tạo dự án | Checkbox `send_created_email` — nhãn `Send project created email`, mặc định **không tick** | DOM thực tế |
| REQ-PRJ-33 | Lưu dự án thành công | Lưu xong thì chuyển sang trang chi tiết dự án | Điền `Project Name` + `Customer` hợp lệ → bấm `Save` → chuyển tới `/admin/projects/view/{id}`, tiêu đề trang bằng tên dự án | Kiểm chứng thực tế (đã tạo ID `2651`) |
| REQ-PRJ-34 | Cho phép trùng tên dự án | Hệ thống KHÔNG chặn hai dự án cùng tên | Danh sách hiện có nhiều dự án trùng tên hoàn toàn (VD `Mua hàng qua app` ×11, `Dgrey Project` ×6) với ID khác nhau | UI thực tế |
| REQ-PRJ-35 | Bảo vệ CSRF cho form dự án | Form kèm token ẩn bắt buộc | Form chứa `<input type="hidden" name="csrf_token_name">` | DOM thực tế |

### 2.3. Tạo & sửa dự án — tab *Project Settings*

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-36 | Chọn cách thông báo cho liên hệ khách hàng | Quyết định gửi thông báo dự án tới ai | Dropdown `contact_notification` có 3 lựa chọn: `To all contacts with notifications for projects enabled` (mặc định), `Specific contacts`, `Do not send notifications` | DOM thực tế |
| REQ-PRJ-37 | Chọn liên hệ cụ thể để thông báo | Trường chọn liên hệ chỉ hiện khi chọn "Specific contacts" | Chọn `Specific contacts` → hiện multi-select `notify_contacts[]`. Hai lựa chọn còn lại → trường bị ẩn | Kiểm chứng thực tế |
| REQ-PRJ-38 | Cấu hình tab hiển thị cho khách hàng | Chọn những tab khách hàng được thấy trên Client Portal | Multi-select `settings[available_features][]` có 17 lựa chọn: `Overview`, `Tasks`, `Timesheets`, `Milestones`, `Files`, `Discussions`, `Gantt`, `Tickets`, `Contracts`, `Proposals`, `Estimates`, `Invoices`, `Subscriptions`, `Expenses`, `Credit Notes`, `Notes`, `Activity` | DOM thực tế |
| REQ-PRJ-39 | Phân quyền khách hàng theo từng dự án | Mỗi dự án có bộ 17 checkbox quyền riêng cho khách hàng | Xem đầy đủ tại [mục 5.2 — Ma trận phân quyền khách hàng](#52-phân-quyền-của-khách-hàng-trên-client-portal-theo-từng-dự-án) | DOM thực tế |
| REQ-PRJ-40 | Ẩn task của dự án khỏi bảng Tasks chung | Tuỳ chọn giấu task dự án ở khu vực admin | Checkbox `settings[hide_tasks_on_main_tasks_table]` — nhãn `Hide project tasks on main tasks table (admin area)`, mặc định **không tick** | DOM thực tế |

### 2.4. Sửa dự án (Edit) — khác biệt so với form tạo mới

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-41 | Form sửa nạp sẵn dữ liệu hiện tại | Mở form sửa thì mọi trường đã điền theo dữ liệu dự án | `/admin/projects/project/{id}` — tiêu đề `Edit Project`; Customer, Status, Billing Type, Members, Tags, tiến độ đều khớp dữ liệu đang lưu | Kiểm chứng thực tế (ID `2394`) |
| REQ-PRJ-42 | Tuỳ chọn thông báo thành viên khi đổi trạng thái | Chỉ xuất hiện ở form sửa, khi chọn trạng thái khác trạng thái hiện tại | Checkbox `notify_project_members_status_change` — nhãn `Notify project members that status is changed`. Ẩn khi chọn lại đúng trạng thái hiện tại | Kiểm chứng thực tế |
| REQ-PRJ-43 | Tuỳ chọn hoàn tất toàn bộ task khi đổi trạng thái | Chỉ xuất hiện ở form sửa, khi chọn trạng thái khác trạng thái hiện tại | Checkbox `mark_all_tasks_as_completed` — nhãn `Mark all tasks as completed and stop all timers (No notifications sent to project members)` | Kiểm chứng thực tế |
| REQ-PRJ-44 | Email báo dự án hoàn thành | Chỉ xuất hiện khi chọn trạng thái `Finished` | Checkbox `project_marked_as_finished_email_to_contacts` — nhãn `Send Project Marked as Finished email to customer contacts`. Ẩn ở cả 4 trạng thái còn lại | Kiểm chứng thực tế |

### 2.5. Trang chi tiết dự án

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-45 | Hồ sơ dự án dạng nhiều tab | Trang chi tiết gom dữ liệu liên quan theo tab | `/admin/projects/view/{id}` có 18 tab: `Overview`, `Tasks`, `Timesheets`, `Milestones`, `Files`, `Discussions`, `Gantt`, `Tickets`, `Contracts`, `Sales`, `Proposals`, `Estimates`, `Invoices`, `Subscriptions`, `Expenses`, `Credit Notes`, `Notes`, `Activity` | Kiểm chứng thực tế |
| REQ-PRJ-46 | Bảng Overview tổng hợp thông tin dự án | Tab Overview hiển thị đầy đủ thuộc tính dự án | Hiển thị: `Project #`, `Customer`, `Billing Type`, `Total Rate`, `Status`, `Date Created`, `Start Date`, `Deadline`, `Estimated Hours`, `Total Logged Hours`, `Tags`, `Description` | Kiểm chứng thực tế |
| REQ-PRJ-47 | Hiển thị tiến độ dự án | Có chỉ số phần trăm tiến độ ở đầu trang | Hiển thị `Project Progress <n>%` (khảo sát ID 2394: `100%`) | Kiểm chứng thực tế |
| REQ-PRJ-48 | Widget thống kê task mở | Hiển thị tỉ lệ task chưa hoàn thành | Widget `<đã mở> / <tổng> Open Tasks` kèm phần trăm | Kiểm chứng thực tế |
| REQ-PRJ-49 | Widget số ngày còn lại | Hiển thị số ngày còn lại tới deadline | Widget `<còn lại> / <tổng> Days Left` kèm phần trăm | Kiểm chứng thực tế |
| REQ-PRJ-50 | Widget tổng hợp chi phí | Hiển thị 4 chỉ số chi phí của dự án | `Total Expenses`, `Billable Expenses`, `Billed Expenses`, `Unbilled Expenses` | Kiểm chứng thực tế |
| REQ-PRJ-51 | Thông báo khi dự án chưa có mô tả | Hiển thị dòng thay thế thay vì để trống | Dự án không có mô tả → hiện nguyên văn `No description for this project` | Kiểm chứng thực tế |
| REQ-PRJ-52 | Thao tác nhanh từ trang chi tiết | Có các nút hành động chính ở đầu trang | Nút `New Task`, `Invoice Project`, và menu `More` | Kiểm chứng thực tế |
| REQ-PRJ-53 | Menu More gom các thao tác quản trị dự án | Menu `More` chứa đủ hành động vòng đời dự án | 9 mục: `Pin Project`, `Edit Project`, `Copy Project`, `Mark as <trạng thái>` (4 mục), `Export project data`, `Delete Project` | Kiểm chứng thực tế |
| REQ-PRJ-54 | Đổi trạng thái nhanh không cần vào form sửa | Menu More có lối tắt đổi trạng thái | Hiện các mục `Mark as ...` cho **mọi trạng thái trừ trạng thái hiện tại** (dự án `On Hold` → hiện 4 mục: Not Started / In Progress / Cancelled / Finished) | Kiểm chứng thực tế |
| REQ-PRJ-55 | Ghim dự án | Dự án có thể ghim để truy cập nhanh | Mục `Pin Project` gọi `/admin/projects/pin_action/{id}` | DOM thực tế |
| REQ-PRJ-56 | Xuất dữ liệu của một dự án | Xuất toàn bộ dữ liệu dự án ra tệp | Mục `Export project data` gọi `/admin/projects/export_project_data/{id}` | DOM thực tế |
| REQ-PRJ-57 | Xử lý ID dự án không tồn tại | Truy cập dự án không tồn tại thì báo lỗi, không lỗi hệ thống | Truy cập `/admin/projects/view/2651` (đã xoá) → chuyển hướng tới `/admin/not_found` | Kiểm chứng thực tế |

### 2.6. Sao chép dự án (Copy Project)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-58 | Mở hộp thoại sao chép dự án | Có chức năng nhân bản dự án sẵn có | Chọn `Copy Project` (từ menu More hoặc dòng trong danh sách) → mở modal `#copy_project` tiêu đề `Copy Project` | Kiểm chứng thực tế |
| REQ-PRJ-59 | Chọn thành phần được sao chép | Người dùng chọn nhân bản những phần nào | 6 checkbox, **tất cả tick sẵn**: `Tasks`, `Copy checklist items`, `Copy the same assignees`, `Copy the same followers`, `Milestones`, `Members` | Kiểm chứng thực tế |
| REQ-PRJ-60 | Đặt trạng thái cho task được sao chép | Chọn trạng thái áp cho toàn bộ task nhân bản | Nhóm radio `copy_project_task_status` với 5 lựa chọn: `Not Started` (mặc định, value `1`), `In Progress` (`4`), `Testing` (`3`), `Awaiting Feedback` (`2`), `Complete` (`5`) | DOM thực tế |
| REQ-PRJ-61 | Nhập thông tin cho dự án bản sao | Modal yêu cầu nhập lại thông tin định danh dự án mới | 4 trường: `* Project Name` (điền sẵn tên dự án gốc), `* Customer` (bắt buộc chọn lại, **để trống**), `* Start Date` (mặc định ngày hiện tại), `Deadline` (rỗng) | Kiểm chứng thực tế |
| REQ-PRJ-62 | Đóng hộp thoại không thực hiện sao chép | Có nút thoát an toàn | Modal có nút `Close` và nút `Copy Project` | UI thực tế |

### 2.7. Xoá dự án

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-PRJ-63 | Xoá dự án có xác nhận | Thao tác xoá phải được người dùng xác nhận | Click `Delete` → hiện hộp thoại xác nhận với nội dung nguyên văn `Are you sure you want to perform this action?` | DOM thực tế (`appLang["confirm_action_prompt"]`) |
| REQ-PRJ-64 | Xoá dự án thành công | Dự án bị xoá không còn truy cập được | Sau khi xoá ID `2651` → `/admin/projects/view/2651` chuyển hướng tới `/admin/not_found`; dự án biến mất khỏi danh sách | Kiểm chứng thực tế |
| REQ-PRJ-65 | Điểm cuối xoá dùng phương thức GET | Liên kết xoá là URL truy cập trực tiếp được | `<a href="/admin/projects/delete/{id}" class="text-danger _delete">` — truy cập thẳng URL là bản ghi bị xoá, hộp xác nhận chỉ tồn tại phía client. Xem [RISK-03](#8-rủi-ro-kiểm-thử-risks) | Kiểm chứng thực tế |

---

## 3. Đặc Tả Trường Dữ Liệu (Field Specifications)

### 3.1. Form Dự án — tab `Project`

| Field (Label) | Loại UI | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|
| `* Project Name` | text (`#name`) | ✅ | **Không** khai báo `maxlength`; không ràng buộc định dạng. Mặc định rỗng | REQ-PRJ-15, REQ-PRJ-34 | Hệ thống đã tồn tại dự án tên dài 190 ký tự và nhiều tên trùng nhau |
| `* Customer` | select AJAX (`#clientid`) | ✅ | Không nạp sẵn dữ liệu — phải gõ từ khoá. Mặc định rỗng | REQ-PRJ-16, REQ-PRJ-17, REQ-PRJ-18 | Placeholder: `Select and begin typing`. Automation **phải** chọn theo `value` (ID khách hàng) |
| `Calculate progress through tasks` | checkbox (`#progress_from_tasks`) | ❌ | Mặc định **tick** | REQ-PRJ-27, REQ-PRJ-28 | Điều khiển trạng thái bật/tắt của thanh trượt tiến độ |
| `Progress` | slider + hidden (`progress`) | ❌ | Giá trị ẩn mặc định `0`. Bị vô hiệu khi checkbox trên được tick | REQ-PRJ-27, REQ-PRJ-28 | Class khi bị khoá: `ui-slider-disabled` |
| `* Billing Type` | select (`#billing_type`) | ✅ | 3 lựa chọn: `1=Fixed Rate`, `2=Project Hours`, `3=Task Hours`. Mặc định `3` | REQ-PRJ-22, REQ-PRJ-23, REQ-PRJ-25 | Điều khiển hiển thị `Total Rate` / `Rate Per Hour` |
| `Status` | select (`#status`) | ❌ | 5 lựa chọn: `1=Not Started`, `2=In Progress`, `3=On Hold`, `5=Cancelled`, `4=Finished`. Mặc định `2` | REQ-PRJ-26 | ⚠️ Giá trị **không** liên tục — `Cancelled=5` đứng trước `Finished=4` |
| `Total Rate` | number (`#project_cost`) | ❌ | Không `min`/`max`/`step`. Chỉ hiện khi Billing Type = `Fixed Rate` | REQ-PRJ-23 | Khi ẩn, phần tử mang class `hide` |
| `Rate Per Hour` | number (`#project_rate_per_hour`) | ❌ | Không `min`/`max`/`step`. Chỉ hiện khi Billing Type = `Project Hours` | REQ-PRJ-23 | Khi ẩn, phần tử mang class `hide` |
| `Estimated Hours` | number (`#estimated_hours`) | ❌ | Không `min`/`max`/`step`. Luôn hiển thị | REQ-PRJ-24 | Hiển thị trên trang chi tiết theo định dạng `hh:mm` (VD `100:00`) |
| `Members` | multi-select (`project_members[]`) | ❌ | Mặc định chọn sẵn nhân viên đang đăng nhập | REQ-PRJ-29 | Danh sách khảo sát: `Project Manager`, `Admin Anh Tester`, `Admin Example` |
| `* Start Date` | text + datepicker (`#start_date`) | ✅ | Định dạng `dd-mm-yyyy`. Mặc định = ngày hiện tại | REQ-PRJ-19, REQ-PRJ-20 | `class="form-control datepicker"`, `autocomplete="off"` |
| `Deadline` | text + datepicker (`#deadline`) | ❌ | Định dạng `dd-mm-yyyy`. Mặc định rỗng. **Không** ràng buộc phải sau Start Date | REQ-PRJ-21 | Xem [AMB-02](#7-điểm-mơ-hồ-ambiguities) |
| `Tags` | tagsinput (`#tags`) | ❌ | Không giới hạn số thẻ. Mặc định rỗng | REQ-PRJ-30 | Placeholder ô nhập: `Tag` |
| `Description` | TinyMCE (`#description`) | ❌ | Không giới hạn độ dài khai báo. Mặc định rỗng | REQ-PRJ-31 | Rich text — automation cần thao tác qua iframe của TinyMCE |
| `Send project created email` | checkbox (`#send_created_email`) | ❌ | Mặc định **không tick** | REQ-PRJ-32 | Chỉ có ở form tạo mới |

### 3.2. Form Dự án — tab `Project Settings`

| Field (Label) | Loại UI | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|
| `* Send contacts notifications` | select (`#contact_notification`) | ✅ | 3 lựa chọn: `1=To all contacts with notifications for projects enabled` (mặc định), `2=Specific contacts`, `0=Do not send notifications` | REQ-PRJ-36 | |
| `* Select contacts to notify` | multi-select (`#notify_contacts`) | ✅ (có điều kiện) | Chỉ hiện khi `contact_notification = 2`. Danh sách nạp theo khách hàng đã chọn | REQ-PRJ-37 | Placeholder: `Select and begin typing`, gợi ý `Start typing to search` |
| `Visible Tabs` | multi-select (`#available_features`) | ❌ | 17 lựa chọn. Mặc định chỉ chọn `Overview` (`project_overview`) | REQ-PRJ-38 | Quyết định tab khách hàng thấy trên Client Portal |
| 17 checkbox quyền khách hàng | checkbox (`settings[...]`) | ❌ | Xem [mục 5.2](#52-phân-quyền-của-khách-hàng-trên-client-portal-theo-từng-dự-án) để biết giá trị mặc định từng mục | REQ-PRJ-39 | |
| `Hide project tasks on main tasks table (admin area)` | checkbox (`settings[hide_tasks_on_main_tasks_table]`) | ❌ | Mặc định **không tick** | REQ-PRJ-40 | Ảnh hưởng khu vực admin, không phải Client Portal |

### 3.3. Trường chỉ có ở form Sửa (Edit)

| Field (Label) | Loại UI | Required | Điều kiện hiển thị | REQ liên quan |
|---|---|---|---|---|
| `Notify project members that status is changed` | checkbox (`notify_project_members_status_change`) | ❌ | Chỉ hiện khi chọn trạng thái **khác** trạng thái đang lưu. Mặc định không tick | REQ-PRJ-42 |
| `Mark all tasks as completed and stop all timers (No notifications sent to project members)` | checkbox (`mark_all_tasks_as_completed`) | ❌ | Chỉ hiện khi chọn trạng thái **khác** trạng thái đang lưu. Mặc định không tick | REQ-PRJ-43 |
| `Send Project Marked as Finished email to customer contacts` | checkbox (`project_marked_as_finished_email_to_contacts`) | ❌ | Chỉ hiện khi chọn trạng thái `Finished`. Mặc định không tick | REQ-PRJ-44 |

### 3.4. Modal Sao chép dự án (`#copy_project`)

| Field (Label) | Loại UI | Required | Ràng buộc / Mặc định | REQ liên quan |
|---|---|---|---|---|
| `Tasks` | checkbox (`tasks`) | ❌ | Mặc định **tick** | REQ-PRJ-59 |
| `Copy checklist items` | checkbox (`tasks_include_checklist_items`) | ❌ | Mặc định **tick** | REQ-PRJ-59 |
| `Copy the same assignees` | checkbox (`task_include_assignees`) | ❌ | Mặc định **tick** | REQ-PRJ-59 |
| `Copy the same followers` | checkbox (`task_include_followers`) | ❌ | Mặc định **tick** | REQ-PRJ-59 |
| `Milestones` | checkbox (`milestones`) | ❌ | Mặc định **tick** | REQ-PRJ-59 |
| `Members` | checkbox (`members`) | ❌ | Mặc định **tick** | REQ-PRJ-59 |
| `Tasks Status` | radio (`copy_project_task_status`) | ❌ | 5 lựa chọn: `1=Not Started` (mặc định), `4=In Progress`, `3=Testing`, `2=Awaiting Feedback`, `5=Complete` | REQ-PRJ-60 |
| `* Project Name` | text (`name`) | ✅ | Điền sẵn tên dự án gốc | REQ-PRJ-61 |
| `* Customer` | select AJAX (`clientid_copy_project`) | ✅ | **Rỗng** — phải chọn lại | REQ-PRJ-61 |
| `* Start Date` | text + datepicker (`start_date`) | ✅ | Mặc định ngày hiện tại, `dd-mm-yyyy` | REQ-PRJ-61 |
| `Deadline` | text + datepicker (`deadline`) | ❌ | Mặc định rỗng | REQ-PRJ-61 |

> ⚠️ **Lưu ý automation:** giá trị radio `Tasks Status` trong modal Copy Project (`Testing=3`, `Awaiting Feedback=2`) **khác hoàn toàn** giá trị status của dự án ở mục 3.1. Đây là 2 tập trạng thái độc lập (trạng thái Task vs trạng thái Project) — tuyệt đối không dùng lẫn hằng số.

---

## 4. Business Rules & Validation Messages

| REQ ID | Rule / Trigger | Thông báo lỗi mong đợi (nguyên văn) |
|---|---|---|
| REQ-PRJ-15 | Submit form với `Project Name` rỗng | `This field is required.` (trong `#name-error`) |
| REQ-PRJ-19 | Submit form với `Start Date` rỗng | `This field is required.` (trong `#start_date-error`) |
| REQ-PRJ-16 | Submit form với `Customer` chưa chọn | **Không có thông báo lỗi rõ ràng.** `.form-group` nhận class `has-error` (viền đỏ); phần tử `#clientid-error` chỉ chứa đúng dòng gợi ý sẵn có `Select and begin typing` — xem [AMB-01](#7-điểm-mơ-hồ-ambiguities) |
| REQ-PRJ-18 | Gõ từ khoá không khớp khách hàng nào | `No results found` |
| REQ-PRJ-51 | Mở dự án chưa nhập mô tả | `No description for this project` |
| REQ-PRJ-63 | Click `Delete` trên dự án | `Are you sure you want to perform this action?` |
| REQ-PRJ-57 | Truy cập dự án không tồn tại | Chuyển hướng tới `/admin/not_found` |
| REQ-PRJ-23 | Đổi `Billing Type` sang `Fixed Rate` | Hiện `Total Rate`, ẩn `Rate Per Hour` (không có thông báo) |
| REQ-PRJ-23 | Đổi `Billing Type` sang `Project Hours` | Hiện `Rate Per Hour`, ẩn `Total Rate` (không có thông báo) |
| REQ-PRJ-23 | Đổi `Billing Type` sang `Task Hours` | Ẩn cả `Total Rate` và `Rate Per Hour`; hiện mô tả `Based on task hourly rate` |
| REQ-PRJ-37 | Đổi `Send contacts notifications` sang `Specific contacts` | Hiện trường `Select contacts to notify` (không có thông báo) |
| REQ-PRJ-44 | Ở form Sửa, chọn `Status = Finished` | Hiện checkbox `Send Project Marked as Finished email to customer contacts` |
| REQ-PRJ-42, REQ-PRJ-43 | Ở form Sửa, chọn trạng thái khác trạng thái hiện tại | Hiện 2 checkbox `Notify project members that status is changed` và `Mark all tasks as completed and stop all timers (No notifications sent to project members)` |
| REQ-PRJ-34 | Tạo dự án trùng tên dự án đã có | **Không có cảnh báo** — tạo thành công với ID mới |

---

## 5. Ma Trận Phân Quyền

### 5.1. Phân quyền theo role nhân viên (Staff)

**Chưa kiểm chứng được.** Chỉ được cung cấp **một tài khoản Administrator** (`admin@example.com`). Ngoài ra, trang cấu hình role trên môi trường demo **bị chặn**: truy cập `/admin/roles/role/1` bị chuyển hướng tới `/admin/access_denied` với nội dung `Something went wrong. Try again` — nên cũng không đọc được định nghĩa quyền từ hệ thống. Xem [AMB-06](#7-điểm-mơ-hồ-ambiguities).

Ma trận quan sát được với role Administrator:

| Hành động | Administrator |
|---|---|
| Xem danh sách dự án | ✅ |
| Tạo dự án mới | ✅ |
| Sửa dự án | ✅ |
| Xoá dự án | ✅ |
| Sao chép dự án | ✅ |
| Đổi trạng thái nhanh (Mark as…) | ✅ |
| Ghim dự án | ✅ |
| Xuất dữ liệu danh sách (Excel/CSV/PDF/Print) | ✅ |
| Xuất dữ liệu một dự án | ✅ |
| Xem Gantt toàn hệ thống | ✅ |
| Cấu hình quyền khách hàng theo dự án | ✅ |
| Xem/sửa cấu hình Roles | ❌ (bị chặn trên môi trường demo) |

### 5.2. Phân quyền của khách hàng trên Client Portal (theo từng dự án)

Đây là ma trận **đã kiểm chứng được** — cấu hình ngay trong tab *Project Settings* của mỗi dự án. Mỗi dự án có bộ giá trị riêng, độc lập với dự án khác.

| # | Quyền (nhãn nguyên văn) | Tên trường | Mặc định |
|---|---|---|---|
| 1 | Allow customer to view tasks | `settings[view_tasks]` | ❌ Không tick |
| 2 | Allow customer to create tasks | `settings[create_tasks]` | ❌ Không tick |
| 3 | Allow customer to edit tasks (only tasks created from contact) | `settings[edit_tasks]` | ❌ Không tick |
| 4 | Allow customer to comment on project tasks | `settings[comment_on_tasks]` | ❌ Không tick |
| 5 | Allow customer to view task comments | `settings[view_task_comments]` | ❌ Không tick |
| 6 | Allow customer to view task attachments | `settings[view_task_attachments]` | ❌ Không tick |
| 7 | Allow customer to view task checklist items | `settings[view_task_checklist_items]` | ❌ Không tick |
| 8 | Allow customer to upload attachments on tasks | `settings[upload_on_tasks]` | ❌ Không tick |
| 9 | Allow customer to view task total logged time | `settings[view_task_total_logged_time]` | ❌ Không tick |
| 10 | Allow customer to view finance overview | `settings[view_finance_overview]` | ✅ Tick sẵn |
| 11 | Allow customer to upload files | `settings[upload_files]` | ✅ Tick sẵn |
| 12 | Allow customer to open discussions | `settings[open_discussions]` | ✅ Tick sẵn |
| 13 | Allow customer to view milestones | `settings[view_milestones]` | ✅ Tick sẵn |
| 14 | Allow customer to view Gantt | `settings[view_gantt]` | ✅ Tick sẵn |
| 15 | Allow customer to view timesheets | `settings[view_timesheets]` | ✅ Tick sẵn |
| 16 | Allow customer to view activity log | `settings[view_activity_log]` | ✅ Tick sẵn |
| 17 | Allow customer to view team members | `settings[view_team_members]` | ✅ Tick sẵn |

> **Quan sát đáng chú ý:** toàn bộ 9 quyền liên quan tới **Tasks** đều mặc định TẮT, trong khi 8 quyền còn lại đều mặc định BẬT. Mâu thuẫn tiềm tàng: quyền `view_finance_overview`, `view_milestones`, `view_gantt`, `view_timesheets` bật sẵn nhưng `Visible Tabs` lại **chỉ chọn `Overview`** — nghĩa là khách hàng có quyền nhưng không có tab để vào. Xem [AMB-04](#7-điểm-mơ-hồ-ambiguities).

---

## 6. Ma Trận Trạng Thái

Dự án có 5 trạng thái. Qua kiểm chứng menu `More` trên trang chi tiết (dự án đang ở `On Hold` hiện đủ 4 mục `Mark as ...` của 4 trạng thái còn lại), hệ thống **cho phép chuyển tự do giữa mọi trạng thái**, không có ràng buộc luồng.

| Trạng thái hiện tại | Giá trị | Hành động cho phép | Trạng thái kế tiếp | Ai được thực hiện |
|---|---|---|---|---|
| Not Started | `1` | Mark as In Progress / On Hold / Cancelled / Finished · Edit · Copy · Delete | Bất kỳ trạng thái nào trong 4 trạng thái còn lại | Administrator (role khác: chưa kiểm chứng — AMB-06) |
| In Progress | `2` | Mark as Not Started / On Hold / Cancelled / Finished · Edit · Copy · Delete | Bất kỳ trạng thái nào trong 4 trạng thái còn lại | Administrator |
| On Hold | `3` | Mark as Not Started / In Progress / Cancelled / Finished · Edit · Copy · Delete | Bất kỳ trạng thái nào trong 4 trạng thái còn lại | Administrator |
| Cancelled | `5` | Mark as Not Started / In Progress / On Hold / Finished · Edit · Copy · Delete | Bất kỳ trạng thái nào trong 4 trạng thái còn lại | Administrator |
| Finished | `4` | Mark as Not Started / In Progress / On Hold / Cancelled · Edit · Copy · Delete | Bất kỳ trạng thái nào trong 4 trạng thái còn lại | Administrator |

**Hiệu ứng phụ khi đổi trạng thái (qua form Sửa):**

| Chuyển sang | Tuỳ chọn kèm theo |
|---|---|
| Trạng thái bất kỳ khác trạng thái hiện tại | `Notify project members that status is changed` · `Mark all tasks as completed and stop all timers (No notifications sent to project members)` |
| `Finished` | Thêm `Send Project Marked as Finished email to customer contacts` |

> **Chưa kiểm chứng:** đổi trạng thái qua lối tắt `Mark as ...` ở menu `More` có phát sinh các tác dụng phụ trên hay không (không có UI để chọn) — xem [AMB-05](#7-điểm-mơ-hồ-ambiguities).

---

## 7. Điểm Mơ Hồ (Ambiguities)

| Mã | Câu hỏi cần làm rõ với PO/BA | Nguy cơ nếu không giải quyết | Mức độ | Assumption tạm (dùng để viết test) |
|---|---|---|---|---|
| AMB-01 | Trường **Customer** khi bỏ trống chỉ hiện viền đỏ (`has-error`) mà **không có thông báo lỗi**, trong khi Project Name và Start Date đều hiện `This field is required.`. Đây là lỗi hay chấp nhận được? | Người dùng không biết mình sai ở đâu. Test case "bắt buộc chọn khách hàng" không có chuỗi để assert → dễ viết assert sai hoặc bỏ qua | 🔴 High | Coi là **khiếm khuyết UX**, cần báo dev. Test tạm assert theo class `has-error` trên `.form-group` của Customer, **không** assert theo text |
| AMB-02 | Hệ thống **không chặn** Deadline sớm hơn Start Date. Bằng chứng: dự án ID `2471` / `2479` tên `Test Date Validation` có Start `15-05-2026`, Deadline `14-05-2026`; dự án ID `2394` có Deadline `14-06-2024` < Start `14-05-2026`. Đây có phải chủ đích không? | Không có tiêu chí PASS/FAIL cho nhóm test ngày tháng. Kéo theo lỗi hiển thị: widget trang chi tiết hiện `0 / -699 Days Left` (số ngày âm) | 🔴 High | Tạm coi **không có validation ngày** là hành vi hiện tại (ghi nhận đúng thực tế), đồng thời **báo dev** về widget hiện số âm |
| AMB-03 | Độ dài tối đa của `Project Name` là bao nhiêu? Trường không khai báo `maxlength`; hệ thống đang tồn tại dự án tên dài **190 ký tự** | Không thiết kế được test giá trị biên; chuỗi rất dài có thể gây lỗi 500, cắt dữ liệu âm thầm, hoặc vỡ layout bảng danh sách | 🟡 Medium | Không thử chuỗi cực dài để tránh tạo dữ liệu rác trên môi trường dùng chung. Tạm giả định giới hạn theo schema CSDL và **loại khỏi test tự động** cho tới khi có xác nhận |
| AMB-04 | `Visible Tabs` mặc định **chỉ chọn `Overview`**, nhưng 8 quyền khách hàng (xem Gantt, Milestones, Timesheets, Finance overview…) lại **bật sẵn**. Quyền có ý nghĩa gì khi tab tương ứng bị ẩn? Cái nào ưu tiên hơn? | Không xác định được kết quả mong đợi cho toàn bộ nhóm test phân quyền Client Portal — vùng logic nặng nhất của module | 🔴 High | Tạm giả định **`Visible Tabs` ưu tiên cao hơn** (tab bị ẩn thì quyền không có tác dụng). **Bắt buộc PO xác nhận** trước khi viết test phân quyền |
| AMB-05 | Lối tắt `Mark as <trạng thái>` ở menu `More` có gửi thông báo cho thành viên / hoàn tất toàn bộ task / gửi email hoàn thành như khi đổi qua form Sửa không? | Hai đường đổi trạng thái có thể cho kết quả nghiệp vụ khác nhau — nếu chỉ test một đường sẽ bỏ sót lỗi gửi email/thông báo | 🟡 Medium | Tạm giả định lối tắt **không** kích hoạt các tác dụng phụ (vì không có UI để chọn). Cần dev xác nhận |
| AMB-06 | Nhân viên (Staff) với role không phải Administrator thấy và làm được gì trong module Projects? Trang cấu hình role bị chặn trên môi trường demo (`/admin/access_denied`) | Ma trận phân quyền tại mục 5.1 bị bỏ trống → không có test phân quyền, rủi ro rò rỉ dữ liệu dự án của khách hàng khác | 🔴 High | Chưa có tài khoản để kiểm chứng. **Đề nghị PO cấp ít nhất 1 tài khoản Staff quyền hạn chế** và mở quyền xem trang Roles |
| AMB-07 | Xoá dự án đang có dữ liệu ràng buộc (tasks, milestones, invoices, timesheets, expenses) thì hệ thống xử lý ra sao — chặn lại, xoá theo dây chuyền, hay để mồ côi? | Nhánh test quan trọng nhất của chức năng xoá bị bỏ sót; rủi ro mất dữ liệu tài chính (invoice/expense gắn với dự án) | 🔴 High | Chỉ kiểm chứng được với dự án **rỗng** (dự án `2651` do test tạo, không có dữ liệu con). Không thử trên dự án có invoice để tránh phá dữ liệu demo. Tạm giả định hệ thống **chặn** và cần xác nhận |
| AMB-08 | Các trường số (`Total Rate`, `Rate Per Hour`, `Estimated Hours`) không khai báo `min`, `max`, `step`. Có chấp nhận số âm, số thập phân, số cực lớn không? | Không có tiêu chí PASS/FAIL cho nhóm test biên số học; giá trị âm có thể làm sai lệch báo cáo tài chính | 🟡 Medium | Tạm giả định **không có ràng buộc phía client**; test ghi nhận hành vi thực tế và gắn nhãn `known-issue` nếu chấp nhận số âm |
| AMB-09 | Không bắt được **thông báo thành công** sau khi lưu dự án (toast biến mất trước khi chụp). Nội dung nguyên văn là gì? | Test case "tạo dự án thành công" thiếu một điểm assert; nếu đoán sai chuỗi sẽ fail giả | 🟢 Low | Assert theo **hành vi đã kiểm chứng**: chuyển hướng tới `/admin/projects/view/{id}` và tiêu đề trang bằng tên dự án (REQ-PRJ-33). Bổ sung assert toast sau khi PO/dev cung cấp chuỗi |
| AMB-10 | Sao chép dự án (`Copy Project`) có sao chép luôn cấu hình `Project Settings` (17 quyền khách hàng + Visible Tabs) không? Modal không có tuỳ chọn cho phần này | Bản sao có thể vô tình mở/đóng quyền sai cho khách hàng — rủi ro lộ dữ liệu | 🟡 Medium | Chưa kiểm chứng (không thực thi Copy để tránh tạo dữ liệu rác). Tạm giả định **có sao chép nguyên trạng**; cần dev xác nhận |
| AMB-11 | Trường `Status` có giá trị **không liên tục**: `Cancelled=5` xếp trước `Finished=4` trong dropdown. Đây là chủ đích hay di sản lịch sử? | Automation chọn theo index/value dễ nhầm; test data-driven mapping tên↔giá trị sẽ sai | 🟢 Low | Ghi nhận đúng bảng ánh xạ tại mục 3.1. Automation **phải** chọn theo nhãn hiển thị hoặc dùng hằng số đã ghi trong tài liệu này |
| AMB-12 | Dự án cho phép **trùng tên hoàn toàn** (danh sách có `Mua hàng qua app` lặp 11 lần). Đây có phải chủ đích nghiệp vụ không? | Nếu thực tế cần chặn trùng, hàng loạt test "tạo dự án" đang PASS sai; người dùng khó phân biệt bản ghi | 🟡 Medium | Tạm coi trùng tên là **hành vi đúng** (REQ-PRJ-34) và ghi rõ trong test case |

---

## 8. Rủi Ro Kiểm Thử (Risks)

| Mã | Tên rủi ro | Mô tả | Mitigation (cách giảm thiểu khi test) |
|---|---|---|---|
| RISK-01 | Test tạo dữ liệu rác trên môi trường dùng chung | `crm.anhtester.com` là môi trường demo nhiều người dùng chung. Bằng chứng đã có sẵn rất nhiều rác từ các lần chạy trước: `AUTO_POM_ADD_PROJECT_1785661789456`, `Project Automation 95489729`, `auto_project_20260525171101817Z`, `TC016_SendNotif_test`… | Dùng dữ liệu **traceable** (`Auto_Project_<timestamp>`); **bắt buộc** dọn dẹp ở `afterEach`/`afterAll`; không bao giờ tạo dữ liệu mà không có bước xoá tương ứng |
| RISK-02 | Xoá nhầm dự án của người khác | Danh sách 94 dự án là dữ liệu dùng chung; chọn sai dòng có thể xoá dự án thật kèm toàn bộ task/invoice bên dưới | Chỉ xoá đúng ID do chính test tạo ra; **không** thao tác xoá theo vị trí dòng (`nth`), luôn tìm kiếm theo tên traceable trước |
| RISK-03 | Xoá bằng phương thức GET, không có xác nhận phía server | URL `/admin/projects/delete/{id}` xoá bản ghi ngay khi được **truy cập** — hộp xác nhận chỉ tồn tại phía client. Đã kiểm chứng: gọi thẳng URL là dự án `2651` biến mất | Đưa vào phạm vi security testing (nguy cơ CSRF / link prefetch). Với automation chức năng: luôn thao tác qua UI để cũng kiểm chứng được hộp thoại xác nhận |
| RISK-04 | Dropdown Customer nạp dữ liệu bất đồng bộ | `<select id="clientid">` **rỗng** cho tới khi gõ từ khoá và AJAX trả về. Assert hoặc chọn quá sớm sẽ fail ngẫu nhiên | Dùng web-first assertion chờ option xuất hiện rồi mới chọn; chọn theo `value` (ID khách hàng), tuyệt đối không theo nhãn |
| RISK-05 | Danh sách lớn, DataTables xử lý phía server | 94 dự án chia 4 trang, tải theo trang qua AJAX; nhiều dự án **trùng tên hoàn toàn** | Không assert theo chỉ số dòng cố định; luôn **tìm kiếm theo dữ liệu traceable** rồi mới thao tác; chờ AJAX hoàn tất bằng web-first assertion, không dùng sleep cứng |
| RISK-06 | Trường ẩn/hiện động gây flaky | 6 trường thay đổi hiển thị theo `Billing Type`, `Status`, `Send contacts notifications`. Trường bị ẩn mang class `hide` nhưng **vẫn tồn tại trong DOM** | Assert bằng `toBeVisible()` / `toBeHidden()`, **không** dùng `toBeAttached()` hay `count()`; luôn đổi trường điều khiển trước rồi mới chờ trường phụ thuộc |
| RISK-07 | Hai tập hằng số trạng thái dễ nhầm lẫn | Trạng thái **Project** (`Cancelled=5`, `Finished=4`) và trạng thái **Task** trong modal Copy (`Testing=3`, `Awaiting Feedback=2`) khác nhau hoàn toàn | Khai báo 2 enum riêng biệt trong code automation (`ProjectStatus`, `CopyTaskStatus`); không dùng số trần trong test |
| RISK-08 | Trường Description là TinyMCE trong iframe | Không thao tác được bằng `fill()` thông thường lên `#description` | Dùng `frameLocator` của TinyMCE hoặc API `tinymce.get('description').setContent()`; ghi rõ trong Page Object |
| RISK-09 | Cấu hình quyền khách hàng nằm ở tab thứ hai | 17 checkbox + Visible Tabs thuộc `#tab_settings` — khi tab chưa active, mọi phần tử bên trong đều `offsetParent === null` (bị coi là ẩn). Khảo sát ban đầu đã suýt ghi nhận sai vì lý do này | Luôn click sang tab `Project Settings` trước khi thao tác/assert các trường trong đó |
| RISK-10 | Môi trường demo phản hồi chậm, thi thoảng timeout | Trong quá trình khảo sát đã có 2 lần điều hướng bị timeout (`/admin/projects/view/2394`, `/admin/roles`) | Đặt timeout điều hướng rộng rãi; thêm retry ở mức test cho bước navigate; không coi 1 lần fail là lỗi ứng dụng |
| RISK-11 | Dữ liệu ràng buộc chằng chịt | Dự án tham chiếu tới Customer, và bên dưới có Tasks, Milestones, Invoices, Expenses, Timesheets… Xoá dự án có thể gây hệ quả dây chuyền chưa lường hết (AMB-07) | Test xoá **chỉ thực hiện trên dự án do chính test tạo, chưa phát sinh dữ liệu con** |
| RISK-12 | Trang cấu hình Role bị chặn | `/admin/roles/role/1` → `/admin/access_denied`, nội dung `Something went wrong. Try again` | Không đưa test phân quyền theo role vào phạm vi hiện tại; ghi nhận là **blocked** kèm lý do, chờ PO cấp quyền/tài khoản |

---

## 9. Luồng Xử Lý (User Flows)

### 9.1. Luồng chính — Tạo dự án mới (Happy Path)

```
1. Đăng nhập, vào menu Projects (/admin/projects)
2. Click "+ New Project" → mở /admin/projects/project
3. Tab "Project": nhập Project Name (bắt buộc)
4. Click dropdown Customer → gõ từ khoá → chờ AJAX → chọn khách hàng (bắt buộc)
5. (Tuỳ chọn) Chọn Billing Type → nhập Total Rate / Rate Per Hour tương ứng
6. (Tuỳ chọn) Chọn Status, Members, Estimated Hours, Deadline, Tags, Description
7. (Tuỳ chọn) Bỏ tick "Calculate progress through tasks" → kéo thanh tiến độ thủ công
8. (Tuỳ chọn) Chuyển tab "Project Settings": chọn cách thông báo liên hệ,
   Visible Tabs, và các quyền khách hàng
9. Click "Save"
   → Hệ thống chuyển hướng tới /admin/projects/view/{id}
   → Tiêu đề trang bằng tên dự án vừa tạo
```

### 9.2. Luồng phụ — Thiếu trường bắt buộc

```
1. Mở /admin/projects/project
2. Không nhập gì (hoặc xoá trắng Start Date) → click "Save"
   → Form KHÔNG submit, URL không đổi
   → Dưới "Project Name": hiện "This field is required."
   → Dưới "Start Date":   hiện "This field is required."
   → Ô "Customer": .form-group nhận class has-error (viền đỏ), KHÔNG có thông báo (AMB-01)
3. Điền đủ 3 trường bắt buộc → "Save" → lưu thành công
```

### 9.3. Luồng chính — Đổi trạng thái dự án qua form Sửa

```
1. Vào /admin/projects/view/{id} → menu "More" → "Edit Project"
2. Đổi dropdown "Status" sang trạng thái khác trạng thái hiện tại
   → Xuất hiện: "Notify project members that status is changed"
   → Xuất hiện: "Mark all tasks as completed and stop all timers..."
   → Nếu chọn "Finished": xuất hiện thêm
     "Send Project Marked as Finished email to customer contacts"
3. Tick/bỏ tick các tuỳ chọn theo nhu cầu → "Save"
4. Về trang chi tiết → mục "Status" trong bảng Overview hiển thị trạng thái mới
```

### 9.4. Luồng phụ — Đổi trạng thái nhanh

```
1. Vào /admin/projects/view/{id} → menu "More"
2. Menu hiển thị các mục "Mark as <trạng thái>" cho MỌI trạng thái
   TRỪ trạng thái hiện tại (4 mục)
3. Chọn 1 mục → trạng thái được cập nhật ngay, không qua form
   ⚠️ Chưa rõ có phát sinh email/thông báo hay không (AMB-05)
```

### 9.5. Luồng chính — Sao chép dự án

```
1. Từ danh sách (hover dòng → "Copy Project") hoặc trang chi tiết (More → "Copy Project")
2. Modal #copy_project mở ra:
   - 6 checkbox thành phần đều tick sẵn (Tasks, checklist, assignees, followers,
     Milestones, Members)
   - Radio "Tasks Status" mặc định "Not Started"
   - Project Name điền sẵn tên dự án gốc
   - Customer để TRỐNG → bắt buộc chọn lại
   - Start Date mặc định ngày hiện tại
3. Điều chỉnh các tuỳ chọn → chọn Customer → click "Copy Project"
   → Tạo dự án mới với ID mới
   ⚠️ Chưa rõ Project Settings có được sao chép không (AMB-10)
```

### 9.6. Luồng chính — Xoá dự án

```
1. Từ danh sách: hover dòng → click "Delete"
   (hoặc trang chi tiết: More → "Delete Project")
2. Hộp thoại xác nhận: "Are you sure you want to perform this action?"
3. Xác nhận → dự án bị xoá
   → Truy cập lại /admin/projects/view/{id} → chuyển hướng /admin/not_found
   → Dự án biến mất khỏi danh sách, chỉ số Projects Summary giảm tương ứng
```

---

## 10. Yêu Cầu Phi Chức Năng (Non-functional Requirements)

| Hạng mục | Ghi nhận thực tế |
|---|---|
| Độ phân giải khảo sát | 1920×1080 (desktop) — bố cục 2 cột hiển thị đầy đủ, không tràn ngang |
| Hiệu năng danh sách | DataTables **server-side processing** — 94 bản ghi tải theo trang, không tải hết một lần |
| Hiệu năng dropdown Customer | Tìm kiếm **AJAX theo từ khoá** thay vì nạp sẵn toàn bộ ~1.400 khách hàng — tránh làm nặng trang |
| Độ ổn định môi trường | Môi trường demo dùng chung, thi thoảng phản hồi chậm gây timeout điều hướng (RISK-10) |
| Bảo mật — CSRF | Form có `csrf_token_name`; **nhưng** điểm cuối xoá dùng GET không kiểm tra token (RISK-03) |
| Bảo mật — phân quyền | Trang cấu hình Role bị chặn với tài khoản khảo sát (`/admin/access_denied`) |
| Đa ngôn ngữ | Hệ thống hỗ trợ 27 ngôn ngữ (menu tài khoản); giao diện module Projects khảo sát ở **tiếng Anh** |
| Xử lý lỗi | ID không tồn tại → chuyển hướng `/admin/not_found`; truy cập trái phép → `/admin/access_denied` với nội dung `Something went wrong. Try again` |
| Khiếm khuyết hiển thị | Widget `Days Left` hiện **số âm** khi deadline đã qua/sớm hơn Start Date (VD `0 / -699 Days Left`) — xem AMB-02 |

---

## 11. Phân Rã Epic / Story (Backlog View)

Mục này chiếu toàn bộ 65 yêu cầu sang cấu trúc backlog kiểu Jira, phục vụ việc **chia việc, ước lượng và theo dõi tiến độ** — trong khi các mục 1→10 vẫn là **đặc tả hiện trạng** đầy đủ của module.

> **Nguyên tắc:** mã `REQ-PRJ-xx` là lớp truy vết duy nhất và **không đổi**. Mã `STORY-PRJ-xx` chỉ là nhóm công việc — có thể đổi/gộp/tách theo cách team vận hành mà không ảnh hưởng tới REQ ID hay test case đã viết.

**Epic: Quản lý Dự án (Projects Module)** — `/admin/projects`

| Story ID | Tên Story | REQ bao phủ | Số REQ | AMB / RISK liên quan | Ghi chú phạm vi |
|---|---|---|---|---|---|
| STORY-PRJ-01 | Danh sách, tìm kiếm & lọc dự án | REQ-PRJ-01 → REQ-PRJ-13 | 13 | RISK-05 | Bao gồm Projects Summary, sắp xếp, phân trang, bộ lọc nâng cao, Export, lối vào Gantt |
| STORY-PRJ-02 | Tạo dự án mới | REQ-PRJ-14 → REQ-PRJ-35 | 22 | AMB-01, AMB-02, AMB-03, AMB-08, AMB-09, AMB-11, AMB-12 · RISK-04, RISK-06, RISK-08 | Story nặng nhất — chứa toàn bộ validation và logic ẩn/hiện trường theo Billing Type |
| STORY-PRJ-03 | Cấu hình quyền khách hàng theo dự án | REQ-PRJ-36 → REQ-PRJ-40 | 5 | **AMB-04** 🔴 · RISK-09 | ⚠️ **Blocked** — không viết test cho tới khi AMB-04 được PO trả lời |
| STORY-PRJ-04 | Sửa dự án & đổi trạng thái | REQ-PRJ-41 → REQ-PRJ-44, REQ-PRJ-54 | 5 | AMB-05 · RISK-07 | Gồm cả lối tắt `Mark as ...` ở menu More (REQ-PRJ-54) vì cùng một hành vi nghiệp vụ |
| STORY-PRJ-05 | Xem chi tiết dự án | REQ-PRJ-45 → REQ-PRJ-53, REQ-PRJ-55 → REQ-PRJ-57 | 12 | AMB-02 (widget `Days Left` âm) · RISK-10 | Không bao gồm nghiệp vụ bên trong 17 tab con — mỗi tab thuộc module riêng |
| STORY-PRJ-06 | Sao chép dự án (Copy Project) | REQ-PRJ-58 → REQ-PRJ-62 | 5 | AMB-10 · RISK-01, RISK-07 | Chưa thực thi thử trên môi trường dùng chung |
| STORY-PRJ-07 | Xoá dự án | REQ-PRJ-63 → REQ-PRJ-65 | 3 | AMB-07 🔴 · RISK-02, RISK-03, RISK-11 | ⚠️ Chỉ test trên dự án do chính test tạo, chưa có dữ liệu con |

**Tổng: 7 Story / 65 REQ** — mọi REQ đều thuộc đúng một Story, không có REQ mồ côi và không có REQ nằm ở hai Story.

### 11.1. Hạng mục cấp Epic (cắt ngang, không thuộc Story nào)

Những hạng mục dưới đây **cố ý không gán vào Story** vì chúng chỉ có nghĩa khi đọc ở phạm vi cả module. Nếu đưa vào Jira, nên để ở mô tả Epic hoặc tạo ticket kỹ thuật riêng:

| Hạng mục | Mục trong tài liệu | Lý do để ở cấp Epic |
|---|---|---|
| Ma trận phân quyền role Staff | Mục 5.1 | Cắt ngang cả 7 Story; hiện **blocked** bởi AMB-06 + RISK-12 |
| Ma trận phân quyền khách hàng (17 quyền) | Mục 5.2 | Cấu hình ở STORY-PRJ-03 nhưng **tác động** tới Client Portal của mọi Story |
| Ma trận trạng thái dự án | Mục 6 | Trải qua STORY-PRJ-02 (đặt trạng thái), 04 (đổi trạng thái), 05 (hiển thị) |
| Bảng ánh xạ hằng số trạng thái | Mục 3.1 + 3.4 | RISK-07 chỉ lộ ra khi đặt hai bảng cạnh nhau |
| Yêu cầu phi chức năng | Mục 10 | Áp cho toàn module |

### 11.2. Thứ tự triển khai đề xuất

Xếp theo rủi ro và mức phụ thuộc, **không** theo thứ tự đánh số:

```
1. STORY-PRJ-02  Tạo dự án        → nền tảng, mọi Story khác cần dữ liệu từ đây
2. STORY-PRJ-01  Danh sách        → cần thiết để tìm/xác minh dữ liệu vừa tạo
3. STORY-PRJ-05  Xem chi tiết     → xác minh dữ liệu đã lưu đúng
4. STORY-PRJ-04  Sửa & đổi status → phụ thuộc 02 + 05
5. STORY-PRJ-07  Xoá              → cần cho bước cleanup của mọi test khác
6. STORY-PRJ-06  Sao chép         → phụ thuộc 02
7. STORY-PRJ-03  Quyền khách hàng → BLOCKED, làm cuối sau khi AMB-04 được trả lời
```

> **Lưu ý:** STORY-PRJ-07 (Xoá) tuy xếp thứ 5 nhưng cần **implement hàm xoá dùng cho teardown ngay từ STORY-PRJ-02** — nếu không, mọi test tạo dự án đều để lại rác trên môi trường dùng chung (RISK-01).

---

## 12. Bước Tiếp Theo

Tài liệu này (với đầy đủ mã `REQ-PRJ-xx`) là **input chuẩn** cho các workflow sau:

| Workflow | Mục đích |
|---|---|
| `/generate_testcases_manual_rbt` | Sinh manual test cases theo quy trình AI-RBT 6 bước (khuyến nghị — module có nhiều rủi ro 🔴 High) |
| `/generate_testcases_from_requirements` | Sinh nhanh manual test cases (QUICK mode) |
| `/generate_traceability_matrix` | Sinh ma trận truy vết REQ ↔ Test Case ↔ Automation Script |
| `/generate_automation_from_testcases` | Chuyển manual test cases sang automation scripts |

> ⚠️ **Trước khi viết bộ test phân quyền**, cần giải quyết dứt điểm **AMB-04** (xung đột Visible Tabs vs quyền khách hàng) và **AMB-06** (thiếu tài khoản role thấp) — nếu không, toàn bộ nhóm test này không có tiêu chí PASS/FAIL đáng tin cậy.

---

## 13. Nhật Ký Thay Đổi (Changelog)

> **Cách đọc:** mới nhất lên trên. Đây là bộ nhớ liền mạch của tài liệu — mọi thay đổi yêu cầu theo thời gian đều ghi ở đây, kèm test case bị ảnh hưởng.
>
> **Quy ước trạng thái REQ:** 🟢 Active · 🟡 Changed (TC phải review) · 🔴 Deprecated (TC phải archive) · ⚪ Chưa implement.
> **REQ không được ghi trạng thái ở mục 2 = 🟢 Active.** Chỉ REQ có thay đổi mới được đánh dấu.
>
> Cập nhật tài liệu này bằng `/update_requirements_from_ticket` — không sửa tay để tránh lệch giữa Nhật ký, trạng thái REQ và dải mã ở bảng metadata.

| Ngày | Nguồn | REQ ảnh hưởng | Loại | Tóm tắt thay đổi | TC cần xử lý |
|---|---|---|---|---|---|
| 2026-08-02 | UI recon (Playwright MCP) | REQ-PRJ-01 → 65 | 🟢 Thêm | Khởi tạo tài liệu từ khảo sát UI thực tế trên `crm.anhtester.com`. Kèm 12 ambiguity, 12 risk, 7 Story | — (chưa có TC) |

### 13.1. Trạng thái hiện tại

| Trạng thái | Số REQ | Danh sách |
|---|---|---|
| 🟢 Active | 65 | REQ-PRJ-01 → 65 |
| 🟡 Changed | 0 | — |
| 🔴 Deprecated | 0 | — |
| ⚪ Chưa implement | 0 | — |

### 13.2. Ambiguity đang treo

| Mã | Mức độ | Trạng thái | Chờ từ | Ảnh hưởng |
|---|---|---|---|---|
| AMB-01, AMB-02, AMB-04, AMB-06, AMB-07 | 🔴 High | ❓ Chờ trả lời | 2026-08-02 | AMB-04 khiến **STORY-PRJ-03 BLOCKED**; AMB-06 khiến ma trận phân quyền role bỏ trống |
| AMB-03, AMB-05, AMB-08, AMB-10, AMB-12 | 🟡 Medium | ❓ Chờ trả lời | 2026-08-02 | Thiếu tiêu chí PASS/FAIL cho test biên và test sao chép |
| AMB-09, AMB-11 | 🟢 Low | ❓ Chờ trả lời | 2026-08-02 | Ảnh hưởng nhỏ, đã có assumption tạm dùng được |

**Tổng: 12/12 ambiguity còn treo** — chưa có phản hồi từ PO/BA.
