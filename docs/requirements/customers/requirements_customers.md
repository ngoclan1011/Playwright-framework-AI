# Đặc tả Yêu cầu — Module Khách hàng (`CUST`)

> Điểm vào cấp hệ thống: [../README.md](../README.md) · Bản đồ khám phá: [../_discovery/modules/module_02_khach_hang.md](../_discovery/modules/module_02_khach_hang.md)

| Mục | Giá trị |
|---|---|
| **Hệ thống** | Perfex CRM — Anh Tester Demo |
| **Module** | Khách hàng (Customers) |
| **Prefix** | `CUST` |
| **Route** | `/admin/clients` · `/admin/clients/client` (tạo) · `/admin/clients/client/{id}` (chi tiết/sửa) · `/admin/clients/client/{id}?group=<tab>` · `/admin/clients/import` · `/admin/clients/delete/{id}` |
| **Nguồn phân tích** | Khảo sát UI thực tế + đọc DOM + tầng network (Playwright MCP, headed 1600×750) |
| **Ngày phân tích** | 14-08-2026 |
| **Tài khoản dùng khảo sát** | 14-08-2026: "Admin Example" (`user-id-2`) · 19-09-2026: thêm "Project Manager" (`user-id-3`, không phải quản trị viên) để dựng ma trận phân quyền |
| **Môi trường dùng chung** | **CÓ** — đợt 14-08-2026 tạo 3 khách hàng thử nghiệm (`13364`, `13365`, `13366`) và **đã xoá sạch**. Đợt 19-09-2026 nhập CSV tạo **2 khách hàng** `14625`, `14626` (`auto_import_cust_20260919034844_1/2`) — ⚠️ **chưa dọn**, xem Nhật ký thay đổi |
| **Tổng số REQ** | **83** |
| **Dải mã đã dùng** | `REQ-CUST-01` → `REQ-CUST-83` · `AMB-CUST-01` → `AMB-CUST-14` · `RISK-CUST-01` → `RISK-CUST-08` |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-CUST-84` · `AMB-CUST-15` · `RISK-CUST-09` — **KHÔNG đánh lại từ 01** |

---

## 1. Tổng quan

Module Khách hàng quản lý toàn bộ vòng đời hồ sơ khách hàng của CRM. Đây là **entity trung tâm** của hệ thống: hơn 10 module khác (Hoá đơn, Dự án, Hợp đồng, Đề xuất, Báo giá, Thanh toán, Chi phí, Đăng ký định kỳ, Hỗ trợ, Công việc) đều tham chiếu tới khách hàng. Module hỏng đồng nghĩa chặn phần lớn nghiệp vụ bán hàng.

Module gồm **4 màn hình chính**:

| Màn hình | Route | Vai trò |
|---|---|---|
| Danh sách khách hàng | `/admin/clients` | Bảng dữ liệu server-side, bảng tổng quan, tìm kiếm, lọc, xuất, thao tác hàng loạt |
| Thêm khách hàng | `/admin/clients/client` | Biểu mẫu 2 tab: Customer Details · Billing & Shipping |
| Hồ sơ khách hàng | `/admin/clients/client/{id}` | 19 tab nghiệp vụ; tab Profile chứa biểu mẫu sửa 3 tab |
| Nhập từ CSV | `/admin/clients/import` | Nhập hàng loạt 27 cột, có chế độ chạy thử |

### Trong phạm vi

- Toàn bộ CRUD khách hàng: xem danh sách, tạo, sửa, xoá, bật/tắt trạng thái hoạt động
- Tìm kiếm nhanh, bộ lọc tuỳ biến 15 tiêu chí, bộ lọc lưu sẵn
- Xuất dữ liệu (Excel · CSV · PDF · Print) và thao tác hàng loạt (xoá hàng loạt · gán nhóm)
- Địa chỉ thanh toán / giao hàng và hai lối sao chép nhanh
- Kiểm tra dữ liệu đầu vào và cảnh báo trùng tên công ty
- Gán quản trị viên phụ trách (Customer Admins)
- Các tab phụ trợ thuộc **chính** module: Notes · Statement · Vault · Map · Reminders
- Nhập khách hàng từ tệp CSV

### Ngoài phạm vi

| Vùng | Lý do |
|---|---|
| Tab `Contacts` và màn hình `/admin/clients/all_contacts` | Thuộc module `CONT` — liên hệ có tài khoản đăng nhập cổng khách hàng riêng |
| Tab `Invoices` · `Payments` · `Proposals` · `Credit Notes` · `Estimates` · `Subscriptions` · `Expenses` · `Contracts` · `Projects` · `Tasks` · `Tickets` | **View chiếu** dữ liệu của module khác lọc theo khách hàng — đặc tả thuộc `INV`, `PAY`, `PROP`, `CN`, `EST`, `SUB`, `EXP`, `CTR`, `PRJ`, `TASK`, `TICK` |
| Tab `Files` (attachments) | Cơ chế đính kèm dùng chung toàn hệ thống, tách riêng khi recon module `MEDIA` |
| Quản trị nhóm khách hàng (`/admin/clients/groups`) | Thuộc khu Setup — 403 với tài khoản hiện tại |
| Cổng khách hàng (front-end ngoài `/admin`) | `system_map.md` mục 7 — chưa chốt phạm vi |
| Cột `Stripe id` của tệp CSV nhập | Chỉ phục vụ tích hợp cổng thanh toán Stripe, không có trường tương ứng trên UI — chốt `AMB-CUST-08` 19-09-2026 |
| Hiển thị bản đồ Google Maps ở tab `Map` | Môi trường thiếu khoá API Google Maps — chỉ test tới mức **lưu được toạ độ**, phần hiển thị ghi `Không test được`. Chốt `AMB-CUST-09` 19-09-2026 |

---

## 2. Bản đồ phủ tài liệu

**Không có tài liệu nào cho module này** — 79 REQ đầu sinh từ khảo sát UI thực tế, đọc DOM và quan sát thụ động tầng network ngày 14-08-2026. Không có spec, ticket, file đặc tả trường hay mockup kèm theo. Ngày 19-09-2026 bổ sung từ **quyết định PO trả lời 13 AMB** (`PO-2026-09-19`, không có file ticket) kèm khảo sát lại bằng tài khoản `Project Manager` → 83 REQ.

---

## 3. Yêu cầu Chức năng

> Quy ước cột `Nguồn`: `Kiểm chứng thực tế` = đã tương tác và xác nhận trên UI · `UI thực tế` = chỉ quan sát, chưa tương tác · `DOM` = đọc bằng `browser_evaluate` · `Network` = quan sát thụ động request do UI phát sinh.

### 3.1. Danh sách khách hàng (STORY-CUST-01)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-01 | Truy cập màn hình danh sách khách hàng | Người dùng đã đăng nhập mở `/admin/clients` thì thấy bảng khách hàng | Trang trả HTTP 200 · tiêu đề tab `Customers` · `body` mang class `app admin clients user-id-2 chrome` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-02 | Bảng tổng quan Customers Summary | Đầu màn hình hiển thị 6 chỉ số thống kê | Khối `Customers Summary` gồm đúng 6 ô, theo thứ tự: `Total Customers` · `Active Customers` · `Inactive Customers` · `Active Contacts` · `Inactive Contacts` · `Contacts Logged In Today`. Tại thời điểm khảo sát: 1571 · 1565 · 6 · 361 · 5 · 0 | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-03 | Cấu trúc cột bảng danh sách | Bảng có 9 cột, cột đầu là ô chọn không xuất được | Thứ tự cột: `[checkbox]` · `#` · `Company` · `Primary Contact` · `Primary Email` · `Phone` · `Active` · `Groups` · `Date Created`. Cột đầu mang class `sorting_disabled not-export`; 8 cột còn lại mang class `toggleable sorting` | 🟢 | — | DOM |
| REQ-CUST-04 | Sắp xếp theo cột | Bấm tiêu đề cột để đổi chiều sắp xếp; mặc định sắp theo Company tăng dần | Cột `Company` mang class `sorting_asc` khi mới nạp trang · body của `POST /admin/clients/table` chứa `order[0][column]=2&order[0][dir]=asc` · 8 cột đều `orderable=true`, riêng cột checkbox `orderable=false` | 🟢 | — | DOM + Network |
| REQ-CUST-05 | Chọn số dòng mỗi trang | Người dùng đổi được số bản ghi hiển thị trên một trang | Dropdown có đúng **5** tuỳ chọn với cặp nhãn/giá trị: `10`/`10` · `25`/`25` · `50`/`50` · `100`/`100` · `All`/`-1`. Mặc định chọn `25` | 🟢 | — | DOM |
| REQ-CUST-06 | Phân trang danh sách | Hệ thống chia trang và cho biết đang xem khoảng nào trên tổng số | Dòng trạng thái hiển thị `Showing 1 to 25 of 1,571 entries` · có dropdown chọn trang liệt kê đủ **63** trang · có liên kết `Previous` / `Next` và dải số trang rút gọn `1 2 3 4 5 … 63` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-07 | Nạp dữ liệu phía máy chủ | Bảng lấy dữ liệu qua AJAX, không nạp toàn bộ vào trình duyệt | Mỗi lần đổi trang / tìm kiếm / sắp xếp phát sinh `POST /admin/clients/table` trả **200** · body chứa `draw`, `start`, `length`, `search[value]`, `order[0][column]`, `last_order_identifier=customers` và mã chống CSRF `csrf_token_name` | 🟢 | — | Network |
| REQ-CUST-08 | Thanh công cụ màn hình danh sách | Đầu màn hình có các lối vào chức năng chính | Có **3** nút liên kết: `+ New Customer` → `/admin/clients/client` · `Import Customers` → `/admin/clients/import` · `Contacts` → `/admin/clients/all_contacts`; kèm **1** nút dropdown bộ lọc | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-09 | Thao tác nhanh trên từng dòng | Rê chuột vào dòng thì hiện các liên kết thao tác | Khối `.row-options` xuất hiện khi hover, gồm `View` → `/admin/clients/client/{id}` · `Contacts` → `/admin/clients/client/{id}?group=contacts` · `Delete` → `/admin/clients/delete/{id}` (thẻ `<a>` mang class `text-danger _delete`). Khi chưa hover, các liên kết này **không nằm trong vùng nhìn thấy** | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-10 | Nạp lại bảng không tải lại trang | Có nút làm mới dữ liệu bảng tại chỗ | Tồn tại nút `button.btn-dt-reload` trong nhóm nút của bảng | 🟢 | — | DOM |

### 3.2. Tìm kiếm & bộ lọc (STORY-CUST-02)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-11 | Tìm kiếm nhanh trên bảng | Nhập từ khoá vào ô tìm kiếm thì bảng lọc theo từ khoá | Ô `#clients_filter input[type=search]` placeholder `Search...` · nhập `Nguyen Van A` → bảng còn đúng 1 dòng, đúng khách hàng đó · phát sinh `POST /admin/clients/table` với `search[value]=Nguyen+Van+A` | 🟢 | — | Kiểm chứng thực tế + Network |
| REQ-CUST-12 | Hiển thị số bản ghi sau khi lọc | Sau khi tìm kiếm, hệ thống cho biết đã lọc từ bao nhiêu bản ghi | Dòng trạng thái đổi thành dạng `Showing 1 to 1 of 1 entries (filtered from 1,571 total entries)` | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-13 | Không tìm thấy kết quả | Từ khoá không khớp bản ghi nào thì bảng báo rõ | Bảng hiển thị đúng 1 dòng với nội dung `No matching records found` · dòng trạng thái `Showing 0 to 0 of 0 entries (filtered from 1,571 total entries)` | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-14 | Bộ lọc tuỳ biến theo điều kiện | Người dùng dựng được bộ lọc nhiều điều kiện | Chọn `New Filter` mở hộp thoại `Create Filter` · dropdown tiêu chí có đúng **15** mục: `Phone` · `Active` · `Invoices` · `Estimates` · `Proposals` · `Projects` · `Contracts Types` · `City` · `Zip Code` · `State` · `Country` · `Responsible admin` · `Groups` · `Customers assigned to me` · `Requires Registration Confirmation` · có nút `Add Rule` để thêm điều kiện | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-15 | Chọn kiểu khớp điều kiện | Bộ lọc nhiều điều kiện chọn được khớp tất cả hay khớp bất kỳ | Có cặp radio cùng tên `match_clients` với id `match_type_and` và `match_type_or` | 🟢 | — | DOM |
| REQ-CUST-16 | Lưu bộ lọc để dùng lại | Người dùng lưu bộ lọc vừa dựng thành bộ lọc dùng lại được | Hộp thoại `Create Filter` có checkbox `#clientsSaveFilter` (`Save Filter`) và nút `Apply` | 🟢 | — | DOM |
| REQ-CUST-17 | Danh sách bộ lọc đã lưu | Dropdown bộ lọc liệt kê các bộ lọc đã lưu và lệnh quản lý | Dropdown gồm 3 lệnh `New Filter` · `Clear Filter` · `Edit` và **9** bộ lọc đã lưu: `filter by phone` · `filter by active state` · `filter by invoice` · `filter by estimates` · `filter by proposals` · `filter by projects` · `filter by contracts type` · `filter by city` · `zip code` | 🟢 | — | Kiểm chứng thực tế + DOM |

