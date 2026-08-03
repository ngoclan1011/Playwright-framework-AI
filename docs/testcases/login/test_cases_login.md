# Manual Test Cases — Module Login (Perfex CRM)

| Thông tin | Nội dung |
|---|---|
| Hệ thống | CRM (Perfex CRM — Anh Tester Demo) |
| Module | Login (Admin Authentication) |
| URL | https://crm.anhtester.com/admin/authentication |
| Nguồn requirement | [requirements_login.md](../../requirements/login/requirements_login.md) — 24 REQ (REQ-LOGIN-01 → 24) |
| Mode sinh TC | QUICK (skill `skills-rbt-manual-testing`) |
| Tài khoản test | `admin@example.com` / `123456` (role Administrator) |
| Tổng số TC | **54** (Critical: 9 · High: 14 · Medium: 20 · Low: 11) |
| Ngày tạo | 2026-08-02 |
| Phiên bản | 1.0 |

> ⚠️ **Lưu ý môi trường:** `crm.anhtester.com` là môi trường demo dùng chung. Mọi TC negative lặp lại nhiều lần **bắt buộc** dùng email không tồn tại (`notexist_*@auto.test`), KHÔNG dùng `admin@example.com` để tránh nguy cơ khoá tài khoản dùng chung (RISK-01).

---

## 1. Assumptions (Giả định đã áp dụng)

QUICK mode không dừng hỏi Q&A — mọi điểm mơ hồ trong requirement được xử lý bằng giả định dưới đây. Cần PO/BA xác nhận trước khi baseline bộ TC.

| ASM ID | Điểm chưa rõ (nguồn) | Giả định đã áp dụng | TC bị ảnh hưởng |
|---|---|---|---|
| ASM-01 | Hệ thống có lockout / rate-limit sau N lần đăng nhập sai không? (AMB-01) | **Không có lockout ở tầng ứng dụng.** TC verify: sau 6 lần sai liên tiếp vẫn hiển thị cùng thông báo `Invalid email or password`, không có thông báo khoá. Chỉ test bằng email KHÔNG tồn tại | CRM_LOGIN_TC_050 |
| ASM-02 | Cookie `autologin` còn tồn tại sau logout — thiết kế hay lỗi? (AMB-02) | **Token phía server đã bị vô hiệu** → tiêu chí PASS của logout là "route bảo vệ bị chặn trở lại", KHÔNG assert cookie bị xoá khỏi trình duyệt | CRM_LOGIN_TC_040, 041, 042 |
| ASM-03 | Thời hạn Remember me và session idle timeout là bao lâu? (AMB-03) | **Không xác định được** → TC hết hạn phiên/Remember me **loại khỏi phạm vi** bộ TC này. Chỉ verify sự tồn tại/không tồn tại của cookie `autologin` ngay sau đăng nhập | CRM_LOGIN_TC_011, 033, 035 |
| ASM-04 | Tài khoản staff inactive đăng nhập nhận thông báo gì? (AMB-04) | **Chưa có tài khoản để kiểm chứng** → TC nhánh này **loại khỏi phạm vi**, ghi vào mục Gap. Cần PO cấp tài khoản inactive | (chưa sinh — xem mục 6) |
| ASM-05 | Role khác Administrator có bị chặn `/admin` không? (AMB-05) | **Chỉ có 1 tài khoản Administrator** → không sinh TC ma trận phân quyền theo role. Ma trận áp dụng là **trạng thái xác thực** (Khách / Đã đăng nhập) | CRM_LOGIN_TC_036 → 042 |
| ASM-06 | Checkbox Remember me có `value="estimate"` — có ý nghĩa nghiệp vụ? (AMB-06) | **Giá trị rác, không mang ý nghĩa.** TC và automation chỉ dựa vào `id="remember"` / accessible name "Remember me", **tuyệt đối không** assert theo `value` | CRM_LOGIN_TC_011, 033, 035 |
| ASM-07 | Độ dài tối đa của Email / Password là bao nhiêu? (AMB-07) | **Email: giới hạn theo chuẩn RFC 5321 = 254 ký tự** (đã kiểm chứng 261 ký tự bị từ chối). **Password: không rõ giới hạn trên** → chỉ test 1000 ký tự để verify hệ thống không lỗi 500 | CRM_LOGIN_TC_019, 020, 030 |
| ASM-08 | Hệ thống có 2FA/OTP không? (AMB-08) | **2FA đang tắt** → toàn bộ TC giả định đăng nhập 1 bước (email + password → Dashboard ngay) | Toàn bộ nhóm B |
| ASM-09 | Giao diện login có đa ngôn ngữ không? (AMB-09) | **Cố định tiếng Anh** (`<html lang="en">`) → assert nguyên văn chuỗi tiếng Anh trong `div.alert.alert-danger` | Toàn bộ TC có assert message |
| ASM-10 | Không quay lại deep-link sau đăng nhập là yêu cầu hay thiếu sót? (AMB-10) | **Là hành vi đúng hiện tại** theo REQ-LOGIN-19 → TC assert luôn vào `/admin/` | CRM_LOGIN_TC_037 |
| ASM-11 | Email chỉ chứa khoảng trắng (`"   "`) sẽ bị coi là rỗng hay sai định dạng? (không có trong requirement) | Do email **được trim** (REQ-LOGIN-04) → sau trim thành chuỗi rỗng → giả định trả về `The Email Address field is required.` | CRM_LOGIN_TC_014 |
| ASM-12 | Password chỉ chứa khoảng trắng (`"   "`) là rỗng hay có giá trị? | Do password **KHÔNG được trim** (REQ-LOGIN-05) → giả định coi là có giá trị → trả về `Invalid email or password` (không phải lỗi required) | CRM_LOGIN_TC_029 |
| ASM-13 | CSRF token của trang cũ (đã tải lâu / đã submit 1 lần) có còn dùng lại được không? | Giả định token **regenerate theo mỗi lần tải trang** (REQ-LOGIN-16) → token cũ bị từ chối với HTTP 403 `419 Page Expired!` | CRM_LOGIN_TC_045 |
| ASM-14 | Hành vi khi mất mạng / mạng chậm lúc submit form? | Không có JS và không có loading indicator (mục 10 requirement) → giả định trình duyệt hiển thị trang lỗi kết nối mặc định, hệ thống **không** tạo phiên đăng nhập | CRM_LOGIN_TC_053 |

---

## 2. Kỹ Thuật Thiết Kế Đã Áp Dụng

### 2.1. Decision Table — Kết quả xác thực (4 điều kiện kết hợp)

Bắt buộc lập vì ≥3 điều kiện cùng ảnh hưởng đến 1 output (kết quả đăng nhập).

