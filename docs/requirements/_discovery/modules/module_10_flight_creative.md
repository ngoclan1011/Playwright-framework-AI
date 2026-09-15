# Module 10 — Flight · `FLIGHT`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-FLIGHT-NN`.
> 🆕 Tách khỏi `CAMP` ngày 2026-09-15 đợt 2. Campaign ở [`module_05_chien_dich.md`](module_05_chien_dich.md) · Creative ở [`module_11_creative.md`](module_11_creative.md).
>
> ⚠️ **Tên file giữ nguyên `module_10_flight_creative.md`** dù nội dung Creative đã chuyển đi — theo quy tắc *không đổi tên file module đã có* để link cũ không gãy.

| Mục | Giá trị |
|---|---|
| **Prefix** | `FLIGHT` |
| **Phạm vi** | **Chỉ tầng Flight** — kế hoạch phân phối: booking, lịch, 17 chiều nhắm mục tiêu |
| **Ngoài phạm vi** | Campaign → `CAMP` · Creative → `CRTV` |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — liên quan tiền (`Price (VND)`, booking impression), 17 chiều nhắm mục tiêu, quyết định quảng cáo hiển thị ở đâu và trên thiết bị nào |
| **Ước REQ** | **40–50** |
| **Thứ tự khảo sát** | 6b — ngay sau `CAMP`, vì flight không tồn tại độc lập khỏi campaign |
| **Dữ liệu tham chiếu** | Campaign **1188** — **21 flight** phủ mọi định dạng quảng cáo và nền tảng |

### Vì sao tách khỏi `CAMP`

Flight là con của Campaign nhưng có **vòng đời, màn hình biên tập và bộ quy tắc riêng đủ lớn**: 29 field, 17 chiều nhắm mục tiêu, quy tắc booking, và là nơi quyết định quảng cáo chạy ở đâu. Tách để mỗi module có dải REQ gọn và chia việc được.

---

## 1. Vị trí trên UI

Không có route riêng — nằm trong màn `/campaigns/{id}` (*"Flight Management"*).

| Thành phần | Đường đi |
|---|---|
| Danh sách flight | `/campaigns/{id}` → khối `Flight Management` · có `Filter by status` |
| Tạo flight | nút `New Flight` |
| Chi tiết flight | chọn flight trong danh sách → khối thuộc tính + nút `View more` |

Campaign 1188 có **21 flight**, trạng thái `Activated` / `Inactive`.

---

## 2. Cấu trúc dữ liệu — flight thật

```
Flight #118821 "Web - Inpage - Top"   (Activated)
├─ Publisher: FPT Play
├─ Web app: 2 webapp   (Top Banner Web - 114 · Top Banner Web Detail - 118)
├─ Date range: 2 khoảng (2026-04-01→04-30 · 2026-05-04→2029-05-31)
├─ Booking type: impression · Daily: 0 · Total: 416,710,000
├─ Ad frequency: 100 Impression(s) / 1,440 Minutes
└─ 4 Creative   → module CRTV
```

⚠️ **Một flight nhận nhiều Web app và nhiều khoảng ngày** — khớp với nút `+` trong nhóm `BASIC INFO`.
⚠️ `Daily booking: 0` trong khi `Total booking` rất lớn → nghi `0` nghĩa là **không giới hạn theo ngày**. Cần PO xác nhận.

---

## 3. Form Create Flight — 29 field, 4 nhóm 👈 form lớn nhất hệ thống

| Nhóm | Field |
|---|---|
| **BASIC INFO** | `Flight Name`✅ · `Date Range`✅ (start→end, có nút `+` thêm khoảng) · `Activated` (switch) · `Publishers`✅ · `Web Apps`✅ |
| **DELIVERY & PRICING** | `Source Type` (mặc định `Internal`) · `Weight`✅ · `Ad Frequency`✅ + `Minutes` (mặc định `0`) · `Booking Type`✅ · `Daily Booking`✅ · `Total Booking`✅ · `Price (VND)` |
| **TARGETING** | `Hours` · `Days of Week` · `Pages` · `Source Providers` · `Categories` · `Contents` · `Profile Type` · `Profile Maturity` · `User IDs` · `ISPs` · `User Groups` · `User Segments` |
| **ADVANCED** | `Device Types` · `Brands` · `Devices` · `Location` · `Retarget` |

`Booking Type` (radio): **`Impression` · `Click` · `Complete View`**
`Ad Frequency` + `Minutes` là một cặp — màn chi tiết hiển thị `100 Impression(s) / 1,440 Minutes`.

> **17 chiều nhắm mục tiêu** (12 ở `TARGETING` + 5 ở `ADVANCED`) → ứng viên số một cho `/generate-cross-module-test-plan`.

