# Bản đồ hệ thống — CMS Adsplay (for FPTPlay)

> **Tầng khám phá.** Tài liệu này trả lời *"hệ thống có những module nào"*, **không** đặc tả chi tiết field/rule.
> ❌ **Không** chứa mã `REQ-XXX-NN` — mã REQ chỉ được cấp ở tầng module bởi `/generate-requirements-from-website`.
> Danh mục & trạng thái recon: [`../README.md`](../README.md)

---

## 1. Bối cảnh khảo sát

| Mục | Giá trị |
|---|---|
| **Hệ thống** | CMS Adsplay — nền tảng quản trị quảng cáo cho FPTPlay (nội bộ) |
| **Tiền tố TC ID** | `CMS_` — chốt với user 2026-09-15. Ví dụ `CMS_LOGIN_TC_001` |
| **Ngày khảo sát** | 2026-09-15 |
| **Mode** | **UI** — không có tài liệu nào được cung cấp; sự thật 100% lấy từ hệ thống đang chạy |
| **Mặt đã khảo sát** | **Web** (1 mặt). Chưa có app mobile, chưa có spec API được cung cấp |
| **URL · tài khoản** | Lưu ở `.env` (đã `.gitignore`). **Không** ghi vào `docs/` |
| **Môi trường** | Staging. Áp quy tắc **chỉ đọc** toàn bộ đợt khám phá — không tạo/sửa/xoá bản ghi nào. ⚠️ Chưa được user xác nhận staging có dùng chung hay không → giữ mặc định an toàn |
| **Role đã dùng** | Duy nhất **1 tài khoản admin**. Hệ thống có **34 role** → ma trận phân quyền ở mục 5 phần lớn là **suy diễn**, không phải kiểm chứng |
| **Trình duyệt** | Google Chrome qua Playwright MCP, viewport `1600×750` |
| **Ngôn ngữ giao diện** | Khảo sát ở **English (`en_US`)**. Hệ thống có 2 ngôn ngữ: **English · Việt Nam** |
| **Kiến trúc UI** | SPA hash-routing (`#/route`), Ant Design. Vùng nội dung là **workspace nhiều tab** — mỗi mục menu mở thành một tab và **được giữ lại qua reload** |
| **Tầng network** | ✅ Quan sát được. Backend nằm ở **host API riêng** (xem `.env`), đường dẫn `/api/*`. Thu được 30 endpoint khi crawl |
| **Phạm vi crawl** | Toàn bộ 7 nhóm menu, mở từng mục cấp 2 · 29 màn hình lá · thăm dò 7 route ẩn · mở 1 campaign ở chế độ xem · đọc bảng Roles (34) và Permission (248) |
| **Ngoài phạm vi đợt này** | **Trang dành cho customer** — user đã nêu, sẽ khảo sát ở đợt sau. Tài liệu này chỉ phủ **trang quản trị dành cho admin** |

---

## 2. Sơ đồ điều hướng toàn hệ thống

Cây menu nguyên trạng, kèm route thật lấy từ `data-menu-id` của từng mục:

```
CMS Adsplay
├── Dashboard                                      (nhóm, route cha /dashboard)
│   ├── Report Campaign            /dashboard/report-campaign
│   ├── Report Flights             /dashboard/report-flights
│   ├── AVOD                       /dashboard/avod
│   ├── Ads Valify                 /dashboard/ads-valify
│   └── Error Monitor              /dashboard/error-monitor
├── Moderation                                     (nhóm, route cha /moderation)
│   ├── TVC List                   /moderation/tvc
│   ├── Medias                     /moderation/medias
│   ├── Transcode                  /moderation/transcode
│   └── TVC Moderation             /moderation/tvc-moderation
├── Management                                     (nhóm, route cha /system)
│   ├── User                       /system/users
│   ├── Roles                      /system/roles
│   └── Permission                 /system/permissions
├── Campaign                       /campaigns       (mục lá, không có menu con)
│   └── (chi tiết)                 /campaigns/{id}  — màn "Flight Management"
├── Advertiser                                     (nhóm, route cha /advertiser)
│   ├── Advertisers                /advertiser/advertisers
│   ├── Publishers                 /advertiser/publishers
│   ├── Brands                     /advertiser/brands
│   ├── Placements                 /advertiser/placements
│   └── Webapps                    /advertiser/webapps
├── Target                                         (nhóm, route cha /targeting)
│   ├── Categories                 /targeting/categories
│   ├── Source Providers           /targeting/source-providers
│   ├── User Segments              /targeting/user-segments
│   ├── Provinces                  /targeting/provinces
│   ├── Live TV                    /targeting/live-tv
│   ├── Live Channel               /targeting/live_channel
│   └── Pages Key                  /targeting/pages_key
└── Config                                         (nhóm, route cha /config)
    ├── Whitelist Users            /config/whitelist-users
    ├── Placement Templates        /config/placement_templates
    ├── Email Config               /config/email_config
    └── Category Weight            /config/category-weight
```

