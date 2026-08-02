# Tài Liệu Yêu Cầu — Module Login (Perfex CRM)

| Thông tin | Nội dung |
|---|---|
| Hệ thống | CRM (Perfex CRM — Anh Tester Demo) |
| Module | Login (Admin Authentication) |
| URL | https://crm.anhtester.com/admin/authentication |
| Tài khoản khảo sát | `admin@example.com` / `123456` (role: Administrator) |
| Phương pháp | Inspect DOM thực tế bằng Playwright MCP — viewport 1920×1080, headed mode |
| Ngày khảo sát | 2026-08-02 |
| Bằng chứng | [Ảnh giao diện](evidence/login/login_page_1920x1080.png) |
| Phiên bản | 1.0 |

---

## 1. Tổng Quan (Overview)

Module Login là cổng xác thực duy nhất cho khu vực quản trị (`/admin`) của hệ thống CRM. Người dùng nội bộ (staff/admin) nhập **Email Address** và **Password** để truy cập Dashboard. Module cung cấp thêm tuỳ chọn **Remember me** (duy trì đăng nhập qua cookie) và liên kết **Forgot Password** để khôi phục mật khẩu.

**Phạm vi tài liệu:**
- ✅ Trong phạm vi: form đăng nhập, validation, thông báo lỗi, phiên đăng nhập, Remember me, bảo vệ route, logout, CSRF.
- ❌ Ngoài phạm vi: luồng hoàn chỉnh của trang Forgot Password (chỉ ghi nhận điểm vào), đăng nhập của Client Portal, đăng ký tài khoản (không tồn tại trên UI).

**Đặc điểm kỹ thuật quan trọng:**
- Trang **không tải bất kỳ file JavaScript nào** — không có validation phía client bằng JS. Chỉ có validation native HTML5 (do `type="email"`) và validation phía server (CodeIgniter form validation).
- Form submit dạng POST truyền thống (không AJAX), kèm CSRF token ẩn `csrf_token_name`.

---

