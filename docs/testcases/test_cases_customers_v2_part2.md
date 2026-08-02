# Manual Test Cases — Module Customers · Part 2: Tạo & sửa khách hàng

| Thông tin | Nội dung |
|---|---|
| Phần | **Part 2/4** — Form tạo/sửa khách hàng + validation từng trường |
| REQ bao phủ | REQ-CUST-14 → REQ-CUST-24, REQ-CUST-26 |
| Số TC | 40 (`CRM_CUST_TC_037` → `CRM_CUST_TC_076`) |
| Index | [test_cases_customers_v2_index.md](test_cases_customers_v2_index.md) — Assumptions, coverage toàn module |
| Nguồn requirement | [requirements_customers.md](../requirements/requirements_customers.md) |
| Phiên bản | 2.0 |

> ⚠️ **Môi trường dùng chung:** mọi khách hàng tạo ra trong Part này phải dùng Company traceable `Auto_Customer_<timestamp>` và **xoá ở bước teardown**.
> 📌 Lỗi validation hiển thị inline trong `<p id="<tên-trường>-error" class="text-danger">`, `.form-group` bao ngoài được thêm class `has-error`.

---

## Nhóm 2.1 — Mở form & bố cục

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_037 | REQ-CUST-14 | Customers | High | Nút "+ New Customer" mở đúng form tạo mới | Đã đăng nhập role Administrator, đang ở `/admin/clients` | 1. Click nút "+ New Customer"<br>2. Chờ trang tải xong<br>3. Đọc URL và tiêu đề trang | — | 1. Trình duyệt điều hướng<br>3. URL là `/admin/clients/client`; tiêu đề trang hiển thị `Add new customer` | High | Yes | UI | @Smoke @CriticalPath |
| CRM_CUST_TC_038 | REQ-CUST-15 | Customers | Medium | Form chia đúng 2 tab | Đang ở `/admin/clients/client` | 1. Đọc danh sách tab trên form<br>2. Kiểm tra tab đang được kích hoạt mặc định | — | 1. Có đúng 2 tab: `Customer Details` (`#contact_info`) và `Billing & Shipping` (`#billing_and_shipping`)<br>2. Tab `Customer Details` được kích hoạt mặc định | Medium | Yes | UI | @Smoke @Regression |
| CRM_CUST_TC_039 | REQ-CUST-15 | Customers | Medium | Chuyển tab không làm mất dữ liệu đã nhập | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700460`<br>2. Click sang tab `Billing & Shipping`<br>3. Nhập Billing City: `Da Nang`<br>4. Click quay lại tab `Customer Details`<br>5. Đọc giá trị ô Company | Company: `Auto_Customer_1785700460`<br>Billing City: `Da Nang` | 2. Nội dung tab Billing hiển thị<br>4. Nội dung tab Customer Details hiển thị lại<br>5. Ô Company vẫn giữ nguyên `Auto_Customer_1785700460` — không bị xoá khi chuyển tab | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_040 | REQ-CUST-19 | Customers | Medium | Nút "Save and create contact" tồn tại cạnh nút Save | Đang ở `/admin/clients/client` | 1. Cuộn xuống cuối form<br>2. Đọc các nút hành động | — | 2. Có nút `Save` (`button.only-save`) và nút `Save and create contact` (`button.save-and-add-contact`) đặt cạnh nhau | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_041 | REQ-CUST-19 | Customers | High | "Save and create contact" lưu khách hàng rồi mở luôn modal liên hệ | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700461`<br>2. Click nút `Save and create contact`<br>3. Chờ trang xử lý xong<br>4. Đọc URL và trạng thái modal | Company: `Auto_Customer_1785700461` | 2. Form submit<br>3. Trang chuyển tới `/admin/clients/client/{id}`<br>4. Modal `#contact` (`Add new contact`) tự động mở ra, hiển thị tên khách hàng vừa tạo | High | Yes | UI | @CriticalPath @Regression |

---

