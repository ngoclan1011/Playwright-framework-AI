# Manual Test Cases — Module Customers · Part 1: Danh sách khách hàng

| Thông tin | Nội dung |
|---|---|
| Phần | **Part 1/4** — Danh sách khách hàng |
| REQ bao phủ | REQ-CUST-01 → REQ-CUST-13 |
| Số TC | 36 (`CRM_CUST_TC_001` → `CRM_CUST_TC_036`) |
| Index | [test_cases_customers_v2_index.md](test_cases_customers_v2_index.md) — Assumptions, coverage toàn module |
| Nguồn requirement | [requirements_customers.md](../requirements/requirements_customers.md) |
| Phiên bản | 2.0 (bản sinh độc lập để đối chiếu với v1.0) |

> ⚠️ **Môi trường dùng chung** (RISK-01, RISK-02): mọi TC tạo dữ liệu phải dùng tiền tố traceable `Auto_Customer_<timestamp>` và **xoá sạch sau khi chạy**. KHÔNG dùng "Select All", KHÔNG thực thi Mass Delete.
> 📌 Timestamp mẫu trong tài liệu: `1785700456` — khi chạy thật thay bằng timestamp thời điểm chạy.

---

## Nhóm 1.1 — Hiển thị danh sách & bảng thống kê

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_001 | REQ-CUST-01 | Customers | High | Bảng danh sách hiển thị đủ 9 cột đúng thứ tự | Đã đăng nhập role Administrator | 1. Mở `https://crm.anhtester.com/admin/clients`<br>2. Chờ bảng `#clients` tải xong (DataTables server-side)<br>3. Đọc hàng tiêu đề của bảng | — | 1. Trang danh sách khách hàng hiển thị<br>2. Bảng `#clients` hiển thị có dữ liệu<br>3. Hàng tiêu đề có đúng 9 cột theo thứ tự: `-` (checkbox), `#`, `Company`, `Primary Contact`, `Primary Email`, `Phone`, `Active`, `Groups`, `Date Created` | High | Yes | UI | @Smoke @Regression |
| CRM_CUST_TC_002 | REQ-CUST-02 | Customers | Medium | Khu vực Customers Summary hiển thị đủ 6 chỉ số | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Đọc khu vực "Customers Summary" phía trên bảng | — | 2. Hiển thị đủ 6 chỉ số có nhãn: `Total Customers`, `Active Customers`, `Inactive Customers`, `Active Contacts`, `Inactive Contacts`, `Contacts Logged In Today`; mỗi chỉ số kèm một giá trị số | Medium | Yes | UI | @Smoke @Regression |
| CRM_CUST_TC_003 | REQ-CUST-02 | Customers | Low | Giá trị các chỉ số thống kê là số không âm | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Đọc giá trị 6 chỉ số trong Customers Summary | — | 2. Cả 6 giá trị đều là số nguyên ≥ 0; `Total Customers` ≥ `Active Customers` và ≥ `Inactive Customers` | Low | Yes | @Regression |
| CRM_CUST_TC_004 | REQ-CUST-03, REQ-CUST-12 | Customers | High | Chỉ số Active/Inactive cập nhật sau khi tắt trạng thái và tải lại trang | Đã tồn tại khách hàng `Auto_Customer_1785700456` ở trạng thái Active | 1. Mở `/admin/clients`, ghi lại giá trị `Active Customers` (A0) và `Inactive Customers` (I0)<br>2. Tìm `Auto_Customer_1785700456` bằng ô Search<br>3. Click công tắc cột `Active` của dòng này để tắt<br>4. Tải lại trang `/admin/clients`<br>5. Đọc lại `Active Customers` (A1) và `Inactive Customers` (I1) | Company: `Auto_Customer_1785700456` | 3. Công tắc chuyển sang trạng thái tắt ngay trên UI<br>4. Trang tải lại thành công<br>5. `A1 = A0 - 1` và `I1 = I0 + 1` | High | Yes | UI | @Regression @CriticalPath |
| CRM_CUST_TC_005 | REQ-CUST-03 | Customers | Medium | Chỉ số Total Customers tăng 1 sau khi tạo khách hàng mới | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`, ghi lại `Total Customers` (T0)<br>2. Tạo khách hàng mới với Company hợp lệ<br>3. Quay lại `/admin/clients` và tải lại trang<br>4. Đọc lại `Total Customers` (T1) | Company: `Auto_Customer_1785700457` | 2. Tạo thành công, chuyển tới trang chi tiết<br>4. `T1 = T0 + 1` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_006 | REQ-CUST-03, REQ-CUST-32 | Customers | Medium | Chỉ số Active Contacts giảm đúng 1 khi xoá khách hàng có 1 liên hệ | Tồn tại `Auto_Customer_1785700458` có đúng 1 liên hệ đang Active | 1. Mở `/admin/clients`, ghi lại `Active Contacts` (C0)<br>2. Mở trang chi tiết `Auto_Customer_1785700458`<br>3. Xoá khách hàng và xác nhận OK trên hộp thoại<br>4. Tải lại `/admin/clients`, đọc lại `Active Contacts` (C1) | Company: `Auto_Customer_1785700458`<br>Contact: `auto_contact_1785700458@auto.test` | 3. Chuyển về `/admin/clients`<br>4. `C1 = C0 - 1` | Medium | Yes | UI | @Regression |

---

## Nhóm 1.2 — Tìm kiếm

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_007 | REQ-CUST-04 | Customers | High | Tìm kiếm khớp chính xác trả về đúng 1 bản ghi | Đã tồn tại `Auto_Customer_1785700456` | 1. Mở `/admin/clients`<br>2. Nhập `Auto_Customer_1785700456` vào ô Search<br>3. Chờ bảng tải lại qua AJAX<br>4. Đọc dòng thông tin `#clients_info` | Từ khoá: `Auto_Customer_1785700456` | 3. Bảng chỉ còn 1 dòng, cột Company bằng `Auto_Customer_1785700456`<br>4. `#clients_info` hiển thị dạng `Showing 1 to 1 of 1 entries (filtered from N total entries)` | High | Yes | UI | @Smoke @CriticalPath |
| CRM_CUST_TC_008 | REQ-CUST-04 | Customers | Medium | Tìm kiếm khớp một phần (partial match) | Đã tồn tại `Auto_Customer_1785700456` | 1. Mở `/admin/clients`<br>2. Nhập `1785700456` (chỉ phần timestamp) vào ô Search<br>3. Chờ bảng tải lại | Từ khoá: `1785700456` | 3. Bảng hiển thị dòng `Auto_Customer_1785700456` — khớp một phần vẫn ra kết quả | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_009 | REQ-CUST-04 | Customers | Medium | Tìm kiếm không phân biệt hoa/thường | Đã tồn tại `Auto_Customer_1785700456` | 1. Mở `/admin/clients`<br>2. Nhập `auto_customer_1785700456` (toàn chữ thường) vào ô Search<br>3. Chờ bảng tải lại | Từ khoá: `auto_customer_1785700456` | 3. Vẫn tìm thấy `Auto_Customer_1785700456` — tìm kiếm không phân biệt hoa/thường | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_010 | REQ-CUST-04 | Customers | Medium | Tìm kiếm chuỗi không tồn tại hiển thị trạng thái rỗng | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Nhập `KhongTonTai_9999999999` vào ô Search<br>3. Chờ bảng tải lại | Từ khoá: `KhongTonTai_9999999999` | 3. Bảng không còn dòng dữ liệu nào, hiển thị thông báo trạng thái rỗng của DataTables (`No matching records found`); `#clients_info` hiển thị `0 entries` | Medium | Yes | UI | @Regression @Boundary |
| CRM_CUST_TC_011 | REQ-CUST-04 | Customers | High | Tìm kiếm chuỗi SQL injection không gây lỗi hệ thống | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Nhập `' OR 1=1--` vào ô Search<br>3. Chờ phản hồi AJAX<br>4. Quan sát bảng và mã HTTP của request DataTables | Từ khoá: `' OR 1=1--` | 3. Trang không lỗi 500, không hiển thị thông báo lỗi SQL<br>4. Request trả HTTP 200; bảng hiển thị 0 kết quả (chuỗi được xử lý như dữ liệu văn bản, KHÔNG trả về toàn bộ bản ghi) | High | Yes | UI | @Security @Regression |
| CRM_CUST_TC_012 | REQ-CUST-04 | Customers | Medium | Tìm kiếm chuỗi XSS không thực thi script | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Nhập `<script>alert(1)</script>` vào ô Search<br>3. Chờ phản hồi AJAX | Từ khoá: `<script>alert(1)</script>` | 3. Không có hộp thoại alert nào bật lên; chuỗi được hiển thị dưới dạng văn bản thuần trong ô Search; bảng trả 0 kết quả | Medium | Yes | UI | @Security @Regression |
| CRM_CUST_TC_013 | REQ-CUST-04 | Customers | Low | Tìm kiếm bằng tiếng Việt có dấu và emoji không gây lỗi | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Nhập `Công ty Ứng Dụng 😀` vào ô Search<br>3. Chờ phản hồi AJAX | Từ khoá: `Công ty Ứng Dụng 😀` | 3. Request trả HTTP 200, không lỗi encoding; ô Search giữ nguyên chuỗi đã nhập (không bị vỡ ký tự); bảng hiển thị kết quả tương ứng hoặc 0 kết quả | Low | Yes | UI | @Localization @Regression |
| CRM_CUST_TC_014 | REQ-CUST-04 | Customers | Medium | Xoá từ khoá tìm kiếm khôi phục danh sách đầy đủ | Đang áp dụng từ khoá tìm kiếm cho kết quả 1 dòng | 1. Mở `/admin/clients`, nhập `Auto_Customer_1785700456` vào ô Search<br>2. Chờ bảng còn 1 dòng<br>3. Xoá trắng ô Search<br>4. Chờ bảng tải lại | Từ khoá: `Auto_Customer_1785700456` → rỗng | 2. Bảng còn 1 dòng<br>4. `#clients_info` không còn cụm `(filtered from ...)`, tổng số bản ghi trở về giá trị ban đầu | Medium | Yes | UI | @Regression |

