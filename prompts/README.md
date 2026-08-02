# Prompt Templates — Dùng Nhanh với Claude Code

Thư mục này chứa các prompt mẫu dùng nhanh (copy → paste → gửi) đã được thiết kế tối ưu cho **Claude Code**. Các prompt này hỗ trợ gọi trực tiếp slash command hoặc thực thi đơn lẻ theo tiêu chuẩn chất lượng cao.

> **📌 Nguyên tắc thiết kế prompt:** Prompt chỉ chứa **INPUT của lần chạy** (slash command + context + data + lựa chọn per-run như Mode, format output). KHÔNG lặp lại CONSTRAINTS / OUTPUT FORMAT / quy trình — những phần đó đã được định nghĩa duy nhất trong `.claude/skills/` và `.claude/commands/`, agent tự nạp khi gọi command. Lặp lại sẽ gây drift khi nâng cấp skill.

---

## Danh Sách Prompt Mẫu

| # | File | Command Tương Ứng | Skill Tích Hợp | Mô Tả & Cải Tiến Mới |
|---|------|-------------------|----------------|----------------------|
| 01 | `prompt_01_generate_requirements.txt` | `/generate_requirements_from_website` | `skills-requirements-analyzer` | Phân tích website/sơ đồ để sinh tài liệu Yêu cầu |
| 02 | `prompt_02_generate_test_cases.txt` | `/generate_testcases_manual_rbt` | `skills-rbt-manual-testing` | **[Nâng cấp mới]** Sinh Manual TCs chuẩn RBT, Checklist 15 loại input fields, Race condition, Session, A11y, AI Self-Quality Gate & Automation Metadata |
| 03 | `prompt_03_create_framework_playwright.txt` | `/generate_automation_framework` | `skills-qa-automation-engineer` | Dựng khung dự án Automation Playwright TypeScript |
| 03 | `prompt_03_create_framework_selenium.txt` | `/generate_automation_framework` | `skills-qa-automation-engineer` | Dựng khung dự án Automation Selenium Java |
| 04 | `prompt_04_generate_script_playwright.txt` | `/generate_automation_from_testcases` | `skills-qa-automation-engineer` | Viết kịch bản tự động Playwright TypeScript theo POM |
| 04 | `prompt_04_generate_script_selenium.txt` | `/generate_automation_from_testcases` | `skills-qa-automation-engineer` | Viết kịch bản tự động Selenium Java theo POM |
| 05 | `prompt_05_convert_manual_to_automation.txt` | `/generate_automation_from_testcases` | `skills-qa-automation-engineer` | Chuyển đổi Manual Test Cases sang Automation Script |
| 07 | `prompt_07_generate_test_data.txt` | `/generate_test_data` | `skills-test-data-generator` | Sinh dữ liệu kiểm thử có cấu trúc |
| 08 | `prompt_08_analyze_flaky_tests.txt` | `/analyze_flaky_tests` | `skills-flaky-test-analyzer` | Phân tích và khắc phục Flaky Tests |
| 09 | `prompt_09_generate_api_tests.txt` | `/generate_api_tests_from_swagger` | `skills-qa-automation-engineer` | **[Nâng cấp mới]** Sinh API tests từ Swagger/OpenAPI cover 12 HTTP Status Codes, OWASP API Security (BOLA/IDOR, Mass Assignment, ReDoS), SLA < 2s & Dynamic Auth Token |
| 10 | `prompt_10_create_bug_report.txt` | `/create_bug_report` | `skills-bug-reporter` | Sinh bug report chuẩn từ test FAIL — evidence, severity/priority, tùy chọn đẩy Jira |
| 11 | `prompt_11_analyze_test_report.txt` | `/analyze_test_report` | `skills-test-report-analyzer` | Phân tích test report — gom nhóm failure theo root cause, so sánh trend, đề xuất thứ tự xử lý |
| 12 | `prompt_12_review_testcases.txt` | `/review_testcases` | `skills-testcase-reviewer` | Review chất lượng manual TCs theo rubric 6 tiêu chí — 2 modes REVIEW/FIX |
| 13 | `prompt_13_generate_traceability_matrix.txt` | `/generate_traceability_matrix` | `skills-coverage-traceability` | Sinh ma trận truy vết RTM 3 tầng — tìm requirement chưa cover, orphan tests |
| 14 | `prompt_14_generate_api_mocks.txt` | `/generate_api_mocks` | `skills-api-mocking` | Sinh API mocks (Playwright route / WireMock) + tests cho edge cases |
| 15 | `prompt_15_generate_checklist.txt` | `/generate_checklist_test` | `skills-rbt-manual-testing` | Sinh checklist tick tay (CHECKLIST mode) — 4 loại Smoke/Post-hotfix/Regression/Release-readiness, nguồn TC-based hoặc REQ-based |

*Lưu ý: Prompt 06 (Review Automation Code) thực thi trực tiếp bằng skill `skills-qa-automation-engineer`.*

## Cách Sử Dụng Trong Claude Code

1. Chọn prompt phù hợp với nhu cầu.
2. Mở file `.txt` và thay thế các thông tin trong ngoặc vuông `[...]` bằng dữ liệu thực tế dự án của bạn.
3. Copy toàn bộ nội dung file → Paste vào ô chat của **Claude Code**.
4. Agent sẽ tự động nạp skill, nhận diện command và thực thi quy trình theo đúng chuẩn tiêu chuẩn cao.