## 2. Yêu Cầu Chức Năng (Functional Requirements)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-LOGIN-01 | Hiển thị trang đăng nhập | Người dùng chưa xác thực truy cập `/admin/authentication` được thấy form đăng nhập | Trang hiển thị: logo công ty, heading `Login`, field Email Address, field Password, checkbox Remember me, nút Login, link Forgot Password | UI thực tế |
| REQ-LOGIN-02 | Đăng nhập thành công | Nhập email + password hợp lệ → vào hệ thống | Sau khi submit, hệ thống chuyển hướng tới `https://crm.anhtester.com/admin/` với title trang là `Dashboard` | UI thực tế |
| REQ-LOGIN-03 | Email không phân biệt hoa/thường | Email được so khớp không phân biệt chữ hoa/thường | Nhập `ADMIN@EXAMPLE.COM` + password đúng → đăng nhập thành công | Kiểm chứng thực tế |
| REQ-LOGIN-04 | Tự động loại bỏ khoảng trắng thừa của email | Khoảng trắng đầu/cuối email bị bỏ qua khi xác thực | Nhập `␣␣admin@example.com␣␣` + password đúng → đăng nhập thành công | Kiểm chứng thực tế |
| REQ-LOGIN-05 | Mật khẩu so khớp chính xác tuyệt đối | Mật khẩu KHÔNG bị trim và phân biệt hoa/thường | Nhập password `123456␣` (thừa 1 khoảng trắng cuối) → đăng nhập thất bại với thông báo `Invalid email or password` | Kiểm chứng thực tế |
| REQ-LOGIN-06 | Ghi nhớ đăng nhập | Tick "Remember me" → hệ thống tạo cookie duy trì phiên | Sau khi đăng nhập thành công có tick Remember me, trình duyệt tồn tại cookie `autologin` (chứa `user_id` và `key`) | Kiểm chứng thực tế |
| REQ-LOGIN-07 | Không ghi nhớ khi không chọn | Không tick "Remember me" → không tạo cookie ghi nhớ | Sau khi đăng nhập thành công không tick Remember me, cookie `autologin` KHÔNG được tạo | Kiểm chứng thực tế |
| REQ-LOGIN-08 | Thông báo lỗi xác thực không tiết lộ thông tin | Sai mật khẩu và email không tồn tại đều trả về cùng một thông báo | Cả 2 trường hợp đều hiển thị `Invalid email or password`, không phân biệt được email có tồn tại hay không | Kiểm chứng thực tế |
| REQ-LOGIN-09 | Bắt buộc nhập Email | Không được đăng nhập khi bỏ trống Email | Submit với email rỗng → hiển thị `The Email Address field is required.` và ở lại trang login | Kiểm chứng thực tế |
| REQ-LOGIN-10 | Bắt buộc nhập Password | Không được đăng nhập khi bỏ trống Password | Submit với password rỗng → hiển thị `The Password field is required.` và ở lại trang login | Kiểm chứng thực tế |
| REQ-LOGIN-11 | Hiển thị đồng thời nhiều lỗi bắt buộc | Bỏ trống cả 2 trường → hiển thị đủ 2 thông báo | Submit form rỗng → hiển thị đồng thời `The Password field is required.` và `The Email Address field is required.` | Kiểm chứng thực tế |
| REQ-LOGIN-12 | Chặn định dạng email sai tại trình duyệt | Trình duyệt chặn submit khi email sai định dạng (do `type="email"`) | Nhập `abc` vào Email rồi bấm Login → form KHÔNG submit, trình duyệt hiện tooltip native (VD Chrome: `Please include an '@' in the email address. 'abc' is missing an '@'.`) | Kiểm chứng thực tế |
| REQ-LOGIN-13 | Kiểm tra định dạng email tại server | Server vẫn validate định dạng email khi request vượt qua tầng client | POST email `abc` → hiển thị `The Email Address field must contain a valid email address.` | Kiểm chứng thực tế (qua request trực tiếp) |
| REQ-LOGIN-14 | Từ chối email vượt giới hạn độ dài chuẩn | Email quá dài bị coi là không hợp lệ | Nhập email dài 261 ký tự (`a`×250 + `@auto.test`) → hiển thị `The Email Address field must contain a valid email address.` | Kiểm chứng thực tế |
| REQ-LOGIN-15 | Bảo vệ CSRF | Mọi request đăng nhập phải kèm CSRF token hợp lệ | Submit với `csrf_token_name` sai hoặc rỗng → HTTP **403**, hiển thị trang lỗi `419 Page Expired! Sorry, the page has expired, return to previous page and refresh to continue.` | Kiểm chứng thực tế |
| REQ-LOGIN-16 | CSRF token được sinh mới mỗi lần tải trang | Token nằm trong input ẩn của form | Form chứa `<input type="hidden" name="csrf_token_name" value="...">`; giá trị phải lấy từ trang hiện tại, không hardcode | DOM thực tế |
| REQ-LOGIN-17 | Điểm vào Quên mật khẩu | Link "Forgot Password?" dẫn tới trang khôi phục mật khẩu | Click link → điều hướng tới `/admin/authentication/forgot_password`, trang hiển thị heading `Forgot Password`, 1 field `Email Address` và nút `Confirm` | Kiểm chứng thực tế |
| REQ-LOGIN-18 | Bảo vệ route quản trị | Truy cập trang nội bộ khi chưa đăng nhập bị chuyển về trang login | Truy cập `/admin/clients` khi chưa đăng nhập → chuyển hướng tới `/admin/authentication` | Kiểm chứng thực tế |
| REQ-LOGIN-19 | Luôn về Dashboard sau đăng nhập | Hệ thống KHÔNG lưu trang đích ban đầu để quay lại | Bị chặn tại `/admin/clients` → đăng nhập → hệ thống vào `/admin/` (Dashboard), KHÔNG quay lại `/admin/clients` | Kiểm chứng thực tế |
| REQ-LOGIN-20 | Chặn truy cập trang login khi đã đăng nhập | Người dùng đã xác thực không thấy lại form login | Đang đăng nhập, truy cập `/admin/authentication` hoặc `/admin/authentication/forgot_password` → chuyển hướng về `/admin/` (Dashboard) | Kiểm chứng thực tế |
| REQ-LOGIN-21 | Đăng xuất | Người dùng kết thúc phiên làm việc | Truy cập `/admin/authentication/logout` → chuyển về `/admin/authentication`; sau đó truy cập route bảo vệ vẫn bị chặn về trang login | Kiểm chứng thực tế |
| REQ-LOGIN-22 | Con trỏ tự động vào ô Email | Tăng tốc thao tác nhập liệu | Mở trang login → `document.activeElement` là input `#email` (thuộc tính `autofocus`) | DOM thực tế |
| REQ-LOGIN-23 | Che giấu mật khẩu khi nhập | Mật khẩu không hiển thị dạng chữ thường | Input Password có `type="password"`; ký tự hiển thị dạng chấm tròn; **không có** nút bật/tắt xem mật khẩu | DOM thực tế |
| REQ-LOGIN-24 | Truyền tải an toàn | Trang đăng nhập chạy trên kênh mã hoá | `location.protocol` là `https:` | Kiểm chứng thực tế |

