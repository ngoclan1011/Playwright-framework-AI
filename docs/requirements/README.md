# Danh mục Requirements — CMS Adsplay

> **Đây là điểm vào cấp hệ thống.** Mọi workflow đụng tới `docs/` phải đọc file này **đầu tiên**.
> Bản đồ hệ thống chi tiết: [`_discovery/system_map.md`](_discovery/system_map.md)

---

## Thuộc tính dự án

| Mục | Giá trị |
|---|---|
| **Hệ thống** | CMS Adsplay — nền tảng quản trị quảng cáo cho FPTPlay (nội bộ) |
| **Tiền tố TC ID** | **`CMS_`** — chốt với user 2026-09-15. Mẫu: `CMS_<MODULE>_TC_<3 số>`, ví dụ `CMS_LOGIN_TC_001`. ⚠️ Đổi giữa chừng là phải sửa toàn bộ TC ID đã sinh |
| **Mẫu mã REQ** | `REQ-<MODULE>-<số>`, ví dụ `REQ-LOGIN-01`. Hệ thống mặc định của repo — không dùng namespace |
| **Nền tảng** | **Web** (1 mặt). Chưa có app mobile, chưa có spec API được cung cấp |
| **Môi trường** | Staging. URL · tài khoản lưu ở `.env` — **không** ghi vào `docs/` |
| **Môi trường dùng chung?** | ❔ Chưa xác nhận rõ, nhưng **user đã cấp quyền ghi** (chốt 2026-09-15 đợt 2): được tạo dữ liệu · **KHÔNG upload file**. Ở đợt khám phá 2 chỉ dùng quyền này để submit 1 form thiếu dữ liệu lấy validation message — **không bản ghi nào được tạo** |
| **Quyền thao tác của QA** | Chốt 2026-09-15 đợt 2:<br>• **Tạo dữ liệu: ✅ được phép** — nên dùng tiền tố nhận biết (`QA_AUTO_<timestamp>`) để phân biệt với dữ liệu thật<br>• **Upload file: ❌ KHÔNG** — tránh sinh job transcode rác<br>• **Sửa/xoá dữ liệu có sẵn: ❔ chưa chốt** — mặc định không đụng<br>⚠️ Staging **đã có sẵn vấn đề dữ liệu rác** (PH-02) và **payload tấn công tồn đọng** (PH-01, PH-09) — mọi dữ liệu tạo thêm nên đặt tên truy vết được |
| **Ngôn ngữ giao diện** | English · Việt Nam. Khảo sát ở `en_US` — ⚠️ **chưa chốt ngôn ngữ chuẩn** để viết Expected Result |
| **Phạm vi** | Chỉ **trang quản trị dành cho admin**. Trang dành cho customer sẽ khảo sát ở đợt sau (user xác nhận 2026-09-15) |
| **Năng lực kiểm thử của QA** | Chốt 2026-09-15 — dùng cho **nhánh Vòng 3** của **mọi** bộ TC sinh về sau:<br>• **Gọi API: ❔ chưa hỏi user** — cần chốt trước khi sinh TC có nhánh API<br>• **Truy vấn CSDL: ❔ chưa hỏi user**<br>• **Kiểm tầng tích hợp: ❔ chưa hỏi user** — hệ thống **có** điểm tích hợp thật (`/api/cms/Contracts` sang CMS ngoài)<br>• **Xem nhật ký hoạt động: ✅ CÓ — đã đo, không phải hỏi.** Nút `View Log` ở màn chi tiết Campaign mở bảng `Date · User · Event · Field · Old value · New value`, lọc theo User/Event/Date. Permission `users.log` cho thấy Người dùng cũng có nhật ký<br>• **DevTools trình duyệt: ✅ CÓ — đã đo.** Backend ở host API riêng, đã thu 30 endpoint `/api/*` |

---

## 1. Bảng danh mục module

