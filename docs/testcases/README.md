# Danh mục Test Cases — Shan Koe Mee (BacaOcean)

> **Điểm vào nhánh test case.** Khởi tạo bởi `/discover-system` ngày 17-09-2026 để đăng ký **tiền tố TC ID** ngay khi chốt — chưa có bộ TC nào. Requirements ở [`../requirements/README.md`](../requirements/README.md).

## Quy ước TC ID

`SKM_<MODULE>_TC_<nnn>` — `SKM` chốt với QA ngày 17-09-2026, **không đổi** giữa chừng. `<MODULE>` lấy đúng prefix ở danh mục requirements. Ví dụ: `SKM_RANK_TC_001`.

## 1. Bảng danh mục module

| Module | Prefix TC ID | Nền tảng | File index | Số TC | REQ bao phủ | Độ hạt | Cập nhật |
|---|---|---|---|---|---|---|---|
| Chọn phòng | `SKM_ROOM_TC_` | Web · Miniapp | — | 0 | — | — | 17-09-2026 |
| Bàn chơi & Banker luân phiên | `SKM_TABLE_TC_` | Web · Miniapp | — | 0 | — | — | 17-09-2026 |
| Cược & Thanh toán | `SKM_BET_TC_` | Web · Miniapp | — | 0 | — | — | 17-09-2026 |
| Chia bài & rút lá thứ 3 | `SKM_DEAL_TC_` | Web · Miniapp | — | 0 | — | — | 17-09-2026 |
| Xếp hạng bài & Tie-break | `SKM_RANK_TC_` | Web · Miniapp | — | 0 | — | — | 17-09-2026 |
| Jackpot | `SKM_JPOT_TC_` | Web · Miniapp | — | 0 | — | — | 17-09-2026 |

**Prefix TC ID đã chiếm:** `SKM_ROOM_` · `SKM_TABLE_` · `SKM_BET_` · `SKM_DEAL_` · `SKM_RANK_` · `SKM_JPOT_`

## 2. Độ phủ so với requirements

Chưa có REQ nào được cấp — xem trạng thái ở danh mục requirements.

## 3. Cấu trúc thư mục chuẩn

```
docs/testcases/
├── README.md
└── <module>/
    ├── test_cases_<module>.md            ← INDEX — TÊN BẤT BIẾN, không chứa dòng TC
    ├── web/test_cases_<module>_web.md    ← TC web + miniapp (cột Nền tảng phân biệt)
    ├── web/parts/part_NN_web_<slug>.md   ← khi > 40 TC
    ├── impact/                            ← delta theo ticket
    └── archive/
```

## 4. Kết quả thực thi

Chưa có — `docs/executions/<module>/web/run_<timestamp>/` sẽ được tạo bởi `/execute-test-cases`.

## 5. Quy trình sử dụng

| Tình huống | Workflow |
|---|---|
| Sinh TC nhanh từ requirements | `/generate-testcases-from-requirements <module>` |
| Sinh TC đầy đủ theo rủi ro (module 🔴) | `/generate-testcases-manual-rbt <module>` |
| Cập nhật TC theo Impact Report | `/update-testcases-from-impact <TICKET-ID>` |
| Thực thi trên UI thật | `/execute-test-cases <module>` |

## 6. Nhật ký danh mục

| Ngày | Thay đổi | Nguồn |
|---|---|---|
| 17-09-2026 | Khởi tạo danh mục, đăng ký tiền tố `SKM_` + 6 prefix module. Chưa có TC | `/discover-system` mode DOC |