---

## 3. Đặc Tả Trường Dữ Liệu (Field Specifications)

| Field (Label) | Loại UI | Định danh DOM | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|---|
| Email Address | Textbox | `id="email"`, `name="email"`, `type="email"`, `class="form-control"` | ✅ Có (server-side) | Định dạng: email hợp lệ (validate 2 tầng: HTML5 native + server). Không có `maxlength` / `minlength` / `pattern` trong HTML. Chuỗi 261 ký tự bị từ chối. Giá trị mặc định: rỗng. Không phân biệt hoa/thường, tự trim khoảng trắng | REQ-LOGIN-03, 04, 09, 12, 13, 14, 22 | Có thuộc tính `autofocus="1"`. Thuộc tính `required` **không** được khai báo ở HTML → không có validation "bắt buộc" phía client |
| Password | Textbox (password) | `id="password"`, `name="password"`, `type="password"`, `class="form-control"` | ✅ Có (server-side) | Không có `maxlength` / `minlength` / `pattern` trong HTML. Giá trị mặc định: rỗng. So khớp chính xác — phân biệt hoa/thường, KHÔNG trim khoảng trắng | REQ-LOGIN-05, 10, 23 | Không có chức năng hiện/ẩn mật khẩu |
| Remember me | Checkbox | `id="remember"`, `name="remember"`, `value="estimate"` | ❌ Không | Mặc định: **không tick**. Khi tick → sinh cookie `autologin` | REQ-LOGIN-06, 07 | ⚠️ Thuộc tính `value="estimate"` là giá trị bất thường cho checkbox ghi nhớ đăng nhập — xem AMB-06 |
| (ẩn) CSRF Token | Hidden input | `name="csrf_token_name"` | ✅ Có | Giá trị chuỗi hex 32 ký tự, sinh theo phiên/trang | REQ-LOGIN-15, 16 | Không hiển thị với người dùng nhưng bắt buộc trong mọi request POST |
| Login | Button | `button[type="submit"]`, `class="btn btn-primary btn-block"` | — | Luôn ở trạng thái enabled (không phụ thuộc trạng thái field) | REQ-LOGIN-02 | Submit form POST tới `/admin/authentication` |
| Forgot Password? | Link | `a[href="…/authentication/forgot_password"]` | — | — | REQ-LOGIN-17 | — |
| Logo công ty | Image (link) | `img[alt="Perfex CRM \| Anh Tester Demo"]` trong `a[href="https://crm.anhtester.com/"]` | — | — | REQ-LOGIN-01 | Click logo → về trang chủ hệ thống |

---

## 4. Business Rules & Validation Messages

