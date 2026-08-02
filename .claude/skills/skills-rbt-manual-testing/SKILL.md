---
name: skills-rbt-manual-testing
description: Skill sinh manual test cases với 3 modes — QUICK (sinh nhanh từ requirements), FULL RBT (quy trình AI-RBT 6 bước có đánh giá rủi ro) và CHECKLIST (checklist rà soát ngắn để tick tay — smoke/regression/release). Master skill cho mọi tác vụ manual test case.
---

# RBT Manual Testing

## Description

Đây là **Master Skill** cho mọi tác vụ sinh manual test cases. Skill cung cấp **3 chế độ hoạt động** (modes) để phù hợp với mọi quy mô yêu cầu:

| Mode | Khi nào dùng | Output | Thời gian |
|------|-------------|--------|-----------|
| **QUICK** | Module đơn giản, cần TC nhanh, requirements rõ ràng | TC chi tiết có steps | 1 lượt (không chờ user) |
| **FULL RBT** | Module phức tạp, cần phân tích rủi ro, hệ thống lớn | TC chi tiết + Risk Level + RTM | 6 bước tuần tự (có checkpoint) |
| **CHECKLIST** | Cần danh sách rà soát ngắn để tick tay — smoke trước release, bàn giao tester, rà nhanh sau hotfix | Checklist 1 dòng/mục, có ô tick | 1 lượt (không chờ user) |

**Nguyên tắc cốt lõi:**
- **Human Strategy:** Con người xác định chiến lược, mức độ rủi ro và tiêu chuẩn
- **AI Execution:** AI thực hiện phân tích, viết TCs và rà soát lỗ hổng
- **Human Verification:** Con người kiểm tra lại kết quả trước khi chốt

---

## When to Use

Sử dụng skill này khi:

- Sinh manual test cases từ requirements / user stories
- Phân tích requirements để phát hiện ambiguity
- Phân rã hệ thống thành modules / features
- Xây dựng traceability matrix
- Áp dụng Risk-Based Testing (đánh giá rủi ro cho test cases)
- Chuẩn hóa test cases sang bảng Markdown (Jira/Excel format)
- Sinh test cases nhanh từ requirements đơn giản
- Sinh checklist rà soát ngắn để tick tay (smoke / regression / release-readiness / post-hotfix)

**KHÔNG** sử dụng skill này khi:

- Cần sinh automation code → dùng `skills-qa-automation-engineer`
- Cần inspect DOM / sinh locator → dùng `skills-ui-debug-agent` / `skills-smart-locator-agent`
- Chỉ cần sinh test data → dùng `skills-test-data-generator`

---

## Mode Routing — Cách chọn mode

Agent tự động chọn mode dựa trên **trigger keywords** và **ngữ cảnh**:

### → Mode QUICK

Kích hoạt khi:
- User dùng command `/generate_testcases_from_requirements`
- User nói: "sinh test cases nhanh", "tạo TC từ requirement này", "viết test cases cho form..."
- Requirements đã rõ ràng, scope nhỏ (1 module / 1 tính năng)
- User không yêu cầu phân tích rủi ro hay quy trình bài bản

### → Mode FULL RBT

Kích hoạt khi:
- User dùng command `/generate_testcases_manual_rbt`
- User nói: "quy trình 6 bước", "phân tích RBT", "sinh test cases đầy đủ", "sinh bộ TC bài bản"
- Scope lớn (nhiều modules, hệ thống phức tạp)
- User yêu cầu Traceability Matrix hoặc đánh giá Risk Level
- Requirements chưa rõ ràng, cần phân tích Ambiguity

### → Mode CHECKLIST

Kích hoạt khi:
- User dùng command `/generate_checklist_test`
- User nói: "sinh checklist test", "checklist smoke", "checklist trước release", "danh sách rà soát", "checklist bàn giao cho tester", "rà nhanh sau hotfix"
- User cần **danh sách tick tay** ngắn gọn, KHÔNG cần steps chi tiết
- User muốn rút gọn bộ TC chi tiết đã có thành checklist chạy nhanh

> Phân biệt: user cần **chạy tay nhanh và tick** → CHECKLIST. User cần **bộ TC lưu trữ, giao cho automation, import Jira/TestRail** → QUICK hoặc FULL RBT.

### → Khi không rõ

Nếu không xác định được mode, agent **hỏi user**:
```
Bạn muốn sinh theo chế độ nào?
1. QUICK — Test cases chi tiết, sinh nhanh từ requirements (không qua bước phân tích)
2. FULL RBT — Quy trình 6 bước đầy đủ (phân tích → phân rã → RBT → sinh TC)
3. CHECKLIST — Danh sách rà soát ngắn để tick tay (smoke / release / hotfix)
```

---

## Quy Tắc Xuất File & Theo Dõi Tiến Độ (BẮT BUỘC — áp dụng cả 3 modes)

Bộ TC thường dài 70–100+ dòng bảng. In toàn bộ ra chat khiến user phải chờ render lâu và không thấy được tiến độ. Agent **BẮT BUỘC** tuân thủ quy tắc sau.

### 1. Write-first — KHÔNG render bảng TC ra chat

- Agent ghi TC **thẳng vào file** bằng công cụ Write/Edit sau mỗi batch
- **NGHIÊM CẤM** in toàn bộ bảng TC ra chat rồi mới ghi file (user phải chờ 2 lần cho cùng một nội dung)
- Chat **chỉ** hiển thị:
  - Dòng tiến độ ngắn sau mỗi batch: `✅ Batch 2/4 — Validation form (18 TC) → test_cases_customers_part1.md`
  - **Bảng Đối Soát Coverage** (tiêu chí 6) ở cuối
  - Tóm tắt: tổng số TC · số file · đường dẫn file · điểm cần user review
- Muốn xem nội dung → user tự mở file. Chỉ trích dẫn tối đa **3–5 dòng TC mẫu** ra chat khi cần minh họa