**Ngoài cây menu** (không thuộc module nghiệp vụ nào):

| Thành phần | Vị trí | Ghi chú |
|---|---|---|
| Đăng nhập | `/login` | Chưa đăng nhập thì mọi route đều bị đẩy về đây |
| Trang 404 | `/404` | Route không tồn tại bị đẩy về đây, `document.title` đổi thành `404 Page Not Found!` |
| Tìm kiếm nhanh | Header · phím tắt `⌘K` | Chưa khảo sát phạm vi tìm kiếm |
| Đổi ngôn ngữ | Header | 2 lựa chọn: `English` · `Việt Nam` |
| Tuỳ chọn giao diện | Header (bánh răng) | Drawer: Mode · Layout · Presets · Font Family · Size · Page BreadCrumb · **Multi Tab** · Dark Sidebar · FullScreen. **Không phải** cấu hình nghiệp vụ |
| Menu tài khoản | Header (avatar) | Hiện email đăng nhập + **Logout**. Không thấy trang Hồ sơ cá nhân |

---

## 3. Bảng module tổng — 10 module / 29 màn hình lá

| # | Module (tên UI) | Bí danh trong hệ thống | Prefix | Nền tảng | File khám phá | Loại màn hình | Risk | Ước REQ |
|---|---|---|---|---|---|---|---|---|
| 1 | Đăng nhập & Phiên | — | `LOGIN` | Web | [module_01](modules/module_01_dang_nhap.md) | Form | 🔴 | 12–18 |
| 2 | Vai trò & Quyền | `Roles` · `Permission` · perm `roles.*` `permissions.*` | `ROLE` | Web | [module_02](modules/module_02_vai_tro_va_quyen.md) | Danh sách + Modal | 🔴 | 20–25 |
| 3 | Người dùng | `User` · perm `users.*` | `USER` | Web | [module_03](modules/module_03_nguoi_dung.md) | Danh sách + Modal | 🔴 | 20–25 |
| 4 | Nhà quảng cáo | `Advertisers` · `Brands` · API `accounts?model=advertiser` | `ADV` | Web | [module_04](modules/module_04_nha_quang_cao_va_nha_xuat_ban.md) | Danh sách | 🟡 | 20–25 |
| 5 | Nhà xuất bản & Kho QC | `Publishers` · `Webapps` · `Placements` · API `accounts?model=publisher` | `PUB` | Web | [module_04](modules/module_04_nha_quang_cao_va_nha_xuat_ban.md) | Danh sách | 🟡 | 35–45 |
| 6 | Chiến dịch | `Campaign` · perm `campaigns.*` | `CAMP` | Web | [module_05](modules/module_05_chien_dich.md) | Danh sách + chi tiết | 🔴 | 35–45 |
| 6b | Flight | `Flight` · perm `campaigns.flights.*` | `FLIGHT` | Web | [module_10](modules/module_10_flight_creative.md) | Biên tập lồng trong `/campaigns/{id}` | 🔴 | 40–50 |
| 6c | Creative | `Creative` · perm `campaigns.creatives` | `CRTV` | Web | [module_11](modules/module_11_creative.md) | Form động lồng trong khối flight | 🔴 | 35–45 |
| 7 | Kiểm duyệt TVC & Media | `TVC List` · `Medias` · `Transcode` · `TVC Moderation` | `MOD` | Web | [module_06](modules/module_06_kiem_duyet_tvc_media.md) | Lưới thẻ + Danh sách | 🔴 | 45–60 |
| 8 | Nhắm mục tiêu | `Target` · 7 màn danh mục | `TGT` | Web | [module_07](modules/module_07_nham_muc_tieu.md) | Danh sách | 🟡 | 45–60 |
| 9 | Cấu hình hệ thống | `Config` · 4 màn | `CFG` | Web | [module_08](modules/module_08_cau_hinh_he_thong.md) | Cấu hình | 🟡 | 30–40 |
| 10 | Báo cáo & Dashboard | `Dashboard` · 5 màn báo cáo | `DASH` | Web | [module_09](modules/module_09_bao_cao_dashboard.md) | Dashboard/Báo cáo | 🟡 | 35–45 |