| Rule | CSRF hợp lệ | Email có giá trị (sau trim) | Password có giá trị | Email + Password khớp DB | → Kết quả quan sát được | TC |
|---|---|---|---|---|---|---|
| R1 | Yes | Yes | Yes | Yes | Redirect `/admin/` (Dashboard) | TC_008 |
| R2 | Yes | Yes | Yes | No (sai password) | `Invalid email or password` | TC_026 |
| R3 | Yes | Yes | Yes | No (email không tồn tại) | `Invalid email or password` (giống hệt R2) | TC_021 |
| R4 | Yes | No | Yes | — | `The Email Address field is required.` | TC_013 |
| R5 | Yes | Yes | No | — | `The Password field is required.` | TC_025 |
| R6 | Yes | No | No | — | Hiển thị đồng thời 2 alert required | TC_032 |
| R7 | Yes | Yes (sai định dạng) | Yes | — | `The Email Address field must contain a valid email address.` | TC_018 |
| R8 | No | — | — | — | HTTP 403 — trang `419 Page Expired!` (CSRF chặn trước mọi validation) | TC_043, TC_044 |

> Quan sát quan trọng: **CSRF được kiểm tra TRƯỚC** mọi validation field (R8 override toàn bộ) — đây là căn cứ để không sinh tổ hợp CSRF-sai × field-sai (dư thừa).

### 2.2. State Transition — Phiên đăng nhập

Bắt buộc lập vì phiên có luồng trạng thái rõ ràng (mục 6 requirement).

| Từ \ Hành động | Submit đúng (no remember) | Submit đúng (có remember) | Submit sai/thiếu/CSRF lỗi | Truy cập route bảo vệ | Truy cập `/admin/authentication` | Logout |
|---|---|---|---|---|---|---|
| **Chưa đăng nhập** | ✅ → Đã ĐN (phiên tạm) — TC_008 | ✅ → Đã ĐN (ghi nhớ) — TC_011 | ⛔ giữ nguyên — TC_021/026/032/043 | ⛔ redirect login — TC_036 | ✅ hiển thị form — TC_001 | — (không áp dụng) |
| **Đã đăng nhập** | — (bị chặn khỏi form) | — | — | ✅ vào được — TC_038 | ⛔ redirect `/admin/` — TC_038, TC_039 | ✅ → Chưa ĐN — TC_040 |

Mọi ô ✅ và ⛔ ở trên đều đã có TC tương ứng.

### 2.3. EP + BVA — Trường Email Address (giới hạn 254 ký tự theo ASM-07)

| Partition | Đại diện | Kỳ vọng | TC |
|---|---|---|---|
| Rỗng | `""` | Required error | TC_013 |
| Chỉ khoảng trắng | `"   "` | Required error (sau trim) | TC_014 |
| Sai định dạng (thiếu `@`) | `abc` | Trình duyệt chặn submit | TC_015 |
| Đúng định dạng, không tồn tại | `notexist_...@auto.test` | `Invalid email or password` | TC_021 |
| Đúng định dạng, tồn tại | `admin@example.com` | Đăng nhập thành công | TC_008 |
| **BVA — 254 ký tự (max)** | `a`×243 + `@auto.test` | Chấp nhận định dạng → `Invalid email or password` | TC_020 |
| **BVA — 261 ký tự (max+)** | `a`×250 + `@auto.test` | `must contain a valid email address.` | TC_019 |

### 2.4. Danh Sách Fields & Bao Phủ Validation

| # | Field | Loại | Positive TC | Negative/Boundary TC | Tổng |
|---|---|---|---|---|---|
| 1 | Email Address | Email | TC_008, 009, 010, 012 | TC_013, 014, 015, 016, 017, 018, 019, 020, 021, 022, 023, 024 | 16 |
| 2 | Password | Password | TC_008 | TC_025, 026, 027, 028, 029, 030, 031, 049 | 9 |
| 3 | Remember me | Checkbox | TC_011 | TC_033, 035 | 3 |
| 4 | CSRF token (hidden) | Hidden | TC_005 | TC_043, 044, 045 | 4 |

---

## 3. Test Cases

**Quy ước TC ID:** `CRM_LOGIN_TC_<số>` · **Pre-condition mặc định:** Trình duyệt Chrome, viewport 1920×1080, đã xoá cookie của `crm.anhtester.com`.

### Nhóm A — Hiển thị trang & UI (7 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_001 | REQ-LOGIN-01 | Login | High | Trang login hiển thị đầy đủ thành phần bắt buộc | Chưa đăng nhập, đã xoá cookie | 1. Mở `https://crm.anhtester.com/admin/authentication`<br>2. Quan sát toàn bộ nội dung trang | N/A | 1. Trang tải thành công (HTTP 200), URL giữ nguyên `/admin/authentication`<br>2. Hiển thị đủ: logo `Perfex CRM \| Anh Tester Demo`, heading `Login`, field `Email Address`, field `Password`, checkbox `Remember me`, nút `Login`, link `Forgot Password?` | Critical | Yes | UI | @Smoke @CriticalPath |
| CRM_LOGIN_TC_002 | REQ-LOGIN-22 | Login | Low | Con trỏ tự động đặt vào ô Email khi mở trang | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. KHÔNG click chuột vào bất kỳ đâu<br>3. Gõ trực tiếp `abc` từ bàn phím | Chuỗi gõ: `abc` | 1. Trang login hiển thị<br>3. Ký tự `abc` xuất hiện trong ô `Email Address` (`document.activeElement` là `#email`) | Low | Yes | UI | @Regression @UX |
| CRM_LOGIN_TC_003 | REQ-LOGIN-23 | Login | High | Mật khẩu được che khi nhập và không có nút hiện/ẩn | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập vào ô Password: `123456`<br>3. Quan sát ô Password và vùng xung quanh | Password: `123456` | 2. Ký tự hiển thị dạng chấm tròn (input có `type="password"`)<br>3. KHÔNG có biểu tượng con mắt / nút toggle hiện mật khẩu | High | Yes | UI | @Security @Regression |
| CRM_LOGIN_TC_004 | REQ-LOGIN-24 | Login | High | Trang đăng nhập chạy trên kênh HTTPS | Chưa đăng nhập | 1. Mở `http://crm.anhtester.com/admin/authentication` (giao thức HTTP)<br>2. Kiểm tra thanh địa chỉ sau khi trang tải xong | URL nhập: `http://crm.anhtester.com/admin/authentication` | 1. Trang tải thành công<br>2. URL cuối cùng có giao thức `https://`, trình duyệt hiển thị biểu tượng ổ khoá, không có cảnh báo "Not secure" | High | Yes | UI | @Security @Smoke |
| CRM_LOGIN_TC_005 | REQ-LOGIN-16 | Login | High | Form chứa CSRF token ẩn và token đổi sau mỗi lần tải trang | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Ghi lại giá trị `input[name="csrf_token_name"]` (gọi là T1)<br>3. Nhấn F5 tải lại trang<br>4. Ghi lại giá trị token lần 2 (gọi là T2)<br>5. So sánh T1 và T2 | N/A | 2. Tồn tại `<input type="hidden" name="csrf_token_name">` với giá trị chuỗi hex 32 ký tự, khác rỗng<br>4. T2 là chuỗi hex 32 ký tự hợp lệ<br>5. T2 ≠ T1 | High | Yes | UI | @Security @Regression |
| CRM_LOGIN_TC_006 | REQ-LOGIN-17 | Login | Medium | Link "Forgot Password?" dẫn đúng trang khôi phục mật khẩu | Đang ở trang login, chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Click link `Forgot Password?`<br>3. Quan sát trang đích | N/A | 2. Điều hướng tới `https://crm.anhtester.com/admin/authentication/forgot_password`<br>3. Trang hiển thị heading `Forgot Password`, đúng 1 field `Email Address` và nút `Confirm` | Medium | Yes | UI | @Regression |
| CRM_LOGIN_TC_007 | REQ-LOGIN-01 | Login | Low | Click logo công ty điều hướng về trang chủ hệ thống | Đang ở trang login | 1. Mở `/admin/authentication`<br>2. Click vào logo `Perfex CRM \| Anh Tester Demo` phía trên form | N/A | 2. Điều hướng tới `https://crm.anhtester.com/` | Low | Yes | UI | @Regression |

