# Danh mục Requirements — Shan Koe Mee (BacaOcean)

> **Điểm vào cấp hệ thống.** Đọc file này đầu tiên khi cần biết module nào đã có tài liệu, prefix nào đã bị chiếm, mã kế tiếp bắt đầu từ đâu. Bản đồ chi tiết ở [`_discovery/system_map.md`](_discovery/system_map.md).

## Thuộc tính hệ thống

| Thuộc tính | Giá trị |
|---|---|
| **Hệ thống** | Gameplay **Shan Koe Mee** triển khai bên trong game **BacaOcean** (cổng Fish Hunter) |
| **Tên viết tắt · tiền tố TC ID** | `SKM` → `SKM_<MODULE>_TC_<nnn>` — chốt với QA ngày 17-09-2026 |
| **Nền tảng** | **Web** · **Miniapp** — cả hai dùng tầng `web/`. ❔ App chứa miniapp (Zalo / Telegram / khác) chưa xác nhận |
| **Đường vào game** | Màn hình Home → icon **ShanKoeMee** |
| **URL · tài khoản test** | Lưu ở `.env` (`SKM_BASE_URL` · `SKM_TEST_USERNAME` · `SKM_TEST_PASSWORD`). **KHÔNG** ghi giá trị vào `docs/`. Hiện có **1** tài khoản, chưa rõ role |
| **Môi trường test** | 🔴 **Dùng chung** — mọi lượt khảo sát **chỉ đọc**: mở màn hình, xem UI; **không** đặt cược thật / không thao tác làm đổi tài sản người khác khi chưa được phép |
| **Năng lực kiểm thử của QA** | Chốt 17-09-2026 — dùng cho nhánh **Vòng 3** của **mọi** bộ TC, không hỏi lại ở từng module:<br>• Gọi API: ❌ không có quyền — đội Dev xác minh<br>• Truy vấn CSDL: ❌ không có quyền — đội Dev xác minh<br>• Kiểm tầng tích hợp: ❌ không có quyền — đội Dev xác minh<br>• Xem nhật ký hoạt động server: ❌ không có quyền — đội Dev xác minh<br>• Cấu hình quỹ Jackpot / tài sản test: ❌ không có — cần Dev set data<br>• DevTools trình duyệt (network, console): ✅ có (mặt web) |
| **Tài liệu gốc** | [`_discovery/sources/ShanKoeMee_Gameplay_Spec_v2.docx`](_discovery/sources/ShanKoeMee_Gameplay_Spec_v2.docx) · phiên bản 2.1 · 13/08/2026 — bản đồ phủ ở [`_discovery/doc_inventory.md`](_discovery/doc_inventory.md) |

## 1. Bảng danh mục module

| Module | Prefix | Nền tảng | Trạng thái recon | Mức phủ tài liệu | Tài liệu | REQ đã dùng | Mã kế tiếp | AMB treo | Story | Cập nhật |
|---|---|---|---|---|---|---|---|---|---|---|
| Chọn phòng | `ROOM` | Web ⬜ · Miniapp ⬜ | ⬜ Chưa khảo sát | 🟨 Một phần | — | — | `REQ-ROOM-01` | — | — | 17-09-2026 |
| Bàn chơi & Banker luân phiên | `TABLE` | Web ⬜ · Miniapp ⬜ | ⬜ Chưa khảo sát | 🟨 Một phần | — | — | `REQ-TABLE-01` | — | — | 17-09-2026 |
| Cược & Thanh toán | `BET` | Web ⬜ · Miniapp ⬜ | ⬜ Chưa khảo sát | 🟨 Một phần | — | — | `REQ-BET-01` | — | — | 17-09-2026 |
| Chia bài & rút lá thứ 3 | `DEAL` | Web ⬜ · Miniapp ⬜ | ⬜ Chưa khảo sát | 🟨 Một phần | — | — | `REQ-DEAL-01` | — | — | 17-09-2026 |
| Xếp hạng bài & Tie-break | `RANK` | Web ⬜ · Miniapp ⬜ | ⬜ Chưa khảo sát | 🟩 Đầy đủ | — | — | `REQ-RANK-01` | — | — | 17-09-2026 |
| Jackpot | `JPOT` | Web ⬜ · Miniapp ⬜ | ⬜ Chưa khảo sát | 🟨 Một phần | — | — | `REQ-JPOT-01` | — | — | 17-09-2026 |