**Tổng: 12 module** — khớp với số dòng ở [`../README.md`](../README.md). Ước tổng **370–480 REQ**.

### Quyết định ranh giới đã chốt với user

| Quyết định | Lý do | Rủi ro nếu sai |
|---|---|---|
| **Đợt 1 (2026-09-15): `CAMP` gộp Campaign + Flight + Creative** | Ba tầng lồng nhau trên cùng màn `/campaigns/{id}`, không tồn tại độc lập. Theo luật *nghi ngờ thì gộp* | — **đã đảo ở đợt 2** |
| **Đợt 2 (2026-09-15): tách thành 3 module `CAMP` · `FLIGHT` · `CRTV`** | Khảo sát sâu cho thấy mỗi tầng đủ nặng để đứng riêng: Flight có **29 field · 17 chiều nhắm mục tiêu**; Creative có **form động 3 tầng · 3 lệch pha UI↔dữ liệu · 2 mắt xích cắt ngang module**. User chốt *"Flight thuộc con của Camp, nếu tách không gây ảnh hưởng logic thì tách"* và *"creative cũng khá phức tạp, tách luôn"* | **Không rủi ro traceability** — tầng khám phá không mang mã REQ (mục 5.8 của skill), nên tách/gộp lại là thao tác an toàn |
| **Creative theo `CRTV` riêng, không ở lại `CAMP` hay `FLIGHT`** | `creative.flight_id` trỏ vào flight · nút `New creative` nằm trong khối flight · danh sách creative hiển thị theo từng flight | Thấp |
| **Tách `ADV` / `PUB`, không theo menu** | Menu `Advertiser` gom 5 màn nhưng thực chất là **hai phía thị trường**: bên mua (Advertiser, Brand) và bên bán (Publisher, Webapp, Placement — Placement mang `Publisher Code` và gắn `Webapp`) | Thấp — ranh giới dữ liệu rõ ràng |
| **`ROLE` gộp Roles + Permission** | Permission là thành phần cấu thành Role, luôn được sửa cùng nhau | Thấp |
| **`CFG` gom 4 màn cấu hình rời rạc** | Tránh đẻ 4 prefix cho 4 trang cấu hình nhỏ | Thấp |

---

## 4. Bản đồ entity & phụ thuộc

```
Advertiser ──┐
             ├──> Campaign ──> Flight ──> Creative ──> MediaFile ──> Transcode
Brand ───────┘       │           │                         │
                     │           │                         └──> TVC Moderation (duyệt nội dung)
Contract (CMS ngoài)─┘           │
CMS Campaign (CMS ngoài)─────────┘
                                 │
Publisher ──> Webapp ──> Placement ──> (Flight nhắm vào)
                             │
                   Placement Template

Target: Category · Source Provider · User Segment · Province · Live TV Event · Live Channel · Pages Key
        └──> tham số nhắm mục tiêu của Flight

User ──> Role ──> Permission
```

**Quan hệ đọc được từ tầng network và từ màn hình chi tiết:**