| Module | Prefix | Nền tảng | Trạng thái recon | Mức phủ tài liệu | Tài liệu | REQ đã dùng | Mã kế tiếp | AMB treo | Cập nhật |
|---|---|---|---|---|---|---|---|---|---|
| Đăng nhập & Phiên | `LOGIN` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-LOGIN-01` | — | 2026-09-15 |
| Vai trò & Quyền | `ROLE` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-ROLE-01` | — | 2026-09-15 |
| Người dùng | `USER` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-USER-01` | — | 2026-09-15 |
| Nhà quảng cáo | `ADV` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-ADV-01` | — | 2026-09-15 |
| Nhà xuất bản & Kho QC | `PUB` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-PUB-01` | — | 2026-09-15 |
| Chiến dịch | `CAMP` | Web ✅ | ✅ Đã có tài liệu | ⬜ Trắng | [requirements_camp.md](camp/requirements_camp.md) | 01 → 38 | `REQ-CAMP-39` | AMB-01 · AMB-02 | 2026-09-15 |
| Flight | `FLIGHT` | Web ✅ | ✅ Đã có tài liệu | ⬜ Trắng | [requirements_flight.md](flight/requirements_flight.md) | 01 → 40 | `REQ-FLIGHT-41` | AMB-01 · AMB-02 | 2026-09-15 |
| Creative | `CRTV` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-CRTV-01` | — | 2026-09-15 |
| Kiểm duyệt TVC & Media | `MOD` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-MOD-01` | — | 2026-09-15 |
| Nhắm mục tiêu | `TGT` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-TGT-01` | — | 2026-09-15 |
| Cấu hình hệ thống | `CFG` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-CFG-01` | — | 2026-09-15 |
| Báo cáo & Dashboard | `DASH` | Web ⬜ | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-DASH-01` | — | 2026-09-15 |

**Tổng: 12 module** — khớp với bảng module ở [`_discovery/system_map.md`](_discovery/system_map.md) mục 3.

### Prefix đã chiếm — module mới PHẢI chọn prefix ngoài danh sách này

```
ADV · CAMP · CFG · CRTV · DASH · FLIGHT · LOGIN · MOD · PUB · ROLE · TGT · USER
```

### Bảng mã trạng thái recon

| Ký hiệu | Nghĩa | Hành động tiếp theo |
|---|---|---|
| ⬜ | Chưa khảo sát — mới chỉ phát hiện tên và route | Chạy `/generate-requirements-from-website <module>` |
| 🟨 | Đang khảo sát — recon dở dang | Tiếp tục, nêu rõ đang dở ở đâu |
| ✅ | Đã có tài liệu — `requirements_<module>.md` đã phát hành | Sẵn sàng sinh test case |
| ⏸️ | Hoãn — ngoài phạm vi đợt này | Ghi lý do, giữ prefix |
| ⚪ | Chưa implement — phát hiện qua tài liệu/API, UI chưa có | Viết TC trước, đánh `skip` |

---

## 2. Trạng thái REQ toàn hệ thống

**Chưa có REQ nào.** Tầng khám phá chỉ cấp **prefix**, không cấp số REQ — mã REQ là lớp truy vết bất biến, chỉ được cấp khi đã mở từng form và trigger từng validation.

| Module | 🟢 Active | 🟡 Changed | 🔴 Deprecated | ⚪ Chưa implement | Tổng |
|---|---|---|---|---|---|
| Chiến dịch (`CAMP`) | 35 | 3 | 0 | 0 | **38** |
| Flight (`FLIGHT`) | 39 | 1 | 0 | 0 | **40** |
| *(10 module còn lại)* | 0 | 0 | 0 | 0 | **0** |
| **Tổng** | **74** | **4** | **0** | **0** | **78** |

> 4 REQ mang trạng thái 🟡 Changed:
> • `CAMP` — `REQ-CAMP-12` (hai trường trạng thái chưa rõ quan hệ) · `REQ-CAMP-27` (tạo chiến dịch đang lỗi) · `REQ-CAMP-38` (form không reset)
> • `FLIGHT` — `REQ-FLIGHT-40` (trường `Minutes` thiếu thông báo lỗi và thiếu liên kết nhãn)

---

## 3. Ambiguity 🔴 High còn treo

Chưa có `AMB-XX` chính thức — mã AMB được cấp ở tầng module. Nhưng **8 phát hiện** ở tầng khám phá đã sẵn sàng chuyển thành AMB/RISK, ghi đủ tại [`_discovery/system_map.md`](_discovery/system_map.md) mục 7:

