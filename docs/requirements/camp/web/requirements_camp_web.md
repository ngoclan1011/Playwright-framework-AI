# Yêu cầu mặt Web — Module Chiến dịch (`CAMP`)

> ⬅️ Index: [`../requirements_camp.md`](../requirements_camp.md)
> File này chứa **Field Spec · thông báo validation nguyên văn · yêu cầu chỉ áp cho giao diện web**.
> Quy tắc nghiệp vụ (đúng với mọi nền tảng) nằm ở index.

| Mục | Giá trị |
|---|---|
| **Dải REQ của file này** | `REQ-CAMP-28` → `REQ-CAMP-38` |
| **Trình duyệt khảo sát** | Google Chrome (Playwright MCP), viewport `1600×750`. Mọi AC dựa trên thông báo mặc định của trình duyệt **chỉ đúng với trình duyệt này** |
| **Ngôn ngữ khảo sát** | `en_US`. Hệ thống có thêm `Việt Nam` — xem `AMB-10` ở index |
| **Ngày khảo sát** | 2026-09-15 |

---

## 1. Field Spec — Form `Create Campaign`

Form là modal, 9 trường, **7 bắt buộc**.

| # | Nhãn hiển thị | Kiểu | Bắt buộc | Placeholder | Ràng buộc quan sát được | REQ liên quan |
|---|---|---|---|---|---|---|
| 1 | `Campaign Name` | `input[type=text]` | ✅ | `Enter campaign name` | **Không** có `maxlength` · `minlength` · `pattern` | REQ-CAMP-28 |
| 2 | `Advertiser` | Select (có ô tìm) | ✅ | `Select advertiser` | 10 mục · nguồn `GET /api/accounts?model=advertiser&limit=1000` | REQ-CAMP-29 |
| 3 | `Contract` | Select (có ô tìm) | ✅ | `Select contract` | Mỗi mục hiển thị **mã + trạng thái**. Mục `Expired` bị `disabled` | REQ-CAMP-30 |
| 4 | `CMS Campaign` | Select (có ô tìm) | ✅ | `Select CMS campaign` | **Khoá** tới khi chọn Contract. Mục `Inactive` bị `disabled` | REQ-CAMP-31 |
| 5 | `Start Date` | DatePicker | ✅ | `Select date` | Định dạng nhập `DD/MM/YYYY` | REQ-CAMP-32 |
| 6 | `End Date` | DatePicker | ✅ | `Select date` | Lịch **khoá mọi ngày trước `Start Date`** | REQ-CAMP-33 |
| 7 | `Description` | `input[type=text]` | ❌ | `Enter description` | **Một dòng**, không phải `textarea`. Không có `maxlength` | REQ-CAMP-34 |
| 8 | `Type` | Radio, 3 lựa chọn | ✅ | — | `VOD` · `Display` · `LiveTV`. **Không có giá trị chọn sẵn** | REQ-CAMP-35 |
| 9 | `Status` | Switch | ❌ | — | Mặc định **tắt**, nhãn `Inactive` | REQ-CAMP-36 |

Nút cuối form: `Cancel` · `OK`.

> ⚠️ **Không trường nào có ràng buộc độ dài/định dạng ở phía giao diện.** Toàn bộ việc kiểm tra phụ thuộc server — mà hiện chưa xác minh được vì chức năng tạo đang lỗi (`AMB-01`, `AMB-09` ở index).

---

## 2. Thông báo validation — nguyên văn từ giao diện

Thu được bằng cách bấm `OK` trên form trống. **Cả 7 thông báo hiện cùng lúc**, ngay dưới trường tương ứng, chữ màu đỏ.

| Trường | Thông báo nguyên văn |
|---|---|
| `Campaign Name` | `Name is required` |
| `Advertiser` | `Advertiser is required` |
| `Contract` | `Contract is required` |
| `CMS Campaign` | `CMS Campaign is required` |
| `Start Date` | `Start date is required` |
| `End Date` | `End date is required` |
| `Type` | `Type is required` |

### ⚠️ Ba điểm không nhất quán trong cách viết thông báo

| Vấn đề | Chi tiết |
|---|---|
| **Nhãn ≠ thông báo** | Nhãn là `Campaign Name` nhưng thông báo nói `Name is required` |
| **Không thống nhất kiểu viết hoa** | `CMS Campaign is required` (Title Case) vs `Start date is required` (sentence case) |
| **Thông báo sai bản chất lỗi** | Nhập End Date **trước** Start Date → ô không nhận giá trị và báo `End date is required`, thay vì nói rõ ngày kết thúc phải sau ngày bắt đầu. Người dùng thấy thông báo "chưa nhập" trong khi họ **đã nhập** |

---