### Nhóm B — Đăng nhập thành công (5 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_008 | REQ-LOGIN-02, REQ-LOGIN-07 | Login | High | Đăng nhập thành công với thông tin đúng, không tick Remember me | Chưa đăng nhập, đã xoá toàn bộ cookie của domain | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `123456`<br>4. KHÔNG tick `Remember me`<br>5. Click nút `Login`<br>6. Mở DevTools → Application → Cookies kiểm tra danh sách cookie | Email: `admin@example.com`<br>Password: `123456`<br>Remember: không tick | 5. Chuyển hướng tới `https://crm.anhtester.com/admin/`, title trang là `Dashboard`<br>6. KHÔNG tồn tại cookie tên `autologin` | Critical | Yes | UI | @Smoke @CriticalPath |
| CRM_LOGIN_TC_009 | REQ-LOGIN-03 | Login | Medium | Đăng nhập thành công với email viết HOA toàn bộ | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `ADMIN@EXAMPLE.COM`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `ADMIN@EXAMPLE.COM`<br>Password: `123456` | 4. Chuyển hướng tới `https://crm.anhtester.com/admin/`, title trang là `Dashboard` | High | Yes | UI | @Regression |
| CRM_LOGIN_TC_010 | REQ-LOGIN-04 | Login | Medium | Đăng nhập thành công khi email có khoảng trắng thừa đầu/cuối | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `··admin@example.com··` (2 khoảng trắng đầu, 2 khoảng trắng cuối)<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `␣␣admin@example.com␣␣`<br>Password: `123456` | 4. Hệ thống tự trim khoảng trắng → chuyển hướng tới `https://crm.anhtester.com/admin/`, title `Dashboard` | Medium | Yes | UI | @Regression @Boundary |
| CRM_LOGIN_TC_011 | REQ-LOGIN-06 | Login | High | Tick "Remember me" tạo cookie autologin sau đăng nhập thành công | Chưa đăng nhập, đã xoá toàn bộ cookie của domain | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `123456`<br>4. Tick checkbox `Remember me`<br>5. Click nút `Login`<br>6. Mở DevTools → Application → Cookies của `crm.anhtester.com` | Email: `admin@example.com`<br>Password: `123456`<br>Remember: có tick | 4. Checkbox chuyển sang trạng thái checked<br>5. Chuyển hướng tới `https://crm.anhtester.com/admin/`, title `Dashboard`<br>6. Tồn tại cookie tên `autologin` với giá trị khác rỗng | High | Yes | UI | @Regression @CriticalPath |
| CRM_LOGIN_TC_012 | REQ-LOGIN-03 | Login | Low | Đăng nhập thành công với email viết hoa/thường xen kẽ | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `AdMin@ExAmPle.CoM`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `AdMin@ExAmPle.CoM`<br>Password: `123456` | 4. Chuyển hướng tới `https://crm.anhtester.com/admin/`, title `Dashboard` | Medium | Yes | UI | @Regression @Boundary |

