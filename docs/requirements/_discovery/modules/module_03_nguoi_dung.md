# Module 03 — Người dùng · `USER`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-USER-NN`.

| Mục | Giá trị |
|---|---|
| **Prefix** | `USER` |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — tạo tài khoản và gán quyền truy cập; chứa dữ liệu cá nhân (email, giới tính) |
| **Ước REQ** | 20–25 |
| **Thứ tự khảo sát** | 3 — sau `ROLE` vì cần biết role trước mới gán được |

---

## Màn hình

| Màn hình | Route | Loại | CRUD | Quy mô |
|---|---|---|---|---|
| User List | `/system/users` | Danh sách + Modal | `Create` · sửa/xoá ở cột `Action` | **20 trang** × 10 dòng ≈ **200 người dùng** |

Thuộc nhóm menu `Management` (route cha `/system`).

---

## Quan sát được ở tầng khám phá

### Bảng danh sách — 12 cột

```
ID · Name · Email · Roles · Expired Time · Type · Advertisers · Publishers · Source Provider · Status · Created At · Action
```

Điểm đáng chú ý: một người dùng được gắn đồng thời **`Advertisers`**, **`Publishers`** và **`Source Provider`** → tài khoản bị **giới hạn phạm vi dữ liệu** theo đối tác, không chỉ theo role. Đây là **tầng phân quyền thứ hai** bên cạnh Role.

### Bộ lọc trên thanh công cụ

| Bộ lọc | Kiểu | Giá trị quan sát được |
|---|---|---|
| `Name` | Ô nhập | — |
| `Roles` | Dropdown | Nạp từ `GET /api/roles?limit=100` |
| `Publishers` | Dropdown | Nạp từ `GET /api/accounts?model=publisher&…limit=1000` |
| `Advertisers` | Dropdown | Nạp từ `GET /api/accounts?model=advertiser&…limit=1000` |
| `Status` | Dropdown | `All` · `Active` · `Inactive` |

Nút: `Search` · `Refresh` · `Create`.

### Form Create User (đọc từ modal đã mount sẵn trong DOM)

| Field | Kiểu | Giá trị |
|---|---|---|
| `Name` | Text | — |
| `Email` | Text | — |
| `Password` | Password | — |
| `Expired Time` | Ngày | Bảng danh sách cho thấy dạng `2027-10-06 00:00:00` |
| `Gender` | Chọn | `Male` · `Female` |
| `Type` | Chọn | `Internal` · `Guest` |
| `Status` | Chọn | `Active` |

Nút: `Cancel` · `OK`.

> ⚠️ Form Create **không có** field `Roles`, `Advertisers`, `Publishers`, `Source Provider` — nhưng bảng danh sách **có** các cột đó. Vậy việc gán role và phạm vi dữ liệu xảy ra ở **màn sửa**, không phải lúc tạo. Cần xác minh ở tầng module.

### API liên quan

```
GET /api/users?order=id|desc&limit=10&offset=1     ← danh sách, phân trang bằng offset
GET /api/roles?limit=100                            ← nạp dropdown Roles
GET /api/accounts?model=advertiser&…                ← nạp dropdown Advertisers
GET /api/accounts?model=publisher&…                 ← nạp dropdown Publishers
GET /api/source-providers?limit=1000                ← nạp dropdown Source Provider
```

Permission liên quan: `users.all` · `users.view` · `users.log`.
→ Có `users.log` nghĩa là **người dùng cũng có nhật ký thay đổi** như Campaign (xem module 05).

---

## Vùng chưa xác minh — module này

| Vùng | Vì sao chưa có |
|---|---|
| Gán `Roles` / `Advertisers` / `Publishers` / `Source Provider` ở đâu | Không có trong form Create; chưa mở màn sửa |
| Ràng buộc mật khẩu (độ dài, ký tự) | Chưa trigger validation |
| Email trùng thì sao | Chưa thử |
| `Expired Time` để trống được không, quá khứ được không | Chưa thử |
| Khác nhau giữa `Type: Internal` và `Type: Guest` | Chưa rõ nghiệp vụ — cần PO |
| Người dùng hết hạn thì bị chặn đăng nhập hay chỉ đánh dấu | Chưa thử |
| Nhật ký người dùng (`users.log`) hiển thị ở đâu | Chưa tìm thấy nút trên màn danh sách |
| Xoá người dùng — xoá mềm hay xoá cứng | Chưa thử, đang áp quy tắc chỉ đọc |

---

## Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/user_overview.png`](../evidence/user_overview.png) | Màn `User List` — thấy đủ 12 cột, 5 bộ lọc và thanh công cụ. ⚠️ Ảnh chứa email người dùng thật trên staging |
