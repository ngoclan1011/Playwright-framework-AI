# Module 07 — Nhắm mục tiêu · `TGT`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-TGT-NN`.

| Mục | Giá trị |
|---|---|
| **Prefix** | `TGT` |
| **Nền tảng** | Web |
| **Risk** | 🟡 Trung bình — phần lớn là danh mục tra cứu, nhưng `Live TV` có độ phức tạp cao (lịch phát, đẩy dữ liệu) |
| **Ước REQ** | 45–60 |
| **Thứ tự khảo sát** | 8 |

**Vì sao gom 7 màn thành 1 module:** đều là **tham số nhắm mục tiêu** mà Flight (module `CAMP`) tham chiếu tới. Tách riêng sẽ đẻ ra 7 prefix cho 7 danh mục.

---

## Màn hình — 7 màn, thuộc nhóm `Target` (route cha `/targeting`)

| # | Màn hình | Route | Cột bảng | CRUD | Quy mô |
|---|---|---|---|---|---|
| 1 | Categories List | `/targeting/categories` | `ID` · `Category Name` · `Account` · `Publisher Code` · `Status` · `Actions` | **không có** nút tạo | 32 dòng, không phân trang |
| 2 | Source Providers List | `/targeting/source-providers` | `ID` · `Name` · `Account` · `Model` · `Publisher Code` · `Status` · `Actions` | `Create source provider` | **30 trang** — lớn nhất nhóm |
| 3 | User Segments List | `/targeting/user-segments` | `ID` · `Label` · `Key` · `Created Date` · `Updated Date` · `Status` · `Action` | **không có** nút tạo | 9 trang |
| 4 | Provinces List | `/targeting/provinces` | `ID` · `Province/City Name` · `Region` · `Status` · `Action` | **không có** nút tạo | 4 dòng hiển thị, không phân trang |
| 5 | Live TV Management | `/targeting/live-tv` | `ID` · `Creative` · `URL` · `Channel` · `Event` · `Time Range` · `Push History` · `Status` · `Actions` | `Create live TV` | 4 trang |
| 6 | Live Channel Management | `/targeting/live_channel` | `ID` · `Channel Name` · `Event` · `Time` · `Status` | `Update` (không phải Create) | **92 trang** — nhiều bản ghi nhất hệ thống |
| 7 | Pages Key Management | `/targeting/pages_key` | `ID` · `Label` · `Key` · `Status` | `Create Pages Key` | 3 trang |

---

## Ghi nhận theo từng màn

### Categories · Source Providers — có `Account` và `Publisher Code`

Hai màn này có cột `Account` và `Publisher Code` → danh mục **gắn theo từng đối tác**, không phải danh mục dùng chung toàn hệ thống. Đây là điểm nối sang module `PUB`.

`Source Providers` còn có cột `Model` — cùng tên với tham số `model` của `/api/accounts`. Cần xác minh có phải cùng ý nghĩa không.

### User Segments · Pages Key — cặp `Label` / `Key`

Cả hai dùng mô hình `Label` (hiển thị cho người dùng) + `Key` (mã kỹ thuật hệ thống dùng). Cấu trúc giống nhau → nhiều khả năng dùng chung một kiểu validation cho `Key`.

### Provinces — chỉ 4 dòng

Bảng tỉnh/thành chỉ hiển thị **4 dòng** trong khi Việt Nam có nhiều hơn thế. Có cột `Region`.
→ ⚠️ Cần xác minh: dữ liệu staging thiếu, hay có bộ lọc mặc định, hay hệ thống chỉ dùng 4 vùng?

### Live TV — màn phức tạp nhất nhóm

- Cột `Push History` → có **lịch sử đẩy dữ liệu**, tức có tích hợp ra hệ thống phát sóng
- `Time Range` hiển thị 2 dòng `From:` / `To:` với dấu thời gian đầy đủ
- Dữ liệu quan sát được có `Channel` = `Sóc Trăng`, `Premier League 1`, `Serie A 1` và `Event` = `Arsenal - West Ham United`, `Liverpool - Brighton & Hove Albion`
- ⚠️ Dữ liệu mang mốc thời gian **2018** (`2018-08-24`) → dữ liệu cũ tồn đọng trên staging
- Có 22 ô nhập trên màn → bộ lọc phong phú

### Live Channel — nút `Update` thay vì `Create`

Màn duy nhất trong hệ thống có nút **`Update`** ở thanh công cụ. 92 trang dữ liệu.
→ Suy đoán: **đồng bộ danh sách kênh từ hệ thống ngoài** thay vì nhập tay. Chưa xác minh.

---

## API liên quan

```
GET /api/categories
GET /api/source-providers?limit=1000
GET /api/user-segment
GET /api/provinces
GET /api/livetvevents
GET /api/livechannels
GET /api/pages-key
```

Permission: `categories.*` · `sourceproviders.*` · `usersegment.*` · `segments.*` · `provinces.*` · `livetvevents.*` · `livechannels.*` · `livetv_event.*` · `livetv_channel.*` · `livetvchannels.*` · `pageskeys.*`

> ⚠️ Bảng permission có **5 biến thể tên** cho Live TV/Channel: `Livetvevents` · `Livetv_event` · `Livechannels` · `Livetvchannels` · `Livetv_channel`. Cần PO xác nhận cái nào còn hiệu lực — ảnh hưởng tới test phân quyền.

---

## Vùng chưa xác minh — module này

| Vùng | Vì sao chưa có |
|---|---|
| **3 màn không có nút tạo** (Categories · User Segments · Provinces) | Dữ liệu đồng bộ tự động, hay bị ẩn theo quyền? **Cần PO** |
| Nút `Update` ở Live Channel làm gì | Chưa bấm — nghi là đồng bộ từ hệ thống ngoài, có thể là thao tác ghi |
| Vì sao Provinces chỉ có 4 dòng | Chưa xác minh |
| `Push History` của Live TV chứa gì | Chưa mở |
| Form `Create live TV` · `Create source provider` · `Create Pages Key` có field gì | Chưa mở |
| Ràng buộc định dạng của `Key` (User Segments, Pages Key) | Chưa trigger |
| Quan hệ giữa các danh mục này với Flight | Biết là Flight nhắm vào, nhưng **chưa thấy màn cấu hình nhắm mục tiêu** — nằm trong form New Flight chưa mở (module 05) |
| `Model` ở Source Providers có giá trị nào | Chưa mở dropdown |

---

## Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/tgt_overview.png`](../evidence/tgt_overview.png) | Màn `Live TV Management` — 9 cột gồm `Push History`, `Time Range` dạng From/To, và menu con của nhóm Target đang mở đủ 7 mục |