| Quan hệ | Bằng chứng |
|---|---|
| `Advertiser` và `Publisher` là **cùng một bảng** `accounts`, phân biệt bằng tham số `model` | `GET /api/accounts?model=advertiser` và `GET /api/accounts?model=publisher` |
| `Campaign` tham chiếu sang **hệ thống CMS khác** | Form Create Campaign có field `Contract` và `CMS Campaign`; gọi `GET /api/cms/Contracts`. Màn chi tiết hiển thị `Contract: HDNB`, `CMS Campaign: Campaign Nội Bộ` |
| `Flight` gắn với `Publisher` + `Webapp` | Màn chi tiết campaign: `Publisher: FPT Play`, `Web app: SSAI PC Web LiveTV - 11340112` |
| `Placement` gắn `Webapp` + `Placement Template` | Cột bảng Placements |
| `Creative` sinh ra `MediaFile` đi qua `Transcode` rồi tới `TVC Moderation` | Bảng Transcode và TVC Moderation dùng chung cột `Moderation`, `Status` |

### Endpoint thu được ở tầng network (30 endpoint, đều `GET` — chỉ quan sát thụ động)

```
/api/accounts               /api/brands                  /api/campaigns
/api/categories             /api/categories-weight       /api/cms/Contracts
/api/creatives              /api/email-group-recipients  /api/error-logs-agg
/api/flights                /api/livechannels            /api/livetvevents
/api/pages-key              /api/permissions             /api/placement-templates
/api/placements             /api/provinces               /api/report/avod
/api/roles                  /api/source-providers        /api/users
/api/stats/tvc-quality      /api/stats/tvc-quality-by-cid
/api/stats/tvc-quality-daily                             /api/user-segment
/api/website-apps           /api/whitelist-users
/api/report/avod/source-provider                         /api/report/flights/realtime
/api/categories-weight/get/report/metric   ← trả 400, xem PH-04
```

> Quy ước phân trang quan sát được: `offset` · `limit` · `order=<field>|desc` · `page`. **Không đồng nhất** — có endpoint dùng `page`, có endpoint dùng `offset`.

---

## 5. Ma trận phân quyền sơ bộ (cấp module)

⚠️ **Chỉ có 1 tài khoản admin.** Hệ thống khai báo **34 role** và **248 dòng permission**. Ma trận dưới đây suy từ **bảng Permission của chính hệ thống**, chưa đăng nhập role nào khác để kiểm chứng.

| Module | Permission tương ứng (đọc từ màn Permission) | Admin | Các role khác |
|---|---|---|---|
| `LOGIN` | — (ai cũng vào được) | ✅ Đã kiểm chứng | ❔ |
| `ROLE` | `roles.*` · `permissions.*` | ✅ Đã kiểm chứng | ⚠️❌ Chỉ vài role có `roles.all` |
| `USER` | `users.all` · `users.view` · `users.log` | ✅ Đã kiểm chứng | ⚠️ Nhiều role có `users.*` |
| `ADV` | `advertisers.all/view/create/update` · `brands.*` | ✅ Đã kiểm chứng | ⚠️ Phổ biến ở mức `view` |
| `PUB` | `publishers.*` · `webapps.*` · `placements.*` | ✅ Đã kiểm chứng | ⚠️ Phổ biến ở mức `view` |
| `CAMP` | `campaigns.all/view/update` · `campaigns.flights.view` · `campaigns.report` · `campaigns.creatives` | ✅ Đã kiểm chứng | ⚠️ Có role chỉ `campaigns.report` |
| `MOD` | `medias.view` · `mediafiles.*` · `tvcs.*` | ✅ Đã kiểm chứng | ⚠️ Có role chỉ `medias.view` |
| `TGT` | `categories.*` · `sourceproviders.*` · `usersegment.*` · `provinces.*` · `livetvevents.*` · `livechannels.*` · `pageskeys.*` | ✅ Đã kiểm chứng | ⚠️ |
| `CFG` | `whitelist-users.*` · `placement_templates.*` · `emailconfigs.*` · `email_groups.*` · `categoriesweight.*` | ✅ Đã kiểm chứng | ⚠️ |
| `DASH` | `dashboard.*` · `avod.view` · `ad-valify.*` | ✅ Đã kiểm chứng | ⚠️ Có role chỉ `avod.view` |

