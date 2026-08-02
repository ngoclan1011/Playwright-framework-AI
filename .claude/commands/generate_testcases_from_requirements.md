---
description: Sinh manual test cases nhanh từ requirements (QUICK mode — không qua quy trình 6 bước).
skills:
  - skills-rbt-manual-testing
---

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`skills-rbt-manual-testing`** (tại `.claude/skills/skills-rbt-manual-testing/SKILL.md`) trước khi bắt đầu thực hiện tác vụ này. Sử dụng **Mode QUICK** của skill.

# Command: Sinh Manual Test Cases Nhanh từ Requirements

Command này sử dụng **Mode QUICK** của skill `skills-rbt-manual-testing` để sinh test cases nhanh từ requirements đã sẵn có.

## ⚠️ Nguyên tắc

- **Mode:** QUICK (1 lượt duy nhất, không chờ user giữa chừng)
- Phù hợp cho module đơn giản, requirements đã rõ ràng
- Nếu phát hiện requirements quá phức tạp hoặc mơ hồ → **tự động chuyển sang FULL RBT** và thông báo user
- Tất cả output bằng **Tiếng Việt**

## Các bước thực hiện

1. **Đọc và hiểu requirements** được user cung cấp
   - Requirements đã có REQ ID → dùng nguyên mã; chưa có → agent tự gán `REQ-<MODULE>-<SỐ>`
2. **Ghi nhận Assumptions:** mọi điểm mơ hồ phải ghi rõ giả định đã dùng (`ASM-XX`) — không đoán ngầm
3. **Xác định các luồng chính:** Happy Path, Negative Path, Boundary Cases, Edge Cases
4. **Áp dụng kỹ thuật thiết kế test case theo Quy Tắc Bắt Buộc trong skill:**
   - Equivalence Partitioning (EP) + Boundary Value Analysis (BVA) — mọi field có ràng buộc
   - Decision Table — BẮT BUỘC khi ≥3 điều kiện kết hợp
   - State Transition — BẮT BUỘC khi có status flow
5. **Validation chuyên biệt từng trường (Field-Level Validation - 15 Field Types):**
   - Liệt kê tất cả input fields trên form/UI
   - Sinh validation TCs **riêng cho TỪNG trường** theo đặc tính riêng (Text, Email, Phone, Date, Number, Dropdown, Checkbox/Radio, File Upload, Password, Textarea, OTP/MFA, Date Range, Rich Text, Multi-Select, Range Slider)
   - Áp dụng **Bảng Field-Level Validation Checklist** trong skill `skills-rbt-manual-testing`
   - **KHÔNG** gộp validation nhiều trường vào 1 test case
6. **Bao phủ Component-Level Checklist** (trong skill): Data Table/List (sort/filter/search/pagination/empty state/bulk), CRUD Lifecycle, Permission/Role, Modal/Dialog, Notification, Status Flow
7. **Bao phủ Scenarios Chuyên Sâu & Non-Functional:**
   - Double Submit / Race Condition (click liên tiếp nút submit, concurrent edit).
   - Session & Network Resilience (session timeout mid-form, loss of network, slow 3G).
   - Localization & UTF-8 / Emoji (tiếng Việt có dấu, emoji, ký tự đa ngôn ngữ).
   - Keyboard Accessibility (Tab order, Enter/Space trigger, Focus state).
   - HTTP Status Codes (cho API TCs).
8. **Sinh test cases đầy đủ fields & Automation Metadata:**
   - `TC ID` (format: `[DỰ_ÁN]_[MODULE]_TC_[SỐ]`)
   - `REQ ID` (**bắt buộc** — mã requirement mà TC cover, VD `REQ-LOGIN-01`)
   - `Module`
   - `Risk Level` (High / Medium / Low)
   - `Test Scenario` / `Test Case Title`
   - `Pre-Condition`
   - `Test Steps` (**đánh số 1,2,3 — mỗi bước 1 hành động**, dùng `<br>` xuống dòng trong cell)
   - `Expected Result` (đánh số **khớp 1-1** với steps)
   - `Test Data` (**phải cụ thể**, không placeholder)
   - `Priority` (Critical / High / Medium / Low)
   - `Automatable` (Yes / No / Partial)
   - `Auto Type` (UI / API / Unit / N/A)
   - `Tags` (`@Smoke`, `@Regression`, `@CriticalPath`...)
9. **Chạy Self-Quality Gate (6 Tiêu chí):** Unique TC ID, 1-to-1 Step-Expected matching, Concrete Test Data, Field Validation Coverage, Automation Metadata Ready, **Requirement Coverage** (mọi REQ có ≥1 TC — kèm Bảng Đối Soát Coverage).
10. **Ghi file theo Quy Tắc Xuất File & Theo Dõi Tiến Độ** (xem skill) — KHÔNG in bảng TC ra chat

## Bảng Output

```markdown
| TC ID | REQ ID | Module | Risk Level | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority | Automatable | Auto Type | Tags |
```

## Quy tắc quan trọng

- Test Data phải cụ thể: `test_login_01@domain.com`, không phải "email hợp lệ"
- Phải bao gồm cả Positive, Negative, Boundary, và Edge cases
- Mỗi trường input phải có validation TCs riêng (không gộp nhiều trường vào 1 TC)
- TC ID theo format thống nhất do user quy ước hoặc mặc định `[DỰ_ÁN]_[MODULE]_TC_[SỐ]`
- **Mỗi TC phải trỏ về ≥1 REQ ID; mỗi REQ phải có ≥1 TC** — có REQ 0 TC thì phải sinh bổ sung trước khi xuất
- Test Steps đánh số rõ ràng từng bước — không viết đoạn văn liền

## Xuất File & Tiến Độ (theo Quy Tắc trong skill)

- **Write-first:** ghi TC thẳng vào `docs/testcases/test_cases_<module>.md` sau mỗi batch. **KHÔNG** in toàn bộ bảng TC ra chat
- Chat chỉ hiện: kế hoạch batch (đầu) → dòng tiến độ mỗi batch → Bảng Đối Soát Coverage + tóm tắt đường dẫn file (cuối)
- **Tách file khi >40 TC** → `_part1`, `_part2`... cắt tại ranh giới nhóm chức năng; có ≥2 part thì sinh thêm `test_cases_<module>_index.md`
- **Chạy thẳng hết mọi batch trong 1 lượt** — không dừng hỏi "có tiếp tục không"
- Dự kiến **>30 TC** → tạo `task.md` (hoặc dùng task list của Claude Code) và cập nhật sau mỗi batch

## Khi nào chuyển sang FULL RBT

Agent **tự động đề xuất chuyển mode** nếu phát hiện:
- Requirements mơ hồ, cần hỏi Q&A
- Scope lớn (>3 modules)
- Logic nghiệp vụ phức tạp, nhiều điều kiện chồng chéo
- User yêu cầu Traceability Matrix hoặc Risk Assessment