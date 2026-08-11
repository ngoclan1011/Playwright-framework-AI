# 🔄 AI Full Flow — Manual Testing

> Quy trình đầy đủ dùng AI cho **Manual Testing**, từ hệ thống chưa có gì → tài liệu → test cases → chạy tay → bug report → ma trận truy vết.
>
> Áp dụng cho tình huống phổ biến nhất: **hệ thống chỉ có UI, không tài liệu, không bộ test cases**.

---

## Toàn cảnh 7 chặng

```
┌─ CHUẨN BỊ TÀI LIỆU ──────────────────────────────────────────────┐
│  0. /discover_system                     → bản đồ module + prefix│  1 lần / hệ thống
│  1. /generate_requirements_from_website  → REQ ID                │  N lần = số module
└──────────────────────────────────────────────────────────────────┘
                                  ↓
┌─ SINH & KIỂM TEST CASES ─────────────────────────────────────────┐
│  2. /generate_testcases_manual_rbt       → TC có cột REQ ID      │  N lần = số module
│  3. /review_testcases                    → chấm rubric, lấp gap  │
└──────────────────────────────────────────────────────────────────┘
                                  ↓
┌─ THỰC THI & XỬ LÝ LỖI ───────────────────────────────────────────┐
│  4. /execute_test_cases                  → chạy tay, chấm P/F/B/S│  Mỗi đợt kiểm thử
│  5. /analyze_test_report                 → gom nhóm root cause   │
│     /create_bug_report                   → bug report chuẩn      │
└──────────────────────────────────────────────────────────────────┘
                                  ↓
┌─ CHỨNG MINH ĐỘ PHỦ ──────────────────────────────────────────────┐
│  6. /generate_traceability_matrix        → RTM                   │  Trước release
└──────────────────────────────────────────────────────────────────┘
```

**Mắt xích giữ cả chuỗi là `REQ ID`.** Chặng 1 sinh ra → chặng 2 ghi vào cột `REQ ID` của mỗi TC → chặng 6 dùng để tính coverage. Đứt ở đâu thì từ đó trở đi không chứng minh được "đã test đủ".

---

## Chặng 0 — Khám phá hệ thống

> **Chạy 1 lần cho cả hệ thống.** Trả lời câu hỏi: *"hệ thống này có những module nào?"*

```
/discover_system
```

📋 Prompt mẫu: [`prompts/prompt_00_discover_system.txt`](prompts/prompt_00_discover_system.txt)

**Cần chuẩn bị:** URL · tài khoản (càng nhiều role càng tốt) · tài liệu sẵn có nếu QA đưa được · môi trường có dùng chung không.

**AI tự chọn mode** — bạn không cần khai:

| Đầu vào | Mode |
|---|---|
| URL, không tài liệu | **UI** |
| URL + tài liệu (kể cả chỉ một phần) | **HYBRID** |
| Chưa có account, chỉ có tài liệu | **DOC** |

AI công bố mode ở câu đầu tiên — sai thì chặn ngay lúc đó.

**⏸️ Checkpoint** — AI dừng, hỏi 3 câu. Câu quan trọng nhất: *"có module nào tôi không thấy được vì thiếu quyền / nằm sâu trong menu / chỉ vào được bằng URL?"* — trả lời ở đây rẻ hơn nhiều so với bổ sung sau.

**Đầu ra:**
```
docs/requirements/README.md                    ← danh mục, mọi module đang ⬜
docs/requirements/_discovery/system_map.md     ← bản đồ (tách modules/ nếu > 8 module)
docs/requirements/_discovery/doc_inventory.md  ← chỉ khi có tài liệu
```

> ⚠️ Chặng này **không sinh REQ ID**, chỉ cấp **prefix** (`CUST`, `PRJ`…). Cấp số REQ khi chưa mở form là chắc chắn phải đánh lại.

**Phát hiện sót module về sau:** nói thẳng *"còn thiếu module Báo cáo, vào bằng `/admin/reports`"* → AI chạy **mode ADD**, chỉ xử lý module đó. Muốn rà lại toàn bộ → *"rà lại xem có gì mới"* → **mode DELTA**.

---

## Chặng 1 — Sinh Requirements

> **Chạy lặp, mỗi lần một module**, theo thứ tự đã chốt ở chặng 0.

```
/generate_requirements_from_website
```

