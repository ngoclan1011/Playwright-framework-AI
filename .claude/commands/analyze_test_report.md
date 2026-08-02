---
description: Phân tích test report (Playwright/Allure/JUnit/TestNG) — tổng hợp PASS/FAIL, gom nhóm failure theo root cause, so sánh trend, đề xuất thứ tự xử lý.
skills:
  - skills-test-report-analyzer
  - skills-bug-reporter
  - skills-flaky-test-analyzer
  - skills-locator-healer-agent
---

# Workflow: Phân Tích Test Report

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`skills-test-report-analyzer`** (tại `.claude/skills/skills-test-report-analyzer/SKILL.md`) trước khi bắt đầu.

## ⚠️ Nguyên tắc thực thi

- **Tất cả output bằng Tiếng Việt**
- **KHÔNG đoán category failure** — phải đọc error message/stack trace thực tế của từng test fail
- Số liệu trong báo cáo phải khớp chính xác với report gốc
- Chỉ phân tích và báo cáo — KHÔNG tự sửa test/code trong workflow này (đề xuất command tiếp theo cho từng nhóm)

## Input cần thu thập

| Input | Cách lấy |
|---|---|
| **Test report** | User cung cấp path, HOẶC agent tự tìm: `playwright-report/`, `allure-results/`, `target/surefire-reports/`, `test-output/` |
| **Report lần chạy trước** (tùy chọn) | Để so sánh trend — hỏi user nếu cần |

> Nếu không tìm thấy report → hỏi user path hoặc đề nghị chạy suite để sinh report mới.

## Các bước thực hiện

### Bước 1: Parse Report
1. Xác định format (Playwright JSON / Allure / JUnit XML / TestNG XML)
2. Trích xuất từng test: tên, status, duration, error message, retry count
3. Tách FLAKY (pass sau retry) riêng khỏi FAIL thật

### Bước 2: Phân Loại Failure
1. Đọc error message + stack trace của TỪNG test fail
2. Gán category theo bảng trong skill: 🐛 App Bug / 🎯 Locator / ⏱️ Flaky / 📊 Data / 🌐 Environment / 🧪 Script
3. Gom nhóm failure có chung root cause (cùng page object, cùng API, cùng thời điểm)

### Bước 3: So Sánh Trend (nếu có report cũ)
- New failures / Recurring (≥3 lần) / Fixed

### Bước 4: Báo Cáo
1. Xuất `test_report_analysis.md` theo template trong skill
2. Đề xuất thứ tự xử lý: Environment → App Bugs (kèm gợi ý `/create_bug_report`) → Locator (`/generate_locator` hoặc locator healer) → Flaky (`/analyze_flaky_tests`)

## Output

- File `test_report_analysis.md`:
  - Bảng tổng quan (PASS/FAIL/SKIP/FLAKY, pass rate, duration)
  - Bảng phân loại failure theo category + danh sách test
  - Pattern phát hiện được
  - So sánh trend (nếu có)
  - Thứ tự xử lý đề xuất kèm command cụ thể