### 3.3. Xuất dữ liệu & thao tác hàng loạt (STORY-CUST-03)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-18 | Xuất danh sách khách hàng | Người dùng xuất bảng đang xem ra tệp hoặc in | Bấm `Export` mở menu `.dt-button-collection` có đúng **4** mục theo thứ tự: `Excel` · `CSV` · `PDF` · `Print` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-19 | Cột chọn không nằm trong dữ liệu xuất | Cột checkbox không được đưa vào tệp xuất | Cột đầu bảng mang class `not-export` | 🟢 | — | DOM |
| REQ-CUST-20 | Chọn nhiều khách hàng | Người dùng chọn từng dòng hoặc chọn tất cả dòng đang hiển thị | Mỗi dòng có 1 `input[type=checkbox]`; hàng tiêu đề có 1 checkbox chọn tất cả | 🟢 | — | DOM |
| REQ-CUST-21 | Mở hộp thoại thao tác hàng loạt | Có lối vào thao tác hàng loạt từ thanh nút của bảng | Nút `Bulk Actions` mở modal `#customers_bulk_action` tiêu đề `Bulk Actions`; modal có nút `Close` và `Confirm` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-22 | Nội dung thao tác hàng loạt | Hộp thoại cho phép xoá hàng loạt hoặc gán nhóm hàng loạt | Modal chứa đúng **1** checkbox `mass_delete` (nhãn `Mass Delete`) và **1** select nhiều lựa chọn `move_to_groups_customers_bulk[]` (nhãn `Groups`) với **305** option, có ô tìm kiếm trong dropdown | 🟢 | — | DOM |

### 3.4. Tạo khách hàng mới (STORY-CUST-04)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-23 | Truy cập biểu mẫu thêm khách hàng | Bấm `New Customer` mở biểu mẫu tạo mới | Trang `/admin/clients/client` · tiêu đề tab `Add new customer` · `body` mang class `app admin customer-profile dynamic-create-groups clients client user-id-2` · biểu mẫu `form.client-form` gửi `POST` về chính `/admin/clients/client` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-24 | Biểu mẫu chia 2 tab ở chế độ tạo mới | Biểu mẫu tạo mới gồm đúng 2 tab | Có đúng **2** tab: `Customer Details` (`#contact_info`, mặc định active) và `Billing & Shipping` (`#billing_and_shipping`). Tab `Customer Admins` **không** xuất hiện ở chế độ tạo mới | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-25 | Company là trường bắt buộc duy nhất | Chỉ Company bắt buộc, mọi trường còn lại tuỳ chọn | Nhãn `Company` có dấu `*` (`<small class="req text-danger">*</small>`). Trong toàn bộ biểu mẫu **không có** trường nào khác mang dấu `*` | 🟢 | — | DOM |
| REQ-CUST-26 | Con trỏ đặt sẵn ở ô Company | Mở biểu mẫu thì con trỏ nằm sẵn tại ô Company | `input#company` mang thuộc tính `autofocus="1"` | 🟢 | — | DOM |
| REQ-CUST-27 | Các trường thông tin khách hàng | Tab Customer Details gồm đủ các trường hồ sơ | Theo thứ tự: `Company` · `VAT Number` (`vat`) · `Phone` (`phonenumber`) · `Website` (`website`) · `Groups` (`groups_in[]`) · `Currency` (`default_currency`) · `Default Language` (`default_language`) · `Address` (textarea) · `City` · `State` · `Zip Code` (`zip`) · `Country` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-28 | Gán nhiều nhóm cho khách hàng | Một khách hàng thuộc được nhiều nhóm cùng lúc | `select#groups_in[]` có thuộc tính `multiple`, **305** option, hiển thị `Nothing selected` khi chưa chọn; dropdown có ô tìm kiếm và nút `Select All` / `Deselect All` | 🟢 | — | DOM |
| REQ-CUST-29 | Tạo nhanh nhóm khách hàng ngay trên biểu mẫu | Nút `+` cạnh Groups mở hộp thoại tạo nhóm mới | Mở biểu mẫu phụ gửi `POST` về `/admin/clients/group`, gồm trường bắt buộc `name` (nhãn `* Name`), trường ẩn `id`, nút `Close` và `Save` | 🟢 | — | DOM |
| REQ-CUST-30 | Chọn tiền tệ cho khách hàng | Khách hàng đặt được tiền tệ riêng, mặc định theo hệ thống | `select#default_currency` có đúng **3** option: `""`/rỗng (đang chọn, hiển thị `System Default`) · `1`/`USD` · `2`/`EUR` | 🟢 | — | DOM |
| REQ-CUST-31 | Chọn ngôn ngữ mặc định cho khách hàng | Khách hàng đặt được ngôn ngữ riêng cho cổng khách hàng và chứng từ | `select#default_language` có đúng **27** option; option đầu giá trị rỗng nhãn `System Default` (đang chọn); có `english`, `vietnamese`, `chinese`, `japanese`… | 🟢 | — | DOM |
| REQ-CUST-32 | Chọn quốc gia | Trường Country là danh sách quốc gia chuẩn | `select#country` có đúng **251** option; option đầu giá trị rỗng; `Vietnam` mang giá trị `243`; danh sách sắp xếp theo bảng chữ cái từ `Afghanistan` tới `Zimbabwe` | 🟢 | — | DOM |
| REQ-CUST-33 | Lưu khách hàng mới | Bấm `Save` với dữ liệu hợp lệ thì tạo được khách hàng và mở hồ sơ vừa tạo | Nút `button.only-save.customer-form-submiter` nhãn `Save` · sau khi lưu, trình duyệt dừng ở `/admin/clients/client/{id_mới}` · tiêu đề tab là tên công ty vừa nhập · tiêu đề trang dạng `#{id} {tên công ty}` · dữ liệu đã nhập hiển thị đúng trên biểu mẫu sửa | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-34 | Lưu rồi tạo liên hệ ngay | Bấm `Save and create contact` thì tạo khách hàng và mở luôn hộp thoại thêm liên hệ | Nút `button.save-and-add-contact.customer-form-submiter` · sau khi lưu, trình duyệt dừng ở `/admin/clients/client/{id_mới}?group=contacts&new_contact=true` · modal `#contact` tiêu đề `Add new contact` tự mở | 🟢 | — | Kiểm chứng thực tế |

### 3.5. Địa chỉ thanh toán & giao hàng (STORY-CUST-05)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-35 | Nhóm trường Địa chỉ thanh toán | Tab Billing & Shipping có khối Billing Address đầy đủ | Khối `Billing Address` gồm 5 trường: `billing_street` (textarea) · `billing_city` · `billing_state` · `billing_zip` · `billing_country` (**251** option, giống danh sách Country) | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-36 | Nhóm trường Địa chỉ giao hàng | Tab Billing & Shipping có khối Shipping Address đầy đủ | Khối `Shipping Address` gồm 5 trường: `shipping_street` (textarea) · `shipping_city` · `shipping_state` · `shipping_zip` · `shipping_country` (**251** option) | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-37 | Sao chép địa chỉ khách hàng sang địa chỉ thanh toán | Liên kết `Same as Customer Info` điền địa chỉ thanh toán từ thông tin khách hàng | Bấm `a.billing-same-as-customer` → 5 trường billing nhận đúng giá trị của `address` · `city` · `state` · `zip` · `country`. Kiểm chứng: `123 Auto Recon Street` · `Da Nang` · `Hai Chau` · `550000` · `243` (Vietnam) | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-38 | Sao chép địa chỉ thanh toán sang địa chỉ giao hàng | Liên kết `Copy Billing Address` điền địa chỉ giao hàng từ địa chỉ thanh toán | Bấm `a.customer-copy-billing-address` → 5 trường shipping nhận đúng giá trị 5 trường billing tương ứng | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-39 | Gợi ý về việc bỏ trống địa chỉ giao hàng | Hệ thống nhắc người dùng khi nào không cần nhập địa chỉ giao hàng | Biểu tượng trợ giúp cạnh tiêu đề `Shipping Address` mang chú giải nguyên văn: `Do not fill shipping address information if you won't use shipping address on customer invoices` | 🟢 | — | DOM |

### 3.6. Kiểm tra dữ liệu & cảnh báo trùng tên (STORY-CUST-06)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-40 | Bỏ trống Company thì không lưu được | Gửi biểu mẫu với Company rỗng thì bị chặn và báo lỗi tại trường | Khối chứa Company nhận class `form-group has-error` · sinh phần tử `<p id="company-error" class="text-danger">This field is required.</p>` · `input#company` nhận `aria-describedby="company-error"` · **không** phát sinh request `POST /admin/clients/client` | 🟢 | — | Kiểm chứng thực tế + DOM + Network |
| REQ-CUST-41 | Nhãn tab đổi màu khi tab đó có lỗi | Lỗi nằm ở tab nào thì nhãn tab đó chuyển sang màu đỏ | Khi Company rỗng, nhãn tab `Customer Details` có màu chữ `rgb(255, 0, 0)` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-42 | Lỗi ở tab không hiển thị thì tự chuyển về tab chứa lỗi | Bấm Save khi lỗi bắt buộc nằm ở tab đang ẩn thì hệ thống tự chuyển sang tab chứa lỗi đầu tiên để người dùng thấy thông báo | Đang ở tab `Billing & Shipping`, Company rỗng, bấm `Save` → tab active chuyển sang `Customer Details` · thông báo `This field is required.` dưới ô Company **nhìn thấy được** · không lưu bản ghi.<br>⚠️ **Hệ thống hiện KHÔNG đạt** (khảo sát 14-08-2026): tab active vẫn là `Billing & Shipping`, thông báo lỗi nằm ở tab ẩn → **lỗi trải nghiệm**, TC sẽ FAIL, cần mở bug. Chốt `AMB-CUST-03` | 🟡 | 19-09-2026 · `PO-2026-09-19` | Quyết định PO (theo giả định tạm) + Kiểm chứng thực tế 14-08-2026 |
| REQ-CUST-43 | Company chỉ chứa khoảng trắng phải bị chặn | Kiểm tra bắt buộc của Company cắt khoảng trắng đầu/cuối trước khi xét — chuỗi toàn dấu cách coi như rỗng | Nhập `"   "` (3 dấu cách) rồi bấm `Save` → khối Company nhận class `has-error` · hiện `This field is required.` · **không** tạo khách hàng.<br>⚠️ **Hệ thống hiện KHÔNG đạt** (khảo sát 14-08-2026): không báo lỗi, tạo được khách hàng "tên rỗng" → **lỗi**, TC sẽ FAIL, cần mở bug. Chốt `AMB-CUST-02` | 🟡 | 19-09-2026 · `PO-2026-09-19` | Quyết định PO + Kiểm chứng thực tế 14-08-2026 |
| REQ-CUST-44 | Cảnh báo khi tên công ty đã tồn tại | Rời khỏi ô Company với tên đã có trong hệ thống thì hiện cảnh báo tham khảo | Sự kiện rời ô phát sinh `POST /admin/clients/check_duplicate_customer_name` với body `csrf_token_name=<token>&company=<tên>` · phản hồi JSON `{"exists":true,"message":"It looks that a customer with name <b>{tên}</b> already exists, if you still want to create the customer you can ignore this message."}` · UI hiện banner `.alert.alert-info` nguyên văn: `It looks that a customer with name {tên} already exists, if you still want to create the customer you can ignore this message.` | 🟢 | — | Kiểm chứng thực tế + Network + DOM |
| REQ-CUST-45 | Cảnh báo trùng tên không chặn việc lưu | Cảnh báo chỉ mang tính tham khảo, hệ thống vẫn cho tạo khách hàng trùng tên | Khối Company **không** nhận class `has-error` khi có cảnh báo · vẫn bấm `Save` được và tạo thành công khách hàng mới trùng tên (kiểm chứng: tạo được `13365` và `13366` cùng tên với `13364`) | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-46 | Biểu mẫu mang mã chống CSRF | Mỗi lần nạp biểu mẫu, hệ thống sinh mã chống giả mạo yêu cầu | Tồn tại `input[type=hidden][name=csrf_token_name]` với giá trị 32 ký tự hex · mã này cũng đi kèm trong request `check_duplicate_customer_name` và `POST /admin/clients/table` | 🟢 | — | DOM + Network |