---

## Nhóm 1.3 — Phân trang

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_015 | REQ-CUST-05 | Customers | Medium | Số dòng mỗi trang mặc định là 25 | Đã đăng nhập role Administrator | 1. Mở `/admin/clients` (không thay đổi thiết lập nào)<br>2. Đọc giá trị đang chọn của dropdown `clients_length`<br>3. Đếm số dòng dữ liệu trong bảng | — | 2. Dropdown `clients_length` đang chọn `25`<br>3. Bảng hiển thị đúng 25 dòng (khi tổng bản ghi > 25) | Medium | Yes | UI | @Smoke @Regression |
| CRM_CUST_TC_016 | REQ-CUST-05 | Customers | Medium | Dropdown số dòng mỗi trang có đủ 5 lựa chọn | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Mở dropdown `clients_length`<br>3. Đọc danh sách option | — | 3. Có đúng 5 lựa chọn theo thứ tự: `10`, `25`, `50`, `100`, `All` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_017 | REQ-CUST-05 | Customers | Medium | Đổi số dòng mỗi trang sang 10 áp dụng ngay | Đang ở `/admin/clients` với page size mặc định 25 | 1. Mở dropdown `clients_length`<br>2. Chọn `10`<br>3. Chờ bảng tải lại qua AJAX<br>4. Đếm số dòng và đọc `#clients_info` | Page size: `10` | 3. Bảng tải lại<br>4. Bảng hiển thị đúng 10 dòng; `#clients_info` hiển thị `Showing 1 to 10 of N entries` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_018 | REQ-CUST-05 | Customers | Medium | Đổi số dòng mỗi trang sang 100 áp dụng ngay | Đang ở `/admin/clients`, tổng bản ghi > 100 | 1. Mở dropdown `clients_length`<br>2. Chọn `100`<br>3. Chờ bảng tải lại<br>4. Đếm số dòng | Page size: `100` | 3. Bảng tải lại<br>4. Bảng hiển thị đúng 100 dòng; `#clients_info` hiển thị `Showing 1 to 100 of N entries` | Medium | Yes | UI | @Regression @Boundary |
| CRM_CUST_TC_019 | REQ-CUST-05 | Customers | Medium | Chọn "All" với danh sách hơn 1.400 bản ghi vẫn tải được | Đang ở `/admin/clients`, hệ thống có ~1.431 khách hàng | 1. Mở dropdown `clients_length`<br>2. Chọn `All`<br>3. Chờ bảng tải xong (không đặt timeout cứng, chờ đến khi `#clients_info` cập nhật) | Page size: `All` | 2. Trang không treo, không hiện lỗi trình duyệt<br>3. `#clients_info` hiển thị `Showing 1 to N of N entries` với N = tổng số khách hàng; bảng không còn thanh phân trang | Medium | Partial | UI | @Regression @Boundary |
| CRM_CUST_TC_020 | REQ-CUST-05 | Customers | Medium | Chuyển tới trang cuối và quay lại trang đầu | Đang ở `/admin/clients` với page size 25 | 1. Click nút phân trang `Last`<br>2. Chờ bảng tải lại, đọc `#clients_info`<br>3. Click nút phân trang `First`<br>4. Chờ bảng tải lại, đọc `#clients_info` | — | 2. `#clients_info` hiển thị khoảng bản ghi cuối cùng, nút `Next`/`Last` bị vô hiệu hoá<br>4. `#clients_info` trở về `Showing 1 to 25 of N entries`, nút `First`/`Previous` bị vô hiệu hoá | Medium | Yes | UI | @Regression @Boundary |
| CRM_CUST_TC_021 | REQ-CUST-06 | Customers | Low | Dropdown nhảy nhanh tới trang hoạt động đúng | Đang ở `/admin/clients` với page size 25 | 1. Mở dropdown `#dt-page-jump-clients`<br>2. Chọn trang số `3`<br>3. Chờ bảng tải lại, đọc `#clients_info` | Trang đích: `3` | 2. Dropdown liệt kê các số trang khả dụng<br>3. `#clients_info` hiển thị `Showing 51 to 75 of N entries` (trang 3 với page size 25) | Low | Yes | UI | @Regression |

