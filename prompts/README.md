# Prompt Templates — Dùng Nhanh với Claude Code

Thư mục này chứa các prompt mẫu dùng nhanh (copy → paste → gửi) đã được thiết kế tối ưu cho **Claude Code**. Các prompt này hỗ trợ gọi trực tiếp slash command hoặc thực thi đơn lẻ theo tiêu chuẩn chất lượng cao.

> **📌 Nguyên tắc thiết kế prompt:** Prompt chỉ chứa **INPUT của lần chạy** (slash command + context + data + lựa chọn per-run như Mode, format output). KHÔNG lặp lại CONSTRAINTS / OUTPUT FORMAT / quy trình — những phần đó đã được định nghĩa duy nhất trong `.claude/skills/` và `.claude/commands/`, agent tự nạp khi gọi command. Lặp lại sẽ gây drift khi nâng cấp skill.
>
> **📌 KHÔNG khai báo thứ agent tự đọc được từ repo.** Bỏ hẳn các dòng kiểu `Dự án`, `Stack`, `Framework`, `Language`, `Build tool`, `Design Pattern`, `Test Runner` — agent mở `package.json` / `pom.xml` / source code là biết. Điền tay chỉ tốn công và sai lệch khi dự án đổi.
>
> **Chỉ giữ thứ agent KHÔNG suy ra được:** URL · tài khoản test · môi trường (Dev/Staging/Prod, có dùng chung không) · Mode · phạm vi chạy · trọng tâm · dữ liệu dán trực tiếp.
>
> *Ngoại lệ duy nhất:* `03_create_framework_*` và `04_generate_script_*` vẫn ghi công nghệ, vì hai bộ này có nhánh **chưa có project — agent tự scaffold**. Lúc đó chưa có code để đọc, dòng công nghệ chính là lựa chọn cần chốt. Đã có project sẵn thì xoá dòng đó đi.

---

## Danh Sách Prompt Mẫu