### 3.7. Hồ sơ khách hàng & chỉnh sửa (STORY-CUST-07)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-47 | Mở hồ sơ khách hàng | Bấm tên khách hàng mở trang hồ sơ chi tiết | Trang `/admin/clients/client/{id}` · tiêu đề tab là tên công ty · tiêu đề trang dạng `#{id} {tên công ty}` (kiểm chứng: `#13364 auto_recon_cust_20260814_A1`) | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-48 | Điều hướng 19 tab nghiệp vụ | Hồ sơ khách hàng có 19 tab, điều hướng bằng tham số truy vấn | Cột điều hướng trái có đúng **19** tab theo thứ tự: `Profile` · `Contacts` · `Notes` · `Statement` · `Invoices` · `Payments` · `Proposals` · `Credit Notes` · `Estimates` · `Subscriptions` · `Expenses` · `Contracts` · `Projects` · `Tasks` · `Tickets` · `Files` · `Vault` · `Reminders` · `Map`. Mỗi tab trỏ tới `/admin/clients/client/{id}?group=<tên_tab>`; riêng `Files` dùng `group=attachments`. Số tab ở đây là góc nhìn của **Admin** — vai trò khác thấy ít hơn, xem `REQ-CUST-83` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-49 | Biểu mẫu sửa có thêm tab Customer Admins | Ở chế độ sửa, biểu mẫu hồ sơ có 3 tab thay vì 2 | Tab Profile chứa `form.client-form` với **3** tab: `Customer Details` · `Billing & Shipping` · `Customer Admins` (`#customer_admins`) | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-50 | Biểu mẫu sửa nạp đúng dữ liệu đã lưu | Mở hồ sơ thì mọi trường hiển thị đúng giá trị đã lưu | 24 trường dữ liệu (không tính trường ẩn) nạp đúng giá trị đã nhập lúc tạo, gồm cả `default_currency=1`, `default_language=vietnamese`, `country=243` và đủ 10 trường billing/shipping | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-51 | Chế độ sửa chỉ có một nút lưu | Biểu mẫu sửa không còn lối `Save and create contact` | Chân biểu mẫu chỉ có **1** nút `button.btn-primary.only-save.customer-form-submiter` nhãn `Save` | 🟢 | — | DOM |
| REQ-CUST-52 | Mở nhanh website của khách hàng | Trường Website ở chế độ sửa có nút mở trang web | Ô `#website` được bọc trong nhóm có nút biểu tượng quả cầu đứng ngay bên phải (không có ở chế độ tạo mới) | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-53 | Tuỳ chọn hiển thị tên liên hệ chính trên chứng từ | Có checkbox điều khiển việc in tên liên hệ chính lên chứng từ | Tồn tại `input#show_primary_contact[type=checkbox]` với nhãn nguyên văn `Show primary contact full name on Invoices, Estimates, Payments, Credit Notes`, mặc định **không** tích. Checkbox **chỉ hiển thị khi khách hàng có ít nhất 1 liên hệ được đánh dấu Primary Contact**: chưa có liên hệ nào → **không nằm trong vùng nhìn thấy** (`offsetParent` = null, kiểm chứng 14-08-2026) · có 1 liên hệ chính → hiển thị (kiểm chứng 19-09-2026 trên khách hàng `14625` nhập từ CSV). Chốt `AMB-CUST-13` | 🟡 | 19-09-2026 · `PO-2026-09-19` | DOM + Kiểm chứng thực tế |
| REQ-CUST-54 | Gán quản trị viên phụ trách khách hàng | Tab Customer Admins cho phép gán nhân sự phụ trách | Tab có nút `Assign Admin` mở modal `#customer_admins_assign` tiêu đề `Assign Admin` · select `customer_admins[]` có `multiple`, **3** option: `Project Manager` (`3`) · `Admin Anh Tester` (`1`) · `Admin Example` (`2`) · modal có nút `Close` và `Save` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-55 | Bảng danh sách quản trị viên phụ trách | Tab Customer Admins liệt kê nhân sự đã gán | Bảng có 3 cột `Staff Member` · `Date Assigned` · `Options`; khách hàng mới tạo hiển thị `No entries found`; có dropdown số dòng và nút `Export` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-83 | Tab hồ sơ khách hàng thay đổi theo vai trò | Vai trò không phải quản trị viên chỉ thấy tab của những module mình có quyền | Đăng nhập `Project Manager`, mở `/admin/clients/client/{id}` → cột điều hướng có đúng **15** tab: `Profile` · `Contacts` · `Notes` · `Statement` · `Invoices` · `Credit Notes` · `Estimates` · `Contracts` · `Projects` · `Tasks` · `Tickets` · `Files` · `Vault` · `Reminders` · `Map` — **không có** 4 tab `Payments` · `Proposals` · `Subscriptions` · `Expenses` so với 19 tab của Admin (`REQ-CUST-48`) | 🟢 | 19-09-2026 · `PO-2026-09-19` | Kiểm chứng thực tế + DOM (tài khoản PM) |

### 3.8. Trạng thái hoạt động & xoá (STORY-CUST-08)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-56 | Khách hàng mới mặc định đang hoạt động | Khách hàng vừa tạo có trạng thái Active | Công tắc ở cột `Active` của dòng vừa tạo ở trạng thái bật (`checked` = true) · ô ẩn kèm theo mang giá trị `Yes` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-57 | Tắt trạng thái hoạt động từ danh sách | Gạt công tắc Active sang tắt thì khách hàng chuyển sang Inactive ngay, không tải lại trang | Bấm `label.onoffswitch-label` → phát sinh `GET /admin/clients/change_client_status/{id}/0?csrf_token_name=<token>` trả **200** · thuộc tính `checked` của ô nhập chuyển thành `false` · trang **không** tải lại | 🟢 | — | Kiểm chứng thực tế + Network + DOM |
| REQ-CUST-58 | Bật lại trạng thái hoạt động | Gạt công tắc trở lại thì khách hàng hoạt động trở lại | Bấm lần nữa → phát sinh `GET /admin/clients/change_client_status/{id}/1?csrf_token_name=<token>` trả **200** | 🟢 | — | Kiểm chứng thực tế + Network |
| REQ-CUST-59 | Giải thích ý nghĩa trạng thái Inactive | Người dùng biết hệ quả của việc tắt trạng thái hoạt động | Công tắc mang chú giải nguyên văn: `Won't be shown in dropdowns when creating new records` | 🟢 | — | DOM |
| REQ-CUST-60 | Xác nhận trước khi xoá khách hàng | Bấm Delete thì hệ thống hỏi xác nhận trước | Xuất hiện hộp thoại xác nhận của trình duyệt (`confirm`) với nội dung nguyên văn: `Are you sure you want to perform this action?` · huỷ hộp thoại thì không xoá | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-61 | Xoá khách hàng thành công | Đồng ý xác nhận thì khách hàng bị xoá và hệ thống báo kết quả | Trình duyệt quay về `/admin/clients` · hiện thông báo nổi `.float-alert.alert-success` nguyên văn `Customer deleted` · bản ghi biến mất khỏi bảng · tổng số bản ghi giảm đúng 1 | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-62 | Xoá bằng cách mở thẳng đường dẫn | Đường dẫn xoá là `GET` nên mở thẳng URL cũng thực hiện xoá | `GET /admin/clients/delete/{id}` khi đã đăng nhập → xoá bản ghi và chuyển hướng về `/admin/clients`, **không** qua bước xác nhận nào. Xem `RISK-CUST-06` | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-81 | Khách hàng Inactive bị loại khỏi mọi dropdown chọn khách hàng | Khách hàng đang Inactive không xuất hiện ở **bất kỳ** dropdown chọn khách hàng nào khi tạo bản ghi mới, ở **mọi** module | Chuyển 1 khách hàng test sang Inactive → mở biểu mẫu tạo mới của từng module có chọn khách hàng (Hoá đơn · Báo giá · Đề xuất · Hợp đồng · Dự án · Thanh toán · Giấy báo có · Đăng ký định kỳ · Chi phí · Ticket · Công việc) → khách hàng đó **không** có trong danh sách chọn · bật lại Active → xuất hiện trở lại. ❔ **Chưa kiểm chứng** — cần đổi trạng thái khách hàng test rồi rà từng module. Chốt `AMB-CUST-10` | ⚪ | 19-09-2026 · `PO-2026-09-19` | Quyết định PO (theo giả định tạm) · chú giải `REQ-CUST-59` |
| REQ-CUST-82 | Chặn xoá khách hàng đang có dữ liệu liên quan | Khách hàng đang có hoá đơn / dự án / hợp đồng thì không xoá được | Bấm `Delete` → xác nhận → hệ thống **từ chối xoá** và hiện thông báo lỗi · khách hàng **vẫn còn** trong danh sách · hoá đơn/dự án/hợp đồng liên quan **không** bị xoá theo, **không** thành bản ghi mồ côi. Nội dung thông báo lỗi nguyên văn: ❔ **chưa kiểm chứng** — cần môi trường riêng. Chốt `AMB-CUST-11` | ⚪ | 19-09-2026 · `PO-2026-09-19` | Quyết định PO |