### Nhóm C — Validation trường Email Address (12 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_013 | REQ-LOGIN-09 | Login | High | Bỏ trống Email → hiển thị lỗi bắt buộc | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Để trống ô `Email Address`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `` (rỗng)<br>Password: `123456` | 4. Trang tải lại, URL vẫn là `/admin/authentication`; khối `div.alert.alert-danger` hiển thị nguyên văn `The Email Address field is required.`; KHÔNG chuyển tới Dashboard | High | Yes | UI | @Regression @Negative |
| CRM_LOGIN_TC_014 | REQ-LOGIN-04, REQ-LOGIN-09 | Login | Medium | Email chỉ chứa khoảng trắng bị coi là rỗng (sau trim) | Chưa đăng nhập — áp dụng ASM-11 | 1. Mở `/admin/authentication`<br>2. Nhập vào Email 3 ký tự khoảng trắng: `···`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `␣␣␣`<br>Password: `123456` | 4. Trang tải lại kèm `div.alert.alert-danger` chứa `The Email Address field is required.`; KHÔNG đăng nhập được | Medium | Yes | UI | @Regression @Negative @Boundary |
| CRM_LOGIN_TC_015 | REQ-LOGIN-12 | Login | Medium | Email thiếu ký tự `@` bị trình duyệt chặn submit | Chưa đăng nhập, dùng Chrome | 1. Mở `/admin/authentication`<br>2. Nhập Email: `abc`<br>3. Nhập Password: `123456`<br>4. Click nút `Login`<br>5. Kiểm tra `document.querySelector('#email').validity.typeMismatch` trong Console | Email: `abc`<br>Password: `123456` | 4. Form KHÔNG submit — URL không đổi, trang KHÔNG tải lại, không có `div.alert` mới; trình duyệt hiện tooltip native (Chrome: `Please include an '@' in the email address. 'abc' is missing an '@'.`)<br>5. Trả về `true` | Medium | Partial | UI | @Regression @Negative |
| CRM_LOGIN_TC_016 | REQ-LOGIN-12 | Login | Medium | Email thiếu phần domain bị trình duyệt chặn submit | Chưa đăng nhập, dùng Chrome | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@`<br>3. Nhập Password: `123456`<br>4. Click nút `Login`<br>5. Kiểm tra `#email` → `validity.typeMismatch` | Email: `admin@`<br>Password: `123456` | 4. Form KHÔNG submit, URL không đổi, hiện tooltip native của trình duyệt<br>5. Trả về `true` | Medium | Partial | UI | @Regression @Negative |
| CRM_LOGIN_TC_017 | REQ-LOGIN-12 | Login | Medium | Email chứa nhiều ký tự `@` bị trình duyệt chặn submit | Chưa đăng nhập, dùng Chrome | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@@example.com`<br>3. Nhập Password: `123456`<br>4. Click nút `Login`<br>5. Kiểm tra `#email` → `validity.typeMismatch` | Email: `admin@@example.com`<br>Password: `123456` | 4. Form KHÔNG submit, URL không đổi<br>5. Trả về `true` | Medium | Partial | UI | @Regression @Negative |
| CRM_LOGIN_TC_018 | REQ-LOGIN-13 | Login | High | Server chặn email sai định dạng khi vượt qua tầng client | Chưa đăng nhập; dùng DevTools tắt HTML5 validation (`document.querySelector('form').noValidate = true`) | 1. Mở `/admin/authentication`<br>2. Chạy trong Console: `document.querySelector('form').noValidate = true`<br>3. Nhập Email: `abc`<br>4. Nhập Password: `123456`<br>5. Click nút `Login` | Email: `abc`<br>Password: `123456` | 5. Form submit tới server; trang tải lại và `div.alert.alert-danger` hiển thị nguyên văn `The Email Address field must contain a valid email address.` | High | Yes | API | @Security @Regression @Negative |
| CRM_LOGIN_TC_019 | REQ-LOGIN-14 | Login | Medium | Email 261 ký tự (vượt giới hạn RFC) bị từ chối — BVA max+ | Chưa đăng nhập — áp dụng ASM-07 | 1. Mở `/admin/authentication`<br>2. Nhập Email gồm 250 ký tự `a` liên tiếp + `@auto.test` (tổng 261 ký tự)<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `aaa…a@auto.test` (`a`×250 + `@auto.test` = 261 ký tự)<br>Password: `123456` | 4. Trang tải lại; `div.alert.alert-danger` hiển thị `The Email Address field must contain a valid email address.`; KHÔNG đăng nhập được | Medium | Yes | UI | @Boundary @Negative @Regression |
| CRM_LOGIN_TC_020 | REQ-LOGIN-14 | Login | Medium | Email 254 ký tự (biên tối đa RFC) được chấp nhận về định dạng — BVA max | Chưa đăng nhập — áp dụng ASM-07 | 1. Mở `/admin/authentication`<br>2. Nhập Email gồm 244 ký tự `a` liên tiếp + `@auto.test` (tổng 254 ký tự)<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `aaa…a@auto.test` (`a`×244 + `@auto.test` = 254 ký tự)<br>Password: `123456` | 4. Trang tải lại; `div.alert.alert-danger` hiển thị `Invalid email or password` (lỗi xác thực, KHÔNG phải lỗi định dạng `must contain a valid email address.`) | Medium | Yes | UI | @Boundary @Negative @Regression |
| CRM_LOGIN_TC_021 | REQ-LOGIN-08 | Login | High | Email không tồn tại trong hệ thống trả về thông báo chung | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `notexist_login_20260802@auto.test`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `notexist_login_20260802@auto.test`<br>Password: `123456` | 4. Trang tải lại tại `/admin/authentication`; `div.alert.alert-danger` hiển thị nguyên văn `Invalid email or password`; thông báo KHÔNG tiết lộ email không tồn tại | High | Yes | UI | @Security @Regression @Negative |
| CRM_LOGIN_TC_022 | REQ-LOGIN-12 | Login | Low | Email chứa emoji bị chặn định dạng | Chưa đăng nhập, dùng Chrome | 1. Mở `/admin/authentication`<br>2. Nhập Email: `test😀🎉@auto.test`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `test😀🎉@auto.test`<br>Password: `123456` | 4. Form KHÔNG submit (`validity.typeMismatch === true`) HOẶC trang tải lại với `The Email Address field must contain a valid email address.`; trong mọi trường hợp KHÔNG đăng nhập được và trang KHÔNG lỗi 500 | Low | Partial | UI | @Localization @Negative |
| CRM_LOGIN_TC_023 | REQ-LOGIN-08 | Login | High | Chuỗi SQL Injection ở ô Email không bypass được xác thực | Chưa đăng nhập; đã tắt HTML5 validation để chuỗi tới được server | 1. Mở `/admin/authentication`<br>2. Chạy Console: `document.querySelector('form').noValidate = true`<br>3. Nhập Email: `admin@example.com' OR '1'='1`<br>4. Nhập Password: `anything`<br>5. Click nút `Login` | Email: `admin@example.com' OR '1'='1`<br>Password: `anything` | 5. KHÔNG đăng nhập được — ở lại `/admin/authentication` với `div.alert.alert-danger`; KHÔNG có lỗi HTTP 500, KHÔNG lộ thông tin SQL/stack trace trên trang | Critical | Yes | API | @Security @Negative |
| CRM_LOGIN_TC_024 | REQ-LOGIN-08 | Login | High | Chuỗi XSS ở ô Email được escape, không thực thi script | Chưa đăng nhập; đã tắt HTML5 validation | 1. Mở `/admin/authentication`<br>2. Chạy Console: `document.querySelector('form').noValidate = true`<br>3. Nhập Email: `<script>alert(1)</script>@auto.test`<br>4. Nhập Password: `123456`<br>5. Click nút `Login`<br>6. Quan sát trang sau khi tải lại | Email: `<script>alert(1)</script>@auto.test`<br>Password: `123456` | 5. Trang tải lại kèm thông báo lỗi validation<br>6. KHÔNG xuất hiện hộp thoại `alert(1)`; nếu chuỗi được hiển thị lại thì ở dạng text đã escape (`&lt;script&gt;`), không phải thẻ HTML thực thi | Critical | Yes | UI | @Security @Negative |

### Nhóm D — Validation trường Password (7 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_025 | REQ-LOGIN-10 | Login | High | Bỏ trống Password → hiển thị lỗi bắt buộc | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Để trống ô `Password`<br>4. Click nút `Login` | Email: `admin@example.com`<br>Password: `` (rỗng) | 4. Trang tải lại, URL vẫn `/admin/authentication`; `div.alert.alert-danger` hiển thị nguyên văn `The Password field is required.`; KHÔNG chuyển tới Dashboard | High | Yes | UI | @Regression @Negative |
| CRM_LOGIN_TC_026 | REQ-LOGIN-08 | Login | High | Email đúng + Password sai trả về thông báo chung | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `wrongpass_20260802`<br>4. Click nút `Login` | Email: `admin@example.com`<br>Password: `wrongpass_20260802` | 4. Trang tải lại; `div.alert.alert-danger` hiển thị `Invalid email or password` — **giống hệt** thông báo của TC_021 (email không tồn tại) | High | Yes | UI | @Security @Regression @Negative |
| CRM_LOGIN_TC_027 | REQ-LOGIN-05 | Login | High | Password KHÔNG được trim — thừa khoảng trắng cuối gây đăng nhập thất bại | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `123456·` (đúng mật khẩu + 1 khoảng trắng cuối)<br>4. Click nút `Login` | Email: `admin@example.com`<br>Password: `123456␣` | 4. Trang tải lại; `div.alert.alert-danger` hiển thị `Invalid email or password`; KHÔNG vào được Dashboard | High | Yes | UI | @Boundary @Negative @Regression |
| CRM_LOGIN_TC_028 | REQ-LOGIN-05 | Login | Medium | Password phân biệt chữ hoa/thường | Chưa đăng nhập; cần mật khẩu có chữ cái — dùng biến thể sai của mật khẩu thật | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `Abc123456` (khác hoa/thường so với mật khẩu đúng `123456`)<br>4. Click nút `Login` | Email: `admin@example.com`<br>Password: `Abc123456` | 4. Trang tải lại; `div.alert.alert-danger` hiển thị `Invalid email or password` | Medium | Yes | UI | @Negative @Regression |
| CRM_LOGIN_TC_029 | REQ-LOGIN-05, REQ-LOGIN-10 | Login | Medium | Password chỉ chứa khoảng trắng được coi là có giá trị (không trim) | Chưa đăng nhập — áp dụng ASM-12 | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập vào Password 3 ký tự khoảng trắng: `···`<br>4. Click nút `Login` | Email: `admin@example.com`<br>Password: `␣␣␣` | 4. Trang tải lại; `div.alert.alert-danger` hiển thị `Invalid email or password` (KHÔNG phải `The Password field is required.`) | Medium | Yes | UI | @Boundary @Negative |
| CRM_LOGIN_TC_030 | REQ-LOGIN-08 | Login | Low | Password cực dài (1000 ký tự) không gây lỗi hệ thống | Chưa đăng nhập — áp dụng ASM-07 | 1. Mở `/admin/authentication`<br>2. Nhập Email: `notexist_longpass_20260802@auto.test`<br>3. Nhập Password gồm 1000 ký tự `x` liên tiếp<br>4. Click nút `Login` | Email: `notexist_longpass_20260802@auto.test`<br>Password: `xxx…x` (`x`×1000) | 4. Trang tải lại với HTTP 200 và `div.alert.alert-danger` hiển thị `Invalid email or password`; KHÔNG có lỗi HTTP 500/502, KHÔNG treo trang | Low | Yes | UI | @Boundary @Negative |
| CRM_LOGIN_TC_031 | REQ-LOGIN-08 | Login | High | Chuỗi SQL Injection ở ô Password không bypass được xác thực | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `' OR 1=1--`<br>4. Click nút `Login` | Email: `admin@example.com`<br>Password: `' OR 1=1--` | 4. KHÔNG đăng nhập được — ở lại `/admin/authentication` với `div.alert.alert-danger` hiển thị `Invalid email or password`; KHÔNG có lỗi 500 hay thông tin SQL lộ ra trang | Critical | Yes | API | @Security @Negative |

