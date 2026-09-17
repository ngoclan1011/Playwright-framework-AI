# Bản đồ phủ tài liệu — Shan Koe Mee

> Sản phẩm của `/discover-system` Bước 2 (mode DOC). Cho biết vùng nào **tin được từ spec**, vùng nào phải recon UI hoàn toàn, và spec **tự mâu thuẫn ở đâu**. Tầng module đọc file này để biết REQ nào cần `AMB` ngay từ đầu. Bản đồ module ở [`system_map.md`](system_map.md).

## 1. Danh mục tài liệu gốc

| File | Phiên bản · ngày | Loại | Kích thước | sha256 | Ghi chú |
|---|---|---|---|---|---|
| [`sources/ShanKoeMee_Gameplay_Spec_v2.docx`](sources/ShanKoeMee_Gameplay_Spec_v2.docx) | v2.1 (bổ sung Tie-break, đối chiếu 2 nguồn) · 13/08/2026 | Đặc tả gameplay bàn giao cho Dev | 348 KB · 12 mục · 6 bảng · 0 ảnh nhúng | `9ca84a44f892cd58448736d568fd30062b55fa17e00ce15733a8f40a86601910` | Tên file nói `v2`, nội dung ghi `2.1` |
| Wireframe Figma `Batta-New-Wireframe` node `494-2165` | — | Link ngoài (spec mục 10) | — | — | **Chưa mở** — chưa biết quyền truy cập |
| App Store `id1486305282` "Shan Koe Mee" | — | Game **tham chiếu** để thử luật | — | — | **Không phải hệ thống cần test** |

Tài liệu **chưa có**: tên + ngưỡng tài sản 3 phòng · mức cược preset từng phòng · UI cần bổ sung (spec 7.2 và 10 đều ghi *"em sẽ gửi lại sau"*) · đặc tả badge "SHAN 9" (spec 12).

## 2. Bản đồ phủ theo module

| Module | Prefix | Mục spec phủ | Mức phủ | Có gì | Thiếu gì → recon UI / hỏi Product |
|---|---|---|---|---|---|
| Chọn phòng | `ROOM` | 7 (b.1–2) · 10 (1 dòng) | 🟨 Một phần | 3 phòng Bình dân / Trung lưu / Thượng lưu; tự điều hướng theo tài sản | Ngưỡng tài sản mỗi phòng · tên chính thức · user có được tự đổi phòng không · UI màn chọn phòng |
| Bàn chơi & Banker luân phiên | `TABLE` | 1 · 2 · 7 (b.2, b.12) · 10 | 🟨 Một phần | Banker luân phiên trái → phải; điều kiện 50× min bet; ván đầu = người vào sớm nhất đủ điều kiện; so từng cặp độc lập | Số ghế (D-06) · điều gì xảy ra khi không ai đủ điều kiện (D-13) · người vào giữa ván · rời bàn khi đang là Banker · popup Hướng dẫn mở từ đâu |
| Cược & Thanh toán | `BET` | 6 · 7 (b.3, b.10–11) · 8 | 🟨 Một phần | Preset + Raise; auto-chọn theo tài sản; hoa hồng 5%; x2/x3/x5 có điều kiện rõ; hệ số chỉ khi thắng; Banker trả trái → phải; phá sản chia tỉ lệ | Mức cược cụ thể từng phòng (D-10) · Raise min/max/bước · thuật toán auto-chọn (D-09) · công thức chia khi phá sản + làm tròn (D-11) · hoa hồng 5% tính trên tiền cược hay tiền đã nhân hệ số · Banker thắng có bị trừ 5% không |
| Chia bài & rút lá thứ 3 | `DEAL` | 3 · 4 · 7 (b.4–7) | 🟨 Một phần (D-01 đã chốt, còn D-07/D-08) | 52 lá, không Joker; bảng giá trị; mod 10; Boke; Shan9/Shan8 tự dừng; timeout 5s → Dừng; chiều kim đồng hồ từ trái Banker; Banker sau cùng | ~~D-01~~ ✅ đã chốt · **D-07** timer Banker · **D-08** "rút hoặc mở bài" · hành vi khi mất kết nối giữa lượt |
| Xếp hạng bài & Tie-break | `RANK` | 5 · 5.1 · 11 | 🟩 Đầy đủ | Thứ tự 13 hạng; Shan9/Shan8 chỉ cho 2 lá ban đầu; Bộ ba xếp AAA > … > 222; tie-break 2 lá > 3 lá → lá cao nhất → chất ♠>♥>♦>♣; 3 ví dụ minh hoạ | **D-05** Shan9 vs Shan9, Shan8 vs Shan8 · có tồn tại kết quả Hoà không · "lá cao nhất" so theo giá trị điểm (K=0) hay theo hạng (K cao) — spec viết "giá trị/hạng" |
| Jackpot | `JPOT` | 9 · 10 (1 dòng) · 12 | 🟨 Một phần (**mâu thuẫn**) | Pool chung toàn game; trích 1%; baseline 100M; Reward = MIN(bet × 100, pool); điều kiện Bộ ba + thắng | **D-02** cơ sở tính 1% · **D-03** trong/ngoài phạm vi · **D-04** Banker · **D-12** reset · pool khởi tạo · nhiều người trúng cùng ván chia thế nào · UI popup |