### 2. Ngưỡng tách file

| Điều kiện | Xử lý |
|---|---|
| 1 module | 1 file `test_cases_<module>.md` |
| File vượt **40 TC** | Tách `_part1`, `_part2`... — mỗi part ≤ 40 TC, **cắt tại ranh giới nhóm chức năng**, không cắt giữa nhóm |
| Nhiều module | Mỗi module 1 file riêng, KHÔNG gộp chung |
| Có ≥2 part | **BẮT BUỘC** sinh thêm file index (xem mục 4) |

> 40 TC ≈ 25–30 KB — mở nhanh, review được trong 1 lượt. Tham khảo: `docs/testcases/test_cases_customers.md` hiện 105 KB trong 1 file là **vượt ngưỡng**, nên tách khi có dịp cập nhật.

### 3. Chạy theo batch — không dừng hỏi giữa chừng

- Chia theo **nhóm chức năng** (validation form / data table / CRUD / phân quyền / status flow / non-functional), mỗi batch 15–25 TC
- Agent **chạy thẳng hết mọi batch trong 1 lượt**, KHÔNG dừng hỏi "có tiếp tục không" sau mỗi batch
- Trước khi sinh, agent công bố kế hoạch batch để user biết tổng khối lượng:
  ```
  Kế hoạch: 4 batch · ~76 TC · 2 file
  1. Validation form (≈24 TC)   2. Data table & filter (≈18 TC)
  3. CRUD & phân quyền (≈22 TC) 4. Non-functional (≈12 TC)
  ```
- Ngoại lệ được phép dừng: phát hiện requirement mâu thuẫn nghiêm trọng làm sai hàng loạt TC phía sau

### 4. File index (khi có ≥2 part hoặc ≥2 module)

Sinh `test_cases_<module>_index.md`:

```markdown
# Test Cases — <Module> (tổng <N> TC · <M> file)

| File | Nhóm chức năng | Số TC | TC ID range |
|---|---|---|---|
| test_cases_customers_part1.md | Validation form, Data table | 42 | CRM_CUST_TC_001–042 |
| test_cases_customers_part2.md | CRUD, Phân quyền, Non-functional | 34 | CRM_CUST_TC_043–076 |

## Bảng Đối Soát Coverage (toàn module)
<gộp coverage của tất cả part — mọi REQ phải có ≥1 TC>
```

### 5. task.md — theo dõi tiến độ

Khi tổng TC dự kiến **>30** hoặc có **≥2 module**, agent **BẮT BUỘC** tạo `task.md` (nhất quán với các command automation trong repo) và cập nhật sau mỗi batch:

```markdown
# Task: Sinh TC module Customers
- [x] Batch 1 — Validation form (24 TC) → part1
- [x] Batch 2 — Data table & filter (18 TC) → part1
- [ ] Batch 3 — CRUD & phân quyền (đang chạy)
- [ ] Batch 4 — Non-functional
- [ ] Quality Gate + Bảng Đối Soát Coverage
```

> Nếu môi trường có sẵn task list của Claude Code → dùng luôn task list thay cho `task.md` để user thấy tiến độ trực tiếp trên UI.

---

# Mode 1: QUICK — Sinh Test Cases Nhanh

## Mục đích

Sinh test cases **nhanh, đủ chất lượng** từ requirements/user stories đã rõ ràng, phù hợp cho module đơn giản hoặc khi cần kết quả ngay.

## Quy trình (1 lượt duy nhất)

**Agent phải:**

1. **Đọc và hiểu requirements** được cung cấp
   - Nếu requirements đã có mã REQ ID (từ `skills-requirements-analyzer`) → dùng nguyên mã đó
   - Nếu chưa có mã → agent tự gán `REQ-<MODULE>-<SỐ>` cho từng yêu cầu/rule trước khi sinh TC
2. **Ghi nhận Assumptions (BẮT BUỘC khi requirement mơ hồ):**
   - QUICK mode không dừng hỏi Q&A → mọi điểm không rõ agent phải **ghi rõ giả định** đã dùng
   - Xuất mục "Assumptions" ngay đầu output: `ASM-XX | Điểm chưa rõ | Giả định đã áp dụng | TC bị ảnh hưởng`
   - KHÔNG được đoán ngầm mà không ghi lại
3. **Xác định các luồng chính:**
   - Happy Path (luồng chính)
   - Negative Path (dữ liệu sai, thiếu)
   - Boundary Cases (giá trị biên)
4. **Áp dụng kỹ thuật thiết kế test case** theo Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật (xem section riêng):
   - **Equivalence Partitioning (EP):** Chia input thành nhóm tương đương
   - **Boundary Value Analysis (BVA):** Test giá trị tại ranh giới
   - **Decision Table:** Liệt kê tổ hợp điều kiện (nếu có nhiều rules)
   - **State Transition:** Test chuyển đổi trạng thái (nếu có workflow)
5. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê **tất cả input fields** trên form/UI
   - Sinh validation test cases **riêng cho TỪNG trường** dựa theo Bảng Checklist 15 loại field
   - **KHÔNG** gộp validation của nhiều trường vào 1 test case
6. **Bao phủ Component-Level Checklist:** Data Table/List, CRUD Lifecycle, Permission/Role, Modal/Dialog, Notification (xem bảng riêng bên dưới)
7. **Bao phủ các Scenarios Chuyên sâu & Non-Functional:**
   - Race Condition & Double Submit
   - Session & Network Resilience
   - Localization & UTF-8 / Emoji
   - Keyboard Accessibility (A11y)
   - HTTP Status Codes (cho API TCs)
8. **Xuất ra bảng Markdown** chuẩn có đầy đủ metadata cho Automation, sẵn sàng sync vào Google Sheets hoặc Jira/TestRail.
9. **Chạy Self-Quality Gate (6 Tiêu chí):** Rà soát lại 100% test cases + đối soát coverage trước khi xuất kết quả.