> Thông báo lỗi hiển thị trong khối `div.alert.alert-danger.text-center` phía trên form. Nội dung ghi **nguyên văn** từ hệ thống thực tế (tiếng Anh).

| REQ ID | Rule / Trigger | Thông báo lỗi mong đợi (nguyên văn) | Nơi hiển thị |
|---|---|---|---|
| REQ-LOGIN-09 | Submit khi Email rỗng | `The Email Address field is required.` | `div.alert.alert-danger` |
| REQ-LOGIN-10 | Submit khi Password rỗng | `The Password field is required.` | `div.alert.alert-danger` |
| REQ-LOGIN-11 | Submit khi cả 2 trường rỗng | Hiển thị 2 alert riêng biệt, thứ tự quan sát được: `The Password field is required.` rồi `The Email Address field is required.` | 2 khối `div.alert.alert-danger` |
| REQ-LOGIN-12 | Email sai định dạng (chặn tại trình duyệt) | Tooltip native của trình duyệt, VD Chrome: `Please include an '@' in the email address. 'abc' is missing an '@'.` | Tooltip native (KHÔNG phải DOM) |
| REQ-LOGIN-13 | Email sai định dạng tới được server | `The Email Address field must contain a valid email address.` | `div.alert.alert-danger` |
| REQ-LOGIN-14 | Email vượt độ dài hợp lệ (261 ký tự) | `The Email Address field must contain a valid email address.` | `div.alert.alert-danger` |
| REQ-LOGIN-05, 08 | Email đúng + Password sai | `Invalid email or password` | `div.alert.alert-danger` |
| REQ-LOGIN-08 | Email không tồn tại trong hệ thống | `Invalid email or password` (giống hệt trường hợp sai mật khẩu) | `div.alert.alert-danger` |
| REQ-LOGIN-15 | CSRF token sai hoặc rỗng | Trang lỗi riêng (HTTP 403), title `Error`, nội dung: `419 Page Expired!` / `Sorry, the page has expired, return to previous page and refresh to continue.` | Trang lỗi toàn màn hình |

**Quy tắc nghiệp vụ bổ sung (không có thông báo lỗi):**

| REQ ID | Quy tắc |
|---|---|
| REQ-LOGIN-03 | Email so khớp **không phân biệt hoa/thường** |
| REQ-LOGIN-04 | Email **được trim** khoảng trắng đầu/cuối trước khi so khớp |
| REQ-LOGIN-05 | Password **không được trim** và **phân biệt hoa/thường** |
| REQ-LOGIN-19 | Sau đăng nhập luôn về `/admin/` — không hỗ trợ quay lại trang đích ban đầu (deep-link) |
| REQ-LOGIN-20 | Người đã đăng nhập bị chặn khỏi mọi trang thuộc `/admin/authentication/*` |

---

## 5. Ma Trận Phân Quyền

**Không áp dụng đầy đủ cho module này.**

Lý do: màn hình Login là điểm vào **trước khi xác thực** — mọi khách truy cập (chưa đăng nhập) đều có quyền truy cập form như nhau, không có sự khác biệt theo role. Sự khác biệt về quyền chỉ phát sinh **sau** khi đăng nhập, thuộc phạm vi các module nghiệp vụ khác.

Ma trận theo **trạng thái xác thực** (thay thế cho ma trận role):

| Hành động | Khách (chưa đăng nhập) | Đã đăng nhập (Administrator) |
|---|---|---|
| Xem form Login | ✅ | ❌ (bị chuyển về Dashboard — REQ-LOGIN-20) |
| Submit đăng nhập | ✅ | ❌ |
| Xem trang Forgot Password | ✅ | ❌ (bị chuyển về Dashboard) |
| Truy cập route quản trị (`/admin/clients`…) | ❌ (bị chuyển về Login — REQ-LOGIN-18) | ✅ |
| Đăng xuất | — (không có phiên) | ✅ |

