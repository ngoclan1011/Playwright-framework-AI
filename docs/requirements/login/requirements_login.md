# Đặc tả Yêu cầu — Module Đăng nhập / Xác thực (`LOGIN`)

> Điểm vào cấp hệ thống: [../README.md](../README.md) · Bản đồ khám phá: [../_discovery/modules/module_01_dang_nhap.md](../_discovery/modules/module_01_dang_nhap.md)

| Mục | Giá trị |
|---|---|
| **Hệ thống** | Perfex CRM — Anh Tester Demo |
| **Module** | Đăng nhập / Xác thực |
| **Prefix** | `LOGIN` |
| **Route** | `/admin/authentication` · `/admin/authentication/forgot_password` · `/admin/authentication/reset_password/<id>/<key>` · `/admin/authentication/logout` |
| **Nguồn phân tích** | Khảo sát UI thực tế + tầng network (Playwright MCP, headed 1600×750) |
| **Ngày phân tích** | 2026-08-14 |
| **Tài khoản dùng khảo sát** | 1 tài khoản duy nhất — hiển thị "Admin Example", `user-id-2` |
| **Môi trường dùng chung** | **CÓ** — mọi thao tác đều chỉ đọc hoặc có thể hoàn tác; không gửi mail đặt lại mật khẩu cho tài khoản thật |
| **Tổng số REQ** | **35** |
| **Dải mã đã dùng** | `REQ-LOGIN-01` → `REQ-LOGIN-35` · `AMB-01` → `AMB-14` · `RISK-01` → `RISK-07` |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-LOGIN-36` · `AMB-15` · `RISK-08` — **KHÔNG đánh lại từ 01** |

---

## 1. Tổng quan

Module Đăng nhập là **cổng vào duy nhất** của khu quản trị `/admin`. Mọi module nghiệp vụ khác đều nằm sau lớp xác thực này, nên module hỏng đồng nghĩa chặn toàn bộ đợt kiểm thử.

Module gồm **4 màn hình / điểm cuối**:

| Màn hình | Route | Vai trò |
|---|---|---|
| Đăng nhập | `/admin/authentication` | Nhập email + mật khẩu, tuỳ chọn ghi nhớ đăng nhập |
| Quên mật khẩu | `/admin/authentication/forgot_password` | Nhập email để nhận liên kết đặt lại |
| Đặt lại mật khẩu | `/admin/authentication/reset_password/<id>/<key>` | Liên kết gửi qua email |
| Đăng xuất | `/admin/authentication/logout` | Kết thúc phiên |

### Trong phạm vi

- Xác thực bằng email + mật khẩu, xử lý lỗi và thông báo
- Tuỳ chọn **Remember me** và cookie `autologin`
- Bảo vệ URL nội bộ khi chưa đăng nhập, điều hướng khi đã đăng nhập
- Bảo vệ CSRF trên biểu mẫu đăng nhập
- Luồng Quên mật khẩu (đến bước gửi biểu mẫu) và luồng Đăng xuất

### Ngoài phạm vi

| Vùng | Lý do |
|---|---|
| Đăng nhập cổng khách hàng (front-end ngoài `/admin`) | `system_map.md` mục 7 — chưa chốt phạm vi |
| Nội dung email đặt lại mật khẩu và màn hình đặt lại với key hợp lệ | Không gửi mail cho tài khoản thật trên môi trường dùng chung (`AMB-04`) |
| Quản lý tài khoản / vai trò (`/admin/staff`, `/admin/roles`) | 403 với tài khoản hiện tại — thuộc khu Setup ngoài phạm vi |
| Đổi ngôn ngữ giao diện sau đăng nhập | Thuộc module `PROF` |

---

## 2. Bản đồ phủ tài liệu

**Không có tài liệu nào cho module này** — toàn bộ 35 REQ sinh từ khảo sát UI thực tế và tầng network ngày 2026-08-14. Không có spec, ticket, file field hay mockup kèm theo.

---

## 3. Yêu cầu Chức năng

> Quy ước cột `Nguồn`: `Kiểm chứng thực tế` = đã tương tác và xác nhận trên UI · `UI thực tế` = chỉ quan sát, chưa tương tác · `DOM` = đọc bằng `browser_evaluate` · `Network` = quan sát thụ động request do UI phát sinh.

### 3.1. Giao diện trang đăng nhập (STORY-LOGIN-01)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-01 | Truy cập trang đăng nhập | Người dùng chưa đăng nhập mở `/admin/authentication` thì thấy biểu mẫu đăng nhập | Trang trả HTTP 200 · tiêu đề tab `Perfex CRM \| Anh Tester Demo - Login` · tiêu đề trang `Login` · `body` mang class `login_admin` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-LOGIN-02 | Thành phần biểu mẫu đăng nhập | Biểu mẫu gồm đúng 3 control nhập liệu, 1 nút gửi và 1 liên kết | Có `Email Address` (`input#email[type=email]`), `Password` (`input#password[type=password]`, hiển thị dạng chấm che), checkbox `Remember me` (`input#remember`), nút `Login` (`button[type=submit]`), liên kết `Forgot Password?`. Biểu mẫu `POST` về chính `/admin/authentication` | 🟢 | — | DOM |
| REQ-LOGIN-03 | Tự động đặt con trỏ vào ô Email | Mở trang thì con trỏ nằm sẵn ở ô Email Address | `input#email` mang thuộc tính `autofocus="1"` | 🟢 | — | DOM |
| REQ-LOGIN-04 | Logo dẫn về trang chủ | Bấm logo trên trang đăng nhập thì về trang chủ công khai | Liên kết bọc logo trỏ tới `https://crm.anhtester.com/` | 🟢 | — | DOM |
| REQ-LOGIN-05 | Không có CAPTCHA và không có đăng nhập mạng xã hội | Trang đăng nhập ở trạng thái mặc định không hiển thị CAPTCHA, không có nút đăng nhập bên thứ ba | Không tồn tại phần tử `.g-recaptcha`, `[class*=captcha]`, `iframe[src*=recaptcha]` · trang **không nạp bất kỳ tệp script nào** (0 `<script>` inline, 0 `<script src>`) | 🟢 | — | DOM |