### Nhóm E — Lỗi kết hợp nhiều trường (1 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_032 | REQ-LOGIN-11 | Login | Medium | Bỏ trống cả Email và Password → hiển thị đồng thời 2 thông báo lỗi | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Để trống cả ô `Email Address` và ô `Password`<br>3. Click nút `Login` | Email: `` (rỗng)<br>Password: `` (rỗng) | 3. Trang tải lại tại `/admin/authentication`; hiển thị **2** khối `div.alert.alert-danger`, nội dung tổng hợp chứa cả `The Password field is required.` và `The Email Address field is required.` (KHÔNG assert theo thứ tự hiển thị — xem RISK-06) | Medium | Yes | UI | @Regression @Negative |

### Nhóm F — Checkbox Remember me (2 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_033 | REQ-LOGIN-07 | Login | Low | Checkbox "Remember me" mặc định không được tick | Chưa đăng nhập, đã xoá cookie | 1. Mở `/admin/authentication`<br>2. Kiểm tra trạng thái checkbox `Remember me` (`#remember`) | N/A | 2. Checkbox ở trạng thái **unchecked** (`checked === false`) và ở trạng thái enabled | Low | Yes | UI | @Regression |
| CRM_LOGIN_TC_035 | REQ-LOGIN-07 | Login | Medium | Tick rồi bỏ tick "Remember me" → không tạo cookie autologin | Chưa đăng nhập, đã xoá toàn bộ cookie của domain | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `123456`<br>4. Tick `Remember me`<br>5. Bỏ tick `Remember me`<br>6. Click nút `Login`<br>7. Kiểm tra Cookies trong DevTools | Email: `admin@example.com`<br>Password: `123456`<br>Remember: tick → bỏ tick | 5. Checkbox trở về trạng thái unchecked<br>6. Chuyển hướng tới `/admin/`, title `Dashboard`<br>7. KHÔNG tồn tại cookie tên `autologin` | Medium | Yes | UI | @Regression @Negative |

> TC_034 đã được gộp vào CRM_LOGIN_TC_011 (nhóm B) để tránh trùng lặp — mã TC_034 **không sử dụng**.

### Nhóm G — Bảo vệ route & vòng đời phiên (7 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_036 | REQ-LOGIN-18 | Login | High | Truy cập route quản trị khi chưa đăng nhập bị chuyển về trang login | Chưa đăng nhập, đã xoá toàn bộ cookie của domain | 1. Mở trực tiếp `https://crm.anhtester.com/admin/clients`<br>2. Quan sát URL và nội dung trang | URL: `/admin/clients` | 2. Bị chuyển hướng tới `https://crm.anhtester.com/admin/authentication`, trang hiển thị form Login; KHÔNG thấy dữ liệu của trang Clients | Critical | Yes | UI | @Security @Smoke @CriticalPath |
| CRM_LOGIN_TC_037 | REQ-LOGIN-19 | Login | Medium | Sau đăng nhập luôn về Dashboard, không quay lại trang đích ban đầu | Chưa đăng nhập — áp dụng ASM-10 | 1. Mở trực tiếp `https://crm.anhtester.com/admin/clients`<br>2. Bị chuyển về trang login<br>3. Nhập Email: `admin@example.com`<br>4. Nhập Password: `123456`<br>5. Click nút `Login` | URL đích ban đầu: `/admin/clients`<br>Email: `admin@example.com`<br>Password: `123456` | 2. URL là `/admin/authentication`<br>5. Chuyển hướng tới `https://crm.anhtester.com/admin/` (Dashboard) — **KHÔNG** quay lại `/admin/clients` | Medium | Yes | UI | @Regression |
| CRM_LOGIN_TC_038 | REQ-LOGIN-20 | Login | Medium | Người đã đăng nhập truy cập trang login bị chuyển về Dashboard | Đã đăng nhập thành công bằng `admin@example.com` | 1. Đang ở `/admin/` (Dashboard)<br>2. Mở trực tiếp `https://crm.anhtester.com/admin/authentication` | URL: `/admin/authentication` | 2. Bị chuyển hướng về `https://crm.anhtester.com/admin/`, title `Dashboard`; KHÔNG hiển thị lại form Login | Medium | Yes | UI | @Security @Regression |
| CRM_LOGIN_TC_039 | REQ-LOGIN-20 | Login | Low | Người đã đăng nhập truy cập trang Forgot Password bị chuyển về Dashboard | Đã đăng nhập thành công | 1. Đang ở `/admin/` (Dashboard)<br>2. Mở trực tiếp `https://crm.anhtester.com/admin/authentication/forgot_password` | URL: `/admin/authentication/forgot_password` | 2. Bị chuyển hướng về `https://crm.anhtester.com/admin/`; KHÔNG hiển thị form Forgot Password | Low | Yes | UI | @Security @Regression |
| CRM_LOGIN_TC_040 | REQ-LOGIN-21 | Login | High | Đăng xuất kết thúc phiên và trả người dùng về trang login | Đã đăng nhập thành công — áp dụng ASM-02 | 1. Đang ở `/admin/` (Dashboard)<br>2. Mở `https://crm.anhtester.com/admin/authentication/logout`<br>3. Quan sát URL và nội dung trang | URL: `/admin/authentication/logout` | 2. Bị chuyển hướng tới `https://crm.anhtester.com/admin/authentication`<br>3. Trang hiển thị form Login (field Email, field Password, nút Login) | High | Yes | UI | @Smoke @CriticalPath |
| CRM_LOGIN_TC_041 | REQ-LOGIN-21 | Login | High | Sau đăng xuất, route bảo vệ bị chặn trở lại | Vừa thực hiện đăng xuất thành công (tiếp nối TC_040) | 1. Sau khi logout, mở trực tiếp `https://crm.anhtester.com/admin/clients`<br>2. Quan sát URL và nội dung trang | URL: `/admin/clients` | 2. Bị chuyển hướng tới `/admin/authentication`, hiển thị form Login; KHÔNG truy cập được dữ liệu Clients | Critical | Yes | UI | @Security @CriticalPath |
| CRM_LOGIN_TC_042 | REQ-LOGIN-21 | Login | High | Sau đăng xuất, nút Back của trình duyệt không khôi phục được phiên | Vừa thực hiện đăng xuất thành công — áp dụng ASM-02 | 1. Sau khi logout, đang ở trang login<br>2. Nhấn nút **Back** của trình duyệt<br>3. Nhấn F5 tải lại trang đang hiển thị | N/A | 2. Nếu trình duyệt hiển thị trang Dashboard từ bộ nhớ đệm thì đó chỉ là bản cache tĩnh, KHÔNG có dữ liệu mới<br>3. Sau khi tải lại, bị chuyển hướng về `/admin/authentication` — KHÔNG vào lại được Dashboard | High | Yes | UI | @Security @Regression |