## Nhóm 2.2 — Trường Company (bắt buộc, kiểu Text)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_042 | REQ-CUST-16 | Customers | Critical | Bỏ trống Company hiển thị lỗi bắt buộc và chặn submit | Đang ở `/admin/clients/client` | 1. Để trống ô Company<br>2. Click nút `Save`<br>3. Đọc thông báo lỗi và URL hiện tại | Company: (rỗng) | 2. Form KHÔNG submit<br>3. Hiện lỗi inline `This field is required.` trong `#company-error`; `.form-group` của Company có class `has-error`; URL vẫn là `/admin/clients/client` | Critical | Yes | UI | @Smoke @CriticalPath @Negative |
| CRM_CUST_TC_043 | REQ-CUST-16 | Customers | High | Company chỉ chứa khoảng trắng bị coi là rỗng | Đang ở `/admin/clients/client` | 1. Nhập 5 dấu cách liên tiếp vào ô Company<br>2. Click nút `Save`<br>3. Đọc thông báo lỗi hoặc kết quả | Company: `     ` (5 dấu cách) | 2. Form xử lý submit<br>3. Hệ thống hiện lỗi `This field is required.` (chuỗi khoảng trắng bị trim thành rỗng). Nếu hệ thống tạo được khách hàng tên rỗng → **FAIL**, mở bug thiếu validation trim | High | Yes | UI | @Negative @Regression |
| CRM_CUST_TC_044 | REQ-CUST-17 | Customers | Critical | Tạo khách hàng thành công với Company hợp lệ | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700462`<br>2. Click nút `Save`<br>3. Chờ trang xử lý xong<br>4. Đọc URL và tiêu đề trang chi tiết | Company: `Auto_Customer_1785700462` | 2. Form submit không báo lỗi<br>3. Trang chuyển hướng<br>4. URL có dạng `/admin/clients/client/{id}` với `{id}` là số; tiêu đề trang bằng `Auto_Customer_1785700462` | Critical | Yes | UI | @Smoke @CriticalPath |
| CRM_CUST_TC_045 | REQ-CUST-18 | Customers | High | Cho phép tạo hai khách hàng trùng tên Company | Đã tồn tại `Auto_Customer_1785700462` (ID1 đã biết) | 1. Mở `/admin/clients/client`<br>2. Nhập Company đúng y hệt: `Auto_Customer_1785700462`<br>3. Click `Save`<br>4. Đọc URL và so sánh ID với ID1 | Company: `Auto_Customer_1785700462` (trùng) | 3. Tạo thành công, KHÔNG có cảnh báo trùng tên<br>4. URL có `{id}` khác ID1 — hai bản ghi độc lập cùng tên (hành vi đúng theo ASM-02) | High | Yes | UI | @Regression |
| CRM_CUST_TC_046 | REQ-CUST-17 | Customers | Medium | Company chứa ký tự đặc biệt được lưu nguyên văn | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700463 <>&"'`<br>2. Click `Save`<br>3. Đọc tiêu đề trang chi tiết<br>4. Mở lại form sửa, đọc giá trị ô Company | Company: `Auto_Customer_1785700463 <>&"'` | 2. Tạo thành công<br>3. Tiêu đề hiển thị đúng chuỗi gồm cả ký tự đặc biệt, không bị cắt<br>4. Ô Company chứa đúng chuỗi đã nhập, không bị mã hoá thành `&lt;&gt;` khi hiển thị lại | Medium | Yes | UI | @Regression @Boundary |
| CRM_CUST_TC_047 | REQ-CUST-17 | Customers | High | Company chứa mã XSS không được thực thi | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_1785700464<script>alert(1)</script>`<br>2. Click `Save`<br>3. Quan sát trang chi tiết sau khi lưu<br>4. Mở `/admin/clients` và tìm bản ghi này | Company: `Auto_1785700464<script>alert(1)</script>` | 2. Form submit<br>3. KHÔNG có hộp thoại alert nào bật lên; chuỗi hiển thị dưới dạng văn bản thuần trên tiêu đề trang<br>4. Trong danh sách, chuỗi cũng hiển thị dạng văn bản thuần, không thực thi script | High | Yes | UI | @Security @CriticalPath |
| CRM_CUST_TC_048 | REQ-CUST-17 | Customers | High | Company chứa chuỗi SQL injection được lưu như văn bản | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_1785700465' OR 1=1--`<br>2. Click `Save`<br>3. Quan sát phản hồi và mã HTTP<br>4. Mở `/admin/clients`, đọc `Total Customers` | Company: `Auto_1785700465' OR 1=1--` | 2. Form submit<br>3. Không lỗi 500, không hiện thông báo lỗi cơ sở dữ liệu; phản hồi HTTP 200/302<br>4. `Total Customers` chỉ tăng đúng 1 — chuỗi được xử lý như dữ liệu, không thực thi SQL | High | Yes | UI | @Security @Regression |
| CRM_CUST_TC_049 | REQ-CUST-17 | Customers | Medium | Company chứa tiếng Việt có dấu được lưu đúng encoding | Đang ở `/admin/clients/client` | 1. Nhập Company: `Công ty Ứng Dụng Số 1785700466`<br>2. Click `Save`<br>3. Đọc tiêu đề trang chi tiết<br>4. Tải lại trang và đọc lại tiêu đề | Company: `Công ty Ứng Dụng Số 1785700466` | 2. Tạo thành công<br>3. Tiêu đề hiển thị đúng đủ dấu tiếng Việt, không bị lỗi font hay dấu hỏi<br>4. Sau khi tải lại vẫn hiển thị đúng — dữ liệu lưu chuẩn UTF-8 | Medium | Yes | UI | @Localization @Regression |
| CRM_CUST_TC_050 | REQ-CUST-17 | Customers | Low | Company chứa emoji được lưu và hiển thị đúng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700467 🚀😀`<br>2. Click `Save`<br>3. Đọc tiêu đề trang chi tiết<br>4. Tìm bản ghi này tại `/admin/clients` | Company: `Auto_Customer_1785700467 🚀😀` | 2. Không lỗi 500 khi submit<br>3. Emoji hiển thị đúng trên tiêu đề (không thành ký tự lạ hoặc dấu `?`)<br>4. Emoji hiển thị đúng trong cột Company của danh sách | Low | Yes | UI | @Localization @Boundary |
| CRM_CUST_TC_051 | REQ-CUST-17 | Customers | Medium | Company có khoảng trắng đầu/cuối — ghi nhận hành vi trim | Đang ở `/admin/clients/client` | 1. Nhập Company: `  Auto_Customer_1785700468  ` (2 dấu cách mỗi đầu)<br>2. Click `Save`<br>3. Đọc tiêu đề trang chi tiết<br>4. Tìm kiếm `Auto_Customer_1785700468` tại danh sách | Company: `  Auto_Customer_1785700468  ` | 2. Tạo thành công<br>3. Ghi nhận hành vi: tiêu đề hiển thị có hoặc không có khoảng trắng thừa<br>4. Tìm kiếm bằng chuỗi đã trim vẫn tìm thấy bản ghi | Medium | Yes | UI | @Boundary @Regression |
| CRM_CUST_TC_052 | REQ-CUST-17 | Customers | Medium | Company 255 ký tự (biên trên giả định) được chấp nhận | Đang ở `/admin/clients/client`. **Chạy thủ công 1 lần**, không đưa vào regression tự động (ASM-04) | 1. Nhập Company gồm đúng 255 ký tự bắt đầu bằng `Auto_1785700469_` và đệm ký tự `A`<br>2. Click `Save`<br>3. Đọc URL kết quả<br>4. Mở lại form sửa, đếm độ dài giá trị ô Company | Company: `Auto_1785700469_` + 239 ký tự `A` = 255 ký tự | 2. Form submit<br>3. Tạo thành công, chuyển tới `/admin/clients/client/{id}`<br>4. Giá trị lưu lại đủ 255 ký tự, không bị cắt | Medium | No | N/A | @Boundary @ManualOnly |
| CRM_CUST_TC_053 | REQ-CUST-17 | Customers | Medium | Company 256 ký tự (vượt biên giả định) — ghi nhận hành vi | Đang ở `/admin/clients/client`. **Chạy thủ công 1 lần** (ASM-04) | 1. Nhập Company gồm đúng 256 ký tự bắt đầu bằng `Auto_1785700470_`<br>2. Click `Save`<br>3. Quan sát phản hồi<br>4. Nếu tạo thành công, mở lại form sửa và đếm độ dài giá trị đã lưu | Company: `Auto_1785700470_` + 240 ký tự `A` = 256 ký tự | 2. Form submit<br>3. Hệ thống KHÔNG trả lỗi 500<br>4. Ghi nhận: nếu giá trị bị cắt còn 255 ký tự mà không cảnh báo → mở bug "cắt dữ liệu âm thầm"; nếu lưu đủ 256 → cập nhật lại ASM-04 | Medium | No | N/A | @Boundary @ManualOnly |

---

## Nhóm 2.3 — Trường VAT Number

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_054 | REQ-CUST-17 | Customers | Low | Bỏ trống VAT Number vẫn lưu được khách hàng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700471`<br>2. Để trống ô VAT Number<br>3. Click `Save`<br>4. Đọc URL kết quả | Company: `Auto_Customer_1785700471`<br>VAT: (rỗng) | 3. Form submit, không có lỗi inline nào dưới ô VAT<br>4. Tạo thành công, chuyển tới trang chi tiết — VAT là trường tuỳ chọn | Low | Yes | UI | @Regression |
| CRM_CUST_TC_055 | REQ-CUST-17 | Customers | Low | VAT Number chấp nhận chuỗi chữ lẫn số | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700472`<br>2. Nhập VAT Number: `VN-0312345678-ABC`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị ô VAT Number | Company: `Auto_Customer_1785700472`<br>VAT: `VN-0312345678-ABC` | 3. Tạo thành công, không có lỗi định dạng (theo ASM-03 trường này không ràng buộc)<br>4. Ô VAT hiển thị đúng nguyên văn `VN-0312345678-ABC` | Low | Yes | UI | @Regression |

---

## Nhóm 2.4 — Trường Phone

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_056 | REQ-CUST-17 | Customers | Medium | Phone nhập số hợp lệ được lưu nguyên văn | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700473`<br>2. Nhập Phone: `+84901234567`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị ô Phone | Company: `Auto_Customer_1785700473`<br>Phone: `+84901234567` | 3. Tạo thành công, không lỗi<br>4. Ô Phone hiển thị đúng `+84901234567` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_057 | REQ-CUST-17 | Customers | Medium | Phone nhập chữ cái được chấp nhận (không có ràng buộc định dạng) | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700474`<br>2. Nhập Phone: `khong-phai-so-dien-thoai`<br>3. Click `Save`<br>4. Đọc kết quả và giá trị đã lưu | Company: `Auto_Customer_1785700474`<br>Phone: `khong-phai-so-dien-thoai` | 3. Theo ASM-03: form submit thành công, KHÔNG hiện lỗi định dạng<br>4. Giá trị được lưu nguyên văn. Nếu hệ thống báo lỗi định dạng → cập nhật lại ASM-03 và AMB-03 | Medium | Yes | UI | @Regression @Negative |
| CRM_CUST_TC_058 | REQ-CUST-17 | Customers | Low | Phone chứa ký tự phân cách và khoảng trắng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700475`<br>2. Nhập Phone: `(028) 3812.3456 ext 99`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị ô Phone | Company: `Auto_Customer_1785700475`<br>Phone: `(028) 3812.3456 ext 99` | 3. Tạo thành công, không lỗi<br>4. Giá trị lưu đúng nguyên văn kể cả dấu ngoặc, dấu chấm và khoảng trắng | Low | Yes | UI | @Regression @Boundary |

