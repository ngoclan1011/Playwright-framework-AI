# Execution Report — Login (Perfex CRM) · Smoke Test

| Thông tin | Nội dung |
|---|---|
| Run ID | run_1785678326 |
| Nguồn TC | [test_cases_login.md](../testcases/test_cases_login.md) |
| Phạm vi | 5 TC gắn tag `@Smoke` (TC_001, TC_004, TC_008, TC_036, TC_040) trên tổng 54 TC |
| Môi trường | https://crm.anhtester.com — Perfex CRM Anh Tester Demo |
| Build / Version | Không công bố trên UI |
| Tài khoản | `admin@example.com` (Administrator) |
| Người thực hiện | Anh Tester (agent Claude hỗ trợ thực thi) |
| Bắt đầu | 2026-08-02 13:45 |
| Kết thúc | 2026-08-02 13:49 (~4 phút) |
| Môi trường dùng chung? | **Không** — tester khai báo là môi trường riêng → quy tắc auto-skip TC phá huỷ **TẮT** |
| Trình duyệt | Chromium (Playwright MCP), viewport 1920×1080, headed |

---

## 1. Tổng kết

| Trạng thái | Số lượng | Tỷ lệ |
|---|---|---|
| ✅ PASS | 4 | 80.0% |
| ❌ FAIL | 1 | 20.0% |
| ⚠️ BLOCKED | 0 | 0% |
| ⏭️ SKIPPED | 0 | 0% |
| **Tổng TC thực chạy** | **5** | 100% |

> **Pass rate (không tính SKIPPED):** 4/5 = **80.0%**
> Phạm vi chạy: 5/54 TC của bộ Login (chỉ tag `@Smoke`) — 49 TC còn lại **chưa chạy** trong buổi này.

**Kết luận nhanh:** Luồng đăng nhập/đăng xuất và bảo vệ route hoạt động đúng. Tồn tại **1 lỗi bảo mật mức High**: hệ thống phục vụ trang đăng nhập trên HTTP thuần, không ép HTTPS.

---

## 2. Kết quả từng TC

| TC ID | Test Scenario | Kết quả | Bước fail | Ghi chú |
|---|---|---|---|---|
| CRM_LOGIN_TC_001 | Trang login hiển thị đầy đủ thành phần bắt buộc | ✅ PASS | — | HTTP 200, đủ 7 thành phần |
| CRM_LOGIN_TC_004 | Trang đăng nhập chạy trên kênh HTTPS | ❌ FAIL | 2 | Không redirect HTTP → HTTPS. Xem chi tiết #1 |
| CRM_LOGIN_TC_008 | Đăng nhập thành công, không tick Remember me | ✅ PASS | — | Vào `/admin/` (Dashboard); cookie sau đăng nhập chỉ có `csrf_cookie_name` + `sp_session`, không có `autologin` |
| CRM_LOGIN_TC_036 | Truy cập route quản trị khi chưa đăng nhập bị chuyển về login | ✅ PASS | — | `/admin/clients` → redirect `/admin/authentication`, không lộ dữ liệu Clients |
| CRM_LOGIN_TC_040 | Đăng xuất kết thúc phiên và trả về trang login | ✅ PASS | — | `/admin/authentication/logout` → redirect `/admin/authentication`, hiện đủ form Login |

### Ghi chú quan sát thêm (không thuộc Expected của TC nào)

| Quan sát | TC liên quan | Ý nghĩa |
|---|---|---|
| `document.cookie` trả về rỗng kể cả khi đã đăng nhập — `csrf_cookie_name` và `sp_session` đều `httpOnly = true` | TC_008 | **Điểm cộng bảo mật** (chống đánh cắp session qua XSS). Đồng thời là lưu ý cho automation: bước "kiểm tra cookie" trong TC_008/TC_011/TC_035 **không thể** verify bằng `document.cookie`, phải đọc qua cookie store của trình duyệt (DevTools → Application, hoặc `context.cookies()` trong Playwright) |
| Trình duyệt tự điền sẵn `admin@example.com` / `123456` vào form login khi mở trang | TC_001, TC_036 | Autofill của trình duyệt, không phải hành vi hệ thống. Không ảnh hưởng Expected của 2 TC này, nhưng khi chạy các TC validation (nhóm C/D) **bắt buộc** xoá trắng ô nhập trước khi nhập test data |

---

## 3. Chi tiết TC FAIL

### FAIL #1 — CRM_LOGIN_TC_004 · Trang đăng nhập chạy trên kênh HTTPS

