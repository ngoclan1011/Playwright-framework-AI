---
name: skills-requirements-analyzer
description: Kỹ năng phân tích trang web/module/tài liệu và sinh ra tài liệu Yêu cầu (Requirements Document/User Stories) chuẩn mực — có gán mã REQ ID truy vết được, phát hiện Ambiguity/Risk, kèm ma trận phân quyền và trạng thái.
---

# Kỹ năng Phân tích Yêu cầu (Requirements Analyzer)

Kỹ năng này cung cấp các hướng dẫn chi tiết để AI (Claude Code) có thể chuyển đổi giao diện UI, cấu trúc DOM/HTML, hoặc tài liệu (Jira ticket, .doc, user story) thành tài liệu Yêu cầu rõ ràng, chi tiết, **truy vết được**, phục vụ trực tiếp cho QA, Tester và Developer.

## 1. Mục tiêu cốt lõi
- Xây dựng tài liệu yêu cầu bám sát thực tế hệ thống đang chạy hoặc tài liệu gốc.
- **Mọi yêu cầu đều có mã REQ ID** — để test cases, automation và RTM truy vết ngược được.
- Đảm bảo tính bao quát: Happy Path, Edge Cases, phân quyền, trạng thái, thông báo lỗi.
- Phát hiện và ghi nhận có hệ thống các điểm mơ hồ (Ambiguity) và rủi ro (Risk).

---

## 2. Quy Ước Đánh Mã (BẮT BUỘC — dùng xuyên suốt toàn chuỗi)

| Loại | Format | Ví dụ | Dùng ở đâu |
|---|---|---|---|
| **Requirement** | `REQ-<MODULE>-<SỐ>` | `REQ-LOGIN-01` | Từng yêu cầu chức năng, business rule, validation rule |
| **Ambiguity** | `AMB-<SỐ>` | `AMB-03` | Điểm mơ hồ cần clarify với PO/BA |
| **Risk** | `RISK-<SỐ>` | `RISK-02` | Rủi ro kiểm thử |

**Quy tắc:**
- Mỗi yêu cầu **đủ nhỏ để test được độc lập** — nếu 1 câu chứa nhiều rule, tách thành nhiều REQ
- REQ ID **không đổi** sau khi đã phát hành tài liệu (chỉ thêm mới, không đánh lại số)
- Test cases sinh ra ở bước sau **PHẢI ghi REQ ID** vào cột `REQ ID` — đây là mắt xích để kiểm chứng "đủ case" và chạy `/generate_traceability_matrix`

---

## 3. Quy trình trích xuất thông tin

Khi phân tích từ **website/UI thực tế**:
1. **Phân tích Khung giao diện (Layout):** Header, Footer, Sidebar, Main Content, Breadcrumb
2. **Thu thập Form & Inputs:** tất cả `input`, `select`, `textarea` — ghi nhận `type`, `required`, `maxlength`, `minlength`, `pattern`, giá trị mặc định
3. **Thu thập Actions:** chức năng từng nút (Save, Submit, Cancel, Delete, Edit), alerts/toasts/validation messages khi tương tác lỗi
4. **Trích xuất Workflows:** sự phụ thuộc giữa các thành phần (VD: nút Submit chỉ enable khi tích Checkbox)
5. **Thu thập Phân quyền (nếu có nhiều role):** đăng nhập từng role (nếu được cung cấp account) — ghi nhận role nào thấy gì / làm được gì
6. **Thu thập Trạng thái (nếu entity có status):** các trạng thái quan sát được và hành động cho phép ở từng trạng thái
7. **Thu thập Thông báo lỗi:** trigger từng validation để ghi nhận nguyên văn error message

Khi phân tích từ **tài liệu** (Jira, .doc, user story): trích xuất metadata, User Story, Scope, Acceptance Criteria (gán REQ ID từng AC), dependencies, comments — chi tiết theo workflow `/analyze_requirement_document`.

---

## 4. Framework Phát Hiện Ambiguity & Risk

### 4.1. Ambiguity (AMB-XX)