---

## Nhóm 2.5 — Trường Website

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_059 | REQ-CUST-17 | Customers | Low | Website nhập URL hợp lệ được lưu đúng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700476`<br>2. Nhập Website: `https://anhtester.com`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị ô Website | Company: `Auto_Customer_1785700476`<br>Website: `https://anhtester.com` | 3. Tạo thành công<br>4. Ô Website hiển thị đúng `https://anhtester.com` | Low | Yes | UI | @Regression |
| CRM_CUST_TC_060 | REQ-CUST-17 | Customers | Low | Website nhập chuỗi không phải URL được chấp nhận | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700477`<br>2. Nhập Website: `day khong phai url`<br>3. Click `Save`<br>4. Đọc kết quả | Company: `Auto_Customer_1785700477`<br>Website: `day khong phai url` | 3. Theo ASM-03: submit thành công, KHÔNG hiện lỗi định dạng URL<br>4. Giá trị lưu nguyên văn. Nếu báo lỗi → cập nhật ASM-03 | Low | Yes | UI | @Regression @Negative |

---

## Nhóm 2.6 — Trường Groups (Multi-select)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_061 | REQ-CUST-20 | Customers | Medium | Dropdown Groups có ô tìm kiếm và nút Select All/Deselect All | Đang ở `/admin/clients/client` | 1. Click mở dropdown `groups_in[]`<br>2. Quan sát các thành phần trong dropdown | — | 2. Dropdown mở ra có: ô tìm kiếm ở đầu, nút `Select All` và `Deselect All`, danh sách nhóm hiện có | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_062 | REQ-CUST-20 | Customers | Medium | Tìm kiếm trong dropdown Groups lọc đúng danh sách | Đã tồn tại nhóm traceable `Auto_Group_1785700478` | 1. Click mở dropdown `groups_in[]`<br>2. Nhập `Auto_Group_1785700478` vào ô tìm kiếm trong dropdown<br>3. Đọc danh sách nhóm còn hiển thị | Từ khoá: `Auto_Group_1785700478` | 2. Danh sách nhóm được lọc theo thời gian thực<br>3. Chỉ còn nhóm khớp từ khoá, các nhóm khác bị ẩn | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_063 | REQ-CUST-20 | Customers | High | Chọn 1 nhóm theo value (ID) và lưu thành công | Đã tồn tại nhóm `Auto_Group_1785700478` với ID nhóm đã biết | 1. Nhập Company: `Auto_Customer_1785700479`<br>2. Mở dropdown Groups, chọn nhóm theo `value` = ID của `Auto_Group_1785700478` (KHÔNG chọn theo nhãn — RISK-08)<br>3. Click `Save`<br>4. Mở lại form sửa, đọc các nhóm đang được chọn | Company: `Auto_Customer_1785700479`<br>Group: chọn theo `value` = ID nhóm | 2. Nhóm được đánh dấu đã chọn trong dropdown<br>3. Tạo thành công<br>4. Đúng nhóm đã chọn ở bước 2 vẫn được đánh dấu (so khớp theo ID, không theo tên) | High | Yes | UI | @CriticalPath @Regression |
| CRM_CUST_TC_064 | REQ-CUST-20 | Customers | Medium | Chọn nhiều nhóm cùng lúc và lưu đúng cả danh sách | Đã tồn tại 2 nhóm traceable với ID đã biết | 1. Nhập Company: `Auto_Customer_1785700480`<br>2. Mở dropdown Groups, chọn 2 nhóm theo `value`<br>3. Click `Save`<br>4. Mở lại form sửa, đếm số nhóm đang được chọn | Company: `Auto_Customer_1785700480`<br>Groups: 2 ID nhóm traceable | 2. Cả 2 nhóm được đánh dấu<br>3. Tạo thành công<br>4. Đúng 2 nhóm đã chọn được đánh dấu, không thừa không thiếu | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_065 | REQ-CUST-21 | Customers | Medium | Modal tạo nhóm mới chặn khi bỏ trống trường Name | Đang ở `/admin/clients/client` | 1. Mở modal tạo nhóm mới từ khu vực Groups<br>2. Để trống ô `* Name`<br>3. Click nút submit của modal<br>4. Đọc thông báo lỗi | Name: (rỗng) | 1. Modal tạo nhóm mở ra<br>3. Modal KHÔNG đóng<br>4. Hiện lỗi inline `This field is required.` dưới ô Name | Medium | Yes | UI | @Negative @Regression |
| CRM_CUST_TC_066 | REQ-CUST-21 | Customers | Medium | Tạo nhóm mới thành công và dùng được ngay trong dropdown | Đang ở `/admin/clients/client` | 1. Mở modal tạo nhóm mới<br>2. Nhập Name: `Auto_Group_1785700481`<br>3. Click submit modal<br>4. Mở dropdown Groups, tìm `Auto_Group_1785700481` | Name: `Auto_Group_1785700481` | 3. Modal đóng lại, request gửi tới `/admin/clients/group` trả HTTP 200<br>4. Nhóm mới xuất hiện trong dropdown và chọn được ngay, không cần tải lại trang | Medium | Yes | UI | @Regression |

---

## Nhóm 2.7 — Currency & Default Language (Dropdown)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_067 | REQ-CUST-22 | Customers | Medium | Dropdown Currency có 3 lựa chọn và mặc định rỗng | Đang ở `/admin/clients/client` | 1. Đọc giá trị đang chọn của `#default_currency`<br>2. Mở dropdown và đọc danh sách option | — | 1. Giá trị mặc định là rỗng (dùng tiền tệ hệ thống)<br>2. Có đúng 3 lựa chọn: rỗng, `USD`, `EUR` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_068 | REQ-CUST-22 | Customers | Medium | Chọn Currency USD được lưu đúng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700482`<br>2. Chọn Currency: `USD`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị `#default_currency` | Company: `Auto_Customer_1785700482`<br>Currency: `USD` | 3. Tạo thành công<br>4. Dropdown Currency vẫn đang chọn `USD` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_069 | REQ-CUST-23 | Customers | Medium | Dropdown Default Language có 27 lựa chọn, mặc định System Default | Đang ở `/admin/clients/client` | 1. Đọc giá trị đang chọn của `#default_language`<br>2. Mở dropdown và đếm số option | — | 1. Giá trị mặc định là `System Default`<br>2. Dropdown có đúng 27 lựa chọn | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_070 | REQ-CUST-23 | Customers | Low | Chọn ngôn ngữ riêng cho khách hàng được lưu đúng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700483`<br>2. Chọn Default Language: `vietnamese`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị `#default_language` | Company: `Auto_Customer_1785700483`<br>Language: `vietnamese` | 3. Tạo thành công<br>4. Dropdown Language vẫn đang chọn `vietnamese` | Low | Yes | UI | @Regression |