### Nhóm H — Bảo vệ CSRF (3 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_043 | REQ-LOGIN-15 | Login | High | CSRF token rỗng → request bị từ chối | Chưa đăng nhập, mở DevTools | 1. Mở `/admin/authentication`<br>2. Chạy Console: `document.querySelector('[name="csrf_token_name"]').value = ""`<br>3. Nhập Email: `admin@example.com`<br>4. Nhập Password: `123456`<br>5. Click nút `Login` | CSRF token: `` (rỗng)<br>Email: `admin@example.com`<br>Password: `123456` | 5. Server trả về **HTTP 403**; trang lỗi toàn màn hình có title `Error` hiển thị `419 Page Expired!` và `Sorry, the page has expired, return to previous page and refresh to continue.`; KHÔNG tạo phiên đăng nhập | Critical | Yes | API | @Security @CriticalPath |
| CRM_LOGIN_TC_044 | REQ-LOGIN-15 | Login | High | CSRF token sai giá trị → request bị từ chối | Chưa đăng nhập, mở DevTools | 1. Mở `/admin/authentication`<br>2. Chạy Console: `document.querySelector('[name="csrf_token_name"]').value = "00000000000000000000000000000000"`<br>3. Nhập Email: `admin@example.com`<br>4. Nhập Password: `123456`<br>5. Click nút `Login` | CSRF token: `00000000000000000000000000000000` (32 ký tự hex sai)<br>Email: `admin@example.com`<br>Password: `123456` | 5. Server trả về **HTTP 403** kèm trang `419 Page Expired!`; KHÔNG chuyển tới Dashboard, KHÔNG tạo phiên đăng nhập | Critical | Yes | API | @Security @CriticalPath |
| CRM_LOGIN_TC_045 | REQ-LOGIN-16 | Login | Medium | CSRF token của lần tải trang cũ không dùng lại được | Chưa đăng nhập — áp dụng ASM-13 | 1. Mở `/admin/authentication` ở Tab A, ghi lại token T1<br>2. Mở `/admin/authentication` ở Tab B (token mới T2 được sinh)<br>3. Quay lại Tab A, nhập Email: `admin@example.com`<br>4. Nhập Password: `123456`<br>5. Click nút `Login` tại Tab A (form vẫn mang token cũ T1) | Token dùng: T1 (của Tab A)<br>Email: `admin@example.com`<br>Password: `123456` | 1. T1 là chuỗi hex 32 ký tự<br>2. T2 ≠ T1<br>5. Request bị từ chối với **HTTP 403** kèm trang `419 Page Expired!` (nếu hệ thống chấp nhận T1 → ghi nhận là sai lệch so với ASM-13, cần xác nhận với dev) | Medium | Partial | UI | @Security @Regression |