---

## Nhóm 1.4 — Bộ lọc nâng cao

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_022 | REQ-CUST-07 | Customers | Medium | Dropdown tiêu chí lọc có đủ 15 lựa chọn | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Click "New Filter"<br>3. Mở dropdown `#clientsRules`<br>4. Đọc danh sách tiêu chí | — | 2. Khu vực thêm luật lọc hiển thị<br>4. Dropdown có đúng 15 tiêu chí: `Phone`, `Active`, `Invoices`, `Estimates`, `Proposals`, `Projects`, `Contracts Types`, `City`, `Zip Code`, `State`, `Country`, `Responsible admin`, `Groups`, `Customers assigned to me`, `Requires Registration Confirmation` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_023 | REQ-CUST-07 | Customers | Medium | Lọc theo tiêu chí Active thu hẹp đúng danh sách | Hệ thống có cả khách hàng Active và Inactive | 1. Mở `/admin/clients`, ghi lại tổng bản ghi ban đầu (N)<br>2. Click "New Filter"<br>3. Chọn tiêu chí `Active`, giá trị `Yes`<br>4. Áp dụng bộ lọc, chờ bảng tải lại<br>5. Đọc `#clients_info` và cột `Active` của các dòng hiển thị | Tiêu chí: `Active` = `Yes` | 4. Bảng tải lại<br>5. Số bản ghi sau lọc < N; mọi dòng hiển thị đều có công tắc cột `Active` ở trạng thái bật | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_024 | REQ-CUST-07 | Customers | Medium | Kết hợp 2 điều kiện lọc cho kết quả hẹp hơn 1 điều kiện | Hệ thống có dữ liệu đủ đa dạng về Country | 1. Mở `/admin/clients`<br>2. Thêm luật lọc `Active` = `Yes`, áp dụng, ghi lại số bản ghi (N1)<br>3. Thêm tiếp luật lọc thứ hai `Country` = `Vietnam`, áp dụng<br>4. Đọc `#clients_info` (N2) | Điều kiện 1: `Active` = `Yes`<br>Điều kiện 2: `Country` = `Vietnam` | 2. Bảng lọc theo điều kiện 1<br>4. `N2 ≤ N1` — thêm điều kiện làm kết quả hẹp lại, không mở rộng | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_025 | REQ-CUST-07 | Customers | Medium | Tải lại trang khi đang áp bộ lọc — ghi nhận hành vi giữ/mất filter | Đang áp dụng bộ lọc `Active` = `Yes` cho kết quả thu hẹp | 1. Áp dụng bộ lọc `Active` = `Yes`, ghi lại số bản ghi (N1)<br>2. Nhấn F5 tải lại trang<br>3. Chờ bảng tải xong, đọc `#clients_info` (N2) và khu vực bộ lọc | Điều kiện: `Active` = `Yes` | 2. Trang tải lại<br>3. Ghi nhận hành vi thực tế: nếu `N2 = N1` và luật lọc còn hiển thị → bộ lọc được giữ; nếu `N2` bằng tổng ban đầu và khu vực lọc trống → bộ lọc bị reset. **Cả hai đều PASS**, TC này ghi nhận hành vi để làm baseline hồi quy | Medium | Yes | UI | @Regression |