### 3.2. Đăng nhập thành công (STORY-LOGIN-02)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-06 | Đăng nhập bằng thông tin hợp lệ | Nhập đúng email và mật khẩu thì vào được khu quản trị | `POST /admin/authentication` trả **303** với header `location: https://crm.anhtester.com/admin/` · trình duyệt dừng ở `/admin/` với tiêu đề `Dashboard` · `body` mang class `app admin dashboard user-id-2` | 🟢 | — | Kiểm chứng thực tế + Network |
| REQ-LOGIN-07 | Email không phân biệt hoa thường và bỏ qua khoảng trắng thừa | Nhập email khác kiểu chữ hoặc kèm khoảng trắng đầu/cuối vẫn đăng nhập được | Nhập `  ADMIN@Example.COM  ` kèm mật khẩu đúng → đăng nhập thành công, chuyển tới `/admin/` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-08 | Ghi nhớ đăng nhập sinh cookie `autologin` | Tích **Remember me** trước khi đăng nhập thì hệ thống phát hành cookie ghi nhớ | Sau khi đăng nhập, trình duyệt có cookie `autologin` chứa chuỗi PHP-serialize dạng `a:2:{s:7:"user_id";s:1:"2";s:3:"key";s:16:"<16 ký tự hex>";}` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-LOGIN-09 | Không tích Ghi nhớ thì không phát hành cookie mới | Đăng nhập khi **Remember me** bỏ trống thì không sinh cookie `autologin` mới | Đăng nhập lần 2 với checkbox bỏ trống → giá trị `key` trong cookie `autologin` **không đổi** so với trước (`8690902dbb083f65`), tức không có cookie mới được cấp | 🟢 | — | Kiểm chứng thực tế + DOM |

### 3.3. Kiểm tra dữ liệu đầu vào & đăng nhập thất bại (STORY-LOGIN-03)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-10 | Bỏ trống cả hai trường | Gửi biểu mẫu rỗng thì hiện đủ hai thông báo bắt buộc | Trang nạp lại và hiển thị **2** banner `.alert.alert-danger.text-center`, thứ tự trên xuống: `The Password field is required.` rồi `The Email Address field is required.` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-11 | Bỏ trống riêng Email | Nhập mật khẩu, để trống email thì báo thiếu email | Hiển thị **duy nhất 1** banner: `The Email Address field is required.` — không kiểm tra tiếp thông tin đăng nhập | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-12 | Bỏ trống riêng Mật khẩu | Nhập email, để trống mật khẩu thì báo thiếu mật khẩu | Hiển thị **duy nhất 1** banner: `The Password field is required.` — không kiểm tra tiếp thông tin đăng nhập | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-13 | Chặn email sai định dạng ngay tại trình duyệt | Email thiếu ký tự `@` thì trình duyệt chặn gửi biểu mẫu, không gọi tới máy chủ | Nhập `abc` → `input#email.checkValidity()` trả `false`, `validationMessage` = `Please include an '@' in the email address. 'abc' is missing an '@'.` · **không** phát sinh request POST · trang không nạp lại | 🟢 | — | Kiểm chứng thực tế + DOM + Network |
| REQ-LOGIN-14 | Thông báo khi sai thông tin đăng nhập | Sai email hoặc sai mật khẩu đều trả về một thông báo chung | Hiển thị đúng 1 banner `.alert.alert-danger`: `Invalid email or password` · người dùng vẫn ở `/admin/authentication` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-15 | Thông báo lỗi không tiết lộ email nào có thật | Email không tồn tại và email có thật nhưng sai mật khẩu phải cho cùng một thông báo | Gửi `notexist_20260814@auto.test` + mật khẩu bất kỳ → `Invalid email or password`. Gửi `admin@example.com` + mật khẩu sai → **cùng chuỗi** `Invalid email or password`. Không có khác biệt về nội dung, số lượng banner hay URL | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-16 | Không giữ lại email đã nhập sau khi đăng nhập thất bại | Sau lỗi đăng nhập, ô Email trả về rỗng, người dùng phải gõ lại | HTML trả về của `input#email` **không có** thuộc tính `value` (`getAttribute('value')` = `null`). Giá trị nhìn thấy trên màn hình là do trình duyệt tự điền, không phải máy chủ trả lại | 🟢 | — | DOM |

### 3.4. Bảo vệ phiên & điều hướng (STORY-LOGIN-04)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-17 | Chặn URL nội bộ khi chưa đăng nhập | Mở thẳng một URL trong `/admin` khi chưa đăng nhập thì bị đưa về trang đăng nhập | `GET /admin/clients` khi chưa đăng nhập → chuyển hướng (ghi nhận **307** trên tab Network), trình duyệt dừng ở `/admin/authentication` | 🟢 | — | Kiểm chứng thực tế + Network |
| REQ-LOGIN-18 | Không ghi nhớ URL đích sau khi chuyển hướng | Bị đưa về trang đăng nhập thì URL đích ban đầu không được giữ lại | URL sau chuyển hướng là `/admin/authentication` **trần** — không có tham số `?redirect=`, `?return_url=` hay tương đương. Đăng nhập xong vào Dashboard, không quay lại `/admin/clients` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-19 | Đã đăng nhập thì không vào lại trang đăng nhập | Người dùng đang có phiên mở `/admin/authentication` sẽ được đưa về Dashboard | Mở `/admin/authentication` khi đang đăng nhập → dừng ở `/admin/`, tiêu đề `Dashboard` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-20 | Đã đăng nhập thì không vào trang Quên mật khẩu | Người dùng đang có phiên mở trang Quên mật khẩu sẽ được đưa về Dashboard | Mở `/admin/authentication/forgot_password` khi đang đăng nhập → dừng ở `/admin/`, tiêu đề `Dashboard` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-21 | Biểu mẫu đăng nhập mang mã chống CSRF | Mỗi lần nạp trang đăng nhập, biểu mẫu chứa một trường ẩn chống giả mạo yêu cầu | Tồn tại `input[type=hidden][name=csrf_token_name]` với giá trị 32 ký tự hex · body của `POST /admin/authentication` chứa `csrf_token_name=<token>&email=…&password=…` | 🟢 | — | DOM + Network |
| REQ-LOGIN-22 | Từ chối yêu cầu có mã CSRF sai | Gửi biểu mẫu với mã CSRF bị sửa thì bị chặn, không xử lý đăng nhập | Sửa `csrf_token_name` thành giá trị tuỳ ý rồi gửi → máy chủ trả **HTTP 403**, tiêu đề tab `Error`, nội dung nguyên văn: `419 Page Expired!` và `Sorry, the page has expired, return to previous page and refresh to continue.` | 🟢 | — | Kiểm chứng thực tế + Network |

