# Khám phá module: Đăng nhập / Xác thực (`LOGIN`)

> Tầng khám phá — **KHÔNG chứa mã REQ**. Về index: [system_map.md](../system_map.md)

| Mục | Giá trị |
|---|---|
| Tên trên UI | Login |
| Bí danh | Đăng nhập, Xác thực |
| Prefix | `LOGIN` |
| Route | `/admin/authentication` · `/admin/authentication/forgot_password` · `/admin/authentication/logout` |
| Loại màn hình | Form |
| CRUD | Không áp dụng |
| Status flow | Không có |
| Số tab | 0 |
| Ước độ lớn | 2 form · 5 field · ~12–18 REQ |
| Risk | 🔴 Cao — cổng vào toàn hệ thống, mọi module khác phụ thuộc; sai là chặn toàn bộ đợt test |

## Màn hình quan sát được

| Màn hình | Route | Thành phần |
|---|---|---|
| Đăng nhập | `/admin/authentication` | Email Address · Password · checkbox **Remember me** · nút **Login** · link **Forgot Password?** · logo dẫn về `https://crm.anhtester.com/` |
| Quên mật khẩu | `/admin/authentication/forgot_password` | ❔ Chưa mở — chỉ ghi nhận link tồn tại |
| Đăng xuất | `/admin/authentication/logout` | Có link Logout trong dropdown hồ sơ |

## Phát hiện khác

- Trang login **không** có nút đăng nhập mạng xã hội, **không** có CAPTCHA hiển thị ở trạng thái mặc định.
- Sau khi đăng nhập thành công → chuyển thẳng `/admin/` (Dashboard).
- Tên hiển thị của tài khoản test: **Admin Example** (`/admin/profile/2`).

## Vùng chưa xác minh

> ✅ **Đã recon chi tiết ngày 2026-08-14** → [../../login/requirements_login.md](../../login/requirements_login.md) (35 REQ). Phần dưới đây giữ nguyên trạng lúc khám phá; những gì đã được giải quyết ghi ở cột ghi chú.

| Vùng | Trạng thái sau recon |
|---|---|
| Nội dung form Quên mật khẩu | ✅ Đã xác minh — `REQ-LOGIN-23` → `28` |
| Luồng email đặt lại mật khẩu | ❌ **Vẫn chưa xác minh** — không gửi mail cho tài khoản thật trên môi trường dùng chung (`AMB-04`, `REQ-LOGIN-27` ⚪) |
| Cơ chế khoá tài khoản sau N lần sai | ❌ **Vẫn chưa xác minh** — cố ý không thử (`AMB-02`, `RISK-03`) |
| Thông báo lỗi nguyên văn | ✅ Đã thu đủ — xem mục 5 của tài liệu module |
| Vai trò thật của `admin@example.com` | ❌ **Vẫn chưa xác minh** — màn hình Roles 403 (`AMB-01`) |

## Evidence

| Tệp | Màn hình | Trạng thái |
|---|---|---|
| [login_overview_fullpage.png](../evidence/login_overview_fullpage.png) | Đăng nhập | Mặc định |
