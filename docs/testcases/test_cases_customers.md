# Manual Test Cases — Module Customers (Perfex CRM)

| Thông tin | Nội dung |
|---|---|
| Hệ thống | CRM (Perfex CRM — Anh Tester Demo) |
| Module | Customers (Khách hàng) |
| URL | https://crm.anhtester.com/admin/clients |
| Nguồn requirement | [requirements_customers.md](../requirements/requirements_customers.md) — 53 REQ (REQ-CUST-01 → 53) |
| Mode sinh TC | QUICK (skill `skills-rbt-manual-testing`) |
| Tài khoản test | `admin@example.com` / `123456` (role Administrator) |
| Tổng số TC | **96** (Critical: 12 · High: 30 · Medium: 39 · Low: 15) |
| Ngày tạo | 2026-08-02 |
| Phiên bản | 1.0 |

> ⚠️ **Lưu ý môi trường (RISK-01, RISK-02):** `crm.anhtester.com` là môi trường demo **dùng chung**. Mọi TC tạo dữ liệu **bắt buộc** dùng tiền tố traceable `Auto_Customer_<timestamp>` / `auto_contact_<timestamp>@auto.test` và **phải xoá sạch sau khi chạy**. TUYỆT ĐỐI KHÔNG dùng "Select All" và KHÔNG thực thi Mass Delete trên môi trường này.

> 📌 **Quy ước dữ liệu:** timestamp mẫu trong tài liệu là `1785700123`. Khi chạy thật, thay bằng timestamp thời điểm chạy để đảm bảo unique.

---

## 1. Assumptions (Giả định đã áp dụng)

QUICK mode không dừng hỏi Q&A — mọi điểm mơ hồ được xử lý bằng giả định dưới đây. Cần PO/BA xác nhận trước khi baseline bộ TC.

| ASM ID | Điểm chưa rõ (nguồn) | Giả định đã áp dụng | TC bị ảnh hưởng |
|---|---|---|---|
| ASM-01 | Company chỉ bắt buộc phía client; server vẫn tạo được bản ghi rỗng (AMB-01 · 🔴 High) | **Coi là khiếm khuyết thiếu validation server.** TC tầng UI assert lỗi inline `This field is required.` (TC_020). TC tầng API (TC_021) ghi nhận hành vi hiện tại và gắn nhãn `@KnownIssue` — KHÔNG để fail liên tục | TC_020, TC_021 |
| ASM-02 | Trùng tên Company có phải chủ đích nghiệp vụ? (AMB-02) | **Trùng tên là hành vi ĐÚNG** theo REQ-CUST-18 → TC assert tạo thành công với ID mới | TC_024 |
| ASM-03 | Phone / Website / VAT / Zip là `text` thuần, không ràng buộc định dạng (AMB-03) | **Không có ràng buộc định dạng** — mọi chuỗi đều được chấp nhận và lưu nguyên văn. TC assert giá trị hiển thị lại đúng nguyên văn sau khi lưu, KHÔNG kỳ vọng lỗi | TC_030, TC_032, TC_034, TC_040 |
| ASM-04 | Độ dài tối đa các trường không khai báo `maxlength` (AMB-04) | **Giới hạn theo schema CSDL (`VARCHAR(255)`)**. Chỉ chạy **thủ công 1 lần** TC thăm dò 255/256 ký tự để tránh sinh dữ liệu rác → `Automatable = No`. Không đưa vào bộ regression tự động cho tới khi dev xác nhận | TC_026, TC_027 |
| ASM-05 | Profile image không khai báo `accept` (AMB-05) | **Chỉ chấp nhận ảnh thông dụng (jpg/png/gif)** và tệp thực thi bị chặn ở tầng server. TC upload `.exe` là TC **thăm dò** — nếu hệ thống chấp nhận thì là lỗ hổng bảo mật, phải mở bug | TC_072, TC_073 |
| ASM-06 | Chưa có tài khoản Staff quyền hạn chế (AMB-06 · 🔴 High) | **Không sinh TC ma trận phân quyền theo role.** Ma trận áp dụng là **trạng thái xác thực** (Khách chưa đăng nhập / Administrator) | TC_090, TC_091 · Gap #1 |
| ASM-07 | Xoá khách hàng đang có hoá đơn/dự án/hợp đồng (AMB-07 · 🔴 High) | **Chỉ test xoá khách hàng do chính test tạo, chưa phát sinh dữ liệu liên quan.** Nhánh xoá khách hàng có ràng buộc **loại khỏi phạm vi** | TC_055 → TC_058 · Gap #2 |
| ASM-08 | Quy tắc Mass Delete (AMB-08 · 🔴 High) | **KHÔNG thực thi xoá hàng loạt** trên môi trường dùng chung. Chỉ sinh TC kiểm tra modal Bulk Actions hiển thị đúng lựa chọn rồi **đóng modal** — `Automatable = No` | TC_015 · Gap #3 |
| ASM-09 | Tác động khác của trạng thái Inactive (AMB-09) | **Chỉ đúng theo tooltip nguyên văn**: `Won't be shown in dropdowns when creating new records`. Không assert việc liên hệ đăng nhập Client Portal hay nhận email | TC_017, TC_018 |
| ASM-10 | Groups có 305 mục nhiều tên trùng (AMB-10) | **Không chặn trùng tên nhóm.** Mọi TC chọn nhóm phải chọn theo `value` (ID nhóm); TC cần nhóm cụ thể thì **tự tạo nhóm traceable** rồi xoá sau | TC_035, TC_036, TC_037 |
| ASM-11 | Bảng tổng quan chỉ cập nhật khi tải lại trang (AMB-11) | **Là hành vi hiện tại** theo REQ-CUST-03 → mọi TC assert số liệu đều có bước **tải lại trang** trước khi assert | TC_004, TC_005, TC_017 |
| ASM-12 | Password của liên hệ không có ràng buộc độ dài tối thiểu phía client | **Không có min length ở tầng client** → nhập 1 ký tự vẫn submit được. Ghi nhận là điểm yếu bảo mật cần dev xác nhận | TC_069 |
| ASM-13 | Ô Search của DataTables khớp kiểu gì? | **Khớp một phần (partial match), không phân biệt hoa/thường**, tìm trên nhiều cột (Company, Email, Phone) | TC_006 → TC_009 |
| ASM-14 | Email liên hệ đã bị xoá có được dùng lại không? | **Được dùng lại** — kiểm tra trùng chỉ áp dụng với liên hệ đang tồn tại | TC_066 |
| ASM-15 | Import CSV chạy đồng bộ và trả về trang kết quả | **Chạy đồng bộ**, sau submit chuyển về trang kết quả/danh sách. Chỉ test tệp **≤ 3 dòng** để hạn chế dữ liệu rác | TC_078 → TC_086 |

