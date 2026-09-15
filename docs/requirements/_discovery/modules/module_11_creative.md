# Module 11 — Creative · `CRTV`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-CRTV-NN`.
> 🆕 Tách khỏi `CAMP`/`FLIGHT` ngày 2026-09-15 đợt 2. Campaign ở [`module_05_chien_dich.md`](module_05_chien_dich.md) · Flight ở [`module_10_flight_creative.md`](module_10_flight_creative.md).

| Mục | Giá trị |
|---|---|
| **Prefix** | `CRTV` |
| **Phạm vi** | **Creative** — nội dung quảng cáo thực sự hiển thị cho người xem |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — form động 3 tầng, 3 lệch pha UI ↔ dữ liệu, là **cầu nối sang module `MOD`** (kiểm duyệt) và sang `DASH` (đo lường) |
| **Ước REQ** | **35–45** |
| **Thứ tự khảo sát** | 6c — sau `FLIGHT`, vì creative là con của flight |
| **Dữ liệu tham chiếu** | Campaign **1188** — **103 creative** phủ mọi tổ hợp loại |

### Vì sao tách riêng

Creative là con của Flight, nhưng:
- **Form động 3 tầng** (7 → 8 → 11 field), field phụ thuộc `Display Type`
- **3 lệch pha UI ↔ dữ liệu** đã phát hiện, mỗi cái là một vùng test riêng
- **Hai mắt xích cắt ngang module**: `MOD` (chọn media đã kiểm duyệt) và `DASH` (7 sự kiện tracking ↔ 7 KPI)
- Schema có **35 trường**, form UI chỉ hiện tối đa 11

---

## 1. Vị trí trên UI

Không có route riêng — nằm **bên trong khối flight** ở màn `/campaigns/{id}`.

| Thành phần | Đường đi |
|---|---|
| Danh sách creative | `/campaigns/{id}` → chọn flight → khối `Creatives` (`4 Total`) |
| Tạo creative | nút `New creative` **bên trong khối flight** |
| Chọn media | `Select from medias` → modal `Select Media` — nối sang `MOD` |

Cột bảng: `ID` · `Name` · `Activated` · `Actions`.

---

## 2. Form Create Creative — form động

```
7 field gốc
   Name · Creative Type · File Type · Source · Third Trackings · Landing Page · Status
      ↓ chọn Creative Type
+ Display Type                                                      → 8 field
      ↓ chọn Display Type = Video In-stream
+ Duration · Start Time · Skip Time                                 → 11 field
```

⚠️ Field phụ do **`Display Type`** quyết định, **không phải** `Creative Type` — đã kiểm chứng: chọn `HTML` và `Image Custom` đều dừng ở 8 field.

| Field | Kiểu | Bắt buộc |
|---|---|---|
| `Name` | text | ✅ |
| `Creative Type` | select | ✅ |
| `Display Type` | select | ✅ |
| `Duration` | number | *(chỉ khi Video In-stream)* |
| `Start Time` | select | *(chỉ khi Video In-stream)* |
| `Skip Time` | select | *(chỉ khi Video In-stream)* |
| `File Type` | select | ✅ |
| `Source` | text / nút chọn media | ✅ |
| `Third Trackings` | select nhiều giá trị | ❌ |
| `Landing Page` | text | ❌ |
| `Status` | switch | ❌ |

---

## 3. Enum

| Field | Giá trị trên UI | Giá trị trong dữ liệu (103 creative) |
|---|---|---|
| `Creative Type` | `Image Custom` · `Video` · `HTML` | `html` (74) · `video` (27) · `image_custom` (2) |
| `Display Type` | `Video In-stream` · `Video Live TV` · `Ad In Content` | `in_page` (76) · `video_instream` (27) |
| `File Type` | `Local file` · `External file` | `local_file` (89) · `external_file` (13) · **`ortb` (1)** |
| `Start Time` | `Pre roll` *(chỉ 1 option trong flight 118821)* | `0` (103/103) |
| `Skip Time` | `5 seconds` *(chỉ 1 option trong flight 118821)* | `0` (66) · `5` (34) · `1` (2) · `10` (1) |
| `Third Trackings` | `Impression` · `Click` · `Start played` · `Played 25` · `Played 50` · `Played 75` · `Completed view` | — |
| `ad_view` | *(không có trên form)* | `video` (103/103) |
| `duration` | — | `0` (75) · `15` (10) · `6` (8) · `5` (5) · `30` (3) · `20` (1) |

### Ma trận tổ hợp thật — 103 creative

| `display_type` | `file_type` | `creative_type` | Số lượng |
|---|---|---|---|
| `in_page` | `local_file` | `html` | 72 |
| `video_instream` | `local_file` | `video` | 15 |
| `video_instream` | `external_file` | `video` | 11 |
| `in_page` | `local_file` | `image_custom` | 2 |
| `in_page` | `external_file` | `html` | 2 |
| `video_instream` | **`ortb`** | `video` | 1 |

> Bảng này là **khung phủ sẵn có** cho test case — 6 tổ hợp thật, không phải suy diễn.

---

## 4. 🔴 Ba lệch pha UI ↔ dữ liệu — đều cần PO xác nhận

| # | Lệch pha | Chi tiết |
|---|---|---|
| 1 | **`file_type = ortb` có trong dữ liệu nhưng KHÔNG có trong dropdown UI** | Khớp với flight `All Platforms - Instream-Outstream-ORTB` và `source_type = ortb` → có **nguồn creative thứ ba (OpenRTB / programmatic)** không tạo được từ form này |
| 2 | **`Display Type = Ad In Content` có trên UI nhưng dữ liệu chỉ có `in_page` và `video_instream`** | Chưa rõ map sang giá trị nào |
| 3 | **`Start Time` và `Skip Time` chỉ có 1 option** trong flight 118821, dù dữ liệu tổng có 4 giá trị `skip_time` | → option **bị ràng buộc theo flight/placement**, không phải danh sách cố định. Quan hệ này phải làm rõ ở tầng module |

