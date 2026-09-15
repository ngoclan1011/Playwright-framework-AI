# Yêu cầu mặt Web — Module Flight (`FLIGHT`)

> ⬅️ Index: [`../requirements_flight.md`](../requirements_flight.md)
> File này chứa **Field Spec · thông báo validation nguyên văn · yêu cầu chỉ áp cho giao diện web**.

| Mục | Giá trị |
|---|---|
| **Dải REQ của file này** | `REQ-FLIGHT-35` → `REQ-FLIGHT-40` |
| **Trình duyệt khảo sát** | Google Chrome (Playwright MCP), viewport `1600×750` |
| **Ngôn ngữ khảo sát** | `en_US` — xem `AMB-09` ở index |
| **Ngày khảo sát** | 2026-09-15 |

---

## 1. Field Spec — Form `Create Flight`

Form là modal, chia **4 nhóm gập/mở được**, tổng **30 trường** (29 form item + `Minutes` là trường ghép — xem mục 3).

### Nhóm `BASIC INFO`

| # | Nhãn | Kiểu | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|---|
| 1 | `Flight Name` | text | ✅ | — | Không có `maxlength` |
| 2 | `Date Range` | DateRangePicker (2 ô) | ✅ | — | Có nút `+` thêm khoảng · nút `−` bớt khoảng |
| 3 | `Activated` | switch | ❌ | **tắt** | |
| 4 | `Publishers` | select **đơn** | ✅ | — | Tên số nhiều nhưng chỉ chọn được **một** |
| 5 | `Web Apps` | select **nhiều** | ✅ | — | Placeholder `Click to select web apps...` |

### Nhóm `DELIVERY & PRICING`

| # | Nhãn | Kiểu | Bắt buộc | Mặc định | Ghi chú |
|---|---|---|---|---|---|
| 6 | `Source Type` | select đơn | ❌ | `Internal` | 2 giá trị: `Internal` · `ORTB` |
| 7 | `Weight` | text | ✅ | — | Không có ràng buộc số ở phía giao diện |
| 8 | `Ad Frequency` | text | ✅ | — | Nhãn viết `*Ad Frequency` — dấu sao **nằm trong text** |
| 9 | `Minutes` | text | ✅ | `0` | Nhãn viết `*Minutes`. **Trường ghép** với `Ad Frequency` |
| 10 | `Booking Type` | radio, 3 lựa chọn | ✅ | **`Impression`** | `Impression` · `Click` · `Complete View` |
| 11 | `Daily Booking` | text | ✅ | — | |
| 12 | `Total Booking` | text | ✅ | — | |
| 13 | `Price (VND)` | text | ❌ | — | |

### Nhóm `TARGETING` — 12 chiều, **tất cả đều tuỳ chọn**

| # | Nhãn | Kiểu | Giá trị / nguồn dữ liệu |
|---|---|---|---|
| 14 | `Hours` | Bộ chọn giờ riêng | Placeholder `Choose hours` |
| 15 | `Days of Week` | select nhiều | 7 giá trị: `Sun` `Mon` `Tue` `Wed` `Thu` `Fri` `Sat` |
| 16 | `Pages` | select nhiều | `GET /api/pages-key?activated=1&limit=500` |
| 17 | `Source Providers` | select nhiều | `GET /api/source-providers?activated=1&limit=1000` |
| 18 | `Categories` | select nhiều | `GET /api/categories?limit=1000` |
| 19 | `Contents` | **Ô nhập tag** | `Type and press Enter to add tags` + nút `Use import file` |
| 20 | `Profile Type` | select đơn | 2 giá trị: `Normal` · `Kid` |
| 21 | `Profile Maturity` | select đơn | 4 giá trị: `Children (Under 13)` · `Teenagers (Under 16)` · `Teens (16 to Under 18)` · `Adults (18+)` |
| 22 | `User IDs` | select nhiều | — |
| 23 | `ISPs` | select nhiều | — |
| 24 | `User Groups` | select nhiều | — |
| 25 | `User Segments` | select nhiều | `GET /api/user-segment?limit=1000&synced=1` |

### Nhóm `ADVANCED` — 5 chiều, **tất cả đều tuỳ chọn**

| # | Nhãn | Kiểu | Giá trị / nguồn dữ liệu |
|---|---|---|---|
| 26 | `Device Types` | select nhiều | 4 giá trị: `SMART-TV` · `SMARTPHONE-TABLET` · `PC` · `BOX` |
| 27 | `Brands` | select nhiều | Theo `GET /api/config?key=device_types` |
| 28 | `Devices` | Bộ chọn riêng | Mặc định hiển thị `All devices` |
| 29 | `Location` | select nhiều | `GET /api/provinces?limit=1000` |
| 30 | `Retarget` | select đơn | Danh sách **nhà quảng cáo** (10 mục) |

> ⚠️ **Không trường nào có `maxlength` · `minlength` · `pattern`.** Bốn trường số (`Weight`, `Ad Frequency`, `Minutes`, `Daily/Total Booking`, `Price`) đều là `input[type=text]`, **không phải `type=number`** → không có ràng buộc số ở phía giao diện.

---

## 2. Thông báo validation — nguyên văn từ giao diện

Thu được bằng cách bấm `Create` trên form trống. **8 thông báo hiện cùng lúc.**

| Trường | Thông báo nguyên văn |
|---|---|
| `Flight Name` | `Name is required` |
| `Date Range` | `Date range is required` |
| `Publishers` | `Publisher is required` |
| `Web Apps` | `Webapps is required` |
| `Weight` | `Weight is required` |
| `Ad Frequency` | `Ad Frequency is required` |
| `Daily Booking` | `Daily booking is required` |
| `Total Booking` | `Total booking is required` |

