---
name: skills-test-report-analyzer
description: Skill phân tích test report (Playwright/Allure/JUnit/TestNG) sau mỗi lần chạy — tổng hợp PASS/FAIL, gom nhóm failure theo root cause, so sánh trend giữa các lần chạy, và đề xuất thứ tự xử lý.
---

# Test Report Analyzer

Purpose: Đọc và phân tích test report sau khi chạy suite, biến dữ liệu thô thành insight hành động được.

---

## When to Use

Sử dụng skill này khi:

- Vừa chạy xong regression/smoke suite và cần tổng hợp kết quả
- User đưa file report (HTML/JSON/XML) và hỏi "kết quả thế nào", "tại sao fail"
- Cần so sánh kết quả giữa các lần chạy (trend analysis)
- CI/CD pipeline đỏ và cần biết nên fix cái gì trước

---

## Supported Report Formats

> **Ưu tiên tìm trong `reports/`** — theo `.claude/rules/reporting_rules.md` mục 6, framework sinh từ repo này gom toàn bộ output vào `reports/`. Các vị trí mặc định của tool chỉ dùng cho project cũ chưa chuẩn hoá.

| Framework | Format | Vị trí chuẩn (`reports/`) | Vị trí mặc định của tool |
|---|---|---|---|
| Playwright | JSON (`--reporter=json`), HTML | `reports/html/`, `reports/test-artifacts/` | `playwright-report/`, `test-results/` |
| Allure | JSON results | `reports/allure-results/`, `reports/allure-report/` | `allure-results/`, `allure-report/` |
| JUnit / Surefire | XML | `reports/surefire/` | `target/surefire-reports/` |
| TestNG | XML (`testng-results.xml`) | `reports/surefire/` | `test-output/` |
| Pytest | JUnit XML (`--junitxml`), HTML | `reports/html/` | do user cấu hình |

---

## Responsibilities

1. **Parse report** — đọc đúng format, trích xuất: tên test, status, duration, error message, retry count
2. **Tổng hợp số liệu** — PASS / FAIL / SKIP / FLAKY (pass sau retry), tổng thời gian chạy
3. **Gom nhóm failure** theo root cause category (bảng bên dưới) — KHÔNG liệt kê từng test rời rạc
4. **Phát hiện pattern** — nhiều test fail cùng 1 nguyên nhân (VD: cùng 1 page object, cùng 1 API down)
5. **So sánh trend** — nếu có report cũ: test nào mới fail, test nào fail liên tục, test nào vừa được fix
6. **Đề xuất hành động** — thứ tự xử lý theo mức ảnh hưởng

---

## Failure Categories

| Category | Dấu hiệu | Hành động đề xuất |
|---|---|---|
| 🐛 **Application Bug** | Assertion fail với data đúng, hành vi app sai spec | Báo bug → dùng skill `skills-bug-reporter` |
| 🎯 **Locator hỏng** | `ElementNotFound`, `strict mode violation` | Dùng skill `skills-locator-healer-agent` |
| ⏱️ **Flaky / Timing** | Pass sau retry, timeout ngẫu nhiên | Dùng skill `skills-flaky-test-analyzer` |
| 📊 **Test data** | `Duplicate`, `Not found`, conflict parallel | Sửa data generation |
| 🌐 **Environment** | `ECONNREFUSED`, `502/503`, toàn bộ suite fail | Kiểm tra env trước, KHÔNG sửa test |
| 🧪 **Test script lỗi** | Syntax error, import fail, assertion viết sai | Sửa test code |

> **Nguyên tắc phân loại:** Đọc error message + stack trace thực tế. KHÔNG đoán category khi chưa xem log.

---

## Analysis Workflow

1. **Locate** — Tìm file report trong project (theo bảng vị trí mặc định) hoặc nhận từ user
2. **Parse** — Trích xuất dữ liệu từng test case
3. **Summarize** — Bảng tổng quan: tổng số test, PASS/FAIL/SKIP/FLAKY, pass rate, duration
4. **Classify** — Gán category cho từng failure dựa trên error message thực tế
5. **Detect patterns** — Gom failure có chung nguyên nhân gốc (cùng page, cùng API, cùng thời điểm)
6. **Compare** (nếu có lịch sử) — Diff với lần chạy trước: new failures / recurring / fixed
7. **Report** — Xuất báo cáo theo template bên dưới

---

## Report Template

```markdown
# Báo Cáo Phân Tích Test Run

## Tổng quan
| Chỉ số | Giá trị |
|---|---|
| Tổng số test | N |
| ✅ PASS | x (x%) |
| ❌ FAIL | y |
| ⏭️ SKIP | z |
| 🔁 FLAKY (pass sau retry) | w |
| Thời gian chạy | mm:ss |

## Phân loại Failure
| Category | Số test | Danh sách test | Đề xuất |
|---|---|---|---|
| 🐛 Application Bug | 2 | TC_x, TC_y | Báo bug (P1) |
| 🎯 Locator hỏng | 3 | ... | Chạy locator healer |

## Pattern phát hiện được
- <VD: 5 test cùng fail ở LoginPage.login() → nghi locator nút Login đổi>

## So sánh với lần chạy trước (nếu có)
- 🆕 Mới fail: ...
- 🔄 Fail liên tục (≥3 lần): ...
- ✅ Đã fix: ...

## Thứ tự xử lý đề xuất
1. <Environment issues trước — chặn toàn suite>
2. <Application bugs — cần báo dev sớm>
3. <Locator/script fixes — QA tự xử lý>
```

---

## Quality Checklist

- [ ] Mọi failure đều được gán category dựa trên log thực tế
- [ ] Failure có chung root cause được gom nhóm, không đếm trùng
- [ ] Flaky (pass sau retry) tách riêng khỏi FAIL thật
- [ ] Đề xuất hành động cụ thể cho từng nhóm, có skill/command liên quan
- [ ] Báo cáo bằng Tiếng Việt, số liệu chính xác khớp report gốc

---

## Rules References

- `.claude/skills/skills-bug-reporter/SKILL.md` — Báo bug từ failure là application bug
- `.claude/skills/skills-flaky-test-analyzer/SKILL.md` — Xử lý nhóm flaky
- `.claude/skills/skills-locator-healer-agent/SKILL.md` — Xử lý nhóm locator hỏng