### 3.5. Quên mật khẩu (STORY-LOGIN-05)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-23 | Truy cập trang Quên mật khẩu | Bấm `Forgot Password?` trên trang đăng nhập thì mở biểu mẫu khôi phục | Liên kết trỏ tới `/admin/authentication/forgot_password` · trang có tiêu đề `Forgot Password` · gồm đúng 1 ô `Email Address` (`input#email[type=email]`) và nút `Confirm` · `POST` về chính URL đó · có trường ẩn `csrf_token_name` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-LOGIN-24 | Trang Quên mật khẩu không có lối quay lại đăng nhập | Trên trang Quên mật khẩu, liên kết duy nhất là logo về trang chủ | Toàn trang chỉ có **1** thẻ `<a>`, trỏ tới `https://crm.anhtester.com/`. Không có liên kết nào về `/admin/authentication` | 🟢 | — | DOM |
| REQ-LOGIN-25 | Gửi biểu mẫu Quên mật khẩu khi bỏ trống email | Bỏ trống ô email rồi bấm Confirm thì hệ thống báo lỗi | Hiển thị 1 banner `.alert.alert-danger.text-center`: `Email not found` — **không** phải thông báo trường bắt buộc như ở trang đăng nhập (xem `AMB-05`) | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-26 | Email không tồn tại trong hệ thống | Nhập email không có trong hệ thống thì báo không tìm thấy | Nhập `notexist_20260814@auto.test` → banner `Email not found` · vẫn ở `/admin/authentication/forgot_password` | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-27 | Email tồn tại thì gửi liên kết đặt lại mật khẩu | Nhập email có thật thì hệ thống gửi email chứa liên kết đặt lại | ❔ **Chưa kiểm chứng** — không gửi mail đặt lại cho tài khoản thật trên môi trường dùng chung. Xem `AMB-04` | ⚪ | — | Suy diễn từ sự tồn tại của route `reset_password` |
| REQ-LOGIN-28 | Liên kết đặt lại mật khẩu sai/hết hạn | Mở liên kết đặt lại với mã khoá không hợp lệ | `GET /admin/authentication/reset_password/2/invalidkey20260814` → **HTTP 500**, thân phản hồi rỗng, người dùng thấy trang lỗi mặc định của trình duyệt. **Không** có trang thông báo thân thiện. Xem `AMB-03` | 🟢 | — | Kiểm chứng thực tế + Network |

### 3.6. Đăng xuất (STORY-LOGIN-06)

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|
| REQ-LOGIN-29 | Hai lối đăng xuất trên thanh đầu trang | Người dùng đăng xuất được từ thanh điều hướng hoặc từ menu ảnh đại diện | Tồn tại **2** phần tử `li.header-logout`: một trong `ul.nav.navbar-nav`, một là mục **cuối cùng** của `.dropdown-menu` thuộc `li.header-user-profile`. Cả hai đều là `<a href="#" onclick="logout(); return false;">Logout</a>` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-LOGIN-30 | Cảnh báo khi còn bộ đếm giờ đang chạy | Đăng xuất trong lúc còn timer công việc đang chạy thì phải xác nhận | Hàm `logout()` kiểm tra `$(".started-timers-top").find("li.timer").length > 0`; nếu có thì mở popup với nội dung nguyên văn `Started tasks timers found!` / `Are you sure you want to logout without stopping the timers?` kèm nút `Logout` trỏ tới `/admin/authentication/logout`, và **không** đăng xuất ngay | 🟢 | — | DOM (mã nguồn hàm `logout()` + template `#timers-logout-template-warning`) |
| REQ-LOGIN-31 | Đăng xuất ngay khi không có bộ đếm giờ | Không có timer nào chạy thì bấm Logout là đi thẳng | Hàm `logout()` gán `window.location.href = admin_url + "authentication/logout"` mà không hỏi lại | 🟢 | — | DOM (mã nguồn hàm `logout()`) |
| REQ-LOGIN-32 | Kết thúc phiên và về trang đăng nhập | Gọi điểm cuối đăng xuất thì phiên chấm dứt | `GET /admin/authentication/logout` → chuyển hướng, trình duyệt dừng ở `/admin/authentication` · không hiển thị banner thông báo nào | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-33 | URL nội bộ bị chặn lại sau khi đăng xuất | Sau khi đăng xuất, phiên cũ không dùng lại được | Đăng xuất rồi mở `/admin/clients` → bị đưa về `/admin/authentication`, mặc dù cookie `autologin` vẫn còn trong trình duyệt | 🟢 | — | Kiểm chứng thực tế |
| REQ-LOGIN-34 | Cookie `autologin` không bị xoá khỏi trình duyệt khi đăng xuất | Sau khi đăng xuất, cookie ghi nhớ vẫn nằm lại phía trình duyệt | `document.cookie` sau khi đăng xuất **vẫn** chứa `autologin` với nguyên giá trị trước đó. Cookie đã mất hiệu lực ở phía máy chủ (chứng minh bởi REQ-LOGIN-33) nhưng không được xoá phía trình duyệt. Xem `AMB-06` | 🟢 | — | Kiểm chứng thực tế + DOM |
| REQ-LOGIN-35 | Cookie `autologin` đọc được bằng JavaScript | Cookie ghi nhớ không được gắn cờ chống truy cập từ script | `document.cookie` trả về đầy đủ giá trị `autologin` → cookie **không** có cờ `HttpOnly`. (Cookie phiên của ứng dụng không xuất hiện trong `document.cookie` → có `HttpOnly`.) Xem `AMB-07`, `RISK-02` | 🟢 | — | DOM |

