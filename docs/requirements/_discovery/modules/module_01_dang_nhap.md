# Module 01 — Đăng nhập & Phiên · `LOGIN`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-LOGIN-NN`.

| Mục | Giá trị |
|---|---|
| **Prefix** | `LOGIN` |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — cổng vào hệ thống, mọi module khác phụ thuộc; liên quan trực tiếp tới quyền truy cập |
| **Ước REQ** | 12–18 |
| **Thứ tự khảo sát** | 1 (đầu tiên) |

---

## Màn hình

| Màn hình | Route | Loại | CRUD | Status flow |
|---|---|---|---|---|
| Đăng nhập | `/login` | Form | — | — |
| Trang 404 | `/404` | Thông báo | — | — |

**Thành phần ngoài màn hình chính:** nút `Logout` trong menu tài khoản ở header · nút đổi ngôn ngữ (hiện cả ở màn đăng nhập lẫn sau khi vào hệ thống).

---

## Quan sát được ở tầng khám phá

### Form đăng nhập

| Thành phần | Ghi nhận |
|---|---|
| Tiêu đề | `CMS Adsplay` · phụ đề `for FPTPlay` |
| Field | `Email` (bắt buộc, placeholder `admin@fpt.vn`) · `Password` (bắt buộc, có nút hiện/ẩn mật khẩu — icon `eye-invisible`) |
| Nút | `Sign in` |
| Footer | `© 2026 Adsplay • Internal CMS` |
| Góc phải | Nút đổi ngôn ngữ · nút tuỳ chọn giao diện — **có sẵn trước khi đăng nhập** |

### Validation message đã bắt được (ngôn ngữ `en_US`)

| Tình huống | Message nguyên văn |
|---|---|
| Bỏ trống Email rồi submit | `Please input username` |
| Bỏ trống Password rồi submit | `Please input password` |

> ⚠️ Nhãn field là **Email** nhưng message lại nói **username** — lệch thuật ngữ. Ở tầng module cần mở `AMB` hỏi PO: chủ đích hay lỗi i18n.

### Hành vi phiên

| Quan sát | Chi tiết |
|---|---|
| Chưa đăng nhập truy cập route bất kỳ | Bị đẩy về `/login`. Trong lần khảo sát đầu, truy cập `/dashboard/report-campaign` → nhảy qua `/404` rồi mới về `/login` — **cần xác minh lại**, có thể là lỗi điều hướng |
| Đăng nhập thành công | Vào thẳng `/dashboard/report-campaign` |
| Phiên hết hạn | **Xảy ra thật trong lúc khảo sát**, khoảng 15 phút không thao tác → bị đẩy về `/login`, **không có thông báo nào** cho người dùng (xem PH-07) |
| Lưu trữ phiên | `localStorage` khoá `userStore` (~9.5 KB) chứa `userInfo`: `id`, `email`, `name`, `gender`, `activated`, `created…` |
| Đăng xuất | Menu tài khoản ở header → `Logout`. Menu chỉ hiện email + Logout, **không có** trang Hồ sơ cá nhân |

### Đa ngôn ngữ

Hai lựa chọn: `English` · `Việt Nam`. Lưu ở `localStorage.i18nextLng` (giá trị quan sát được: `en_US`).
→ **Mọi message ở mục trên chỉ đúng với `en_US`.** Phải khảo sát lại bản tiếng Việt, hoặc chốt một ngôn ngữ chuẩn.

---

## Vùng chưa xác minh — module này

| Vùng | Vì sao chưa có |
|---|---|
| Message khi **sai** email/mật khẩu | Chưa thử — tầng khám phá không trigger validation. Việc của `/generate-requirements-from-website` |
| Có khoá tài khoản sau N lần sai không | Chưa thử. ⚠️ Thử trên môi trường dùng chung có thể khoá tài khoản thật |
| Có Quên mật khẩu / Đổi mật khẩu / Đăng ký không | **Không thấy link nào** trên màn đăng nhập. Cần xác nhận với PO là không có, hay bị ẩn |
| Thời gian sống của phiên | Quan sát được là hết hạn nhưng **chưa đo chính xác** |
| Chuỗi `/dashboard/... → /404 → /login` khi chưa đăng nhập | Chưa tái hiện lại lần hai |
| Ràng buộc định dạng Email, độ dài Password | Chưa trigger |
| Hành vi bản tiếng Việt | Chưa khảo sát |

---

## Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/login_overview.png`](../evidence/login_overview.png) | Màn đăng nhập ở trạng thái đã submit form rỗng — thấy đủ 2 field, nút `Sign in`, footer, và **cả hai message validation**. Form đã được xoá trắng trước khi chụp để không đưa thông tin đăng nhập vào `docs/` |