---

## Nhóm 1.5 — Xuất dữ liệu

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_026 | REQ-CUST-08 | Customers | Medium | Menu Export có đủ 4 lựa chọn | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Click nút "Export"<br>3. Đọc danh sách lựa chọn trong menu | — | 2. Menu Export mở ra<br>3. Có đúng 4 lựa chọn: `Excel`, `CSV`, `PDF`, `Print` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_027 | REQ-CUST-08 | Customers | Medium | Xuất CSV tải về tệp không rỗng | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Click "Export" → chọn `CSV`<br>3. Chờ trình duyệt hoàn tất tải tệp<br>4. Mở tệp đã tải và đọc dòng đầu tiên | — | 3. Trình duyệt tải về một tệp `.csv`, dung lượng > 0 byte<br>4. Dòng đầu là tiêu đề cột chứa ít nhất `Company` và `Primary Email` | Medium | Partial | UI | @Regression |
| CRM_CUST_TC_028 | REQ-CUST-04, REQ-CUST-08 | Customers | Medium | Xuất dữ liệu khi đang lọc chỉ chứa các dòng đã lọc | Đã tồn tại `Auto_Customer_1785700456` | 1. Mở `/admin/clients`<br>2. Nhập `Auto_Customer_1785700456` vào ô Search, chờ bảng còn 1 dòng<br>3. Click "Export" → chọn `CSV`<br>4. Mở tệp đã tải, đếm số dòng dữ liệu (không tính tiêu đề) | Từ khoá: `Auto_Customer_1785700456` | 2. Bảng còn 1 dòng<br>4. Tệp CSV chỉ chứa đúng 1 dòng dữ liệu, giá trị cột Company là `Auto_Customer_1785700456` | Medium | Partial | UI | @Regression |