> ⚠️ Chỉ được cung cấp **1 tài khoản duy nhất** (`admin@example.com`, role Administrator). Hành vi đăng nhập của các role khác (Staff thường, tài khoản bị vô hiệu hoá) **chưa được kiểm chứng** — xem AMB-04, AMB-05.

---

## 6. Ma Trận Trạng Thái (Session State Flow)

Module Login không quản lý entity có status nghiệp vụ. Tuy nhiên **phiên đăng nhập** có luồng trạng thái rõ ràng, mô tả như sau:

| Trạng thái hiện tại | Hành động | Điều kiện | Trạng thái kế tiếp | Kết quả quan sát được |
|---|---|---|---|---|
| Chưa đăng nhập | Submit form Login | Email + Password đúng, không tick Remember | Đã đăng nhập (phiên tạm) | Redirect `/admin/`; không có cookie `autologin` |
| Chưa đăng nhập | Submit form Login | Email + Password đúng, có tick Remember | Đã đăng nhập (có ghi nhớ) | Redirect `/admin/`; tạo cookie `autologin` |
| Chưa đăng nhập | Submit form Login | Thông tin sai / thiếu / CSRF lỗi | Chưa đăng nhập (giữ nguyên) | Ở lại trang login kèm thông báo lỗi tương ứng |
| Chưa đăng nhập | Truy cập route bảo vệ | — | Chưa đăng nhập | Redirect `/admin/authentication` |
| Đã đăng nhập | Truy cập `/admin/authentication` | — | Đã đăng nhập | Redirect `/admin/` (Dashboard) |
| Đã đăng nhập | Truy cập `/admin/authentication/logout` | — | Chưa đăng nhập | Redirect `/admin/authentication`; route bảo vệ bị chặn trở lại |

---

## 7. Điểm Mơ Hồ (Ambiguities)

