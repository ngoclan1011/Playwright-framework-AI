# Yêu cầu — Module Chiến dịch (`CAMP`)

| Mục | Giá trị |
|---|---|
| **Hệ thống** | CMS Adsplay (for FPTPlay) |
| **Module** | Chiến dịch — Campaign |
| **Prefix** | `CAMP` |
| **Nền tảng** | **Web** (chưa khảo sát mobile/API) |
| **Dải mã đã dùng** | `REQ-CAMP-01` → `REQ-CAMP-38` · `AMB-01` → `AMB-10` · `RISK-01` → `RISK-06` |
| **Mã kế tiếp** | Đợt phân tích sau bắt đầu từ `REQ-CAMP-39` · `AMB-11` · `RISK-07` — **KHÔNG đánh lại từ 01** |
| **Nguồn** | UI thực tế + tầng network (quan sát thụ động) |
| **Ngày phát hành** | 2026-09-15 |
| **Bản đồ khám phá** | [`../_discovery/modules/module_05_chien_dich.md`](../_discovery/modules/module_05_chien_dich.md) |

---

## 1. Tổng quan

### Mục đích

Module `CAMP` là **điểm vào của lõi nghiệp vụ quảng cáo**. Một chiến dịch (Campaign) đại diện cho thoả thuận quảng cáo giữa hệ thống và một nhà quảng cáo, được neo vào **hợp đồng và chiến dịch bên hệ thống CMS ngoài**, và là vật chứa cho các Flight (kế hoạch phân phối) bên dưới.

### Trong phạm vi

Danh sách chiến dịch · tạo · sửa · nhân bản · xoá · bật/tắt trạng thái · nhật ký thay đổi · tích hợp lấy hợp đồng và chiến dịch từ CMS ngoài.

### Ngoài phạm vi

| Nội dung | Thuộc module |
|---|---|
| Flight — booking, lịch, nhắm mục tiêu | `FLIGHT` |
| Creative — nội dung quảng cáo | `CRTV` |
| Báo cáo hiệu quả chiến dịch (`View Report`) | `DASH` |
| Quản lý nhà quảng cáo | `ADV` |

### Bản đồ phủ tài liệu

**Không có tài liệu nào được cung cấp cho module này.** Toàn bộ yêu cầu dưới đây rút từ **UI thực tế** và **tầng network**, mức phủ tài liệu ⬜ Trắng. Mọi giá trị đều có thể đối chiếu lại trên hệ thống.

---

## 2. Yêu cầu chức năng

> REQ ở bảng này là **quy tắc nghiệp vụ** — đúng với mọi nền tảng nếu sau này module có thêm app/API.
> REQ thuần giao diện web nằm ở [`web/requirements_camp_web.md`](web/requirements_camp_web.md).