| | |
|---|---|
| REQ ID | REQ-LOGIN-24 |
| Priority | High · Risk High · Tags `@Security @Smoke` |
| Bước fail | Bước 2 |
| **Expected** | Trang tải thành công; URL cuối cùng có giao thức `https://`, trình duyệt hiển thị biểu tượng ổ khoá, không có cảnh báo "Not secure" |
| **Actual** | Mở `http://crm.anhtester.com/admin/authentication` → server trả **HTTP 200 ngay trên giao thức HTTP**, không có header `Location`, `redirectCount = 0`, URL cuối vẫn là `http://crm.anhtester.com/admin/authentication`. Trang login hiển thị đầy đủ và dùng được trên kênh không mã hoá. Trình duyệt đánh dấu trang là không an toàn (không có ổ khoá). Bản HTTPS cũng **không có header `Strict-Transport-Security`**. |
| Phát hiện kèm theo | 12 lỗi console: toàn bộ font `Inter-*.woff/.woff2` tải từ `https://` bị chặn CORS do trang gốc là `http://` → giao diện mất font chuẩn |
| Evidence | **Chính:** `docs/evidence/execution/run_1785678326/CRM_LOGIN_TC_004_step2_urlbar_http_not_secure.png` — ảnh chụp cả cửa sổ trình duyệt, thanh địa chỉ hiện ⚠ **"Not secure"**, không có ổ khoá<br>**Phụ:** `CRM_LOGIN_TC_004_step2_no_https_redirect.png` — chỉ vùng nội dung trang |
| Cách verify | `performance.getEntriesByType('navigation')[0]` → `responseStatus = 200`, `redirectCount = 0`; `location.protocol = "http:"`; request `maxRedirects: 0` xác nhận không có `Location` và không có HSTS |
| Tái hiện được? | Có — 2/2 lần |
| Mức ảnh hưởng | **Bảo mật cao.** Đã kiểm chứng thêm: `form.action` là `https://...` nên POST đăng nhập vẫn đi qua HTTPS — mật khẩu **không** bị truyền plaintext trong kịch bản thường. Rủi ro thật nằm ở chỗ HTML trang login phục vụ trên kênh không mã hoá có thể bị sửa trên đường truyền (SSL stripping/MITM) để đổi `form.action` sang máy chủ của kẻ tấn công. Cần redirect 301 toàn site sang HTTPS + bật HSTS |
| Bug report | [BUG_login_1785678750.md](../../bug_reports/BUG_login_1785678750.md) |

---

## 4. TC BLOCKED

Không có TC nào BLOCKED trong buổi chạy này.

---

## 5. Dữ liệu đã tạo & dọn dẹp

| Dữ liệu | ID | Nơi tạo | Đã xoá? |
|---|---|---|---|
| — | — | — | — |

> Bộ TC `@Smoke` của module Login **không tạo bản ghi nghiệp vụ nào** (không CRUD khách hàng/nhân viên/hoá đơn). Chỉ phát sinh phiên đăng nhập.

**Trạng thái môi trường sau buổi chạy:**

| Hạng mục | Xử lý |
|---|---|
| Phiên đăng nhập của agent | ✅ Đã đăng xuất (`/admin/authentication/logout`) |
| Cookie trình duyệt | ✅ Đã xoá sạch — `context.cookies()` trả về `[]` |
| Dữ liệu người dùng khác | ✅ Không đụng chạm |
| Số lần đăng nhập sai | 0 — không chạy TC negative nào, không có rủi ro khoá tài khoản |

---

## 6. Đề xuất bước tiếp theo

| # | Việc cần làm | Lệnh / Hành động |
|---|---|---|
| 1 | **Ưu tiên cao** — sinh bug report cho FAIL #1 (thiếu ép HTTPS, REQ-LOGIN-24) | `/create_bug_report` — evidence đã có sẵn tại `docs/evidence/execution/run_1785678326/` |
| 2 | Yêu cầu dev cấu hình redirect 301 `http://` → `https://` toàn site + bật header `Strict-Transport-Security` | Trao đổi với dev/DevOps |
| 3 | Chạy tiếp bộ `@CriticalPath` (10 TC) để phủ SQL injection và CSRF trước khi release | `/execute_test_cases` với phạm vi `@CriticalPath` |
| 4 | Chạy nhóm C + D (19 TC validation Email/Password) | `/execute_test_cases` |
| 5 | Cân nhắc bổ sung assert vào TC_008/TC_011/TC_035: ghi rõ phải đọc cookie qua DevTools → Application (không dùng `document.cookie`) vì cookie là httpOnly | `/review_testcases` mode FIX — **không sửa TC trong lúc chạy** |