| Mã | Câu hỏi cần làm rõ với PO/BA | Nguy cơ nếu không giải quyết | Mức độ | Assumption tạm (dùng để viết test) |
|---|---|---|---|---|
| AMB-01 | Hệ thống có cơ chế khoá tài khoản / giới hạn tần suất sau N lần đăng nhập sai không? Nếu có thì ngưỡng N là bao nhiêu, thời gian khoá bao lâu và thông báo hiển thị là gì? | Không có tiêu chí PASS/FAIL cho nhóm test bảo mật brute-force; nếu thực tế **có** khoá, test hàng loạt sẽ làm hỏng tài khoản dùng chung | 🔴 High | Đã thực hiện 6 lần sai liên tiếp với **email không tồn tại** → không quan sát thấy khoá hay đổi thông báo. **Không** thử với tài khoản thật để tránh khoá môi trường demo. Tạm giả định: không có lockout ở tầng ứng dụng |
| AMB-02 | Cookie `autologin` vẫn còn trong trình duyệt sau khi đăng xuất — đây là thiết kế hay lỗi? Phía server đã vô hiệu hoá token này chưa? | Rủi ro bảo mật (khôi phục phiên trái phép) và test "logout xoá sạch dấu vết" không có cơ sở đúng/sai | 🔴 High | Kiểm chứng cho thấy sau logout, route bảo vệ vẫn bị chặn → token phía server **đã** bị vô hiệu. Tạm giả định: cookie tồn đọng là vô hại nhưng cần báo dev dọn dẹp |
| AMB-03 | Thời hạn hiệu lực của "Remember me" là bao lâu (ngày/tháng)? Và thời gian timeout của phiên khi không thao tác là bao nhiêu? | Không thể viết test hết hạn phiên; không xác định được kỳ vọng khi người dùng quay lại sau X ngày | 🟡 Medium | Không quan sát được từ UI (cookie flags do server đặt). Tạm giả định theo mặc định Perfex CRM và **loại khỏi phạm vi test tự động** |
| AMB-04 | Tài khoản staff bị vô hiệu hoá (inactive) khi đăng nhập sẽ nhận thông báo gì — `Invalid email or password` hay thông báo riêng? | Thiếu 1 nhánh test quan trọng của luồng xác thực | 🟡 Medium | Chưa có tài khoản để kiểm chứng. Tạm giả định hiển thị thông báo riêng → cần PO cung cấp tài khoản inactive để xác nhận |
| AMB-05 | Có role nào khác Administrator bị chặn đăng nhập vào khu vực `/admin` không (VD: Client chỉ được vào Client Portal)? | Ma trận phân quyền đăng nhập chưa đầy đủ | 🟡 Medium | Tạm giả định mọi staff active đều đăng nhập được `/admin`; client dùng cổng riêng |
| AMB-06 | Checkbox "Remember me" có `value="estimate"` — giá trị này có ý nghĩa nghiệp vụ hay là lỗi sao chép từ module Estimate? | Nếu là lỗi, giá trị có thể bị đổi trong bản vá → automation dựa vào `value` sẽ gãy | 🟢 Low | Tạm giả định là giá trị "rác" không mang ý nghĩa. **Automation không được dựa vào `value`**, chỉ dựa vào `id="remember"` |
| AMB-07 | Độ dài tối đa được chấp nhận của Email và Password là bao nhiêu? | Không xác định được biên (boundary) để thiết kế test giá trị biên | 🟡 Medium | HTML không khai báo `maxlength`. Đã xác nhận email 261 ký tự bị từ chối. Tạm giả định giới hạn email theo chuẩn RFC (254 ký tự); password chưa rõ giới hạn trên |
| AMB-08 | Hệ thống có hỗ trợ xác thực hai lớp (2FA/OTP) không? Nếu có thì bật ở đâu? | Nếu 2FA được bật sau này, toàn bộ test đăng nhập hiện tại sẽ fail | 🟡 Medium | Không quan sát thấy bước 2FA nào trên UI. Tạm giả định: 2FA đang tắt |
| AMB-09 | Trang login chỉ có tiếng Anh và không có bộ chọn ngôn ngữ — hệ thống có yêu cầu đa ngôn ngữ ở màn hình này không? | Test assert theo chuỗi tiếng Anh sẽ gãy nếu bật đa ngôn ngữ | 🟢 Low | Tạm giả định giao diện login cố định tiếng Anh (`<html lang="en">`) |
| AMB-10 | Sau đăng nhập hệ thống luôn về Dashboard, không quay lại trang người dùng định truy cập — đây là yêu cầu nghiệp vụ hay thiếu sót UX? | Ảnh hưởng kỳ vọng của REQ-LOGIN-19; nếu là thiếu sót thì hành vi sẽ đổi trong tương lai | 🟢 Low | Ghi nhận hành vi hiện tại là đúng (REQ-LOGIN-19) và chờ xác nhận |

---

## 8. Rủi Ro Kiểm Thử (Risks)

