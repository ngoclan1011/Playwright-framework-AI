# Danh mục Test Cases — AnhTester Book Management (`BK`)

> **Điểm vào tầng test case của hệ thống Book.** Đọc file này trước khi đụng tới `docs/testcases/_book-api/`: module nào đã có TC · dải TC ID nào đã chiếm · mã kế tiếp · độ phủ so với requirements.
>
> ⚠️ Hệ thống **riêng**, không liên quan Perfex CRM — danh mục CRM ở [../README.md](../README.md), **không** dùng chung dải TC ID.

| Mục | Giá trị |
|---|---|
| Hệ thống | AnhTester Book Management — `https://book.anhtester.com` (production, server duy nhất) |
| Tiền tố TC ID | `BK_` → `BK_<MODULE>_TC_<3 số>` — dải **chung mọi nền tảng** của module |
| Nguồn requirements | [`docs/requirements/_book-api/README.md`](../../requirements/_book-api/README.md) |
| Nền tảng | API · Android (iOS chưa khảo sát · Web ngoài phạm vi) |
| Môi trường | **Không** dùng chung (user chốt 14-08-2026) — TC vẫn chỉ ghi/xoá bản ghi do chính lượt chạy tạo, **dọn** sau khi chạy |
| Ngày cập nhật | 20-09-2026 |

---

## 1. Danh mục module đã có test cases

| Module | Prefix TC ID | Dải đã dùng | Mã kế tiếp | Số TC | Nền tảng | Độ hạt | REQ bao phủ | Tài liệu | Cập nhật |
|---|---|---|---|---|---|---|---|---|---|
| Xác thực & Phiên (`AUTH`) | `BK_AUTH_TC_` | `001` → `108` | `109` | 108 | Mobile 58 · API 50 | GỘP | Mobile 46/46 · API 48/48 | [TEST_CASES_AUTH_SUMMARY.md](auth/TEST_CASES_AUTH_SUMMARY.md) | 20-09-2026 |

## 2. Độ phủ so với requirements

| Module | REQ có tài liệu | REQ đã có ≥ 1 TC | Độ phủ | Ghi chú |
|---|---|---|---|---|
| `AUTH` | 86 (API 40 · Android 38 · dùng chung 8) | Mobile 46 · API 48 | **100%** (86/86) | 8 REQ dùng chung có TC ở **cả hai** nền tảng · 7 TC API `@KnownBug` (F-03 · F-16 · F-17) |
| `USER` · `BOOK` · `CAT` · `PROMO` · `FILE` · `ADDR` · `SYS` · `DASH` | 0 | 0 | — | Chưa sinh REQ |

## 3. Nhật ký danh mục

| Ngày | Thay đổi |
|---|---|
| 20-09-2026 | `AUTH`: tách `TC_069` · `TC_082` (gánh nhiều REQ không có TC chống lưng) → thêm `BK_AUTH_TC_106` → `108`. API **50 TC**, module **108 TC** |
| 20-09-2026 | `/generate-testcases-api auth`: thêm **47 TC API · 89 biến thể** (`BK_AUTH_TC_059` → `105`) ở `auth/api/parts/`. Module `AUTH` đủ **105 TC · 86/86 REQ** |
| 20-09-2026 | Khởi tạo danh mục. Sinh bộ TC **Mobile (Android)** module `AUTH` bằng `/generate-testcases-from-requirements` Mode QUICK, độ hạt GỘP — **58 TC · 95 biến thể**, 2 part ở `auth/mobile/parts/`, chiếm dải `BK_AUTH_TC_001` → `058`. Phủ 46/46 REQ Mobile. TC API chưa sinh — nối tiếp từ `BK_AUTH_TC_059` |