## Bảng Output Standard (chuẩn hóa đầy đủ Metadata)

```markdown
| TC ID | REQ ID | Module | Test Scenario | Pre-Condition | Test Steps | Expected Result | Test Data | Priority | Automatable | Auto Type | Tags |
```

> **Giải thích Metadata:**
> - **REQ ID:** Mã requirement mà TC này cover (`REQ-LOGIN-01`) — BẮT BUỘC, 1 TC có thể cover nhiều REQ (phân cách `,`). Đây là mắt xích truy vết để đối soát "đủ case" và chạy `/generate_traceability_matrix`
> - **Automatable:** `Yes` / `No` / `Partial` (Độ khả thi để viết script tự động)
> - **Auto Type:** `UI` / `API` / `Unit` / `N/A` (Loại automation phù hợp)
> - **Tags:** `@Smoke`, `@Regression`, `@CriticalPath`, `@Security`, `@Boundary`

## Quy Tắc Trình Bày Test Steps (BẮT BUỘC — áp dụng QUICK & FULL RBT)

> Mode CHECKLIST KHÔNG dùng steps đánh số — xem Quy Tắc Viết Mục Checklist ở Mode 3.

- **Mỗi bước 1 hành động, đánh số thứ tự rõ ràng** `1. 2. 3.` — trong cell Markdown dùng `<br>` xuống dòng
- **Expected Result đánh số khớp 1-1** với step tương ứng (step nào có kết quả quan sát được thì có expected cùng số)
- KHÔNG viết steps thành đoạn văn liền, KHÔNG gộp nhiều hành động vào 1 số

```markdown
✅ Đúng:
| Test Steps | Expected Result |
| 1. Mở trang /login<br>2. Nhập email: test_login_01@auto.test<br>3. Nhập password: Test@123<br>4. Click nút "Đăng nhập" | 1. Trang login hiển thị đủ 2 field + nút<br>4. Chuyển đến /dashboard, hiển thị "Xin chào" |

❌ Sai:
| Mở trang login rồi nhập email và password hợp lệ sau đó bấm đăng nhập | Đăng nhập thành công |
```

## Quy tắc Test Data (áp dụng cho cả 3 modes)

```
❌ Sai: "Nhập mã số hợp lệ"
✅ Đúng: "Nhập mã: KH-2026-0012"

❌ Sai: "Nhập email hợp lệ"
✅ Đúng: "Nhập email: test_khachhang_01@domain.com"

❌ Sai: "Nhập giá trị vượt giới hạn"
✅ Đúng: "Nhập 256 ký tự vào trường Name (max: 255)"
```

## Bảng Field-Level Validation Checklist (15 Field Types)

Khi form/UI có các input fields, agent **BẮT BUỘC** phải liệt kê từng trường và sinh validation TCs riêng theo loại:

| Loại Field | Validation cần test |
|---|---|
| **Text (Name, Address...)** | Required/Optional · Min/Max length · Whitespace-only · Ký tự đặc biệt (`<>&"'`) · XSS injection (`<script>alert(1)</script>`) · SQL injection (`' OR 1=1--`) · Unicode/Emoji · Leading/trailing spaces |
| **Email** | Format hợp lệ (`user@domain.com`) · Thiếu `@` · Thiếu domain · Domain không hợp lệ · Nhiều `@` · Ký tự đặc biệt trước `@` · Max length · Case sensitivity · Email đã tồn tại (nếu unique) |
| **Phone** | Chỉ số · Prefix hợp lệ (ví dụ: `+84`, `0`) · Min/Max length · Chữ cái xen lẫn · Dấu `-`, `.`, khoảng trắng · Mã vùng không hợp lệ |
| **Date / DateTime** | Format đúng (dd/MM/yyyy, ISO...) · Ngày không tồn tại (`31/02`, `30/02`) · Năm nhuận (`29/02/2024`) · Quá khứ / tương lai · Min/max date · Timezone |
| **Number / Currency** | Min/Max value · Số âm · Số 0 · Số thập phân · Ký tự không phải số · Overflow · Leading zeros · Định dạng currency |
| **Dropdown / Select** | Giá trị mặc định · Tất cả options hợp lệ · Option disabled · Thay đổi selection · Required validation |
| **Checkbox / Radio** | Trạng thái mặc định · Check/Uncheck · Required validation · Nhóm radio (chỉ chọn 1) |
| **File Upload** | File type hợp lệ/không hợp lệ · Max size · File rỗng (0 KB) · Tên file ký tự đặc biệt · Multiple files · Kéo thả vs nút chọn |
| **Password** | Min/Max length · Yêu cầu ký tự đặc biệt · Yêu cầu chữ hoa/thường · Yêu cầu số · Copy-paste bị chặn? · Hiện/ẩn password · Confirm password khớp/không khớp |
| **Textarea** | Max length · Line breaks · HTML tags · Resize (nếu UI cho phép) · Character counter (nếu có) |
| **OTP / MFA Code** | Auto-focus ô tiếp theo · Paste chuỗi OTP · Hết hạn timeout · Vượt số lần nhập sai (retry limit/lockout) · Re-send OTP rate limit |
| **Date Range / Time Picker** | Ngày kết thúc < Ngày bắt đầu · Khung giờ trùng lặp (time conflict) · Giới hạn khoảng ngày (VD: max 30 ngày) · Quá khứ/Tương lai restriction |
| **Rich Text Editor (WYSIWYG)** | Sanitize HTML tags nguy hiểm (`<script>`, `<iframe>`) · Paste văn bản kèm format/ảnh · Character counter tính theo text thô vs HTML markup |
| **Multi-Select / Tag Input** | Giới hạn số lượng tag · Tag trùng lặp · Xóa tag bằng Backspace/nút X · Tag có ký tự đặc biệt |
| **Range Slider / Stepper** | Giới hạn min/max · Bước nhảy (step increment violation) · Nhập tay trực tiếp so với kéo slider |