---

## 4. Đặc tả Trường Dữ liệu

### 4.1. Biểu mẫu Đăng nhập — `/admin/authentication`

| Field (Label) | Loại UI | Tên field gửi lên | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|---|
| Email Address | `input[type=email]` `#email` | `email` | **Có** — kiểm ở máy chủ | Không có `required`, `maxlength`, `minlength`, `pattern` trong HTML. Định dạng do `type=email` của trình duyệt kiểm. Mặc định rỗng. Không phân biệt hoa/thường, bỏ qua khoảng trắng đầu/cuối | REQ-LOGIN-02, 07, 11, 13, 16 | Có `autofocus="1"`. **Không** có `autocomplete`. Máy chủ không trả lại giá trị đã nhập sau lỗi |
| Password | `input[type=password]` `#password` | `password` | **Có** — kiểm ở máy chủ | Không có `required`, `maxlength`, `minlength`, `pattern`. Không ràng buộc độ mạnh ở màn hình đăng nhập. Mặc định rỗng | REQ-LOGIN-02, 12 | Hiển thị che ký tự. **Không** có nút hiện/ẩn mật khẩu. **Không** có `autocomplete` |
| Remember me | `input[type=checkbox]` `#remember` | `remember` | Không | Mặc định **không tích** (`checked = false`), `disabled = false`. Thuộc tính `value="estimate"` — giá trị gửi lên khi tích là chuỗi `estimate` | REQ-LOGIN-02, 08, 09 | Giá trị `estimate` không mang nghĩa nghiệp vụ nào ở màn hình này — xem `AMB-11` |
| (ẩn) csrf_token_name | `input[type=hidden]` | `csrf_token_name` | Có — hệ thống tự điền | Chuỗi 32 ký tự hex, đổi theo phiên | REQ-LOGIN-21, 22 | Bắt buộc với **mọi** POST |
| Login | `button[type=submit]` | — | — | Luôn ở trạng thái bật (`disabled = false`) kể cả khi biểu mẫu rỗng | REQ-LOGIN-02, 10 | Class `btn btn-primary btn-block` |

### 4.2. Biểu mẫu Quên mật khẩu — `/admin/authentication/forgot_password`

| Field (Label) | Loại UI | Tên field gửi lên | Required | Ràng buộc | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|---|
| Email Address | `input[type=email]` `#email` | `email` | Không kiểm "bắt buộc" — bỏ trống vẫn gửi được và rơi vào nhánh `Email not found` | Không có `required`, `maxlength`, `pattern`. Có `value=""` sẵn trong HTML. Không có `autofocus` | REQ-LOGIN-23, 25, 26 | Khác biểu mẫu đăng nhập ở chỗ **không** có thông báo trường bắt buộc |
| (ẩn) csrf_token_name | `input[type=hidden]` | `csrf_token_name` | Có — hệ thống tự điền | Chuỗi 32 ký tự hex | REQ-LOGIN-23 | — |
| Confirm | `button[type=submit]` | — | — | Luôn bật | REQ-LOGIN-23 | Class `btn btn-primary btn-block` |

---

## 5. Business Rules & Validation Messages

Toàn bộ thông báo dưới đây **ghi nguyên văn từ UI thực tế**, hiển thị bằng tiếng Anh trong khung `.alert.alert-danger.text-center` đặt phía trên các trường nhập.

| REQ ID | Rule / Trigger | Thông báo lỗi mong đợi (nguyên văn) |
|---|---|---|
| REQ-LOGIN-10 | Đăng nhập: bỏ trống cả Email và Password | `The Password field is required.` (banner 1) và `The Email Address field is required.` (banner 2) |
| REQ-LOGIN-11 | Đăng nhập: bỏ trống Email, có Password | `The Email Address field is required.` |
| REQ-LOGIN-12 | Đăng nhập: có Email, bỏ trống Password | `The Password field is required.` |
| REQ-LOGIN-13 | Đăng nhập: email thiếu ký tự `@` | Tooltip mặc định của trình duyệt: `Please include an '@' in the email address. 'abc' is missing an '@'.` — không phải thông báo của ứng dụng |
| REQ-LOGIN-14 | Đăng nhập: email không tồn tại, hoặc mật khẩu sai | `Invalid email or password` |
| REQ-LOGIN-22 | Đăng nhập: mã CSRF không hợp lệ | Trang lỗi HTTP 403 — `419 Page Expired!` / `Sorry, the page has expired, return to previous page and refresh to continue.` |
| REQ-LOGIN-25 | Quên mật khẩu: bỏ trống email | `Email not found` |
| REQ-LOGIN-26 | Quên mật khẩu: email không tồn tại | `Email not found` |
| REQ-LOGIN-28 | Đặt lại mật khẩu: mã khoá sai hoặc hết hạn | Không có thông báo — máy chủ trả HTTP 500 với thân phản hồi rỗng |
| REQ-LOGIN-30 | Đăng xuất khi còn timer đang chạy | `Started tasks timers found!` / `Are you sure you want to logout without stopping the timers?` |

**Quan sát chéo:** thông báo của trang Đăng nhập (`The … field is required.`) và trang Quên mật khẩu (`Email not found` cho cùng tình huống bỏ trống) **không nhất quán** — xem `AMB-05`.

---

## 6. Ma trận Phân quyền

Module Đăng nhập nằm **trước** lớp phân quyền: bản thân trang đăng nhập, trang Quên mật khẩu và điểm cuối Đăng xuất mở cho mọi người, không phụ thuộc vai trò. Phần phụ thuộc vai trò là **đích đến sau khi đăng nhập** và tập menu hiển thị — hiện chưa kiểm chứng được vì chỉ có một tài khoản.

