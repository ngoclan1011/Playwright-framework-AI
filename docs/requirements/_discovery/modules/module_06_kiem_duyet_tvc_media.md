# Module 06 — Kiểm duyệt TVC & Media · `MOD`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-MOD-NN`.
> 🔄 **Cập nhật 2026-09-15 đợt 2** (mode ADD) — khảo sát sâu luồng upload → transcode → kiểm duyệt.

| Mục | Giá trị |
|---|---|
| **Prefix** | `MOD` |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — status flow nhiều bước; **kiểm duyệt trượt có thể tự tắt flight**, làm quảng cáo ngừng phát; ô upload nhận cả định dạng thực thi |
| **Ước REQ** | **45–60** (nâng từ 35–45 sau đợt 2) |
| **Thứ tự khảo sát** | 7 — sau `CRTV`, vì creative tiêu thụ media do module này sinh ra |

---

## 1. Màn hình — 4 màn, nhóm `Moderation`

| Màn hình | Route | Loại | CRUD | Quy mô |
|---|---|---|---|---|
| TVC List | `/moderation/tvc` | **Lưới thẻ** theo Brand | chỉ xem | 14 trang · **Total: 277** brand |
| Medias | `/moderation/medias` | Danh sách + tab con | `Create medias` | 7 trang |
| Transcode | `/moderation/transcode` | Danh sách | `View All Jobs` · `View Transcode Guideline` | 6 dòng |
| TVC Moderation | `/moderation/tvc-moderation` | Danh sách | duyệt ở cột `Action` | 3 trang |

---

## 2. Luồng nghiệp vụ — đã dựng được từ đợt 2

```
Create Media (upload file)
      ↓  Status
Transcode  (hàng đợi job · có Guideline chuẩn kỹ thuật)
      ↓  Process Status
TVC Moderation
      ├─ Moderation:     Passed / Failed
      └─ Process Status:  Unprocessed / Ignored / Turn off Flight
      ↓
module CRTV — Creative chọn media qua "Select from medias"
      ↓
module FLIGHT — phân phối theo Device Types
      ↓
Quảng cáo hiển thị trên SMART-TV / SMARTPHONE-TABLET / PC / BOX
```

🔴 **Mắt xích quan trọng nhất của cả hệ thống:** `Moderation = Failed` có thể kéo theo `Process Status = **Turn off Flight**` — tức **kiểm duyệt trượt thì hệ thống tự tắt flight**, quảng cáo ngừng chạy. Đây là điểm nối trực tiếp giữa kiểm duyệt nội dung và việc quảng cáo có hiển thị trên thiết bị hay không.

---

## 3. Create Media — ô upload

Form chỉ **2 field**: `Enter file name` (text) + `Select file` (upload, **1 file/lần**).

### 🔴 Danh sách `accept` của ô upload

```
.mp4 .webm .m3u8 .ts .png .jpg .jpeg .gif .webp
.js .css .xml .txt .pdf .apk .xlsx .html .json
```

⚠️ Hệ thống quảng cáo nhưng nhận cả **`.js`**, **`.html`**, **`.apk`**, **`.pdf`**, **`.xlsx`**, **`.xml`** — bề mặt tấn công đáng kể:
- `.html` + `.js` → stored XSS nếu file được phục vụ cùng origin
- `.apk` → phát tán ứng dụng qua hạ tầng CDN quảng cáo
- Kết hợp với payload injection đã tìm thấy trong `Roles` và `Advertisers` (mục 7 của [`../system_map.md`](../system_map.md)), đây là vùng cần soi kỹ

📌 `accept` **chỉ là gợi ý phía trình duyệt** — bắt buộc kiểm server có chặn thật không, và kiểm cả trường hợp đổi đuôi file.

> Một phần `.js`/`.css`/`.json` có thể là hợp lệ cho creative **HTML** (`extend_source` trong module `CRTV` chính là file `.json` cấu hình). Cần PO xác nhận ranh giới định dạng nào thực sự cần.

---

## 4. Transcode Guideline — hệ thống tự công bố chuẩn kỹ thuật

Mở bằng nút `View Transcode Guideline` ở màn Transcode. **Dùng thẳng làm acceptance criteria** cho test upload.