| Mã | Tên rủi ro | Mô tả | Mitigation (cách giảm thiểu khi test) |
|---|---|---|---|
| RISK-01 | Khoá tài khoản demo dùng chung | Nếu hệ thống thực sự có lockout, việc chạy test negative đăng nhập sai lặp lại có thể khoá `admin@example.com` — chặn toàn bộ suite | Chỉ dùng **email random không tồn tại** cho test brute-force/negative; giới hạn số lần sai với tài khoản thật; tách nhóm test bảo mật chạy riêng |
| RISK-02 | Môi trường demo công khai, dữ liệu biến động | Nhiều người cùng dùng `crm.anhtester.com`; mật khẩu admin có thể bị đổi, dữ liệu bị xoá | Test module Login không phụ thuộc dữ liệu nghiệp vụ; đưa credentials vào biến môi trường/config để đổi nhanh; thêm smoke test kiểm tra credential trước khi chạy suite |
| RISK-03 | CSRF token thay đổi theo từng lần tải trang | Automation gọi API trực tiếp hoặc tái sử dụng token cũ sẽ nhận HTTP 403 `419 Page Expired!` — dễ bị hiểu nhầm thành lỗi ứng dụng | Luôn thực hiện đăng nhập qua UI thật (điền form → submit); nếu cần gọi API, phải lấy token từ chính trang hiện tại, tuyệt đối không hardcode |
| RISK-04 | Không có validation phía client (không có JS) | Mọi thông báo lỗi chỉ xuất hiện **sau khi tải lại trang** — test viết theo kiểu chờ lỗi hiện ngay tại chỗ sẽ flaky | Assert theo trạng thái trang sau submit (dùng web-first assertion trên `div.alert`), không kỳ vọng lỗi inline theo từng field |
| RISK-05 | Lỗi định dạng email do trình duyệt xử lý | Tooltip native của trình duyệt **không nằm trong DOM** và nội dung khác nhau giữa Chrome/Firefox/Edge | Không assert nội dung tooltip; thay vào đó assert form không submit (URL không đổi + `validity.typeMismatch === true`). Nếu cần assert message, kiểm chứng riêng theo từng trình duyệt |
| RISK-06 | Thông báo lỗi hiển thị dạng alert gộp, không gắn với field | Cả 2 lỗi "required" hiển thị chung một vùng, thứ tự do server quyết định (quan sát: Password trước Email) | Assert theo **nội dung chứa** trong vùng alert, không assert theo thứ tự hoặc chỉ số phần tử |
| RISK-07 | Cookie `autologin` lưu định danh người dùng ở phía client | Cookie chứa `user_id` dạng chuỗi serialize kèm `key` — nếu key yếu có thể bị giả mạo phiên | Đưa vào phạm vi security testing riêng; chức năng test chỉ xác minh sự tồn tại/không tồn tại của cookie, không kiểm tra nội dung |
| RISK-08 | Không có nút hiện/ẩn mật khẩu | Không thể xác minh trực quan giá trị đã nhập khi debug test | Xác minh qua giá trị thuộc tính `value` của input trong DOM khi cần debug |

---

## 9. Luồng Xử Lý (User Flows)

### 9.1. Luồng chính — Đăng nhập thành công (Happy Path)

```
1. Truy cập https://crm.anhtester.com/admin/authentication
2. Hệ thống hiển thị form Login, con trỏ tự động ở ô Email Address
3. Nhập Email hợp lệ (VD: admin@example.com)
4. Nhập Password đúng
5. (Tuỳ chọn) Tick "Remember me"
6. Click nút Login
7. Hệ thống xác thực → chuyển hướng tới /admin/ (Dashboard)
   → Nếu bước 5 được thực hiện: tạo thêm cookie autologin
```

### 9.2. Luồng phụ — Đăng nhập thất bại

```
1..6. Như luồng chính, nhưng Email hoặc Password sai
7. Hệ thống tải lại trang login kèm alert "Invalid email or password"
8. Cả 2 ô nhập bị xoá trắng → người dùng phải nhập lại từ đầu
```

### 9.3. Luồng phụ — Bỏ trống trường bắt buộc

```
1. Truy cập trang login
2. Để trống Email và/hoặc Password
3. Click Login
4. Hệ thống tải lại trang kèm alert tương ứng:
   - "The Email Address field is required."
   - "The Password field is required."
```

### 9.4. Luồng phụ — Bị chặn tại route bảo vệ

```
1. Chưa đăng nhập, truy cập trực tiếp /admin/clients
2. Hệ thống chuyển hướng về /admin/authentication
3. Đăng nhập thành công
4. Hệ thống vào /admin/ (Dashboard) — KHÔNG quay lại /admin/clients
```

### 9.5. Luồng phụ — Quên mật khẩu (điểm vào)

```
1. Tại trang login, click "Forgot Password?"
2. Điều hướng tới /admin/authentication/forgot_password
3. Trang hiển thị 1 ô Email Address và nút Confirm
   (luồng chi tiết nằm ngoài phạm vi tài liệu này)
```

### 9.6. Luồng phụ — Đăng xuất