📋 Prompt mẫu: [`prompts/prompt_01_generate_requirements.txt`](prompts/prompt_01_generate_requirements.txt)

| Biến thể | Command | Prompt mẫu |
|---|---|---|
| Có ticket Jira thay vì UI | `/analyze_requirement_document` | [`prompt_20`](prompts/prompt_20_analyze_requirement_document.txt) |
| Tài liệu đã có, ticket sửa đổi | `/update_requirements_from_ticket` | [`prompt_21`](prompts/prompt_21_update_requirements_from_ticket.txt) |

**AI làm gì:** đọc bản đồ chặng 0 (khỏi dò đường) → mở từng form → **trigger từng validation lấy message nguyên văn** → đọc DOM bằng `browser_evaluate` → bắt network lấy validation server-side → chụp evidence full-page → sinh `REQ-<PREFIX>-NN`.

**Đầu ra:**
```
docs/requirements/<module>/requirements_<module>.md   ← tên file BẤT BIẾN
docs/requirements/<module>/evidence/*.png
```
Cộng thêm: `README.md` cập nhật `Trạng thái recon` ⬜ → ✅.

**Xong module này thì lặp lại cho module kế tiếp.** Cột `Trạng thái recon` xanh hết = khảo sát xong hệ thống.

### Kiểm trước khi sang chặng 2

- [ ] Mọi yêu cầu đều có `REQ ID`, cột `Nguồn` không để trống
- [ ] Error message ghi **nguyên văn** từ UI, không diễn đạt lại
- [ ] Evidence chụp **full-page**, có ảnh cho từng trạng thái động (dropdown mở, form lỗi, từng tab)
- [ ] Ma trận phân quyền có **dòng tổng** `Đã kiểm chứng / Suy diễn / Chưa rõ`
- [ ] Ambiguity 🔴 High đã gửi PO — hoặc đã ghi **Assumption tạm** để test tiếp được

---

## Chặng 2 — Sinh Test Cases

> **Chạy lặp, mỗi lần một module.** Chọn đúng 1 trong 3 mode.

| Mode | Command | Prompt mẫu | Khi nào dùng |
|---|---|---|---|
| **FULL RBT** | `/generate_testcases_manual_rbt` | [`prompt_02_generate_test_cases.txt`](prompts/prompt_02_generate_test_cases.txt) | Module lớn · requirements còn mơ hồ · cần đánh giá risk · **bộ TC gốc của module** |
| **QUICK** | `/generate_testcases_from_requirements` | [`prompt_22_generate_testcases_quick.txt`](prompts/prompt_22_generate_testcases_quick.txt) | Requirements đã rõ · scope 1 form / 1 tính năng · cần nhanh |
| **CHECKLIST** | `/generate_checklist_test` | [`prompt_15_generate_checklist.txt`](prompts/prompt_15_generate_checklist.txt) | Rà tay nhanh: smoke · sau hotfix · trước release |

**Đầu ra tương ứng:** FULL RBT / QUICK → TC chi tiết có steps. CHECKLIST → danh sách tick, **không** có steps.

**Ranh giới:** cần **bộ TC lưu trữ / import Jira / giao cho automation** → QUICK hoặc FULL RBT. Cần **tick tay cho nhanh** → CHECKLIST.

💡 **Khuyến nghị:** module đầu tiên của hệ thống làm bằng **FULL RBT** — nó ép trả lời những câu hỏi nghiệp vụ mà sau này kiểu gì cũng phải hỏi. Các module tương tự sau đó dùng QUICK cho nhanh.

**Quy tắc AI bắt buộc tuân thủ ở chặng này:**
- **Mở toàn bộ evidence trước khi viết TC** — không đọc ảnh mà viết là bịa
- **Ảnh thắng tài liệu** khi hai bên mâu thuẫn
- Evidence thiếu/cắt cụt → TC bị gắn `@NeedsVerify`, **không suy diễn**
- **Write-first** — ghi thẳng vào file, không in cả bảng TC ra chat

**Đầu ra:**
```
docs/testcases/<module>/test_cases_<module>.md   ← INDEX, tên file BẤT BIẾN
docs/testcases/<module>/parts/part_NN_<slug>.md  ← khi > 40 TC
docs/checklists/checklist_<loại>_<module>.md     ← nếu chạy mode CHECKLIST
```

---

## Chặng 3 — Review Test Cases

```
/review_testcases
```

📋 Prompt mẫu: [`prompts/prompt_12_review_testcases.txt`](prompts/prompt_12_review_testcases.txt)