| REQ ID | Tên yêu cầu | Nền tảng | Mô tả | Acceptance Criteria | Trạng thái | Nguồn |
|---|---|---|---|---|---|---|
| REQ-CAMP-01 | Xem danh sách chiến dịch | Web | Người dùng xem được toàn bộ chiến dịch trong hệ thống | Mở `/campaigns` → hiện bảng gồm ID, Tên, Type, Advertiser, Start Date, End Date, Status, Actions. Quan sát thực tế: **533 bản ghi** | 🟢 | UI thực tế |
| REQ-CAMP-02 | Chiến dịch gắn đúng một nhà quảng cáo | Web | Mỗi chiến dịch thuộc về một Advertiser duy nhất | Tạo chiến dịch không chọn Advertiser → bị chặn, báo `Advertiser is required` | 🟢 | UI thực tế |
| REQ-CAMP-03 | Chiến dịch neo vào hợp đồng của CMS ngoài | Web | Chiến dịch phải gắn một Contract lấy từ hệ thống CMS ngoài | Không chọn Contract → bị chặn, báo `Contract is required` | 🟢 | UI thực tế · `GET /api/cms/Contracts` |
| REQ-CAMP-04 | Chỉ chọn được hợp đồng còn hiệu lực | Web | Hợp đồng trạng thái `Expired` không được phép chọn | Mở dropdown Contract → mục `Expired` hiển thị nhưng **bị khoá** (`disabled`); chỉ mục `Approved` chọn được | 🟢 | UI thực tế |
| REQ-CAMP-05 | Chiến dịch neo vào chiến dịch của CMS ngoài | Web | Phải gắn một CMS Campaign | Không chọn → bị chặn, báo `CMS Campaign is required` | 🟢 | UI thực tế |
| REQ-CAMP-06 | Chỉ chọn được CMS Campaign đang hoạt động | Web | CMS Campaign trạng thái `Inactive` không được phép chọn | Mở dropdown → 9/10 mục `Inactive` bị khoá, chỉ mục `Active` chọn được | 🟢 | UI thực tế |
| REQ-CAMP-07 | CMS Campaign phụ thuộc Contract đã chọn | Web | Danh sách CMS Campaign được lọc theo hợp đồng | Chưa chọn Contract → ô CMS Campaign bị khoá. Chọn Contract xong → ô mở khoá và nạp danh sách tương ứng | 🟢 | UI thực tế · `GET /api/cms/Campaigns?Contract=<mã>` |
| REQ-CAMP-08 | Ngày kết thúc không được trước ngày bắt đầu | Web | Khoảng thời gian chiến dịch phải hợp lệ | Chọn Start Date = `20/10/2026` → lịch End Date **khoá toàn bộ ngày trước `20/10/2026`**. Cho phép End = Start (chiến dịch 1 ngày) | 🟢 | UI thực tế |
| REQ-CAMP-09 | Chiến dịch có ba loại hình | Web | Phân loại theo hình thức phát quảng cáo | `Type` nhận đúng 3 giá trị: `VOD` · `Display` · `LiveTV`. Không chọn → báo `Type is required` | 🟢 | UI thực tế |
| REQ-CAMP-10 | Chiến dịch mới mặc định chưa kích hoạt | Web | Tránh chiến dịch chạy ngoài ý muốn ngay khi tạo | Mở form tạo → công tắc `Status` ở trạng thái **tắt**, nhãn `Inactive` | 🟢 | UI thực tế |
| REQ-CAMP-11 | Bật/tắt chiến dịch ngay trên danh sách | Web | Không cần vào màn sửa để đổi trạng thái | Cột `Status` là công tắc bật/tắt, nhãn `Active`/`Inactive` đổi theo | 🟢 | UI thực tế |
| REQ-CAMP-12 | Chiến dịch có hai trường trạng thái tách biệt | Web | Trạng thái duyệt và trạng thái kích hoạt là hai thứ khác nhau | Nhật ký ghi đồng thời `Status: approved` và `Activated: 1`. Schema có cả `status` lẫn `activated`, trong khi UI chỉ hiển thị một công tắc | 🟡 | Nhật ký · `GET /api/campaigns/{id}` |
| REQ-CAMP-13 | Ghi nhật ký mọi thay đổi của chiến dịch | Web | Truy vết được ai đổi gì, khi nào | `View Log` mở bảng `Date · User · Event · Field · Old value · New value`. Sự kiện `Created` ghi lại **từng trường một** | 🟢 | UI thực tế |
| REQ-CAMP-14 | Lọc nhật ký theo người, sự kiện, thời gian | Web | Tìm nhanh thay đổi cần quan tâm | Modal nhật ký có 3 bộ lọc: `User` · `Event` (mặc định `All`) · `Date` | 🟢 | UI thực tế |
| REQ-CAMP-15 | Nhân bản chiến dịch | Web | Tạo chiến dịch mới từ chiến dịch có sẵn | Nút `Copy` ở màn chi tiết. Dữ liệu thật có bản ghi tên `Copy of <tên gốc>` | 🟢 | UI thực tế |
| REQ-CAMP-16 | Sửa chiến dịch | Web | Cập nhật thông tin chiến dịch đã tạo | Nút `Edit` ở màn chi tiết · biểu tượng bút ở cột `Actions` của danh sách | 🟢 | UI thực tế |
| REQ-CAMP-17 | Xoá chiến dịch | Web | Gỡ chiến dịch khỏi hệ thống | Biểu tượng thùng rác ở cột `Actions` | 🟢 | UI thực tế |
| REQ-CAMP-18 | Xem nhật ký từ danh sách | Web | Không cần mở chi tiết vẫn xem được lịch sử | Biểu tượng đồng hồ quay ngược ở cột `Actions` | 🟢 | UI thực tế |
| REQ-CAMP-19 | Lọc danh sách chiến dịch | Web | Thu hẹp danh sách 533 bản ghi | 5 bộ lọc: `Campaign Name` · `Advertiser` · `Start Date` · `End Date` · `Status` (mặc định `All`) | 🟢 | UI thực tế |
| REQ-CAMP-20 | Tìm kiếm theo tên chiến dịch | Web | Tìm nhanh theo tên | Nhập từ khoá + bấm `Search` → lọc đúng. Không có kết quả → hiện `No data` | 🟢 | UI thực tế |
| REQ-CAMP-21 | Sắp xếp danh sách | Web | Đổi thứ tự hiển thị | Cột `ID` · `Campaign Name` · `Start Date` · `End Date` có biểu tượng sắp xếp. Mặc định `order=id\|desc` | 🟢 | UI thực tế · tầng network |
| REQ-CAMP-22 | Phân trang danh sách | Web | Chia nhỏ 533 bản ghi | Mặc định 20 bản ghi/trang · 27 trang · đổi được `Page size` · hiển thị `Showing 1–20 of 533 items` | 🟢 | UI thực tế |
| REQ-CAMP-23 | Cảnh báo chiến dịch đã hết hạn | Web | Người dùng nhận ra chiến dịch quá hạn ngay trên danh sách | Chiến dịch có `End Date` trong quá khứ hiển thị **biểu tượng ⚠️** cạnh ngày kết thúc | 🟢 | UI thực tế |
| REQ-CAMP-24 | Hiển thị người tạo và thời điểm tạo | Web | Biết chiến dịch của ai, tạo bao lâu rồi | Ô `Campaign Name` hiển thị 3 dòng: tên (link) · email người tạo · thời gian tương đối (`25 days ago`) | 🟢 | UI thực tế |
| REQ-CAMP-25 | Chiến dịch là vật chứa của Flight | Web | Quan hệ cha–con với module `FLIGHT` | Mở `/campaigns/{id}` → màn `Flight Management` liệt kê các flight thuộc chiến dịch. Chiến dịch 1188 có 21 flight | 🟢 | UI thực tế |
| REQ-CAMP-26 | Mở chiến dịch không tồn tại báo lỗi trong trang | Web | Không đẩy người dùng ra trang 404 chung | `/campaigns/<id-không-tồn-tại>` → hiện `404 Campaign not found` **bên trong layout**, giữ nguyên menu | 🟢 | UI thực tế |
| REQ-CAMP-27 | 🔴 Tạo chiến dịch mới | Web | Người dùng tạo được chiến dịch từ form | ⚠️ **HIỆN KHÔNG ĐẠT** — xem `AMB-01`. Điền đủ 7 trường bắt buộc hợp lệ, bấm `OK` → modal đóng nhưng **không có request tạo nào được gửi**, chiến dịch **không xuất hiện** trong danh sách, **không có thông báo lỗi** | 🟡 | UI thực tế · tầng network |

