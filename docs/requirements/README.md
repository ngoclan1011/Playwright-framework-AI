# Danh Mục Requirements — CRM (Perfex CRM · Anh Tester Demo)

> **File này là điểm vào của toàn bộ tài liệu requirements.** Đọc file này trước khi phân tích bất kỳ module nào — để biết module nào đã đặc tả, prefix nào đã bị chiếm, và mã REQ kế tiếp phải bắt đầu từ đâu.
>
> Cập nhật tự động bởi `/generate_requirements_from_website`, `/analyze_requirement_document` và `/update_requirements_from_ticket`. **Không sửa tay** để tránh lệch với tài liệu module.

---

## 1. Bảng Danh Mục Module

| Module | Prefix | Tài liệu | REQ đã dùng | Mã kế tiếp | AMB treo | Story | Cập nhật |
|---|---|---|---|---|---|---|---|
| **Login** | `LOGIN` | [login/requirements_login.md](login/requirements_login.md) | `REQ-LOGIN-01` → `24` | `REQ-LOGIN-25` | 10 ❓ (2 🔴) | — | 2026-08-02 |
| **Customers** | `CUST` | [customers/requirements_customers.md](customers/requirements_customers.md) | `REQ-CUST-01` → `53` | `REQ-CUST-54` | 11 ❓ (4 🔴) | — | 2026-08-02 |
| **Projects** | `PRJ` | [projects/requirements_projects.md](projects/requirements_projects.md) | `REQ-PRJ-01` → `65` | `REQ-PRJ-66` | 12 ❓ (5 🔴) | 7 | 2026-08-02 |

**Tổng: 3 module · 142 REQ · 33 ambiguity còn treo · 30 risk**

### Prefix đã bị chiếm (KHÔNG được dùng lại cho module khác)

```
LOGIN · CUST · PRJ
```

> Module mới phải chọn prefix chưa có trong danh sách trên. Prefix nên ngắn (3–5 ký tự), viết HOA, không dấu.

---

## 2. Trạng Thái REQ Toàn Hệ Thống

| Module | 🟢 Active | 🟡 Changed | 🔴 Deprecated | ⚪ Chưa implement |
|---|---|---|---|---|
| Login | 24 | 0 | 0 | 0 |
| Customers | 53 | 0 | 0 | 0 |
| Projects | 65 | 0 | 0 | 0 |
| **Tổng** | **142** | **0** | **0** | **0** |

**Ý nghĩa:** 🟢 đang hiệu lực · 🟡 đã bị ticket sau sửa, **TC phải review** · 🔴 tính năng đã gỡ, **TC phải archive** · ⚪ tài liệu có nhưng chưa build, **TC đánh `skip`**

---

## 3. Ambiguity Mức 🔴 High Còn Treo — Cần PO/BA Trả Lời

Đây là danh sách chặn tiến độ viết test. Mỗi dòng đang khiến một nhóm test không có tiêu chí PASS/FAIL đáng tin cậy.

| Module | Mã | Vấn đề | Đang chặn |
|---|---|---|---|
| Projects | AMB-04 | `Visible Tabs` mặc định chỉ chọn Overview nhưng 8 quyền khách hàng lại bật sẵn — cái nào ưu tiên? | **STORY-PRJ-03 BLOCKED** |
| Projects | AMB-02 | Deadline được phép sớm hơn Start Date; widget hiện số ngày âm (`-699 Days Left`) | Nhóm test ngày tháng |
| Projects | AMB-06 | Không có tài khoản role thấp; trang `/admin/roles` bị chặn | Ma trận phân quyền bỏ trống |
| Projects | AMB-01 | Trường Customer bỏ trống chỉ hiện viền đỏ, không có message | Không có chuỗi để assert |
| Projects | AMB-07 | Xoá dự án có dữ liệu ràng buộc thì hệ thống xử lý ra sao? | Nhánh test xoá |
| Customers | AMB-01 | Company bắt buộc ở client nhưng server chấp nhận rỗng | Mâu thuẫn UI vs API |
| Customers | AMB-06 | Thiếu tài khoản Staff role thấp | Ma trận phân quyền |
| Customers | AMB-07 | Xoá khách hàng có hoá đơn/dự án ràng buộc | Nhánh test xoá |
| Customers | AMB-08 | Mass Delete chưa kiểm chứng được trên môi trường dùng chung | Thao tác nguy hiểm nhất |
| Login | AMB-01, AMB-02 | (xem tài liệu Login) | Nhóm test bảo mật + luồng đăng xuất |

