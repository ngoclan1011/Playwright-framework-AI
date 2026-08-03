# Manual Test Cases — Module Customers (Perfex CRM) · INDEX v2.0

| Thông tin | Nội dung |
|---|---|
| Hệ thống | CRM (Perfex CRM — Anh Tester Demo) |
| Module | Customers (Khách hàng) |
| URL | https://crm.anhtester.com/admin/clients |
| Nguồn requirement | [requirements_customers.md](../../requirements/customers/requirements_customers.md) — 53 REQ (REQ-CUST-01 → 53) |
| Mode sinh TC | QUICK (skill `skills-rbt-manual-testing`) |
| Tài khoản test | `admin@example.com` / `123456` (role Administrator) |
| **Tổng số TC** | **140** — Critical 13 · High 32 · Medium 79 · Low 16 |
| Khả năng tự động hoá | Automatable `Yes` 119 · `Partial` 15 · `No` 6 |
| Số file | 4 part + 1 index |
| Ngày tạo | 2026-08-02 |
| Phiên bản | **2.0** — bản sinh **độc lập** để đối chiếu với [v1.0 (99 TC)](archive/test_cases_customers_v1.md). Hai bản không thay thế nhau cho tới khi chọn xong bản giữ lại |

> ⚠️ **Lưu ý môi trường (RISK-01, RISK-02):** `crm.anhtester.com` là môi trường demo **dùng chung**. Mọi TC tạo dữ liệu **bắt buộc** dùng tiền tố traceable `Auto_Customer_<timestamp>` / `auto_contact_<timestamp>@auto.test` và **phải xoá sạch sau khi chạy**. TUYỆT ĐỐI KHÔNG dùng "Select All", KHÔNG thực thi Mass Delete.
> 📌 **Quy ước dữ liệu:** timestamp mẫu trong tài liệu là `1785700456` → `1785700524`. Khi chạy thật, thay bằng timestamp thời điểm chạy để đảm bảo unique.

---

## 1. Cấu trúc file

| File | Nhóm chức năng | Số TC | TC ID range | REQ bao phủ |
|---|---|---|---|---|
| [Part 1](parts/part_01_danh_sach.md) | Danh sách khách hàng: hiển thị, thống kê, tìm kiếm, phân trang, bộ lọc, xuất dữ liệu, bulk actions, trạng thái Active | 36 | `CRM_CUST_TC_001` → `036` | REQ-CUST-01 → 13 |
| [Part 2](parts/part_02_tao_sua.md) | Form tạo/sửa khách hàng + validation riêng từng trường (Company, VAT, Phone, Website, Groups, Currency, Language, Country, Address, Zip, Checkbox) | 40 | `CRM_CUST_TC_037` → `076` | REQ-CUST-14 → 24, 26 |
| [Part 3](parts/part_03_chi_tiet_contacts.md) | Billing & Shipping, CSRF, trang chi tiết, xoá khách hàng, quản lý liên hệ (validation, phân quyền, thông báo email) | 40 | `CRM_CUST_TC_077` → `116` | REQ-CUST-25, 27 → 46 |
| [Part 4](parts/part_04_import_nfr.md) | Nhập khẩu CSV, kiểm soát truy cập, phiên làm việc, race condition, khả năng tiếp cận, HTTPS | 24 | `CRM_CUST_TC_117` → `140` | REQ-CUST-47 → 53 + phi chức năng |

---

## 2. Assumptions (Giả định đã áp dụng)

QUICK mode không dừng hỏi Q&A — mọi điểm mơ hồ được xử lý bằng giả định dưới đây. **Cần PO/BA xác nhận trước khi baseline bộ TC.**