### 3.9. Các tab phụ trợ của hồ sơ (STORY-CUST-09)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-63 | Ghi chú nội bộ về khách hàng | Tab Notes cho phép thêm ghi chú nội bộ | Tab có nút `New Note` mở biểu mẫu 1 trường `textarea#description` (nhãn `Note description`) và nút `Save` · bảng 4 cột `Description` · `Added From` · `Date Added` · `Options` · khách hàng mới hiển thị `No entries found` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-64 | Sao kê công nợ khách hàng | Tab Statement hiển thị sao kê theo khoảng thời gian | Có dropdown `range` với **7** tuỳ chọn: `Today` · `This Week` · `This Month` (mặc định) · `Last Month` · `This Year` · `Last Year` · `Period` · chọn `Period` thì dùng cặp `period-from` / `period-to` · bảng sao kê 5 cột `Date` · `Details` · `Amount` · `Payments` · `Balance` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-65 | Tóm tắt số dư trong sao kê | Sao kê hiển thị khối tổng hợp số dư | Khối `Account Summary` gồm 4 dòng: `Beginning Balance` · `Invoiced Amount` · `Amount Paid` · `Balance Due`. Khách hàng chưa phát sinh giao dịch: cả 4 dòng bằng `$0.00`; đơn vị tiền hiển thị theo tiền tệ của khách hàng | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-66 | Gửi sao kê qua email | Sao kê gửi được tới liên hệ của khách hàng | Có biểu mẫu gửi với select nhiều lựa chọn `send_to[]`, ô `cc` và trường ẩn `template_name=client-statement`. Khách hàng chưa có liên hệ nào thì `send_to[]` có **0** option | 🟢 | — | DOM |
| REQ-CUST-67 | Kho lưu thông tin đăng nhập của khách hàng | Tab Vault lưu thông tin truy cập máy chủ của khách hàng | Nút `New Vault Entry` mở modal `#entryModal` tiêu đề `Vault Entry` gồm: `* Server Address` · `Port` (kiểu số) · `* Username` · `* Password` · `Short Description` (textarea) · nhóm radio `visibility` · checkbox `share_in_projects` (nhãn `Share this vault entry in projects with project members`). Khách hàng mới hiển thị `Vault entries not found for this customer.` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-68 | Ba mức hiển thị của mục Vault | Người tạo chọn được ai xem được mục Vault | Nhóm radio `visibility` có đúng **3** lựa chọn: `1` = `Visible to all staff member who have access to this customer` (**mặc định chọn**) · `2` = `Visible only to administrators` · `3` = `Visible only to me (administrators are not excluded)` | 🟢 | — | DOM |
| REQ-CUST-69 | Xác nhận mật khẩu trước khi xem mật khẩu Vault | Muốn xem mật khẩu đã lưu phải nhập lại mật khẩu của chính mình | Tồn tại modal `#vaultConfirmPassword` tiêu đề `View Password` với trường `user_password[type=password]` và trường ẩn `id` | 🟢 | — | DOM |
| REQ-CUST-70 | Toạ độ bản đồ của khách hàng | Tab Map lưu toạ độ và cần khoá API Google Maps để hiển thị bản đồ | Tab có 2 trường `latitude` (nhãn `Latitude (Google Maps)`) và `longitude` (nhãn `Longitude (Google Maps)`) cùng nút `Save` · hệ thống hiện thông báo nguyên văn: `Setup google api key in order to view to customer map` · **không** có `<iframe>` bản đồ nào được nạp | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-71 | Đặt nhắc nhở cho khách hàng | Tab Reminders cho phép hẹn nhắc việc gắn với khách hàng | Nút `Set Reminder` mở modal tiêu đề `Set Reminder` gồm: `* Date to be notified` (`date`) · `* Set reminder to` (`staff`, **4** option) · `* Description` (textarea) · checkbox `notify_by_email` (nhãn `Send also an email for this reminder`) · bảng 4 cột `Description` · `Date` · `Remind` · `Is notified?` | 🟢 | — | Kiểm chứng thực tế + DOM |

### 3.10. Nhập khách hàng từ CSV (STORY-CUST-10)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CUST-72 | Truy cập màn hình nhập khách hàng | Bấm `Import Customers` mở màn hình nhập từ CSV | Trang `/admin/clients/import` · tiêu đề tab `Import` · tiêu đề khối `Import Customers` | 🟢 | — | Kiểm chứng thực tế |
| REQ-CUST-73 | Hướng dẫn định dạng tệp nhập | Màn hình nêu rõ 4 quy tắc về tệp CSV | Hiển thị đúng **4** mục hướng dẫn, nguyên văn:<br>1. `Your CSV data should be in the format below. The first line of your CSV file should be the column headers as in the table example. Also make sure that your file is UTF-8 to avoid unnecessary encoding problems.`<br>2. `If the column you are trying to import is date make sure that is formatted in format Y-m-d ({ngày hiện tại}).` — ngày ví dụ là **ngày hôm nay** dạng `Y-m-d`, đổi theo ngày mở trang (14-08-2026 hiện `2026-08-14`, 19-09-2026 hiện `2026-09-19`)<br>3. `Make sure you configure the default contact permission in Setup->Settings->Customers to get the best results like auto assigning contact permissions and email notification settings based on the permission.`<br>4. `Duplicate email rows won't be imported.` | 🟡 | 19-09-2026 · `PO-2026-09-19` | Kiểm chứng thực tế |
| REQ-CUST-74 | Bảng cột mẫu của tệp nhập | Màn hình liệt kê đầy đủ cột hợp lệ và cột bắt buộc | Bảng mẫu có đúng **27** cột theo thứ tự: `* Firstname` · `* Lastname` · `* Email` · `Contact phonenumber` · `Position` (5 cột đầu ghi chú `Contact field`) · `* Company` · `Vat` · `Phonenumber` · `Country` · `City` · `Zip` · `State` · `Address` · `Website` · `Billing street` · `Billing city` · `Billing state` · `Billing zip` · `Billing country` · `Shipping street` · `Shipping city` · `Shipping state` · `Shipping zip` · `Shipping country` · `Longitude` · `Latitude` · `Stripe id`. **4** cột bắt buộc (mang dấu `*`): `Firstname` · `Lastname` · `Email` · `Company` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-75 | Tải tệp CSV mẫu | Người dùng tải được tệp mẫu đúng định dạng | Nút `Download Sample` (`button.btn-success[type=submit]`) nằm trong biểu mẫu riêng có trường ẩn `download_sample` | 🟢 | — | DOM |
| REQ-CUST-76 | Tệp CSV là trường bắt buộc | Bấm Import khi chưa chọn tệp thì bị chặn và báo lỗi | Bấm `Import` với ô tệp rỗng → sinh `<p id="file_csv-error" class="text-danger">This field is required.</p>` · `input#file_csv` nhận `aria-describedby="file_csv-error"` · trang **không** chuyển hướng | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-CUST-77 | Thiết lập kèm theo khi nhập | Người dùng gán nhóm và đặt mật khẩu mặc định cho toàn bộ bản ghi nhập vào | Biểu mẫu nhập có `select#groups_in[]` (`multiple`, **305** option, nhãn `Groups`) và ô `input#default_pass_all` (nhãn `Default password for all contacts`) | 🟢 | — | DOM |
| REQ-CUST-78 | Chạy thử trước khi nhập thật | Người dùng kiểm tra tệp trước khi ghi dữ liệu thật | Có đúng **2** nút gửi: `Import` (`button.import.btn-import-submit`) và `Simulate Import` (`button.simulate.btn-import-submit`) | 🟢 | — | DOM |
| REQ-CUST-79 | Kết quả nhập tệp CSV | Bấm `Import` với tệp hợp lệ thì hệ thống tạo khách hàng kèm liên hệ chính và báo số bản ghi đã nhập | Tệp 27 cột, 2 dòng hợp lệ → trang tải lại ở `/admin/clients/import` · thông báo nổi thành công nguyên văn `Total Imported: 2` (dạng `Total Imported: {n}`) · tổng khách hàng tăng đúng **2** (2.029 → 2.031) · mỗi dòng sinh **1 khách hàng** (Company = cột `Company`) ở trạng thái **Active**, không thuộc nhóm nào khi bỏ trống `Groups` · kèm **1 liên hệ chính** lấy từ 5 cột `Contact field` (tổng liên hệ Active tăng 365 → 367). Kiểm chứng 19-09-2026, khách hàng `14625`, `14626`. Cách báo **dòng bị bỏ qua** (email trùng) ❔ chưa kiểm chứng ở lần nhập thật. Chốt `AMB-CUST-12` | 🟡 | 19-09-2026 · `PO-2026-09-19` | Kiểm chứng thực tế + DOM (tài khoản PM) |
| REQ-CUST-80 | Chạy thử nhập tệp không ghi dữ liệu | `Simulate Import` hiển thị bản xem trước của tệp, không tạo bản ghi nào | Chọn tệp → bấm `Simulate Import` → trang tải lại, hiện khối tiêu đề `Simulation Data` kèm ghi chú `Max 100 rows are shown` và dòng nguyên văn `If you are satisfied with the results upload the file again and click import.` · bảng 27 cột, **mỗi dòng CSV một dòng**, cột trống ở `Country`/`Billing country`/`Shipping country` hiện `0` · ô chọn tệp trở về `No file chosen` (phải chọn lại tệp mới nhập thật được) · tổng số khách hàng **không đổi**. Bản chạy thử **không** đánh dấu dòng trùng email: tệp 3 dòng có dòng 3 trùng email dòng 1 vẫn hiện đủ 3 dòng như nhau. Kiểm chứng 19-09-2026 | 🟢 | 19-09-2026 · `PO-2026-09-19` | Kiểm chứng thực tế + DOM (tài khoản PM) |

---

## 4. Đặc tả Trường Dữ liệu

### 4.1. Biểu mẫu Khách hàng — tab Customer Details

| Field (Label) | Tên field | Loại UI | Required | Ràng buộc / Giá trị | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|---|
| Company | `company` | Text | ✅ | Không khai báo `maxlength`, không khai báo `pattern`. Giới hạn **255** ký tự theo CSDL (`AMB-CUST-05`, chưa kiểm chứng). Chuỗi toàn khoảng trắng **phải bị chặn** — ⚠️ hệ thống hiện vẫn chấp nhận (`REQ-CUST-43`) | REQ-CUST-25, 40, 43, 44 | Trường bắt buộc duy nhất của module |
| VAT Number | `vat` | Text | ❌ | Không ràng buộc — **không** kiểm tra định dạng (`AMB-CUST-06`) · tối đa 255 (`AMB-CUST-05`) | REQ-CUST-27 | |
| Phone | `phonenumber` | Text | ❌ | Không ràng buộc định dạng (`AMB-CUST-06`) · tối đa 255 (`AMB-CUST-05`) | REQ-CUST-27 | `type=text`, không phải `tel` |
| Website | `website` | Text | ❌ | Không ràng buộc định dạng URL (`AMB-CUST-06`) · tối đa 255 (`AMB-CUST-05`) | REQ-CUST-27, 52 | Chế độ sửa có thêm nút mở trang |
| Groups | `groups_in[]` | Multi-select | ❌ | **305** option; có ô tìm kiếm, `Select All` / `Deselect All` | REQ-CUST-28, 29 | Nguồn dữ liệu từ bảng nhóm khách hàng thuộc khu Setup |
| Currency | `default_currency` | Select | ❌ | **3** option: `""` (System Default, mặc định) · `1` = USD · `2` = EUR | REQ-CUST-30 | |
| Default Language | `default_language` | Select | ❌ | **27** option; mặc định `""` = System Default; giá trị dạng chuỗi tên ngôn ngữ (`english`, `vietnamese`…) | REQ-CUST-31 | |
| Address | `address` | Textarea | ❌ | Không ràng buộc | REQ-CUST-27, 37 | |
| City | `city` | Text | ❌ | Không ràng buộc | REQ-CUST-27, 37 | |
| State | `state` | Text | ❌ | Không ràng buộc | REQ-CUST-27, 37 | |
| Zip Code | `zip` | Text | ❌ | Không ràng buộc, `type=text` | REQ-CUST-27, 37 | |
| Country | `country` | Select | ❌ | **251** option; option đầu rỗng; `Vietnam` = `243` | REQ-CUST-32, 37 | |
| Show primary contact full name… | `show_primary_contact` | Checkbox | ❌ | Mặc định không tích; **ẩn** khi khách hàng chưa có liên hệ | REQ-CUST-53 | Chỉ có ở chế độ sửa |

### 4.2. Biểu mẫu Khách hàng — tab Billing & Shipping