| Mode | Làm gì |
|---|---|
| **REVIEW** (mặc định) | Chấm rubric 6 tiêu chí, chỉ ra TC mơ hồ / trùng lặp / thiếu negative-boundary / coverage gap |
| **FIX** | Như trên + sinh file TC phiên bản cải thiện (**giữ nguyên file gốc**) |

Nói *"sửa luôn"* / *"cải thiện giùm"* → AI tự chuyển sang **FIX**.

> Chặng này hay bị bỏ qua. Nhưng review 30 phút rẻ hơn nhiều so với chạy tay 50 TC rồi mới phát hiện một nửa viết sai.

---

## Chặng 4 — Thực thi Manual

```
/execute_test_cases
```

📋 Prompt mẫu: [`prompts/prompt_16_execute_test_cases.txt`](prompts/prompt_16_execute_test_cases.txt)

**AI làm gì:** mở browser thật qua Playwright MCP → chạy từng bước theo TC → đối chiếu Expected vs Actual → chấm **PASS / FAIL / BLOCKED / SKIPPED** → thu evidence.

**Đầu ra:**
```
docs/executions/<module>/run_<timestamp>/execution_report.md
docs/executions/<module>/run_<timestamp>/evidence/<TC_ID>_<mô_tả>.png
```

Report gồm 6 mục: Tổng kết · Kết quả từng TC · Chi tiết FAIL · TC BLOCKED · **Dữ liệu đã tạo & dọn dẹp** · Đề xuất bước tiếp theo.

### ⚠️ Hai luật quan trọng

**1. KHÔNG sửa TC trong lúc chạy.** TC FAIL vì viết sai thì ghi nhận lại, chạy xong mới quay về `/review_testcases` mode FIX. Sửa giữa chừng là mất dấu vết của lần chạy đó.

**2. Môi trường dùng chung → kiểm mục "Dữ liệu đã tạo & dọn dẹp" mỗi lần chạy.** Dữ liệu test phải traceable (`Auto_<Module>_<timestamp>`) và có kế hoạch xoá. Không dọn thì vài lần chạy là môi trường thành bãi rác, và người khác lãnh hậu quả.

---

## Chặng 5 — Xử lý FAIL

| Tình huống | Command | Prompt mẫu | Ghi chú |
|---|---|---|---|
| **Nhiều TC FAIL**, chưa rõ nguyên nhân | `/analyze_test_report` | [`prompt_11_analyze_test_report.txt`](prompts/prompt_11_analyze_test_report.txt) | **Chạy cái này trước** — 12 TC FAIL thường chỉ là 2 bug |
| Đã rõ bug, cần báo cáo | `/create_bug_report` | [`prompt_10_create_bug_report.txt`](prompts/prompt_10_create_bug_report.txt) | Tự lấy evidence từ run vừa rồi, tuỳ chọn đẩy Jira |
| FAIL vì **TC viết sai**, không phải lỗi hệ thống | `/review_testcases` mode FIX | [`prompt_12_review_testcases.txt`](prompts/prompt_12_review_testcases.txt) | Quay lại chặng 3 |

**Đầu ra:**
```
test_report_analysis.md                          ← gom nhóm theo root cause
bug_reports/BUG_<module>_<timestamp>.md          ← mỗi bug 1 file
```

> Gom nhóm trước rồi mới viết bug report — đỡ tạo 12 bug trùng nhau cho cùng một nguyên nhân.

---

## Chặng 6 — Ma trận truy vết (RTM)

```
/generate_traceability_matrix
```

📋 Prompt mẫu: [`prompts/prompt_13_generate_traceability_matrix.txt`](prompts/prompt_13_generate_traceability_matrix.txt)

**Ra 4 nhóm phát hiện:**

| Ký hiệu | Nghĩa |
|---|---|
| ⬛ | **Module chưa có tài liệu** — còn ⬜ trong danh mục, nằm **ngoài** phạm vi RTM |
| 🔴 | REQ chưa có TC nào cover |
| 🟡 | TC chưa được automate |
| ⚪ | Test mồ côi — không map về REQ nào |

> ⚠️ **Đọc mục ⬛ trước mọi con số phần trăm.** Coverage 95% mà còn 3 module chưa ai khảo sát thì con số đó vô nghĩa — nó chỉ tính trên phần đã có tài liệu.

---