| ASM ID | Điểm chưa rõ (nguồn) | Giả định đã áp dụng | TC bị ảnh hưởng |
|---|---|---|---|
| ASM-01 | Company chỉ bắt buộc phía client; server vẫn tạo được bản ghi rỗng (AMB-01 · 🔴 High) | **Coi là khiếm khuyết thiếu validation phía server.** TC tầng UI assert lỗi inline `This field is required.`; nhánh API/import ghi nhận hành vi hiện tại và mở bug thay vì để test fail liên tục | TC_042, TC_043, TC_123 |
| ASM-02 | Trùng tên Company có phải chủ đích nghiệp vụ? (AMB-02) | **Trùng tên là hành vi ĐÚNG** theo REQ-CUST-18 → TC assert tạo thành công với ID mới | TC_045 |
| ASM-03 | Phone / Website / VAT / Zip là `text` thuần, không ràng buộc định dạng (AMB-03) | **Không có ràng buộc định dạng** — mọi chuỗi đều được chấp nhận và lưu nguyên văn. TC assert giá trị hiển thị lại đúng nguyên văn, KHÔNG kỳ vọng lỗi | TC_055, TC_057, TC_058, TC_060, TC_074 |
| ASM-04 | Độ dài tối đa các trường không khai báo `maxlength` (AMB-04) | **Giới hạn theo schema CSDL (`VARCHAR(255)`)**. TC biên 255/256 ký tự chỉ **chạy thủ công 1 lần** để tránh sinh dữ liệu rác → `Automatable = No` | TC_052, TC_053 |
| ASM-05 | Profile image không khai báo `accept` (AMB-05) | **Chỉ chấp nhận ảnh thông dụng (jpg/png/gif)**, tệp thực thi bị chặn ở tầng server. TC upload `.exe` là TC **thăm dò** — nếu hệ thống chấp nhận thì là lỗ hổng bảo mật, phải mở bug | TC_113, TC_114 |
| ASM-06 | Chưa có tài khoản Staff quyền hạn chế (AMB-06 · 🔴 High) | **Không sinh TC ma trận phân quyền theo role nhân viên.** Ma trận áp dụng được là **trạng thái xác thực** (chưa đăng nhập / Administrator) | TC_129, TC_130 · **Gap #1** |
| ASM-07 | Xoá khách hàng đang có hoá đơn/dự án/hợp đồng (AMB-07 · 🔴 High) | **Chỉ test xoá khách hàng do chính test tạo, chưa phát sinh dữ liệu liên quan.** Nhánh xoá khách hàng có ràng buộc **loại khỏi phạm vi** | TC_085 → TC_089 · **Gap #2** |
| ASM-08 | Quy tắc Mass Delete (AMB-08 · 🔴 High) | **KHÔNG thực thi xoá hàng loạt** trên môi trường dùng chung. Chỉ sinh TC kiểm tra modal Bulk Actions hiển thị đúng lựa chọn rồi đóng modal — `Automatable = No` | TC_030, TC_031 · **Gap #3** |
| ASM-09 | Tác động khác của trạng thái Inactive (AMB-09) | **Chỉ đúng theo tooltip nguyên văn**: `Won't be shown in dropdowns when creating new records`. Không assert việc liên hệ đăng nhập Client Portal hay nhận email | TC_036 |
| ASM-10 | Groups có 305 mục, nhiều tên trùng (AMB-10) | **Không chặn trùng tên nhóm.** Mọi TC chọn nhóm phải chọn theo `value` (ID nhóm); TC cần nhóm cụ thể thì tự tạo nhóm traceable rồi xoá sau | TC_062, TC_063, TC_064, TC_127 |
| ASM-11 | Bảng tổng quan chỉ cập nhật khi tải lại trang (AMB-11) | **Là hành vi hiện tại** theo REQ-CUST-03 → mọi TC assert số liệu đều có bước **tải lại trang** trước khi assert | TC_004, TC_005, TC_006, TC_035 |
| ASM-12 | Password liên hệ không có ràng buộc độ dài tối thiểu phía client | **Không có min length ở tầng client** → nhập 1 ký tự vẫn submit được. Ghi nhận là điểm yếu bảo mật cần dev xác nhận | TC_105 |
| ASM-13 | Ô Search của DataTables khớp kiểu gì? | **Khớp một phần (partial match), không phân biệt hoa/thường**, tìm trên nhiều cột | TC_007 → TC_009 |
| ASM-14 | Email liên hệ đã bị xoá có được dùng lại không? | **Được dùng lại** — kiểm tra trùng chỉ áp dụng với liên hệ đang tồn tại | TC_101 |
| ASM-15 | Bộ lọc nâng cao có được giữ sau khi tải lại trang không? | **Chưa xác định** — TC_025 viết ở dạng **ghi nhận hành vi làm baseline**, cả hai kết quả đều PASS ở lần chạy đầu; lần chạy sau phải khớp baseline | TC_025 |
| ASM-16 | Hành vi khi sửa đồng thời 1 khách hàng trên 2 tab | **Last-write-wins** (bản lưu sau ghi đè bản lưu trước), không có cảnh báo xung đột | TC_135 |