## 3. Yêu cầu chức năng — chỉ áp cho giao diện web

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Trạng thái | Nguồn |
|---|---|---|---|---|---|
| REQ-CAMP-28 | Ô nhập tên chiến dịch | Nhập tên tự do | `input[type=text]`, placeholder `Enter campaign name`, bắt buộc, không giới hạn độ dài phía giao diện | 🟢 | DOM |
| REQ-CAMP-29 | Chọn nhà quảng cáo có tìm kiếm | Select cho phép gõ để lọc | Select dạng `search`, nạp 10 mục từ API khi mở form | 🟢 | DOM · network |
| REQ-CAMP-30 | Hợp đồng hiển thị kèm trạng thái và khoá mục hết hạn | Người dùng thấy ngay hợp đồng nào dùng được | Mỗi mục hiện `<mã hợp đồng>` + nhãn `Approved`/`Expired`. Mục `Expired` có class `ant-select-item-option-disabled`, không chọn được | 🟢 | DOM |
| REQ-CAMP-31 | CMS Campaign hiển thị kèm trạng thái và khoá mục ngừng hoạt động | Như trên, áp cho CMS Campaign | Mỗi mục hiện `<tên>` + nhãn `Active`/`Inactive`. Mục `Inactive` bị `disabled`. Quan sát thực tế: 9/10 mục bị khoá | 🟢 | DOM |
| REQ-CAMP-32 | Ô ngày nhận nhập tay theo `DD/MM/YYYY` | Không bắt buộc phải bấm lịch | Gõ `20/10/2026` + `Enter` → nhận giá trị | 🟢 | UI thực tế |
| REQ-CAMP-33 | Lịch ngày kết thúc khoá ngày không hợp lệ | Chặn từ gốc thay vì báo lỗi sau | Start = `20/10/2026` → lịch End khoá đúng `01/10/2026`→`19/10/2026` (19 ngày), mở từ `20/10/2026` | 🟢 | UI thực tế |
| REQ-CAMP-34 | Ô mô tả là ô một dòng | — | `input[type=text]`, không phải `textarea`, không bắt buộc | 🟢 | DOM |
| REQ-CAMP-35 | Loại chiến dịch không có giá trị mặc định | Bắt người dùng chọn có ý thức | Mở form → không radio nào được chọn sẵn; bỏ qua thì báo `Type is required` | 🟢 | DOM |
| REQ-CAMP-36 | Công tắc trạng thái mặc định tắt | — | Mở form → `Status` tắt, nhãn `Inactive` | 🟢 | DOM |
| REQ-CAMP-37 | Hiện đồng thời mọi lỗi thiếu trường | Người dùng sửa một lượt, không phải sửa từng cái | Bấm `OK` trên form trống → **7 thông báo hiện cùng lúc** | 🟢 | UI thực tế |
| REQ-CAMP-38 | 🔴 Form không được đặt lại sau khi đóng | Dữ liệu đã nhập còn nguyên khi mở lại | ⚠️ **Hiện là khiếm khuyết**: đóng modal rồi mở lại → các trường **vẫn giữ giá trị cũ**. Cần PO xác nhận đây là chủ ý hay lỗi | 🟡 | DOM |

---

## 4. Ghi chú kỹ thuật cho automation

> Phần này **không phải yêu cầu hệ thống** — là cảnh báo để bước sinh automation không mất thời gian dò.

| Vấn đề | Chi tiết | Cách tránh |
|---|---|---|
| **ID trùng lặp trong DOM** | Quan sát được **4 phần tử cùng `id="end_date"`** và **2 phần tử cùng `id="name"`** — do modal của các chiến dịch mở trước vẫn còn trong DOM | Không dùng `#id` trần. Luôn khoanh vùng trong modal đang hiển thị |
| **Modal đã đóng vẫn chặn click** | `.ant-modal-wrap` của modal cũ còn lại trong DOM và **chặn sự kiện chuột toàn trang**, kể cả sau khi điều hướng sang route khác | Tải lại trang giữa các kịch bản test |
| **Workspace nhiều tab giữ pane cũ** | Vùng nội dung là hệ thống tab; pane của tab cũ vẫn nằm trong DOM ở trạng thái ẩn | Chỉ thao tác trong pane đang hiển thị (`offsetParent !== null`) |
| **Component Ant Design cần sự kiện chuột thật** | Select và DatePicker không phản hồi với `click()` gọi bằng JavaScript thuần | Dùng API click/fill của Playwright, không dùng `dispatchEvent` |
| **Không có `data-testid` ở bất kỳ đâu** | Toàn bộ form không có thuộc tính dành riêng cho test | Ưu tiên `getByRole` / `getByLabel` theo `playwright_rules.md` |

---

## 5. Danh mục Evidence

| Ảnh | Chứng minh điều gì | REQ liên quan |
|---|---|---|
| [`evidence/camp_create_validation_7_message.png`](evidence/camp_create_validation_7_message.png) | Form `Create Campaign` sau khi bấm `OK` khi trống — thấy **đủ 7 thông báo validation** cùng lúc, `Type` không có radio nào được chọn sẵn, `Status` mặc định `Inactive` | REQ-CAMP-35 · 36 · 37 · toàn bộ mục 2 |
| [`evidence/camp_create_khong_tao_duoc.png`](evidence/camp_create_khong_tao_duoc.png) | Tìm kiếm `QA_AUTO` sau khi submit form hợp lệ → `No data`, chứng minh chiến dịch **không được tạo** | REQ-CAMP-27 · `AMB-01` |

> Mỗi ảnh đã được mở lại xác nhận đúng trạng thái trước khi ghi vào danh mục này.
> Ảnh chụp **phạm vi viewport**, không full-page, để hạn chế đưa dữ liệu nghiệp vụ thật vào repo.