---

## 2. Kỹ Thuật Thiết Kế Đã Áp Dụng

### 2.1. Decision Table — Kết quả lưu Liên hệ (4 điều kiện kết hợp)

Bắt buộc lập vì ≥3 điều kiện cùng ảnh hưởng đến 1 output (liên hệ có được tạo hay không).

| Rule | First+Last Name có giá trị | Email đúng định dạng | Email chưa tồn tại | Password có giá trị HOẶC tick `Send SET password email` | → Kết quả quan sát được | TC |
|---|---|---|---|---|---|---|
| R1 | Yes | Yes | Yes | Yes (nhập password) | Tạo thành công, modal đóng, dòng mới `Active = Yes` | TC_060 |
| R2 | Yes | Yes | Yes | Yes (tick gửi email đặt MK, ô Password bị ẩn) | Tạo thành công, không cần nhập password | TC_061 |
| R3 | Yes | Yes | Yes | No (không nhập, không tick) | `This field is required.` tại `#password-error` | TC_068 |
| R4 | Yes | Yes | No (email trùng) | Yes | `Email already exists` tại `#email-error`, không lưu | TC_065 |
| R5 | Yes | No (sai định dạng) | — | Yes | `Please enter a valid email address.` | TC_064 |
| R6 | Yes | — (rỗng) | — | Yes | `This field is required.` tại `#email-error` | TC_063 |
| R7 | No (thiếu First hoặc Last) | Yes | Yes | Yes | `This field is required.` tại `#firstname-error` / `#lastname-error` | TC_062a/b (TC_062, TC_062B) |
| R8 | No (rỗng toàn bộ) | No (rỗng) | — | No | Hiển thị đồng thời 4 lỗi required | TC_067 |

> Quan sát quan trọng: **kiểm tra trùng email là AJAX bất đồng bộ** (RISK-07) → mọi TC ở R4 phải chờ đúng chuỗi `Email already exists` xuất hiện trong `#email-error`, không assert ngay sau khi gõ.

### 2.2. Decision Table — Hiển thị liên kết thao tác nhanh trên dòng danh sách (REQ-CUST-11)

| Rule | Hover vào tên công ty | Khách hàng đã có liên hệ | → Liên kết hiển thị | TC |
|---|---|---|---|---|
| R1 | Yes | No | `View` \| `Delete` | TC_012 |
| R2 | Yes | Yes | `View` \| `Contacts` \| `Delete` | TC_013 |
| R3 | No | — | Không hiển thị liên kết nào | TC_012 (bước 2) |

### 2.3. State Transition — Trạng thái Khách hàng

| Từ \ Hành động | Tạo mới hợp lệ | Tắt công tắc Active | Bật công tắc Active | Xoá (đơn lẻ) | Truy cập lại ID |
|---|---|---|---|---|---|
| **(chưa tồn tại)** | ✅ → Active — TC_022 | — | — | — | ⛔ 404 — TC_057 |
| **Active** | — | ✅ → Inactive — TC_017 | — (đã Active) | ✅ → Đã xoá — TC_056 | ✅ mở được — TC_051 |
| **Inactive** | — | — (đã Inactive) | ✅ → Active — TC_018 | ✅ → Đã xoá — TC_058 | ✅ mở được — TC_018 |
| **Đã xoá** | — | ⛔ không còn trên danh sách — TC_057 | ⛔ | ⛔ | ⛔ 404 — TC_057 |

