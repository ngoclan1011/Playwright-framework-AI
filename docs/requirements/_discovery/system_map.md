# Bản đồ hệ thống — Shan Koe Mee (BacaOcean)

> **INDEX tầng khám phá — tên file bất biến.** Bản đồ 1 file (6 module ≤ 8, không tách). Không chứa mã `REQ-XXX-NN` — tầng này chỉ cấp **prefix**. Danh mục + trạng thái recon ở [`../README.md`](../README.md).

## 1. Bối cảnh khảo sát

| Mục | Giá trị |
|---|---|
| Ngày | 17-09-2026 |
| Mode | **DOC** — chỉ có tài liệu, **chưa mở UI**. Toàn bộ bản đồ là *dự kiến từ spec*, chưa module nào được xác minh trên hệ thống chạy |
| Mặt hệ thống | **Web + Miniapp** (QA xác nhận). Chưa khảo sát mặt nào. Không có mặt API (QA không có quyền gọi API) |
| Nguồn | `sources/ShanKoeMee_Gameplay_Spec_v2.docx` · v2.1 · 13/08/2026 · sha256 `9ca84a44…1910` · 12 mục, 6 bảng, 0 ảnh nhúng · wireframe là link Figma ngoài (chưa mở) |
| Hệ thống chứa | Game **BacaOcean** trong cổng **Fish Hunter**. Spec chỉ thay **luật chơi** bên trong BacaOcean; tên, theme, hình ảnh, âm thanh, vị trí truy cập **không đổi** (spec mục 12) |
| Đường vào | Home → icon **ShanKoeMee** (QA cung cấp, chưa xác minh) |
| Tài khoản | 1 tài khoản test (ở `.env`), role chưa rõ. Chưa có tài khoản Banker/Player tách bạch → mọi test nhiều người chơi cần ≥ 2 tài khoản |
| Môi trường | 🔴 **Dùng chung** — khảo sát **chỉ đọc**, không đặt cược thật khi chưa được phép |
| Phạm vi crawl | Chưa crawl. Link App Store trong spec (`id1486305282`) là **game tham chiếu để thử luật**, không phải hệ thống cần test |
| Tầng network | Chưa quan sát. Sẽ dùng DevTools ở lượt DELTA để lộ endpoint (QA không gọi API trực tiếp được) |

## 2. Sơ đồ điều hướng dự kiến (từ spec — chưa xác minh)

```
Home (Fish Hunter / BacaOcean)
└── icon ShanKoeMee                              ❔ vị trí thật chưa xác minh
    ├── Màn chọn phòng                             [ROOM]   spec 7.1–7.2 · 10
    │   ├── Bình dân                               ❔ tên + ngưỡng tài sản "gửi lại sau"
    │   ├── Trung lưu
    │   └── Thượng lưu
    ├── Bàn chơi                                   [TABLE]  spec 2 · 7
    │   ├── Ghế người chơi (n ghế ❔) + tag Banker
    │   ├── Khu đặt cược: preset · Raise           [BET]    spec 7.3 · 8
    │   ├── Bài 2 lá → nút Rút thêm / Dừng + đếm ngược 5s   [DEAL] spec 4 · 7.4–7.7
    │   ├── Kết quả so bài · hệ số x2/x3/x5 · thanh toán     [RANK]→[BET] spec 5 · 6 · 7.8–7.11
    │   └── Popup Jackpot                          [JPOT]   spec 9 · 10
    └── Popup Hướng dẫn chơi                       [TABLE]  spec 10 — ❔ mở từ lobby hay trong bàn
```

## 3. Bảng module tổng