---

## 3. Ma trận phân quyền (sơ bộ)

⚠️ **Chỉ có 1 tài khoản admin.** Hệ thống khai báo **34 role**. Ma trận dưới đây suy từ bảng Permission của chính hệ thống, **chưa đăng nhập role nào khác để kiểm chứng**.

| Chức năng | Permission | Admin | Role khác |
|---|---|---|---|
| Xem danh sách, xem chi tiết | `campaigns.view` | ✅ Đã kiểm chứng | ⚠️✅ Phổ biến — nhiều role có |
| Tạo chiến dịch | `campaigns.all` | ✅ Đã kiểm chứng | ❔ |
| Sửa chiến dịch | `campaigns.update` | ✅ Đã kiểm chứng | ⚠️✅ Role `Fshare_Guest67` có `campaigns.update` |
| Xoá chiến dịch | `campaigns.all` | ✅ Đã kiểm chứng | ❔ |
| Xem nhật ký | ❔ chưa rõ permission riêng | ✅ Đã kiểm chứng | ❔ |
| Xem báo cáo | `campaigns.report` | ✅ Đã kiểm chứng | ⚠️✅ Role `Report Guest` chỉ có quyền này |

**Tổng kết độ tin cậy:** Đã kiểm chứng **6 ô** (toàn bộ cột Admin) · Suy diễn **3 ô** · Chưa rõ **3 ô** + toàn bộ 33 role còn lại.