| Field (Label) | Tên field | Loại UI | Required | Ràng buộc / Giá trị | REQ liên quan |
|---|---|---|---|---|---|
| Billing · Street | `billing_street` | Textarea | ❌ | Không ràng buộc | REQ-CUST-35, 37 |
| Billing · City | `billing_city` | Text | ❌ | Không ràng buộc | REQ-CUST-35, 37 |
| Billing · State | `billing_state` | Text | ❌ | Không ràng buộc | REQ-CUST-35, 37 |
| Billing · Zip Code | `billing_zip` | Text | ❌ | Không ràng buộc | REQ-CUST-35, 37 |
| Billing · Country | `billing_country` | Select | ❌ | **251** option, cùng danh sách với `country` | REQ-CUST-35, 37 |
| Shipping · Street | `shipping_street` | Textarea | ❌ | Không ràng buộc | REQ-CUST-36, 38 |
| Shipping · City | `shipping_city` | Text | ❌ | Không ràng buộc | REQ-CUST-36, 38 |
| Shipping · State | `shipping_state` | Text | ❌ | Không ràng buộc | REQ-CUST-36, 38 |
| Shipping · Zip Code | `shipping_zip` | Text | ❌ | Không ràng buộc | REQ-CUST-36, 38 |
| Shipping · Country | `shipping_country` | Select | ❌ | **251** option | REQ-CUST-36, 38 |

### 4.3. Biểu mẫu Nhập CSV

| Field (Label) | Tên field | Loại UI | Required | Ràng buộc / Giá trị | REQ liên quan |
|---|---|---|---|---|---|
| Choose CSV File | `file_csv` | File | ✅ | **Không** khai báo thuộc tính `accept` — trình duyệt không lọc loại tệp | REQ-CUST-76 |
| Groups | `groups_in[]` | Multi-select | ❌ | **305** option | REQ-CUST-77 |
| Default password for all contacts | `default_pass_all` | Text | ❌ | `type=text` — mật khẩu hiển thị rõ khi gõ | REQ-CUST-77 |

### 4.4. Các biểu mẫu phụ

| Màn hình | Field | Tên field | Loại | Required | REQ |
|---|---|---|---|---|---|
| Tạo nhóm nhanh | Name | `name` | Text | ✅ | REQ-CUST-29 |
| Ghi chú | Note description | `description` | Textarea | ❌ | REQ-CUST-63 |
| Vault | Server Address | `server_address` | Text | ✅ | REQ-CUST-67 |
| Vault | Port | `port` | Number | ❌ | REQ-CUST-67 |
| Vault | Username | `username` | Text | ✅ | REQ-CUST-67 |
| Vault | Password | `password` | Password | ✅ | REQ-CUST-67 |
| Vault | Short Description | `description` | Textarea | ❌ | REQ-CUST-67 |
| Vault | Visibility | `visibility` | Radio ×3 | — | REQ-CUST-68 |
| Vault | Share in projects | `share_in_projects` | Checkbox | ❌ | REQ-CUST-67 |
| Map | Latitude / Longitude | `latitude` · `longitude` | Text | ❌ | REQ-CUST-70 |
| Reminder | Date to be notified | `date` | Text (datepicker) | ✅ | REQ-CUST-71 |
| Reminder | Set reminder to | `staff` | Select (4 option) | ✅ | REQ-CUST-71 |
| Reminder | Description | `description` | Textarea | ✅ | REQ-CUST-71 |
| Reminder | Send also an email | `notify_by_email` | Checkbox | ❌ | REQ-CUST-71 |
| Bulk Actions | Mass Delete | `mass_delete` | Checkbox | ❌ | REQ-CUST-22 |
| Bulk Actions | Groups | `move_to_groups_customers_bulk[]` | Multi-select (305) | ❌ | REQ-CUST-22 |
| Assign Admin | Staff | `customer_admins[]` | Multi-select (3) | — | REQ-CUST-54 |

---

## 5. Business Rules & Validation Messages

| REQ ID | Rule / Trigger | Thông báo mong đợi (nguyên văn) | Loại |
|---|---|---|---|
| REQ-CUST-40 | Gửi biểu mẫu khách hàng với `company` rỗng | `This field is required.` | ❌ Lỗi chặn |
| REQ-CUST-44 | Rời ô `company` với tên đã tồn tại | `It looks that a customer with name {tên} already exists, if you still want to create the customer you can ignore this message.` | ℹ️ Thông tin, **không** chặn |
| REQ-CUST-59 | Rê chuột lên công tắc Active | `Won't be shown in dropdowns when creating new records` | 💡 Chú giải |
| REQ-CUST-39 | Rê chuột lên biểu tượng cạnh `Shipping Address` | `Do not fill shipping address information if you won't use shipping address on customer invoices` | 💡 Chú giải |
| REQ-CUST-60 | Bấm `Delete` trên dòng khách hàng | `Are you sure you want to perform this action?` | ⚠️ Xác nhận |
| REQ-CUST-61 | Xác nhận xoá thành công | `Customer deleted` | ✅ Thành công |
| REQ-CUST-70 | Mở tab Map khi chưa cấu hình khoá API | `Setup google api key in order to view to customer map` | ⚠️ Cảnh báo cấu hình |
| REQ-CUST-76 | Bấm `Import` khi chưa chọn tệp | `This field is required.` | ❌ Lỗi chặn |
| REQ-CUST-43 | Gửi biểu mẫu với `company` toàn khoảng trắng | `This field is required.` — ⚠️ hệ thống hiện chưa hiện | ❌ Lỗi chặn |
| REQ-CUST-79 | Nhập tệp CSV thành công | `Total Imported: {n}` | ✅ Thành công |
| REQ-CUST-80 | Chạy thử nhập tệp | `If you are satisfied with the results upload the file again and click import.` | ℹ️ Thông tin |
| REQ-CUST-82 | Xoá khách hàng đang có dữ liệu liên quan | ❔ chưa kiểm chứng nguyên văn | ❌ Lỗi chặn |
| REQ-CUST-13 | Tìm kiếm không ra kết quả | `No matching records found` | ℹ️ Trạng thái rỗng |
| REQ-CUST-55, 63, 71 | Bảng con chưa có dữ liệu | `No entries found` | ℹ️ Trạng thái rỗng |
| REQ-CUST-67 | Tab Vault chưa có mục nào | `Vault entries not found for this customer.` | ℹ️ Trạng thái rỗng |

### 5.1. Quy tắc nghiệp vụ ngầm (rút ra từ hành vi thực tế)

| Mã | Quy tắc | Căn cứ |
|---|---|---|
| REQ-CUST-45 | Tên công ty **không** bắt buộc duy nhất — hệ thống cho phép nhiều khách hàng cùng tên | Đã tạo được 3 khách hàng cùng tên `auto_recon_cust_20260814_A1` |
| REQ-CUST-43 | Kiểm tra bắt buộc của `company` **phải** cắt khoảng trắng đầu/cuối — chuỗi toàn dấu cách coi như rỗng | PO chốt 19-09-2026 (`AMB-CUST-02`). ⚠️ Hệ thống hiện **chưa** cắt: chuỗi `"   "` vượt qua kiểm tra → lỗi |
| REQ-CUST-80 | Chạy thử nhập **không** ghi dữ liệu và **không** phát hiện dòng trùng email — quy tắc trùng email chỉ áp khi nhập thật | Tổng số khách hàng không đổi sau `Simulate Import`; dòng trùng vẫn hiển thị |
| — | Trường text của biểu mẫu khách hàng giới hạn **255** ký tự theo cột CSDL | Chốt theo giả định (`AMB-CUST-05`) — **chưa kiểm chứng**. TC biên dùng 255 (phải lưu nguyên vẹn) và 256 (ghi nhận hành vi thực tế) |
| — | `Website`, `Phone`, `VAT Number` **không** kiểm tra định dạng — nhập gì cũng lưu | Chốt theo giả định (`AMB-CUST-06`) |
| — | Bấm `Save` khi request kiểm tra trùng tên còn đang chạy thì lần bấm đó bị bỏ qua, phải bấm lại | Chốt theo giả định (`AMB-CUST-04`) — xem `RISK-CUST-03` |
| REQ-CUST-56 | Khách hàng mới luôn ở trạng thái Active | Công tắc bật sẵn sau khi tạo |
| REQ-CUST-73 | Dòng CSV có email trùng sẽ bị bỏ qua khi nhập | Hướng dẫn mục 4 trên màn hình Import |

---

## 6. Ma trận Phân quyền

> Hệ thống có đúng **3 vai trò** (danh mục `docs/requirements/README.md`): `Admin` · `Project Manager` (nhân sự **không phải** quản trị viên) · `Customer` (liên hệ khách hàng, đăng nhập cổng riêng ở `/login`). Hộp thoại `Assign Admin` (REQ-CUST-54) xác nhận chỉ có **3 nhân sự**, nên không tồn tại vai trò nhân sự thứ ba.
>
> Cột `Admin` kiểm chứng 14-08-2026. Cột `Project Manager` kiểm chứng 19-09-2026 bằng tài khoản PM (`user-id-3`, `app.user_is_admin` rỗng). Khu Setup (`/admin/roles`, `/admin/staff`) với PM **chuyển hướng về `/admin/clients`** — vẫn không đọc được màn hình cấu hình quyền.

**Ký hiệu:** ✅ đã **thực thi** thành công · ✅ᵁᴵ giao diện hiện đủ chức năng (trang mở được, nút/link có mặt) nhưng **không gửi** thao tác — tránh ghi/xoá dữ liệu trên môi trường dùng chung · ❌ bị chặn · ❔ chưa kiểm chứng

| Hành động | Admin | Project Manager | Customer |
|---|---|---|---|
| Xem danh sách khách hàng | ✅ | ✅ thấy **toàn bộ** 2.031 khách hàng, không chỉ khách được gán | ❌ |
| Tìm kiếm & lọc | ✅ | ✅ | ❌ |
| Xuất dữ liệu (Excel/CSV/PDF/Print) | ✅ | ✅ᵁᴵ nút `Export` | ❌ |
| Thao tác hàng loạt (xoá / gán nhóm) | ✅ | ✅ᵁᴵ modal `Bulk Actions` có `Mass Delete` và `Groups` | ❌ |
| Tạo khách hàng mới | ✅ | ✅ᵁᴵ biểu mẫu mở được, có nút `Save` · ✅ tạo thật qua Nhập CSV | ❌ |
| Sửa hồ sơ khách hàng | ✅ | ✅ᵁᴵ biểu mẫu sửa mở được, có nút `Save` | ❌ |
| Bật/tắt trạng thái hoạt động | ✅ | ✅ gạt `14626` sang Inactive (Inactive 9 → 10) rồi bật lại (10 → 9) | ❌ |
| Xoá khách hàng | ✅ | ✅ᵁᴵ link `Delete` trên từng dòng | ❌ |
| Gán quản trị viên phụ trách | ✅ | ✅ᵁᴵ nút `Assign Admin` | ❌ |
| Xem mục Vault mức "chỉ quản trị viên" | ✅ | ❔ tab Vault mở được và tạo được mục mới (`New Vault Entry`, đủ 3 mức hiển thị), nhưng chưa có mục mức 2 nào để thử xem | ❌ |
| Nhập khách hàng từ CSV | ✅ | ✅ nhập thật 2 dòng, `Total Imported: 2` | ❌ |
| Tạo nhóm khách hàng nhanh từ biểu mẫu | ✅ | ✅ᵁᴵ nút `+` mở `#customer_group_modal` | ❌ |
| Số tab trong hồ sơ khách hàng | 19 (`REQ-CUST-48`) | 15 — thiếu `Payments` · `Proposals` · `Subscriptions` · `Expenses` (`REQ-CUST-83`) | ❌ |

```
Đã kiểm chứng: 38/39 ô — Admin 13 · Project Manager 12 (5 thực thi + 7 mức UI) · Customer 13
Chưa rõ: 1 ô — PM xem mục Vault "chỉ quản trị viên" (AMB-CUST-14)
Cột Customer: ❌ toàn bộ theo REQ-LOGIN-43 — liên hệ khách hàng không đăng nhập được vào /admin
```