---

## Nhóm 2.8 — Country (Dropdown có tìm kiếm)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_071 | REQ-CUST-24 | Customers | Medium | Dropdown Country có 251 lựa chọn kèm ô tìm kiếm | Đang ở `/admin/clients/client` | 1. Click mở dropdown `#country`<br>2. Đếm số option và quan sát ô tìm kiếm | — | 2. Dropdown có đúng 251 lựa chọn và có ô tìm kiếm ở đầu danh sách; giá trị mặc định là rỗng | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_072 | REQ-CUST-24 | Customers | Medium | Tìm và chọn quốc gia từ danh mục được lưu đúng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700484`<br>2. Mở dropdown Country, gõ `Viet` vào ô tìm kiếm<br>3. Chọn `Vietnam` từ kết quả lọc<br>4. Click `Save`<br>5. Mở lại form sửa, đọc giá trị `#country` | Company: `Auto_Customer_1785700484`<br>Country: `Vietnam` | 2. Danh sách lọc còn các mục khớp `Viet`<br>3. `Vietnam` được đánh dấu đã chọn<br>4. Tạo thành công<br>5. Dropdown Country vẫn đang chọn `Vietnam` | Medium | Yes | UI | @Regression |

---

## Nhóm 2.9 — Address, City, State, Zip Code

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_073 | REQ-CUST-17 | Customers | Low | Address (textarea) lưu đúng nội dung nhiều dòng | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700485`<br>2. Nhập Address gồm 3 dòng: `123 Nguyen Van Linh` / `Phuong Nam Duong` / `Quan Hai Chau`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc nội dung ô Address | Company: `Auto_Customer_1785700485`<br>Address: 3 dòng như trên | 3. Tạo thành công<br>4. Ô Address giữ đúng 3 dòng và đúng ký tự xuống dòng, không bị gộp thành 1 dòng | Low | Yes | UI | @Regression |
| CRM_CUST_TC_074 | REQ-CUST-17 | Customers | Low | Zip Code chấp nhận cả chữ (kiểu text) | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700486`<br>2. Nhập Zip Code: `SW1A-1AA`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc giá trị ô Zip Code | Company: `Auto_Customer_1785700486`<br>Zip: `SW1A-1AA` | 3. Theo ASM-03: tạo thành công, không lỗi định dạng<br>4. Ô Zip Code hiển thị đúng `SW1A-1AA` | Low | Yes | UI | @Regression |

