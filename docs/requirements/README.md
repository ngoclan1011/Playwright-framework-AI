# Danh mục Requirements — Perfex CRM (Anh Tester Demo)

> **Điểm vào cấp hệ thống.** Mọi workflow đụng tới `docs/` đọc file này **trước tiên**: module nào đã có tài liệu · **prefix nào đã bị chiếm** · mã REQ kế tiếp · ambiguity 🔴 còn treo.
>
> Bản đồ hệ thống chi tiết: [`_discovery/system_map.md`](_discovery/system_map.md)

| Mục | Giá trị |
|---|---|
| Hệ thống | Perfex CRM — Anh Tester Demo |
| Tiền tố TC ID | `CRM_` → `CRM_<MODULE>_TC_<3 số>` |
| Môi trường dùng chung | **CÓ** — cấm thao tác phá huỷ, phải dọn dữ liệu test sau khi chạy |
| URL · tài khoản | `.env` (không commit) — **KHÔNG** ghi credentials vào `docs/` |
| Khởi tạo | 2026-08-14 bởi `/discover_system` (Mode UI) |

---

## 1. Bảng danh mục module (23 module)

| Module | Prefix | Trạng thái recon | Mức phủ tài liệu | Tài liệu | REQ đã dùng | Mã kế tiếp | AMB treo | Cập nhật |
|---|---|---|---|---|---|---|---|---|
| Đăng nhập / Xác thực | `LOGIN` | ✅ Đã có tài liệu | ⬜ Trắng | [login/requirements_login.md](login/requirements_login.md) | `REQ-LOGIN-01` → `REQ-LOGIN-35` (35) | `REQ-LOGIN-36` | 4 🔴 (AMB-01→04) · 9 🟡 · 1 🟢 | 2026-08-14 |
| Khách hàng | `CUST` | ✅ Đã có tài liệu | ⬜ Trắng | [customers/requirements_customers.md](customers/requirements_customers.md) | `REQ-CUST-01` → `REQ-CUST-79` (79) | `REQ-CUST-80` | 4 🔴 (AMB-15→17, AMB-25) · 8 🟡 · 1 🟢 | 2026-08-14 |
| Liên hệ khách hàng | `CONT` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-CONT-01` | — | 2026-08-14 |
| Khách hàng tiềm năng | `LEAD` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-LEAD-01` | — | 2026-08-14 |
| Dự án | `PRJ` | ✅ Đã có tài liệu | ⬜ Trắng | [projects/requirements_projects.md](projects/requirements_projects.md) | `REQ-PRJ-01` → `REQ-PRJ-104` (104) | `REQ-PRJ-105` | 6 🔴 (AMB-28→31, 33, 41) · 7 🟡 · 3 🟢 | 2026-08-14 |
| Công việc | `TASK` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-TASK-01` | — | 2026-08-14 |
| Báo giá sơ bộ (Estimates) | `EST` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-EST-01` | — | 2026-08-14 |
| Đề xuất (Proposals) | `PROP` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-PROP-01` | — | 2026-08-14 |
| Hoá đơn | `INV` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-INV-01` | — | 2026-08-14 |
| Thanh toán | `PAY` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-PAY-01` | — | 2026-08-14 |
| Giấy báo có (Credit Notes) | `CN` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-CN-01` | — | 2026-08-14 |
| Đăng ký định kỳ | `SUB` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-SUB-01` | — | 2026-08-14 |
| Hợp đồng | `CTR` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-CTR-01` | — | 2026-08-14 |
| Chi phí | `EXP` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-EXP-01` | — | 2026-08-14 |
| Danh mục hàng hoá/dịch vụ | `ITEM` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-ITEM-01` | — | 2026-08-14 |
| Hỗ trợ (Tickets) | `TICK` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-TICK-01` | — | 2026-08-14 |
| Yêu cầu báo giá | `ESTREQ` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-ESTREQ-01` | — | 2026-08-14 |
| Cơ sở tri thức | `KB` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-KB-01` | — | 2026-08-14 |
| Báo cáo | `REP` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-REP-01` | — | 2026-08-14 |
| Dashboard | `DASH` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-DASH-01` | — | 2026-08-14 |
| Việc cần làm (To Do) | `TODO` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-TODO-01` | — | 2026-08-14 |
| Nhắc nhở | `REM` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-REM-01` | — | 2026-08-14 |
| Hồ sơ cá nhân & Chấm công | `PROF` | ⬜ Chưa khảo sát | ⬜ Trắng | — | — | `REQ-PROF-01` | — | 2026-08-14 |

**Bảng mã trạng thái recon:** ⬜ Chưa khảo sát · 🟨 Đang khảo sát · ✅ Đã có tài liệu · ⏸️ Hoãn · ⚪ Chưa implement
**Bảng mã mức phủ tài liệu:** 🟩 Đầy đủ · 🟨 Một phần · ⬜ Trắng · ⚠️ Nghi lỗi thời

### Prefix đã chiếm (module mới PHẢI chọn prefix ngoài danh sách này)

```
LOGIN · CUST · CONT · LEAD · PRJ · TASK · EST · PROP · INV · PAY · CN · SUB
CTR · EXP · ITEM · TICK · ESTREQ · KB · REP · DASH · TODO · REM · PROF
```

### Vùng chưa cấp prefix (ngoài phạm vi đợt 2026-08-14)

| Vùng | Lý do | Muốn đưa vào thì làm gì |
|---|---|---|
| Quản trị hệ thống (Setup: Settings · Staff · Roles · Departments · Taxes · Currencies · Payment Modes · Custom Fields · Email Templates) | 403 với tài khoản hiện tại | Xin account quyền cao hơn → chạy `/discover_system` **Mode ADD** |
| Calendar · Media · Bulk PDF Export | User chốt loại khỏi phạm vi | Chạy `/discover_system` **Mode ADD** khi cần |
| Cổng khách hàng (front-end ngoài `/admin`) | Chưa chốt phạm vi | Chốt phạm vi rồi chạy Mode ADD |

---

## 2. Trạng thái REQ toàn hệ thống

Đã recon **3/23 module**. Ước lượng khi recon xong toàn hệ thống: **~700–950 REQ** (nâng từ ~560–780 — cả ba module đã recon đều vượt xa ước lượng của tầng khám phá).

| Trạng thái | Số lượng | Chi tiết |
|---|---|---|
| 🟢 Active | 212 | `LOGIN` 34 · `CUST` 78 · `PRJ` 100 |
| 🟡 Changed | 0 | — |
| 🔴 Deprecated | 0 | — |
| ⚪ Chưa implement | 6 | `LOGIN` 1 — `REQ-LOGIN-27` (luồng gửi mail đặt lại mật khẩu, chưa kiểm chứng được) · `CUST` 1 — `REQ-CUST-79` (kết quả nhập CSV, không tải tệp lên môi trường dùng chung) · `PRJ` 4 — `REQ-PRJ-89`, `91`, `94` (CRUD mốc tiến độ / tệp / thảo luận, không chạy trên môi trường dùng chung) và `REQ-PRJ-104` (nội dung tệp `Export project data`, không tải tệp về) |
| **Tổng** | **218** | |

---

## 3. Ambiguity 🔴 High còn treo

### 3.1. Ambiguity 🔴 High theo module

| Mã | Module | Câu hỏi | Chặn cái gì |
|---|---|---|---|
| [AMB-01](login/requirements_login.md#111-ambiguities) | `LOGIN` | Hệ thống có bao nhiêu vai trò, tên là gì? Xin tài khoản vai trò thấp hơn | Ma trận phân quyền của **mọi** module |
| [AMB-02](login/requirements_login.md#111-ambiguities) | `LOGIN` | Có khoá tài khoản sau N lần đăng nhập sai không? Ngưỡng bao nhiêu? | STORY-LOGIN-03 — chưa test được kịch bản khoá tài khoản |
| [AMB-03](login/requirements_login.md#111-ambiguities) | `LOGIN` | Liên kết đặt lại mật khẩu sai mã khoá trả HTTP 500 trắng trang — lỗi hay thiết kế? | STORY-LOGIN-05 |
| [AMB-04](login/requirements_login.md#111-ambiguities) | `LOGIN` | Quên mật khẩu với email **có thật** trả về gì? Kiểm chứng luồng gửi mail thế nào trên môi trường dùng chung? | STORY-LOGIN-05 · `REQ-LOGIN-27` đang ⚪ |
| [AMB-15](customers/requirements_customers.md#111-ambiguities) | `CUST` | Xin tài khoản vai trò `Project Manager` và các vai trò khác để kiểm chứng 24 ô bỏ trống trong ma trận phân quyền | Ma trận phân quyền của `CUST` — BLOCKED hoàn toàn |
| [AMB-16](customers/requirements_customers.md#111-ambiguities) | `CUST` | Company chỉ chứa khoảng trắng vẫn tạo được khách hàng "tên rỗng" — lỗi hay cố ý? | STORY-CUST-06 · ảnh hưởng dropdown chọn khách hàng của 10+ module |
| [AMB-17](customers/requirements_customers.md#111-ambiguities) | `CUST` | Lỗi bắt buộc ở tab ẩn chỉ đổi màu nhãn tab, **không** tự chuyển tab — chấp nhận được không? | STORY-CUST-06 |
| [AMB-25](customers/requirements_customers.md#111-ambiguities) | `CUST` | Xoá khách hàng đang có hoá đơn / dự án / hợp đồng thì hệ thống xử lý ra sao? | STORY-CUST-08 — cần môi trường riêng để kiểm chứng |
| [AMB-28](projects/requirements_projects.md#71-ambiguities) | `PRJ` | Xin tài khoản vai trò `Project Manager` và các vai trò khác để kiểm chứng 28 ô bỏ trống trong ma trận phân quyền | Ma trận phân quyền của `PRJ` — BLOCKED hoàn toàn |
| [AMB-29](projects/requirements_projects.md#71-ambiguities) | `PRJ` | Bảng tổng quan đếm **67** dự án `In Progress` nhưng lọc ra đúng **60** dòng (lệch 7); 4 trạng thái còn lại khớp chính xác. Số nào đúng? | STORY-PRJ-01 · Dashboard cũng hiển thị `67 / 125` theo nguồn sai này |
| [AMB-30](projects/requirements_projects.md#71-ambiguities) | `PRJ` | Xoá dự án **thành công** nhưng chuyển tới `/admin/not_found` kèm `Something went wrong. Try again` — không có thông báo thành công | STORY-PRJ-10 · test thủ công sẽ chấm FAIL nhầm |
| [AMB-31](projects/requirements_projects.md#71-ambiguities) | `PRJ` | `Deadline` sớm hơn `Start Date` được chấp nhận ở cả client lẫn server — lỗi hay cố ý? | STORY-PRJ-04 · dữ liệu hỏng lan sang Gantt, mốc tiến độ, báo cáo |
| [AMB-33](projects/requirements_projects.md#71-ambiguities) | `PRJ` | Dự án **0 công việc** hiển thị `Project Progress 100%` trong khi thẻ `Open Tasks` cùng trang ghi `0%` | STORY-PRJ-07 · báo cáo tiến độ sai với mọi dự án mới |
| [AMB-41](projects/requirements_projects.md#71-ambiguities) | `PRJ` | `Visible Tabs` và 18 công tắc quyền khách hàng tác động tới khu quản trị hay chỉ cổng khách hàng? | STORY-PRJ-03 (11 REQ) — BLOCKED; cổng khách hàng ngoài phạm vi toàn dự án |

### 3.2. Vấn đề cấp hệ thống đang treo

| Vấn đề | Ảnh hưởng | Cần ai giải quyết |
|---|---|---|
| Chỉ có 1 account, chưa biết role tên gì, chưa biết hệ thống có mấy role | Không dựng được ma trận phân quyền thật ở **mọi** module. Recon `CUST` hé lộ hệ thống có **3 nhân sự** (`Project Manager` · `Admin Anh Tester` · `Admin Example`) và **có** phân biệt "quản trị viên" với "nhân sự thường" ở mức dữ liệu Vault — mô hình phân quyền tồn tại nhưng không dựng được ma trận | Người quản trị hệ thống cấp thêm account |
| Master data (Taxes · Payment Modes · Departments · Lead Sources · Contract Types…) nằm sau khu Setup 403 | Danh sách giá trị hợp lệ của nhiều dropdown chỉ suy được, không kiểm chứng được | Như trên |
| Không có môi trường riêng để test thao tác phá huỷ | `AMB-25` (xoá khách hàng có dữ liệu liên quan), `AMB-26` (nhập CSV), `AMB-38` (sao chép dự án) và `AMB-40` (CRUD các tab thuộc dự án) không kiểm chứng được. Xoá hàng loạt cũng phải hoãn | Cấp một môi trường staging riêng, hoặc chốt cho phép chạy trong khung giờ thấp điểm |
| Cổng khách hàng nằm ngoài phạm vi | `AMB-41` — toàn bộ `STORY-PRJ-03` (11 REQ về `Visible Tabs` và 18 công tắc quyền khách hàng) chỉ kiểm chứng được ở mức "biểu mẫu ghi nhận đúng", không kiểm chứng được tác dụng thật. Cùng vấn đề sẽ lặp lại ở `CTR` (khách ký hợp đồng), `PROP` (khách bình luận đề xuất), `KB` | Chốt phạm vi cổng khách hàng: đưa vào hay xác nhận loại bỏ vĩnh viễn |
| Dữ liệu rác từ các đợt automation trước | Danh sách dự án có hơn 50 bản ghi `AUTO_POM_*`, `Project Automation *`, `[AUTO_HT] *` không được dọn. Mọi khẳng định theo tổng số bản ghi đều không tin được | Thống nhất quy ước đặt tên + dọn dữ liệu cho mọi đợt chạy automation; cân nhắc một đợt dọn thủ công dữ liệu rác đang tồn |

---

## 4. Cấu trúc thư mục chuẩn

```
docs/requirements/
├── README.md                              ← file này — DANH MỤC
├── _discovery/                            ← TẦNG KHÁM PHÁ (không có mã REQ)
│   ├── system_map.md                      ← INDEX — TÊN FILE BẤT BIẾN
│   ├── modules/module_NN_<slug>.md        ← 21 file khám phá
│   └── evidence/*.png                     ← 30 ảnh full-page
└── <module>/                              ← TẦNG MODULE (sinh dần khi recon)
    ├── requirements_<module>.md           ← INDEX — TÊN FILE BẤT BIẾN
    ├── evidence/*.png
    ├── stories/story_NN_<slug>.md         ← khi tách (> 80 REQ)
    └── analysis/analysis_<TICKET-ID>.md
```

---

## 5. Quy trình sử dụng

| Tình huống | Workflow | Ghi vào đâu |
|---|---|---|
| Khảo sát chi tiết một module | `/generate_requirements_from_website <module>` | `docs/requirements/<module>/requirements_<module>.md` + cập nhật dòng tương ứng ở bảng mục 1 |
| Phát hiện module bị sót | `/discover_system` (Mode ADD) | `_discovery/` + thêm dòng ở mục 1 |
| Hệ thống deploy tính năng mới | `/discover_system` (Mode DELTA) | Nhật ký khám phá ở `system_map.md` |
| Có ticket sửa yêu cầu đã có | `/update_requirements_from_ticket` | Tài liệu module + Nhật ký thay đổi |
| Sinh test case sau khi có requirements | `/generate_testcases_manual_rbt` hoặc `/generate_testcases_from_requirements` | `docs/testcases/<module>/` |

**Thứ tự recon đã chốt:** `LOGIN → CUST → CONT → LEAD → PRJ → TASK → EST → PROP → INV → PAY → CN → SUB → CTR → EXP → ITEM → TICK → ESTREQ → KB → REP → DASH → TODO → REM → PROF`

---

## 6. Nhật ký danh mục

| Ngày | Thay đổi |
|---|---|
| 2026-08-14 | Recon module `PRJ` bằng `/generate_requirements_from_website` — **104 REQ**, 10 Story, 16 AMB (6 🔴), 7 RISK, 31 ảnh evidence. Module **vượt ngưỡng 80 REQ** nên **tách file** theo mục 5.1 của skill: index `requirements_projects.md` + 10 file trong `stories/`. Đây là module đầu tiên của dự án phải tách. Đối chiếu danh mục với thư mục `docs/requirements/`: khớp, không có module lạc hay prefix trùng |
| 2026-08-14 | Recon module `CUST` bằng `/generate_requirements_from_website` — 79 REQ, 10 Story, 13 AMB (4 🔴), 7 RISK, 21 ảnh evidence. Module lớn hơn ước lượng của tầng khám phá (~45–65 → 79 REQ) nhưng vẫn dưới ngưỡng 80 nên **giữ 1 file**, không tách. Đối chiếu danh mục với thư mục `docs/requirements/`: khớp, không có module lạc hay prefix trùng |
| 2026-08-14 | Recon module `LOGIN` bằng `/generate_requirements_from_website` — 35 REQ, 6 Story, 14 AMB, 7 RISK, 9 ảnh evidence. Đối chiếu danh mục với thư mục `docs/requirements/`: khớp, không có module lạc hay prefix trùng |
| 2026-08-14 | Khởi tạo danh mục từ `/discover_system` Mode UI — 23 module, 23 prefix. Setup (403) và Calendar/Media/Bulk PDF Export **không cấp prefix**, ghi ở mục "Vùng chưa cấp prefix". Chốt tiền tố TC ID `CRM_` |