---

## 5. Mắt xích cắt ngang module

### 🔗 Sang `MOD` — nguồn nội dung

| `File Type` | `Source` biến thành | Nối tới |
|---|---|---|
| `Local file` | nút **`Select from medias`** → modal `Select Media` (lưới 64 video, lọc theo Creative Type, 7 trang) | **module `MOD`** |
| `External file` | ô nhập URL (`Enter URL`) | Nguồn ngoài |
| `ortb` | ❔ không tạo được từ UI | — |

> ⚠️ **Câu hỏi quan trọng nhất nối 2 module:** modal `Select Media` **có lọc bỏ media chưa qua kiểm duyệt không**, hay chọn được cả media `Moderation = Failed`? Chưa đối chiếu.

### 🔗 Sang `DASH` — đo lường

7 sự kiện `Third Trackings` khớp **chính xác** 7 chỉ số KPI ở màn `Report Campaign`:

| Third Tracking | KPI ở Report Campaign |
|---|---|
| `Impression` | `Total Impression` |
| `Click` | `Total Click` (+ `CTR`) |
| `Start played` | — |
| `Played 25` | `Total Played 25` (+ `View rate`) |
| `Played 50` | `Total Played 50` |
| `Played 75` | `Total Played 75` |
| `Completed view` | `Total Complete View` |

Chuỗi đo lường khép kín từ creative tới báo cáo.

---

## 6. Validation message đã bắt được

Submit form thiếu dữ liệu, ngôn ngữ `en_US`:

| Field | Message nguyên văn |
|---|---|
| `Name` | `Name is required` |
| `Display Type` | `Display type is required` |
| `File Type` | `File type is required` |
| `Source` | `Source is required` |

> Nhãn field Title Case (`Display Type`) nhưng message sentence case (`Display type`) — lệch nhỏ, tầng module quyết định có mở `AMB` không.
> Form chặn ở client, **không bản ghi nào được tạo**.

---

## 7. Schema creative — 35 trường

```
id · name · description · flight_id · campaign_id · ad_view · file_type · source
landing_page · skip_time · duration · start_time · show_time · activated
third_trackings · display_type · creative_type · flight_order · extensions
skip_button_at · skip_button_text · is_custom_button
btn_custom_primary · btn_custom_secondary · btn_redirect_primary · btn_redirect_secondary
extend_source · width · height · bitrate · type
created_by · updated_by · created_at · updated_at
```

### Trường có trong dữ liệu mà form UI không có

| Nhóm | Trường | Giá trị quan sát được |
|---|---|---|
| Nút tuỳ biến | `is_custom_button` · `btn_custom_primary/secondary` · `btn_redirect_primary/secondary` · `skip_button_at` · `skip_button_text` | `is_custom_button = 1` ở **8/103** creative |
| Kích thước / chất lượng | `width` · `height` · `bitrate` | `3840×2160` (5) · `1920×1080` (2) · `1280×720` (1) · `800×500` (1) |
| Nguồn mở rộng | `extend_source` | File **`.json` cấu hình** cho creative HTML — ví dụ `…/static/banner/2026/01/12_….json` |
| Khác | `ad_view` · `flight_order` · `extensions` · `show_time` | `ad_view = video` (103/103) |
| MIME | `type` | `video/mp4` (12) · `image/jpg` (1) · rỗng (90) |

⚠️ Nhóm **nút tuỳ biến** là một tính năng hoàn chỉnh (8 creative đang dùng) mà **không có lối vào trên form Create** — cần PO xác nhận cấu hình ở đâu.

---

## 8. API của module

```
GET /api/creatives
GET /api/campaigns/{id}?includes=account,flights,creatives   ← lấy creative theo campaign
```

Permission: `campaigns.creatives`

---

## 9. Vùng chưa xác minh — module này

| Vùng | Ghi chú |
|---|---|
| **`Select from medias` có lọc theo trạng thái kiểm duyệt không** | **Câu hỏi quan trọng nhất** — nối `CRTV` ↔ `MOD`. Chưa đối chiếu danh sách |
| Cấu hình **nút tuỳ biến** (`is_custom_button`) ở đâu | Không có trên form Create; 8 creative đang dùng |
| `Ad In Content` map sang giá trị dữ liệu nào | Không có mẫu trong 103 creative |
| Cách tạo creative `file_type = ortb` | Không có trên form UI |
| `Display Type = Video Live TV` có field phụ gì | Chưa chọn thử — mới kiểm `Video In-stream` |
| Ràng buộc `Duration` với độ dài video thật | Cần submit |
| `Landing Page` có validate định dạng URL không | Chưa trigger |
| `width`/`height`/`bitrate` do hệ thống tự đọc từ file hay nhập tay | Nghi tự đọc khi transcode — cần xác minh với `MOD` |

---

## 10. Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/camp_creative_select_media.png`](../evidence/camp_creative_select_media.png) | Modal `Select Media` — mắt xích `CRTV` ↔ `MOD`, lưới 64 video |
| [`../evidence/camp_creative_validation.png`](../evidence/camp_creative_validation.png) | `Create Creative` — 4 message validation hiển thị cùng lúc |

> Tên file ảnh giữ tiền tố `camp_` vì chụp trước khi tách module — **không đổi tên** để link cũ không gãy.
