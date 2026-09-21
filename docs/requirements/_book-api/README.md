# Danh mục Requirements — AnhTester Book Management API

> **Điểm vào của hệ thống Book API.** Mọi workflow đụng tới `docs/**/_book-api/` đọc file này **trước tiên**: module nào đã có tài liệu · **prefix nào đã bị chiếm** · mã REQ kế tiếp · ambiguity 🔴 còn treo.
>
> Bản đồ API chi tiết: [`_discovery/api_map.md`](_discovery/api_map.md) · Bản đồ app mobile: [`_discovery/system_map.md`](_discovery/system_map.md)

> ⚠️ **Đây là hệ thống RIÊNG, không liên quan Perfex CRM.** Repo này chứa 2 hệ thống độc lập. Danh mục CRM nằm ở [`../README.md`](../README.md) và **không dùng chung dải prefix, mã REQ hay TC ID** với hệ thống này.

| Mục | Giá trị |
|---|---|
| Hệ thống | AnhTester Book Management API |
| Mã hệ thống | `BK` |
| Loại | REST API (OpenAPI 3.0.0) **+ app Android** (Hybrid Capacitor, `book.anhtester.com` 1.0 — thêm 19-09-2026). Web: ngoài phạm vi. iOS: chưa khảo sát |
| Mặt | **API** — [`_discovery/api_map.md`](_discovery/api_map.md) · **Android** — [`_discovery/system_map.md`](_discovery/system_map.md). Chung prefix, chung dải REQ (skill 2.2) |
| Tiền tố REQ | `REQ-BK-<MODULE>-<nn>` |
| Tiền tố TC ID | `BK_<MODULE>_TC_<3 số>` |
| Base URL | `https://book.anhtester.com` — **Production, 1 server duy nhất** |
| Môi trường dùng chung | **KHÔNG** — user chốt 14-08-2026: được thao tác phá huỷ thoải mái (vẫn chỉ ghi/xoá bản ghi do chính phiên tạo — skill 3.4.4) |
| Năng lực kiểm thử của QA | Dùng cho nhánh Vòng 3 của **mọi** bộ TC hệ thống `BK`:<br>• **Gọi API: ✅** (user xác nhận 19-09-2026)<br>• **Truy vấn CSDL: ❌** (user chốt 20-09-2026 — *"Không cho QA đụng Database"*). Dữ liệu lưu kiểm gián tiếp qua API đọc (`GET /api/me` …); phần chỉ CSDL mới thấy (xoá mềm/cứng, rác sau huỷ) → đội Dev xác minh<br>• Kiểm tầng tích hợp · Xem nhật ký hoạt động: chưa hỏi |
| URL · tài khoản | `.env` (không commit) — **KHÔNG** ghi credentials vào `docs/` |
| Khởi tạo | 14-08-2026 — parse spec + kiểm chứng 20 request thật |

---

## 1. Bảng danh mục module (9 module)