```
1. Đang trong phiên đăng nhập
2. Thực hiện đăng xuất (/admin/authentication/logout)
3. Hệ thống huỷ phiên, chuyển về /admin/authentication
4. Truy cập lại route bảo vệ → bị chặn về trang login
```

---

## 10. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

| Hạng mục | Ghi nhận từ khảo sát thực tế |
|---|---|
| Bảo mật kênh truyền | Toàn bộ trang chạy trên HTTPS (REQ-LOGIN-24) |
| Chống CSRF | Có token ẩn bắt buộc; request thiếu/sai token bị chặn với HTTP 403 (REQ-LOGIN-15) |
| Chống dò tài khoản (user enumeration) | Thông báo lỗi thống nhất `Invalid email or password` cho cả email sai lẫn mật khẩu sai (REQ-LOGIN-08) |
| Hiệu năng tải trang | Trang cực nhẹ — **không tải file JavaScript nào**, chỉ HTML + CSS |
| Responsive | Có `<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, maximum-scale=1">` → có hỗ trợ hiển thị mobile, nhưng **chặn zoom** (`user-scalable=no`, `maximum-scale=1`) — điểm trừ về accessibility |
| Khả năng tiếp cận (Accessibility) | ✅ Mỗi input đều có `<label for="...">` liên kết đúng; heading cấp `<h1>` là "Login"; logo có thuộc tính `alt`. ⚠️ Chặn zoom trên mobile (vi phạm WCAG 1.4.4) |
| Trải nghiệm nhập liệu | Ô Email có `autofocus`; nút Login luôn enabled; **không** có chỉ báo loading khi submit |
| Đa ngôn ngữ | Trang cố định tiếng Anh (`<html lang="en">`), không có bộ chọn ngôn ngữ |

---

## 11. Gợi Ý Locator Cho Automation

Locator dưới đây đã được **kiểm chứng trực tiếp** trên DOM thực tế (viewport 1920×1080):

| Element | Playwright (ưu tiên semantic) | Selenium (Java) |
|---|---|---|
| Email Address | `page.getByLabel('Email Address')` | `By.id("email")` |
| Password | `page.getByLabel('Password')` | `By.id("password")` |
| Remember me | `page.getByRole('checkbox', { name: 'Remember me' })` | `By.id("remember")` |
| Nút Login | `page.getByRole('button', { name: 'Login' })` | `By.cssSelector("button[type='submit']")` |
| Link Forgot Password | `page.getByRole('link', { name: 'Forgot Password?' })` | `By.linkText("Forgot Password?")` |
| Vùng thông báo lỗi | `page.locator('.alert.alert-danger')` | `By.cssSelector(".alert.alert-danger")` |
| Heading trang | `page.getByRole('heading', { name: 'Login' })` | `By.tagName("h1")` |

> ⚠️ **Không** dùng `value="estimate"` của checkbox Remember me làm locator (xem AMB-06).

---

## 12. Bước Tiếp Theo

Tài liệu này (có mã REQ ID) là input chuẩn cho các workflow sau:

| Workflow | Mục đích |
|---|---|
| `/generate_testcases_manual_rbt` | Sinh manual test cases theo quy trình AI-RBT 6 bước (có đánh giá rủi ro) |
| `/generate_testcases_from_requirements` | Sinh nhanh manual test cases (QUICK mode) |
| `/generate_automation_from_testcases` | Chuyển manual test cases thành automation scripts |
| `/generate_traceability_matrix` | Sinh ma trận truy vết RTM: Requirements ↔ Test Cases ↔ Automation |

**Cần PO/BA phản hồi trước khi hoàn thiện bộ test:** AMB-01 và AMB-02 (mức 🔴 High) — hai điểm này ảnh hưởng trực tiếp tới nhóm test bảo mật và tiêu chí PASS/FAIL của luồng đăng xuất.

---

**Tổng kết số lượng:** 24 yêu cầu chức năng (REQ-LOGIN-01 → 24) · 10 điểm mơ hồ (AMB-01 → 10) · 8 rủi ro (RISK-01 → 08)