### Nhóm I — Non-Functional & Scenarios chuyên sâu (10 TC)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_LOGIN_TC_046 | REQ-LOGIN-02 | Login | Medium | Double click nút Login không tạo lỗi hoặc phiên trùng lặp | Chưa đăng nhập, mở tab Network trong DevTools | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Nhập Password: `123456`<br>4. Double click **nhanh liên tiếp** vào nút `Login`<br>5. Kiểm tra tab Network | Email: `admin@example.com`<br>Password: `123456` | 4. Chuyển hướng tới `/admin/` (Dashboard) đúng 1 lần, KHÔNG hiển thị trang lỗi hay `419 Page Expired!`<br>5. Chỉ có **1** request POST tới `/admin/authentication` được server xử lý thành công | Medium | Partial | UI | @Regression @RaceCondition |
| CRM_LOGIN_TC_047 | REQ-LOGIN-22 | Login | Medium | Điều hướng và submit form hoàn toàn bằng bàn phím | Chưa đăng nhập | 1. Mở `/admin/authentication` (con trỏ ở ô Email)<br>2. Gõ `admin@example.com`<br>3. Nhấn `Tab` → gõ `123456`<br>4. Nhấn `Tab` → nhấn `Space`<br>5. Nhấn `Enter` | Email: `admin@example.com`<br>Password: `123456` | 2. Ký tự vào đúng ô Email<br>3. Focus chuyển sang ô Password, giá trị nhập đúng<br>4. Focus chuyển tới checkbox `Remember me`, `Space` tick checkbox và viền focus hiển thị rõ<br>5. Form submit → chuyển tới `/admin/` (Dashboard) | Medium | Partial | UI | @Accessibility @Regression |
| CRM_LOGIN_TC_048 | REQ-LOGIN-08 | Login | Low | Sau khi đăng nhập thất bại, cả 2 ô nhập bị xoá trắng | Chưa đăng nhập | 1. Mở `/admin/authentication`<br>2. Nhập Email: `notexist_clear_20260802@auto.test`<br>3. Nhập Password: `123456`<br>4. Click nút `Login`<br>5. Quan sát giá trị 2 ô nhập sau khi trang tải lại | Email: `notexist_clear_20260802@auto.test`<br>Password: `123456` | 4. Hiển thị `Invalid email or password`<br>5. Ô `Email Address` và ô `Password` đều rỗng (`value === ""`) — người dùng phải nhập lại từ đầu | Low | Yes | UI | @Regression @UX |
| CRM_LOGIN_TC_049 | REQ-LOGIN-23 | Login | Low | Ô Password cho phép dán (paste) giá trị từ clipboard | Chưa đăng nhập; clipboard đã copy sẵn chuỗi `123456` | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com`<br>3. Click vào ô `Password`, nhấn `Ctrl+V`<br>4. Click nút `Login` | Clipboard: `123456`<br>Email: `admin@example.com` | 3. Ô Password nhận đủ 6 ký tự (hiển thị 6 chấm tròn) — thao tác paste KHÔNG bị chặn<br>4. Chuyển hướng tới `/admin/` (Dashboard) | Low | Partial | UI | @UX @Regression |
| CRM_LOGIN_TC_050 | REQ-LOGIN-08 | Login | High | Nhập sai 6 lần liên tiếp không kích hoạt khoá tài khoản | Chưa đăng nhập — áp dụng ASM-01. **BẮT BUỘC** dùng email KHÔNG tồn tại để tránh khoá tài khoản dùng chung (RISK-01) | 1. Mở `/admin/authentication`<br>2. Nhập Email: `notexist_brute_20260802@auto.test` và Password: `wrong_1`, click `Login`<br>3. Lặp lại bước 2 thêm 5 lần với password `wrong_2` → `wrong_6`<br>4. Quan sát thông báo ở lần thứ 6 | Email: `notexist_brute_20260802@auto.test`<br>Password: `wrong_1` … `wrong_6` (6 lần) | 2. Hiển thị `Invalid email or password`<br>3. Mỗi lần đều hiển thị `Invalid email or password`<br>4. Lần thứ 6 vẫn là `Invalid email or password` — KHÔNG có thông báo khoá tài khoản, KHÔNG có CAPTCHA, KHÔNG bị chặn HTTP 429 | High | Yes | UI | @Security @Regression |
| CRM_LOGIN_TC_051 | REQ-LOGIN-01 | Login | Low | Trang login hiển thị đúng trên viewport mobile | Chưa đăng nhập | 1. Mở DevTools → chế độ Device, chọn viewport 375×812<br>2. Mở `/admin/authentication`<br>3. Quan sát bố cục trang | Viewport: 375×812 | 3. Toàn bộ thành phần (logo, heading `Login`, 2 field, checkbox, nút `Login`, link `Forgot Password?`) hiển thị đầy đủ, không bị tràn ngang, không có thanh cuộn ngang | Low | Partial | UI | @Responsive @Regression |
| CRM_LOGIN_TC_052 | REQ-LOGIN-01 | Login | Low | Trang chặn zoom trên mobile — ghi nhận vi phạm WCAG 1.4.4 | Chưa đăng nhập, viewport mobile 375×812 | 1. Mở `/admin/authentication` ở viewport mobile<br>2. Thực hiện thao tác pinch-zoom trên trang<br>3. Kiểm tra thẻ `<meta name="viewport">` trong DOM | Viewport: 375×812 | 2. Trang KHÔNG phóng to được<br>3. Meta viewport chứa `user-scalable=no` và `maximum-scale=1` → **ghi nhận defect accessibility (WCAG 1.4.4)**, báo cáo cho dev | Low | No | N/A | @Accessibility |
| CRM_LOGIN_TC_053 | REQ-LOGIN-02 | Login | Medium | Mất kết nối mạng khi submit → không tạo phiên đăng nhập | Chưa đăng nhập — áp dụng ASM-14 | 1. Mở `/admin/authentication`<br>2. Nhập Email: `admin@example.com` và Password: `123456`<br>3. Mở DevTools → Network → chọn `Offline`<br>4. Click nút `Login`<br>5. Chuyển Network về `Online`, mở `https://crm.anhtester.com/admin/clients` | Email: `admin@example.com`<br>Password: `123456`<br>Network: Offline khi submit | 4. Trình duyệt hiển thị trang lỗi kết nối mặc định (VD Chrome: `ERR_INTERNET_DISCONNECTED`), KHÔNG vào Dashboard<br>5. Bị chuyển hướng về `/admin/authentication` — xác nhận KHÔNG có phiên đăng nhập nào được tạo | Medium | Partial | UI | @Network @Negative |
| CRM_LOGIN_TC_054 | REQ-LOGIN-02 | Login | Medium | Đăng nhập thành công trên mạng chậm (Slow 3G) | Chưa đăng nhập | 1. Mở DevTools → Network → chọn `Slow 3G`<br>2. Mở `/admin/authentication`<br>3. Nhập Email: `admin@example.com` và Password: `123456`<br>4. Click nút `Login` và chờ tới khi trang tải xong | Email: `admin@example.com`<br>Password: `123456`<br>Network: Slow 3G | 2. Trang login tải đầy đủ, không lỗi<br>4. Chuyển hướng tới `/admin/` (Dashboard) thành công, không lỗi timeout; ghi nhận: KHÔNG có chỉ báo loading nào trong lúc chờ (điểm trừ UX theo mục 10 requirement) | Medium | Partial | UI | @Network @Regression |
| CRM_LOGIN_TC_055 | REQ-LOGIN-12 | Login | Low | Nhập tiếng Việt có dấu vào Email bị chặn định dạng | Chưa đăng nhập, dùng Chrome | 1. Mở `/admin/authentication`<br>2. Nhập Email: `nguyễnvănà@auto.test`<br>3. Nhập Password: `123456`<br>4. Click nút `Login` | Email: `nguyễnvănà@auto.test`<br>Password: `123456` | 4. Form KHÔNG submit (`validity.typeMismatch === true`) HOẶC trang tải lại với `The Email Address field must contain a valid email address.`; KHÔNG đăng nhập được, KHÔNG lỗi 500, ký tự tiếng Việt hiển thị đúng không bị vỡ mã (mojibake) | Low | Partial | UI | @Localization @Negative |

---

## 4. Bảng Đối Soát Coverage (Self-Quality Gate — Tiêu chí 6)

| REQ ID | Mô tả ngắn | Số TC | TC IDs | Đủ Positive / Negative / Boundary? |
|---|---|---|---|---|
| REQ-LOGIN-01 | Hiển thị trang đăng nhập | 4 | TC_001, TC_007, TC_051, TC_052 | ✅ (P: 001/007/051 · N: 052 defect a11y) |
| REQ-LOGIN-02 | Đăng nhập thành công | 4 | TC_008, TC_046, TC_053, TC_054 | ✅ (P: 008/054 · N: 053 · Edge: 046) |
| REQ-LOGIN-03 | Email không phân biệt hoa/thường | 2 | TC_009, TC_012 | ✅ (P: 009/012 — EP đủ 2 partition hoa/xen kẽ) |
| REQ-LOGIN-04 | Trim khoảng trắng email | 2 | TC_010, TC_014 | ✅ (P: 010 · B/N: 014) |
| REQ-LOGIN-05 | Password so khớp tuyệt đối | 3 | TC_027, TC_028, TC_029 | ✅ (N: 028 · B: 027/029) |
| REQ-LOGIN-06 | Remember me tạo cookie | 1 | TC_011 | ✅ (P: 011 — mặt negative do REQ-07 phủ) |
| REQ-LOGIN-07 | Không tick → không tạo cookie | 3 | TC_008, TC_033, TC_035 | ✅ (P: 033 · N: 008/035) |
| REQ-LOGIN-08 | Thông báo lỗi không tiết lộ thông tin | 8 | TC_021, TC_023, TC_024, TC_026, TC_030, TC_031, TC_048, TC_050 | ✅ (N: 021/026 · Sec: 023/024/031/050 · B: 030) |
| REQ-LOGIN-09 | Bắt buộc nhập Email | 2 | TC_013, TC_014 | ✅ (N: 013 · B: 014) |
| REQ-LOGIN-10 | Bắt buộc nhập Password | 2 | TC_025, TC_029 | ✅ (N: 025 · B: 029) |
| REQ-LOGIN-11 | Hiển thị đồng thời nhiều lỗi | 1 | TC_032 | ✅ (N: 032 — tổ hợp R6 của Decision Table) |
| REQ-LOGIN-12 | Chặn định dạng email tại trình duyệt | 6 | TC_015, TC_016, TC_017, TC_022, TC_055 | ✅ (N: 015/016/017 · Localization: 022/055) |
| REQ-LOGIN-13 | Kiểm tra định dạng email tại server | 1 | TC_018 | ✅ (N: 018 — tổ hợp R7 của Decision Table) |
| REQ-LOGIN-14 | Từ chối email vượt độ dài | 2 | TC_019, TC_020 | ✅ (BVA đủ cặp biên: 254 max / 261 max+) |
| REQ-LOGIN-15 | Bảo vệ CSRF | 2 | TC_043, TC_044 | ✅ (N: 043 rỗng · 044 sai giá trị) |
| REQ-LOGIN-16 | CSRF token sinh mới mỗi lần tải trang | 2 | TC_005, TC_045 | ✅ (P: 005 · N: 045) |
| REQ-LOGIN-17 | Điểm vào Quên mật khẩu | 1 | TC_006 | ✅ (P: 006 — mặt chặn khi đã ĐN do REQ-20 phủ) |
| REQ-LOGIN-18 | Bảo vệ route quản trị | 1 | TC_036 | ✅ (N: 036 — mặt positive do REQ-21 TC_041 phủ) |
| REQ-LOGIN-19 | Luôn về Dashboard sau đăng nhập | 1 | TC_037 | ✅ (P: 037) |
| REQ-LOGIN-20 | Chặn trang login khi đã đăng nhập | 2 | TC_038, TC_039 | ✅ (N: 038 login · 039 forgot password) |
| REQ-LOGIN-21 | Đăng xuất | 3 | TC_040, TC_041, TC_042 | ✅ (P: 040 · N: 041/042) |
| REQ-LOGIN-22 | Autofocus ô Email | 2 | TC_002, TC_047 | ✅ (P: 002 · A11y: 047) |
| REQ-LOGIN-23 | Che giấu mật khẩu | 2 | TC_003, TC_049 | ✅ (P: 003/049) |
| REQ-LOGIN-24 | Truyền tải an toàn HTTPS | 1 | TC_004 | ✅ (P: 004 — có kiểm chứng redirect từ HTTP) |