`Booking Type` **không** báo lỗi vì đã có `Impression` chọn sẵn.

### ⚠️ Bốn điểm không nhất quán

| Vấn đề | Chi tiết |
|---|---|
| **Nhãn ≠ thông báo** | `Flight Name` → `Name is required` · `Publishers` (số nhiều) → `Publisher is required` (số ít) · `Web Apps` (2 từ) → `Webapps is required` (1 từ) |
| **Không thống nhất viết hoa** | `Ad Frequency is required` (Title Case) vs `Daily booking is required` (sentence case) |
| **`Minutes` bắt buộc nhưng không có thông báo lỗi** | Trường có dấu `*`, hiển thị **viền đỏ** khi submit thiếu, nhưng **không có dòng chữ đỏ** giải thích như 8 trường kia |
| **Dấu sao viết thủ công** | `Ad Frequency` và `Minutes` có dấu `*` **gắn vào text nhãn** (`*Ad Frequency`), không dùng cơ chế `required` chuẩn của thư viện giao diện như các trường khác |

---

## 3. Yêu cầu chức năng — chỉ áp cho giao diện web

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Nguồn |
|---|---|---|---|---|---|
| REQ-FLIGHT-35 | Form chia bốn nhóm gập/mở | Giảm tải thị giác cho form 30 trường | Form hiện 4 tiêu đề nhóm: `BASIC INFO` · `DELIVERY & PRICING` · `TARGETING` · `ADVANCED`, mỗi nhóm có mũi tên gập/mở | 🟢 | UI thực tế |
| REQ-FLIGHT-36 | Hiện đồng thời mọi lỗi thiếu trường | Người dùng sửa một lượt | Bấm `Create` trên form trống → **8 thông báo hiện cùng lúc** ở 8 trường tương ứng | 🟢 | UI thực tế |
| REQ-FLIGHT-37 | Thêm/bớt khoảng thời gian chạy | Một flight chạy nhiều đợt | Nút `+` cạnh `Date Range` thêm một khoảng mới; nút `−` bớt khoảng | 🟢 | UI thực tế |
| REQ-FLIGHT-38 | Giá trị mặc định an toàn | Tránh cấu hình ngoài ý muốn | `Activated` tắt · `Source Type` = `Internal` · `Booking Type` = `Impression` · `Minutes` = `0` · `Devices` = `All devices` | 🟢 | DOM |
| REQ-FLIGHT-39 | Nhập danh sách nội dung bằng tay hoặc từ file | Danh sách nội dung có thể rất dài | `Contents` nhận tag bằng cách gõ rồi `Enter`; có nút `Use import file` để nhập hàng loạt | 🟢 | DOM |
| REQ-FLIGHT-40 | 🔴 Trường `Minutes` thiếu thông báo lỗi và thiếu liên kết nhãn | — | ⚠️ **Hiện là khiếm khuyết**: nhãn `*Minutes` **không có thuộc tính `for`** → không liên kết với ô nhập; khi thiếu dữ liệu chỉ đổi viền đỏ mà **không có thông báo**. Ảnh hưởng người dùng screen reader và automation | 🟡 | DOM |

---

## 4. Ghi chú kỹ thuật cho automation

| Vấn đề | Chi tiết | Cách tránh |
|---|---|---|
| **Nhãn `Minutes` không có `for`** | Không dùng được `getByLabel('Minutes')` | Định vị theo vị trí tương đối với `Ad Frequency`, hoặc yêu cầu dev bổ sung `for`/`data-testid` |
| **Dấu sao nằm trong text nhãn** | `*Ad Frequency` — nếu locator khớp chính xác `'Ad Frequency'` sẽ **không match** | Dùng khớp chứa (`hasText`) thay vì khớp tuyệt đối |
| **Trường số là `type=text`** | Không kiểm được bằng ràng buộc số của trình duyệt | Test giá trị âm, chữ, số thập phân, số rất lớn — đều phải làm thủ công |
| **Select cần sự kiện chuột thật** | Component Ant Design không phản hồi `click()` gọi bằng JavaScript thuần | Dùng API click của Playwright |
| **ID trùng lặp và modal cũ chặn click** | Vấn đề chung toàn hệ thống — xem `web/requirements_camp_web.md` mục 4 của module `CAMP` | Tải lại trang giữa các kịch bản; khoanh locator trong modal đang hiển thị |
| **Không có `data-testid`** | Toàn bộ form không có thuộc tính dành riêng cho test | Ưu tiên `getByRole` theo `playwright_rules.md` |

---

## 5. Danh mục Evidence

| Ảnh | Chứng minh điều gì | REQ liên quan |
|---|---|---|
| [`evidence/flight_create_validation.png`](evidence/flight_create_validation.png) | Form `Create Flight` sau khi bấm `Create` khi trống — thấy **4 nhóm**, **8 thông báo validation**, `Booking Type` mặc định `Impression`, `Activated` tắt, `Source Type` = `Internal`, `Minutes` = `0` **viền đỏ nhưng không có thông báo**, nút `+` và `−` ở `Date Range` | REQ-FLIGHT-35 · 36 · 37 · 38 · 40 · toàn bộ mục 2 |

> Ảnh đã được mở lại xác nhận đúng trạng thái trước khi ghi vào danh mục này.
> Chụp **phạm vi viewport**, không full-page.