Với mỗi ambiguity, ghi: **Mã · Câu hỏi · Nguy cơ nếu không giải quyết · Mức độ (🔴 High / 🟡 Medium / 🟢 Low) · Assumption tạm** (nếu không được trả lời thì test theo giả định nào).

Các hướng phát hiện:
- Từ khóa mơ hồ: "where applicable", "as needed", "similar to", "hợp lý", "v.v."
- Validation rules thiếu: min/max, format, required/optional, giá trị mặc định
- Hành vi edge case chưa quy định: lỗi mạng, concurrent access, data rỗng, timeout
- Inconsistency giữa document và mockup/UI thực tế (tên cột, format, layout)
- Threshold/config chưa xác định (VD: bao nhiêu ngày = "sắp đến hạn"?)
- Phân quyền chưa rõ: role nào được thực hiện hành động này?
- Trạng thái chưa rõ: từ trạng thái X có được chuyển sang Y không?

### 4.2. Risk (RISK-XX)

Với mỗi risk, ghi: **Mã · Tên rủi ro · Mô tả · Mitigation** (cách giảm thiểu khi test).

---

## 5. Cấu trúc Tài liệu Yêu cầu Đầu ra (Output Format)

Tài liệu format Markdown, lưu artifact (`requirements_<module>.md`). **Nội dung bắt buộc:**

### 5.1. Tổng quan (Overview)
Mô tả tóm tắt tính năng, mục đích, phạm vi module.

### 5.2. Yêu cầu Chức năng (Functional Requirements) — CÓ MÃ REQ
Chia thành User Stories / Use Cases, **mỗi yêu cầu 1 dòng trong bảng có mã**:

| REQ ID | Tên yêu cầu | Mô tả | Acceptance Criteria | Nguồn |
|---|---|---|---|---|
| REQ-LOGIN-01 | Đăng nhập bằng email | Là người dùng, tôi muốn... | Nhập đúng email+password → vào Dashboard | UI thực tế / AC#1 |
| REQ-LOGIN-02 | Khóa account sau 5 lần sai | ... | ... | ... |

### 5.3. Đặc tả Trường Dữ liệu (Field Specifications)
Bảng chi tiết từng field — phần cốt lõi cho Tester:

| Field (Label) | Loại UI | Required | Ràng buộc (min/max/format/default) | REQ liên quan | Ghi chú |
|---|---|---|---|---|---|

### 5.4. Business Rules & Validation Messages
| REQ ID | Rule / Trigger | Thông báo lỗi mong đợi (nguyên văn) |
|---|---|---|

### 5.5. Ma trận Phân quyền (nếu có nhiều role)
| Hành động | Admin | Manager | Staff | Guest |
|---|---|---|---|---|
| Xem danh sách | ✅ | ✅ | ✅ | ❌ |
| Xóa bản ghi | ✅ | ❌ | ❌ | ❌ |

### 5.6. Ma trận Trạng thái (nếu entity có status flow)
| Trạng thái hiện tại | Hành động cho phép | Trạng thái kế tiếp | Ai được thực hiện |
|---|---|---|---|

### 5.7. Điểm Mơ Hồ & Rủi Ro
- Bảng Ambiguities: `AMB-XX | Câu hỏi | Nguy cơ | Mức độ | Assumption tạm`
- Bảng Risks: `RISK-XX | Rủi ro | Mô tả | Mitigation`

> Mục 5.5 / 5.6 ghi "Không áp dụng" nếu module không có phân quyền/trạng thái — KHÔNG được bỏ hẳn mục, để người đọc biết đã cân nhắc.

---

## 6. Bắt buộc (Strict Rules)
- Luôn viết bằng **Tiếng Việt**.
- **Mọi yêu cầu chức năng, business rule, validation rule đều phải có mã REQ ID** — tài liệu không có mã bị coi là chưa đạt.
- Không tự suy diễn nghiệp vụ nếu không có căn cứ từ UI/tài liệu → đưa vào Ambiguities kèm Assumption tạm.
- Nếu có Playwright MCP: mở browser thật (`navigate → resize 1920x1080 → snapshot`) để capture giao diện — KHÔNG đoán field/validation.
- Error messages ghi **nguyên văn** từ UI thực tế, không diễn đạt lại.