### Enum thật lấy từ 21 flight của campaign 1188

| Trường | Giá trị quan sát được |
|---|---|
| `flight_type` | `vod` (21/21) |
| `buy_type` | `cpm` (21/21) — **không có trên form UI** |
| `booking_type` | `impression` (21/21) |
| `source_type` | rỗng (20) · `ortb` (1) — UI hiển thị `Internal` cho giá trị rỗng |
| `profile_type` | `normal` (15) · rỗng (6) |
| `device_types` | rỗng (20) · `["SMART-TV"]` (1) |
| `weight` | `10` (16) · `9` (1) · `1` (4) |
| `price` | `0` (18) · `200000` (1) · `700000` (2) |

### ⚠️ Backend có nhiều chiều nhắm mục tiêu hơn UI

Schema flight trả về **48 trường**, form UI chỉ có 29. Có trong dữ liệu mà **không thấy trên form**:

```
countries · mobile_carriers · zones · placeszones · regions · scenes · positions
buy_type · ad_type · flight_type · total_days · actual_days · ads_groups
```

Cần PO xác nhận: chưa làm UI, đã gỡ, hay chỉ hiện với điều kiện khác.

### Enum thiết bị — `GET /api/config?key=device_types`

| Device Type | Brand |
|---|---|
| `SMART-TV` | SAMSUNG · SONY |
| `SMARTPHONE-TABLET` | SAMSUNG · APPLE · OPPO |
| `PC` | PC · APPLE |
| `BOX` | FPTPlay |

> Tập thiết bị quảng cáo có thể nhắm tới — đầu vào cho `Device Types` và `Brands` ở nhóm `ADVANCED`. Đây là mắt xích trả lời câu *"quảng cáo hiển thị được trên thiết bị nào"*.

---

## 4. Taxonomy định dạng quảng cáo — rút từ 21 flight của campaign 1188

| Nền tảng | Định dạng quan sát được |
|---|---|
| Web | Inpage Top · Inpage Masthead · Pause Ads · Homescreen |
| Mobile | Homescreen · Inpage · Adhesion |
| IPTV | Inpage |
| Box OTT | Inpage · Smart Android Homescreen |
| Smart HTML | Homescreen |
| All Platforms | Logo · Instream VOD · Outstream VOD · Outstream LiveTV · Instream-Outstream-ORTB |
| Khác | Flight gắn programatic · test SSAI Ateme |

> **Bản đồ định dạng quảng cáo thực tế** của hệ thống — khung phủ khi thiết kế test case. Campaign 1188 là bộ dữ liệu tham chiếu tốt nhất hiện có.

---

## 5. API của module

```
GET /api/flights?running=1  ·  /api/flights?ids=<danh sách>
GET /api/campaigns/{id}?includes=account,flights,creatives
GET /api/ads-groups?limit=1000&status=1
GET /api/config?key=device_types
GET /api/report/flights/realtime?ids=<danh sách>
```

Nguồn dữ liệu cho dropdown của form Create Flight:
```
/api/accounts?model=publisher · /api/website-apps · /api/categories · /api/provinces
/api/user-segment?synced=1    · /api/placements   · /api/pages-key?activated=1
/api/source-providers?activated=1
```

Permission: `campaigns.flights.view` · `campaigns.flights.realtime_r…`

---

## 6. Vùng chưa xác minh — module này

| Vùng | Ghi chú |
|---|---|
| **Ràng buộc ngày**: flight có bắt buộc nằm trong khoảng ngày campaign không | Cần submit form hợp lệ |
| **Ràng buộc booking**: `Daily × số ngày` có phải bằng `Total` không · `Daily = 0` nghĩa là gì | Cần submit + PO |
| Nút `+` ở `BASIC INFO` thêm được tối đa bao nhiêu khoảng ngày | Chưa bấm — flight 118821 đã có 2 khoảng, xác nhận tính năng có thật |
| Giá trị đầy đủ của 17 dropdown nhắm mục tiêu | Chưa mở từng cái |
| `View more` trong khối flight còn thuộc tính gì | Chưa bấm |
| Ý nghĩa `Weight` khi nhiều flight cùng chạy | Giá trị quan sát được: 1 · 9 · 10 |
| Tắt `Activated` của flight thì creative con ra sao | ⚠️ Thao tác ghi |
| Validation message của form Create Flight | Chưa submit |

---

## 7. Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/camp_create_flight_form.png`](../evidence/camp_create_flight_form.png) | `Create Flight` — 3 nhóm `BASIC INFO` / `DELIVERY & PRICING` / `TARGETING`, radio `Booking Type`, nút `+` thêm khoảng ngày |

> Tên file ảnh giữ tiền tố `camp_` vì chụp trước khi tách module — **không đổi tên** để link cũ không gãy.