### Video Profiles

| Profile | Resolution | Video Bitrate | Minrate | Maxrate | Bufsize |
|---|---|---|---|---|---|
| 1080p | 1920×1080 | 3.6 Mbps | 1.8 Mbps | 5.2 Mbps | 7.2 Mbps |
| 720p | 1280×720 | 2.16 Mbps | 1.08 Mbps | 3.13 Mbps | 4.32 Mbps |
| 480p | 854×480 | 1.4 Mbps | 0.65 Mbps | 1.87 Mbps | 2.8 Mbps |

### Video Encoding
`1080p` → level 4.2 · `720p` → level 4.0 · `480p` → level 3.1

### General Settings
- **Framerate:** giữ nguyên nguồn (23.976 / 25 / 29.97), progressive
- **Pixel format:** `yuv420p`
- **Mezzanine:** 1080p, 15–30 Mbps hoặc ~50 Mbps VBR

### Audio
- **Codec:** AAC-LC, 2.0 stereo, 48 kHz, 128–192 kbps
- **Loudness:** ATSC A/85 (−24 LKFS ±2) hoặc EBU R128 (−23 LUFS ±1)
- **True Peak:** ≤ −6 dBTP

### Output Formats
`MP4` (phổ thông, chạy được mọi thiết bị) · `M3U8 (HLS)` (adaptive streaming cho OTT/VoD)

> Đối chiếu ngược với dữ liệu creative ở module `CRTV`: `width×height` thật gồm `3840×2160`, `1920×1080`, `1280×720`, `800×500` — **`3840×2160` (4K) và `800×500` nằm ngoài 3 profile này**. Cần PO xác nhận Guideline có ràng buộc cứng không.

---

## 5. TVC Moderation — trạng thái kiểm duyệt

| Cột | |
|---|---|
| `ID` · `URL` · `Brand name` · `Campaign name` · `Moderation` · `Process Status` · `Created At` · `Action` | |

Bộ lọc: `Search brand` (select) · `Search by campaign id` · `Start date` · `End date`.
⚠️ **Không có bộ lọc theo trạng thái** → không liệt kê được enum đầy đủ từ UI.

### Enum quan sát được trong dữ liệu

| Cột | Giá trị |
|---|---|
| `Moderation` | `Passed` · `Failed` |
| `Process Status` | `Unprocessed` · `Ignored` · **`Turn off Flight`** |

Tổ hợp thật quan sát được (4 dòng đầu):

| ID | Brand | Moderation | Process Status |
|---|---|---|---|
| 69 | Vinamilk | `Failed` | `Ignored` |
| 68 | testaddlogo1234 | `Passed` | `Turn off Flight` |
| 67 | Unilever - Clear | `Passed` | `Unprocessed` |
| 66 | P&G - Downy | `Failed` | `Turn off Flight` |

⚠️ **Dòng 68 có `Moderation = Passed` nhưng `Process Status = Turn off Flight`** — trạng thái duyệt và hành động xử lý **không phải quan hệ 1–1**. Đây là vùng logic phải làm rõ, dễ sinh bug.

Cột `Campaign name` hiển thị kèm ID (`Test All Platformscc ID: 1188`) → nối thẳng sang module `CAMP`.

### ⚠️ Hai biểu tượng cột `Action` không có nhãn

Cả hai button **không có `title` lẫn `aria-label`**. Icon thuộc bộ `iconify-solar`; hình dạng path gợi ý là **con mắt (xem)** và **mũi tên tròn (xử lý lại)** — **nghi vấn, chưa xác minh**.

Hệ quả kép:
- **Trợ năng:** người dùng screen reader không biết nút làm gì
- **Automation:** không có thuộc tính ngữ nghĩa nào để bám locator → sẽ phải dùng vị trí, vốn dễ gãy

---

## 6. Medias — kho media

**Tab con:** `Video` · `Image` · `Other`

| Cột | |
|---|---|
| `ID` · `File Name` · `Status` · `Moderation` · `Original URL` · `Video Specs` · `Audio Specs` · `Created At` · `Action` | |