**Không có vùng ⬜ Trắng** — spec chạm tới cả 6 module. **Không có vùng 🟩 sạch** ngoài `RANK`, và `RANK` vẫn có 1 lỗ hổng 🔴.

## 3. Mâu thuẫn & nghi vấn nội bộ tài liệu (`D-nn`)

> Mã `D-nn` là mã **tầng khám phá**. Khi sinh REQ cho module, mỗi dòng dưới đây chuyển thành một `AMB-XX` ở tài liệu module tương ứng (đánh số nối tiếp theo skill 2.1) và ghi `Nguồn: D-nn`. Không tự giải quyết im lặng.

| Mã | Module | Vị trí trong spec | Mâu thuẫn / lỗ hổng | Mức | Giả định tạm (chỉ để đọc tiếp, KHÔNG dùng làm REQ) |
|---|---|---|---|---|---|
| **D-01** | `DEAL` | Mục 4 bảng ↔ đoạn dưới bảng ↔ Ví dụ 2 | Bảng: điểm **0–7 người chơi TỰ CHỌN**. Đoạn văn ngay dưới: *"0–2 **bắt buộc rút**, 3–7 tự chọn"*. Ví dụ 2: 0 điểm → *"User rút thêm 1 lá"* (không nói bắt buộc hay tự chọn). Ba chỗ, hai luật | ✅ **Đã chốt** | **QA trả lời 17-09-2026:** điểm **0–7 tự chọn** Rút/Dừng · **Shan 8/9 tự động dừng**. Đoạn văn *"0–2 bắt buộc rút"* là sai, không dùng. Banker áp cùng luật (spec mục 4). Khi sinh REQ cho `DEAL`: ghi `Nguồn: spec v2.1 mục 4 bảng + QA chốt 17-09-2026`, **không** cần AMB; đề nghị Product sửa spec để đoạn văn khớp bảng |
| **D-02** | `JPOT` | Mục 9.2 | Câu chữ: *"1% trên số tiền **THẮNG CƯỢC (tiền nhận được)** của bên thắng"*. Công thức: *"1% × **Tổng tiền cược** của người thắng"*. Tiền nhận được (sau hoa hồng, có nhân hệ số?) ≠ tiền cược | 🔴 | Theo **công thức** (tiền cược gốc). Phải hỏi |
| **D-03** | `JPOT` | Mục 9 ↔ Mục 12 | Mục 9 đặc tả Jackpot đầy đủ (4 tiểu mục). Mục 12 *Ngoài phạm vi*: *"Cơ chế Jackpot / badge SHAN 9 (nếu có) sẽ được đặc tả riêng sau khi Product xác nhận"* | 🔴 | Jackpot **trong** phạm vi (mục 9 chi tiết hơn), mục 12 có thể chỉ nói về badge. Phải hỏi — quyết định cả module `JPOT` có test đợt này không |
| **D-04** | `JPOT` | Mục 9.3 ↔ 9.4 | Player: *"đạt Bộ ba **và giành chiến thắng**"*. Banker: *"được bài bộ ba sẽ nhận Jackpot"* — không nói phải thắng (Banker so với nhiều người, thắng ai?). Công thức dùng `User Bet` — Banker không đặt cược | 🔴 | Không có giả định hợp lý. Phải hỏi |
| **D-05** | `RANK` | Mục 5.1 ↔ Mục 6 | Tie-break chỉ áp cho bài *"không thuộc Shan9/Shan8/Bộ ba"* → **Shan9 vs Shan9**, **Shan8 vs Shan8** không có luật phân định. Bộ ba vs Bộ ba đã có (AAA > KKK). Mục 6 nhắc *"không áp dụng nếu thua hoặc **hoà**"* → có kết quả Hoà không, trong khi 5.1 nói tie-break *"thay vì xử lý Hoà ngay"* | 🔴 | Không có giả định. Phải hỏi |
| D-06 | `TABLE` | Mục 2 ↔ Mục 1 ↔ Mục 10 | *"số ghế cụ thể — xem mục 10"* → mục 10 không có số ghế, chỉ có link Figma. Mục 1: *"thường 2–8 người chơi/bàn"* | 🟠 | 2–8, xác minh trên UI |
| D-07 | `DEAL` | Mục 4 ↔ Mục 7 b.6 | Mục 4: *"có thời gian đếm ngược để chọn"* — không ghi số. Mục 7: **5s**. Không nói Banker có cùng 5s không | 🟠 | 5s cho cả Banker |
| D-08 | `DEAL` | Mục 2 ↔ Mục 4 đoạn cuối | Mục 2: Banker so bài *"lần lượt/đồng thời"*. Mục 4: *"Nhà cái có thể rút thêm lá thứ 3 **hoặc** mở bài của từng người chơi để so sánh"* — nghe như hai hành động loại trừ, mâu thuẫn với 7.7 (Banker đã biết bài mọi người) | 🟠 | Banker luôn thấy bài mọi người rồi mới quyết định (theo 7.7) |
| D-09 | `BET` | Mục 7 b.3 | *"Tự động chọn cho user mức cược phù hợp với tài sản của user"* — thuật toán không có (mức thấp nhất? theo tỉ lệ?) | 🟠 | Xác minh trên UI |
| D-10 | `BET` · `ROOM` | Mục 7 b.3 ↔ Mục 8 | Preset ví dụ *"1k, 5k, 10k"* ↔ hạn mức bàn ví dụ *"1K, 100K, 500K, 10M"* — hai bộ số khác nhau, đều ghi "ví dụ" | 🟡 | Đều là ví dụ, chờ Product gửi số thật |
| D-11 | `BET` | Mục 8 đoạn cuối | Banker phá sản → *"chia đều cho các user theo tỉ lệ dựa vào số tiền đặt cược"* — "chia đều" và "theo tỉ lệ" trái nghĩa; tỉ lệ theo cược gốc hay tiền thắng có hệ số; làm tròn; hoa hồng 5% vẫn trừ không | 🟠 | Theo tỉ lệ tiền cược gốc |
| D-12 | `JPOT` | Mục 9.2 | *"**có thể** reset về mức sàn (baseline)"* — bắt buộc hay tuỳ chọn; pool khởi tạo bằng bao nhiêu; pool < baseline có được không | 🟠 | Reset về 100M sau mỗi lần trúng |
| D-13 | `TABLE` | Mục 2 | Ván đầu: *"user vào bàn sớm nhất **và có đủ điều kiện**"* — không ai đủ 50× min bet thì bàn có mở ván không, hay chờ | 🟠 | Chờ, không mở ván |

**Tổng: 13 nghi vấn — 4 🔴 còn treo · 1 ✅ đã chốt (D-01) · 7 🟠 · 1 🟡.** 4 mục 🔴 **phải có câu trả lời của Product trước khi sinh REQ** cho `RANK` (D-05), `JPOT` (D-02, D-03, D-04). `DEAL` đã hết mục 🔴 chặn. Sinh REQ khi chưa có trả lời là chắc chắn phải sửa lại.

## 4. Đối chiếu tài liệu ↔ UI

Chưa có — mode DOC. Bảng này điền ở lượt `/discover-system DELTA` khi mở được UI: mỗi module một dòng *tài liệu nói gì · UI làm gì · kết luận*.
