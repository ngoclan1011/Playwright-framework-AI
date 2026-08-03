# Danh Mục Test Cases — CRM (Perfex CRM · Anh Tester Demo)

> **File này là điểm vào của toàn bộ manual test cases.** Đọc trước khi sinh/thực thi/review TC — để biết module nào đã có bộ TC, prefix TC ID nào đã bị chiếm, và độ phủ so với requirements.
>
> Đối xứng với [`docs/requirements/README.md`](../requirements/README.md). Cập nhật tự động bởi `/generate_testcases_manual_rbt`, `/generate_testcases_from_requirements`, `/generate_checklist_test`. **Không sửa tay.**

---

## 1. Bảng Danh Mục Module

| Module | Prefix TC ID | Bộ TC | Số TC | Part | TC ID range | REQ bao phủ | Cập nhật |
|---|---|---|---|---|---|---|---|
| **Login** | `CRM_LOGIN_TC_` | [login/test_cases_login.md](login/test_cases_login.md) | 24 | — | `001` → `024` | REQ-LOGIN-01 → 24 | 2026-08-02 |
| **Customers** | `CRM_CUST_TC_` | [customers/test_cases_customers.md](customers/test_cases_customers.md) | 140 | 4 | `001` → `140` | REQ-CUST-01 → 53 | 2026-08-02 |
| **Projects** | `CRM_PRJ_TC_` | — chưa sinh | 0 | — | — | ⚠️ 65 REQ chưa có TC | — |

**Tổng: 164 TC · 2/3 module đã có bộ TC**

### Prefix TC ID đã chiếm

```
CRM_LOGIN_TC_ · CRM_CUST_TC_
```

> Module mới phải chọn prefix chưa dùng. Quy ước: `CRM_<PREFIX_MODULE>_TC_<số 3 chữ số>` — dùng đúng prefix module đã đăng ký ở [danh mục requirements](../requirements/README.md).

---

## 2. Độ Phủ So Với Requirements

| Module | REQ | TC | Trạng thái |
|---|---|---|---|
| Login | 24 | 24 | ✅ Đã có bộ TC |
| Customers | 53 | 140 | ✅ Đã có bộ TC |
| **Projects** | **65** | **0** | ⚠️ **Chưa sinh TC** |

> Số TC lớn hơn số REQ là bình thường — một REQ thường cần nhiều TC (happy path, negative, boundary). Con số này **không thay thế** ma trận truy vết: chạy `/generate_traceability_matrix` để biết REQ nào thực sự chưa được cover.

**Module Projects chưa có TC** — tài liệu requirements đã sẵn sàng với 7 Story và thứ tự triển khai đề xuất. Lưu ý **STORY-PRJ-03 đang BLOCKED** bởi AMB-04, không nên sinh TC cho Story đó cho tới khi PO trả lời.

---

## 3. Cấu Trúc Thư Mục Chuẩn

```
docs/testcases/
├── README.md                                   ← FILE NÀY
└── <module>/
    ├── test_cases_<module>.md                  ← INDEX — TÊN FILE BẤT BIẾN
    ├── parts/part_NN_<slug>.md                 ← khi tách (>40 TC)
    └── archive/test_cases_<module>_vN.md       ← phiên bản cũ, giữ để truy vết
```

| Quy tắc | Lý do |
|---|---|
| Tên index **luôn** `test_cases_<module>.md` | `/execute_test_cases`, `/review_testcases`, `/generate_automation_from_testcases`, `/generate_traceability_matrix` đều đọc theo mẫu `docs/testcases/<module>/test_cases_<module>.md` |
| **KHÔNG** nhét số phiên bản vào tên index (`_v2`, `_new`…) | Phiên bản mới **thay thế** index; bản cũ chuyển vào `archive/` |
| Part đặt trong `parts/`, tên `part_NN_<slug>.md` | `NN` có số 0 đứng đầu để sắp xếp đúng |
| Có ≥2 part → index chỉ chứa **Bản đồ tài liệu + Coverage**, TC chi tiết nằm trong `parts/` | Coverage không bị nhân bản, review một chỗ |
| Ngưỡng tách: **> 40 TC** | ~25–30 KB, review được trong một lượt |

---

## 4. Kết Quả Thực Thi (Executions)

Mỗi lần chạy TC sinh ra một thư mục riêng, **report và evidence nằm cùng nhau**:

```
docs/executions/
└── <module>/run_<timestamp>/
    ├── execution_report.md
    └── evidence/<TC_ID>_<mô_tả>.png
```

| Module | Lần chạy | Kết quả | Bug |
|---|---|---|---|
| Login | [run_1785678326](../executions/login/run_1785678326/execution_report.md) | xem report | [BUG_login_1785678750](../../bug_reports/BUG_login_1785678750.md) |

> Evidence dùng link **tương đối** trong report (`evidence/<file>.png`) — di chuyển cả thư mục run không làm gãy link.

---

## 5. Quy Trình Sử Dụng

| Tình huống | Workflow | Ghi vào |
|---|---|---|
| Sinh TC nhanh từ requirements | `/generate_testcases_from_requirements` | `<module>/test_cases_<module>.md` |
| Sinh TC bài bản (RBT 6 bước) | `/generate_testcases_manual_rbt` | `<module>/test_cases_<module>.md` (+ `parts/` nếu >40 TC) |
| Sinh checklist tick tay | `/generate_checklist_test` | `<module>/checklist_<loại>.md` |
| Review chất lượng TC | `/review_testcases` | Báo cáo review |
| Thực thi TC trên browser thật | `/execute_test_cases` | `docs/executions/<module>/run_*/` |
| Sinh bug report từ TC FAIL | `/create_bug_report` | `bug_reports/` |
| Chuyển TC sang automation | `/generate_automation_from_testcases` | Source code automation |
| Đối chiếu REQ ↔ TC ↔ Automation | `/generate_traceability_matrix` | RTM |

> ⚠️ **Khi requirements thay đổi:** `/update_requirements_from_ticket` sẽ xuất **Impact Report** chỉ ra TC nào cần review/archive/viết mới. Đọc report đó trước khi sửa TC — đừng tự rà tay.

---

## 6. Nhật Ký Danh Mục

| Ngày | Thay đổi |
|---|---|
| 2026-08-02 | Chuyển sang cấu trúc thư mục theo module; gộp `docs/reports/` + `docs/evidence/execution/` thành `docs/executions/<module>/run_*/`. Bộ TC Customers v2 (index + 4 part) trở thành bộ chính, v1 chuyển vào `customers/archive/` |