📌 Xem `AMB-02` — cần account role thấp để chuyển ⚠️ và ❔ thành ✅.

---

## 4. Ma trận trạng thái

### Trạng thái kích hoạt (`activated`) — quan sát được trên UI

| Trạng thái | Nhãn hiển thị | Thao tác cho phép |
|---|---|---|
| Bật | `Active` | Sửa · Nhân bản · Xoá · Xem nhật ký · Xem báo cáo · Tắt |
| Tắt | `Inactive` | Sửa · Nhân bản · Xoá · Xem nhật ký · Xem báo cáo · Bật |

> Chưa quan sát thấy thao tác nào **bị chặn** theo trạng thái — cần kiểm chứng thêm (`AMB-05`).

### Trạng thái duyệt (`status`) — chỉ thấy trong dữ liệu, không có trên UI

| Giá trị quan sát được | Nguồn |
|---|---|
| `approved` | Nhật ký chiến dịch 1295, sự kiện `Created` |

⚠️ Danh sách đầy đủ **chưa xác định** — xem `AMB-03`.

---

## 5. Điểm mơ hồ (Ambiguity)

| AMB ID | Mức | Nội dung | Giả định tạm | Cần ai trả lời |
|---|---|---|---|---|
| **AMB-01** | 🔴 | **Không tạo được chiến dịch mới.** Điền đủ 7 trường bắt buộc hợp lệ, bấm `OK` → modal đóng, **không có request `POST` nào** tới `/api/campaigns`, chiến dịch không xuất hiện trong danh sách, **không có thông báo thành công lẫn lỗi**. Đã tái hiện **2 lần**: lần 1 điền bằng script, lần 2 bằng thao tác chuột/bàn phím thật trên trang vừa tải mới | Coi là **lỗi chặn (blocker)** của chức năng lõi | **Dev** — cần tái hiện thủ công để xác nhận trước khi mở bug |
| **AMB-02** | 🔴 | **Thiếu account role thấp.** 34 role nhưng chỉ có 1 account admin → toàn bộ ma trận phân quyền mục 3 là suy diễn | Giả định permission trong bảng Permission phản ánh đúng quyền thật | **PO** — xin account role `Report Guest` và `Guest_CMS` |
| **AMB-03** | 🟠 | **Trường `status` có những giá trị nào?** Nhật ký lộ giá trị `approved`, nhưng UI không hiển thị trường này và không có chỗ nào đổi nó | Giả định có luồng duyệt chiến dịch chưa được đưa lên UI | **PO / Dev** |
| **AMB-04** | 🟠 | **Quan hệ giữa `status` và `activated`.** Hai trường tách biệt trong dữ liệu, UI chỉ có một công tắc | Giả định công tắc UI chỉ điều khiển `activated` | **Dev** |
| **AMB-05** | 🟠 | **Xoá chiến dịch đang có Flight đang chạy thì sao?** Chưa thử vì là thao tác phá huỷ trên môi trường dùng chung | Giả định hệ thống chặn hoặc hỏi xác nhận | **PO** |
| **AMB-06** | 🟠 | **`Copy` nhân bản tới tầng nào?** Chỉ chiến dịch, hay kéo theo cả Flight và Creative | Giả định nhân bản cả cây con | **PO** |
| **AMB-07** | 🟠 | **Tham số gửi lên bị cắt.** Chọn hợp đồng `HD15648-01456` nhưng hệ thống gửi `GET /api/cms/Campaigns?Contract=HD`. Với hợp đồng `HDNB` thì gửi đủ `Contract=HDNB`. Dropdown vẫn trả về kết quả nên chưa rõ có sai không | Giả định backend nhận tiền tố và tìm gần đúng — **nhưng đây là rủi ro trả nhầm dữ liệu của hợp đồng khác** | **Dev** |
| **AMB-08** | 🟡 | **Trường `budgets` trong schema campaign dùng để làm gì?** Không có trên form UI | Giả định chưa triển khai | **PO** |
| **AMB-09** | 🟡 | **Không có ràng buộc độ dài cho `Campaign Name` và `Description`** ở phía giao diện — không field nào có `maxlength`/`minlength`/`pattern` | Giả định server có giới hạn riêng, chưa kiểm chứng được vì chức năng tạo đang lỗi (`AMB-01`) | **Dev** |
| **AMB-10** | 🟡 | **Ngôn ngữ chuẩn của hệ thống là gì?** Hệ thống có `English` và `Việt Nam`; mọi thông báo ở tài liệu này ghi theo `en_US` | Giả định `en_US` là ngôn ngữ chuẩn để viết Expected Result | **QA Lead / PO** |

