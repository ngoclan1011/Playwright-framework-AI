# Yêu cầu — Module Flight (`FLIGHT`)

| Mục | Giá trị |
|---|---|
| **Hệ thống** | CMS Adsplay (for FPTPlay) |
| **Module** | Flight — kế hoạch phân phối quảng cáo |
| **Prefix** | `FLIGHT` |
| **Nền tảng** | **Web** (chưa khảo sát mobile/API) |
| **Dải mã đã dùng** | `REQ-FLIGHT-01` → `REQ-FLIGHT-40` · `AMB-01` → `AMB-09` · `RISK-01` → `RISK-05` |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-FLIGHT-41` · `AMB-10` · `RISK-06` — **KHÔNG đánh lại từ 01** |
| **Nguồn** | UI thực tế + tầng network (quan sát thụ động) + dữ liệu 21 flight của campaign 1188 |
| **Ngày phát hành** | 2026-09-15 |
| **Bản đồ khám phá** | [`../_discovery/modules/module_10_flight_creative.md`](../_discovery/modules/module_10_flight_creative.md) |

---

## 1. Tổng quan

### Mục đích

Flight là **kế hoạch phân phối** của một chiến dịch: quảng cáo chạy **ở đâu** (publisher, webapp), **khi nào** (khoảng ngày, giờ, thứ), **bao nhiêu** (booking, tần suất, trọng số), **giá bao nhiêu**, và **nhắm tới ai** (17 chiều nhắm mục tiêu). Đây là nơi quyết định quảng cáo có hiển thị trên thiết bị của người xem hay không.

### Trong phạm vi

Danh sách flight trong chiến dịch · tạo · sửa · kích hoạt/ngừng · lọc theo trạng thái · cấu hình booking và giá · toàn bộ 17 chiều nhắm mục tiêu.

### Ngoài phạm vi

| Nội dung | Thuộc module |
|---|---|
| Chiến dịch cha | `CAMP` |
| Creative — nội dung quảng cáo trong flight | `CRTV` |
| Báo cáo hiệu quả flight | `DASH` |
| Danh mục nhắm mục tiêu (Categories, Segments, Pages Key…) | `TGT` |
| Publisher, Webapp, Placement | `PUB` |

### Bản đồ phủ tài liệu

**Không có tài liệu nào được cung cấp.** Toàn bộ yêu cầu rút từ **UI thực tế**, **tầng network** và **dữ liệu thật của 21 flight** trong campaign 1188 (user chỉ định làm bộ tham chiếu). Mức phủ tài liệu ⬜ Trắng.

---

## 2. Yêu cầu chức năng

| REQ ID | Tên yêu cầu | Nền tảng | Mô tả | Acceptance Criteria | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|
| REQ-FLIGHT-01 | Flight luôn thuộc một chiến dịch | Web | Flight không tồn tại độc lập | Không có route riêng cho flight; danh sách flight chỉ hiện trong `/campaigns/{id}` | 🟢 | UI thực tế |
| REQ-FLIGHT-02 | Xem danh sách flight của chiến dịch | Web | Liệt kê flight thuộc chiến dịch đang mở | Khối `Flight Management` hiện bảng `ID · Name Flight · Status` kèm tổng số (`21 flight`) | 🟢 | UI thực tế |
| REQ-FLIGHT-03 | Lọc flight theo trạng thái | Web | Thu hẹp danh sách flight | Bộ lọc `Filter by status` có 2 giá trị: `Activated` · `Inactive` | 🟢 | UI thực tế |
| REQ-FLIGHT-04 | Flight phải có tên | Web | Định danh cho người dùng | Bỏ trống → báo `Name is required` | 🟢 | UI thực tế |
| REQ-FLIGHT-05 | Flight phải có khoảng thời gian chạy | Web | Xác định thời gian phân phối | Bỏ trống → báo `Date range is required` | 🟢 | UI thực tế |
| REQ-FLIGHT-06 | Một flight nhận nhiều khoảng thời gian | Web | Chạy ngắt quãng theo nhiều đợt | Có nút `+` cạnh `Date Range` để thêm khoảng. Flight 118821 thực tế có **2 khoảng**: `2026-04-01→04-30` và `2026-05-04→2029-05-31` | 🟢 | UI thực tế · dữ liệu 1188 |
| REQ-FLIGHT-07 | Flight gắn đúng một nhà xuất bản | Web | Quảng cáo chạy trên hệ thống của một publisher | `Publishers` là select **đơn**, bắt buộc. Bỏ trống → báo `Publisher is required` | 🟢 | DOM |
| REQ-FLIGHT-08 | Flight gắn nhiều ứng dụng/website | Web | Một flight phủ nhiều webapp của cùng publisher | `Web Apps` là select **nhiều**, bắt buộc. Flight 118821 gắn 2 webapp | 🟢 | DOM · dữ liệu 1188 |
| REQ-FLIGHT-09 | Nguồn quảng cáo có hai loại | Web | Phân biệt quảng cáo nội bộ và quảng cáo lập trình | `Source Type`: `Internal` (mặc định) · `ORTB` | 🟢 | UI thực tế |
| REQ-FLIGHT-10 | Flight có trọng số phân phối | Web | Quyết định ưu tiên khi nhiều flight cùng tranh vị trí | `Weight` bắt buộc. Bỏ trống → báo `Weight is required`. Giá trị thật quan sát được: `1` · `9` · `10` | 🟢 | UI thực tế · dữ liệu 1188 |
| REQ-FLIGHT-11 | Giới hạn tần suất hiển thị cho một người xem | Web | Tránh làm phiền người xem bằng cùng một quảng cáo | Cặp `Ad Frequency` + `Minutes`: N lần hiển thị trong M phút. Màn chi tiết hiển thị `100 Impression(s) / 1,440 Minutes` | 🟢 | UI thực tế |
| REQ-FLIGHT-12 | Kiểu đặt chỗ có ba loại | Web | Đơn vị tính lượng quảng cáo đã mua | `Booking Type`: `Impression` (mặc định) · `Click` · `Complete View` | 🟢 | UI thực tế |
| REQ-FLIGHT-13 | Flight phải khai lượng đặt theo ngày và tổng | Web | Kiểm soát tốc độ tiêu thụ | `Daily Booking` và `Total Booking` đều bắt buộc. Bỏ trống → `Daily booking is required` / `Total booking is required` | 🟢 | UI thực tế |
| REQ-FLIGHT-14 | Flight có thể khai giá | Web | Ghi nhận giá trị thương mại | `Price (VND)` không bắt buộc. Giá trị thật: `0` (18 flight) · `200000` · `700000` | 🟢 | UI thực tế · dữ liệu 1188 |
| REQ-FLIGHT-15 | Flight mới mặc định chưa kích hoạt | Web | Tránh phân phối ngoài ý muốn ngay khi tạo | Mở form → công tắc `Activated` ở trạng thái **tắt** | 🟢 | DOM |
| REQ-FLIGHT-16 | Nhắm mục tiêu theo khung giờ | Web | Chỉ chạy vào giờ nhất định trong ngày | Trường `Hours`, bộ chọn riêng, placeholder `Choose hours`. Không bắt buộc | 🟢 | DOM |
| REQ-FLIGHT-17 | Nhắm mục tiêu theo thứ trong tuần | Web | Chỉ chạy vào những ngày nhất định | `Days of Week` chọn nhiều, đúng 7 giá trị `Sun` → `Sat` | 🟢 | UI thực tế |
| REQ-FLIGHT-18 | Nhắm mục tiêu theo trang | Web | Chỉ chạy ở một số trang của ứng dụng | `Pages` chọn nhiều, nguồn `GET /api/pages-key?activated=1` | 🟢 | Tầng network |
| REQ-FLIGHT-19 | Nhắm mục tiêu theo nhà cung cấp nội dung | Web | — | `Source Providers` chọn nhiều, nguồn `GET /api/source-providers?activated=1` | 🟢 | Tầng network |
| REQ-FLIGHT-20 | Nhắm mục tiêu theo danh mục nội dung | Web | — | `Categories` chọn nhiều, nguồn `GET /api/categories?limit=1000` | 🟢 | Tầng network |
| REQ-FLIGHT-21 | Nhắm mục tiêu theo nội dung cụ thể | Web | Chỉ định danh sách nội dung cụ thể, nhập tay hoặc nhập từ file | `Contents` là ô nhập tag (`Type and press Enter to add tags`) kèm nút **`Use import file`** | 🟢 | DOM |
| REQ-FLIGHT-22 | Nhắm mục tiêu theo loại hồ sơ người xem | Web | Phân biệt hồ sơ người lớn và hồ sơ trẻ em | `Profile Type`: `Normal` · `Kid`. Dữ liệu thật: `normal` (15 flight) | 🟢 | UI thực tế · dữ liệu 1188 |
| REQ-FLIGHT-23 | ⚠️ Nhắm mục tiêu theo nhóm tuổi người xem | Web | Phân phối quảng cáo theo độ tuổi, gồm cả nhóm trẻ em | `Profile Maturity` có đúng 4 giá trị: `Children (Under 13)` · `Teenagers (Under 16)` · `Teens (16 to Under 18)` · `Adults (18+)` | 🟢 | UI thực tế |
| REQ-FLIGHT-24 | Nhắm mục tiêu theo định danh người dùng | Web | Chạy cho danh sách người dùng cụ thể | `User IDs` chọn nhiều | 🟢 | DOM |
| REQ-FLIGHT-25 | Nhắm mục tiêu theo nhà mạng | Web | — | `ISPs` chọn nhiều | 🟢 | DOM |
| REQ-FLIGHT-26 | Nhắm mục tiêu theo nhóm người dùng | Web | — | `User Groups` chọn nhiều | 🟢 | DOM |
| REQ-FLIGHT-27 | Nhắm mục tiêu theo phân khúc người dùng | Web | — | `User Segments` chọn nhiều, nguồn `GET /api/user-segment?synced=1` | 🟢 | Tầng network |
| REQ-FLIGHT-28 | Nhắm mục tiêu theo loại thiết bị | Web | Quyết định quảng cáo hiển thị trên loại thiết bị nào | `Device Types` có đúng 4 giá trị: `SMART-TV` · `SMARTPHONE-TABLET` · `PC` · `BOX` | 🟢 | UI thực tế · `GET /api/config?key=device_types` |
| REQ-FLIGHT-29 | Nhắm mục tiêu theo hãng thiết bị | Web | Thu hẹp trong một loại thiết bị | `Brands` chọn nhiều. Theo cấu hình hệ thống: SMART-TV → SAMSUNG, SONY · SMARTPHONE-TABLET → SAMSUNG, APPLE, OPPO · PC → PC, APPLE · BOX → FPTPlay | 🟢 | `GET /api/config?key=device_types` |
| REQ-FLIGHT-30 | Nhắm mục tiêu theo thiết bị cụ thể | Web | — | `Devices`, mặc định hiển thị `All devices` | 🟢 | DOM |
| REQ-FLIGHT-31 | Nhắm mục tiêu theo vị trí địa lý | Web | — | `Location` chọn nhiều, nguồn `GET /api/provinces?limit=1000` | 🟢 | Tầng network |
| REQ-FLIGHT-32 | Tiếp thị lại theo nhà quảng cáo | Web | Nhắm lại người đã tiếp xúc quảng cáo của một advertiser | `Retarget` là select đơn, danh sách lấy từ **danh sách nhà quảng cáo** (10 mục) | 🟢 | UI thực tế |
| REQ-FLIGHT-33 | Flight là vật chứa của Creative | Web | Quan hệ cha–con với module `CRTV` | Mỗi khối flight hiển thị danh sách creative kèm tổng (`4 Total`) và nút `New creative` | 🟢 | UI thực tế |
| REQ-FLIGHT-34 | Xem chi tiết thuộc tính flight | Web | Xem đầy đủ cấu hình đã đặt | Khối flight hiển thị Publisher · Web app · Date range · Booking type · Daily/Total booking · Ad frequency · Activated, kèm nút `View more` | 🟢 | UI thực tế |

---

## 3. Ma trận phân quyền (sơ bộ)

⚠️ **Chỉ có 1 tài khoản admin** trong khi hệ thống khai báo 34 role — xem `AMB-02`.

| Chức năng | Permission | Admin | Role khác |
|---|---|---|---|
| Xem danh sách flight | `campaigns.flights.view` | ✅ Đã kiểm chứng | ⚠️✅ Role `Deeplink` có `campaigns.flights.view` |
| Tạo flight | ❔ chưa rõ permission riêng | ✅ Đã kiểm chứng | ❔ |
| Sửa flight | ❔ chưa rõ permission riêng | ✅ Đã kiểm chứng | ❔ |
| Kích hoạt/ngừng flight | ❔ chưa rõ permission riêng | ✅ Đã kiểm chứng | ❔ |
| Xem báo cáo thời gian thực | `campaigns.flights.realtime_r…` | ✅ Đã kiểm chứng | ⚠️✅ Role `Report Guest` có quyền này |

**Tổng kết độ tin cậy:** Đã kiểm chứng **5 ô** (toàn bộ cột Admin) · Suy diễn **2 ô** · Chưa rõ **3 ô** + toàn bộ 33 role còn lại.

---

## 4. Ma trận trạng thái

| Trạng thái | Nhãn trên UI | Ý nghĩa | Thao tác cho phép |
|---|---|---|---|
| Kích hoạt | `Activated` | Flight đang phân phối | Sửa · Thêm creative · Ngừng |
| Ngừng | `Inactive` | Flight không phân phối | Sửa · Thêm creative · Kích hoạt |

Phân bố thực tế trong campaign 1188: **16 `Activated`** · **5 `Inactive`** trên 21 flight.

> ⚠️ Chưa quan sát thấy thao tác nào **bị chặn** theo trạng thái — xem `AMB-04`.

---

## 5. Điểm mơ hồ (Ambiguity)

| AMB ID | Mức | Nội dung | Giả định tạm | Cần ai trả lời |
|---|---|---|---|---|
| **AMB-01** | 🔴 | **Nhắm quảng cáo tới trẻ em là vùng có ràng buộc pháp lý.** Hệ thống cho phép nhắm `Profile Type = Kid` và `Profile Maturity = Children (Under 13)` / `Teenagers (Under 16)`. Chưa rõ có quy tắc chặn loại quảng cáo nào với nhóm này không (rượu bia, cờ bạc, nội dung người lớn) | Giả định **chưa có** ràng buộc tự động — phụ thuộc người vận hành | **PO / Pháp chế** — quyết định có cần rào chắn kỹ thuật không |
| **AMB-02** | 🔴 | **Thiếu account role thấp** — 34 role, chỉ có 1 admin → ma trận phân quyền mục 3 là suy diễn | Giả định permission phản ánh đúng quyền thật | **PO** — xin account `Report Guest` · `Guest_CMS` |
| **AMB-03** | 🟠 | **Quy tắc giữa `Daily Booking`, `Total Booking` và số ngày chạy?** Flight 118821 có `Daily = 0` nhưng `Total = 416,710,000` | Giả định `Daily = 0` nghĩa là **không giới hạn theo ngày** | **PO** |
| **AMB-04** | 🟠 | **Khoảng ngày của flight có bắt buộc nằm trong khoảng ngày của campaign không?** Campaign 1188 chạy `2025-10-21 → 2030-09-14`, flight 118821 chạy tới `2029-05-31` — nằm trong, nhưng chưa chứng minh được là ràng buộc | Giả định **có** ràng buộc | **Dev** |
| **AMB-05** | 🟠 | **`Weight` hoạt động thế nào khi nhiều flight cùng tranh một vị trí?** Giá trị thật chỉ thấy `1`, `9`, `10` — chưa rõ thang đo và ý nghĩa | Giả định số càng lớn càng ưu tiên | **PO / Dev** |
| **AMB-06** | 🟠 | **Backend có nhiều chiều nhắm mục tiêu hơn UI.** Schema flight trả về **48 trường**, form chỉ có 30. Thiếu trên UI: `countries` · `mobile_carriers` · `zones` · `placeszones` · `regions` · `scenes` · `positions` · `buy_type` · `ad_type` · `flight_type` · `ads_groups` | Giả định chưa triển khai UI | **PO** |
| **AMB-07** | 🟠 | **`buy_type = cpm` và `flight_type = vod` không có trên form** nhưng có trong dữ liệu của cả 21 flight | Giả định hệ thống tự gán theo loại chiến dịch cha | **Dev** |
| **AMB-08** | 🟡 | **Nút `Use import file` ở trường `Contents` nhận định dạng gì, giới hạn bao nhiêu dòng?** Chưa thử vì user chốt **không upload file** ở đợt này | Giả định nhận CSV/Excel danh sách ID nội dung | **Dev** |
| **AMB-09** | 🟡 | **Ngôn ngữ chuẩn của hệ thống là gì?** Mọi thông báo ghi theo `en_US` | Giả định `en_US` là chuẩn | **QA Lead / PO** |

---

## 6. Rủi ro kiểm thử (Risk)

| RISK ID | Mức | Nội dung | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| **RISK-01** | 🔴 | **Không tạo được chiến dịch mới** (`AMB-01` của module `CAMP`) → không có chiến dịch sạch để dựng flight test | Phải test flight trên chiến dịch có sẵn, lẫn với dữ liệu thật | Dùng campaign 1188 (đã là dữ liệu test) cho tới khi lỗi `CAMP` được sửa |
| **RISK-02** | 🔴 | **Bùng nổ tổ hợp.** 17 chiều nhắm mục tiêu — nếu test đầy đủ tổ hợp là bất khả thi | Dễ bỏ sót tổ hợp gây lỗi phân phối | Dùng `/generate-cross-module-test-plan` với chiến lược Output-Class Coverage, không thử toàn bộ tích Descartes |
| **RISK-03** | 🟠 | **Không kiểm chứng được kết quả phân phối thật.** Đặt nhắm mục tiêu xong không có cách nào xác minh quảng cáo có thực sự hiển thị đúng đối tượng | Test chỉ dừng ở mức "lưu được cấu hình", không kiểm được hành vi | Cần môi trường phát thử hoặc quyền truy vấn dữ liệu phân phối — hỏi PO |
| **RISK-04** | 🟠 | **Nhắm sai nhóm tuổi có hậu quả pháp lý** (`AMB-01`) | Quảng cáo không phù hợp tới trẻ em | Ưu tiên cao cho test case của `REQ-FLIGHT-22` và `REQ-FLIGHT-23` |
| **RISK-05** | 🟡 | **Dữ liệu nguồn của dropdown bị ô nhiễm** — `Retarget` lấy từ danh sách nhà quảng cáo, trong đó **4/10 mục là payload tấn công** | Expected Result dễ sai; test dữ liệu rác lẫn dữ liệu thật | Đề nghị dọn dữ liệu staging |

---

## 7. Luồng nghiệp vụ chính

### Luồng 1 — Tạo flight mới

```
1. Mở /campaigns/{id}
2. Bấm "New Flight"
3. NHÓM BASIC INFO
   3.1 Nhập Flight Name
   3.2 Chọn Date Range (bấm + nếu cần nhiều khoảng)
   3.3 Bật/tắt Activated       (mặc định tắt)
   3.4 Chọn Publishers          (chọn một)
   3.5 Chọn Web Apps            (chọn nhiều)