Mọi ô ✅ và ⛔ ở trên đều đã có TC tương ứng.

### 2.4. State Transition — Trạng thái Liên hệ

| Từ \ Hành động | Tạo liên hệ hợp lệ | Tắt trạng thái Active | Xoá khách hàng chủ quản |
|---|---|---|---|
| **(chưa tồn tại)** | ✅ → Active (`Active = Yes`) — TC_060 | — | — |
| **Active** | — | ✅ → Inactive — TC_075 | ✅ → Đã xoá theo — TC_059 |
| **Inactive** | — | — | ✅ → Đã xoá theo — TC_059 |

### 2.5. EP + BVA — Trường Company (giới hạn 255 ký tự theo ASM-04)

| Partition | Đại diện | Kỳ vọng | TC |
|---|---|---|---|
| Rỗng | `""` | `This field is required.` (inline) | TC_020 |
| Chỉ khoảng trắng | `"   "` (3 space) | Chưa rõ — ghi nhận hành vi thực tế | TC_025 |
| 1 ký tự (min) | `A` | Lưu thành công | TC_028 |
| Chuỗi thường (typical) | `Auto_Customer_1785700123` | Lưu thành công | TC_022 |
| 255 ký tự (max) | `A`×255 | Lưu thành công, hiển thị đủ 255 ký tự | TC_026 |
| 256 ký tự (max+1) | `A`×256 | Bị cắt còn 255 HOẶC báo lỗi — ghi nhận hành vi | TC_027 |

### 2.6. Danh Sách Fields & Bao Phủ Validation

**Form Khách hàng — tab Customer Details (13 field)**

| # | Field | Loại | Positive TC | Negative/Boundary TC | Tổng |
|---|---|---|---|---|---|
| 1 | Company | Text | TC_022, TC_028 | TC_020, TC_021, TC_023, TC_025, TC_026, TC_027, TC_029 | 9 |
| 2 | VAT Number | Text | TC_030 | TC_031 | 2 |
| 3 | Phone | Text | TC_032 | TC_033 | 2 |
| 4 | Website | Text | TC_034 | TC_031 (dùng chung XSS) | 2 |
| 5 | Groups | Multi-select | TC_035 | TC_036, TC_037 | 3 |
| 6 | Currency | Dropdown | TC_038 | TC_038 (verify đúng 3 option) | 1 |
| 7 | Default Language | Dropdown | TC_039 | TC_039 (verify mặc định) | 1 |
| 8 | Address | Textarea | TC_040 | TC_041 | 2 |
| 9 | City | Text | TC_040 | TC_042 (Unicode) | 2 |
| 10 | State | Text | TC_040 | TC_042 (Unicode) | 2 |
| 11 | Zip Code | Text | TC_040 | TC_043 | 2 |
| 12 | Country | Dropdown | TC_044 | TC_045 | 2 |
| 13 | Show primary contact… | Checkbox | TC_046 | TC_046 (verify mặc định không tick) | 1 |

**Form Khách hàng — tab Billing & Shipping (10 field):** phủ theo bộ tại TC_047 → TC_050.

**Modal Liên hệ (14 nhóm field)**

| # | Field | Loại | Positive TC | Negative/Boundary TC | Tổng |
|---|---|---|---|---|---|
| 1 | Profile image | File | TC_071 | TC_072, TC_073 | 3 |
| 2 | First Name | Text | TC_060 | TC_062, TC_067, TC_074 | 4 |
| 3 | Last Name | Text | TC_060 | TC_062B, TC_067 | 3 |
| 4 | Position | Text | TC_060 | TC_074 (Unicode) | 2 |
| 5 | Email | Email | TC_060, TC_066 | TC_063, TC_064, TC_064B, TC_065, TC_067 | 7 |
| 6 | Phone (liên hệ) | Text | TC_060 | TC_033 (chung quy tắc) | 2 |
| 7 | Direction | Dropdown | TC_076 | TC_076 (verify 3 option) | 1 |
| 8 | Password | Password | TC_060 | TC_068, TC_069, TC_070 | 4 |
| 9 | Primary Contact | Checkbox | TC_077 | TC_077 (verify mặc định tick) | 1 |
| 10 | Do not send welcome email | Checkbox | TC_061B | — | 1 |
| 11 | Send SET password email | Checkbox | TC_061 | TC_070 | 2 |
| 12 | Permissions (6 công tắc) | Checkbox | TC_078 | TC_079 | 2 |
| 13 | Email Notifications (7 công tắc) | Checkbox | TC_080 | TC_080 | 1 |

**Form Import (3 field):** phủ tại TC_081 → TC_089.

---