| # | Module (tên chuẩn) | Bí danh trong spec | Prefix | Nền tảng | Mục spec | Loại màn hình | CRUD | Status flow | Risk | Ước REQ |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Chọn phòng | "màn chọn phòng", "điều hướng user tự động chọn vào phòng" | `ROOM` | Web · Miniapp | 7 (b.1–2) · 10 | Lobby | Không | Không | 🟡 | 6–8 |
| 2 | Bàn chơi & Banker luân phiên | "bàn chơi", "ghế", "tag Banker", "biểu tượng Banker" | `TABLE` | Web · Miniapp | 1 · 2 · 7 (b.2, 12) · 10 | Bàn realtime nhiều người | Không | **Có** — vai Banker luân phiên | 🔴 | 10–14 |
| 3 | Cược & Thanh toán | "đặt cược", "Raise", "hệ số nhân x2/x3/x5", "trả thưởng", "hoa hồng 5%", "Banker phá sản" | `BET` | Web · Miniapp | 6 · 7 (b.3, 10–11) · 8 | Thao tác trong bàn + settlement | Không | **Có** — cược → chờ → thắng/thua | 🔴 | 14–18 |
| 4 | Chia bài & rút lá thứ 3 | "chia 2 lá", "Point", "Boke", "Rút thêm (Hit) / Dừng (Stand)", "đếm ngược" | `DEAL` | Web · Miniapp | 3 · 4 · 7 (b.4–7) | Thao tác trong bàn, có timer | Không | **Có** — 2 lá → chọn → 3 lá/dừng | 🔴 | 12–16 |
| 5 | Xếp hạng bài & Tie-break | "Hand Ranking", "Shan 9 / Shan 8 / Bộ ba / Triple", "Natural", "Tie-Break" | `RANK` | Web · Miniapp | 5 · 5.1 · 11 | Logic thuần — hiển thị qua kết quả so bài | Không | Không | 🔴 | 15–20 |
| 6 | Jackpot | "Jackpot Pool / Fund", "baseline", "Jackpot Multiplier", "popup Jackpot" | `JPOT` | Web · Miniapp | 9 · 10 · 12 | Popup + quỹ tích luỹ | Không | **Có** — tích luỹ → trúng → reset | 🔴 | 10–12 |

**Tổng: 6 module · 6 prefix · ước 67–88 REQ.** Không module nào có CRUD dạng quản trị — toàn bộ là gameplay realtime; "Ước REQ" chủ yếu là business rule, không phải field spec.

**Quyết định ranh giới đã chốt với QA (17-09-2026):**

| Quyết định | Lý do |
|---|---|
| Cách tính điểm (spec mục 3) → `DEAL` | Điểm là thuộc tính tay bài sau khi chia, quyết định được Hit/Stand hay không |
| Tie-break (spec 5.1) → `RANK` | Bước cuối của phép so hạng, không test độc lập được |
| Trình tự lượt (chiều kim đồng hồ từ trái Banker · Banker sau cùng) → `DEAL` | Chỉ xuất hiện ở pha rút bài. Không tách module `ROUND` |
| Thanh toán + hệ số nhân gộp vào `BET` | Spec tự gộp ở mục 8; hệ số chỉ có nghĩa khi thanh toán |
| Popup Hướng dẫn chơi → `TABLE` | 1 popup tĩnh, không đáng 1 prefix |
| **Luồng chơi 1 ván (spec mục 7) KHÔNG là module** | Luồng cắt ngang — mỗi bước đã thuộc 1 module; tạo `FLOW` là nhân đôi REQ. Xem mục 4 |

**Ngoài phạm vi (spec mục 12):** tên gọi · theme · hình ảnh · âm thanh · vị trí truy cập BacaOcean; không mở game bài mới; badge "SHAN 9" chờ Product.

## 4. Bản đồ entity & phụ thuộc

### 4.1. Entity nghiệp vụ

| Entity | Thuộc module | Thuộc tính chính (từ spec) | Vòng đời |
|---|---|---|---|
| Phòng (Room) | `ROOM` | Tên (3 mức) · ngưỡng tài sản ❔ · hạn mức cược (vd 1K/100K/500K/10M) | Tĩnh |
| Bàn (Table) | `TABLE` | Số ghế ❔ (spec 1: "thường 2–8") · Banker hiện tại · min bet | Mở → chờ đủ người → ván → ván… |
| Người chơi tại bàn (Seat) | `TABLE` | Tài sản · vị trí ghế · có tag Banker không | Vào bàn → chơi → rời |
| Ván (Round) | `DEAL` (trình tự) · `BET` (kết quả) | Banker của ván · thứ tự lượt · pha hiện tại | 12 bước ở 4.2 |
| Cược (Bet) | `BET` | Mức cược · người đặt · kết quả thắng/thua · hệ số nhân · hoa hồng 5% | Đặt → khoá → thanh toán |
| Tay bài (Hand) | `DEAL` → `RANK` | 2–3 lá · Point (mod 10) · loại (Shan9/Shan8/Bộ ba/Point) · hệ số x2/x3/x5 | Chia 2 lá → Hit/Stand → chốt → xếp hạng |
| Quỹ Jackpot (Pool) | `JPOT` | Số dư · baseline 100M · tỉ lệ trích 1% · multiplier 100 | Tích luỹ → trúng → reset |