**Tổng kết độ tin cậy:** Đã kiểm chứng **10 ô** (toàn bộ cột Admin) · Suy diễn **10 ô** · Chưa có căn cứ trực tiếp **34 role × 10 module**.

📌 **Việc cần làm ở tầng module:** xin ít nhất 2 account role thấp — gợi ý `Report Guest` (chỉ có `campaigns.report`) và `Guest_CMS` (toàn quyền ở mức `view`) — để chuyển ⚠️ thành ✅.

---

## 6. Thứ tự khảo sát đã chốt

Xếp theo **phụ thuộc trước, risk sau** — không theo alphabet:

| Thứ tự | Module | Vì sao đứng ở đây |
|---|---|---|
| 1 | `LOGIN` | Cổng vào, mọi module khác phụ thuộc |
| 2 | `ROLE` | Định nghĩa quyền — chi phối ma trận phân quyền của toàn bộ module còn lại |
| 3 | `USER` | Gắn role vào người dùng; cần `ROLE` xong trước |
| 4 | `ADV` | Advertiser là **dữ liệu cha** của Campaign |
| 5 | `PUB` | Publisher/Webapp/Placement là **dữ liệu cha** của Flight |
| 6 | `CAMP` | Lõi nghiệp vụ — phụ thuộc cả 4 và 5 |
| 6b | `FLIGHT` | Con của Campaign — cần `CAMP` xong trước; phụ thuộc `PUB` (webapp) và `TGT` (chiều nhắm mục tiêu) |
| 6c | `CRTV` | Con của Flight — cần `FLIGHT` xong trước |
| 7 | `MOD` | Kiểm duyệt media mà `CRTV` tiêu thụ |
| 8 | `TGT` | Dữ liệu nhắm mục tiêu cho Flight |
| 9 | `CFG` | Cấu hình, ít thay đổi |
| 10 | `DASH` | Báo cáo — phụ thuộc dữ liệu của mọi module trên |

**Module `BLOCKED`:** không module nào bị chặn hoàn toàn. Nhưng **mọi module đều bị chặn một phần** ở mảng phân quyền cho tới khi có account role thấp.

---

## 7. Phát hiện khi khám phá

> Quan sát ở tầng khám phá. Ở tầng module chúng sẽ được chuyển thành `AMB-XX` / `RISK-XX` có mã chính thức.

