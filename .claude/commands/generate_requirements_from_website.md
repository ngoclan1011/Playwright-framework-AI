---
description: Generate Requirements content from a provided website module
skills:
  - skills-requirements-analyzer
---

# Workflow: Generate Requirements from Website Module

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`skills-requirements-analyzer`** (tại `.claude/skills/skills-requirements-analyzer/SKILL.md`) để biết định dạng chuẩn của tài liệu Requirements trước khi bắt đầu thực hiện tác vụ này.

Workflow này giúp bạn phân tích một module hoặc trang web được cung cấp và sinh ra tài liệu Yêu cầu (Requirements) chi tiết, chuẩn xác, **có mã REQ ID truy vết được**, phục vụ cho quá trình kiểm thử hoặc phát triển.

## Các bước thực hiện:

1. **Tiếp nhận thông tin (Information Gathering):**
   - Đọc kỹ hướng dẫn từ kỹ năng (skill) **`skills-requirements-analyzer`** để nắm bắt chuẩn đầu ra.
   - Lấy thông tin URL của trang web, tên module, hoặc mô tả/hình ảnh mà người dùng cung cấp.
   - Nếu cần thiết, hỏi người dùng về thông tin đăng nhập hoặc các trạng thái đặc biệt cần lưu ý.
   - Nếu hệ thống có nhiều role → hỏi user account của từng role để phân tích phân quyền.

2. **Khảo sát hệ thống (Recon & Investigation):**
   - Sử dụng các công cụ duyệt web (Browser tools/MCP) để truy cập vào module trang web được yêu cầu (`navigate → resize 1920x1080 → snapshot`).
   - Inspect kỹ lưỡng cấu trúc HTML, DOM, các form nhập liệu, các nút tương tác (buttons, links), và các thông báo lỗi (validation messages — ghi **nguyên văn**).
   - Trigger từng validation để thu thập error messages thực tế.
   - *Lưu ý: Không tự đoán các trường thông tin nếu không nhìn thấy trên giao diện thực tế.*

3. **Phân tích chức năng và tương tác (Analyze UI & Interactions):**
   - Phân tích luồng thao tác (User Flows).
   - Ghi nhận các trường dữ liệu tĩnh và động (Ví dụ: TextBox, Dropdown, Checkbox).
   - Ghi nhận các quy tắc nghiệp vụ hiển thị ở giao diện (Business Rules): trường bắt buộc, định dạng hợp lệ, giới hạn ký tự.
   - Ghi nhận phân quyền theo role (nếu có) và các trạng thái của entity (nếu có status flow).

4. **Biên soạn tài liệu Yêu cầu (Draft Requirements):**
   - Tuân thủ **Output Format (mục 5)** và **Quy Ước Đánh Mã (mục 2)** trong skill `skills-requirements-analyzer`:
     * **Tổng quan (Overview):** Mục đích của module/trang.
     * **Yêu cầu chức năng (Functional Requirements):** Mỗi tính năng/business rule/validation rule **gán mã `REQ-<MODULE>-<SỐ>`** — bảng có cột REQ ID.
     * **Quy tắc trường dữ liệu (Field Specifications):** Bảng chi tiết từng thành phần UI (Tên trường, Loại, Bắt buộc/Không, Ràng buộc, REQ liên quan).
     * **Business Rules & Validation Messages:** Error message ghi nguyên văn từ UI, gắn REQ ID.
     * **Ma trận Phân quyền** (nếu có nhiều role) và **Ma trận Trạng thái** (nếu có status flow) — không áp dụng thì ghi rõ "Không áp dụng".
     * **Điểm Mơ Hồ & Rủi Ro:** Bảng AMB-XX (kèm Assumption tạm) + RISK-XX theo framework trong skill.
     * **Luồng xử lý (Business/User Flows):** Các bước để hoàn thành một chức năng chính.
     * **Yêu cầu phi chức năng (Non-functional Requirements - Nếu có thể quan sát):** Tính tương thích, hiệu năng tĩnh.

5. **Trình bày và Cung cấp (Review & Delivery):**
   - Định dạng tài liệu bằng Markdown rõ ràng.
   - Trình bày toàn bộ nội dung bằng **Tiếng Việt** có dấu rõ ràng, chuyên nghiệp và dễ hiểu.
   - Lưu file `requirements_<module>.md`, sử dụng tính năng Artifact nếu tài liệu dài.
   - Nhắc user: tài liệu này (với REQ ID) là input chuẩn cho `/generate_testcases_manual_rbt`, `/generate_testcases_from_requirements` và `/generate_traceability_matrix`.