## Vòng lặp khi Requirements thay đổi

Hệ thống đang phát triển thì ticket sẽ liên tục sửa yêu cầu. Đừng sinh lại từ đầu:

```
/update_requirements_from_ticket
        ↓  Impact Report — TC nào stale
   ┌────┴────────────────────────────────┐
   ↓                                     ↓
REQ mới → /generate_testcases_*     TC phải sửa → /review_testcases mode FIX
   └────────────────┬────────────────────┘
                    ↓
        /execute_test_cases  (chạy lại phần bị ảnh hưởng)
```

Cột **`TC cần xử lý`** trong Nhật ký thay đổi của tài liệu requirements là **mắt xích cảnh báo duy nhất** cho tester biết TC nào đã lỗi thời. Bỏ qua nó là chạy test trên bộ TC sai mà không biết.

---

## Bảng tra nhanh — chạy bao nhiêu lần

| Chặng | Command | Prompt mẫu | Số lần chạy |
|---|---|---|---|
| 0 | `/discover_system` | [`prompt_00`](prompts/prompt_00_discover_system.txt) | **1 lần** / hệ thống (+ ADD/DELTA khi cần) |
| 1 | `/generate_requirements_from_website` | [`prompt_01`](prompts/prompt_01_generate_requirements.txt) | **N lần** = số module |
| 2 | `/generate_testcases_manual_rbt` | [`prompt_02`](prompts/prompt_02_generate_test_cases.txt) | **N lần** = số module |
| 2' | `/generate_checklist_test` | [`prompt_15`](prompts/prompt_15_generate_checklist.txt) | Khi cần checklist tick tay |
| 3 | `/review_testcases` | [`prompt_12`](prompts/prompt_12_review_testcases.txt) | 1 lần / bộ TC |
| 4 | `/execute_test_cases` | [`prompt_16`](prompts/prompt_16_execute_test_cases.txt) | Mỗi đợt kiểm thử |
| 5 | `/analyze_test_report` | [`prompt_11`](prompts/prompt_11_analyze_test_report.txt) | Khi nhiều TC FAIL |
| 5 | `/create_bug_report` | [`prompt_10`](prompts/prompt_10_create_bug_report.txt) | Mỗi bug cần báo |
| 6 | `/generate_traceability_matrix` | [`prompt_13`](prompts/prompt_13_generate_traceability_matrix.txt) | Định kỳ / trước release |
| ↻ | `/update_requirements_from_ticket` | [`prompt_21`](prompts/prompt_21_update_requirements_from_ticket.txt) | Mỗi ticket sửa yêu cầu |

**Biến thể của chặng 1–2** (không nằm trên luồng chính): `/analyze_requirement_document` → [`prompt_20`](prompts/prompt_20_analyze_requirement_document.txt) · `/generate_testcases_from_requirements` → [`prompt_22`](prompts/prompt_22_generate_testcases_quick.txt).

---

## Ba lỗi hay gặp nhất

**1. Nhảy thẳng vào chặng 2, bỏ chặng 0–1.**
TC sinh ra không có `REQ ID` → chặng 6 không chạy được → không ai chứng minh được "đã test đủ". Sửa sau thì phải viết lại toàn bộ TC.

**2. Bỏ qua checkpoint, gõ "tiếp tục" cho nhanh.**
Checkpoint tồn tại vì đó là chỗ AI **không thể tự quyết đúng**: ranh giới module, phạm vi test, scenario còn thiếu. Bấm qua là đẩy sai lầm xuống tận chặng 4 mới lộ.

**3. Tin coverage % mà không đọc mục ⬛.**
Xem lại cảnh báo ở chặng 6.

---

## Tài liệu liên quan

| File | Nội dung |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Quy tắc bắt buộc · cấu trúc `docs/` · danh sách đầy đủ workflows |
| [`README.md`](README.md) | Tổng quan bộ kit · cài đặt |
| [`SETUP_CLAUDE.md`](SETUP_CLAUDE.md) | Cài Claude Code + Playwright MCP |
| [`prompts/README.md`](prompts/README.md) | 26 prompt mẫu copy-paste, chia 5 nhóm tra cứu |
| [`plans/manual/QUICK_START.md`](plans/manual/QUICK_START.md) | Luồng 6 bước AI-RBT bản copy-paste — dùng cho AI agent khác (Codex · Antigravity · Kiro · Cursor) không có slash command của bộ này |