### 4.2. Luồng 1 ván — chuỗi phụ thuộc giữa module (spec mục 7)

```
[ROOM]  b.1  Chọn game BacaOcean → tự điều hướng vào phòng theo tài sản
[TABLE] b.2  Xác định Banker của ván (ván đầu: người vào sớm nhất đủ ≥ 50× min bet)
[BET]   b.3  Người chơi (≠ Banker) đặt cược: preset / Raise / auto-chọn theo tài sản
[DEAL]  b.4  Chia 2 lá cho Banker + từng người đã cược
[DEAL]  b.5  Nhận diện Shan9/Shan8 → tự động dừng
[DEAL]  b.6  Lần lượt từng người (chiều kim đồng hồ, từ trái Banker) chọn Rút/Dừng · 5s · timeout = Dừng
[DEAL]  b.7  Banker hành động SAU CÙNG, đã biết bài mọi người
[RANK]  b.8  Xếp hạng cuối từng tay bài (+ tie-break 5.1)
[RANK]  b.9  So Banker với TỪNG người chơi — độc lập từng cặp
[BET]   b.10 Xác định hệ số x2/x3/x5 cho bên thắng
[BET]   b.11 Trả thưởng / trừ cược · hoa hồng 5% · Banker trả từ trái qua phải · phá sản chia tỉ lệ
[JPOT]  —    Trích 1% vào pool mỗi ván có người thắng · trả Jackpot nếu Bộ ba thắng (D-02, D-04)
[TABLE] b.12 Kiểm tài sản Banker < 50× min bet → chuyển tag Banker sang người kế tiếp đủ điều kiện
```

**Phụ thuộc cứng:** `DEAL` cần `TABLE` (ghế, Banker) + `BET` (chỉ chia cho người đã cược) · `RANK` cần `DEAL` (tay bài đã chốt, cờ "2 lá ban đầu" để nhận Shan9/Shan8) · `BET` (thanh toán) cần `RANK` · `JPOT` cần `RANK` + `BET` (bộ ba **và** thắng, số tiền cược) · `TABLE` (chuyển Banker) cần `BET` (tài sản sau thanh toán).

**Điểm giao nguy hiểm (ưu tiên cho `/generate-cross-module-test-plan`):**
- Cờ *"2 lá ban đầu, không qua rút"* sinh ở `DEAL`, tiêu thụ ở `RANK` (Shan9/Shan8) **và** `BET` (x2 chỉ cho bài 2 lá) — một cờ, ba nơi dùng
- Bộ ba kích hoạt đồng thời: hạng 3 (`RANK`) + x5 (`BET`) + Jackpot (`JPOT`) — nhưng chỉ khi **thắng**
- Banker phá sản giữa lúc trả tiền (`BET` b.11) rồi chuyển Banker (`TABLE` b.12) — thứ tự hai bước này quyết định ai nhận đủ tiền

## 5. Ma trận phân quyền sơ bộ

Spec **không đề cập** role hệ thống (admin / user). Chỉ có 2 **vai trò trong ván**, luân phiên giữa các người chơi:

| Hành động | Player | Banker | Ghi chú |
|---|---|---|---|
| Đặt cược | ✅ | ❌ | spec 8: "Người chơi (không phải Banker) chọn mức cược" |
| Rút thêm / Dừng | ✅ điểm 0–7 tự chọn · Shan 8/9 tự dừng (D-01 chốt) | ✅ cùng luật, hành động sau cùng | spec 4 · 7.7 |
| Xem bài người khác trước khi quyết định | ❌ | ✅ | spec 7.7 |
| Nhận Jackpot | ✅ khi Bộ ba **và** thắng | ⚠️ ❔ spec chỉ nói "được bài bộ ba" (D-04) | |
| Bị chuyển tag Banker | — | ✅ khi tài sản < 50× min bet | spec 2 |