| # | Mức | Tóm tắt | Ai xử lý |
|---|---|---|---|
| PH-01 | 🔴 | **Payload tấn công lưu trong bảng Roles** — chuỗi `BCC:<…>@oastify.com` (domain callback out-of-band của Burp Collaborator) nằm trong Role Name | **Đội bảo mật** — xác nhận vết pentest hay xâm nhập thật |
| PH-02 | 🟠 | Dữ liệu rác diện rộng trên staging (role, permission) — không phân biệt được cấu hình thật với rác | PO / Dev dọn dữ liệu |
| PH-03 | 🟠 | Role `admin` khai `No permissions` nhưng toàn quyền → nghi bypass ở server | Dev |
| PH-04 | 🟡 | `GET /api/categories-weight/get/report/metric` trả **400** khi chỉ mở trang | Dev |
| PH-05 | 🟡 | Permission khai 11 module không có UI (`Places`, `Audit`, `Wifi_report`…) — đã thử route, tất cả 404 | PO |
| PH-06 | 🟡 | Đa ngôn ngữ EN · VI — **chưa chốt ngôn ngữ chuẩn** để viết Expected Result | **User / QA Lead** |
| PH-07 | 🟡 | Phiên hết hạn (~15 phút) mà không có thông báo | Dev |
| PH-08 | ⚪ | Workspace nhiều tab giữ pane cũ trong DOM — **ảnh hưởng trực tiếp tới locator automation** | Ghi nhớ khi viết script |
| PH-09 | 🔴 | **Payload tấn công còn ở bảng Advertisers**, không chỉ Roles — 4/10 mục là payload thuộc 4 lớp (OOB exfiltration · XML/XSS · **LDAP injection**) | **Đội bảo mật** — dấu vết quét có hệ thống |
| PH-10 | 🔴 | **API trả HTTP 200 kèm body 401** — script API không được tin mã HTTP status | Dev · và ghi nhớ khi viết API test |
| PH-11 | 🔴 | **Ô upload media nhận `.js` `.html` `.apk` `.pdf` `.xlsx`** — `accept` chỉ là gợi ý client, phải kiểm server | **Đội bảo mật** + Dev |
| PH-12 | 🟠 | Lệch pha UI ↔ dữ liệu ở Creative: `file_type = ortb` có trong dữ liệu nhưng không có trên form; `Ad In Content` có trên form nhưng không có mẫu | PO |
| PH-13 | 🟠 | Backend nhiều chiều hơn UI (flight 48 vs 29 trường · creative 35 vs 11) — nhóm nút tuỳ biến đang được 8/103 creative dùng nhưng không có lối vào UI | PO |
| PH-14 | 🟠 | Token xác thực là hex trần trong header `authorization`, không có `Bearer` | Ghi nhớ khi viết API test |
| PH-15 | 🟡 | `Moderation` và `Process Status` không phải quan hệ 1–1 — kiểm duyệt trượt **có thể tự tắt flight** | PO |
| PH-16 | 🟡 | 2 icon `Action` ở TVC Moderation không có `title`/`aria-label` — lỗi trợ năng + không có gì bám locator | Dev |
| PH-17 | 🟡 | Dropdown `Contract` cho chọn hợp đồng `Expired` | PO |
| PH-18 | 🟡 | Dữ liệu thật vượt ngoài Transcode Guideline (`3840×2160`, `800×500`) | PO |

### Ambiguity 🔴 High của module đã có tài liệu

| AMB ID | Module | Nội dung | Cần ai |
|---|---|---|---|
| **AMB-01** | `CAMP` | 🔴 **Không tạo được chiến dịch mới** — submit form hợp lệ, modal đóng, **không có request `POST` nào**, không tạo gì, không báo lỗi. Tái hiện 2 lần (script và thao tác thật). Chặn toàn bộ luồng nghiệp vụ phía sau | **Dev** — tái hiện thủ công rồi mở bug |
| **AMB-02** | `CAMP` | 🔴 **Thiếu account role thấp** — 34 role, chỉ có 1 admin → ma trận phân quyền toàn bộ là suy diễn | **PO** — xin account `Report Guest` · `Guest_CMS` |
| **AMB-01** | `FLIGHT` | 🔴 **Nhắm quảng cáo tới trẻ em chưa có rào chắn.** Hệ thống cho nhắm `Profile Type = Kid` và `Profile Maturity = Children (Under 13)` / `Teenagers (Under 16)`. Chưa rõ có quy tắc chặn loại quảng cáo không phù hợp (rượu bia, cờ bạc, nội dung người lớn) với nhóm này không | **PO / Pháp chế** |
| **AMB-02** | `FLIGHT` | 🔴 **Thiếu account role thấp** — cùng vấn đề với `CAMP` | **PO** |

> ⚠️ Mã `AMB-XX` đánh số **theo từng module** — `AMB-01` của `CAMP` khác `AMB-01` của `FLIGHT`. Luôn đọc kèm tên module.
> Chi tiết: [camp/requirements_camp.md](camp/requirements_camp.md) mục 5–6 · [flight/requirements_flight.md](flight/requirements_flight.md) mục 5–6.

### Việc cần user/PO cung cấp trước khi recon sâu