**Kết luận Coverage: 24/24 REQ được phủ — KHÔNG có REQ nào 0 TC (🔴 = 0).**

### Bao phủ Component-Level Checklist

| Component | Trạng thái | Ghi chú |
|---|---|---|
| Data Table / List | ⚪ Không áp dụng | Module Login không có bảng/danh sách dữ liệu |
| CRUD Lifecycle | ⚪ Không áp dụng | Login không tạo/sửa/xoá entity nghiệp vụ |
| Permission / Role | 🟡 Áp dụng một phần | Chỉ có 1 tài khoản Administrator (ASM-05) → dùng **ma trận trạng thái xác thực** thay ma trận role: TC_036 → TC_042 |
| Modal / Dialog | ⚪ Không áp dụng | Không có modal trên trang login |
| Notification / Toast | 🟡 Thay bằng alert tĩnh | Lỗi hiển thị qua `div.alert.alert-danger` sau reload (không phải toast): TC_013, 021, 025, 026, 032 |
| Status Flow | ✅ Đã phủ | State Transition phiên đăng nhập (mục 2.2) — mọi ô ✅/⛔ đều có TC |

### Self-Quality Gate — 6 tiêu chí

| # | Tiêu chí | Kết quả |
|---|---|---|
| 1 | Unique TC ID (`CRM_LOGIN_TC_xxx`) | ✅ 54 TC, không trùng mã (TC_034 chủ động không dùng — đã ghi chú) |
| 2 | Test Steps đánh số khớp 1-1 với Expected Result | ✅ 54/54 |
| 3 | Test Data cụ thể, không placeholder mơ hồ | ✅ 54/54 |
| 4 | Mỗi input field có ≥1 Positive + ≥2 Negative/Boundary | ✅ 4/4 field (xem mục 2.4) |
| 5 | Đủ metadata `Automatable` / `Auto Type` / `@Tags` | ✅ 54/54 |
| 6 | Mọi REQ có ≥1 TC | ✅ 24/24 REQ |

---

## 5. Thống Kê

| Phân loại | Chi tiết |
|---|---|
| **Tổng số TC** | **54** |
| **Theo Priority** | Critical: 9 · High: 14 · Medium: 20 · Low: 11 |
| **Theo Risk Level** | High: 22 · Medium: 20 · Low: 12 |
| **Theo Automatable** | Yes: 41 · Partial: 12 · No: 1 |
| **Theo Auto Type** | UI: 48 · API: 5 · N/A: 1 |
| **Bộ Smoke (@Smoke)** | TC_001, TC_004, TC_008, TC_036, TC_040 (5 TC) |
| **Bộ Critical Path** | TC_001, TC_008, TC_011, TC_023, TC_031, TC_036, TC_040, TC_041, TC_043, TC_044 (10 TC) |
| **Bộ Security (@Security)** | 17 TC |

---

## 6. Gap & Việc Cần Làm Tiếp

| # | Nội dung | Lý do chưa sinh TC | Hành động cần |
|---|---|---|---|
| 1 | Tài khoản staff **inactive** đăng nhập | Chưa có tài khoản để kiểm chứng (ASM-04 / AMB-04) | Yêu cầu PO cấp 1 tài khoản inactive → bổ sung 1–2 TC |
| 2 | Đăng nhập bằng **role khác Administrator** | Chỉ có 1 tài khoản (ASM-05 / AMB-05) | Yêu cầu PO cấp tài khoản Staff thường → bổ sung ma trận phân quyền đăng nhập |
| 3 | **Hết hạn Remember me** và **session idle timeout** | Không xác định được thời hạn (ASM-03 / AMB-03) | Xin dev cấu hình thời hạn → bổ sung TC hết hạn (nhiều khả năng chỉ test thủ công hoặc qua giả lập thời gian) |
| 4 | Xác nhận **lockout / rate-limit** | Chưa dám kiểm chứng bằng tài khoản thật (ASM-01 / AMB-01 — 🔴 High) | PO/dev xác nhận có/không lockout. Nếu **có** → TC_050 phải viết lại hoàn toàn và tách nhóm chạy riêng |
| 5 | Cookie `autologin` **tồn đọng sau logout** | Ghi nhận là hành vi hiện tại, chưa có tiêu chí đúng/sai (ASM-02 / AMB-02 — 🔴 High) | Dev xác nhận có cần xoá cookie phía client không → nếu có, bổ sung assert vào TC_040 |
| 6 | Luồng đầy đủ **Forgot Password** | Ngoài phạm vi tài liệu requirement | Chạy `/generate_requirements_from_website` cho module Forgot Password trước |

---

## 7. Bước Tiếp Theo

| Workflow | Mục đích |
|---|---|
| `/review_testcases` | Review chất lượng bộ TC này theo rubric 6 tiêu chí |
| `/generate_automation_from_testcases` | Chuyển 41 TC `Automatable = Yes` thành Playwright/Selenium scripts |
| `/generate_traceability_matrix` | Sinh RTM 3 tầng: Requirements ↔ Test Cases ↔ Automation Scripts |
| `/generate_test_data` | Sinh bộ data biên (email 254/261 ký tự, password 1000 ký tự) cho TC_019, TC_020, TC_030 |