| Module | Mã | Nền tảng | Số endpoint | Trạng thái | Tài liệu | REQ đã dùng | Mã kế tiếp | AMB treo | Story | Cập nhật |
|---|---|---|---|---|---|---|---|---|---|---|
| Xác thực & Phiên đăng nhập | `AUTH` | API ✅ · Android 🟨 (Sign in · Sign up · Logout ✅ — Profile · Settings ⬜) | 6 | 🟨 Đang khảo sát — Android còn Profile · Settings | [auth/REQUIREMENTS_AUTH_SUMMARY.md](auth/REQUIREMENTS_AUTH_SUMMARY.md) | `REQ-BK-AUTH-01` → `86` (86) | `REQ-BK-AUTH-87` · `AMB-BK-AUTH-21` · `RISK-BK-AUTH-09` | AMB-BK-AUTH-01 → 20 (🔴 01 · 02 · 04 **đã chốt 20-09-2026** — lỗi) · AMB-BK-01 · AMB-BK-11 | 5 | 19-09-2026 |
| Người dùng | `USER` | API 🟨 · Android ⬜ | 5 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-USER-01` | AMB-BK-01, 02, 12 | — | 19-09-2026 |
| Sách | `BOOK` | API 🟨 · Android ⬜ | 5 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-BOOK-01` | AMB-BK-03 | — | 19-09-2026 |
| Danh mục sách | `CAT` | API 🟨 · Android ⬜ | 4 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-CAT-01` | AMB-BK-05 | — | 19-09-2026 |
| Khuyến mãi | `PROMO` | API 🟨 · Android ⬜ | 5 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-PROMO-01` | AMB-BK-04, 09 | — | 19-09-2026 |
| Tệp tin | `FILE` | API 🟨 · Android ⬜ | 7 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-FILE-01` | AMB-BK-07 | — | 19-09-2026 |
| Địa chỉ hành chính | `ADDR` | API 🟨 · Android ⬜ | 2 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-ADDR-01` | — | — | 19-09-2026 |
| Tiện ích hệ thống | `SYS` | API 🟨 | 1 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-SYS-01` | — | — | 14-08-2026 |
| Tổng quan | `DASH` | Android ⬜ | 0 | 🟨 Đã lập bản đồ | — | — | `REQ-BK-DASH-01` | — | — | 19-09-2026 |
| | | | **35** | | | **86** | | | | |

**Bảng mã trạng thái:** ⬜ Chưa khảo sát · 🟨 Đã lập bản đồ (có catalog / bản đồ màn hình, chưa có REQ) · ✅ Đã có tài liệu REQ · ⏸️ Hoãn

**Cột Nền tảng** mang trạng thái **riêng từng mặt**: `Android ⬜` = mới có bản đồ màn hình ở [`system_map.md`](_discovery/system_map.md), chưa sinh REQ. Module chỉ ✅ khi **mọi** mặt đã ✅ — `AUTH` vì thế về 🟨 từ 19-09-2026.

### Prefix đã chiếm trong hệ thống `BK`

```
AUTH · USER · BOOK · CAT · PROMO · FILE · ADDR · SYS · DASH
```

Prefix của hệ thống CRM (`LOGIN`, `CUST`, `PRJ`…) **không liên quan** — hai hệ thống nằm ở hai namespace tách biệt, mã `BK` phía trước bảo đảm không bao giờ đụng nhau khi grep.

---

## 2. Trạng thái REQ toàn hệ thống

Đã lập bản đồ **9/9 module** (8 mặt API · 8 mặt Android — `DASH` chỉ có Android, `SYS` chỉ có API) · có tài liệu REQ **1/9** (`AUTH` — API đủ, Android một phần).

| Trạng thái | `AUTH` | Toàn hệ thống |
|---|---|---|
| 🟢 Active | 86 (API 40 · Android 38 · dùng chung 8) | 86 |
| 🟡 Changed | 0 | 0 |
| 🔴 Deprecated | 0 | 0 |
| ⚪ Chưa implement | 0 | 0 |
| Endpoint chưa sinh REQ | — | 29 (7 module còn lại) |
| **Tổng** | **86 REQ** | **86 REQ** |

Ước lượng khi sinh REQ đầy đủ: **~180–260 REQ** cho 35 endpoint (mỗi endpoint 4–8 REQ: happy path · validation từng field · auth · boundary · response schema).

---

## 3. Ambiguity 🔴 High còn treo

> 20-09-2026: `AMB-BK-AUTH-01` · `02` · `04` **đã chốt** — cả ba là **lỗi / yêu cầu áp dụng** (user chốt ở `/generate-testcases-api auth`). Giữ dòng dưới làm vết, TC tương ứng gắn `@KnownBug`.

| Mã | Module | Câu hỏi | Chặn cái gì |
|---|---|---|---|
| [AMB-BK-01](_discovery/api_map.md#4-khoảng-trống-của-spec-amb--cần-chốt-trước-khi-sinh-tc) | `AUTH` · `USER` · tất cả | Hệ thống có mô hình vai trò không? Ai được gọi endpoint nào? Spec khai `403` ở 6 endpoint nhưng thực tế user thường làm được mọi thứ | TC phân quyền của **mọi** module. Không chốt thì không biết F-02 là lỗi hay thiết kế |
| [AMB-BK-02](_discovery/api_map.md#4-khoảng-trống-của-spec-amb--cần-chốt-trước-khi-sinh-tc) | `USER` | `GET /api/user` công khai trả email/phone/address toàn bộ user — cố ý hay lỗi cấu hình? | F-01 viết thành TC bug hay TC xác nhận hành vi |
| [AMB-BK-AUTH-01](auth/REQUIREMENTS_AUTH_SUMMARY.md#111-ambiguities) | `AUTH` | `PATCH /api/profile` luôn 422 `fields.fields` với mọi body — lỗi hay cần body dạng khác chưa công bố? (F-16) | 5 REQ hồ sơ/đổi mật khẩu (`41 · 42 · 45 → 47`) — TC viết sẵn, kỳ vọng FAIL |
| [AMB-BK-AUTH-02](auth/REQUIREMENTS_AUTH_SUMMARY.md#111-ambiguities) | `AUTH` | Đăng xuất không thu hồi `refetchToken` phía server — cố ý? (F-17) | REQ-BK-AUTH-33 |
| [AMB-BK-AUTH-04](auth/REQUIREMENTS_AUTH_SUMMARY.md#111-ambiguities) | `AUTH` | Cookie `accessToken` thiếu `HttpOnly`/`Secure`/`SameSite` — yêu cầu bảo mật có áp dụng? (F-03) | REQ-BK-AUTH-22 |

Ambiguity mức 🟠/🟡: cấp hệ thống xem [`_discovery/api_map.md` mục 4](_discovery/api_map.md#4-khoảng-trống-của-spec-amb--cần-chốt-trước-khi-sinh-tc) (`AMB-BK-06` đã chuyển thành `AMB-BK-AUTH-05`) · module `AUTH` xem [`auth/REQUIREMENTS_AUTH_SUMMARY.md` mục 11.1](auth/REQUIREMENTS_AUTH_SUMMARY.md#111-ambiguities).

---

## 4. Phát hiện bảo mật đáng chú ý

Đã kiểm chứng bằng gọi thật, **không** phải suy đoán từ spec. Chi tiết + bằng chứng: [`_discovery/api_map.md` mục 3](_discovery/api_map.md#3-kết-quả-kiểm-chứng-bằng-gọi-thật).

| Mã | Mức | Tóm tắt |
|---|---|---|
| F-01 | 🔴 | `GET /api/user` công khai → rò rỉ email/phone/address toàn bộ user |
| F-02 | 🔴 | Không có phân quyền — user vừa đăng ký xoá/sửa được user khác, tạo được sách |
| F-03 | 🔴 | Cookie `accessToken` thiếu `HttpOnly`/`Secure`/`SameSite` |
| F-04 | 🟠 | `price` âm được chấp nhận |
| F-05 | 🟠 | `categories` không tồn tại vẫn tạo được sách |
| F-06 | 🟠 | Xoá user làm sách của họ mồ côi (`auth: null`) |
| F-07 | 🟠 | `POST /api/user` gán mật khẩu mặc định đoán được (`anhtester.com`) |
| F-16 | 🔴 | `PATCH /api/profile` không dùng được — mọi body đều 422 *(19-09-2026)* |
| F-17 | 🔴 | Đăng xuất không thu hồi refresh token phía server *(19-09-2026)* |
| F-18 | 🟠 | Refresh token không xoay vòng, dùng lại được nhiều lần *(19-09-2026)* |
| F-19 | 🟠 | Thiếu `email` → server dùng `default` `user@example.com` thay vì báo thiếu field *(19-09-2026)* |
| F-20 | 🟠 | Đăng nhập lộ email nào đã đăng ký (400 vs 404) *(19-09-2026)* |
| F-23 | 🟠 | Access token vẫn dùng được sau đăng xuất *(19-09-2026)* |

---

## 5. Cấu trúc thư mục

```
docs/
├── requirements/
│   ├── README.md                      ← danh mục Perfex CRM (hệ thống khác)
│   ├── login/ customers/ projects/    ← module CRM
│   └── _book-api/                     ← HỆ THỐNG NÀY
│       ├── README.md                  ← file này — DANH MỤC
│       ├── _discovery/
│       │   ├── api_map.md             ← INDEX bản đồ API — TÊN FILE BẤT BIẾN
│       │   ├── system_map.md          ← INDEX bản đồ app mobile — TÊN FILE BẤT BIẾN
│       │   ├── modules/module_NN_*.md ← chi tiết màn hình theo nhóm module (9 module > ngưỡng 8)
│       │   ├── evidence/android_*.png ← 1 ảnh tổng quan mỗi module
│       │   └── sources/openapi_*.json ← snapshot spec gốc
│       └── <module>/                  ← sinh dần khi sinh REQ (VD `auth/`)
│           ├── REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md       ← INDEX — metadata · phân quyền · Story · AMB/RISK · Nhật ký
│           └── api/requirements_<module>_api.md ← Endpoint Catalog · REQ · Field Spec · Validation · Nhật ký kiểm chứng
└── testcases/
    └── _book-api/<module>/
        ├── TEST_CASES_<TÊN_MODULE>_SUMMARY.md             ← INDEX
        └── api/test_cases_<module>_api.md