**Danh sách prefix đã chiếm:** `ROOM` · `TABLE` · `BET` · `DEAL` · `RANK` · `JPOT` — module mới **phải** chọn prefix ngoài danh sách này.

**Bảng mã trạng thái recon:** ⬜ Chưa khảo sát · 🟨 Đang khảo sát · ✅ Đã có tài liệu · ⏸️ Hoãn · ⚪ Chưa implement

**Mức phủ tài liệu:** 🟩 Đầy đủ · 🟨 Một phần · ⬜ Trắng · ⚠️ Nghi lỗi thời

## 2. Trạng thái REQ toàn hệ thống

Chưa có module nào phát hành tài liệu requirements. Mọi module đang ở tầng khám phá (mode DOC) — **chưa cấp mã REQ nào**.

## 3. Ambiguity 🔴 High còn treo

Chưa có `AMB-XX` (chỉ cấp ở tầng module). Các **mâu thuẫn nội bộ tài liệu** phát hiện ở tầng khám phá được liệt kê dưới mã `D-nn` trong [`_discovery/doc_inventory.md`](_discovery/doc_inventory.md) mục 3 — **4 mục 🔴** cần Product trả lời trước khi sinh REQ: `D-02` (cơ sở tính 1% Jackpot), `D-03` (Jackpot trong hay ngoài phạm vi), `D-04` (Banker nhận Jackpot), `D-05` (Shan9 vs Shan9 / có Hoà không). ✅ `D-01` (luật rút bài) đã chốt 17-09-2026: 0–7 tự chọn, Shan 8/9 tự động dừng.

## 4. Cấu trúc thư mục chuẩn

```
docs/requirements/
├── README.md                              ← file này
├── _discovery/
│   ├── system_map.md                      ← INDEX bản đồ hệ thống — TÊN BẤT BIẾN
│   ├── doc_inventory.md                   ← bản đồ phủ tài liệu + mâu thuẫn D-nn
│   ├── sources/                           ← bản gốc tài liệu QA cung cấp
│   └── evidence/                          ← 1 ảnh tổng quan mỗi module (khi có UI)
└── <module>/
    ├── requirements_<module>.md           ← INDEX — TÊN BẤT BIẾN
    ├── web/requirements_<module>_web.md   ← REQ chỉ áp web/miniapp · Field Spec · evidence/
    ├── analysis/analysis_<TICKET-ID>.md
    └── impact/impact_<TICKET-ID>.md
```

## 5. Quy trình sử dụng

| Tình huống | Workflow | Ghi vào đâu |
|---|---|---|
| Sinh requirements module từ tài liệu spec (chưa có UI) | `/analyze-requirement-document` | `<module>/analysis/` → hợp nhất vào `requirements_<module>.md` |
| Sinh requirements module từ UI thật (web / miniapp) | `/generate-requirements-from-website <module>` | `<module>/requirements_<module>.md` + `web/` |
| Xác minh lại bản đồ khi đã có build | `/discover-system DELTA` | `_discovery/system_map.md` — Nhật ký khám phá |
| Bổ sung module bị sót | `/discover-system ADD <module>` | `_discovery/` + bảng danh mục |
| Spec đổi (ticket mới) | `/update-requirements-from-ticket` | `<module>/impact/` + Nhật ký thay đổi |
| Test luồng 1 ván xuyên module | `/generate-cross-module-test-plan` | đọc mục 4 của `system_map.md` |

## 6. Nhật ký danh mục

| Ngày | Thay đổi | Nguồn |
|---|---|---|
| 17-09-2026 | Chốt D-01 với QA: điểm 0–7 tự chọn Rút/Dừng, Shan 8/9 tự động dừng — `DEAL` không còn mục 🔴 chặn | QA |
| 17-09-2026 | Khởi tạo danh mục. `/discover-system` mode **DOC** từ `ShanKoeMee_Gameplay_Spec_v2.docx` — 6 module, 6 prefix. Chốt tiền tố TC ID `SKM_`, nền tảng Web + Miniapp, môi trường dùng chung, năng lực QA. URL/tài khoản test đã có → lưu `.env`; chưa khảo sát UI (giữ mode DOC) | QA + agent |