## Bảng Component-Level Checklist (Ngoài form input — BẮT BUỘC rà soát)

Form input chỉ là một phần của app. Khi module có các thành phần sau, agent **BẮT BUỘC** sinh TCs theo checklist tương ứng:

| Component | Checklist cần test |
|---|---|
| **Data Table / List** | Sort từng cột (asc/desc) · Filter đơn + kết hợp nhiều filter · Search (khớp một phần, không dấu/có dấu, không có kết quả) · Pagination (trang đầu/cuối, đổi page size, nhảy trang) · Empty state (chưa có data) · Danh sách lớn (100+ bản ghi) · Bulk action (chọn tất cả, chọn một phần, thao tác hàng loạt) · Refresh giữ/mất filter đang áp |
| **CRUD Lifecycle** | Create → hiển thị đúng trong list · View detail khớp data đã tạo · Edit → lưu → verify data cập nhật (cả trong list và detail) · Delete → confirm dialog (Cancel giữ nguyên / OK xóa) · Xóa bản ghi đang được liên kết (foreign key) · Tạo trùng unique field · Edit đồng thời 2 người (concurrent) |
| **Permission / Role** | Đối chiếu **Ma trận Phân quyền** trong requirements: mỗi role × mỗi hành động = 1 TC · Truy cập URL trực tiếp khi không có quyền (bypass UI) · Element ẩn/disable đúng theo role · API trả 403 khi gọi trái quyền |
| **Modal / Dialog** | Mở/đóng bằng nút X, nút Cancel, phím ESC, click ra ngoài · Data trong modal reset hay giữ khi mở lại · Submit trong modal lỗi → modal không đóng, hiện lỗi · Nhiều modal chồng nhau (nếu có) |
| **Notification / Toast** | Nội dung đúng theo từng hành động · Tự đóng sau timeout / đóng tay · Nhiều notification liên tiếp · Toast lỗi khác toast thành công (màu/icon) |
| **Trạng thái (Status Flow)** | Đối chiếu **Ma trận Trạng thái** trong requirements: mỗi transition hợp lệ = 1 TC · Mỗi transition KHÔNG hợp lệ = 1 TC (verify bị chặn) · Hành động cho phép/khóa theo từng trạng thái |

> Component nào không có trong module → ghi chú "Không áp dụng" trong phần tổng kết coverage, KHÔNG lặng lẽ bỏ qua.

---

## Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật Thiết Kế (Khi nào PHẢI dùng)

Agent không được chỉ "nhắc tên" kỹ thuật — phải áp dụng theo điều kiện kích hoạt:

| Kỹ thuật | Điều kiện BẮT BUỘC áp dụng | Cách làm |
|---|---|---|
| **EP + BVA** | Mọi field có ràng buộc min/max/format | Mỗi partition ≥1 TC; biên test tại `min-1, min, max, max+1` |
| **Decision Table** | Có **≥3 điều kiện kết hợp** ảnh hưởng đến 1 output (VD: loại KH × hạn mức × trạng thái → được duyệt?) | Lập bảng đầy đủ tổ hợp → mỗi rule (cột) = 1 TC. Nếu >20 tổ hợp → dùng pairwise và ghi chú lý do rút gọn |
| **State Transition** | Entity có **≥3 trạng thái** hoặc có status flow (Draft → Pending → Approved...) | Vẽ bảng transition → TC cho mọi transition hợp lệ + TC verify mọi transition không hợp lệ bị chặn |

**Ví dụ Decision Table (3 điều kiện → 1 output):**

```markdown
| Rule | Loại KH = VIP | Đơn > 10 triệu | Có mã giảm giá | → Giảm giá |
|---|---|---|---|---|
| R1 | Yes | Yes | Yes | 20% |
| R2 | Yes | Yes | No  | 15% |
| R3 | Yes | No  | -   | 10% |
| R4 | No  | Yes | Yes | 10% |
| R5 | No  | No  | No  | 0%  |
→ Mỗi rule R1-R5 = 1 TC với test data cụ thể
```

**Ví dụ State Transition (đơn hàng):**

```markdown
| Từ \ Đến | Pending | Confirmed | Shipped | Cancelled |
|---|---|---|---|---|
| Draft     | ✅ TC_x | ❌ TC_y (verify chặn) | ❌ | ✅ |
| Pending   | -       | ✅ | ❌ | ✅ |
| Confirmed | ❌      | -  | ✅ | ❌ (verify chặn) |
→ Mỗi ô ✅ và ❌ đều là 1 TC
```

---

## Scenarios Chuyên Sâu & Non-Functional Checklist (Áp dụng nâng cao)

Agent phải tích hợp thêm các tình huống kiểm thử nâng cao khi phân tích module:

1. **Race Condition & Double Submit:**
   - Double click liên tiếp nút Save/Submit (ngăn tạo 2 bản ghi trùng)
   - Concurrent editing: 2 tabs/users cùng sửa 1 bản ghi đồng thời
2. **Session & Network Resilience:**
   - Session timeout / Token hết hạn giữa chừng khi đang điền form
   - Network interruption (mất mạng khi submit payload, slow 3G timeout, retry logic)
3. **Localization & UTF-8 / Emoji:**
   - Nhập tiếng Việt đầy đủ dấu (`Tiếng Việt có dấu phức tạp ỨỜÁ...`)
   - Nhập emoji (`😀🎉🚀`) và ký tự đa ngôn ngữ (RTL, tiếng Trung, Nhật, Ả Rập)
4. **Keyboard Accessibility (A11y):**
   - Điều hướng bằng phím `Tab` theo thứ tự hợp lý, kích hoạt bằng `Enter`/`Space`
   - Hiển thị viền focus state rõ ràng
