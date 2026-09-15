# Module 04 — Nhà quảng cáo · `ADV` & Nhà xuất bản / Kho QC · `PUB`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã REQ.
> ⚠️ **Hai module, một file.** Gộp để đọc cho gọn — **prefix vẫn tách riêng**, và về sau sinh ra **hai** thư mục `docs/requirements/adv/` và `docs/requirements/pub/` với hai dải REQ độc lập.

| Mục | `ADV` | `PUB` |
|---|---|---|
| **Tên UI** | Nhà quảng cáo | Nhà xuất bản & Kho quảng cáo |
| **Nền tảng** | Web | Web |
| **Risk** | 🟡 Trung bình | 🟡 Trung bình |
| **Ước REQ** | 20–25 | 35–45 |
| **Thứ tự khảo sát** | 4 | 5 |

**Vì sao tách đôi menu `Advertiser`:** menu gom 5 màn nhưng đó là **hai phía của thị trường quảng cáo** — bên mua (`ADV`) và bên bán (`PUB`). Placement mang `Publisher Code` và gắn `Webapp`, tức thuộc hẳn phía bán.

---

## `ADV` — Nhà quảng cáo

### Màn hình

| Màn hình | Route | Loại | CRUD | Quy mô |
|---|---|---|---|---|
| Advertisers List | `/advertiser/advertisers` | Danh sách | `Add Advertiser` · sửa ở cột Actions | 9 trang |
| Brands List | `/advertiser/brands` | Danh sách | `Create brand` · sửa ở cột Actions | 14 trang |

### Cột bảng

| Màn | Cột |
|---|---|
| Advertisers | `ID` · `Advertiser Name` · `Sales in Charge` · `Notes` · `Status` · `Actions` |
| Brands | `ID` · `Brand Name` · `Created At` · `Updated At` · `Actions` |

### Ghi nhận

- `Advertiser` lưu chung bảng `accounts` với `Publisher`, phân biệt bằng `model=advertiser` — xác định qua `GET /api/accounts?model=advertiser&order=id|desc&limit=1000`
- `Brand` có endpoint riêng `GET /api/brands` → là entity độc lập, không phải thuộc tính của Advertiser
- `Brand` xuất hiện ở **TVC List** (module 06) dưới dạng thẻ kèm số media file → Brand là trục gom media
- Có cột `Status` → có bật/tắt hoạt động
- Permission: `advertisers.all/view/create/update` · `brands.*`

---

## `PUB` — Nhà xuất bản & Kho quảng cáo

### Màn hình

| Màn hình | Route | Loại | CRUD | Quy mô |
|---|---|---|---|---|
| Publishers List | `/advertiser/publishers` | Danh sách | `Add Publisher` · sửa ở cột Actions | 2 trang |
| Webapps List | `/advertiser/webapps` | Danh sách | `Create Webapp` · sửa ở cột Action | 13 trang |
| Placements List | `/advertiser/placements` | Danh sách + chọn nhiều | sửa ở cột Actions — **không có nút Create** | 12 trang |

### Cột bảng

| Màn | Cột |
|---|---|
| Publishers | `ID` · `Publisher Name` · `Sales` · `Notes` · `Status` · `Actions` |
| Webapps | `ID` · `Webapp Name` · `Publisher` · `Platform` · `Link` · `App Type` · `Status` · `Action` |
| Placements | ☑️ (chọn nhiều) · `ID` · `Name` · `Webapp` · `Ad view` · `Publisher Code` · `Placement Template` · `Status` · `Actions` |

### Ghi nhận

- **Placements không có nút tạo mới** trên màn danh sách, nhưng **có ô chọn nhiều (checkbox)** ở đầu mỗi dòng → nghi có **thao tác hàng loạt**. Chưa xác minh thao tác đó là gì
- Bộ lọc Placements phong phú nhất nhóm: `Name` · `Publisher Code` · `Platform` · `Ad format` · `Status` · `Web app`
- Cột `Placement Template` hiển thị dạng tổng hợp `0 Pre, 1 Mid, 1 Post` kèm dòng chi tiết `Pre-roll: 0 | Mid-roll: 1 | Post-roll: 1` → cấu hình vị trí chèn quảng cáo, liên kết sang module `CFG` (Placement Templates)
- Cột `Ad view` giá trị quan sát được: `video`
- Chuỗi phụ thuộc: `Publisher → Webapp → Placement`
- Permission: `publishers.*` · `webapps.*` · `placements.*`

### API liên quan

```
GET /api/accounts?model=publisher&activated=1&limit=500
GET /api/website-apps
GET /api/placements
GET /api/placement-templates
```

---

## Vùng chưa xác minh — cả hai module

| Vùng | Module | Vì sao chưa có |
|---|---|---|
| Vì sao Placement không tạo được từ UI | `PUB` | Có thể sinh tự động từ Webapp + Template, hoặc bị ẩn theo quyền. **Cần PO** |
| Ô chọn nhiều ở Placements dùng để làm gì | `PUB` | Chưa tick thử — tick xong có thể lộ thanh thao tác hàng loạt |
| Field của form `Add Advertiser` / `Add Publisher` / `Create Webapp` / `Create brand` | Cả hai | Modal chưa mount sẵn trong DOM như các form khác; chưa mở |
| `Sales in Charge` / `Sales` là danh sách người dùng hay text tự do | Cả hai | Chưa mở form |
| Quan hệ Brand ↔ Advertiser | `ADV` | Bảng Brands **không có** cột Advertiser → chưa rõ brand thuộc advertiser nào |
| Giá trị đầy đủ của `Platform` và `App Type` | `PUB` | Chưa mở dropdown đếm option |
| Tắt Status của Publisher thì Webapp/Placement con ra sao | `PUB` | Chưa thử — thao tác ghi |

---

## Evidence

| Ảnh | Module | Nội dung |
|---|---|---|
| [`../evidence/adv_overview.png`](../evidence/adv_overview.png) | `ADV` | Màn `Advertisers List` — cột, bộ lọc, nút `Add Advertiser` |
| [`../evidence/pub_overview.png`](../evidence/pub_overview.png) | `PUB` | Màn `Placements List` — thấy đủ 6 bộ lọc, ô chọn nhiều, cột `Placement Template` dạng `0 Pre, 1 Mid, 1 Post`, và menu con của nhóm Advertiser đang mở |
