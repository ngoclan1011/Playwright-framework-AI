# Module 05 — Chiến dịch · `CAMP`

> ⬅️ Quay lại [`../system_map.md`](../system_map.md) · Trạng thái recon xem ở [`../../README.md`](../../README.md)
> ❌ File tầng khám phá — **không** chứa mã `REQ-CAMP-NN`.
> 🔄 **Cập nhật 2026-09-15 đợt 2** (mode ADD): khảo sát sâu, và **tách `FLIGHT` thành module riêng** theo chốt của user. File này giờ **chỉ còn tầng Campaign**.
> 👉 Flight và Creative chuyển sang [`module_10_flight_creative.md`](module_10_flight_creative.md).

| Mục | Giá trị |
|---|---|
| **Prefix** | `CAMP` |
| **Phạm vi** | **Chỉ tầng Campaign** — danh sách, tạo/sửa, nhân bản, nhật ký, tích hợp CMS ngoài |
| **Ngoài phạm vi** | Flight · Creative → module `FLIGHT` |
| **Nền tảng** | Web |
| **Risk** | 🔴 Cao — điểm vào của lõi nghiệp vụ, có tích hợp hệ thống ngoài, 533 bản ghi thật |
| **Ước REQ** | **35–45** |
| **Thứ tự khảo sát** | 6 |
| **Dữ liệu tham chiếu** | Campaign **1188** `Test All Platformscc` (user chỉ định) — 21 flight, 103 creative |

---

## 1. Màn hình

| Màn hình | Route | Loại | CRUD |
|---|---|---|---|
| Campaign List | `/campaigns` | Danh sách — **533 bản ghi** / 27 trang | `Create Campaign` · sửa · xoá · lịch sử |
| Chi tiết chiến dịch | `/campaigns/{id}` | Trang tổng hợp (khối Flight thuộc module `FLIGHT`) | `Edit` · `Copy` · `View Report` · `View Log` |
| Nhật ký chiến dịch | Modal từ `View Log` | Bảng chỉ đọc | — |

> `/campaigns/<chuỗi-không-phải-id>` trả `404 Campaign not found` **bên trong layout**, không nhảy ra trang 404 chung — khác hành vi của route không tồn tại ở cấp hệ thống.

### Bảng danh sách

| Cột | Ghi chú |
|---|---|
| `ID` · `Campaign Name` · `Type` · `Advertiser` · `Start Date` · `End Date` · `Status` · `Actions` | |
| `Campaign Name` | 3 dòng: tên (link) · email người tạo · thời gian tương đối (`25 days ago`) |
| `Status` | **Công tắc** bật/tắt, nhãn `Active`/`Inactive` bên dưới |
| `End Date` | Có **biểu tượng ⚠️** ở chiến dịch đã quá hạn |
| `Actions` | 3 biểu tượng: sửa · xoá · lịch sử |

Bộ lọc: `Campaign Name` · `Advertiser` · `Start Date` · `End Date` · `Status` (mặc định `All`).

---

## 2. Form Create Campaign — 9 field

| Field | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `Campaign Name` | text | ✅ | placeholder `Enter campaign name` |
| `Advertiser` | select | ✅ | 10 mục · nguồn `GET /api/accounts?model=advertiser` |
| `Contract` | select | ✅ | **hiển thị kèm trạng thái `Approved`/`Expired`** · nguồn `GET /api/cms/Contracts` |
| `CMS Campaign` | select | ✅ | nguồn `GET /api/cms/Campaigns?Contract=<mã>` |
| `Start Date` · `End Date` | ngày | ✅ | — |
| `Description` | text | ❌ | — |
| `Type` | radio | ✅ | `VOD` · `Display` · `LiveTV` |
| `Status` | switch | ❌ | **mặc định TẮT** (`Inactive`) |

### Chuỗi phụ thuộc 3 bậc — đã kiểm chứng

```
Advertiser  →  Contract  →  CMS Campaign
(mở sẵn)      (mở sẵn)      (KHOÁ tới khi chọn Contract)
```