---

## Nhóm 1.6 — Chọn dòng & thao tác hàng loạt

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_029 | REQ-CUST-10 | Customers | Medium | Checkbox mỗi dòng mang value là ID khách hàng | Đã tồn tại `Auto_Customer_1785700456` với ID đã biết | 1. Mở `/admin/clients`<br>2. Tìm `Auto_Customer_1785700456` bằng ô Search<br>3. Đọc thuộc tính `value` của checkbox ở cột đầu tiên của dòng kết quả<br>4. Mở trang chi tiết khách hàng, đọc ID trên URL | Company: `Auto_Customer_1785700456` | 3. Checkbox có thuộc tính `value` là một chuỗi số<br>4. Giá trị `value` ở bước 3 trùng khớp với `{id}` trong URL `/admin/clients/client/{id}` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_030 | REQ-CUST-09 | Customers | High | Modal Bulk Actions hiển thị đủ lựa chọn (KHÔNG thực thi xoá) | Đã tồn tại `Auto_Customer_1785700456` | 1. Mở `/admin/clients`, tìm `Auto_Customer_1785700456`<br>2. Tick checkbox của **đúng dòng này** (tuyệt đối không dùng "Select All")<br>3. Click nút "Bulk Actions"<br>4. Đọc các lựa chọn trong modal<br>5. Đóng modal bằng nút Close mà KHÔNG xác nhận thao tác nào | Company: `Auto_Customer_1785700456` | 3. Modal Bulk Actions mở ra<br>4. Modal cung cấp lựa chọn `Mass Delete` và khu vực gán `Groups`<br>5. Modal đóng lại, danh sách giữ nguyên, `Total Customers` không đổi | High | No | N/A | @Regression @ManualOnly |
| CRM_CUST_TC_031 | REQ-CUST-09 | Customers | Medium | Mở Bulk Actions khi chưa chọn dòng nào | Đã đăng nhập role Administrator, không tick checkbox nào | 1. Mở `/admin/clients`<br>2. Không tick bất kỳ checkbox nào<br>3. Click nút "Bulk Actions"<br>4. Quan sát phản hồi của hệ thống | — | 3. Hệ thống phản hồi bằng một trong hai cách: nút bị vô hiệu hoá, hoặc modal mở nhưng hiển thị cảnh báo chưa chọn bản ghi<br>4. KHÔNG có bản ghi nào bị tác động; `Total Customers` không đổi | Medium | Yes | UI | @Regression @Negative |