> ⚠️ **PM có giao diện đầy đủ như Admin với mọi thao tác phá huỷ** (xoá từng bản ghi, `Mass Delete` toàn bộ khách hàng) — trái giả định tạm của `AMB-CUST-01` (*"vai trò không phải Admin không xoá được"*). Quyền xoá phía server **chưa thực thi** — xem `AMB-CUST-14` và `RISK-CUST-08`.
>
> Riêng REQ-CUST-68 cho biết hệ thống **có** phân biệt "quản trị viên" với "nhân sự thường" ở mức dữ liệu Vault (`Visible only to administrators`).

---

## 7. Ma trận Trạng thái

Khách hàng có đúng **2 trạng thái**, điều khiển bằng công tắc ở cột `Active` của danh sách.

| Trạng thái hiện tại | Hành động cho phép | Trạng thái kế tiếp | Ai được thực hiện | REQ |
|---|---|---|---|---|
| *(chưa tồn tại)* | Tạo khách hàng mới · Nhập CSV | **Active** | Admin ✅ · PM ✅ (qua Nhập CSV) · Customer ❌ | REQ-CUST-33, 56, 79 |
| **Active** | Gạt công tắc sang tắt (`change_client_status/{id}/0`) | **Inactive** | Admin ✅ · PM ✅ · Customer ❌ | REQ-CUST-57 |
| **Active** | Sửa hồ sơ · Xoá | Active / *(bị xoá)* — bị chặn nếu đang có dữ liệu liên quan | Admin ✅ · PM ✅ᵁᴵ · Customer ❌ | REQ-CUST-50, 61, 82 |
| **Inactive** | Gạt công tắc sang bật (`change_client_status/{id}/1`) | **Active** | Admin ✅ · PM ✅ · Customer ❌ | REQ-CUST-58 |
| **Inactive** | Sửa hồ sơ · Xoá | Inactive / *(bị xoá)* — bị chặn nếu đang có dữ liệu liên quan | Admin ✅ · PM ✅ᵁᴵ · Customer ❌ | REQ-CUST-50, 61, 82 |

**Hệ quả nghiệp vụ của trạng thái Inactive:** khách hàng `Inactive` **không xuất hiện trong dropdown khi tạo bản ghi mới** ở các module khác (REQ-CUST-59). PO chốt 19-09-2026 (`AMB-CUST-10`): áp cho **mọi** dropdown chọn khách hàng ở **tất cả** module → `REQ-CUST-81` (⚪ chưa kiểm chứng).

---

## 8. Luồng xử lý chính

### 8.1. Tạo khách hàng mới

```
Danh sách khách hàng
  → bấm "+ New Customer"                      → /admin/clients/client
  → nhập Company (bắt buộc) + các trường khác
  → [tuỳ chọn] tab Billing & Shipping → "Same as Customer Info" → "Copy Billing Address"
  → bấm "Save"
      ├─ Company rỗng  → hiện "This field is required.", KHÔNG gửi request
      ├─ Tên đã tồn tại → hiện banner thông tin, VẪN cho lưu
      └─ Hợp lệ        → tạo bản ghi → chuyển tới /admin/clients/client/{id mới}
```

Nhánh thứ hai: bấm `Save and create contact` → tạo bản ghi → chuyển tới `/admin/clients/client/{id}?group=contacts&new_contact=true` với hộp thoại `Add new contact` mở sẵn.

### 8.2. Xoá khách hàng

```
Danh sách khách hàng
  → rê chuột vào dòng      → hiện .row-options
  → bấm "Delete"           → confirm "Are you sure you want to perform this action?"
      ├─ Huỷ    → không xảy ra gì
      └─ Đồng ý → GET /admin/clients/delete/{id}
                → về /admin/clients + thông báo "Customer deleted"
```

### 8.3. Bật/tắt trạng thái hoạt động

```
Danh sách khách hàng → gạt công tắc cột "Active"
  → GET /admin/clients/change_client_status/{id}/{0|1}?csrf_token_name=<token>
  → cập nhật tại chỗ, KHÔNG tải lại trang
```

### 8.4. Nhập khách hàng từ CSV

```
Danh sách → "Import Customers"     → /admin/clients/import
  → [tuỳ chọn] "Download Sample"   → tải tệp mẫu 27 cột
  → chọn tệp CSV (bắt buộc) + Groups + mật khẩu mặc định
  → "Simulate Import" (chạy thử)   HOẶC  "Import" (nhập thật)
```

---

## 9. Yêu cầu Phi chức năng (quan sát được)

| Mã | Hạng mục | Ghi nhận |
|---|---|---|
| REQ-CUST-07 | Khả năng mở rộng dữ liệu | Bảng dùng DataTables **server-side**, chỉ nạp 25 dòng/lần trên tổng 1.571 bản ghi — không nạp toàn bộ vào trình duyệt |
| REQ-CUST-44 | Độ trễ kiểm tra trùng tên | `check_duplicate_customer_name` phản hồi trong **61–139 ms** qua 2 lần đo |
| REQ-CUST-46 | Bảo vệ CSRF | Mọi biểu mẫu và mọi request thay đổi dữ liệu đều kèm `csrf_token_name` 32 ký tự hex |
| REQ-CUST-62 | Phương thức HTTP của thao tác xoá | Xoá dùng **GET**, không phải POST/DELETE — không đúng chuẩn REST, xem `RISK-CUST-06` |
| REQ-CUST-77 | Hiển thị mật khẩu mặc định khi nhập | `default_pass_all` là `type=text`, mật khẩu hiển thị rõ khi gõ |
| — | Bộ nhớ đệm | Phản hồi mang `cache-control: no-store, no-cache, must-revalidate` — không lưu đệm dữ liệu khách hàng |
| — | Máy chủ | Header `server: LiteSpeed` |

---

## 10. Phân rã Epic / Story (Backlog View)

| Story ID | Tên Story | REQ bao phủ | Số REQ | AMB / RISK liên quan | Ghi chú phạm vi |
|---|---|---|---|---|---|
| STORY-CUST-01 | Danh sách khách hàng & bảng tổng quan | REQ-CUST-01 → 10 | 10 | RISK-CUST-05 | Nền tảng cho mọi luồng khác |
| STORY-CUST-02 | Tìm kiếm & bộ lọc | REQ-CUST-11 → 17 | 7 | RISK-CUST-05 | Bộ lọc lưu sẵn là dữ liệu dùng chung giữa các tester |
| STORY-CUST-03 | Xuất dữ liệu & thao tác hàng loạt | REQ-CUST-18 → 22 | 5 | RISK-CUST-02, RISK-CUST-06 | **Không test xoá hàng loạt** trên môi trường dùng chung |
| STORY-CUST-04 | Tạo khách hàng mới | REQ-CUST-23 → 34 | 12 | AMB-CUST-05, AMB-CUST-06, AMB-CUST-07, RISK-CUST-04 | Luồng nghiệp vụ cốt lõi |
| STORY-CUST-05 | Địa chỉ thanh toán & giao hàng | REQ-CUST-35 → 39 | 5 | — | Độc lập, test được song song |
| STORY-CUST-06 | Kiểm tra dữ liệu & cảnh báo trùng tên | REQ-CUST-40 → 46 | 7 | AMB-CUST-02, AMB-CUST-03, AMB-CUST-04, RISK-CUST-03 | `REQ-CUST-42`, `43` ghi kỳ vọng đúng mà hệ thống **chưa đạt** → TC FAIL, mở bug |
| STORY-CUST-07 | Hồ sơ khách hàng & chỉnh sửa | REQ-CUST-47 → 55, 83 | 10 | AMB-CUST-13, AMB-CUST-08 | 19 tab (Admin) / 15 tab (PM) — 11 tab thuộc module khác |
| STORY-CUST-08 | Trạng thái hoạt động & xoá | REQ-CUST-56 → 62, 81, 82 | 9 | AMB-CUST-10, AMB-CUST-11, AMB-CUST-14, RISK-CUST-06, RISK-CUST-07, RISK-CUST-08 | Thao tác phá huỷ — cần dữ liệu riêng · `REQ-CUST-81`, `82` đang ⚪ |
| STORY-CUST-09 | Các tab phụ trợ của hồ sơ | REQ-CUST-63 → 71 | 9 | AMB-CUST-09 | Notes · Statement · Vault · Map · Reminders |
| STORY-CUST-10 | Nhập khách hàng từ CSV | REQ-CUST-72 → 80 | 9 | AMB-CUST-12 | Đã kiểm chứng nhập thật 19-09-2026 |

**Tổng: 10 Story / 83 REQ — mọi REQ thuộc đúng một Story, không mồ côi, không trùng.**

### 10.1. Hạng mục cấp Epic (cố ý không gán vào Story nào)

| Hạng mục | Lý do |
|---|---|
| Ma trận Phân quyền (mục 6) | Cắt ngang cả 10 Story. Đã kiểm chứng 38/39 ô ngày 19-09-2026; còn 1 ô treo ở `AMB-CUST-14` |
| Ma trận Trạng thái (mục 7) | Trạng thái Active/Inactive ảnh hưởng tới hành vi của Story 01, 04, 07, 08 |
| Yêu cầu phi chức năng (mục 9) | Áp cho toàn module, không thuộc một luồng cụ thể |
| Bảng Ambiguity & Risk (mục 11) | Đánh số theo toàn module |

### 10.2. Thứ tự triển khai đề xuất

| # | Story | Lý do xếp trước | Trạng thái |
|---|---|---|---|
| 1 | STORY-CUST-04 Tạo khách hàng | Mọi Story khác cần có khách hàng để thao tác | Sẵn sàng |
| 2 | STORY-CUST-06 Kiểm tra dữ liệu | Đi liền với Story 04, chứa 2 lỗi đã được PO xác nhận | Sẵn sàng — 2 TC dự kiến FAIL (`REQ-CUST-42`, `43`) |
| 3 | STORY-CUST-01 Danh sách | Nền tảng để xác minh kết quả của Story 04 | Sẵn sàng |
| 4 | STORY-CUST-05 Billing & Shipping | Độc lập, rủi ro thấp | Sẵn sàng |
| 5 | STORY-CUST-07 Hồ sơ & chỉnh sửa | Cần khách hàng đã tạo ở Story 04 | Sẵn sàng |
| 6 | STORY-CUST-02 Tìm kiếm & lọc | Cần dữ liệu đủ đa dạng | Sẵn sàng |
| 7 | STORY-CUST-08 Trạng thái & xoá | Thao tác phá huỷ — chạy sau cùng trong nhóm CRUD, cần dữ liệu riêng | Sẵn sàng · ⚠️ `REQ-CUST-82` cần môi trường riêng, `REQ-CUST-81` cần rà 11 module |
| 8 | STORY-CUST-09 Tab phụ trợ | Rủi ro thấp, không chặn ai | Sẵn sàng |
| 9 | STORY-CUST-03 Xuất & hàng loạt | Xoá hàng loạt phải hoãn trên môi trường dùng chung | ⚠️ Một phần hoãn (`RISK-CUST-02`) |
| 10 | STORY-CUST-10 Nhập CSV | Mỗi lần chạy tạo bản ghi thật — phải dọn sau khi chạy | Sẵn sàng |

> Ma trận Phân quyền **đã gỡ BLOCKED** 19-09-2026 (`AMB-CUST-01` ✅) — 38/39 ô kiểm chứng. **Không còn Story nào BLOCKED.**

---

## 11. Điểm Mơ Hồ & Rủi Ro

### 11.1. Ambiguities