Mở form lần đầu `CMS Campaign` đã `disabled`; chọn xong `Advertiser` nó **vẫn** `disabled` → chỉ mở khoá ở bậc `Contract`.

### ⚠️ Câu hỏi nghiệp vụ

**Dropdown `Contract` vẫn cho chọn hợp đồng `Expired`** — quan sát 7/10 hợp đồng là `Expired`, 3 là `Approved`. Cần PO xác nhận có được tạo chiến dịch trên hợp đồng hết hạn không.

---

## 3. 🔗 Tích hợp hệ thống CMS ngoài — điểm tích hợp duy nhất của toàn hệ thống

```
GET /api/cms/Contracts                          → danh sách hợp đồng + trạng thái
GET /api/cms/Campaigns?Contract=<mã hợp đồng>   → danh sách chiến dịch của hợp đồng đó
```

Campaign 1188 hiển thị `Contract: HDCCT9999` · `CMS Campaign: CP testdata`. Campaign 1295 hiển thị `Contract: HDNB` · `CMS Campaign: Campaign Nội Bộ`.

Đây là **điểm tích hợp duy nhất** phát hiện được trong toàn hệ thống → cần test riêng kịch bản hệ thống kia không phản hồi / trả rỗng / trả chậm.

---

## 4. Nhật ký chiến dịch — `View Log` ✅ đã kiểm chứng

Modal `Campaign Log`, 6 cột: `Date` · `User` · `Event` · `Field` · `Old value` · `New value`. Lọc theo `User` · `Event` (mặc định `All`) · `Date`.

Sự kiện `Created` ghi lại **từng trường một**: `Name` · `Account Id` · `Start Date` · `End Date` · `Status` · `Activated` · `Type` · `Cms Contract Id` · `Cms Campaign Id` · `Id` · `Created By` · `Updated By` · `Created At`.

⚠️ Nhật ký ghi `Status: approved` và `Activated: 1` — **hai trường trạng thái tách biệt**, trong khi UI chỉ hiển thị một công tắc. Schema campaign xác nhận có cả `status` lẫn `activated`.

---

## 5. Schema campaign (từ `GET /api/campaigns/{id}`)

```
id · name · description · account_id · start_date · end_date · budgets · status
activated · created_by · updated_by · created_at · updated_at · type
cms_contract_id · cms_campaign_id · account · flights · creatives
```

⚠️ Trường `budgets` có trong schema nhưng **không thấy trên form UI** — cần PO xác nhận.

---

## 6. API của module

```
GET /api/campaigns?limit=1000
GET /api/campaigns/{id}?includes=account,flights,creatives   ← trả cả 3 tầng trong 1 request
GET /api/cms/Contracts
GET /api/cms/Campaigns?Contract=<mã>
```

Permission: `campaigns.all` · `campaigns.view` · `campaigns.update` · `campaigns.report`

---

## 7. Vùng chưa xác minh — module này

| Vùng | Ghi chú |
|---|---|
| **`Copy` nhân bản tới tầng nào** — chỉ campaign, hay kéo theo cả flight và creative | Chưa bấm. Dữ liệu có `Copy of Copy of Copy of test wws 2` → tính năng dùng nhiều, **đáng test kỹ**. ⚠️ Bấm thử sẽ **sinh bản ghi thật** trên staging |
| Ràng buộc ngày: `End Date` có bắt buộc sau `Start Date` không | Cần submit form |
| Chiến dịch trên hợp đồng `Expired` có tạo được không | Cần submit form + PO |
| Trường `budgets` dùng để làm gì | Không có trên UI |
| Quan hệ `status` (giá trị `approved`…) ↔ `activated` (0/1) | UI chỉ hiện 1 công tắc |
| Xoá chiến dịch đang có flight đang chạy thì sao | ⚠️ Thao tác phá huỷ |
| Hành vi khi CMS ngoài lỗi / trả rỗng | Chưa thử |

---

## 8. Evidence

| Ảnh | Nội dung |
|---|---|
| [`../evidence/camp_overview.png`](../evidence/camp_overview.png) | `Campaign List` — 8 cột, 5 bộ lọc, công tắc trạng thái, cảnh báo ⚠️ ở End Date quá hạn |