- **Hai cột trạng thái tách biệt:** `Status` (xử lý file) và `Moderation` (duyệt nội dung) — hai vòng đời song song trên cùng bản ghi
- `Video Specs` / `Audio Specs` → hệ thống **tự đọc thông số kỹ thuật** của file, khớp với việc creative có `width`/`height`/`bitrate` (module `CRTV`)
- Modal `Select Media` gọi từ module `CRTV` hiển thị **64 video** / 7 trang, lọc theo `Creative Type`

---

## 7. TVC List — lưới thẻ theo Brand

**Không phải bảng** — lưới thẻ, mỗi thẻ là một Brand kèm số media file:

```
testaddlogo1234          Media files: 17
P&G - Downy              Media files: 237
P&G - Head & Shoulders   Media files: 251
Colgate                  Media files: 70
Traphaco                 Media files: 0      ← brand không có media
```

20 thẻ/trang · `Page size 20 | Total: 277` · thanh công cụ chỉ có `Search` · `Refresh`.
Có brand **0 media file** → cần test hiển thị rỗng.

👉 Điểm nối sang module `ADV`: Brand là trục gom media.

> ⚠️ **Lưu ý automation:** màn này không có `<thead>`/`<tbody>`. Locator viết theo kiểu bảng sẽ không chạy.

---

## 8. Transcode — hàng đợi job

| Cột | |
|---|---|
| `ID` · `Name` · `Status` · `Create` · `Update` | |

- Nút `View All Jobs` · `View Transcode Guideline`
- Bảng ngắn (6 dòng), không phân trang → là **hàng đợi công việc**, không phải kho dữ liệu
- `TranscodeStore` lưu ở `localStorage` (~4 KB), chứa mảng `listNew` với `id`, `brand_id`, `original_url`

---

## 9. API của module

```
GET /api/stats/tvc-quality           ·  /api/stats/tvc-quality-daily
GET /api/stats/tvc-quality-by-cid
```

Ba endpoint này phục vụ màn **Ads Valify** (module `DASH`) — chất lượng TVC được đo và báo cáo riêng.

Permission: `medias.view` · `mediafiles.*` · `mediafile.*` · `tvcs.*`
→ Bảng permission có **cả `Mediafile` lẫn `Mediafiles`** — trùng nghĩa, xem module 02.

---

## 10. Vùng chưa xác minh — module này

| Vùng | Ghi chú |
|---|---|
| **Danh sách đầy đủ `Status` / `Moderation` / `Process Status`** | Màn TVC Moderation **không có bộ lọc trạng thái**; chỉ thấy giá trị xuất hiện trong dữ liệu |
| **Hai icon cột `Action` làm gì** | Không có nhãn; nghi là *Xem* và *Xử lý lại* |
| **Ai được duyệt, duyệt qua mấy bước, từ chối có bắt nhập lý do không** | Chưa mở luồng duyệt |
| **Server có chặn `.js`/`.html`/`.apk` thật không**, hay chỉ chặn ở `accept` | ⚠️ Cần upload thử — user đã chốt **KHÔNG upload file** ở đợt này |
| Đổi đuôi file để vượt `accept` | Cùng lý do trên |
| Quan hệ `Moderation` ↔ `Process Status` (dòng 68: `Passed` + `Turn off Flight`) | Cần PO |
| `Select Media` **có lọc bỏ media chưa duyệt không** | **Câu hỏi quan trọng nhất** nối `MOD` ↔ `CRTV`. Chưa đối chiếu |
| Guideline có phải ràng buộc cứng không | Dữ liệu thật có `3840×2160` và `800×500`, nằm ngoài 3 profile công bố |
| Transcode thất bại hiển thị thế nào | Không có mẫu lỗi trong 6 dòng đang có |
| Khác nhau giữa 3 tab `Video` / `Image` / `Other` | Chưa mở tab `Image` và `Other` |

---

## 11. Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/mod_overview.png`](../evidence/mod_overview.png) | `TVC Moderation` — 8 cột gồm cả `Moderation` và `Process Status` |
| [`../evidence/mod_transcode_guideline.png`](../evidence/mod_transcode_guideline.png) | `Transcode Guideline` — bảng profile, encoding, audio, output formats |