---

## 6. Rủi ro kiểm thử (Risk)

| RISK ID | Mức | Nội dung | Ảnh hưởng | Giảm thiểu |
|---|---|---|---|---|
| **RISK-01** | 🔴 | **Chức năng tạo chiến dịch đang lỗi** (`AMB-01`) — chặn toàn bộ luồng nghiệp vụ phía sau: không tạo được chiến dịch thì không tạo được Flight, Creative | Không test được `FLIGHT` và `CRTV` bằng dữ liệu mới | Dùng chiến dịch có sẵn (1188, 1295) để test các module con cho tới khi lỗi được sửa |
| **RISK-02** | 🔴 | **Dữ liệu staging bị ô nhiễm nặng** — trong 10 nhà quảng cáo có **4 mục là payload tấn công** (chuỗi `BCC:…@oastify.com`, `*)(!(!(!(objectClass=*)))`). Chiến dịch có nhiều bản ghi `Copy of Copy of Copy of…` | Không phân biệt được dữ liệu cấu hình thật với rác → Expected Result dễ sai | Đề nghị dọn dữ liệu staging trước khi vào đợt test chính thức |
| **RISK-03** | 🟠 | **Phụ thuộc hệ thống CMS ngoài.** Hai trường bắt buộc (`Contract`, `CMS Campaign`) lấy từ hệ thống khác | CMS ngoài lỗi/chậm → không tạo được chiến dịch, và không rõ hệ thống báo gì | Chuẩn bị kịch bản test CMS ngoài không phản hồi; cân nhắc `/generate-api-mocks` |
| **RISK-04** | 🟠 | **Phiên đăng nhập hết hạn nhanh và im lặng** — quan sát thấy bị đẩy về `/login` giữa chừng mà không có cảnh báo | Test case dài bị đứt giữa chừng, dễ bị chấm FAIL oan | Chia nhỏ test case; đăng nhập lại trước mỗi nhóm |
| **RISK-05** | 🟠 | **DOM có ID trùng lặp và modal cũ không được gỡ.** Quan sát được **4 phần tử cùng `id="end_date"`**, 2 phần tử cùng `id="name"`; modal đã đóng vẫn nằm trong DOM và **chặn click toàn trang** | Automation bắt nhầm phần tử hoặc không click được | Locator phải khoanh trong modal đang hiển thị; tải lại trang giữa các kịch bản |
| **RISK-06** | 🟡 | **Không xác minh được ràng buộc phía server** vì chức năng tạo đang lỗi | Field Spec thiếu phần giới hạn độ dài, ký tự đặc biệt | Kiểm lại sau khi `AMB-01` được sửa |

---

## 7. Luồng nghiệp vụ chính

### Luồng 1 — Tạo chiến dịch mới ⚠️ hiện đang lỗi