| Việc | Vì sao chặn |
|---|---|
| **Account role thấp** (gợi ý `Report Guest` · `Guest_CMS`) | Hệ thống có 34 role, chỉ có 1 account admin → **toàn bộ ma trận phân quyền đang là suy diễn**, không kiểm chứng được |
| **Chốt ngôn ngữ chuẩn** (EN hay VI) | Mọi validation message phụ thuộc ngôn ngữ |
| **Xác nhận staging có dùng chung không** | Quyết định được phép tạo dữ liệu test hay không |
| **Chốt năng lực QA**: gọi API · truy vấn CSDL · kiểm tích hợp | Đầu vào bắt buộc cho nhánh Vòng 3 của mọi bộ TC |

---

## 4. Cấu trúc thư mục chuẩn

```
docs/requirements/
├── README.md                          ← file này — DANH MỤC
├── _discovery/                        ← TẦNG KHÁM PHÁ (không có mã REQ)
│   ├── system_map.md                  ← INDEX bất biến
│   ├── modules/module_NN_<slug>.md    ← 9 file chi tiết module
│   └── evidence/*.png                 ← 1 ảnh tổng quan mỗi module
└── <module>/                          ← TẦNG MODULE (chưa tạo)
    ├── requirements_<module>.md       ← INDEX bất biến — REQ dùng chung mọi nền tảng
    ├── web/requirements_<module>_web.md
    ├── web/evidence/*.png
    ├── analysis/analysis_<TICKET-ID>.md
    └── impact/impact_<TICKET-ID>.md
```

---

## 5. Quy trình sử dụng

| Tình huống | Workflow | Ghi vào đâu |
|---|---|---|
| Recon một module để sinh REQ | `/generate-requirements-from-website <module>` | `<module>/web/` + index `<module>/requirements_<module>.md` |
| Có ticket sửa đổi yêu cầu | `/update-requirements-from-ticket` | Sửa tại chỗ + `impact/impact_<TICKET-ID>.md` |
| Sinh test case sau khi có REQ | `/generate-testcases-manual-rbt` hoặc `/generate-testcases-from-requirements` | `docs/testcases/<module>/web/` |
| Hệ thống có thêm app mobile / spec API | `/discover-system` mode **ADD** | Thêm nền tảng vào **cùng** thư mục module, **giữ nguyên prefix** |
| Rà lại xem hệ thống có gì mới | `/discover-system` mode **DELTA** | Thêm dòng vào Nhật ký khám phá, không ghi đè |
| Sinh ma trận truy vết | `/generate-traceability-matrix` | `docs/executions/` |

---

## 6. Nhật ký danh mục

| Ngày | Thay đổi | Nguồn |
|---|---|---|
| 2026-09-15 | **Khởi tạo danh mục** cho dự án mới. Khám phá lần đầu toàn hệ thống mặt Web, phát hiện **10 module / 29 màn hình**, cấp 10 prefix. Chốt tiền tố TC ID `CMS_`. Ghi nhận 8 phát hiện PH-01→PH-08. Chưa cấp mã REQ nào. Thư mục `docs/` trước đó **chưa tồn tại** → không có gì để đối chiếu, danh mục khớp thư mục thực tế | `/discover-system` mode UI |
| 2026-09-15 | **Recon module `FLIGHT`** — phát hành `requirements_flight.md` + `web/requirements_flight_web.md`, **40 REQ · 9 AMB · 5 RISK**. `FLIGHT` chuyển sang ✅. Đặc tả đủ **30 trường** của form `Create Flight` và **17 chiều nhắm mục tiêu**. Phát hiện vùng rủi ro pháp lý: nhắm quảng cáo theo nhóm tuổi trẻ em (`AMB-01`) | `/generate-requirements-from-website FLIGHT` |
| 2026-09-15 | **Recon module `CAMP`** — phát hành `requirements_camp.md` + `web/requirements_camp_web.md`, **38 REQ · 10 AMB · 6 RISK**. `CAMP` chuyển sang ✅. Đính chính PH-17 ở `system_map.md` (hợp đồng `Expired` thực tế **có** bị khoá). Phát hiện lỗi chặn `AMB-01` | `/generate-requirements-from-website CAMP` |
| 2026-09-15 | **Đợt 2 — khảo sát sâu `CAMP` + `MOD`.** Tách `CAMP` thành **3 module**: `CAMP` (Campaign) · `FLIGHT` (mới) · `CRTV` (mới) → tổng **12 module**, thêm 2 prefix. Ước REQ toàn hệ thống nâng lên **370–480**. Ghi nhận 10 phát hiện mới PH-09→PH-18 (3 mức 🔴). Ghi nhận **quyền ghi** user cấp. **Không cấp mã REQ nào** — tách module ở tầng khám phá không phá traceability vì tầng này không mang mã REQ | `/discover-system` mode ADD |