---

## Nhóm 1.7 — Thao tác nhanh trên dòng

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_032 | REQ-CUST-11 | Customers | Medium | Hover vào khách hàng chưa có liên hệ hiện 2 liên kết thao tác | Tồn tại `Auto_Customer_1785700459` **chưa có** liên hệ nào | 1. Mở `/admin/clients`, tìm `Auto_Customer_1785700459`<br>2. Di chuột vào ô tên công ty của dòng kết quả<br>3. Đọc các liên kết thao tác hiện ra | Company: `Auto_Customer_1785700459` (0 liên hệ) | 2. Nhóm liên kết thao tác hiện ra dưới tên công ty<br>3. Hiển thị đúng 2 liên kết: `View` và `Delete` | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_033 | REQ-CUST-11 | Customers | Medium | Hover vào khách hàng đã có liên hệ hiện thêm liên kết Contacts | Tồn tại `Auto_Customer_1785700458` **đã có** ít nhất 1 liên hệ | 1. Mở `/admin/clients`, tìm `Auto_Customer_1785700458`<br>2. Di chuột vào ô tên công ty của dòng kết quả<br>3. Đọc các liên kết thao tác hiện ra<br>4. Click liên kết `Contacts` | Company: `Auto_Customer_1785700458` (≥1 liên hệ) | 2. Nhóm liên kết thao tác hiện ra<br>3. Hiển thị đúng 3 liên kết: `View`, `Contacts`, `Delete`<br>4. Điều hướng tới trang chi tiết khách hàng, mở đúng tab Contacts | Medium | Yes | UI | @Regression |

---

## Nhóm 1.8 — Trạng thái hoạt động (Active/Inactive)

| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CRM_CUST_TC_034 | REQ-CUST-12 | Customers | High | Tắt trạng thái Active tại danh sách được lưu bền vững | Tồn tại `Auto_Customer_1785700456` đang ở trạng thái Active | 1. Mở `/admin/clients`, tìm `Auto_Customer_1785700456`<br>2. Click công tắc ở cột `Active` để tắt<br>3. Quan sát request gửi đi<br>4. Tải lại trang và tìm lại khách hàng này<br>5. Đọc trạng thái công tắc | Company: `Auto_Customer_1785700456` | 2. Công tắc chuyển sang trạng thái tắt ngay, không cần vào trang chi tiết<br>3. Trình duyệt gửi request tới `/admin/clients/change_client_status`, phản hồi HTTP 200<br>5. Công tắc vẫn ở trạng thái tắt — thay đổi đã được lưu | High | Yes | UI | @CriticalPath @Regression |
| CRM_CUST_TC_035 | REQ-CUST-12 | Customers | Medium | Bật lại trạng thái Active khôi phục đúng trạng thái | Tồn tại `Auto_Customer_1785700456` đang ở trạng thái Inactive | 1. Mở `/admin/clients`, tìm `Auto_Customer_1785700456`<br>2. Click công tắc ở cột `Active` để bật<br>3. Tải lại trang và tìm lại khách hàng này<br>4. Đọc trạng thái công tắc và chỉ số `Active Customers` | Company: `Auto_Customer_1785700456` | 2. Công tắc chuyển sang trạng thái bật<br>3. Trang tải lại thành công<br>4. Công tắc vẫn bật; `Active Customers` tăng 1 so với trước bước 2 | Medium | Yes | UI | @Regression |
| CRM_CUST_TC_036 | REQ-CUST-13 | Customers | Medium | Tooltip công tắc Active nêu đúng ý nghĩa trạng thái Inactive | Đã đăng nhập role Administrator | 1. Mở `/admin/clients`<br>2. Di chuột vào công tắc ở cột `Active` của một dòng bất kỳ<br>3. Đọc nội dung tooltip hiện ra | — | 3. Tooltip hiển thị nguyên văn: `Won't be shown in dropdowns when creating new records` | Medium | Yes | UI | @Regression |

---

> **Tiếp theo:** [Part 2 — Tạo & sửa khách hàng](test_cases_customers_v2_part2.md)