⚠️ Toàn bộ bảng là **suy diễn từ spec**, chưa kiểm chứng trên UI. Không có ô nào đã xác minh.

## 6. Thứ tự khảo sát đã chốt

| Thứ tự | Module | Lý do | BLOCKED bởi |
|---|---|---|---|
| 1 | `ROOM` | Cửa vào; cần biết phòng nào để vào bàn | Ngưỡng tài sản 3 phòng chưa có (Product "gửi lại sau") |
| 2 | `TABLE` | Mọi module sau đều chạy trong bàn | Số ghế chưa có (D-06); cần ≥ 2 tài khoản để thấy luân phiên Banker |
| 3 | `BET` | Cược xảy ra trước chia bài; quyết định ai được chia | Mức cược từng phòng chưa có; môi trường dùng chung → không đặt cược thật khi chưa được phép |
| 4 | `DEAL` | Sinh tay bài cho `RANK` | Hết mục 🔴 — D-01 đã chốt (0–7 tự chọn, Shan 8/9 tự dừng). Còn D-07 · D-08 🟠 |
| 5 | `RANK` | Logic thuần, test được ngay bằng bảng tổ hợp khi có tay bài | **D-05** (Shan9 vs Shan9) |
| 6 | `JPOT` | Cuối cùng vì **D-03** có thể đưa ra ngoài phạm vi | D-02 · D-03 · D-04 |

**Lệnh kế tiếp theo thứ tự:** khi có build → `/discover-system DELTA` để xác minh bản đồ này trên UI thật (1 ảnh/module vào `evidence/`), rồi `/generate-requirements-from-website ROOM` → `TABLE` → … Chưa có build mà cần REQ sớm → `/analyze-requirement-document` cho từng module từ spec, đánh dấu mọi REQ `Nguồn: spec v2.1 mục N` và `Nền tảng: ❔ chưa kiểm`.

## 7. Vùng chưa xác minh

| Vùng | Vì sao chưa | Cần gì |
|---|---|---|
| Toàn bộ UI 6 module | Mode DOC, chưa mở hệ thống | Lượt `/discover-system DELTA` với URL ở `.env` |
| Miniapp | Chưa rõ app chứa (Zalo / Telegram / khác), cách vào, có khác web không | QA xác nhận app chứa + cách mở |
| Số ghế / bàn | Spec trỏ mục 10, mục 10 không có (D-06) | Product / wireframe Figma |
| Tên + ngưỡng tài sản 3 phòng · mức cược preset từng phòng | Spec "gửi lại sau" | Product |
| Role tài khoản test · có tài khoản thứ 2 không | Chỉ có 1 tài khoản | QA cấp thêm ≥ 1 tài khoản để test Banker vs Player |
| Tầng network / endpoint | Chưa quan sát | DevTools ở lượt DELTA |
| Wireframe Figma (`node-id=494-2165`) | Chưa mở — cần quyền truy cập | QA xác nhận link mở được |

## 8. Nhật ký khám phá

| Ngày | Mode · Mặt | Kết quả | Nguồn |
|---|---|---|---|
| 17-09-2026 | **DOC** · chưa mặt nào | Khởi tạo bản đồ từ `ShanKoeMee_Gameplay_Spec_v2.docx` (v2.1, sha256 `9ca84a44f892cd58448736d568fd30062b55fa17e00ce15733a8f40a86601910`). 6 module · 6 prefix · 13 nghi vấn `D-nn` (5 🔴 → D-01 chốt cùng ngày, còn 4 🔴). Chốt với QA: TC ID `SKM_`, nền tảng Web + Miniapp, môi trường dùng chung, QA không có quyền API/CSDL/log, gộp trình tự lượt vào `DEAL`. URL + tài khoản test đã nhận → `.env`; giữ mode DOC, chưa mở UI | Tài liệu QA cung cấp |