5. **HTTP Status Codes (Cho API Test Cases):**
   - Assert đầy đủ các status codes tiêu chuẩn: `200/201 Success`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Rate Limit`, `500/503 Server Error`.

---

## 🛡️ AI Self-Quality Gate (Quy trình Tự Kiểm Định Chất Lượng)

Trước khi xuất kết quả cuối cùng cho user, Agent **BẮT BUỘC** tự rà soát qua 6 tiêu chí:
- [ ] **1. Unique TC ID:** Đảm bảo không trùng mã TC ID và đúng quy tắc dự án (`PROJECT_MODULE_TC_001`).
- [ ] **2. 1-to-1 Step-Expected Matching:** Các bước `Test Steps` đánh số rõ ràng (1,2,3 — mỗi bước 1 hành động) và khớp 1-1 với `Expected Result` đánh số tương ứng.
- [ ] **3. Concrete Test Data:** 100% test data chứa giá trị cụ thể, không còn từ ngữ mơ hồ ("hợp lệ", "dữ liệu đúng").
- [ ] **4. Field Validation Coverage:** Mọi input field trên UI đều có ít nhất 1 Positive TC và 2+ Negative/Boundary TCs.
- [ ] **5. Automation Metadata Ready:** 100% test cases được gắn đầy đủ `Automatable`, `Auto Type`, và `@Tag`.
- [ ] **6. Requirement Coverage (đối soát "đủ case"):** 100% REQ ID có **≥1 TC** trỏ về; REQ mức High Risk có đủ Positive + Negative + Boundary. Xuất **Bảng Đối Soát Coverage** kèm output:

```markdown
| REQ ID | Mô tả ngắn | Số TC | TC IDs | Đủ Positive/Negative/Boundary? |
|---|---|---|---|---|
| REQ-LOGIN-01 | Đăng nhập email | 5 | TC_001..TC_005 | ✅ |
| REQ-LOGIN-02 | Khóa sau 5 lần sai | 0 | — | 🔴 THIẾU — phải bổ sung trước khi xuất |
```
> Nếu có REQ nào 0 TC → agent PHẢI quay lại sinh bổ sung, KHÔNG được xuất kết quả có dòng 🔴.

---

# Mode 2: FULL RBT — Quy Trình AI-RBT 6 Bước

## Mục đích

Quy trình bài bản, tuần tự cho module phức tạp. Bao gồm phân tích Ambiguity, phân rã hệ thống, Traceability Matrix, đánh giá Risk Level, và sinh test cases chi tiết.

> ⚠️ **QUAN TRỌNG:** Quy trình này **BẮT BUỘC chạy tuần tự** từng bước. KHÔNG được gộp nhiều bước chạy 1 lần. Mỗi bước phải hoàn thành và được user xác nhận trước khi sang bước tiếp.

> [!NOTE]
> **2 luồng sử dụng riêng biệt:**
> - **Luồng Claude Code (command):** Agent thực hiện theo hướng dẫn tổng quát bên dưới. Agent KHÔNG cần đọc file prompt.txt.
> - **Luồng Copy-Paste (Claude Chat):** QA team copy nội dung prompt chi tiết từ `plans/manual/01-06/prompt.txt` vào chat AI, từng bước một.

### Bước 1: Context & Role-play (Khởi tạo ngữ cảnh)

**Mục đích:** Thiết lập vai trò Senior QA Engineer và nạp bối cảnh dự án.

**Agent phải:**
1. Yêu cầu user cung cấp:
   - Tên dự án / tính năng
   - Mô tả hệ thống hiện tại
   - Mục tiêu kiểm thử MVP
   - Tài liệu yêu cầu (Requirements, User Stories, Figma link, PDF...)
2. Đọc kỹ tài liệu và xác nhận đã hiểu bối cảnh
3. Tóm tắt scope kiểm thử
4. **Chờ user xác nhận** trước khi sang Bước 2

**Output:** Xác nhận hiểu bối cảnh + tóm tắt scope kiểm thử.

---

### Bước 2: Analysis & QnA (Phân tích yêu cầu)

**Mục đích:** Phân tích tài liệu để phát hiện điểm mờ, thiếu sót, mâu thuẫn.

**Agent phải:**
1. Xác định các luồng:
   - Happy Path (luồng chính)
   - Alternate Paths (luồng rẽ nhánh)
   - Exception Paths (luồng ngoại lệ)
2. Phát hiện Ambiguities:
   - Yêu cầu thiếu sót (không quy định độ dài textbox, timeout, hành vi mất kết nối...)
   - Yêu cầu mâu thuẫn
   - Yêu cầu chưa rõ ràng
3. Đặt câu hỏi Q&A có đánh số thứ tự (Q1, Q2...) cho user/PO/BA giải đáp, mỗi câu kèm ngữ cảnh và assumption nếu không được trả lời
4. **DỪNG LẠI — Chờ user trả lời** các câu hỏi trước khi tiếp tục

**Output:** Danh sách luồng + Ambiguities + Câu hỏi Q&A.

> [!IMPORTANT]
> **Đây là điểm nghẽn quan trọng nhất.** Nếu agent bỏ qua bước này và tự đoán logic, test cases sẽ sai nghiêm trọng. Agent PHẢI dừng lại và đợi user phản hồi.

---

### Bước 3: Decomposition (Phân rã hệ thống)

**Mục đích:** Chia tính năng phức tạp thành các Module / Sub-module nhỏ, dễ quản lý.

**Agent phải:**
1. Phân rã theo 1 trong 2 cách:
   - **Theo UI:** Header, Data Table, Form popup, Sidebar...
   - **Theo luồng:** Flow tạo mới, Flow chỉnh sửa, Flow xóa...
2. Mô tả ngắn gọn chức năng từng Module
3. Chỉ ra Dependencies giữa các Module

**Output:** Danh sách Modules/Sub-modules + Dependencies.

---

### Bước 4: Traceability (Đảm bảo độ bao phủ)

**Mục đích:** Thiết lập ma trận truy vết để đảm bảo 100% requirements được phủ test scenarios.

**Agent phải:**
1. Map mỗi Module/Rule với mã Yêu cầu (REQ-01, REQ-02...)
2. Cross-check xem có yêu cầu nào bị thiếu trong danh sách phân rã (Gap Analysis)
3. Liệt kê High-Level Test Scenarios cho từng Module, tập trung:
   - Security / phân quyền
   - UI Validation
   - Business Logic
   - Data Integrity
   - Error Handling
4. **Chờ user review** danh sách scenarios trước khi sinh test case chi tiết

**Output:** Traceability Matrix + High-Level Test Scenarios.

---

### Bước 5: RBT & TC Generation (Sinh Test Case chi tiết)

**Mục đích:** Sinh test cases chi tiết theo chiến lược Risk-Based Testing.

**Agent phải:**
1. Đánh giá Risk Level cho mỗi Module:
   - **High Risk:** Test kỹ, nhiều cases (nghiệp vụ quan trọng, liên quan tiền, bảo mật)
   - **Medium Risk:** Test vừa phải
   - **Low Risk:** Test cơ bản, happy path
2. Sinh test case với đầy đủ fields:
   - Module / Sub-module
   - **REQ ID** (mã requirement mà TC cover — lấy từ Traceability Matrix ở Bước 4)
   - Test Case Title
   - Pre-conditions
   - Test Steps (**đánh số 1,2,3 — mỗi bước 1 hành động**, theo Quy Tắc Trình Bày Test Steps)
   - Expected Results (đánh số khớp 1-1 với steps)
   - Test Data (**phải cụ thể**, không dùng placeholder chung chung)
   - Priority
3. Bao phủ đa dạng:
   - Happy Path
   - Negative Path (giá trị biên, vượt ký tự)
   - Edge Cases (timeout, mất kết nối...)
4. **Áp dụng kỹ thuật theo Quy Tắc Bắt Buộc:** EP+BVA cho field có ràng buộc; **Decision Table** khi ≥3 điều kiện kết hợp; **State Transition** khi có status flow (xem section Quy Tắc Bắt Buộc Áp Dụng Kỹ Thuật)
5. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê **tất cả input fields** trên form/UI đang test
   - Sinh validation TCs **riêng cho TỪNG trường** theo đặc tính riêng (15 loại input field types)
   - **KHÔNG** gộp validation nhiều trường vào 1 TC
6. **Bao phủ Component-Level Checklist:** Data Table/List, CRUD Lifecycle, Permission/Role (đối chiếu Ma trận Phân quyền), Modal/Dialog, Notification, Status Flow (đối chiếu Ma trận Trạng thái)
7. **Tích hợp Scenarios Chuyên Sâu & Non-Functional:** Race Condition/Double Submit, Session/Network Resilience, Localization/UTF-8/Emoji, Keyboard Accessibility (A11y), HTTP Status Codes.
8. Nếu scenarios quá nhiều → sinh từng Module một, hỏi user để tiếp tục

**Output:** Danh sách Test Cases chi tiết có Risk Level.

---

### Bước 6: Template Mapping (Chuẩn hóa Format & Metadata)

**Mục đích:** Đóng gói test cases thành bảng Markdown chuẩn đầy đủ metadata cho Automation, sẵn sàng copy sang Excel/Jira hoặc sync vào Google Sheets.

**Agent phải:**
1. Chuẩn hóa toàn bộ test cases vào bảng Markdown:

```markdown
| TC ID | REQ ID | Module | Risk Level | Test Title | Pre-Condition | Test Steps | Expected Result | Priority | Test Data | Automatable | Auto Type | Tags |
```

2. Quy tắc bảng:
   - TC ID theo format thống nhất (ví dụ: `CRM_CUST_TC_001`)
   - **REQ ID bắt buộc mỗi dòng** — TC không trỏ về REQ nào là TC mồ côi, phải xem lại
   - Test Steps đánh số `1. 2. 3.` (mỗi bước 1 hành động), Expected Result đánh số khớp 1-1, dùng `<br>` xuống dòng trong cell
   - Gắn đầy đủ metadata `Automatable` (`Yes`/`No`/`Partial`), `Auto Type` (`UI`/`API`/`Unit`/`N/A`), và `@Tags` (`@Smoke`, `@Regression`, `@CriticalPath`...)
   - **TUYỆT ĐỐI không được bỏ sót** bất kỳ test case nào đã sinh ở Bước 5
3. **Chạy Self-Quality Gate (6 Tiêu chí):** Kiểm định lại — bao gồm **Bảng Đối Soát Coverage** (tiêu chí 6: mọi REQ có ≥1 TC) — trước khi xuất Artifact (`test_cases_<module>.md`).

**Output:** Bảng Test Cases Markdown hoàn chỉnh kèm Metadata Automation.

---

# Mode 3: CHECKLIST — Sinh Danh Sách Rà Soát Tick Tay

## Mục đích

Sinh **checklist ngắn gọn để tick tay** khi cần chạy nhanh — smoke trước release, bàn giao cho tester thủ công, rà soát sau hotfix. Mỗi mục là **1 dòng kiểm tra được trong vài phút**, KHÔNG phải test case có steps chi tiết.

> **Ranh giới với QUICK/FULL RBT:** Checklist trả lời "đã rà hết chưa?", test case trả lời "rà bằng cách nào?". Nếu user cần steps chi tiết, test data đầy đủ, import Jira/TestRail hay giao cho automation → dùng QUICK hoặc FULL RBT, KHÔNG dùng mode này.

## 2 Nguồn Input

Agent xác định nguồn trước khi sinh:

| Nguồn | Khi nào | Cách làm |
|---|---|---|
| **REQ-based** | Chưa có bộ TC, chỉ có requirements / UI | Rút mục checklist trực tiếp từ requirements + 3 bảng checklist chuẩn của skill |
| **TC-based** | Đã có file `test_cases_<module>.md` | **Rút gọn** từ bộ TC sẵn có — gom nhóm TC cùng chủ đề thành 1 mục, giữ cột `TC ID liên quan` để truy ngược |

> TC-based được ưu tiên khi bộ TC đã tồn tại — tránh sinh lại nội dung lệch với bộ TC gốc.

## 4 Loại Checklist & Quy Mô Khuyến Nghị

Agent **BẮT BUỘC** hỏi hoặc suy ra loại checklist, vì nó quyết định độ sâu và số mục:

| Loại | Mục đích | Số mục | Thời gian chạy tay |
|---|---|---|---|
| **Smoke** | Xác nhận build chạy được, luồng sống còn không vỡ | 10–20 | ≤ 15 phút |
| **Post-hotfix** | Rà vùng ảnh hưởng của bản vá + vùng lân cận | 5–15 | ≤ 10 phút |
| **Regression (module)** | Rà toàn bộ 1 module trước khi bàn giao | 20–40 | ≤ 45 phút |
| **Release-readiness** | Rà toàn hệ thống trước khi lên production | 30–60 | ≤ 60 phút |

> Vượt ngưỡng số mục → agent PHẢI tách theo module hoặc hạ scope, KHÔNG xuất checklist dài lê thê (mất tác dụng "rà nhanh").

## Quy trình (1 lượt duy nhất)

**Agent phải:**

1. **Xác định loại checklist** (Smoke / Post-hotfix / Regression / Release-readiness) và **nguồn input** (REQ-based hay TC-based)
2. **Xác định scope:** module nào, luồng nào, role nào. Với Post-hotfix → xác định rõ **vùng ảnh hưởng** của thay đổi + vùng lân cận có rủi ro
3. **Rút mục từ 3 bảng checklist chuẩn của skill** — chỉ lấy mục **thực sự áp dụng** cho module:
   - **Field-Level Validation (15 loại field):** với checklist chỉ lấy **1–2 mục đại diện rủi ro cao nhất** cho mỗi field quan trọng (KHÔNG liệt kê hết mọi validation — đó là việc của QUICK/FULL)
   - **Component-Level:** Data Table/List, CRUD Lifecycle, Permission/Role, Modal/Dialog, Notification, Status Flow
   - **Non-Functional:** Race condition/Double submit, Session/Network, Localization/UTF-8, A11y bàn phím
4. **Ưu tiên theo rủi ro:** luồng liên quan tiền, phân quyền, mất dữ liệu → luôn nằm trong checklist dù loại nào
5. **Viết mỗi mục theo Quy Tắc Viết Mục Checklist** (bên dưới)
6. **Gắn metadata:** `Priority` (P1/P2/P3), `REQ ID` (nếu có), `TC ID liên quan` (nếu TC-based)
7. **Nhóm mục theo Module → Nhóm chức năng**, đánh số liên tục để dễ đối chiếu khi báo cáo
8. **Chạy Checklist Quality Gate (4 tiêu chí)** trước khi xuất

## Bảng Output Standard

```markdown
## [Tên Module] — Checklist <Loại> (<số mục> mục · ~<thời gian> phút)

