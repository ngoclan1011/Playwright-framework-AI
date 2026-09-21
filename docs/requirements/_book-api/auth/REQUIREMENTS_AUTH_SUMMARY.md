# Đặc tả Yêu cầu — Module Xác thực & Phiên đăng nhập (`AUTH`)

> Điểm vào cấp hệ thống: [../README.md](../README.md) · Bản đồ API: [../_discovery/api_map.md](../_discovery/api_map.md) mục 2.1

| Mục | Giá trị |
|---|---|
| **Hệ thống** | AnhTester Book Management API — mã hệ thống `BK` (namespace `_book-api/`) |
| **Module** | Xác thực & Phiên đăng nhập — tag spec `Authentication Management` |
| **Prefix** | `AUTH` → mã REQ `REQ-BK-AUTH-<nn>` · TC ID `BK_AUTH_TC_<nnn>` |
| **Operation** | 6 — `POST /api/register` · `POST /api/login` · `POST /api/refetch-token` · `DELETE /api/logout` · `GET /api/me` · `PATCH /api/profile` |
| **Nền tảng** | API ✅ · **Android** 🟨 (Đăng ký · Đăng nhập · Đăng xuất ✅ — Profile · Settings chưa khảo sát) · iOS ❔ chưa khảo sát · Web — không trong phạm vi |
| **Nguồn phân tích** | API: spec OpenAPI snapshot 19-09-2026 + 101 request gọi thật · Android: thao tác thật trên app `book.anhtester.com` 1.0 (debug) ngày 19-09-2026 — chi tiết ở từng file nền tảng |
| **Ngày phân tích** | 19-09-2026 |
| **Tài khoản dùng khảo sát** | API: 5 tài khoản **tự đăng ký** `auto_auth_<timestamp>_*`, đã dọn hết · Android: 1 tài khoản **tự đăng ký trên app** `auto_discover_<timestamp>@auto.test`, đã xoá sau khảo sát — không dùng tài khoản có sẵn nào |
| **Môi trường dùng chung** | **KHÔNG** (user chốt 14-08-2026) — vẫn áp luật chỉ ghi/xoá bản ghi do phiên tạo (skill 3.4.4) |
| **Tổng số REQ** | **86** — dùng chung `Android · API` 8 · `api/` 40 · `mobile/` 38 |
| **Dải mã đã dùng** | `REQ-BK-AUTH-01` → `REQ-BK-AUTH-86` (đợt 1 API `01 → 48` · đợt 2 Android `49 → 86`) · `AMB-BK-AUTH-01` → `AMB-BK-AUTH-20` · `RISK-BK-AUTH-01` → `RISK-BK-AUTH-08` · `STORY-BK-AUTH-01` → `05` |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-BK-AUTH-87` · `AMB-BK-AUTH-21` · `RISK-BK-AUTH-09` — **KHÔNG đánh lại từ 01** |
| **Ambiguity còn treo** | **17** — 🔴 0 (`01` · `02` · `04` đã chốt 20-09-2026: đều là **lỗi**) · 🟠 6 (`03` · `05` · `06` · `07` · `15` · `16`) · 🟡 11 (`08` → `14` · `17` → `20`) · cộng AMB cấp hệ thống tham chiếu (`AMB-BK-01` · `AMB-BK-10` · `AMB-BK-11`) |

---

## 1. Tổng quan

Module `AUTH` là **cổng vào** của Book API: mọi operation 🔒 của 7 module còn lại đều cần `accessToken` do module này cấp. Hỏng module này là chặn toàn bộ đợt kiểm thử — nên `AUTH` đi đầu trong thứ tự đề xuất của danh mục.

Module có 2 kênh token song song: `accessToken` trả trong **body** (và cookie), `refetchToken` chỉ ở **cookie**. Endpoint 🔒 **chỉ** nhận token qua header `Authorization: Bearer` (REQ-39).

Từ 19-09-2026 module có thêm **mặt Android** (app Hybrid Capacitor gọi cùng server). App kiểm định dạng và trường bắt buộc **ngay trên máy** trước khi gửi, nên phần lớn rule validation của app là REQ riêng ở `mobile/`; các rule do **server** quyết định (email trùng, sai mật khẩu, email chưa đăng ký, đăng ký/đăng nhập thành công) đã kiểm khớp trên app và được đưa lên **mục 3** của file này.

### Trong phạm vi

- Đăng ký · đăng nhập · làm mới token · đăng xuất · xem và cập nhật hồ sơ của **chính** người đang đăng nhập
- Validation từng field bắt buộc/định dạng, hình dạng body lỗi
- Cookie phiên và cờ bảo mật, vòng đời token (thu hồi · xoay vòng) ở mức quan sát được từ ngoài
- **Android:** màn hình Sign in · Sign up · menu avatar · Đăng xuất · 8 nhóm yêu cầu riêng mobile

### Ngoài phạm vi

| Vùng | Lý do |
|---|---|
| Quản lý user **khác** (`/api/user`, `/api/user/{id}`) | Thuộc module `USER` — kể cả F-01 · F-02 · F-07 |
| Phân quyền theo vai trò | Spec không có khái niệm role — `AMB-BK-01` cấp hệ thống, chờ PO |
| Giải mã/kiểm tra nội dung JWT (claim, thuật toán ký) | Không có tài liệu về claim; chỉ assert **hình thái** token |
| Giới hạn tần suất / chống dò mật khẩu | Không có căn cứ trong spec — `AMB-BK-08` cấp hệ thống |
| Nội dung trường `config` | Kiểu tự do, không có schema — `AMB-BK-10` cấp hệ thống |
| Android: My Profile · Setting account · Exit app | Chưa khảo sát ở lượt 19-09-2026 — lượt sau của `/generate-requirements-from-mobile auth` |
| iOS | Chưa khảo sát — cần máy Mac hoặc cloud. **Không** suy từ Android |
| Link "Need help?" | Không phản hồi — `AMB-BK-11` cấp hệ thống |

---

## Bản đồ tài liệu

| Nền tảng | File | Story | REQ bao phủ |
|---|---|---|---|
| Chung `Android · API` | chính file này — mục 3 | STORY-BK-AUTH-01 · 02 | `01` · `03` · `08` · `09` · `11` · `14` · `15` · `16` (8) |
| API | [api/requirements_auth_api.md](api/requirements_auth_api.md) | STORY-BK-AUTH-01 → 05 | `02` · `04 → 07` · `10` · `12` · `13` · `17 → 48` (40) |
| Mobile (Android) | [mobile/requirements_auth_mobile.md](mobile/requirements_auth_mobile.md) | STORY-BK-AUTH-01 · 02 · 03 | `REQ-BK-AUTH-49` → `REQ-BK-AUTH-86` (38) |

Tự kiểm: `8 + 40 + 38 = 86` = dải `01 → 86` ✔ — mỗi REQ nằm ở đúng 1 file.

| Nội dung | Ở đâu |
|---|---|
| Metadata · Tổng quan & phạm vi (1) · **REQ dùng chung (3)** · Ma trận phân quyền (6) · Ma trận trạng thái (7) · Phân rã Story (10) · AMB & RISK (11) · Nhật ký (13) | **File này** |
| Nguồn spec · Môi trường gọi thử · Bản đồ phủ tài liệu (2) · Endpoint Catalog · Bảng REQ (3) · Field Spec (4) · Validation (5) · Luồng (8) · Phi chức năng (9) · Nhật ký kiểm chứng (12) | [api/requirements_auth_api.md](api/requirements_auth_api.md) |
| Thiết bị khảo sát · Tầng network · Bảng REQ Android · Field Spec · Validation · Yêu cầu riêng mobile · Ghi chú automation · Danh mục Evidence | [mobile/requirements_auth_mobile.md](mobile/requirements_auth_mobile.md) |
| Spec gốc | [../_discovery/sources/openapi_2026-09-19.json](../_discovery/sources/openapi_2026-09-19.json) |

---

## 3. Yêu cầu dùng chung (Android · API)

Rule do **server** quyết định, đã kiểm khớp trên cả hai nền tảng. AC tách 2 vế: **API** (giữ nguyên từ đợt 1, mã `K-nn` ở [api/ mục 12](api/requirements_auth_api.md#12-nhật-ký-kiểm-chứng-evidence)) · **Android** (ảnh ở [mobile/ mục 9](mobile/requirements_auth_mobile.md#9-danh-mục-evidence)). Rule giống nhau nhưng **câu chữ** hiển thị trên app là `msg` của API — xem bảng Validation ở `mobile/` mục 5.

| REQ ID | Tên yêu cầu | Nền tảng | Mô tả | Acceptance Criteria | Trạng thái | Cập nhật lần cuối | Nguồn |
|---|---|---|---|---|---|---|---|
| REQ-BK-AUTH-01 | Đăng ký thành công với tên + email + mật khẩu hợp lệ | Android · API | Người dùng mới tự tạo tài khoản | **API:** `POST /api/register` body JSON có `name`, `email` chưa tồn tại (định dạng email), `password` → **201** · body là object có khoá `msg` kiểu string, **chứa** `Register successfully` · **Android:** Sign up nhập Name + Email chưa tồn tại + Password + Password Confirmation khớp → `Register` → chuyển sang Sign in · thông báo `Register successfully.` | 🟢 | 19-09-2026 · + Android | API: Spec + kiểm chứng thực tế · POST /api/register → 201 (K-01) · Android: Kiểm chứng thực tế · `android_signup_success_snackbar.png` |
| REQ-BK-AUTH-03 | Tài khoản vừa đăng ký đăng nhập được | Android · API | Tác tạo của đăng ký phải dùng được (skill 4.3.8) | **API:** Sau REQ-01 → `POST /api/login` với đúng `email` + `password` vừa đăng ký → **200** · body có `accessToken` · **Android:** tài khoản vừa đăng ký trên app → Sign in đúng email + mật khẩu → vào Dashboard `Welcome <tên>` | 🟢 | 19-09-2026 · + Android | API: Thực tế — spec không nói · POST /api/login → 200 (K-09) · Android: Kiểm chứng thực tế · `android_signin_success_dashboard.png` |
| REQ-BK-AUTH-08 | Không đăng ký trùng email | Android · API | Email là định danh duy nhất | **API:** Đăng ký lần 2 với `email` của tài khoản đã có → **422** · `msg` = `Email already exists.` · `fields.email` **chứa** `Email already exists.` · **Android:** Sign up với email đã có → thông báo `Email already exists.` · vẫn ở Sign up (cách hiển thị: REQ-81) | 🟢 | 19-09-2026 · + Android | API: Thực tế — spec không nói · POST /api/register → 422 (K-03) · Android: Kiểm chứng thực tế · `android_signup_email_exists.png` |
| REQ-BK-AUTH-09 | Kiểm trùng email không phân biệt hoa thường | Android · API | Biến thể viết hoa của email đã có cũng bị coi là trùng | **API:** Tài khoản `x@auto.test` đã có → đăng ký với `X@AUTO.TEST` → **422** `Email already exists.` · **Android:** tài khoản `<email chữ thường>` đã có → Sign up với email đó **viết hoa toàn bộ** (form mở mới) → `Email already exists.` | 🟢 | 19-09-2026 · + Android | API: Thực tế — spec không nói · → 422 (K-134) · Android: Kiểm chứng thực tế · `android_signup_email_exists_uppercase.png` |
| REQ-BK-AUTH-11 | Đăng nhập thành công | Android · API | Email + mật khẩu đúng → vào hệ thống | **API:** `POST /api/login` đúng `email` + `password` → **200** · body có đủ 3 khoá string `msg` (**chứa** `Login successfully`) · `accessToken` (JWT — 3 đoạn base64url nối bằng `.`) · `exp` (chuỗi thời hạn — quan sát `6d`, **không** assert giá trị: là cấu hình) · **Android:** Sign in đúng email + mật khẩu → chuyển sang Dashboard · thông báo `Login successfully.` | 🟢 | 19-09-2026 · + Android · tên bỏ vế "trả access token" (là AC riêng của API) | API: Spec + kiểm chứng thực tế · → 200 (K-09) · Android: Kiểm chứng thực tế · `android_signin_success_dashboard.png` |
| REQ-BK-AUTH-14 | Email đăng nhập không phân biệt hoa thường | Android · API | | **API:** Tài khoản đăng ký bằng email chữ thường → đăng nhập bằng email **viết hoa toàn bộ** + mật khẩu đúng → **200** · **Android:** như vế API trên Sign in → vào Dashboard · `Login successfully.` | 🟢 | 19-09-2026 · + Android | API: Thực tế — spec không nói · → 200 (K-16) · Android: Kiểm chứng thực tế · `android_signin_uppercase_email_success.png` |
| REQ-BK-AUTH-15 | Sai mật khẩu bị từ chối | Android · API | | **API:** Email đã đăng ký + mật khẩu sai → **400** · `msg` = `Invalid password.` · `fields.password` **chứa** `Invalid password, please try again.` · **không** có `Set-Cookie` · **Android:** Sign in email đã đăng ký + mật khẩu sai → thông báo `Invalid password.` · vẫn ở Sign in · **không** hiện câu `Invalid password, please try again.` dưới ô | 🟢 | 19-09-2026 · + Android | API: Spec + kiểm chứng thực tế · → 400 (K-11) · Android: Kiểm chứng thực tế · `android_signin_wrong_password_snackbar.png` |
| REQ-BK-AUTH-16 | Email chưa đăng ký bị từ chối | Android · API | | **API:** Email chưa có trong hệ thống → **404** · `msg` = `User not found.` · `fields.email` **chứa** `Email not found, please register.` · **Android:** Sign in email chưa đăng ký → thông báo `User not found.` · vẫn ở Sign in | 🟢 | 19-09-2026 · + Android | API: Spec + kiểm chứng thực tế · → 404 (K-12 · K-50) · Android: Kiểm chứng thực tế · `android_signin_email_not_found_snackbar.png` |

> REQ-15 · 16 trên Android cho thấy **lộ email nào đã đăng ký** giống API (F-20 · `AMB-BK-AUTH-09` · `RISK-BK-AUTH-06`): hai câu thông báo khác nhau cho hai trường hợp.

---

## 6. Ma trận Phân quyền

Spec **không** có khái niệm vai trò (`AMB-BK-01`). Cột vai trò duy nhất có căn cứ là **người dùng tự đăng ký** — tài khoản do chính phiên này tạo qua `POST /api/register`.

| Operation | Không token | Người dùng tự đăng ký (Bearer hợp lệ) | Vai trò khác (nếu có) |
|---|---|---|---|
| POST /api/register | ✅ 201 (REQ-02) | — | — |
| POST /api/login | ✅ 200 (REQ-12) | — | — |
| POST /api/refetch-token | ✅ 200 — chỉ cần cookie (REQ-26) | — | — |
| DELETE /api/logout | ❌ 401 (REQ-30) | ✅ 200 (REQ-29) | ❔ `AMB-BK-01` |
| GET /api/me | ❌ 401 (REQ-37) | ✅ 200 (REQ-34) | ❔ `AMB-BK-01` |
| PATCH /api/profile | ❌ 401 (REQ-43) | ✅¹ qua lớp xác thực | ❔ `AMB-BK-01` |

```
Tổng 18 ô = Đã kiểm chứng 9 · Suy diễn 0 · Chưa rõ 3 · Không áp dụng 6
Ô "không áp dụng" là [register · login · refetch-token] × [Người dùng tự đăng ký · Vai trò khác] —
operation công khai (`security: []`), token không tham gia xử lý nên không phân biệt theo người gọi.
Cột "Vai trò khác" chưa rõ vì spec không định nghĩa vai trò (AMB-BK-01).
```

¹ Không bị 401/403 — tức **có quyền** gọi — nhưng thao tác luôn trả 422 do lỗi F-16 (`AMB-BK-AUTH-01`). Ô này chứng minh quyền, **không** chứng minh chức năng chạy được.

**Hành động trên Android** — app không có chọn vai trò khi đăng ký, không có màn hình phân quyền; chỉ phân biệt được 2 trạng thái:

| Hành động (Android) | Chưa đăng nhập | Đã đăng nhập (tài khoản tự đăng ký) |
|---|---|---|
| Mở Sign in bằng nút avatar | ✅ (REQ-50) | ❌ — avatar mở menu tài khoản (REQ-60) |
| Mở Sign up · đăng ký | ✅ (REQ-66 · 01) | — |
| Đăng xuất | — | ✅ (REQ-62) |

```
Tổng 6 ô = Đã kiểm chứng 4 · Suy diễn 0 · Chưa rõ 0 · Không áp dụng 2
Ô "không áp dụng" là [Mở Sign up × Đã đăng nhập] — không có lối vào Sign up khi đã đăng nhập (avatar mở menu,
Dashboard không còn thẻ sign in); [Đăng xuất × Chưa đăng nhập] — chưa có phiên để đăng xuất.
```

---

## 7. Ma trận Trạng thái

**Không áp dụng** — module không có entity mang `enum` trạng thái. Vòng đời **phiên** (đăng nhập → làm mới → đăng xuất) mô tả ở [api/ mục 8.1](api/requirements_auth_api.md#81-vòng-đời-phiên); các điểm chưa rõ của nó nằm ở `AMB-BK-AUTH-02` · `06` · `07`.

---

## 10. Phân rã Epic / Story

| Story ID | Tên Story | REQ bao phủ | Số REQ | AMB / RISK liên quan | Ghi chú phạm vi |
|---|---|---|---|---|---|
| STORY-BK-AUTH-01 | Đăng ký tài khoản | REQ-BK-AUTH-01 → 10 · 65 → 86 | 32 | AMB-BK-AUTH-03 · 08 · 14 · 15 · 17 · 18 · RISK-BK-AUTH-03 · 04 | `POST /api/register` · màn hình Sign up (Android) |
| STORY-BK-AUTH-02 | Đăng nhập | REQ-BK-AUTH-11 → 23 · 49 → 61 · 63 · 64 | 28 | AMB-BK-AUTH-04 · 09 · 13 · 16 · RISK-BK-AUTH-05 · 06 | `POST /api/login` + cookie phiên · màn hình Sign in, menu avatar, vòng đời phiên (Android) |
| STORY-BK-AUTH-03 | Làm mới token & Đăng xuất | REQ-BK-AUTH-24 → 33 · 62 | 11 | AMB-BK-AUTH-02 · 06 · 07 · 10 · RISK-BK-AUTH-01 | `POST /api/refetch-token` · `DELETE /api/logout` · Logout (Android) |
| STORY-BK-AUTH-04 | Thông tin & Hồ sơ người dùng hiện tại | REQ-BK-AUTH-34 → 47 | 14 | AMB-BK-AUTH-01 · 05 · 12 · RISK-BK-AUTH-02 | `GET /api/me` · `PATCH /api/profile` — Android chưa khảo sát |
| STORY-BK-AUTH-05 | Quy ước chung của module | REQ-BK-AUTH-48 | 1 | — | Error envelope dùng chung |

**Tổng: 5 Story / 86 REQ** — `32 + 28 + 11 + 14 + 1 = 86 ✔` · mọi REQ thuộc đúng một Story, không mồ côi, không trùng. (Story 01: `10 + 22` · Story 02: `13 + 13 + 1 + 1` · Story 03: `10 + 1`.)

### Đối chiếu AMB / RISK

| Nhóm | Mã | Nằm ở đâu |
|---|---|---|
| AMB thuộc Story | AMB-BK-AUTH-01 → 10 · 12 → 18 | phân bổ ở bảng Story |
| AMB cấp Epic | AMB-BK-AUTH-11 · 19 · 20 | `11`: status khai trong spec chưa quan sát — cắt ngang 6 operation · `19`: phiên bản app tối thiểu — cấp app, không thuộc Story nào |
| RISK thuộc Story | RISK-BK-AUTH-01 → 06 | phân bổ ở bảng Story |
| RISK cấp Epic | RISK-BK-AUTH-07 · 08 | Locator và thao tác bấm trên app — ảnh hưởng mọi TC Android của module |

### Hạng mục cấp Epic (cố ý không gán vào Story nào)

| Hạng mục | Lý do |
|---|---|
| Ma trận phân quyền (6) | Cắt ngang 6 operation |
| `AMB-BK-AUTH-11` | Mỗi operation có ≥ 1 status khai mà chưa quan sát — một câu hỏi chung cho PO |
| Tham chiếu `AMB-BK-01` · `AMB-BK-08` · `AMB-BK-10` · `AMB-BK-11` | AMB **cấp hệ thống**, sở hữu ở `api_map.md` / `system_map.md` — module chỉ tham chiếu |
| `AMB-BK-AUTH-19` · `RISK-BK-AUTH-07` · `08` | Cấp app / cấp automation Android — cắt ngang mọi Story có mặt Android |

### Thứ tự triển khai đề xuất

1. **STORY-BK-AUTH-02 Đăng nhập** — mọi Story khác cần token
2. **STORY-BK-AUTH-01 Đăng ký** — tạo tài khoản test cho mọi TC; `REQ-05` · `17` đang lệch spec (`AMB-BK-AUTH-03`)
3. **STORY-BK-AUTH-05 Quy ước chung** — dùng làm assertion dùng chung cho TC lỗi
4. **STORY-BK-AUTH-03 Làm mới & Đăng xuất** — `REQ-33` **BLOCKED** bởi `AMB-BK-AUTH-02` 🔴 (viết TC được, kỳ vọng FAIL)
5. **STORY-BK-AUTH-04 Hồ sơ** — `REQ-41 · 42 · 45 → 47` **BLOCKED** bởi `AMB-BK-AUTH-01` 🔴 (endpoint không dùng được); `REQ-34 → 40 · 43 · 44` làm ngay được

**Android:** cùng thứ tự Story. Không REQ Android nào `BLOCKED`; `REQ-63` · `83` · `73` dựa trên hành vi quan sát, chờ PO xác nhận (`AMB-BK-AUTH-16` · `17` · `14`).

---

## 11. Điểm Mơ Hồ & Rủi Ro

### 11.1. Ambiguities

| Mã | Câu hỏi | Nguy cơ | Mức độ | Assumption tạm | Trạng thái | Kết luận |
|---|---|---|---|---|---|---|
| AMB-BK-AUTH-01 | `PATCH /api/profile` trả **422** `{"msg":"Invalid data.","fields":{"fields":["Property 'fields' is missing","Expected object"]}}` với **mọi** body hợp lệ đã thử (JSON · form · multipart · có/không bọc `fields`) — lỗi server hay endpoint cần body dạng khác chưa công bố? (F-16) | Không cập nhật được hồ sơ, không đổi được mật khẩu. 5 REQ không kiểm được hành vi đúng | 🔴 | Là **lỗi** — TC viết theo spec (body phẳng), kỳ vọng 200, sẽ FAIL | ✅ Đã chốt 20-09-2026 | **Lỗi cần báo** (user chốt ở checkpoint `/generate-testcases-api`). TC kỳ vọng 200, gắn `@KnownBug` |
| AMB-BK-AUTH-02 | Sau `DELETE /api/logout` trả 200, `refetchToken` của **chính phiên đó** vẫn làm mới được access token (200) — cố ý hay lỗi? (F-17) | Đăng xuất không kết thúc phiên: cookie bị lộ vẫn sinh token mới được sau khi người dùng đã đăng xuất | 🔴 | Là **lỗi** — REQ-33 kỳ vọng 404 `Invalid token.` | ✅ Đã chốt 20-09-2026 | **Lỗi cần báo** (user chốt). REQ-33 giữ kỳ vọng 404, TC gắn `@KnownBug` |
| AMB-BK-AUTH-03 | Spec 19-09-2026 thêm `default: "user@example.com"` cho `email` và server **dùng default khi thiếu field** — thay vì báo thiếu field bắt buộc. Cố ý? (F-19) | `required` bị vô hiệu: thiếu email thì hệ thống xử lý như email của một tài khoản có thật (`user@example.com`, không do QA tạo). Kết quả TC đổi theo việc tài khoản đó còn hay mất | 🟠 | Là **lỗi** — `required` thắng `default`; REQ-05 · 17 kỳ vọng 422 báo thiếu `email` | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-04 | Cookie `accessToken` **thiếu** `HttpOnly` · `Secure` · `SameSite` (cookie `refetchToken` cùng response thì đủ). Yêu cầu bảo mật này có áp dụng không? (F-03 — chuyển từ phát hiện cấp hệ thống) | Script chạy trên trang (XSS) đọc được access token | 🔴 | **Áp dụng** — REQ-22 kỳ vọng đủ 3 cờ | ✅ Đã chốt 20-09-2026 | **Áp dụng** (user chốt). REQ-22 giữ kỳ vọng đủ 3 cờ, TC gắn `@KnownBug` |
| AMB-BK-AUTH-05 | Đổi mật khẩu qua `PATCH /api/profile` có **bắt buộc** `password_old` không, và `password_old` sai thì trả gì? Spec khai cả hai optional. *(Chuyển từ `AMB-BK-06` cấp hệ thống.)* Chưa kiểm được vì F-16 | Nếu không bắt buộc: token bị lộ là đổi được mật khẩu, chiếm hẳn tài khoản | 🟠 | Bắt buộc và phải đúng; sai → 400/422 | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-06 | Access token vẫn gọi `GET /api/me` được (200) sau khi đăng xuất (F-23). Chấp nhận do JWT không trạng thái, sống tới hết `exp` = 6 ngày? Đổi mật khẩu có thu hồi token cũ không (chưa kiểm được — F-16)? | Token bị lộ dùng được tới 6 ngày dù chủ tài khoản đã đăng xuất | 🟠 | Chấp nhận là thiết kế — **không** cấp REQ; ghi RISK-01 | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-07 | Cùng một `refetchToken` dùng lại nhiều lần đều 200, và refetch không cấp cookie mới — hệ thống **không** xoay vòng refresh token. Cố ý? (F-18) | Refresh token bị lộ dùng được mãi, không phát hiện được việc dùng lại | 🟠 | Là thiết kế hiện tại — **không** cấp REQ cho xoay vòng | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-08 | Có chính sách mật khẩu không (độ dài tối thiểu, độ phức tạp)? Mật khẩu `1` đăng ký được. `name`/`password` rỗng `""` → 422 body bất thường `fields.fields` (F-22) | Không viết được TC biên cho mật khẩu/tên; body lỗi rỗng không cho biết field nào sai | 🟡 | Không có chính sách — không cấp REQ biên độ dài | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-09 | Đăng nhập sai mật khẩu → 400 `Invalid password.`, email không tồn tại → 404 `Email not found, please register.` — lộ email nào đã đăng ký. Cố ý? (F-20) | Dò được danh sách email đã đăng ký | 🟡 | Giữ hành vi hiện tại làm REQ (15 · 16 — đúng status spec khai) + RISK-06 | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-10 | Cookie `refetchToken` có `Max-Age` ≈ `1.79 × 10⁹` giây — trùng **mốc epoch** hết hạn (≈ thời điểm gọi + 7 ngày), không phải khoảng thời gian → trình duyệt giữ cookie ~56 năm. Hạn thật của refresh token phía server là bao lâu? (F-21) | Không viết được TC hết hạn refresh token; cookie tồn tại lâu hơn token | 🟡 | Hạn phía server 7 ngày; REQ-20 **không** assert giá trị `Max-Age` | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-11 | Spec khai các status **chưa quan sát được điều kiện phát sinh**: 403 (login · logout · me · profile) · 400 (register · refetch-token · logout) · 404 (logout · me · profile) · 422 (logout · me). Tài khoản đã xoá gọi `/api/me` → **401** `User no longer exists`, không phải 404. Status nào còn hiệu lực, điều kiện nào sinh ra chúng? | TC viết cho status "trên giấy" sẽ không dựng được điều kiện; bỏ qua thì có thể sót nhánh thật | 🟡 | Không cấp REQ cho status chưa quan sát; REQ-40 theo thực tế | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-12 | Đổi `email` qua hồ sơ sang email đã thuộc tài khoản khác thì trả gì? Chưa kiểm được (F-16 — K-25 trả body lỗi chung) | Hai tài khoản trùng email nếu server không chặn | 🟡 | 422 `Email already exists.` như REQ-08 | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-13 | Cookie `accessToken` được set khi đăng nhập nhưng **không** endpoint nào trong module đọc nó (REQ-39); đăng xuất cũng không xoá nó (K-130). Cookie này dùng cho ai? | Cookie thừa mang token, thiếu cờ bảo mật, sống sau đăng xuất — mở rộng bề mặt lộ token (cộng AMB-04) | 🟡 | Dành cho client khác ngoài phạm vi; không cấp REQ xoá cookie này khi đăng xuất | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-14 | Sign up (Android) báo `Name must be less than 250 characters.` nhưng Name **đúng 250** ký tự vẫn hợp lệ (REQ-73) — giới hạn đúng là ≤ 250 hay < 250? Và API **không** khai `maxLength` cho `name` — server có giới hạn không, có khớp 250 của app không? | Câu lỗi lệch biên thật · app và API có thể nhận độ dài khác nhau cho cùng một trường (tạo qua API tên dài hơn app hiển thị/sửa được) | 🟡 | Biên đúng là **≤ 250** như app đang chạy; API chưa rõ — không cấp REQ độ dài cho API | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-15 | Ô Phone trên Sign up (Android) **không** kiểm định dạng — `abc-xyz` không báo lỗi; spec API cũng không khai ràng buộc `phone`. Có quy tắc định dạng số điện thoại không? | Lưu được số điện thoại rác | 🟠 | Không có quy tắc — không cấp REQ định dạng Phone | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-16 | Mất mạng khi bấm `Login account` (Android): **không** có thông báo, **không** có trạng thái chờ — người dùng không biết vì sao không vào được (REQ-63). Cố ý? | Người dùng bấm lặp lại hoặc tưởng app treo | 🟠 | Là **thiếu sót** — nên có thông báo lỗi mạng; REQ-63 chỉ assert điều quan sát được (không vào hệ thống, giữ dữ liệu) | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-17 | Sign up (Android) **giữ nguyên** dữ liệu đã nhập, kể cả 2 ô mật khẩu, khi rời màn hình bằng Back rồi quay lại (REQ-83). Cố ý? | Người dùng khác cầm máy mở lại Sign up thấy được mật khẩu đã gõ (bấm nút con mắt) | 🟡 | Giữ là thiết kế hiện tại — REQ-83 theo quan sát | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-18 | Thông báo nổi ở cuối Sign up **che nút Register** trong lúc hiển thị (`android_signup_email_exists.png`). Chấp nhận? | Người dùng sửa email xong không bấm được Register cho tới khi thông báo tự đóng | 🟡 | Chấp nhận — TC chờ thông báo đóng (REQ-58) rồi mới bấm lại | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-19 | App có chặn phiên bản cũ / bắt buộc cập nhật không? Manifest `minSdk 23`, bản khảo sát `1.0 (versionCode 1)` — chưa có căn cứ nào | Không viết được TC cập nhật bắt buộc | 🟡 | Không có cơ chế cập nhật bắt buộc — không cấp REQ | ❓ Chờ trả lời | — |
| AMB-BK-AUTH-20 | Gửi `Content-Type` không hỗ trợ (VD `text/plain`), `Accept` không hỗ trợ (VD `application/xml`), hoặc body rất lớn (> 1 MB) tới `register` · `login` · `profile` thì hệ thống phải trả gì? Spec **không** khai `406` · `413` · `415` | Không viết được TC kỳ vọng cứng cho 3 status chuẩn này; nếu server trả `500` là lỗi độ bền | 🟡 | Chưa có kỳ vọng — TC xếp vào **TC treo**; chỉ kiểm độ bền (không `500`) ở TC_068 · 081 | ❓ Chờ trả lời | — |

**AMB cấp hệ thống tham chiếu** (sở hữu ở [`api_map.md` mục 4](../_discovery/api_map.md#4-khoảng-trống-của-spec-amb--cần-chốt-trước-khi-sinh-tc) · [`system_map.md` mục 8](../_discovery/system_map.md#8-ambiguity-cấp-hệ-thống-phát-sinh-ở-mặt-mobile)): `AMB-BK-01` 🔴 mô hình vai trò (cột "Vai trò khác" ở mục 6) · `AMB-BK-08` 🟡 rate limit · `AMB-BK-10` 🟡 nội dung `config` · `AMB-BK-11` 🟡 link "Need help?" không phản hồi.

### 11.2. Risks

| Mã | Rủi ro | Mô tả | Mitigation |
|---|---|---|---|
| RISK-BK-AUTH-01 | Đăng xuất không kết thúc phiên | Cả access token (6 ngày) lẫn refresh token vẫn dùng được sau đăng xuất (F-17 · F-23), refresh token không xoay vòng (F-18) — token lộ một lần là dùng lâu dài | TC riêng cho REQ-33 gắn tag `@Security`; báo bug bằng `/create-bug-report` sau khi PO trả lời `AMB-BK-AUTH-02` |
| RISK-BK-AUTH-02 | Hồ sơ không cập nhật được | F-16 chặn toàn bộ nhánh ghi của `PATCH /api/profile` — không kiểm được đổi mật khẩu, trùng email, `password_old` | TC của REQ-41 · 42 · 45 → 47 viết sẵn, đánh dấu `blocked-by-bug`; retest bằng `/retest-fixed-bugs` khi dev sửa |
| RISK-BK-AUTH-03 | Kết quả TC phụ thuộc tài khoản không do QA sở hữu | F-19: thiếu `email` → hệ thống dùng `user@example.com`, một tài khoản có thật trên production. Tài khoản đó bị xoá/đổi thì REQ-05 · 17 đổi kết quả mà không ai sửa code | Assert REQ-05 · 17 theo **spec** (422 báo thiếu `email`), không assert theo hành vi hiện tại; **không** đăng nhập hay sửa tài khoản `user@example.com` |
| RISK-BK-AUTH-04 | Rác dữ liệu trên production | Mỗi lần chạy TC đăng ký tài khoản thật trên server duy nhất (đã có 744 sách rác từ đợt trước — `api_map.md` mục 5) | Mọi TC tạo tài khoản `auto_auth_<timestamp>_*` và tự xoá bằng `DELETE /api/user/{id}` với **token của chính tài khoản đó** ở teardown |
| RISK-BK-AUTH-05 | Access token lộ qua script trên trang | Cookie `accessToken` thiếu `HttpOnly` (F-03) | TC REQ-22 gắn `@Security`; phụ thuộc `AMB-BK-AUTH-04` |
| RISK-BK-AUTH-06 | Dò được email đã đăng ký | F-20 — status/message khác nhau giữa sai mật khẩu và email không tồn tại. **Android cũng lộ** (`Invalid password.` vs `User not found.`) | Ghi nhận cho đội bảo mật; TC REQ-15 · 16 chốt hành vi hiện tại để phát hiện khi đổi |
| RISK-BK-AUTH-07 | Locator Android không ổn định | `resource-id` ô nhập tự sinh, đổi giữa 2 lần render (`_r_k_` → `_r_bv_`) · `hint` bị nối câu lỗi khi ô đang lỗi · nút avatar và nút con mắt không có nhãn | Locator `starts-with(@hint,'<nhãn>')` · `resourceId("address-division")` cho nhóm địa chỉ (id cố định) · đề nghị dev thêm định danh ổn định (`content-desc` / `data-testid`) — chi tiết `mobile/` mục 8 |
| RISK-BK-AUTH-08 | Bấm nút gửi đôi khi không có tác dụng | 2 lần (đang có mạng) bấm `Login account` không gửi form, lần bấm kế tiếp mới gửi. Chưa rõ là lỗi app hay do cách công cụ bấm vào WebView | Automation assert theo **kết quả** (chờ thông báo / đổi màn hình), ẩn bàn phím trước khi bấm. Tester thử bằng tay — tái hiện được thì báo bug |

---

## 13. Nhật ký Thay đổi

| Ngày | Nguồn | REQ ảnh hưởng | Loại | Tóm tắt thay đổi | TC cần xử lý |
|---|---|---|---|---|---|
| 21-09-2026 | Quy ước đặt tên | — | ✏️ Biên tập | Đổi tên file index `requirements_auth.md` → `REQUIREMENTS_AUTH_SUMMARY.md` — quy ước mới: index IN HOA để khác hẳn file nền tảng. Nội dung, mã REQ/TC không đổi; mọi link trỏ tới đã sửa | — |
| 20-09-2026 | `/generate-testcases-api auth` | — | 🟡 Thêm AMB | Mở `AMB-BK-AUTH-20` — kỳ vọng cho `406` · `413` · `415` (spec không khai). Không đổi REQ | TC treo ở index TC |
| 20-09-2026 | User chốt ở checkpoint `/generate-testcases-api auth` | REQ-BK-AUTH-22 · 33 · 41 · 42 · 45 → 47 | ✏️ Chốt AMB | `AMB-BK-AUTH-01` · `02` · `04` → ✅ đều là **lỗi / áp dụng**. REQ **không đổi** — kỳ vọng giữ theo spec / yêu cầu bảo mật; hành vi hiện tại là bug | TC API của các REQ này gắn `@KnownBug`, mở bug bằng `/create-bug-report` |
| 19-09-2026 | UI recon Android · `/generate-requirements-from-mobile` | REQ-BK-AUTH-49 → 86 | 🟢 Thêm | Mặt Android — Đăng ký · Đăng nhập · Đăng xuất: 38 REQ ở `mobile/requirements_auth_mobile.md` · 28 ảnh evidence · mở `AMB-BK-AUTH-14 → 19` · `RISK-BK-AUTH-07 · 08` | — (viết mới cho Android, tag `@Android`) |
| 19-09-2026 | UI recon Android | REQ-BK-AUTH-01 · 03 · 08 · 09 · 11 · 14 · 15 · 16 | 🟢 Thêm | Mở rộng nền tảng: + Android — kiểm khớp trên app, **chuyển dòng từ `api/` lên index** mục 3, AC thêm vế Android, mã giữ nguyên | viết mới cho Android · TC API giữ nguyên |
| 19-09-2026 | UI recon Android | REQ-BK-AUTH-01 · 11 | ✏️ Biên tập | Tên viết lại trung lập nền tảng: `01` *"…với `name` + `email` + `password` hợp lệ"* → *"…với tên + email + mật khẩu hợp lệ"* · `11` *"Đăng nhập thành công trả access token"* → *"Đăng nhập thành công"* (vế access token chỉ đúng với API, vẫn nằm nguyên trong AC phần API). Hành vi không đổi | — |
| 19-09-2026 | UI recon Android | — | ✏️ Biên tập | Thêm mục 3 (REQ dùng chung) · dòng Mobile ở Bản đồ tài liệu · ma trận phân quyền Android · cập nhật bảng Story (86 REQ) | — |
| 19-09-2026 | Spec OpenAPI snapshot 19-09-2026 (`sha256 32bb8b39…3f09`) + 101 request gọi thật | REQ-BK-AUTH-01 → 48 | 🟢 Thêm | Khởi tạo tài liệu module từ `/generate-requirements-from-api`. 48 REQ / 5 Story · 13 AMB (3 🔴) · 6 RISK. `AMB-BK-06` cấp hệ thống chuyển thành `AMB-BK-AUTH-05`; F-03 quy về `AMB-BK-AUTH-04`. Ghi nhận phát hiện mới F-16 → F-25 vào `api_map.md` | — (viết TC mới) |
