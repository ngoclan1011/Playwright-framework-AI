# Danh mục Bug Report — Perfex CRM (Anh Tester Demo)

> **Điểm vào tầng bug.** Mọi workflow đụng tới bug đọc file này **trước tiên**: bug nào đang mở · mã nào đã chiếm · bug nào đã fix nhưng chưa retest.
>
> Đây là **mắt xích thứ tư** của chuỗi truy vết: `requirements → testcases → executions → bugs`.

| Mục | Giá trị |
|---|---|
| Hệ thống | Perfex CRM — Anh Tester Demo (`https://crm.anhtester.com`) |
| Quy ước mã bug | `BUG_<module>_<timestamp>` — `timestamp` là epoch giây lúc sinh, đảm bảo không trùng |
| Đường dẫn file | `docs/bugs/<module>/BUG_<module>_<timestamp>.md` |
| Ngày cập nhật | 2026-08-20 |

---

## 1. Danh mục bug

| Mã bug | Module | Tiêu đề ngắn | Severity | Priority | Trạng thái | TC liên quan | Ngày phát hiện |
|---|---|---|---|---|---|---|---|
| [BUG_login_1785678750](login/BUG_login_1785678750.md) | `LOGIN` | Trang đăng nhập phục vụ được qua HTTP thuần, không ép chuyển sang HTTPS, không có HSTS | 🔴 Critical | P1 | ⚠️ **Cần rà lại** | `CRM_LOGIN_TC_039` *(xem ghi chú)* | 2026-08-02 |

### ⚠️ Bug cần rà lại trước khi dùng

`BUG_login_1785678750` là **di sản của đợt kiểm thử trước**, cần xử lý trước khi coi là nguồn tin cậy:

| Vấn đề | Chi tiết |
|---|---|
| Tham chiếu TC đã lệch nghĩa | File ghi `CRM_LOGIN_TC_004`, nhưng ở bộ TC hiện tại mã đó là *"Logo dẫn về trang chủ"*. Nội dung bug thực chất khớp với **`CRM_LOGIN_TC_039`** |
| Tham chiếu REQ đã lệch nghĩa | File ghi `REQ-LOGIN-24 — Truyền tải an toàn HTTPS`, nhưng ở tài liệu hiện tại `REQ-LOGIN-24` là *"Trang Quên mật khẩu không có lối quay lại đăng nhập"*. Nội dung khớp với **`REQ-LOGIN-01`** |
| Evidence đã mất | Link trỏ tới `docs/executions/login/run_1785678326/` — thư mục này **không còn tồn tại** (bị xoá khi dọn dự án cũ) |

**Cần làm:** đo lại hành vi HTTP→HTTPS trên hệ thống hiện tại (chạy `CRM_LOGIN_TC_039`), rồi hoặc cập nhật tham chiếu + chụp lại evidence, hoặc đóng bug cũ và mở bug mới bằng `/create_bug_report`.

---

## 2. Thống kê theo trạng thái

| Trạng thái | Số lượng | Ý nghĩa |
|---|---|---|
| 🔴 Đang mở | 0 | Đã xác nhận, chưa fix |
| 🟡 Đã fix, chờ retest | 0 | Dev báo fix xong → chạy `/retest_fixed_bugs` |
| 🟢 Đã đóng | 0 | Retest FIXED |
| ⚠️ Cần rà lại | 1 | Tham chiếu lệch hoặc evidence mất — chưa dùng được |

### Bug dự kiến sẽ mở (TC thiết kế để FAIL, chưa chạy)

| TC | REQ | Nội dung | Ambiguity |
|---|---|---|---|
| `CRM_LOGIN_TC_016` | REQ-LOGIN-16 | Máy chủ không trả lại email đã nhập sau khi đăng nhập lỗi | `AMB-10` ✅ PO xác nhận là lỗi |
| `CRM_LOGIN_TC_028` | REQ-LOGIN-25 | Bỏ trống email ở Quên mật khẩu trả `Email not found` thay vì báo trường bắt buộc | `AMB-05` ✅ PO xác nhận là lỗi |

> Hai TC này **chắc chắn FAIL** khi chạy — đó là kết quả đúng. Chạy xong thì mở bug bằng `/create_bug_report` và bổ sung vào danh mục trên.

---

## 3. Cấu trúc thư mục chuẩn

```
docs/bugs/
├── README.md                                   ← FILE NÀY — danh mục toàn hệ thống
└── <module>/
    └── BUG_<module>_<timestamp>.md             ← mỗi bug 1 file
```

**Quy tắc bất biến:**

| Quy tắc | Lý do |
|---|---|
| Mỗi bug **một file**, đặt trong thư mục của **module phát sinh** | Dự án nhiều module thì thư mục phẳng dồn hàng trăm file, không tra được |
| Mã bug mang **timestamp epoch giây**, không đánh số tuần tự | Nhiều người sinh bug song song không đụng mã nhau |
| **KHÔNG xoá file bug** — bug đóng thì đổi trạng thái trong file và trong danh mục | Lịch sử bug là bằng chứng chất lượng qua các đợt; xoá là mất dấu vết |
| Bug **phải trỏ về TC ID và REQ ID** đang có hiệu lực | Đây là mắt xích cuối của chuỗi truy vết. Trỏ vào mã đã đổi nghĩa còn tệ hơn không trỏ — xem `BUG_login_1785678750` ở mục 1 |
| Retest thì **thêm dòng lên đầu** mục "Lịch sử retest", không sửa nội dung cũ | So sánh được giữa các lần retest |
| Evidence của bug nằm ở **`docs/executions/<module>/run_*/evidence/`**, bug report chỉ **link tới** | Ảnh sinh ra từ lần chạy nào thì ở cùng lần chạy đó; nhân bản ảnh sang `docs/bugs/` là tạo hai nguồn sự thật |

> 🔒 Bug report thường nhúng hoặc link screenshot hệ thống thật — **chứa dữ liệu khách hàng**. Cùng mức nhạy cảm với `docs/executions/`; cân nhắc kỹ trước khi commit lên repo công khai.

---

## 4. Quy trình sử dụng

| Tình huống | Workflow | Ghi chú |
|---|---|---|
| TC FAIL → cần mở bug | `/create_bug_report` | Tự thu evidence, phân loại severity/priority, tuỳ chọn đẩy Jira |
| Dev báo đã fix → cần verify | `/retest_fixed_bugs` | Chấm FIXED/NOT_FIXED/PARTIAL, chạy regression quanh vùng fix, ghi **Lịch sử retest** vào file bug |
| Tổng hợp bug đang mở cho báo cáo release | `/generate_test_summary_report` | Đọc `docs/bugs/<module>/BUG_*.md` để lấy Severity + Lịch sử retest |
| Lập Master Test Plan | `/generate_master_test_plan` | Đọc `docs/bugs/` để đối chiếu tiêu chí vào |

---

## 5. Nhật ký danh mục

| Ngày | Thay đổi |
|---|---|
| 2026-08-20 | **Chuyển `bug_reports/` ở gốc repo vào `docs/bugs/<module>/`.** Lý do: bug là mắt xích thứ tư của chuỗi truy vết, ba tầng còn lại đều nằm trong `docs/` và đều có danh mục — riêng bug đứng ngoài nên không có danh mục và **bị sót khi dọn dự án** (`rm -rf docs` không chạm tới nó). Chính lỗ hổng đó để lại `BUG_login_1785678750` mồ côi với tham chiếu TC/REQ đã lệch nghĩa. Khởi tạo file danh mục này |