| Hành động | Khách (chưa đăng nhập) | Tài khoản đang có ("Admin Example", `user-id-2`) | Vai trò khác |
|---|---|---|---|
| Mở trang đăng nhập `/admin/authentication` | ✅ | ❌ — bị chuyển về Dashboard (REQ-LOGIN-19) | ❔ |
| Mở trang Quên mật khẩu | ✅ | ❌ — bị chuyển về Dashboard (REQ-LOGIN-20) | ❔ |
| Gửi biểu mẫu đăng nhập | ✅ | — | ❔ |
| Mở URL nội bộ `/admin/clients` | ❌ — chuyển về trang đăng nhập (REQ-LOGIN-17) | ✅ | ❔ |
| Vào Dashboard `/admin/` sau khi đăng nhập | ❌ | ✅ | ❔ |
| Gọi điểm cuối đăng xuất | ✅ — không lỗi, dừng ở trang đăng nhập | ✅ | ❔ |
| Mở khu Setup (`/admin/settings`, `/admin/staff`, `/admin/roles`) | ❌ | ❌ — chuyển tới `/admin/access_denied` | ❔ |

```
Đã kiểm chứng: 13 ô · Suy diễn: 0 ô · Chưa rõ: 7 ô — hệ thống có bao nhiêu vai trò và tên là gì vẫn chưa biết,
màn hình quản lý vai trò trả 403 với tài khoản hiện tại (AMB-01)
```

> Ký hiệu: `✅`/`❌` = đã đăng nhập đúng vai trò và thử thật · `⚠️✅`/`⚠️❌` = suy từ màn hình cấu hình · `❔` = chưa có căn cứ.
> Ô `❔` **không** được hiểu là "không có quyền".

---

## 7. Ma trận Trạng thái

Module không có entity nghiệp vụ nào mang vòng đời trạng thái. Tuy nhiên **phiên đăng nhập** có chuyển trạng thái quan sát được, ghi lại ở đây vì mọi module khác đều phụ thuộc:

| Trạng thái hiện tại | Hành động cho phép | Trạng thái kế tiếp | Ai được thực hiện |
|---|---|---|---|
| Chưa đăng nhập | Gửi biểu mẫu đăng nhập với thông tin đúng | Đã đăng nhập | Bất kỳ ai có tài khoản hợp lệ |
| Chưa đăng nhập | Gửi biểu mẫu đăng nhập với thông tin sai / thiếu | Chưa đăng nhập (hiện thông báo lỗi) | Bất kỳ ai |
| Chưa đăng nhập | Mở URL nội bộ trong `/admin` | Chưa đăng nhập (bị đưa về trang đăng nhập) | Bất kỳ ai |
| Chưa đăng nhập | Gửi biểu mẫu Quên mật khẩu | Chưa đăng nhập (gửi mail đặt lại — ⚪ chưa kiểm chứng, `REQ-LOGIN-27`) | Bất kỳ ai |
| Đã đăng nhập | Mở trang đăng nhập hoặc Quên mật khẩu | Đã đăng nhập (bị đưa về Dashboard) | Người dùng đang có phiên |
| Đã đăng nhập | Bấm Logout khi **không** có timer chạy | Đã đăng xuất | Người dùng đang có phiên |
| Đã đăng nhập | Bấm Logout khi **có** timer chạy | Đã đăng nhập (hiện popup xác nhận) | Người dùng đang có phiên |
| Đã đăng nhập (popup xác nhận) | Bấm `Logout` trong popup | Đã đăng xuất | Người dùng đang có phiên |
| Đã đăng xuất | Mở URL nội bộ | Chưa đăng nhập (bị đưa về trang đăng nhập) | — |

> Thời gian sống của phiên và điều kiện tự hết hạn **chưa xác định** — xem `AMB-13`.

---

## 8. Luồng xử lý chính

### 8.1. Đăng nhập thành công

```
1. Mở /admin/authentication          → biểu mẫu hiện ra, con trỏ ở ô Email
2. Nhập Email Address hợp lệ
3. Nhập Password đúng
4. (tuỳ chọn) Tích Remember me       → sẽ nhận cookie autologin
5. Bấm Login                          → POST /admin/authentication (kèm csrf_token_name)
6. Máy chủ trả 303 + location /admin/ → dừng ở Dashboard
```

### 8.2. Đăng nhập thất bại

```
1–3. Như trên nhưng sai email hoặc sai mật khẩu
4. Bấm Login                          → POST /admin/authentication
5. Trang nạp lại, banner "Invalid email or password"
6. Ô Email trả về rỗng                → người dùng phải gõ lại từ đầu
```

### 8.3. Quên mật khẩu

```
1. Ở trang đăng nhập, bấm "Forgot Password?"
2. Mở /admin/authentication/forgot_password
3. Nhập email → bấm Confirm
4a. Email không có trong hệ thống      → banner "Email not found"
4b. Email có thật                      → ⚪ chưa kiểm chứng (AMB-04)
5.  Không có lối quay lại trang đăng nhập — phải sửa URL thủ công (REQ-LOGIN-24)
```

### 8.4. Đăng xuất

```
1. Bấm Logout (thanh điều hướng hoặc menu ảnh đại diện) → gọi hàm logout()
2a. Có timer công việc đang chạy       → popup "Started tasks timers found!" → cần bấm Logout lần nữa
2b. Không có timer                     → đi thẳng bước 3
3. GET /admin/authentication/logout    → phiên kết thúc
4. Dừng ở /admin/authentication        → URL nội bộ không truy cập được nữa
```

---

## 9. Yêu cầu Phi chức năng (quan sát được)