```

> Dấu `_` đầu tên thư mục đánh dấu **"không phải module"** — cùng quy ước với `_discovery/`. Nhờ đó `_book-api/` không bị workflow nhầm là một module của CRM.

---

## 6. Quy trình sử dụng

| Tình huống | Workflow | Ghi vào đâu |
|---|---|---|
| Sinh REQ chi tiết cho 1 module API | `/generate-requirements-from-api <module>` — đọc `api_map.md` + spec đã snapshot, không cần Ticket ID | `_book-api/<module>/api/requirements_<module>_api.md` + index `_book-api/<module>/REQUIREMENTS_<TÊN_MODULE>_SUMMARY.md` + cập nhật bảng mục 1 |
| Sinh API test cases | `/generate-testcases-api` — **sau** khi module đã có REQ | `docs/testcases/_book-api/<module>/api/` |
| Sinh automation script | `/generate-automation-api` — từ file TC API | Source code + `reports/` |
| Spec đổi phiên bản | `/generate-requirements-from-api <module>` — tự phát hiện `sha256` khác snapshot, chạy delta | Snapshot mới ở `_discovery/sources/` · Nhật ký khám phá ở `api_map.md` · Impact Report `impact_spec_<ngày>.md` |
| Báo lỗi bảo mật F-01…F-07 | `/create-bug-report` | `docs/bugs/_book-api/<module>/` |
| Sinh REQ mặt Android cho 1 module | `/generate-requirements-from-mobile <module>` — đọc `system_map.md` + file `modules/` của module | `_book-api/<module>/mobile/requirements_<module>_mobile.md` + REQ dùng chung lên index + cập nhật cột `Nền tảng` |

**Thứ tự đề xuất (mặt API):** `AUTH → USER → BOOK → CAT → PROMO → FILE → ADDR → SYS`
`AUTH` đi đầu vì mọi module còn lại cần token. `SYS` để cuối vì là tiện ích test, không phải nghiệp vụ.

**Thứ tự đã chốt (mặt Android):** `AUTH (+ ADDR) → USER → BOOK · CAT → PROMO → FILE → DASH` — xem [`system_map.md` mục 6](_discovery/system_map.md#6-thứ-tự-khảo-sát-đã-chốt).

---

## 7. Nhật ký danh mục

| Ngày | Thay đổi |
|---|---|
| 20-09-2026 | `/generate-testcases-api auth` + `/generate-testcases-from-requirements` (Mobile): module `AUTH` có **105 TC** (Mobile 58 · API 47) ở [`docs/testcases/_book-api/auth/`](../../testcases/_book-api/auth/TEST_CASES_AUTH_SUMMARY.md) — phủ 86/86 REQ. User chốt `AMB-BK-AUTH-01` · `02` · `04` là **lỗi**; QA **không** truy vấn CSDL. Mở `AMB-BK-AUTH-20` 🟡 |
| 19-09-2026 | `/generate-requirements-from-mobile auth` (Android — Đăng ký · Đăng nhập · Đăng xuất): tạo [auth/mobile/requirements_auth_mobile.md](auth/mobile/requirements_auth_mobile.md) — `REQ-BK-AUTH-49 → 86` (38) + 28 ảnh. 8 REQ server-side kiểm khớp trên app chuyển từ `api/` lên index (dùng chung `Android · API`). Mở `AMB-BK-AUTH-14 → 19` (không 🔴 mới) · `RISK-BK-AUTH-07 · 08` |
| 19-09-2026 | `/discover-system` mode ADD — thêm **mặt Android** (app `book.anhtester.com` 1.0, Hybrid Capacitor). Tạo [`_discovery/system_map.md`](_discovery/system_map.md) + 6 file `modules/` + 9 ảnh `_discovery/evidence/android_*`. Ghép 8 module vào module sẵn có; **cấp prefix mới `DASH`** (Dashboard, chỉ có trên app — user chốt). Cột `Nền tảng` thêm `Android ⬜`; `AUTH` về 🟨 vì còn thiếu mặt Android. Mở `AMB-BK-11` · `AMB-BK-12`. Tạo 1 tài khoản test trên app (lưu `.env`) |
| 19-09-2026 | Module `AUTH` có tài liệu REQ: `REQ-BK-AUTH-01 → 48` · 5 Story · 13 AMB (3 🔴) · 6 RISK. Thêm cột `Nền tảng` + `Story` vào bảng mục 1, dòng `Năng lực kiểm thử của QA` vào metadata. Spec đổi `sha256` (35 op giữ nguyên, 11 op đổi schema) → snapshot `openapi_2026-09-19.json`. Phát hiện mới F-16 → F-25 |
| 15-09-2026 | Sửa mục 6: sinh REQ cho module API chuyển sang `/generate-requirements-from-api` — route cũ `/analyze-requirement-document` bị Bước 0 của nó chặn (spec không có Ticket ID). Luật đã đưa ngược vào skill `skills-requirements-analyzer` mục 3.4 và command mới |
| 14-08-2026 | Khởi tạo danh mục hệ thống `BK`. Lập bản đồ 35 endpoint / 8 module bằng parse spec + 20 request kiểm chứng. Ghi nhận 15 phát hiện (3 🔴) và 10 ambiguity. **Chưa sinh REQ nào** — chờ chốt AMB-BK-01 và AMB-BK-02 |
