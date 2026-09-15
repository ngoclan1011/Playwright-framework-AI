# Module 09 — Báo cáo & Dashboard · `DASH`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-DASH-NN`.

| Mục | Giá trị |
|---|---|
| **Prefix** | `DASH` |
| **Nền tảng** | Web |
| **Risk** | 🟡 Trung bình — chỉ đọc, không sửa dữ liệu. Nhưng **số liệu sai thì khách hàng quyết định sai** |
| **Ước REQ** | 35–45 |
| **Thứ tự khảo sát** | 10 (cuối cùng) — phụ thuộc dữ liệu của mọi module khác |

---

## Màn hình — 5 màn, thuộc nhóm `Dashboard`

| # | Màn hình | Route | Loại | Xuất file | Trạng thái dữ liệu staging |
|---|---|---|---|---|---|
| 1 | Report Campaign | `/dashboard/report-campaign` | KPI + biểu đồ | — | Có dữ liệu (toàn số 0) |
| 2 | Report Flights | `/dashboard/report-flights` | Bảng | — | Có dữ liệu — 18 dòng |
| 3 | AVOD Report | `/dashboard/avod` | Bảng | ✅ `Export file` | **Rỗng** (`No data`) |
| 4 | Ads Valify Report | `/dashboard/ads-valify` | Bảng | — | **Rỗng** (`No data`) |
| 5 | Error Monitor | `/dashboard/error-monitor` | Bảng | — | **Rỗng** (`No data`) |

> Đây là màn hình **mặc định sau khi đăng nhập** (`/dashboard/report-campaign`).

---

## 1. Report Campaign — 7 chỉ số KPI + biểu đồ

| Chỉ số | Chỉ số phụ đi kèm |
|---|---|
| `Total Impression` | — |
| `Total Click` | `CTR: 0%` |
| `Total Played 25` | `View rate: 0%` |
| `Total Played 50` | `View rate: 0%` |
| `Total Played 75` | `View rate: 0%` |
| `Total Complete View` | `View rate: 0%` |
| `Total Unique User` | — |

→ Mô hình đo **video quảng cáo theo mốc phần trăm đã xem** (25/50/75/100%). Có biểu đồ bên dưới.

**Bộ lọc:**

| Bộ lọc | Kiểu | Ghi chú |
|---|---|---|
| `Select campaign` | Ô tìm kiếm | — |
| `Campaigns` | Dropdown | **Đang `disabled`** |
| Khoảng thời gian | Dropdown | Mặc định `Last 3 months` |
| `Daily` | Dropdown | **Đang `disabled`** — nghi là mức gộp (ngày/tuần/tháng) |
| Từ ngày / Đến ngày | Ngày | **Đang `disabled`**, giá trị `01/06/2026` → `15/09/2026` |
| | | Nút `Search` |

> ⚠️ **4 trong 6 bộ lọc bị `disabled` khi mới vào màn.** Nhiều khả năng chỉ bật sau khi chọn campaign. Đây là **luồng phụ thuộc điều kiện** — nguồn sinh test case tốt, cần xác minh ở tầng module.

---

## 2. Report Flights — bảng chỉ số theo flight

| Cột | |
|---|---|
| `ID` · `Flight` · `Total Bookings Impressions` · `Run Days` · `Daily Bookings Impressions` · `Total Impressions` · `Total Clicks` · `Completed View` · `CTR (%)` · `VTR (%)` | |

→ Đối chiếu **đã đặt (booking)** với **đã chạy thật (actual)**. Nối trực tiếp sang module `CAMP` (Flight).
API: `GET /api/flights?running=1` rồi `GET /api/report/flights/realtime?ids=<danh sách id>` → **báo cáo thời gian thực**.

---

## 3. AVOD Report

| Cột | |
|---|---|
| `Date` · `Content` · `Category` · `Provider` · `Views` · `Ads Impression` · `Revenue` | |

- **Có cột `Revenue`** → báo cáo doanh thu. Nâng mức nhạy cảm của module này lên
- Nút `Export file` — **màn duy nhất trong hệ thống có xuất file**
- API: `GET /api/report/avod?limit=20&offset=1&order=id|desc` · `GET /api/report/avod/source-provider`

---

## 4. Ads Valify Report — chất lượng quảng cáo

| Cột | |
|---|---|
| `CID` · `Pass` · `Violation` · `Unknown` · `Total` | |

→ Kiểm tra TVC **đạt / vi phạm / chưa xác định**. Nối sang module `MOD`.
Nút `Refresh data`.
API: `GET /api/stats/tvc-quality` · `/api/stats/tvc-quality-daily` · `/api/stats/tvc-quality-by-cid`

---

## 5. Error Monitor — giám sát lỗi phát quảng cáo

| Cột | |
|---|---|
| `ID` · `IDs` · `Status` · `Platform` · `Error Code` · `Error Reason` · `Event` · `Count` · `Occurred` · `Updated by` · (2 cột không tiêu đề) | |

- Có `Status` và `Updated by` → lỗi được **xử lý và gán trạng thái**, không chỉ là log thụ động
- 7 ô lọc trên thanh công cụ
- API: `GET /api/error-logs-agg?from=<ngày>&to=<ngày>` — dữ liệu đã gộp (`agg`), mặc định 30 ngày gần nhất

---

## Vùng chưa xác minh — module này

| Vùng | Vì sao chưa có |
|---|---|
| **3 trong 5 màn không có dữ liệu** trên staging | AVOD · Ads Valify · Error Monitor đều `No data`. **Không kiểm chứng được cách hiển thị số liệu** — cần dữ liệu mẫu hoặc môi trường khác |
| Điều kiện bật 4 bộ lọc đang `disabled` ở Report Campaign | Chưa chọn campaign để thử |
| Công thức tính `CTR` · `VTR` · `View rate` | Chưa đối chiếu được vì mọi chỉ số đang bằng 0 |
| Định dạng và nội dung file xuất ra từ `Export file` | Chưa bấm — sẽ tải file về máy |
| Giá trị của `Status` ở Error Monitor | Chưa mở dropdown |
| Hai cột không tiêu đề ở Error Monitor chứa gì | Chưa xác minh |
| Báo cáo có chịu giới hạn phạm vi theo đối tác của người dùng không | Chỉ có account admin — xem ma trận phân quyền ở `system_map.md` mục 5 |
| Khoảng thời gian tối đa được phép chọn | Chưa thử |

---

## Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/dash_overview.png`](../evidence/dash_overview.png) | Màn `Report Campaign` — 7 thẻ KPI, dải bộ lọc (thấy rõ các ô đang `disabled`), biểu đồ bên dưới |