| # | Mức | Phát hiện | Bằng chứng |
|---|---|---|---|
| PH-01 | 🔴 | **Payload tấn công được lưu trong dữ liệu.** Một bản ghi ở bảng Roles có tên chứa `view onlyz> BCC:<32 ký tự>@oastify.com ymp: f`. `oastify.com` là domain callback out-of-band của Burp Collaborator, kèm tiền tố `BCC:` — dấu hiệu thử **email header injection / OOB exfiltration** qua trường Role Name, và payload **vẫn còn nằm trong dữ liệu**. Cần xác nhận là vết pentest hay xâm nhập thật | `/system/roles` |
| PH-02 | 🟠 | **Dữ liệu rác diện rộng trên staging.** Hơn nửa trong 34 role là rác (`FEEEEEEÊE`, `testz123`, `test 123`, `JS023`, `iphones6`, `DuckCITY`, `JKSs56`…). Bảng Permission 248 dòng có `Bghhgh`, `Bgthgtht`, `Jyhjhyj`, `Ssssss`, `Test11`, `Test23`, `1 34`, `Change System1z`, `Taiqui`. Không phân biệt được cấu hình thật với rác → ảnh hưởng trực tiếp tới việc viết Expected Result | `/system/roles` · `/system/permissions` |
| PH-03 | 🟠 | **Role `admin` hiển thị `No permissions`** nhưng tài khoản admin lại thấy và thao tác được toàn bộ menu → nghi có logic **bypass cho admin ở tầng server**. Ba role khác cũng `No permissions`: `csoc-nopermission`, `test 183 update`, `TH true milk` | `/system/roles` |
| PH-04 | 🟡 | **Lỗi API khi chỉ mở trang, không thao tác gì.** `GET /api/categories-weight/get/report/metric` trả **400** ngay khi mở màn Category Weight | `/config/category-weight` |
| PH-05 | 🟡 | **Permission khai nhiều module không có UI.** `Places`, `Places.Zones`, `Places.Wifi_mac_address`, `Places.Access_points`, `Wifi_report`, `Inventory_report`, `Audit`, `Workbench`, `Adsgroup`, `Creativetypes`, `Fshop`. **Đã thử mở trực tiếp** `/places` `/audit` `/workbench` `/wifi-report` `/inventory-report` `/adsgroup` `/creativetypes` → **tất cả trả 404**. Ghi `❔ Nghi có, chưa xác minh` — **không** đưa vào danh mục module | Thử route trực tiếp |
| PH-06 | 🟡 | **Hệ thống đa ngôn ngữ EN · VI.** Mọi validation message phụ thuộc ngôn ngữ đang chọn. Đợt này khảo sát ở `en_US` — cần chốt ngôn ngữ chuẩn trước khi viết Expected Result | Header · đổi ngôn ngữ |
| PH-07 | 🟡 | **Phiên đăng nhập hết hạn giữa chừng** khi đang khảo sát (khoảng 15 phút), bị đẩy về `/login` mà không có thông báo. Cần xác minh thời gian sống của phiên — ảnh hưởng tới thiết kế test dài | Quan sát trong lúc crawl |
| PH-09 | 🔴 | **Payload tấn công còn nằm ở bảng Advertisers, không chỉ Roles (mở rộng PH-01).** Dropdown `Advertiser` của form Create Campaign lộ **4/10 mục là payload**, thuộc ít nhất 4 lớp tấn công: `a> BCC:<40 ký tự>@oastify.com yqr: d` và `a BCC:<40 ký tự>@oastify.com irj: w` (email header injection / OOB exfiltration) · `a]]>><` (thoát ngữ cảnh XML/XXE hoặc XSS) · `*)(!(!(!(objectClass=*)))` (**LDAP injection**). Đây là dấu vết một đợt quét **có hệ thống**, không phải thử lẻ | Form Create Campaign · `/campaigns` |
| PH-10 | 🔴 | **API trả HTTP 200 nhưng thân phản hồi là 401.** `GET /api/cms/Campaigns` có mã HTTP `200`, body `{"status":401,"msg":"Unauthorized"}`. ⚠️ **Hệ quả cho automation:** mọi script API **không được tin mã HTTP status**, phải đọc trường `status` trong body. Không phát hiện sớm thì cả bộ API test pass giả. Bao bọc phản hồi chuẩn của hệ thống là `{status, data, meta}` | Tầng network |
| PH-11 | 🔴 | **Ô upload media nhận cả định dạng thực thi.** `accept` của `Create Media`: `.mp4 .webm .m3u8 .ts .png .jpg .jpeg .gif .webp .js .css .xml .txt .pdf .apk .xlsx .html .json`. Hệ thống quảng cáo nhưng nhận `.js`, `.html`, `.apk`, `.pdf`, `.xlsx` → stored XSS, phát tán `.apk` qua CDN quảng cáo. `accept` chỉ là gợi ý phía trình duyệt — **phải kiểm server có chặn thật không**. Lưu ý: `.js`/`.css`/`.json` có thể hợp lệ cho creative HTML (`extend_source`) | `/moderation/medias` → `Create Media` |
| PH-12 | 🟠 | **Lệch pha UI ↔ dữ liệu ở Creative.** `file_type = ortb` tồn tại trong dữ liệu (1/103) nhưng **không có trong dropdown UI** → có nguồn creative thứ ba (OpenRTB/programmatic) không tạo được từ form. Ngược lại `Display Type = Ad In Content` có trên UI nhưng không có mẫu nào trong dữ liệu | Form Create Creative · campaign 1188 |
| PH-13 | 🟠 | **Backend có nhiều chiều hơn UI.** Schema flight **48 trường** / form UI **29**; schema creative **35 trường** / form UI tối đa **11**. Thiếu trên UI: `countries` `mobile_carriers` `zones` `regions` `scenes` `positions` `buy_type` `ad_type` (flight) · nhóm nút tuỳ biến `is_custom_button` + `btn_*` (creative, **8/103 bản ghi đang dùng**). Cần PO xác nhận chưa làm UI hay đã gỡ | `GET /api/campaigns/1188?includes=…` |
| PH-14 | 🟠 | **Token xác thực là chuỗi hex trần trong header `authorization`**, không có tiền tố `Bearer`. Hình thái: `<40 ký tự hex>`. Ghi lại để bước automation API biết cách gắn token | Request header |
| PH-15 | 🟡 | **`Moderation` và `Process Status` không phải quan hệ 1–1.** Quan sát được dòng `Moderation = Passed` nhưng `Process Status = Turn off Flight`. Kiểm duyệt trượt **có thể tự tắt flight** → quảng cáo ngừng phát. Vùng logic dễ sinh bug, phải làm rõ | `/moderation/tvc-moderation` |
| PH-16 | 🟡 | **Hai biểu tượng cột `Action` ở TVC Moderation không có `title` lẫn `aria-label`.** Vừa là lỗi trợ năng, vừa khiến automation **không có thuộc tính ngữ nghĩa nào để bám locator** — buộc phải dùng vị trí, vốn dễ gãy | `/moderation/tvc-moderation` |
| PH-17 | ~~🟡~~ ✅ | ~~**Dropdown `Contract` cho chọn hợp đồng đã `Expired`**~~ — **ĐÃ ĐÍNH CHÍNH 2026-09-15 khi recon module `CAMP`.** Kiểm lại trên trang vừa tải mới: hợp đồng `Expired` **bị khoá** (`ant-select-item-option-disabled`), chỉ mục `Approved` chọn được. Quan sát sai ở đợt khám phá do đọc DOM khi trang còn modal cũ chồng lên. Hệ thống **nhất quán**: cả `Contract` và `CMS Campaign` đều khoá mục hết hiệu lực → thành `REQ-CAMP-04` và `REQ-CAMP-06` | Form Create Campaign |
| PH-18 | 🟡 | **Dữ liệu thật vượt ngoài Transcode Guideline.** Guideline công bố 3 profile `1080p`/`720p`/`480p`, nhưng creative thật có `3840×2160` (4K) và `800×500`. Cần PO xác nhận Guideline là ràng buộc cứng hay khuyến nghị | Guideline ↔ dữ liệu campaign 1188 |
| PH-08 | ⚪ | **Workspace nhiều tab được giữ qua reload.** Tab đã mở vẫn còn sau khi tải lại trang, và pane của tab cũ **vẫn nằm trong DOM** ở trạng thái ẩn. ⚠️ **Ảnh hưởng trực tiếp tới automation**: locator không khoanh vùng pane đang hiện sẽ bắt nhầm phần tử của tab khác. Bật/tắt ở drawer tuỳ chọn giao diện (`Multi Tab`) | Xác định qua DOM |