---

## 3. Bảng Đối Soát Coverage (Tiêu chí 6 — Quality Gate)

**Kết quả: 53/53 REQ đều có ≥1 TC — không có dòng 🔴.**

| REQ ID | Mô tả ngắn | Số TC | TC IDs | Đủ Positive/Negative/Boundary? |
|---|---|---|---|---|
| REQ-CUST-01 | Hiển thị danh sách 9 cột | 1 | TC_001 | ✅ Positive (TC hiển thị cấu trúc) |
| REQ-CUST-02 | Bảng thống kê 6 chỉ số | 2 | TC_002, TC_003 | ✅ |
| REQ-CUST-03 | Chỉ số cập nhật theo dữ liệu | 3 | TC_004, TC_005, TC_006 | ✅ |
| REQ-CUST-04 | Tìm kiếm khách hàng | 9 | TC_007→TC_014, TC_028 | ✅ Pos + Neg + Boundary + Security |
| REQ-CUST-05 | Phân trang & số dòng | 6 | TC_015→TC_020 | ✅ Pos + Boundary |
| REQ-CUST-06 | Nhảy nhanh tới trang | 1 | TC_021 | ✅ |
| REQ-CUST-07 | Bộ lọc nâng cao 15 tiêu chí | 4 | TC_022→TC_025 | ✅ |
| REQ-CUST-08 | Xuất dữ liệu 4 định dạng | 3 | TC_026, TC_027, TC_028 | ✅ |
| REQ-CUST-09 | Thao tác hàng loạt | 2 | TC_030, TC_031 | ✅ Pos + Neg (⚠️ không thực thi — Gap #3) |
| REQ-CUST-10 | Checkbox mang ID khách hàng | 1 | TC_029 | ✅ |
| REQ-CUST-11 | Thao tác nhanh trên dòng | 2 | TC_032, TC_033 | ✅ (2 nhánh: có/không có liên hệ) |
| REQ-CUST-12 | Bật/tắt Active tại danh sách | 3 | TC_004, TC_034, TC_035 | ✅ (2 chiều transition) |
| REQ-CUST-13 | Ý nghĩa trạng thái Inactive | 1 | TC_036 | ✅ |
| REQ-CUST-14 | Mở form tạo mới | 1 | TC_037 | ✅ |
| REQ-CUST-15 | Bố cục form 2 tab | 3 | TC_038, TC_039, TC_137 | ✅ |
| REQ-CUST-16 | Company bắt buộc | 3 | TC_042, TC_043, TC_138 | ✅ Neg + Boundary (whitespace) |
| REQ-CUST-17 | Tạo khách hàng thành công | 21 | TC_044, TC_046→TC_060, TC_073, TC_074, TC_131, TC_133, TC_135 | ✅ Pos + Neg + Boundary + Security |
| REQ-CUST-18 | Cho phép trùng tên Company | 1 | TC_045 | ✅ |
| REQ-CUST-19 | Save and create contact | 2 | TC_040, TC_041 | ✅ |
| REQ-CUST-20 | Gán nhóm khách hàng | 4 | TC_061→TC_064 | ✅ |
| REQ-CUST-21 | Tạo nhóm mới trong form | 2 | TC_065, TC_066 | ✅ Pos + Neg |
| REQ-CUST-22 | Tiền tệ riêng | 2 | TC_067, TC_068 | ✅ |
| REQ-CUST-23 | Ngôn ngữ riêng | 2 | TC_069, TC_070 | ✅ |
| REQ-CUST-24 | Quốc gia từ danh mục | 2 | TC_071, TC_072 | ✅ |
| REQ-CUST-25 | Địa chỉ Billing & Shipping | 3 | TC_077, TC_078, TC_079 | ✅ |
| REQ-CUST-26 | Hiển thị tên liên hệ chính | 2 | TC_075, TC_076 | ✅ |
| REQ-CUST-27 | Bảo vệ CSRF | 5 | TC_080, TC_081, TC_129, TC_130, TC_140 | ✅ Pos + Neg + Security |
| REQ-CUST-28 | Hồ sơ nhiều tab | 1 | TC_082 | ✅ |
| REQ-CUST-29 | Điều hướng tab bằng URL | 2 | TC_083, TC_084 | ✅ Pos + Neg |
| REQ-CUST-30 | Xoá có xác nhận | 4 | TC_085, TC_086, TC_087, TC_132 | ✅ Pos + Neg (Cancel) |
| REQ-CUST-31 | Kết quả sau khi xoá | 3 | TC_087, TC_088, TC_132 | ✅ |
| REQ-CUST-32 | Xoá kéo theo liên hệ | 2 | TC_006, TC_089 | ✅ |
| REQ-CUST-33 | Danh sách liên hệ | 1 | TC_090 | ✅ (gồm empty state) |
| REQ-CUST-34 | Thêm liên hệ mới | 1 | TC_091 | ✅ |
| REQ-CUST-35 | 4 trường bắt buộc của liên hệ | 4 | TC_092→TC_095 | ✅ Neg cho từng trường riêng |
| REQ-CUST-36 | Định dạng email liên hệ | 4 | TC_096, TC_097, TC_098, TC_102 | ✅ Neg + Boundary + Security |
| REQ-CUST-37 | Email liên hệ duy nhất | 4 | TC_099, TC_100, TC_101, TC_136 | ✅ Pos + Neg + Race |
| REQ-CUST-38 | Password bắt buộc có điều kiện | 4 | TC_095, TC_103, TC_104, TC_105 | ✅ Cả 2 nhánh điều kiện |
| REQ-CUST-39 | Liên hệ chính mặc định | 1 | TC_106 | ✅ |
| REQ-CUST-40 | Không gửi email chào mừng | 1 | TC_107 | ✅ |
| REQ-CUST-41 | Phân quyền liên hệ (6 quyền) | 3 | TC_109, TC_110, TC_139 | ✅ |
| REQ-CUST-42 | Thông báo email (7 loại) | 2 | TC_111, TC_112 | ✅ |
| REQ-CUST-43 | Ảnh đại diện liên hệ | 2 | TC_113, TC_114 | ✅ Pos + Neg (security probe) |
| REQ-CUST-44 | Hướng hiển thị LTR/RTL | 1 | TC_108 | ✅ |
| REQ-CUST-45 | Tạo liên hệ thành công | 2 | TC_115, TC_134 | ✅ Pos + Race |
| REQ-CUST-46 | Danh bạ liên hệ toàn hệ thống | 1 | TC_116 | ✅ |
| REQ-CUST-47 | Nhập khẩu từ CSV | 5 | TC_117, TC_118, TC_121, TC_124, TC_125 | ✅ Pos + Neg + Boundary |
| REQ-CUST-48 | Tải tệp mẫu | 1 | TC_119 | ✅ |
| REQ-CUST-49 | Cấu trúc 27 cột | 3 | TC_120, TC_121, TC_123 | ✅ Pos + Neg |
| REQ-CUST-50 | Ràng buộc định dạng tệp | 3 | TC_120, TC_124, TC_126 | ✅ |
| REQ-CUST-51 | Bỏ qua email trùng khi import | 1 | TC_122 | ✅ |
| REQ-CUST-52 | Gán nhóm khi nhập khẩu | 1 | TC_127 | ✅ |
| REQ-CUST-53 | Mật khẩu mặc định khi nhập khẩu | 1 | TC_128 | ✅ |

---

## 4. Coverage Gaps — nhánh chưa test được

| Gap | Nội dung | Nguyên nhân | Cần gì để mở khoá |
|---|---|---|---|
| **Gap #1** | Ma trận phân quyền theo role nhân viên (Staff View/Create/Edit/Delete) | Chỉ có tài khoản Administrator (AMB-06 · 🔴 High) | PO cấp ít nhất 1 tài khoản Staff quyền hạn chế |
| **Gap #2** | Xoá khách hàng đang có hoá đơn/dự án/hợp đồng ràng buộc | Không dám thử trên môi trường dùng chung (AMB-07 · 🔴 High) | Môi trường test riêng + xác nhận hành vi mong đợi từ dev |
| **Gap #3** | Thực thi Mass Delete và giới hạn số bản ghi mỗi lần | Thao tác nguy hiểm nhất module, môi trường dùng chung (AMB-08 · 🔴 High) | Môi trường test riêng |
| **Gap #4** | Độ dài tối đa thật của các trường | Không có `maxlength`, tránh sinh dữ liệu rác (AMB-04) | Dev xác nhận schema CSDL |
| **Gap #5** | Tác động nghiệp vụ đầy đủ của trạng thái Inactive (đăng nhập Client Portal, nhận email) | Ngoài phạm vi tài liệu requirements (AMB-09) | Bổ sung requirement từ PO |
| **Gap #6** | Nhập khẩu CSV số lượng lớn (hiệu năng, timeout) | Chỉ import tối đa 2–3 dòng trên môi trường dùng chung | Môi trường test riêng |

---

## 5. 🛡️ Self-Quality Gate — Kết quả tự kiểm định

| # | Tiêu chí | Kết quả | Ghi chú |
|---|---|---|---|
| 1 | **Unique TC ID** | ✅ ĐẠT | 140 TC, ID liên tục `CRM_CUST_TC_001` → `140`, không trùng, đúng format `[DỰ_ÁN]_[MODULE]_TC_[SỐ]` |
| 2 | **1-to-1 Step-Expected Matching** | ✅ ĐẠT | 100% TC có Test Steps đánh số `1. 2. 3.` mỗi bước 1 hành động; Expected Result đánh số khớp với step có kết quả quan sát được |
| 3 | **Concrete Test Data** | ✅ ĐẠT | Không còn cụm "hợp lệ/dữ liệu đúng"; mọi giá trị đều cụ thể (`Auto_Customer_1785700456`, `auto_contact_1785700500@auto.test`, `' OR 1=1--`, `SW1A-1AA`…) |
| 4 | **Field Validation Coverage** | ✅ ĐẠT | Mỗi input field có ≥1 Positive và ≥2 Negative/Boundary. Không gộp validation nhiều trường vào 1 TC — 4 trường bắt buộc của liên hệ tách thành 4 TC riêng (TC_092→095) |
| 5 | **Automation Metadata Ready** | ✅ ĐẠT | 100% TC có đủ `Automatable` (Yes 119 / Partial 15 / No 6), `Auto Type`, và `@Tags` |
| 6 | **Requirement Coverage** | ✅ ĐẠT | **53/53 REQ có ≥1 TC**, không có dòng 🔴. 6 gaps đã ghi nhận rõ nguyên nhân và điều kiện mở khoá |

**Kỹ thuật thiết kế đã áp dụng:**

| Kỹ thuật | Điều kiện kích hoạt | Áp dụng tại |
|---|---|---|
| **EP + BVA** | Mọi field có ràng buộc | Company 255/256 ký tự (TC_052, TC_053), page size 10/100/All (TC_017→019), trang đầu/cuối (TC_020), tệp CSV rỗng (TC_125) |
| **State Transition** | Trạng thái Active/Inactive (nhị phân) + vòng đời khách hàng | TC_034 (Active→Inactive), TC_035 (Inactive→Active), TC_087→089 (→ Đã xoá, cascade) |
| **Decision Table** | ⚠️ **Không kích hoạt** — module không có tổ hợp ≥3 điều kiện cùng ảnh hưởng 1 output. Ràng buộc điều kiện duy nhất là Password ↔ `Send SET password email` (2 nhánh) → xử lý bằng 2 TC đối xứng (TC_103, TC_104) | — |

---

## 6. So sánh nhanh với bản v1.0

| Tiêu chí | [v1.0](archive/test_cases_customers_v1.md) | **v2.0** (bản này) |
|---|---|---|
| Tổng TC | 99 | **140** |
| Số file | 1 file (105.8 KB) | 4 part + index (mỗi part ≤ 40 TC) |
| Assumptions | 14 (ASM-01→14) | 16 (bổ sung ASM-15 bộ lọc sau reload, ASM-16 concurrent edit) |
| Cấu trúc | Gộp toàn bộ | Tách theo nhóm chức năng, có index + coverage tổng |

> Hai bản sinh **độc lập** từ cùng nguồn requirements. Sau khi chọn bản giữ lại, nên xoá bản còn lại để tránh hai nguồn sự thật song song.

---

**Điều hướng:** [Part 1](parts/part_01_danh_sach.md) · [Part 2](parts/part_02_tao_sua.md) · [Part 3](parts/part_03_chi_tiet_contacts.md) · [Part 4](parts/part_04_import_nfr.md)
