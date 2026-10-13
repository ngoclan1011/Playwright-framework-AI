# Appium Java Framework — Book Anhtester (Android)

Framework automation mobile cho app **Book Anhtester** (Hybrid · Capacitor), dùng **Appium 3 + Java 17 + TestNG + Allure**.
Screen Object Model · driver theo từng thread (`ThreadLocal`) · chạy song song theo device · Allure CLI và Appium server **cài ngay trong project** (không cài gì lên máy).

---

## ⚠️ Việc cần làm trước khi chạy test app Book

| # | Việc | Vì sao |
|---|---|---|
| 1 | Chép file APK app Book vào `apps/` rồi cài lên emulator: `adb install -r apps/<ten-file>.apk` | Ngày 29-09-2026 emulator **chưa cài** app — mọi test app Book lỗi ở bước tạo phiên: `Activity class {com.anhtester.book/...MainActivity} does not exist` |
| 2 | Kiểm tên gói app: `adb shell pm list packages \| findstr anhtester` rồi sửa `appium:appPackage` trong `capabilities/devices.json` nếu khác | `capabilities.json` của repo ghi `com.anhtester.book`, nhưng tài liệu khảo sát (`docs/requirements/_book-api/_discovery/system_map.md`) ghi app id là **`book.anhtester.com`** — cần đối chiếu với APK thật |
| 3 | Tạo `.env` từ `.env.example`, điền `BOOK_USER_EMAIL` / `BOOK_USER_PASSWORD` | Test đăng nhập thành công (`BK_AUTH_TC_004`) bị **SKIP** nếu chưa có tài khoản |
| 4 | Locator iOS là **⚠️ PLACEHOLDER** | App chưa khảo sát trên iOS (máy Windows). File chứa placeholder: `DashboardScreen.java`, `SignInScreen.java` |

Locator **Android** lấy từ khảo sát thật trên app (`docs/requirements/_book-api/auth/mobile/requirements_auth_mobile.md` mục 8, ngày 19 và 26-09-2026) — chưa chạy lại được trên bản build hiện tại vì thiếu APK.

Muốn kiểm môi trường **không cần app Book** (emulator ↔ Appium ↔ framework): chạy suite `testng-device-check.xml` ở mục *Chạy test* — đã PASS 2 lần liên tiếp ngày 29-09-2026.

---

## Yêu cầu máy

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| JDK | 17 trở lên | Máy này dùng JDK 25 có sẵn trong Android Studio: `D:\Setup\android-studio-quail4-patch1-windows\android-studio\jbr` |
| Node.js | 20 trở lên | Chạy Appium server cài trong project |
| Android SDK + emulator | — | Cài cùng Android Studio: `C:\Users\lanl\AppData\Local\Android\Sdk` |
| Maven | **Không cần** | Dùng Maven Wrapper `mvnw` / `mvnw.cmd` có sẵn |
| Allure | **Không cần** | `mvnw validate` tự giải nén Allure 2 CLI vào `.allure/` |

## Cài đặt (một lần)

```powershell
cd appium-java-framework
$env:JAVA_HOME = "D:\Setup\android-studio-quail4-patch1-windows\android-studio\jbr"
.\mvnw.cmd -B validate          # tải thư viện + giải nén Allure CLI vào .allure/
npm install                     # Appium server vào node_modules/
npm run setup:driver            # driver UiAutomator2 vào .appium/ (không cài global)
copy .env.example .env          # rồi điền giá trị thật
```

## Chạy test

**Bước 1 — bật emulator** (bỏ qua nếu đã bật):

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_10_Pro_XL -no-snapshot-save -no-boot-anim
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices     # phải thấy emulator-5554  device
```

**Bước 2 — bật Appium server** ở một cửa sổ riêng (cần `ANDROID_HOME`):

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
npm run appium                  # http://127.0.0.1:4723 · log: reports/logs/appium-server.log
```

**Bước 3 — chạy suite:**

```powershell
.\mvnw.cmd -B test                                        # suite chính testng.xml (app Book)
.\mvnw.cmd -B test -Dsuite=testng-device-check.xml       # chỉ kiểm kết nối thiết bị (app Cài đặt)
```

### Chạy song song — đổi ở ĐÚNG MỘT CHỖ

Appium song song theo **device**, không theo thread: `testng.xml` → `parallel="tests"`, **`thread-count` = số device đang chạy thật** (hiện `1`).
Thêm device: bỏ comment khối `<test>` thứ hai trong `testng.xml`, khai device đó trong `capabilities/devices.json` với **`appium:systemPort` khác** (8201, 8202…), rồi tăng `thread-count`.
⛔ Không đặt `thread-count="5"` khi chỉ có 1 emulator — 5 phiên trên 1 device là chắc chắn hỏng.

## Mở report