---

## Nhóm 2.10 — Checkbox hiển thị tên liên hệ chính

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_075 | REQ-CUST-26 | Customers | Medium | Checkbox "Show primary contact full name" mặc định không được tick | Đang ở `/admin/clients/client` | 1. Cuộn tới checkbox `#show_primary_contact`<br>2. Đọc trạng thái checkbox và nhãn đi kèm | — | 2. Checkbox ở trạng thái **không tick**; nhãn hiển thị nguyên văn `Show primary contact full name on Invoices, Estimates, Payments, Credit Notes` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_076 | REQ-CUST-26 | Customers | Medium | Tick checkbox hiển thị tên liên hệ chính được lưu lại | Đang ở `/admin/clients/client` | 1. Nhập Company: `Auto_Customer_1785700487`<br>2. Tick checkbox `#show_primary_contact`<br>3. Click `Save`<br>4. Mở lại form sửa, đọc trạng thái checkbox | Company: `Auto_Customer_1785700487`<br>Show primary contact: tick | 2. Checkbox chuyển sang trạng thái đã tick<br>3. Tạo thành công<br>4. Checkbox vẫn ở trạng thái đã tick — giá trị được lưu | Medium | Yes | UI | @Regression |

---

> **Trước đó:** [Part 1 — Danh sách khách hàng](test_cases_customers_v2_part1.md) · **Tiếp theo:** [Part 3 — Chi tiết, Xoá & Contacts](test_cases_customers_v2_part3.md)