| Mục | Ghi nhận | REQ / AMB liên quan |
|---|---|---|
| Giao thức | Toàn bộ qua HTTPS (`https://crm.anhtester.com`) | — |
| Tải trang đăng nhập | Trang **không nạp bất kỳ tệp JavaScript nào** — 0 script inline, 0 script ngoài. Toàn bộ kiểm tra dữ liệu chạy ở máy chủ | REQ-LOGIN-05, 13 |
| Máy chủ | `server: LiteSpeed`, ứng dụng server-render (CodeIgniter) | — |
| Chống nghe lại | Phản hồi mang `cache-control: no-store, no-cache, must-revalidate` và `pragma: no-cache` — trang sau đăng nhập không bị trình duyệt lưu đệm | — |
| Ngôn ngữ | Trang đăng nhập chỉ có tiếng Anh; bộ chọn ngôn ngữ (26 ngôn ngữ) chỉ xuất hiện **sau** khi đăng nhập, thuộc module `PROF` | — |
| Khả năng truy cập | Ba trường đều có `<label for>` khớp `id` — đọc được bằng trình đọc màn hình | REQ-LOGIN-02 |
| Chống dò tài khoản | Trang đăng nhập đạt (một thông báo chung); trang Quên mật khẩu **chưa rõ** | REQ-LOGIN-15, AMB-04 |
| Chống thử vét cạn | Không quan sát thấy CAPTCHA, không thấy dấu hiệu giới hạn tần suất | RISK-01, AMB-02 |
| Cookie | Cookie phiên có `HttpOnly`; cookie `autologin` **không có** | REQ-LOGIN-35, RISK-02 |

---

## 10. Phân rã Epic / Story

| Story ID | Tên Story | REQ bao phủ | Số REQ | AMB / RISK liên quan | Ghi chú phạm vi |
|---|---|---|---|---|---|
| STORY-LOGIN-01 | Giao diện trang đăng nhập | REQ-LOGIN-01 → REQ-LOGIN-05 | 5 | AMB-11 · RISK-01 | Chỉ kiểm tra hiển thị và cấu trúc, không tương tác nghiệp vụ |
| STORY-LOGIN-02 | Đăng nhập thành công | REQ-LOGIN-06 → REQ-LOGIN-09 | 4 | AMB-13 · RISK-07 | Gồm cả tuỳ chọn Ghi nhớ đăng nhập |
| STORY-LOGIN-03 | Kiểm tra dữ liệu & đăng nhập thất bại | REQ-LOGIN-10 → REQ-LOGIN-16 | 7 | AMB-02 · AMB-09 · AMB-10 · RISK-01 · RISK-03 | Không test khoá tài khoản cho đến khi `AMB-02` có câu trả lời |
| STORY-LOGIN-04 | Bảo vệ phiên & điều hướng | REQ-LOGIN-17 → REQ-LOGIN-22 | 6 | AMB-08 · AMB-12 | Gồm cả bảo vệ CSRF |
| STORY-LOGIN-05 | Quên mật khẩu | REQ-LOGIN-23 → REQ-LOGIN-28 | 6 | AMB-03 · AMB-04 · AMB-05 · RISK-04 · RISK-05 | `REQ-LOGIN-27` đang ⚪ — chưa kiểm chứng được trên môi trường dùng chung |
| STORY-LOGIN-06 | Đăng xuất | REQ-LOGIN-29 → REQ-LOGIN-35 | 7 | AMB-06 · AMB-07 · AMB-14 · RISK-02 | `REQ-LOGIN-30` cần một task có timer đang chạy để kiểm chứng đầu-cuối |

**Tổng: 6 Story / 35 REQ** — mọi REQ thuộc đúng một Story, không mồ côi, không trùng (5+4+7+6+6+7 = 35 ✔).

### Hạng mục cấp Epic (cố ý không gán vào Story nào)

| Hạng mục | Lý do |
|---|---|
| Ma trận Phân quyền (mục 6) | Cắt ngang mọi Story; chỉ hoàn thiện được khi có thêm tài khoản vai trò khác (`AMB-01`) |
| Ma trận Trạng thái phiên (mục 7) | Cắt ngang STORY-LOGIN-02, 04, 06 |
| Yêu cầu phi chức năng (mục 9) | Áp cho toàn module |
| Bảng Ambiguity & Risk (mục 11) | Đánh số theo toàn module |

### Thứ tự triển khai đề xuất

| Thứ tự | Story | Lý do |
|---|---|---|
| 1 | STORY-LOGIN-02 | Đường đi thuận — mọi module khác cần đăng nhập được mới test tiếp; phải xanh trước tiên |
| 2 | STORY-LOGIN-01 | Rẻ, không rủi ro, chốt nền tảng locator cho automation |
| 3 | STORY-LOGIN-03 | **Một phần BLOCKED bởi `AMB-02`** — chưa test kịch bản khoá tài khoản cho tới khi biết ngưỡng khoá |
| 4 | STORY-LOGIN-04 | Phụ thuộc STORY-LOGIN-02 (cần phiên hợp lệ để test điều hướng khi đã đăng nhập) |
| 5 | STORY-LOGIN-06 | Phụ thuộc STORY-LOGIN-02. **`REQ-LOGIN-30` BLOCKED bởi `AMB-14`** — cần dựng được task có timer chạy |
| 6 | STORY-LOGIN-05 | **BLOCKED bởi `AMB-04`** — chưa chốt được cách kiểm chứng luồng gửi mail trên môi trường dùng chung |

---

## 11. Điểm Mơ Hồ & Rủi Ro

### 11.1. Ambiguities

