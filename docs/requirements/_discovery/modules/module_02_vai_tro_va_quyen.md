# Module 02 — Vai trò & Quyền · `ROLE`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-ROLE-NN`.

| Mục | Giá trị |
|---|---|
| **Prefix** | `ROLE` |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — định nghĩa quyền cho toàn hệ thống; sai ở đây là lộ dữ liệu hoặc chặn nhầm người dùng |
| **Ước REQ** | 20–25 |
| **Thứ tự khảo sát** | 2 |

---

## Màn hình

| Màn hình | Route | Loại | CRUD | Số bản ghi quan sát được |
|---|---|---|---|---|
| Role List | `/system/roles` | Danh sách + Modal | `Create` · sửa/xoá ở cột Action | **34 role**, không phân trang |
| Permission List | `/system/permissions` | Danh sách + Modal | `Create` · sửa/xoá ở cột Action | **248 dòng** |

Cả hai nằm trong nhóm menu `Management` (route cha `/system`).

---

## Quan sát được ở tầng khám phá

### Role List — `/system/roles`

| Cột | Ghi chú |
|---|---|
| `ID` · `Role Name` · `Permissions` · `Action` | Cột `Permissions` hiển thị danh sách quyền dạng chuỗi, dài thì cắt bớt kèm `+N` |

Thanh công cụ: `Create` · `Search` · `Refresh` (1 ô tìm kiếm).

### Permission List — `/system/permissions`

| Cột | Ghi chú |
|---|---|
| `Module Name` · `Function Name` · `Action` | Mỗi dòng là một cặp module–hành động |

Phân trang qua API `GET /api/permissions?page=1&limit=10`, nhưng màn hình cũng gọi `?limit=1000` để nạp toàn bộ.

### Mô hình phân quyền đọc được

Quyền có dạng `<module>.<hành động>`. Các hành động quan sát được:

```
.all      .view     .create    .update
.log                                     ← riêng users.log
.report   .flights.view   .flights.realtime_r…   ← riêng campaigns
.special  .limited                       ← riêng fshop / guest
```

**Danh sách Module Name hợp lệ đọc được** (đã loại bỏ dòng rác — xem PH-02):

```
Ad-Valify · Adsgroup · Advertisers · Audit · Avod · Brands
Campaigns · Campaigns.Report · Campaigns.Creatives · Campaigns.Flights
Categories · Categoriesweight · Cms · Creativetypes · Dashboard
Email_group_recipients · Email_groups · Emailconfigs · Fshop · Guest
Inventory_report · Livechannels · Livetv_channel · Livetv_event
Livetvchannels · Livetvevents · Mediafile · Mediafiles · Medias
Pageskeys · Permission · Permissions · Placement_templates · Placements
Places · Places.Wifi_mac_address · Places.Access_points · Places.Zones
Provinces · Publishers · Roles · Segments · Sourceproviders · Tvcs
User · Users · Usersegment · Webapps · Whitelist-Users · Wifi_report · Workbench
```

> ⚠️ Danh sách này có **cặp trùng nghĩa**: `User`/`Users` · `Permission`/`Permissions` · `Mediafile`/`Mediafiles` · `Livetv_channel`/`Livetvchannels` · `Livetv_event`/`Livetvevents`. Cần PO xác nhận cái nào còn hiệu lực.

### Form Create (đọc từ modal đã mount sẵn trong DOM)

| Form | Field |
|---|---|
| **Create Role** | `Role Name` → nút `Cancel` · `Create Role` |
| **Create New Permission** | `Module Name` · `Function Name` (dropdown `Choose function`) → `Cancel` · `Create` |

> Form Create Role **chỉ có 1 field** `Role Name` — vậy việc gán quyền vào role diễn ra ở bước khác (màn sửa?). Chưa xác minh.

### Phát hiện riêng của module

| # | Mức | Nội dung |
|---|---|---|
| PH-01 | 🔴 | **Payload tấn công lưu trong Role Name**: `view onlyz> BCC:<32 ký tự>@oastify.com ymp: f`. Xem chi tiết ở mục 7 của [`../system_map.md`](../system_map.md) |
| PH-02 | 🟠 | **Dữ liệu rác**: hơn nửa trong 34 role và nhiều dòng permission là rác do test để lại |
| PH-03 | 🟠 | **Role `admin` hiển thị `No permissions`** nhưng tài khoản admin vẫn toàn quyền → nghi bypass ở server. Các role khác cũng `No permissions`: `csoc-nopermission` · `test 183 update` · `TH true milk` |

### Role có vẻ là cấu hình thật (dùng để xin account role thấp)

| Role | Quyền (trích) | Ghi chú |
|---|---|---|
| `Operator` | `advertisers.all` `publishers.all` `categories.all` `placements.all` | Vận hành |
| `sale` | `publishers.all` `categories.all` `campaigns.all` `campaigns.flight…` | Kinh doanh |
| `account` / `account_managerS` | `advertisers.all` + `publishers.view` … | Quản lý khách hàng |
| `Report Guest` | `campaigns.view` `campaigns.report` `campaigns.flights.realtime_r…` | 👉 **Ứng viên tốt nhất** để kiểm chứng role chỉ-đọc |
| `Guest_CMS` | toàn bộ ở mức `view` | 👉 Ứng viên thứ hai |
| `Report AVOD` | `avod.view` | Role phạm vi rất hẹp |
| `ISC - Wifi` | `inventory_report.all` `places.v…` | Dùng quyền của cụm Places/Wifi không có UI (PH-05) |

---

## Vùng chưa xác minh — module này

| Vùng | Vì sao chưa có |
|---|---|
| Gán quyền vào role diễn ra ở đâu | Form Create chỉ có `Role Name`; chưa mở màn sửa role |
| Xoá role đang có người dùng gán vào thì sao | Chưa thử — thao tác phá huỷ, đang áp quy tắc chỉ đọc |
| `Role Name` có chặn ký tự đặc biệt không | **Rõ ràng là không** — PH-01 chứng minh chuỗi có `>` `:` `@` được lưu. Cần xác minh chính thức ở tầng module |
| Ràng buộc trùng tên role | Chưa thử |
| Ý nghĩa thật của `.all` so với `.view/.create/.update` | `.all` là tổng hợp hay là quyền riêng? Cần PO |
| Vì sao `Function Name` là dropdown cố định | Chưa mở dropdown để đếm option |

---

## Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/role_overview.png`](../evidence/role_overview.png) | Màn `Role List` — thấy cột ID · Role Name · Permissions · Action, thanh công cụ và dữ liệu thật (gồm cả các role rác) |