```
1. Mở /campaigns
2. Bấm "Create Campaign"
3. Nhập Campaign Name
4. Chọn Advertiser
5. Chọn Contract          (chỉ mục "Approved" chọn được)
6. Chọn CMS Campaign      (mở khoá sau bước 5; chỉ mục "Active" chọn được)
7. Chọn Start Date
8. Chọn End Date          (lịch khoá mọi ngày trước Start Date)
9. Nhập Description       (tuỳ chọn)
10. Chọn Type             (VOD / Display / LiveTV)
11. Bật/tắt Status        (mặc định tắt)
12. Bấm OK
    → KỲ VỌNG: chiến dịch được tạo, xuất hiện đầu danh sách
    → THỰC TẾ: modal đóng, không tạo gì, không báo lỗi  (AMB-01)
```

### Luồng 2 — Xem lịch sử thay đổi

```
1. Mở /campaigns/{id}
2. Bấm "View Log"
3. Modal "Campaign Log" hiện bảng Date · User · Event · Field · Old value · New value
4. Lọc theo User / Event / Date nếu cần
```

### Luồng 3 — Bật/tắt chiến dịch nhanh

```
1. Mở /campaigns
2. Bấm công tắc ở cột Status của dòng cần đổi
3. Nhãn đổi giữa Active / Inactive
```

---

## 8. Phân rã Epic / Story

Module có **38 REQ** (≥ 25) → bắt buộc phân rã.

| Story ID | Tên Story | REQ bao phủ | Số REQ |
|---|---|---|---|
| STORY-CAMP-01 | Xem và tìm chiến dịch | REQ-CAMP-01 · 19 · 20 · 21 · 22 · 23 · 24 | 7 |
| STORY-CAMP-02 | Tạo chiến dịch | REQ-CAMP-02 · 03 · 05 · 09 · 10 · 27 | 6 |
| STORY-CAMP-03 | Ràng buộc dữ liệu khi tạo/sửa | REQ-CAMP-04 · 06 · 07 · 08 | 4 |
| STORY-CAMP-04 | Quản lý vòng đời chiến dịch | REQ-CAMP-11 · 12 · 15 · 16 · 17 · 25 · 26 | 7 |
| STORY-CAMP-05 | Nhật ký và truy vết | REQ-CAMP-13 · 14 · 18 | 3 |
| STORY-CAMP-06 | Đặc tả giao diện web | REQ-CAMP-28 → REQ-CAMP-38 | 11 |

**Kiểm chứng:** 7 + 6 + 4 + 7 + 3 + 11 = **38** ✅ khớp tổng số REQ · mỗi REQ thuộc đúng 1 Story · không REQ nào mồ côi.

### Thứ tự triển khai đề xuất

`STORY-CAMP-01` (xem — không phụ thuộc gì) → `STORY-CAMP-03` (ràng buộc — kiểm được mà không cần tạo thành công) → `STORY-CAMP-06` (giao diện) → `STORY-CAMP-05` (nhật ký) → `STORY-CAMP-04` (vòng đời) → `STORY-CAMP-02` (tạo — **chờ `AMB-01` được sửa**).

---

## Bản đồ tài liệu

| File | Nội dung | Dải REQ |
|---|---|---|
| `requirements_camp.md` *(file này)* | Tổng quan · REQ nghiệp vụ · phân quyền · trạng thái · AMB/RISK · luồng · Epic/Story · nhật ký | `REQ-CAMP-01` → `REQ-CAMP-27` |
| [web/requirements_camp_web.md](web/requirements_camp_web.md) | Field Spec · thông báo validation nguyên văn · đặc tả giao diện web · trình duyệt khảo sát · danh mục evidence | `REQ-CAMP-28` → `REQ-CAMP-38` |

---

## 9. Nhật ký thay đổi

| Ngày | Thay đổi | REQ ảnh hưởng | TC cần xử lý | Nguồn |
|---|---|---|---|---|
| 2026-09-15 | **Phát hành lần đầu.** Sinh 38 REQ · 10 AMB · 6 RISK từ khảo sát UI thực tế và tầng network. Phát hiện lỗi chặn ở chức năng tạo chiến dịch (`AMB-01`) | Toàn bộ | Viết mới | `/generate-requirements-from-website CAMP` |