---

## Bản đồ tài liệu

| File | Module bao phủ | Prefix | Thứ tự khảo sát |
|---|---|---|---|
| [modules/module_01_dang_nhap.md](modules/module_01_dang_nhap.md) | Đăng nhập & Phiên | `LOGIN` | 1 |
| [modules/module_02_vai_tro_va_quyen.md](modules/module_02_vai_tro_va_quyen.md) | Vai trò & Quyền | `ROLE` | 2 |
| [modules/module_03_nguoi_dung.md](modules/module_03_nguoi_dung.md) | Người dùng | `USER` | 3 |
| [modules/module_04_nha_quang_cao_va_nha_xuat_ban.md](modules/module_04_nha_quang_cao_va_nha_xuat_ban.md) | Nhà quảng cáo · Nhà xuất bản & Kho QC | `ADV` · `PUB` | 4 · 5 |
| [modules/module_05_chien_dich.md](modules/module_05_chien_dich.md) | Chiến dịch | `CAMP` | 6 |
| [modules/module_10_flight_creative.md](modules/module_10_flight_creative.md) | Flight | `FLIGHT` | 6b |
| [modules/module_11_creative.md](modules/module_11_creative.md) | Creative | `CRTV` | 6c |
| [modules/module_06_kiem_duyet_tvc_media.md](modules/module_06_kiem_duyet_tvc_media.md) | Kiểm duyệt TVC & Media | `MOD` | 7 |
| [modules/module_07_nham_muc_tieu.md](modules/module_07_nham_muc_tieu.md) | Nhắm mục tiêu | `TGT` | 8 |
| [modules/module_08_cau_hinh_he_thong.md](modules/module_08_cau_hinh_he_thong.md) | Cấu hình hệ thống | `CFG` | 9 |
| [modules/module_09_bao_cao_dashboard.md](modules/module_09_bao_cao_dashboard.md) | Báo cáo & Dashboard | `DASH` | 10 |