| Mã | Câu hỏi | Nguy cơ | Mức độ | Assumption tạm | Trạng thái | Kết luận |
|---|---|---|---|---|---|---|
| AMB-01 | Hệ thống có bao nhiêu vai trò, tên là gì? Xin cấp tài khoản vai trò thấp hơn để kiểm chứng 7 ô đang `❔` ở ma trận phân quyền | Không dựng được ma trận phân quyền thật cho module này và **mọi** module còn lại | 🔴 | Chỉ test với tài khoản đang có; mọi kết luận về vai trò khác đều để `❔` | ❓ Chờ trả lời | — |
| AMB-02 | Có khoá tài khoản sau N lần đăng nhập sai không? Ngưỡng bao nhiêu, khoá bao lâu, tính theo email hay theo IP? | Không biết ngưỡng thì không viết được test case khoá tài khoản; thử mò trên môi trường dùng chung có thể khoá cả team | 🔴 | Giả định **không** có cơ chế khoá; không viết TC khoá tài khoản cho tới khi có câu trả lời | ❓ Chờ trả lời | — |
| AMB-03 | `reset_password` với mã khoá sai trả HTTP 500 trắng trang — đúng thiết kế hay lỗi? | Người dùng bấm liên kết hết hạn sẽ thấy trang lỗi trình duyệt, không biết phải làm gì tiếp | 🔴 | Coi là **lỗi**; TC kỳ vọng phải có trang thông báo thân thiện | ❓ Chờ trả lời | — |
| AMB-04 | Trang Quên mật khẩu trả gì khi email **có thật**? Có khác `Email not found` không? Kiểm chứng luồng gửi mail bằng cách nào trên môi trường dùng chung? | Nếu khác nhau thì kẻ tấn công dò được email nào có tài khoản. Và luồng khôi phục mật khẩu hiện chưa test được đầu-cuối | 🔴 | Giả định email có thật cho thông báo thành công khác hẳn → **có** lộ danh sách tài khoản | ❓ Chờ trả lời | — |
| AMB-05 | Bỏ trống email ở Quên mật khẩu ra `Email not found` thay vì thông báo trường bắt buộc như trang đăng nhập — cố ý hay thiếu validate? | Thông báo sai bản chất làm người dùng tưởng email của mình không tồn tại | 🟡 | Coi là **thiếu validate**; TC kỳ vọng thông báo trường bắt buộc | ❓ Chờ trả lời | — |
| AMB-06 | Cookie `autologin` còn nguyên trong trình duyệt sau khi đăng xuất — có cần xoá không? | Máy dùng chung: cookie chứa `user_id` và `key` nằm lại sau khi người dùng tưởng đã đăng xuất | 🟡 | Coi là **cần xoá**; TC kỳ vọng cookie biến mất sau khi đăng xuất | ❓ Chờ trả lời | — |
| AMB-07 | Cookie `autologin` không có cờ `HttpOnly` — cố ý hay sót? | Bất kỳ lỗ hổng XSS nào ở khu `/admin` đều đọc được cookie này | 🟡 | Coi là **sót**; ghi thành `RISK-02` để đội bảo mật xử lý | ❓ Chờ trả lời | — |
| AMB-08 | Mã CSRF sai trả HTTP **403** nhưng nội dung ghi **419 Page Expired!** — mã nào là đúng? | Automation và giám sát bắt theo mã trạng thái sẽ phân loại nhầm | 🟡 | Kiểm theo **403** (giá trị thực tế trên tab Network) và kiểm chuỗi `419 Page Expired!` trong nội dung | ❓ Chờ trả lời | — |
| AMB-09 | Chính sách mật khẩu (độ dài tối thiểu, ký tự bắt buộc) quy định ở đâu? Màn hình đăng nhập không ràng buộc gì | Không viết được TC biên cho trường mật khẩu | 🟡 | Màn hình **đăng nhập** không ràng buộc độ dài — mọi ràng buộc thuộc màn hình đổi/đặt mật khẩu | ❓ Chờ trả lời | — |
| AMB-10 | Sau khi đăng nhập thất bại, email đã nhập bị xoá — cố ý hay thiếu? | Người dùng phải gõ lại email mỗi lần sai mật khẩu | 🟡 | Coi là **thiếu**; TC ghi nhận hiện trạng và gắn nhãn cải thiện trải nghiệm | ❓ Chờ trả lời | — |
| AMB-11 | Checkbox Remember me mang `value="estimate"` — giá trị này có ý nghĩa gì không? | Automation dựa vào `value` có thể hiểu sai; nếu là lỗi sao chép mã thì có thể đổi bất ngờ | 🟢 | Coi là giá trị vô nghĩa còn sót lại; automation chỉ thao tác trạng thái tích/không tích, **không** dựa vào `value` | ❓ Chờ trả lời | — |
| AMB-12 | Bị chuyển về trang đăng nhập thì không giữ URL đích — có kế hoạch bổ sung không? | Người dùng mở liên kết sâu (từ email, từ chat) phải tự điều hướng lại sau khi đăng nhập | 🟡 | Ghi nhận hiện trạng: **không** giữ URL đích | ❓ Chờ trả lời | — |
| AMB-13 | Phiên đăng nhập sống bao lâu? Cookie `autologin` hết hạn khi nào? Có cho phép nhiều phiên song song không? | Không viết được TC hết phiên và TC đăng nhập nhiều nơi | 🟡 | Không viết TC hết phiên cho tới khi có ngưỡng cụ thể | ❓ Chờ trả lời | — |
| AMB-14 | Dựng dữ liệu thế nào để có task với timer đang chạy, nhằm kiểm chứng popup cảnh báo khi đăng xuất? Môi trường dùng chung nên khởi động timer sẽ ảnh hưởng người khác | `REQ-LOGIN-30` chỉ mới đọc được từ mã nguồn hàm `logout()`, chưa chạy thật đầu-cuối | 🟡 | Chấp nhận bằng chứng ở mức đọc mã nguồn; đánh dấu TC tương ứng là `assumption-based` | ❓ Chờ trả lời | — |

### 11.2. Risks