| Mã | Câu hỏi | Nguy cơ | Mức độ | Assumption tạm | Trạng thái | Kết luận |
|---|---|---|---|---|---|---|
| AMB-CUST-01 | Xin tài khoản vai trò `Project Manager` và các vai trò khác để kiểm chứng 24 ô đang bỏ trống trong ma trận phân quyền của module `CUST` | Không kiểm chứng được ranh giới quyền; rò rỉ dữ liệu khách hàng cho vai trò không được phép sẽ không bị phát hiện | 🔴 | Mọi vai trò không phải Admin **không** xoá được khách hàng và **không** thấy mục Vault mức "chỉ quản trị viên" | ✅ Đã trả lời 19-09-2026 | Tài khoản PM có sẵn trong `.env`. Kiểm chứng 19-09-2026: 38/39 ô. **Khác giả định tạm** — PM có giao diện xoá / xoá hàng loạt như Admin. Phần còn treo tách sang `AMB-CUST-14` |
| AMB-CUST-02 | Company chỉ chứa khoảng trắng (`"   "`) vượt qua kiểm tra bắt buộc và tạo được khách hàng "tên rỗng" — lỗi hay cố ý? | Danh sách sinh ra bản ghi không có tên, không tìm kiếm được, hiển thị trống ở mọi dropdown của 10+ module tham chiếu | 🔴 | Đây là **lỗi** — kiểm tra bắt buộc phải cắt khoảng trắng trước khi xét | ✅ Đã trả lời 19-09-2026 | PO: **là lỗi**. `REQ-CUST-43` đổi sang kỳ vọng đúng (🟡) — hệ thống chưa đạt, cần mở bug |
| AMB-CUST-03 | Khi lỗi bắt buộc nằm ở tab không hiển thị, hệ thống chỉ đổi màu nhãn tab mà **không** tự chuyển sang tab đó — chấp nhận được không? | Người dùng bấm Save nhiều lần mà không hiểu vì sao không lưu được; test thủ công dễ báo nhầm "nút Save hỏng" | 🔴 | Đây là **lỗi trải nghiệm** — cần tự chuyển về tab chứa lỗi đầu tiên | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm. `REQ-CUST-42` đổi sang kỳ vọng đúng (🟡) — hệ thống chưa đạt, cần mở bug |
| AMB-CUST-04 | Cảnh báo trùng tên đôi khi chặn lần bấm `Save` đầu tiên, đôi khi không — phụ thuộc việc phản hồi AJAX về kịp hay chưa | Kết quả test không ổn định; automation sẽ flaky ở đúng bước này | 🟡 | Bấm `Save` khi request kiểm tra đang chạy thì lần bấm đó bị bỏ qua, phải bấm lại | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm — ghi ở mục 5.1, automation xử lý theo `RISK-CUST-03` |
| AMB-CUST-05 | Không trường text nào khai báo `maxlength`. Giới hạn độ dài thực tế của `company`, `vat`, `phonenumber`, `website`, `city`, `state`, `zip` là bao nhiêu? | Không viết được test biên; nhập quá dài có thể gây lỗi 500 hoặc cắt dữ liệu âm thầm | 🟡 | Giới hạn theo cột CSDL (thường 191–255 ký tự); test biên tạm dùng 255 và 256 | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm: giới hạn 255 — ghi vào Đặc tả trường mục 4.1, chưa kiểm chứng |
| AMB-CUST-06 | `Website`, `Phone`, `VAT Number` đều là `type=text` không ràng buộc định dạng. Có quy tắc định dạng nào ở phía máy chủ không? | Dữ liệu bẩn đi vào hệ thống rồi lan sang hoá đơn, hợp đồng, cổng khách hàng | 🟡 | Không có kiểm tra định dạng — nhập gì cũng lưu | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm — ghi vào Đặc tả trường mục 4.1 |
| AMB-CUST-07 | Danh sách Groups có **305** mục với rất nhiều tên trùng nhau (`Information Technology` xuất hiện ~50 lần, `Platinum` ~23 lần, `LUISGR` ~28 lần). Nhóm khách hàng có được phép trùng tên không? | Người dùng không phân biệt được nhóm nào là nhóm nào; báo cáo theo nhóm sai hoàn toàn | 🟡 | Là dữ liệu rác của môi trường demo, không phải quy tắc nghiệp vụ; sản phẩm thật cần chặn trùng tên nhóm | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm. Quản trị nhóm nằm ngoài phạm vi (khu Setup) — không sinh REQ |
| AMB-CUST-08 | Cột `Stripe id` có trong tệp CSV nhập nhưng **không** có trường tương ứng trên biểu mẫu UI | Không sửa/xem được giá trị này sau khi nhập; không biết có test được không | 🟡 | Trường chỉ dùng cho tích hợp cổng thanh toán Stripe, không thuộc phạm vi test UI | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm — thêm vào **Ngoài phạm vi** mục 1 |
| AMB-CUST-09 | `Longitude` / `Latitude` nhập được (qua tab Map và CSV) nhưng bản đồ **không hiển thị** vì thiếu khoá API Google Maps | Không kiểm chứng được toạ độ nhập vào có đúng không; REQ-CUST-70 chỉ test được phần nhập liệu | 🟡 | Chấp nhận test tới mức lưu được toạ độ; phần hiển thị bản đồ ghi `Không test được` | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm — thêm vào **Ngoài phạm vi** mục 1 |
| AMB-CUST-10 | "Khách hàng Inactive không hiện trong dropdown khi tạo bản ghi mới" — cụ thể là những màn hình nào? Hoá đơn, dự án, hợp đồng, báo giá đều áp dụng chứ? | Không biết phải kiểm chứng ở bao nhiêu module; bỏ sót là để lọt lỗi rò rỉ khách hàng đã ngừng hoạt động | 🟡 | Áp dụng cho **mọi** dropdown chọn khách hàng ở tất cả module | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm → `REQ-CUST-81` (⚪) |
| AMB-CUST-11 | Xoá khách hàng **đang có** hoá đơn / dự án / hợp đồng thì hệ thống xử lý ra sao — chặn, xoá lan, hay để lại bản ghi mồ côi? | Đây là kịch bản rủi ro cao nhất của module; nếu xoá lan thì mất dữ liệu tài chính | 🔴 | Hệ thống **chặn** và báo lỗi | ✅ Đã trả lời 19-09-2026 | PO: hệ thống **chặn và báo lỗi** → `REQ-CUST-82` (⚪ — cần môi trường riêng để kiểm chứng) |
| AMB-CUST-12 | Luồng nhập CSV chưa kiểm chứng (không tải tệp lên môi trường dùng chung). Thông báo kết quả nhập, cách báo dòng lỗi, hành vi của `Simulate Import` ra sao? | `REQ-CUST-79` đang ⚪; toàn bộ STORY-CUST-10 chưa test được | 🟡 | `Simulate Import` chỉ hiển thị bản xem trước, không ghi dữ liệu | ✅ Đã trả lời 19-09-2026 | PO cho phép nhập thật 2 khách hàng trên môi trường dùng chung. `Simulate Import` không ghi dữ liệu (**trùng giả định**) → `REQ-CUST-80`; nhập thật báo `Total Imported: 2` → `REQ-CUST-79` |
| AMB-CUST-13 | Checkbox `Show primary contact full name…` bị ẩn khi khách hàng chưa có liên hệ. Điều kiện hiển thị chính xác là gì — cần ≥ 1 liên hệ, hay cần một liên hệ được đánh dấu là liên hệ chính? | Viết TC sai điều kiện tiền đề, test sẽ fail giả | 🟢 | Hiện khi khách hàng có ít nhất 1 liên hệ được đánh dấu **Primary Contact** | ✅ Đã trả lời 19-09-2026 | Chốt theo giả định tạm; kiểm chứng được vế "có 1 liên hệ chính → hiện" trên `14625` → `REQ-CUST-53` 🟡 |
| AMB-CUST-14 | Tài khoản `Project Manager` thấy link `Delete` từng dòng và `Mass Delete` trong `Bulk Actions` giống hệt Admin. (1) PM có **thực sự** được phép xoá khách hàng — kể cả xoá hàng loạt toàn bộ danh sách — không? (2) PM có xem được mục Vault mức `Visible only to administrators` không? | Nhân sự không phải quản trị viên xoá được dữ liệu mà hơn 10 module tham chiếu tới | 🟡 | Đây là **cấu hình quyền cố ý** của môi trường demo (PM được cấp đủ quyền Customers) · PM **không** thấy mục Vault mức 2 | ❓ Chờ trả lời | (1) kiểm chứng được mà không cần môi trường riêng: dùng tài khoản PM xoá `14625` hoặc `14626` (khách hàng nhập 19-09-2026) — vừa kiểm chứng vừa dọn dữ liệu. (2) cần Admin tạo 1 mục Vault mức 2 trên khách hàng test |

### 11.2. Risks

| Mã | Rủi ro | Mô tả | Mitigation |
|---|---|---|---|
| RISK-CUST-01 | Entity trung tâm, phạm vi ảnh hưởng rất rộng | Hơn 10 module tham chiếu tới khách hàng. Một thay đổi ở `CUST` có thể làm hỏng hoá đơn, dự án, hợp đồng mà bộ test của `CUST` không phát hiện | Sau mỗi lần sửa module `CUST`, chạy kèm bộ smoke của `INV`, `PRJ`, `CTR`. Ưu tiên sinh RTM để thấy rõ liên đới |
| RISK-CUST-02 | Môi trường dùng chung chứa dữ liệu thật | 1.571 khách hàng, 361 liên hệ đang hoạt động; ảnh chụp màn hình chứa email và số điện thoại thật | **Cấm** xoá hàng loạt và xoá bản ghi không phải do mình tạo. Mọi bản ghi test dùng tiền tố `auto_recon_` + dấu thời gian và **phải xoá sau khi chạy**. Không commit ảnh evidence lên repo công khai |
| RISK-CUST-03 | Kiểm tra trùng tên gây test không ổn định | Kiểm tra chạy bất đồng bộ khi rời ô `company`; bấm `Save` quá nhanh thì lần bấm đầu bị nuốt (xem `AMB-CUST-04`) | Automation phải chờ request `check_duplicate_customer_name` kết thúc trước khi bấm `Save`; **không** dùng hard sleep mà chờ theo trạng thái phản hồi |
| RISK-CUST-04 | Dữ liệu chuẩn nằm sau khu Setup bị 403 | Danh sách nhóm khách hàng (305), tiền tệ (2), quốc gia (251) đến từ bảng chuẩn không xem/sửa được bằng tài khoản hiện tại | Giả định danh sách cố định trong đợt test; nếu số lượng option thay đổi giữa các lần chạy thì đó là dữ liệu bị người khác sửa, không phải lỗi sản phẩm |
| RISK-CUST-05 | Bảng nạp bất đồng bộ dễ gây khẳng định sai | Mọi thao tác lọc/tìm/phân trang đều đi qua `POST /admin/clients/table`; đọc DOM ngay sau thao tác sẽ thấy dữ liệu cũ | Chờ theo dòng trạng thái `Showing … entries` đổi giá trị hoặc chờ request kết thúc; **không** đọc bảng ngay sau khi gõ |
| RISK-CUST-06 | Thao tác xoá dùng GET | `GET /admin/clients/delete/{id}` xoá ngay, không cần xác nhận khi mở thẳng URL. Trình duyệt, trình thu thập hoặc một cú dán URL nhầm đều có thể xoá dữ liệu thật | **Cấm** đưa URL xoá vào bất kỳ bước điều hướng nào của automation. Chỉ xoá qua nút `Delete` + hộp thoại xác nhận, và chỉ với bản ghi do test tạo ra |
| RISK-CUST-07 | Thuộc tính HTML `checked` không phản ánh trạng thái thật của công tắc Active | Sau khi gạt công tắc, thuộc tính `checked` trong HTML **vẫn còn** trong khi thuộc tính DOM `.checked` đã là `false` | Automation phải đọc **property** `.checked`, tuyệt đối không đọc `getAttribute('checked')` hay so khớp chuỗi HTML |
| RISK-CUST-08 | Nhân sự không phải quản trị viên có giao diện xoá hàng loạt | Tài khoản `Project Manager` thấy `Mass Delete` trong `Bulk Actions` và link `Delete` trên mọi dòng (2.031 khách hàng). Nếu quyền phía server cũng mở thì một thao tác nhầm của PM xoá được dữ liệu mà hơn 10 module tham chiếu (xem `AMB-CUST-14`) | Không chạy `Mass Delete` bằng bất kỳ tài khoản nào trên môi trường dùng chung. Kiểm chứng quyền xoá của PM chỉ trên bản ghi do test tạo ra. Đề xuất PO rà lại cấu hình vai trò PM |