**11 file · 12 module** — mỗi module thuộc đúng một file, không mồ côi, không trùng.

> ⚠️ File `module_10_flight_creative.md` **giữ nguyên tên** dù nội dung Creative đã chuyển sang `module_11_creative.md` — theo quy tắc *không đổi tên file module đã có* để link cũ không gãy. Thứ tự khảo sát cập nhật ở mục 6, không ở tên file.
Trạng thái recon **chỉ** ghi ở [`../README.md`](../README.md); file module ở đây tham chiếu, không nhân bản.

---

## 8. Nhật ký khám phá

| Ngày | Mode | Mặt | Phạm vi | Kết quả | Nguồn |
|---|---|---|---|---|---|
| 2026-09-15 | UI | Web | Khảo sát lần đầu toàn hệ thống. Crawl 7 nhóm menu → 29 màn lá · thăm dò 7 route ẩn · đọc 34 role + 248 permission · mở 1 campaign ở chế độ xem · thu 30 endpoint | Khởi tạo bản đồ **10 module**, cấp prefix `LOGIN` `ROLE` `USER` `ADV` `PUB` `CAMP` `MOD` `TGT` `CFG` `DASH`. Chốt tiền tố TC ID `CMS_`. Ghi nhận 8 phát hiện PH-01→PH-08. **Không** cấp mã REQ nào | `/discover-system` mode UI · UI thực tế |
| 2026-09-15 | — | Web | **Recon cấp module `CAMP`** (`/generate-requirements-from-website`) | Sinh `REQ-CAMP-01`→`38`. **Đính chính PH-17** — hợp đồng `Expired` thực tế **có** bị khoá, quan sát sai ở đợt 2 do modal cũ chồng lên. **Phát hiện lỗi chặn mới:** không tạo được chiến dịch — submit form hợp lệ nhưng không có `POST` nào, không báo lỗi (tái hiện 2 lần) → `AMB-01` 🔴 | `/generate-requirements-from-website CAMP` |
| 2026-09-15 | ADD | Web | **Đợt 2 — khảo sát sâu `CAMP` + `MOD`** theo yêu cầu user. Mở đủ 3 form tạo (Campaign 9 field · Flight 29 field · Creative form động 7→11 field) · kiểm chuỗi phụ thuộc dropdown · đọc dữ liệu tham chiếu **campaign 1188** (21 flight · 103 creative) qua `GET /api/campaigns/1188?includes=…` · đọc Transcode Guideline · submit 1 form thiếu dữ liệu để bắt validation message. **Không upload file, không tạo bản ghi nào** | **Tách `CAMP` thành 3 module**: `CAMP` (Campaign) · **`FLIGHT`** (mới) · **`CRTV`** (mới) → tổng **12 module**. Dựng được chuỗi `MOD → CRTV → FLIGHT → thiết bị`. Ghi nhận 10 phát hiện mới PH-09→PH-18, trong đó **3 mức 🔴**. Cập nhật `module_05` · `module_06`, thêm `module_10` · `module_11`. **Không** cấp mã REQ nào | `/discover-system` mode ADD · UI thực tế + tầng network |