4. NHÓM DELIVERY & PRICING
   4.1 Chọn Source Type         (mặc định Internal)
   4.2 Nhập Weight
   4.3 Nhập Ad Frequency + Minutes
   4.4 Chọn Booking Type        (mặc định Impression)
   4.5 Nhập Daily Booking, Total Booking
   4.6 Nhập Price (VND)         (tuỳ chọn)
5. NHÓM TARGETING   — 12 chiều, đều tuỳ chọn
6. NHÓM ADVANCED    — 5 chiều, đều tuỳ chọn
7. Bấm "Create"
```

### Luồng 2 — Lọc flight theo trạng thái

```
1. Mở /campaigns/{id}
2. Chọn "Filter by status" → Activated hoặc Inactive
3. Danh sách flight thu hẹp theo lựa chọn
```

---

## 8. Phân rã Epic / Story

Module có **40 REQ** (≥ 25) → bắt buộc phân rã.

| Story ID | Tên Story | REQ bao phủ | Số REQ |
|---|---|---|---|
| STORY-FLIGHT-01 | Xem và lọc flight | REQ-FLIGHT-01 · 02 · 03 · 33 · 34 | 5 |
| STORY-FLIGHT-02 | Thông tin cơ bản của flight | REQ-FLIGHT-04 · 05 · 06 · 07 · 08 · 15 | 6 |
| STORY-FLIGHT-03 | Phân phối và giá | REQ-FLIGHT-09 · 10 · 11 · 12 · 13 · 14 | 6 |
| STORY-FLIGHT-04 | Nhắm mục tiêu theo thời gian và nội dung | REQ-FLIGHT-16 · 17 · 18 · 19 · 20 · 21 | 6 |
| STORY-FLIGHT-05 | Nhắm mục tiêu theo người xem | REQ-FLIGHT-22 · 23 · 24 · 25 · 26 · 27 · 32 | 7 |
| STORY-FLIGHT-06 | Nhắm mục tiêu theo thiết bị và vị trí | REQ-FLIGHT-28 · 29 · 30 · 31 | 4 |
| STORY-FLIGHT-07 | Đặc tả giao diện web | REQ-FLIGHT-35 → REQ-FLIGHT-40 | 6 |

**Kiểm chứng:** 5 + 6 + 6 + 6 + 7 + 4 + 6 = **40** ✅ khớp tổng số REQ · mỗi REQ thuộc đúng 1 Story · không REQ nào mồ côi.

### Thứ tự triển khai đề xuất

`STORY-FLIGHT-01` (xem) → `STORY-FLIGHT-07` (giao diện) → `STORY-FLIGHT-02` (thông tin cơ bản) → `STORY-FLIGHT-03` (phân phối, liên quan tiền) → **`STORY-FLIGHT-05`** (nhắm theo người xem — **ưu tiên cao vì `RISK-04`**) → `STORY-FLIGHT-06` → `STORY-FLIGHT-04`.

---

## Bản đồ tài liệu

| File | Nội dung | Dải REQ |
|---|---|---|
| `requirements_flight.md` *(file này)* | Tổng quan · REQ nghiệp vụ · phân quyền · trạng thái · AMB/RISK · luồng · Epic/Story · nhật ký | `REQ-FLIGHT-01` → `REQ-FLIGHT-34` |
| [web/requirements_flight_web.md](web/requirements_flight_web.md) | Field Spec 30 trường · validation nguyên văn · đặc tả giao diện · ghi chú automation · danh mục evidence | `REQ-FLIGHT-35` → `REQ-FLIGHT-40` |

---

## 9. Nhật ký thay đổi

| Ngày | Thay đổi | REQ ảnh hưởng | TC cần xử lý | Nguồn |
|---|---|---|---|---|
| 2026-09-15 | **Phát hành lần đầu.** Sinh 40 REQ · 9 AMB · 5 RISK từ khảo sát UI, tầng network và dữ liệu 21 flight của campaign 1188 | Toàn bộ | Viết mới | `/generate-requirements-from-website FLIGHT` |