| Mã | Rủi ro | Mô tả | Mitigation |
|---|---|---|---|
| RISK-01 | Không có lớp chống thử vét cạn quan sát được | Trang đăng nhập không CAPTCHA, không thấy dấu hiệu giới hạn tần suất, và mật khẩu tài khoản demo rất yếu | Đưa `AMB-02` lên đầu danh sách hỏi. Trước khi có câu trả lời, **không** chạy TC thử sai mật khẩu lặp lại nhiều lần |
| RISK-02 | Cookie `autologin` đọc được bằng JavaScript | Không có cờ `HttpOnly`; cookie chứa `user_id` và `key` dùng để tự đăng nhập | Báo đội phát triển (`AMB-07`). Khi kiểm thử bảo mật, ghép với mọi điểm nghi ngờ XSS trong khu `/admin` |
| RISK-03 | Môi trường dùng chung — thử khoá tài khoản có thể chặn cả đội | Chỉ có **một** tài khoản; nếu bị khoá thì mọi module khác dừng kiểm thử | Giới hạn số lần thử sai. Dùng email **không tồn tại** khi cần lấy thông báo lỗi, tránh đụng vào tài khoản thật |
| RISK-04 | Luồng Quên mật khẩu có thể lộ email nào có tài khoản | `Email not found` cho email không tồn tại; chưa biết phản hồi với email có thật | Kiểm chứng ngay khi `AMB-04` được trả lời; nếu khác nhau thì mở bug bảo mật |
| RISK-05 | Luồng khôi phục mật khẩu có thể hỏng hoàn toàn | Liên kết đặt lại với mã khoá sai trả HTTP 500 — chưa rõ liên kết **hợp lệ** có chạy không | Ưu tiên kiểm chứng `REQ-LOGIN-27` và `REQ-LOGIN-28` bằng một tài khoản test riêng, không dùng tài khoản chung |
| RISK-06 | Module là cổng vào của toàn hệ thống | Bất kỳ hỏng hóc nào ở đây đều chặn kiểm thử **23 module** còn lại | Xếp STORY-LOGIN-02 chạy đầu tiên trong mọi bộ smoke; đưa vào kiểm tra sức khoẻ hằng ngày |
| RISK-07 | Mật khẩu tài khoản demo rất yếu và được lưu ở `.env` | `123456` — ai biết URL đều đăng nhập được | Không commit `.env` (đã có trong `.gitignore`). Không đưa credentials vào `docs/` hay ảnh chụp màn hình |

---

## 12. Danh mục Evidence

| Tệp | Màn hình | Trạng thái | REQ làm bằng chứng |
|---|---|---|---|
| [evidence/login_form_default_fullpage.png](evidence/login_form_default_fullpage.png) | Đăng nhập | Mặc định, các trường rỗng | REQ-LOGIN-01, 02, 04, 05 |
| [evidence/login_form_filled_remember_checked_fullpage.png](evidence/login_form_filled_remember_checked_fullpage.png) | Đăng nhập | Đã nhập đủ, **Remember me đang tích** | REQ-LOGIN-02, 08 |
| [evidence/login_form_empty_submit_error_fullpage.png](evidence/login_form_empty_submit_error_fullpage.png) | Đăng nhập | Gửi biểu mẫu rỗng — 2 banner lỗi | REQ-LOGIN-10 |
| [evidence/login_form_wrong_credentials_fullpage.png](evidence/login_form_wrong_credentials_fullpage.png) | Đăng nhập | Sai thông tin — banner `Invalid email or password` | REQ-LOGIN-14, 15 |
| [evidence/login_csrf_invalid_403_fullpage.png](evidence/login_csrf_invalid_403_fullpage.png) | Đăng nhập | Mã CSRF bị sửa — trang lỗi 403 | REQ-LOGIN-22 |
| [evidence/login_success_dashboard_fullpage.png](evidence/login_success_dashboard_fullpage.png) | Dashboard | Ngay sau khi đăng nhập thành công | REQ-LOGIN-06 |
| [evidence/logout_menu_open_fullpage.png](evidence/logout_menu_open_fullpage.png) | Dashboard | Menu ảnh đại diện **đang mở**, thấy mục Logout | REQ-LOGIN-29 |
| [evidence/forgot_password_form_default_fullpage.png](evidence/forgot_password_form_default_fullpage.png) | Quên mật khẩu | Mặc định | REQ-LOGIN-23, 24 |
| [evidence/forgot_password_empty_submit_error_fullpage.png](evidence/forgot_password_empty_submit_error_fullpage.png) | Quên mật khẩu | Gửi khi bỏ trống — banner `Email not found` | REQ-LOGIN-25 |

> ⚠️ **Đọc ảnh cho đúng:** ở các ảnh chụp trang đăng nhập, ô Email/Password đôi khi có sẵn nội dung với nền xanh nhạt — đó là **trình duyệt tự điền**, không phải máy chủ trả lại giá trị. Bằng chứng: `input#email` trong HTML trả về không hề có thuộc tính `value` (REQ-LOGIN-16).

**Dữ kiện đọc từ DOM, không thể hiện được trên ảnh** (ghi thẳng vào Acceptance Criteria ở mục 3):

| Dữ kiện | Giá trị đọc được | REQ |
|---|---|---|
| Số tệp script trên trang đăng nhập | **0** inline · **0** ngoài | REQ-LOGIN-05 |
| Thuộc tính ràng buộc của `#email` / `#password` | `required=false`, `maxLength=-1`, `minLength=-1`, `pattern=null` trên **cả hai** | REQ-LOGIN-02, mục 4.1 |
| `value` của checkbox Remember me | `"estimate"`, `checked=false`, `disabled=false` | REQ-LOGIN-02, AMB-11 |
| `input#email` sau khi đăng nhập lỗi | `getAttribute('value')` = `null` | REQ-LOGIN-16 |
| Nội dung cookie sau khi tích Remember me | `autologin=a:2:{s:7:"user_id";s:1:"2";s:3:"key";s:16:"8690902dbb083f65";}` — đọc được bằng `document.cookie` | REQ-LOGIN-08, 35 |
| Thân request `POST /admin/authentication` | `csrf_token_name=…&email=…&password=…&remember=estimate` | REQ-LOGIN-21 |
| Mã hàm `logout()` | Kiểm `$(".started-timers-top").find("li.timer").length > 0` → mở popup, ngược lại chuyển tới `authentication/logout` | REQ-LOGIN-30, 31 |
| Số thẻ `<a>` trên trang Quên mật khẩu | **1** — chỉ logo trỏ về trang chủ | REQ-LOGIN-24 |

---

## 13. Nhật ký Thay đổi

| Ngày | Nguồn | REQ ảnh hưởng | Loại | Tóm tắt thay đổi | TC cần xử lý |
|---|---|---|---|---|---|
| 2026-08-14 | UI recon | REQ-LOGIN-01 → 35 | 🟢 Thêm | Khởi tạo tài liệu từ khảo sát UI thực tế + tầng network. Ghi nhận `REQ-LOGIN-27` ở trạng thái ⚪ (chưa kiểm chứng luồng gửi mail đặt lại trên môi trường dùng chung). Mở 14 ambiguity, 7 risk | — (viết TC mới) |