```powershell
.\mvnw.cmd -B allure:serve                               # sinh + mở report trên trình duyệt
.\mvnw.cmd -B allure:report                              # chỉ sinh vào reports/allure-report/
.\.allure\allure-2.35.1\bin\allure.bat generate --single-file reports/allure-results -o reports/allure-report-single --clean
```

- `allure:report` **không** in `Downloading allure commandline` — CLI nằm sẵn trong `.allure/`.
- **Máy không có JDK nhưng có Node:** `npx allure generate reports/allure-results` (Allure 3 đọc được kết quả của TestNG).
- **Máy không có gì:** gửi file `reports/allure-report-single/index.html` (lệnh thứ 3 ở trên).

Report có: tên test Tiếng Việt · Description · Severity · Feature/Story · label `testId` (mã TC trong `docs/testcases/_book-api/auth/`) · step `Arrange:` / `Act:` / `Assert:` · ảnh trạng thái cuối cho **mọi** test (`trang_thai_cuoi_cua_test` khi PASS, `trang_thai_khi_that_bai` khi FAIL).

## Cấu trúc

```text
appium-java-framework/
├── pom.xml · mvnw · mvnw.cmd · .mvn/     # Maven Wrapper — không cần cài Maven
├── package.json                          # Appium server + cross-env (cục bộ)
├── testng.xml                            # suite chính — parallel="tests", mỗi <test> 1 device
├── testng-device-check.xml               # suite kiểm kết nối thiết bị
├── capabilities/devices.json             # caps từng device (systemPort riêng)
├── .env.example                          # APPIUM_SERVER · CAPABILITIES_FILE · tài khoản test
├── apps/                                 # đặt APK/IPA (không commit)
├── test-data/signin-invalid.json         # dữ liệu data-driven
├── src/main/java/com/anhtester/mobile/
│   ├── config/AppConfig.java             # -Dkey → .env → mặc định
│   ├── drivers/AppiumDriverFactory.java  # ThreadLocal<AppiumDriver>, remove() khi đóng
│   ├── drivers/CapabilitiesManager.java  # đọc devices.json theo deviceKey
│   ├── screens/BaseScreen.java           # waits · tap · type · byPlatform()
│   ├── screens/DashboardScreen.java
│   ├── screens/SignInScreen.java
│   ├── listeners/TestLogListener.java    # log bắt đầu/kết thúc kèm tên thread
│   ├── listeners/ScreenshotListener.java # ảnh cuối MỌI test → đính vào đúng kết quả Allure
│   └── utils/ (MobileGestures · ScreenshotUtil · TestDataGenerator · JsonDataReader)
├── src/test/java/com/anhtester/mobile/
│   ├── base/BaseTest.java                # mở/đóng phiên theo khối <test> · startFromCleanApp()
│   └── tests/ (SignInTest · SignInValidationTest · DeviceConnectionTest)
└── reports/                              # MỌI output (git-ignored): allure-results · allure-report · logs · screenshots · surefire
```

CI: `.github/workflows/appium-java-framework.yml` ở **gốc repo** — emulator API 35 trên runner Ubuntu, Appium cục bộ, `./mvnw test`, sinh Allure bằng CLI trong project, upload `reports/` với `if: always()`. Tài khoản lấy từ GitHub Secrets `BOOK_USER_EMAIL`, `BOOK_USER_PASSWORD`. CI cần APK trong `apps/` (hoặc bước tải APK riêng) mới chạy được suite app Book.

## Quy ước

- Screen Object: locator khai **đầu class**, phân nhánh Android/iOS bằng `byPlatform()` — không `if (isAndroid)` trong test.
- Chỉ chờ thông minh (`WebDriverWait`) — **cấm** `Thread.sleep`.
- Mỗi test tự dựng tiền đề (`startFromCleanApp()` xoá dữ liệu app vì caps đang `noReset=true`) — không phụ thuộc thứ tự chạy.
- Dữ liệu test duy nhất theo từng test: `TestDataGenerator` (timestamp + số ngẫu nhiên).
- Mỗi test có `Allure.label("testId", "<mã TC>")` khớp `docs/testcases/`.

## Rủi ro đã biết của app (từ tài liệu khảo sát)

| Mã | Hiện tượng | Framework xử lý |
|---|---|---|
| `RISK-BK-AUTH-11` | Lúc mới mở phiên, cây phần tử WebView rỗng tới lần chạm đầu | `DashboardScreen.waitUntilLoaded()` chạm 1 lần vào vùng tiêu đề nếu sau 8 giây vẫn rỗng |
| `RISK-BK-AUTH-08` | Bấm `Login account` có lúc không gửi form | Ẩn bàn phím trước khi bấm, assert theo **kết quả** (lời chào / câu lỗi), **không** tự bấm lại để che lỗi |
| — | `resource-id` ô nhập tự sinh (`_r_k_`…) | Không dùng — bắt ô theo `starts-with(@hint, ...)` |