### Nhóm: <Tên nhóm chức năng>

| # | ✅ | Hạng mục kiểm tra | Kết quả kỳ vọng | Priority | REQ ID | TC ID liên quan |
|---|---|---|---|---|---|---|
| 1 | ☐ | Đăng nhập bằng tài khoản admin hợp lệ | Vào /dashboard, hiển thị tên user góc phải | P1 | REQ-LOGIN-01 | CRM_LOGIN_TC_001 |
| 2 | ☐ | Đăng nhập sai mật khẩu 5 lần liên tiếp | Tài khoản bị khóa, hiện thông báo khóa | P1 | REQ-LOGIN-02 | CRM_LOGIN_TC_012 |
```

**Kết thúc checklist BẮT BUỘC kèm bảng ký nhận:**

```markdown
| Môi trường | Build / Version | Người thực hiện | Ngày | Kết quả (Pass/Fail/Blocked) |
|---|---|---|---|---|
|  |  |  |  |  |
```

> Cột `✅` để trống ô tick `☐` — người chạy tự đánh dấu. Cột `TC ID liên quan` ghi `—` khi checklist là REQ-based.

## Quy Tắc Viết Mục Checklist (BẮT BUỘC)

- **Mỗi mục 1 dòng, ≤ 20 từ**, bắt đầu bằng **động từ** (Đăng nhập, Tạo, Sửa, Xóa, Lọc, Xuất...)
- **Verify được trong ≤ 2 phút** bởi người chưa đọc requirements
- **Có kết quả kỳ vọng quan sát được** — không viết "hoạt động đúng", phải nêu dấu hiệu cụ thể trên UI
- **Test data cụ thể ở mục phụ thuộc data** (áp dụng nguyên Quy tắc Test Data của skill)
- **KHÔNG viết steps đánh số** — nếu một mục cần >3 thao tác mới verify được thì nó là test case, phải tách hoặc chuyển sang mode QUICK

```markdown
❌ Sai: "Kiểm tra chức năng khách hàng hoạt động tốt"
✅ Đúng: "Tạo KH mới với đủ field bắt buộc → xuất hiện đầu danh sách, đúng tên vừa nhập"

