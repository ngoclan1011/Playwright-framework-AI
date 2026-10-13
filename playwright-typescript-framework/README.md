# Playwright TypeScript Framework — AnhTester Book (Web UI + API)

Framework automation cho hệ thống [book.anhtester.com](https://book.anhtester.com): test giao diện web (Sign up, Sign in) và REST API ([Swagger](https://book.anhtester.com/swagger)) trong cùng một project.

| | |
|---|---|
| Runner | Playwright Test |
| Ngôn ngữ | TypeScript |
| Report | Playwright HTML + **Allure 2** (CLI cài trong project) |
| Trình duyệt UI | **Chrome → Edge → Firefox, chạy lần lượt** — mỗi trình duyệt một lượt chạy riêng (`scripts/run-browsers.mjs`) |
| Song song | Bật sẵn, **5 luồng cho mỗi trình duyệt** — đổi ở biến `WORKERS` |
| CI | GitHub Actions — `../.github/workflows/playwright-typescript-framework.yml` |

## Yêu cầu máy

| Cần | Phiên bản | Vì sao |
|---|---|---|
| Node.js | 20 trở lên (đã kiểm trên 24) | Chạy Playwright |
| **Java (JRE)** | **8 trở lên** (đã kiểm trên 21) | CLI **Allure 2** viết bằng Java. Thiếu Java thì test vẫn chạy, chỉ **không sinh được** Allure report |

Không cần cài Allure lên máy — CLI nằm trong `node_modules` sau khi `npm install`.

## Cài đặt

```bash
npm install
npm run browsers:install      # Firefox + ffmpeg (quay video) vào .browsers/ trong project
cp .env.example .env
```

> **Chrome và Edge** dùng bản đã cài sẵn trên máy (`channel: 'chrome'` / `'msedge'`). **Firefox** là bản của Playwright, cài vào `.browsers/` thay vì `%LOCALAPPDATA%\ms-playwright`: trên Windows, khi chạy từ ứng dụng đóng gói (MSIX, ví dụ app Claude) thư mục đó bị ảo hoá và Firefox báo *side-by-side configuration is incorrect*. Đổi thư mục ở biến `PLAYWRIGHT_BROWSERS_PATH` trong `.env`.

Mở `.env` và điền tài khoản demo:

1. Tự đăng ký một tài khoản tại https://book.anhtester.com/sign-up
2. Điền email/mật khẩu đó vào `TEST_EMAIL`, `TEST_PASSWORD`

> Chưa có tài khoản vẫn chạy được `npm run test:public` (các test không gắn `@auth`).

## Chạy test

| Lệnh | Chạy gì |
|---|---|
| `npm test` | Toàn bộ: UI lần lượt Chrome → Edge → Firefox, rồi CRM, rồi API |
| `npm run test:ui` | Chỉ test giao diện — lần lượt Chrome → Edge → Firefox, mỗi trình duyệt `WORKERS` luồng song song |
| `npm run test:ui:chrome` · `test:ui:edge` · `test:ui:firefox` | Test giao diện trên **một** trình duyệt |
| `npm run browsers:install` | Cài Firefox + ffmpeg vào `.browsers/` |
| `npm run test:api` | Chỉ test API |
| `npm run test:crm` | Test Perfex CRM (`CRM_LOGIN_*`) — cần `CRM_ADMIN_*`, `CRM_PM_*` trong `.env` cho test `@auth` |
| `npm run test:smoke` | Chỉ test `@smoke` |
| `npm run test:public` | Test **không cần tài khoản** (bỏ qua `@auth`) |
| `npm run test:headed` | Test giao diện, mở trình duyệt thật để debug |
| `npm run typecheck` | Kiểm lỗi TypeScript |

### Đổi số luồng song song — đúng 1 chỗ

Sửa `WORKERS` trong `.env` (mặc định `5`). Số này áp cho **từng trình duyệt**: Chrome chạy xong với 5 luồng mới tới Edge, rồi tới Firefox — không bao giờ có 3 × 5 trình duyệt mở cùng lúc. Đổi cho một lần chạy:

```bash
WORKERS=2 npm run test:ui
```

> Chạy lần lượt từng trình duyệt thay vì dùng `dependencies` của Playwright: project phụ thuộc bị **bỏ qua** khi project trước có test đỏ, nên Chrome đỏ là mất kết quả Edge/Firefox. `run-browsers.mjs` chạy đủ cả 3 rồi in bảng tổng kết theo trình duyệt. Playwright không mở nhiều luồng hơn số test — chạy 3 test thì log ghi `3 workers`.

## Mở report

```bash
npm run report          # sinh Allure report rồi mở trên trình duyệt
npm run report:single   # sinh 1 file HTML duy nhất: reports/allure-report-single/index.html
npm run report:html     # mở report HTML của Playwright
```

- Gửi report cho người khác: gửi file `reports/allure-report-single/index.html` — mở bằng trình duyệt, không cần cài gì
- **Trend** (biểu đồ lịch sử): `report:generate` tự chép `history/` của report trước sang kết quả mới (`scripts/allure-history.mjs`). Trend chỉ có từ lần **thứ hai**, và chỉ khi **mỗi lần chạy test đều sinh report** — chạy 2 lần liên tiếp mà không `npm run report` thì lần giữa không vào Trend. Xoá thư mục `reports/` là mất lịch sử
- Trên CI, `reports/` không được giữ giữa các lần chạy nên **không có Trend** — muốn có phải lưu `history/` qua các lần chạy (vd tải artifact của lần trước về trước khi generate)
- ⚠️ Report có ảnh chụp hệ thống thật — kiểm nội dung trước khi gửi ra ngoài team

Mọi output nằm trong `reports/` (đã `.gitignore`):

```text
reports/
├── allure-results/         # dữ liệu thô — tự xoá đầu mỗi lần chạy (src/global-setup.ts)
├── allure-report/          # Allure report nhiều file
├── allure-report-single/   # Allure report 1 file
├── html/                   # report HTML của Playwright
├── logs/                   # test-execution.log
└── test-artifacts/         # video, trace khi test fail
```

## Cấu trúc

```text
playwright-typescript-framework/
├── playwright.config.ts          # 5 project: ui-chrome · ui-edge · ui-firefox · crm · api
├── src/
│   ├── api/                      # API client — mỗi nhóm endpoint 1 class, kế thừa BaseApi
│   ├── pages/                    # Page Object — locator khai ở đầu class
│   ├── fixtures/
│   │   ├── api.fixture.ts        # API client + accessToken + nhật ký request cuối test
│   │   └── ui.fixture.ts         # Page Object + ảnh chụp cuối MỌI test (kế thừa api.fixture)
│   ├── tests/
│   │   ├── ui/auth/              # sign-up.spec.ts · sign-in.spec.ts
│   │   └── api/                  # auth · book · category · address
│   ├── utils/                    # env.config · logger · test-data · schema-validator · allure-meta
│   └── global-setup.ts
└── test-data/
    ├── schemas/                  # JSON Schema kiểm response API
    ├── sign-in-invalid.json      # data-driven: đăng nhập sai
    └── address-wards.json        # data-driven: phường/xã theo tỉnh
```

## Quy ước viết test

| Mục | Quy ước |
|---|---|
| Tên test | Tiếng Việt, mô tả hành vi |
| Metadata | Gọi `meta({ id, feature, severity, description })` đầu mỗi test → testId, feature, severity, description trong Allure |
| Tags | Option `tag` của Playwright: `@smoke` `@regression` `@ui` `@api` + tên chức năng. `@auth` = test cần tài khoản trong `.env` hoặc tạo tài khoản mới |
| Test body | Bọc bằng `test.step('Arrange: …' / 'Act: …' / 'Assert: …')`. Page Object và API client tự sinh sub-step |
| Bằng chứng | Test UI: ảnh `trang_thai_cuoi_cua_test` (PASS) / `trang_thai_khi_that_bai` (FAIL). Test API: `nhat_ky_api` (method · URL · status · thời gian) |
| Dữ liệu | Sinh bằng `TestData` — unique theo `auto_<tên test>_<timestamp>_<random>`, không dùng chung giữa test |
| Dọn dữ liệu | Môi trường dùng chung: test tạo gì thì tự xoá đúng cái đó trong `finally`. **Không** xoá dữ liệu người khác |
| Log | Dùng `logger` (ghi ra file). **Không** `console.log` — sẽ thành attachment stdout trong Allure |
| Chờ | Chỉ `expect(...)` / auto-waiting. **Cấm** `waitForTimeout` |
| Mật khẩu | `fillField(..., masked = true)` — step và log hiện `******` |

## Thêm test mới

- **Trang mới:** tạo `src/pages/<ten>.page.ts` kế thừa `BasePage` → khai vào `ui.fixture.ts`
- **Nhóm API mới** (vd `promotion`, `user`, `file` trong Swagger): tạo `src/api/<ten>.api.ts` kế thừa `BaseApi` → khai vào `api.fixture.ts`
- Locator phải lấy từ DOM thật, ưu tiên `getByRole` / `getByLabel`

## Việc cần làm sau lần chạy đầu với tài khoản thật

Các điểm dưới **chưa kiểm chứng được** vì cần tài khoản đăng nhập — chạy `npm test` một lần rồi xem report:

| Test | Điểm cần xác nhận |
|---|---|
| `BOOK_AUTH_TC_005` Đăng nhập thành công | Trang sau đăng nhập chưa được inspect → hiện chỉ kiểm "đã rời `/sign-in`". Nên bổ sung Page Object cho trang đích |
| `BOOK_AUTH_TC_002` Đăng ký qua UI | Kiểm bằng request `POST /api/register` = 201 rồi đăng nhập API được. Nếu hệ thống yêu cầu xác thực email trước khi đăng nhập thì bước cuối sẽ đỏ |
| `BOOK_BOOKS_TC_004` Tạo sách | `POST /api/book` không trả id nên test tìm lại theo tên để dọn. Nếu tìm kiếm có độ trễ thì cần chờ thêm bằng `expect.poll` |

## CI (GitHub Actions)

File: `../.github/workflows/playwright-typescript-framework.yml` (GitHub chỉ đọc workflow ở gốc repo).

- Chạy khi push/PR có thay đổi trong thư mục này, hoặc bấm chạy tay (`workflow_dispatch`)
- Khai **Secrets** của repo: `TEST_EMAIL`, `TEST_PASSWORD` (và `BASE_URL` nếu khác mặc định). Thiếu secrets thì các test `@auth` sẽ fail
- Số luồng trên CI: sửa `WORKERS` ở khối `env:` đầu file workflow
- Kết quả: artifact `test-reports` chứa toàn bộ `reports/`