| # | File | Command Tương Ứng | Skill Tích Hợp | Mô Tả & Cải Tiến Mới |
|---|------|-------------------|----------------|----------------------|
| 00 | `prompt_00_discover_system.txt` | `/discover_system` | `skills-requirements-analyzer` | **[Mới]** Chạy **đầu tiên** khi hệ thống không có tài liệu — crawl navigation, lập bản đồ module, gán prefix, khởi tạo danh mục. 3 modes UI/HYBRID/DOC |
| 01 | `prompt_01_generate_requirements.txt` | `/generate_requirements_from_website` | `skills-requirements-analyzer` | Phân tích website/sơ đồ để sinh tài liệu Yêu cầu |
| 02 | `prompt_02_generate_test_cases.txt` | `/generate_testcases_manual_rbt` | `skills-rbt-manual-testing` | **[Nâng cấp mới]** Sinh Manual TCs chuẩn RBT, Checklist 15 loại input fields, Race condition, Session, A11y, AI Self-Quality Gate & Automation Metadata |
| 03 | `prompt_03_create_framework_playwright.txt` | `/generate_automation_framework` | `skills-framework-architect` | Dựng khung dự án Automation Playwright TypeScript |
| 03 | `prompt_03_create_framework_selenium.txt` | `/generate_automation_framework` | `skills-framework-architect` | Dựng khung dự án Automation Selenium Java |
| 03 | `prompt_03_create_framework_appium.txt` | `/generate_automation_framework` | `skills-framework-architect` | Dựng khung dự án Automation Appium Java (Mobile) |
| 04 | `prompt_04_generate_script_playwright.txt` | `/generate_automation_from_testcases` | `skills-qa-automation-engineer` | Viết kịch bản tự động Playwright TypeScript theo POM |
| 04 | `prompt_04_generate_script_selenium.txt` | `/generate_automation_from_testcases` | `skills-qa-automation-engineer` | Viết kịch bản tự động Selenium Java theo POM |
| 05 | `prompt_05_convert_manual_to_automation.txt` | `/generate_automation_from_testcases` | `skills-qa-automation-engineer` | Chuyển đổi Manual Test Cases sang Automation Script |
| 06 | `prompt_06_review_automation_code.txt` | `/review_automation_code` | `skills-automation-code-reviewer` | **[Mới]** Review chất lượng automation code theo Definition of Done — rubric 6 nhóm, bắt hard sleep / locator inline / thiếu Allure metadata / assertion yếu (pass giả). 2 modes REVIEW/FIX |
| 07 | `prompt_07_generate_test_data.txt` | `/generate_test_data` | `skills-test-data-generator` | Sinh dữ liệu kiểm thử có cấu trúc |
| 08 | `prompt_08_analyze_flaky_tests.txt` | `/analyze_flaky_tests` | `skills-flaky-test-analyzer` | Phân tích và khắc phục Flaky Tests |
| 09 | `prompt_09_generate_api_tests.txt` | `/generate_api_tests_from_swagger` | `skills-qa-automation-engineer` | **[Nâng cấp mới]** Sinh API tests từ Swagger/OpenAPI cover 12 HTTP Status Codes, OWASP API Security (BOLA/IDOR, Mass Assignment, ReDoS), SLA < 2s & Dynamic Auth Token |
| 10 | `prompt_10_create_bug_report.txt` | `/create_bug_report` | `skills-bug-reporter` | Sinh bug report chuẩn từ test FAIL — evidence, severity/priority, tùy chọn đẩy Jira |
| 11 | `prompt_11_analyze_test_report.txt` | `/analyze_test_report` | `skills-test-report-analyzer` | Phân tích test report — gom nhóm failure theo root cause, so sánh trend, đề xuất thứ tự xử lý |
| 12 | `prompt_12_review_testcases.txt` | `/review_testcases` | `skills-testcase-reviewer` | Review chất lượng manual TCs theo rubric 6 tiêu chí — 2 modes REVIEW/FIX |
| 13 | `prompt_13_generate_traceability_matrix.txt` | `/generate_traceability_matrix` | `skills-coverage-traceability` | Sinh ma trận truy vết RTM 3 tầng — tìm requirement chưa cover, orphan tests |
| 14 | `prompt_14_generate_api_mocks.txt` | `/generate_api_mocks` | `skills-api-mocking` | Sinh API mocks (Playwright route / WireMock) + tests cho edge cases |
| 15 | `prompt_15_generate_checklist.txt` | `/generate_checklist_test` | `skills-rbt-manual-testing` | Sinh checklist tick tay (CHECKLIST mode) — 4 loại Smoke/Post-hotfix/Regression/Release-readiness, nguồn TC-based hoặc REQ-based |
| 16 | `prompt_16_execute_test_cases.txt` | `/execute_test_cases` | `skills-manual-test-executor` | Thực thi manual TC qua Playwright MCP — chấm PASS/FAIL/BLOCKED/SKIPPED, thu evidence, xuất execution report |
| 17 | `prompt_17_run_and_fix_tests.txt` | `/run_and_fix_tests` | `skills-test-report-analyzer` | **[Mới]** Chạy suite có sẵn → phân loại failure theo root cause → tự sửa nhóm sửa được → chạy lại. 2 modes RUN/FIX. Bug app giữ nguyên đỏ, không sửa test để né |
| 18 | `prompt_18_heal_locators.txt` | `/heal_locators` | `skills-locator-healer-agent` | **[Mới]** Rà locator trong Page Object đối chiếu DOM thực tế sau khi UI đổi — bắt cả locator gãy, mong manh và sai element. 2 modes SCAN/HEAL |
| 19 | `prompt_19_update_automation_from_impact.txt` | `/update_automation_from_impact` | `skills-coverage-traceability` | **[Mới]** Delta mode cho automation — từ Impact Report map TC đã đổi sang script, sửa đúng phần đổi, không sinh lại cả module. 2 modes PLAN/APPLY |

## Cách Sử Dụng Trong Claude Code

1. Chọn prompt phù hợp với nhu cầu.
2. Mở file `.txt` và thay thế các thông tin trong ngoặc vuông `[...]` bằng dữ liệu thực tế dự án của bạn.
3. Copy toàn bộ nội dung file → Paste vào ô chat của **Claude Code**.
4. Agent sẽ tự động nạp skill, nhận diện command và thực thi quy trình theo đúng chuẩn tiêu chuẩn cao.
