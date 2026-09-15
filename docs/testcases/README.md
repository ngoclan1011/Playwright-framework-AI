# Danh mục Test Cases — CMS Adsplay

> Điểm vào cấp hệ thống cho nhánh test case. Requirements: [`../requirements/README.md`](../requirements/README.md)

---

## Thuộc tính

| Mục | Giá trị |
|---|---|
| **Mẫu TC ID** | **`CMS_<MODULE>_TC_<3 số>`** — ví dụ `CMS_LOGIN_TC_001`. Chốt với user 2026-09-15 |
| **Nền tảng** | Web (1 mặt) |
| **Ngôn ngữ Expected Result** | ❔ **Chưa chốt** — hệ thống có EN · VI, mọi message phụ thuộc ngôn ngữ. Phải chốt trước khi sinh TC |

---

## 1. Bảng danh mục test case

| Module | Prefix | Nền tảng | REQ nguồn | Tài liệu TC | TC đã dùng | Mã kế tiếp | Cập nhật |
|---|---|---|---|---|---|---|---|
| Đăng nhập & Phiên | `LOGIN` | Web | — | — | — | `CMS_LOGIN_TC_001` | 2026-09-15 |
| Vai trò & Quyền | `ROLE` | Web | — | — | — | `CMS_ROLE_TC_001` | 2026-09-15 |
| Người dùng | `USER` | Web | — | — | — | `CMS_USER_TC_001` | 2026-09-15 |
| Nhà quảng cáo | `ADV` | Web | — | — | — | `CMS_ADV_TC_001` | 2026-09-15 |
| Nhà xuất bản & Kho QC | `PUB` | Web | — | — | — | `CMS_PUB_TC_001` | 2026-09-15 |
| Chiến dịch | `CAMP` | Web | — | — | — | `CMS_CAMP_TC_001` | 2026-09-15 |
| Flight | `FLIGHT` | Web | — | — | — | `CMS_FLIGHT_TC_001` | 2026-09-15 |
| Creative | `CRTV` | Web | — | — | — | `CMS_CRTV_TC_001` | 2026-09-15 |
| Kiểm duyệt TVC & Media | `MOD` | Web | — | — | — | `CMS_MOD_TC_001` | 2026-09-15 |
| Nhắm mục tiêu | `TGT` | Web | — | — | — | `CMS_TGT_TC_001` | 2026-09-15 |
| Cấu hình hệ thống | `CFG` | Web | — | — | — | `CMS_CFG_TC_001` | 2026-09-15 |
| Báo cáo & Dashboard | `DASH` | Web | — | — | — | `CMS_DASH_TC_001` | 2026-09-15 |

**Chưa có test case nào.** Prefix lấy nguyên từ [`../requirements/README.md`](../requirements/README.md) — **không** tự đặt lại.

---

## 2. Điều kiện cần trước khi sinh TC

| Điều kiện | Trạng thái |
|---|---|
| Module đã có `requirements_<module>.md` (REQ để neo TC) | ❌ Chưa module nào |
| Chốt ngôn ngữ chuẩn EN/VI | ❌ Chưa |
| Chốt năng lực QA (API · CSDL · tích hợp) cho nhánh Vòng 3 | ⚠️ Mới có nhật ký hoạt động ✅ và DevTools ✅ |
| Xác nhận staging có dùng chung không | ❌ Chưa |

> ⚠️ Sinh TC khi module chưa có REQ thì TC **không có gì để neo** — `/generate-traceability-matrix` sẽ báo TC mồ côi.

---

## 3. Cấu trúc thư mục

```
docs/testcases/
├── README.md                              ← file này
└── <module>/
    ├── test_cases_<module>.md             ← INDEX bất biến — tổng hợp, KHÔNG chứa dòng TC
    ├── web/test_cases_<module>_web.md     ← TC chạy trên web
    ├── web/parts/part_NN_web_<slug>.md    ← khi file nền tảng > 40 TC
    ├── impact/impact_plan_<TICKET-ID>.md
    └── archive/test_cases_<module>_web_vN.md
```

---

## 4. Nhật ký danh mục

| Ngày | Thay đổi | Nguồn |
|---|---|---|
| 2026-09-15 | Khởi tạo danh mục rỗng cho 10 module. Chốt mẫu TC ID `CMS_<MODULE>_TC_<3 số>` | `/discover-system` mode UI |
| 2026-09-15 | Thêm 2 module `FLIGHT` · `CRTV` (tách khỏi `CAMP` ở đợt khám phá 2) → **12 module**. Chưa có TC nào | `/discover-system` mode ADD |