❌ Sai: "Test phân quyền"
✅ Đúng: "Đăng nhập role Sale, mở URL /admin/settings trực tiếp → bị chặn, về trang 403"

❌ Sai: "Kiểm tra validate email"
✅ Đúng: "Nhập email thiếu @ (`test.domain.com`) → hiện lỗi 'Email không hợp lệ', không submit"
```

## 🛡️ Checklist Quality Gate (4 Tiêu Chí)

Trước khi xuất, agent **BẮT BUỘC** tự rà:

- [ ] **1. Verify được:** 100% mục có kết quả kỳ vọng quan sát được, không còn từ "hoạt động đúng / bình thường / OK"
- [ ] **2. Critical path đủ:** Mọi luồng sống còn của module (đăng nhập, tạo/sửa/xóa bản ghi chính, phân quyền, thanh toán nếu có) đều có ≥1 mục P1
- [ ] **3. Component đủ:** Mỗi component có mặt trong module (Table/List, CRUD, Permission, Modal, Notification, Status Flow) có ≥1 mục — component không có trong module thì ghi "Không áp dụng", KHÔNG lặng lẽ bỏ qua
- [ ] **4. Đúng quy mô:** Số mục nằm trong ngưỡng của loại checklist. Vượt ngưỡng → tách theo module hoặc hạ scope, ghi rõ phần đã cắt

---

## Anti-Patterns (NGHIÊM CẤM — áp dụng cho cả 3 modes)

- ❌ Gộp nhiều bước chạy 1 lần trong FULL RBT (PHẢI tuần tự)
- ❌ Tự đoán business logic khi chưa hỏi user (Bước 2 - FULL RBT)
- ❌ Bỏ qua bước phân tích Ambiguity (FULL RBT)
- ❌ Sinh test data chung chung / placeholder
- ❌ Rút gọn hoặc bỏ sót test case khi mapping sang bảng
- ❌ Sinh tất cả test cases 1 lần cho hệ thống lớn (phải chia module)
- ❌ Chỉ có Happy Path, thiếu Negative/Boundary cases (QUICK)
- ❌ Test Steps mơ hồ, không ghi rõ dữ liệu nhập
- ❌ Gộp validation nhiều trường vào 1 test case → mỗi trường phải có TC validation riêng
- ❌ Dùng chung 1 bộ validation cho tất cả fields (Email ≠ Phone ≠ Date ≠ Text)
- ❌ Bỏ qua security validation (XSS, SQL injection) cho text/textarea fields
- ❌ Không liệt kê danh sách fields trước khi sinh validation TCs
- ❌ Xuất TC không có cột `REQ ID` hoặc có REQ 0 TC mà không bổ sung (vi phạm tiêu chí 6 Quality Gate)
- ❌ Test Steps viết đoạn văn liền không đánh số, hoặc gộp nhiều hành động vào 1 số
- ❌ Chỉ test form input mà bỏ qua Table/List, CRUD lifecycle, Permission, Status flow (Component-Level Checklist)
- ❌ Có ≥3 điều kiện kết hợp nhưng không lập Decision Table; có status flow nhưng không lập bảng State Transition
- ❌ QUICK mode đoán ngầm khi requirement mơ hồ mà không ghi vào mục Assumptions
- ❌ CHECKLIST mode viết mục thành test case có steps đánh số (nhầm mode — cần steps thì dùng QUICK/FULL)
- ❌ CHECKLIST mode viết mục mơ hồ kiểu "Kiểm tra chức năng hoạt động đúng" (không verify được)
- ❌ CHECKLIST mode liệt kê hết 15 loại validation cho mọi field → checklist phình to, mất tác dụng rà nhanh
- ❌ Checklist Smoke vượt 20 mục hoặc Release-readiness vượt 60 mục mà không tách module
- ❌ Xuất checklist thiếu cột tick `☐` hoặc thiếu bảng ký nhận (môi trường/build/người chạy)
- ❌ Sinh checklist mới trong khi đã có bộ TC chi tiết mà không rút gọn từ bộ TC đó (gây lệch nội dung)
- ❌ In toàn bộ bảng TC ra chat rồi mới ghi file (vi phạm Write-first — user chờ render 2 lần)
- ❌ Dồn >40 TC vào 1 file mà không tách part, hoặc gộp nhiều module vào 1 file
- ❌ Tách part cắt ngang giữa một nhóm chức năng (phải cắt tại ranh giới nhóm)
- ❌ Có ≥2 part nhưng không sinh file index → không đối soát được coverage toàn module
- ❌ Dừng hỏi "có tiếp tục không" sau mỗi batch (đã chốt: chạy thẳng, chỉ báo tiến độ)
- ❌ Sinh >30 TC mà không tạo `task.md` / task list → user không theo dõi được tiến độ

---

## Output Format

### Mode QUICK

| Output | Mô tả |
|--------|--------|
| Mục Assumptions | Các giả định đã áp dụng khi requirement mơ hồ (ASM-XX) |
| Bảng TC Markdown | Test Cases đầy đủ (có cột REQ ID), sẵn sàng copy sang Excel/Jira |
| Bảng Đối Soát Coverage | Mỗi REQ ID × số TC × đủ Positive/Negative/Boundary (tiêu chí 6) |

### Mode FULL RBT

| Bước | Output |
|------|--------|
| 1 | Xác nhận bối cảnh |
| 2 | Luồng + Ambiguities + Câu hỏi Q&A |
| 3 | Module Decomposition + Dependencies |
| 4 | Traceability Matrix + High-Level Scenarios |
| 5 | Test Cases chi tiết (REQ ID + Risk Level + Test Data) |
| 6 | Bảng Markdown chuẩn (Jira/Excel ready) + Bảng Đối Soát Coverage |

### Mode CHECKLIST

| Output | Mô tả |
|--------|--------|
| Header checklist | Loại checklist + module + số mục + thời gian chạy ước tính |
| Bảng Checklist | Nhóm theo Module → Nhóm chức năng, có cột tick `☐`, Priority, REQ ID, TC ID liên quan |
| Ghi chú "Không áp dụng" | Component có trong bảng chuẩn nhưng module không có → nêu rõ, không bỏ im lặng |
| Bảng ký nhận | Môi trường · Build/Version · Người thực hiện · Ngày · Kết quả |

> File output khuyến nghị: `docs/checklists/checklist_<loại>_<module>.md`

Tất cả output phải bằng **Tiếng Việt**, format **Markdown**, và tuân thủ **Quy Tắc Xuất File & Theo Dõi Tiến Độ**: ghi thẳng vào file (`docs/testcases/` hoặc `docs/checklists/`), chat chỉ hiện tiến độ + Bảng Đối Soát Coverage + tóm tắt đường dẫn file.
