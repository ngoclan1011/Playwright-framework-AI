# Module 08 — Cấu hình hệ thống · `CFG`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-CFG-NN`.

| Mục | Giá trị |
|---|---|
| **Prefix** | `CFG` |
| **Nền tảng** | Web |
| **Risk** | 🟡 Trung bình — cấu hình ít thay đổi, nhưng `Category Weight` có nút `Force Update` tác động tới phân phối quảng cáo |
| **Ước REQ** | 30–40 |
| **Thứ tự khảo sát** | 9 |

**Vì sao gom 4 màn:** đều là màn cấu hình rời rạc, mỗi màn một mục đích khác nhau nhưng đều nhỏ. Tách ra sẽ đẻ 4 prefix cho 4 trang cấu hình.

---

## Màn hình — 4 màn, thuộc nhóm `Config`

| # | Màn hình | Route | Cột bảng | CRUD | Quy mô |
|---|---|---|---|---|---|
| 1 | Whitelist Users List | `/config/whitelist-users` | `ID` · `Route` · `User Email` · `Created` · `Updated` · `Status` · `Actions` | `Add Whitelist User` | 2 trang |
| 2 | Placement Templates | `/config/placement_templates` | `ID` · `Template Name` · `Description` · `Rules` · `Action` | `Create` | 13 dòng · 1 trang |
| 3 | List Email Recipients | `/config/email_config` | `ID` · `Name` · `Email` · `Group` · `Created At` · `Updated At` · `Status` · `Action` | `Create New Recipients` · `Email Groups` | 2 trang |
| 4 | Category Weight List | `/config/category-weight` | `Category Name` · `Sub Category Name` · `Count` · `Weight (%)` · `Request/Impression` · `Status` · `Action` | `Refresh Data` · `Force Update` | 8 dòng · có tab con |

---

## Ghi nhận theo từng màn

### 1. Whitelist Users — phân quyền theo route

Cột `Route` + `User Email` → cơ chế **cho phép một email cụ thể truy cập một route cụ thể**, nằm **ngoài** hệ thống Role/Permission thông thường.

> ⚠️ Đây là **tầng phân quyền thứ ba** của hệ thống, bên cạnh Role (module 02) và giới hạn phạm vi theo đối tác (module 03). Ba tầng chồng nhau → cần làm rõ thứ tự ưu tiên khi chúng mâu thuẫn. Nguồn sinh nhiều test case phân quyền.

Permission: `whitelist-users.view` · `whitelist-users.*`

### 2. Placement Templates — quy tắc chèn quảng cáo

Cột `Rules` → định nghĩa quy tắc, được module `PUB` dùng lại và hiển thị ở màn Placements dưới dạng `0 Pre, 1 Mid, 1 Post` / `Pre-roll: 0 | Mid-roll: 1 | Post-roll: 1`.

Nút: `Create` · `Search` · **`Reset`** (các màn khác dùng `Refresh` — màn này dùng `Reset`, lệch thuật ngữ).

API: `GET /api/placement-templates`

### 3. Email Config — hai tầng: người nhận và nhóm

- Màn chính là **List Email Recipients**
- Có nút `Email Groups` → mở màn/modal quản lý **nhóm người nhận** (chưa mở)
- Cột `Group` trên bảng nối hai tầng với nhau

API: `GET /api/email-group-recipients`
Permission: `emailconfigs.*` · `email_groups.*` · `email_group_recipients.*` → **ba** permission cho cụm này

> Hệ thống gửi email cho ai, khi nào — chưa rõ. Nghi liên quan tới cảnh báo/báo cáo định kỳ.

### 4. Category Weight — màn tác động tới phân phối

- **Có tab con:** `OTT` · `IPTV` → hai nền tảng phát khác nhau, trọng số cấu hình riêng
- Cột `Weight (%)` và `Request/Impression` → điều chỉnh **tỉ lệ phân phối quảng cáo theo danh mục nội dung**
- Nút `Refresh Data` · **`Force Update`**

> ⚠️ `Force Update` là **thao tác ghi có tác động hệ thống**. Tuyệt đối không bấm trong lúc khám phá. Ở tầng module cần hỏi PO nó làm gì trước khi test.

**Lỗi đã ghi nhận (PH-04):** mở màn này thì `GET /api/categories-weight/get/report/metric` trả **400** — chỉ mở trang, không thao tác gì.

API: `GET /api/categories-weight` · `GET /api/categories-weight/get/report/metric` (400)
Permission: `categoriesweight.*`

---

## Vùng chưa xác minh — module này

| Vùng | Vì sao chưa có |
|---|---|
| **`Force Update` làm gì** | Thao tác ghi có tác động phân phối — không bấm khi khám phá. **Phải hỏi PO trước khi test** |
| Lỗi 400 ở `categories-weight/…/metric` là bug hay chờ tham số | Chưa điều tra sâu |
| Thứ tự ưu tiên giữa 3 tầng phân quyền (Role · phạm vi đối tác · Whitelist) | Chưa xác minh — cần PO |
| `Route` trong Whitelist nhận giá trị gì (danh sách cố định hay tự do) | Chưa mở form `Add Whitelist User` |
| Cấu trúc `Rules` của Placement Template | Chưa mở form `Create` |
| Màn `Email Groups` có gì | Chưa bấm |
| Email được gửi khi nào, ai nhận | Chưa rõ nghiệp vụ |
| Khác nhau giữa tab `OTT` và `IPTV` | Chưa mở tab `IPTV` |
| Tổng `Weight (%)` có phải bằng 100 không | Chưa kiểm |

---

## Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/cfg_overview.png`](../evidence/cfg_overview.png) | Màn `Placement Templates` — cột `Rules`, nút `Create` / `Search` / `Reset`, và menu con của nhóm Config |