**Vấn đề lặp lại ở cả 3 module:** thiếu tài khoản role thấp và thiếu môi trường test riêng để kiểm chứng thao tác phá huỷ dữ liệu. Hai đề nghị này nên gộp lại đưa PO một lần.

---

## 4. Cấu Trúc Thư Mục Chuẩn

```
docs/requirements/
├── README.md                              ← FILE NÀY (danh mục toàn hệ thống)
├── <module>/
│   ├── requirements_<module>.md           ← INDEX của module — TÊN FILE BẤT BIẾN
│   ├── evidence/                          ← ảnh chụp màn hình làm bằng chứng
│   │   └── *.png
│   ├── stories/                           ← chỉ khi tài liệu bị tách (skill mục 5.3)
│   │   └── story_01_<slug>.md
│   └── analysis/                          ← phân tích ticket của riêng module này
│       └── analysis_<TICKET-ID>.md
```

**Quy tắc bất biến:**

| Quy tắc | Lý do |
|---|---|
| Tên file index **luôn** là `requirements_<module>.md` | Mọi workflow phía sau đọc theo đường dẫn `docs/requirements/<module>/requirements_<module>.md`. Đổi tên là vỡ chuỗi |
| Tên thư mục = tên module, chữ thường, không dấu | Tra cứu bằng glob `docs/requirements/*/requirements_*.md` |
| Evidence nằm **trong** thư mục module | Tài liệu và bằng chứng đi cùng nhau, di chuyển/xoá không lạc file |
| Phân tích ticket nằm trong `<module>/analysis/` | Giữ liên kết ticket ↔ module. KHÔNG đặt ở thư mục toàn cục |
| Thêm module = thêm thư mục + 1 dòng ở bảng mục 1 | Không đụng gì khác trong repo |

---

## 5. Quy Trình Sử Dụng

| Tình huống | Workflow | Ghi vào |
|---|---|---|
| Module chưa có tài liệu, khảo sát từ hệ thống chạy thật | `/generate_requirements_from_website` | `<module>/requirements_<module>.md` + cập nhật bảng mục 1 |
| Có ticket/tài liệu, chưa muốn động vào tài liệu module | `/analyze_requirement_document` | `<module>/analysis/analysis_<TICKET-ID>.md` |
| Module **đã có** tài liệu, ticket mới sửa/bổ sung yêu cầu | `/update_requirements_from_ticket` | Sửa tại chỗ + ghi Nhật ký + cập nhật bảng mục 1, 2 |
| Sinh test case từ requirements | `/generate_testcases_manual_rbt` · `/generate_testcases_from_requirements` | `docs/testcases/` |
| Đối chiếu độ phủ REQ ↔ TC ↔ Automation | `/generate_traceability_matrix` | `docs/reports/` |

> ⚠️ **Trước khi gán mã REQ đầu tiên cho bất kỳ module nào:** đọc bảng mục 1 để lấy `Mã kế tiếp`. Đánh lại từ `01` khi module đã có tài liệu là **đụng mã và vỡ toàn bộ RTM** (skill `skills-requirements-analyzer` mục 2.1).

---

## 6. Nhật Ký Danh Mục

| Ngày | Thay đổi |
|---|---|
| 2026-08-02 | Chuyển sang cấu trúc thư mục theo module; tạo danh mục này. Trước đó 3 tài liệu nằm phẳng tại `docs/requirements/` và evidence nằm tách ở `docs/requirements/evidence/<module>/` |
| 2026-08-02 | Khởi tạo `requirements_projects.md` — 65 REQ, 12 AMB, 12 RISK, 7 Story |