---

## 12. Danh mục Evidence

Ảnh đợt 14-08-2026 chụp full-page; ảnh đợt 19-09-2026 chụp **viewport** (đối tượng nằm trọn trong vùng nhìn). Lưu tại [`evidence/`](evidence/).

| Tệp | Màn hình | Trạng thái | REQ làm bằng chứng |
|---|---|---|---|
| [cust_list_default_fullpage.png](evidence/cust_list_default_fullpage.png) | Danh sách khách hàng | Mặc định, có dữ liệu, 25 dòng/trang | REQ-CUST-01 → 10 |
| [cust_list_export_menu_fullpage.png](evidence/cust_list_export_menu_fullpage.png) | Danh sách khách hàng | Menu Export đang mở | REQ-CUST-18 |
| [cust_list_bulk_actions_modal_fullpage.png](evidence/cust_list_bulk_actions_modal_fullpage.png) | Danh sách khách hàng | Hộp thoại Bulk Actions đang mở | REQ-CUST-21, 22 |
| [cust_list_saved_filters_dropdown_fullpage.png](evidence/cust_list_saved_filters_dropdown_fullpage.png) | Danh sách khách hàng | Dropdown bộ lọc đã lưu đang mở | REQ-CUST-17 |
| [cust_list_create_filter_modal_fullpage.png](evidence/cust_list_create_filter_modal_fullpage.png) | Danh sách khách hàng | Hộp thoại Create Filter đang mở | REQ-CUST-14, 15, 16 |
| [cust_list_active_toggle_inactive_fullpage.png](evidence/cust_list_active_toggle_inactive_fullpage.png) | Danh sách khách hàng | Sau khi gạt công tắc sang Inactive | REQ-CUST-57, 59 |
| [cust_new_form_default_fullpage.png](evidence/cust_new_form_default_fullpage.png) | Thêm khách hàng | Mặc định, tab Customer Details | REQ-CUST-23 → 32 |
| [cust_new_form_billing_shipping_tab_fullpage.png](evidence/cust_new_form_billing_shipping_tab_fullpage.png) | Thêm khách hàng | Tab Billing & Shipping, rỗng | REQ-CUST-35, 36, 39 |
| [cust_new_form_billing_shipping_filled_fullpage.png](evidence/cust_new_form_billing_shipping_filled_fullpage.png) | Thêm khách hàng | Tab Billing & Shipping sau khi sao chép 2 lần | REQ-CUST-37, 38 |
| [cust_new_form_company_required_error_fullpage.png](evidence/cust_new_form_company_required_error_fullpage.png) | Thêm khách hàng | Company rỗng, lỗi hiển thị trên tab đang xem | REQ-CUST-40, 41 |
| [cust_new_form_required_error_hidden_tab_fullpage.png](evidence/cust_new_form_required_error_hidden_tab_fullpage.png) | Thêm khách hàng | Lỗi ở tab ẩn — vẫn đứng ở tab Billing & Shipping | REQ-CUST-42 · `AMB-CUST-03` |
| [cust_new_form_duplicate_name_warning_fullpage.png](evidence/cust_new_form_duplicate_name_warning_fullpage.png) | Thêm khách hàng | Cảnh báo trùng tên với Company toàn khoảng trắng | REQ-CUST-43, 44 · `AMB-CUST-02` |
| [cust_new_form_duplicate_name_warning_named_fullpage.png](evidence/cust_new_form_duplicate_name_warning_named_fullpage.png) | Thêm khách hàng | Cảnh báo trùng tên hiển thị đúng tên công ty | REQ-CUST-44, 45 |
| [cust_save_and_create_contact_result_fullpage.png](evidence/cust_save_and_create_contact_result_fullpage.png) | Hồ sơ khách hàng | Sau "Save and create contact" — modal Add new contact tự mở | REQ-CUST-34 |
| [cust_detail_after_create_profile_tab_fullpage.png](evidence/cust_detail_after_create_profile_tab_fullpage.png) | Hồ sơ khách hàng | Tab Profile, thấy đủ 19 tab và dữ liệu đã lưu | REQ-CUST-47 → 52 |
| [cust_detail_customer_admins_tab_fullpage.png](evidence/cust_detail_customer_admins_tab_fullpage.png) | Hồ sơ khách hàng | Tab Customer Admins, chưa có bản ghi | REQ-CUST-54, 55 |
| [cust_detail_statement_tab_fullpage.png](evidence/cust_detail_statement_tab_fullpage.png) | Hồ sơ khách hàng | Tab Statement, kỳ This Month | REQ-CUST-64, 65, 66 |
| [cust_detail_vault_tab_fullpage.png](evidence/cust_detail_vault_tab_fullpage.png) | Hồ sơ khách hàng | Tab Vault, trạng thái rỗng | REQ-CUST-67, 68, 69 |
| [cust_detail_map_tab_fullpage.png](evidence/cust_detail_map_tab_fullpage.png) | Hồ sơ khách hàng | Tab Map, thiếu khoá API Google | REQ-CUST-70 · `AMB-CUST-09` |
| [cust_import_form_default_fullpage.png](evidence/cust_import_form_default_fullpage.png) | Nhập từ CSV | Mặc định, thấy đủ 4 hướng dẫn và bảng 27 cột | REQ-CUST-72 → 75, 77, 78 |
| [cust_import_file_required_error_fullpage.png](evidence/cust_import_file_required_error_fullpage.png) | Nhập từ CSV | Bấm Import khi chưa chọn tệp | REQ-CUST-76 |
| [cust_import_simulate_result.png](evidence/cust_import_simulate_result.png) | Nhập từ CSV | Sau `Simulate Import` tệp 3 dòng (dòng 3 trùng email dòng 1) — viewport, 19-09-2026 | REQ-CUST-80 · `AMB-CUST-12` |
| [cust_import_result_2_rows_in_list.png](evidence/cust_import_result_2_rows_in_list.png) | Danh sách khách hàng | Lọc theo tiền tố nhập — đúng 2 khách hàng `14625`, `14626`, Active, tổng 2.031 — viewport, 19-09-2026 | REQ-CUST-79 · `AMB-CUST-12` |
| [cust_detail_show_primary_contact_visible.png](evidence/cust_detail_show_primary_contact_visible.png) | Hồ sơ khách hàng (PM) | Khách hàng có 1 liên hệ chính — checkbox `Show primary contact…` hiển thị · cột trái 15 tab — viewport, 19-09-2026 | REQ-CUST-53, 83 · `AMB-CUST-13` |
| [cust_perm_pm_list.png](evidence/cust_perm_pm_list.png) | Danh sách khách hàng (PM) | Đăng nhập PM — có `New Customer`, `Import Customers`, `Export`, `Bulk Actions`, công tắc Active — viewport, 19-09-2026 | Mục 6 · `AMB-CUST-01` |
| [cust_perm_pm_bulk_actions_mass_delete.png](evidence/cust_perm_pm_bulk_actions_mass_delete.png) | Danh sách khách hàng (PM) | Modal `Bulk Actions` mở dưới quyền PM, có `Mass Delete` — **không** bấm Confirm — viewport, 19-09-2026 | Mục 6 · `AMB-CUST-14` · `RISK-CUST-08` |

**Dữ kiện đọc trực tiếp từ DOM** (ảnh không thể hiện được, đã chép số liệu vào Acceptance Criteria): số option của `groups_in[]` (305) · `default_currency` (3) · `default_language` (27) · `country`/`billing_country`/`shipping_country` (251) · `customer_admins[]` (3) · dropdown tiêu chí lọc (15) · dropdown số dòng (5, `All` = `-1`) · thuộc tính `autofocus` của `#company` · `multiple` của các select · trạng thái ẩn/hiện của `#show_primary_contact` · chú giải của công tắc Active và biểu tượng Shipping Address · thuộc tính `checked` không đổi sau khi gạt công tắc.

**Dữ kiện lấy từ tầng network:** `POST /admin/clients/table` (tham số DataTables) · `POST /admin/clients/check_duplicate_customer_name` (nguyên văn JSON phản hồi) · `GET /admin/clients/change_client_status/{id}/{0|1}` · `GET /admin/clients/delete/{id}`. Toàn bộ đều là **quan sát thụ động** request do UI tự phát sinh — không gọi API trực tiếp.

---

## 13. Nhật ký Thay đổi

| Ngày | Nguồn | REQ ảnh hưởng | Loại | Tóm tắt thay đổi | TC cần xử lý |
|---|---|---|---|---|---|
| 19-09-2026 | `PO-2026-09-19` | REQ-CUST-42, 43 | 🟡 Sửa | PO chốt `AMB-CUST-02` là lỗi, `AMB-CUST-03` theo giả định — hai REQ đổi từ mô tả hành vi thực tế sang **kỳ vọng đúng**. Hệ thống hiện chưa đạt → cần mở bug | ➕ Viết mới — **dự kiến FAIL** |
| 19-09-2026 | `PO-2026-09-19` | REQ-CUST-53, 73, 79 | 🟡 Sửa | `53`: chốt điều kiện hiển thị checkbox (`AMB-CUST-13`), kiểm chứng vế có liên hệ chính. `73`: ngày ví dụ trong hướng dẫn là ngày hiện tại, không cố định. `79`: ⚪ → kiểm chứng nhập thật, `Total Imported: {n}` (`AMB-CUST-12`) | ➕ Viết mới |
| 19-09-2026 | `PO-2026-09-19` | REQ-CUST-80, 83 | 🟢 Thêm | `80`: `Simulate Import` không ghi dữ liệu, không đánh dấu dòng trùng email. `83`: PM thấy 15/19 tab hồ sơ | ➕ Viết mới |
| 19-09-2026 | `PO-2026-09-19` | REQ-CUST-81, 82 | ⚪ Thêm | Quyết định PO chưa kiểm chứng được: `81` loại khách hàng Inactive khỏi mọi dropdown (`AMB-CUST-10`) · `82` chặn xoá khách hàng có dữ liệu liên quan (`AMB-CUST-11`) | ➕ Viết mới, gắn `assumption-based` |
| 19-09-2026 | `PO-2026-09-19` | REQ-CUST-48 · mục 1, 4.1, 5, 5.1, 6, 7 | ✏️ Biên tập | `48` ghi rõ 19 tab là góc nhìn Admin. Ngoài phạm vi thêm `Stripe id` và hiển thị bản đồ (`AMB-CUST-08`, `09`). Đặc tả trường thêm giới hạn 255 và không kiểm định dạng (`AMB-CUST-05`, `06`). **Ma trận phân quyền dựng lại** bằng tài khoản PM: 38/39 ô (`AMB-CUST-01`) — PM có giao diện xoá / xoá hàng loạt → `AMB-CUST-14` (mới) + `RISK-CUST-08` (mới). `AMB-CUST-04`, `07` chốt theo giả định, không đổi REQ. **12/13 AMB đóng**, còn treo 1 (`AMB-CUST-14`). Dữ liệu tạo ra: khách hàng `14625`, `14626` — ⚠️ **chưa dọn**. Impact Report: [impact/impact_PO-2026-09-19.md](impact/impact_PO-2026-09-19.md) | — |
| 14-08-2026 | UI recon | REQ-CUST-01 → 79 | 🟢 Thêm | Khởi tạo tài liệu từ khảo sát UI thực tế, đọc DOM và tầng network. 79 REQ · 10 Story · 13 AMB (3 mức 🔴) · 7 RISK · 21 ảnh evidence. Đã tạo 3 khách hàng thử nghiệm và xoá sạch sau khi khảo sát | — (viết TC mới) |
