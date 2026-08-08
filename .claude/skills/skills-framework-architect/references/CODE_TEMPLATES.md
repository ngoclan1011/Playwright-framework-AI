# Code Templates — Base Classes

> Code mẫu **chạy được ngay** cho các thành phần lõi của framework. Agent copy & điều chỉnh theo project, **KHÔNG** viết lại từ đầu.
>
> Nguyên tắc chung áp dụng cho mọi template:
> - Viewport `1920x1080` · headless đọc từ env, không hardcode
> - Smart waits — **không** `Thread.sleep()` / `waitForTimeout()`
> - Logger thay cho `System.out.println()` / `console.log()`
> - Credentials đọc từ `.env`, không commit

---

## 1. Playwright + TypeScript

### `src/utils/env.config.ts`

```typescript
import * as dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}. Kiểm tra file .env`);
  }
  return value;
}

export const env = {
  baseURL: required('BASE_URL'),
  username: required('TEST_USERNAME'),
  password: required('TEST_PASSWORD'),
  headless: process.env.HEADLESS !== 'false',
  timeout: Number(process.env.TIMEOUT ?? 30_000),
} as const;
```

### `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env.config';

export default defineConfig({
  testDir: './src/tests',
  timeout: env.timeout,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  // Mọi output gom vào reports/ — xem reporting_rules.md mục 6
  outputDir: 'reports/test-artifacts',
  reporter: [
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['list'],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
  ],
  use: {
    baseURL: env.baseURL,
    headless: env.headless,
    viewport: { width: 1920, height: 1080 },
    // 'off' vì ảnh được attach thủ công ở afterEach cho CẢ pass lẫn fail — xem § 7.1
    screenshot: 'off',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

### `src/pages/base.page.ts`

```typescript
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = ''): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Click sau khi element đã sẵn sàng — dựa vào auto-waiting của Playwright */
  protected async clickWhenReady(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
    await locator.click();
  }

  /** Điền text, xoá giá trị cũ trước */
  protected async fillField(locator: Locator, value: string): Promise<void> {
    await expect(locator).toBeVisible();
    await locator.fill(value);
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async waitForUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }
}
```

### `src/fixtures/base.fixture.ts`

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

type Pages = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

### `src/utils/test-data.ts`

```typescript
/** Sinh data unique + traceable: nhìn vào DB biết ngay test nào tạo ra */
export class TestData {
  private static stamp(): string {
    return `${Date.now()}`;
  }

  static email(testName: string): string {
    return `auto_${testName}_${this.stamp()}@auto.test`;
  }

  static username(testName: string): string {
    return `auto_${testName}_${this.stamp()}`;
  }

  static code(prefix: string): string {
    return `${prefix}_${this.stamp()}`;
  }
}
```

---

## 2. Playwright + Java (Maven + TestNG)

### `src/main/java/com/project/factory/PlaywrightFactory.java`

```java
package com.project.factory;

import com.microsoft.playwright.*;
import com.project.config.ConfigReader;

/**
 * Playwright objects KHÔNG thread-safe — mỗi thread giữ instance riêng
 * để TestNG chạy parallel không giẫm chân nhau.
 */
public class PlaywrightFactory {

    private static final ThreadLocal<Playwright> PLAYWRIGHT = new ThreadLocal<>();
    private static final ThreadLocal<Browser> BROWSER = new ThreadLocal<>();
    private static final ThreadLocal<BrowserContext> CONTEXT = new ThreadLocal<>();
    private static final ThreadLocal<Page> PAGE = new ThreadLocal<>();

    public Page initBrowser() {
        ConfigReader config = ConfigReader.getInstance();

        PLAYWRIGHT.set(Playwright.create());
        BROWSER.set(PLAYWRIGHT.get().chromium().launch(
                new BrowserType.LaunchOptions().setHeadless(config.isHeadless())));

        CONTEXT.set(BROWSER.get().newContext(new Browser.NewContextOptions()
                .setViewportSize(1920, 1080)));

        PAGE.set(CONTEXT.get().newPage());
        PAGE.get().navigate(config.getBaseUrl());
        return PAGE.get();
    }

    public static Page getPage() {
        return PAGE.get();
    }

    public void closeBrowser() {
        if (PAGE.get() != null)       { PAGE.get().close();       PAGE.remove(); }
        if (CONTEXT.get() != null)    { CONTEXT.get().close();    CONTEXT.remove(); }
        if (BROWSER.get() != null)    { BROWSER.get().close();    BROWSER.remove(); }
        if (PLAYWRIGHT.get() != null) { PLAYWRIGHT.get().close(); PLAYWRIGHT.remove(); }
    }
}
```

### `src/main/java/com/project/config/ConfigReader.java`

```java
package com.project.config;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/** Singleton đọc config.properties, cho phép override bằng system property. */
public class ConfigReader {

    private static ConfigReader instance;
    private final Properties properties = new Properties();

    private ConfigReader() {
        try (InputStream input = getClass().getClassLoader()
                .getResourceAsStream("config.properties")) {
            if (input == null) {
                throw new IllegalStateException("Không tìm thấy config.properties trong classpath");
            }
            properties.load(input);
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được config.properties", e);
        }
    }

    public static synchronized ConfigReader getInstance() {
        if (instance == null) {
            instance = new ConfigReader();
        }
        return instance;
    }

    /** System property thắng file — tiện truyền -Dheadless=true trên CI. */
    public String get(String key) {
        return System.getProperty(key, properties.getProperty(key));
    }

    public String getBaseUrl()  { return get("base.url"); }
    public boolean isHeadless() { return Boolean.parseBoolean(get("headless")); }
    public int getTimeout()     { return Integer.parseInt(get("timeout")); }
}
```

### `src/main/java/com/project/pages/BasePage.java`

```java
package com.project.pages;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.WaitForSelectorState;

public abstract class BasePage {

    protected final Page page;

    protected BasePage(Page page) {
        this.page = page;
    }

    protected void click(Locator locator) {
        locator.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.VISIBLE));
        locator.click();
    }

    protected void fill(Locator locator, String value) {
        locator.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.VISIBLE));
        locator.fill(value);
    }

    protected String getText(Locator locator) {
        locator.waitFor(new Locator.WaitForOptions().setState(WaitForSelectorState.VISIBLE));
        return locator.textContent();
    }

    public String getCurrentUrl() {
        return page.url();
    }
}
```

### `src/test/java/com/project/base/BaseTest.java`

```java
package com.project.base;

import com.microsoft.playwright.Page;
import com.project.factory.PlaywrightFactory;
import com.project.utils.ScreenshotUtil;
import org.testng.ITestResult;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

public abstract class BaseTest {

    protected PlaywrightFactory factory;
    protected Page page;

    @BeforeMethod(alwaysRun = true)
    public void setUp() {
        factory = new PlaywrightFactory();
        page = factory.initBrowser();
    }

    /** Đính ảnh trạng thái cuối cho MỌI test — cả PASS lẫn FAIL. Xem § 7.3. */
    @AfterMethod(alwaysRun = true)
    public void tearDown(ITestResult result) {
        String name = result.isSuccess()
                ? "trang_thai_cuoi_cua_test"
                : "trang_thai_khi_that_bai";
        ScreenshotUtil.captureAndAttach(page, name);
        factory.closeBrowser();
    }
}
```

### `src/main/java/com/project/utils/ScreenshotUtil.java` (bản Playwright Java)

```java
package com.project.utils;

import com.microsoft.playwright.Page;
import io.qameta.allure.Allure;

import java.io.ByteArrayInputStream;

public final class ScreenshotUtil {

    private ScreenshotUtil() {}

    public static void captureAndAttach(Page page, String name) {
        byte[] png = page.screenshot(new Page.ScreenshotOptions().setFullPage(true));
        Allure.addAttachment(name, new ByteArrayInputStream(png));
    }
}
```

> Bản Selenium dùng `WebDriver` thay cho `Page` — xem § 3.

---

## 3. Selenium + Java (Maven + TestNG)

### `src/main/java/com/project/drivers/DriverFactory.java`

```java
package com.project.drivers;

import com.project.config.ConfigReader;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.time.Duration;

public class DriverFactory {

    private static final ThreadLocal<WebDriver> DRIVER = new ThreadLocal<>();

    public static WebDriver initDriver() {
        ConfigReader config = ConfigReader.getInstance();

        ChromeOptions options = new ChromeOptions();
        if (config.isHeadless()) {
            options.addArguments("--headless=new");
        }
        options.addArguments("--window-size=1920,1080");
        options.addArguments("--disable-gpu", "--no-sandbox");

        // Selenium 4.6+ tự quản lý driver binary — không cần WebDriverManager
        WebDriver driver = new ChromeDriver(options);
        driver.manage().window().setSize(new Dimension(1920, 1080));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(config.getTimeout()));

        DRIVER.set(driver);
        return driver;
    }

    public static WebDriver getDriver() {
        return DRIVER.get();
    }

    public static void quitDriver() {
        if (DRIVER.get() != null) {
            DRIVER.get().quit();
            DRIVER.remove();
        }
    }
}
```

### `src/main/java/com/project/pages/BasePage.java`

```java
package com.project.pages;

import com.project.config.ConfigReader;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class BasePage {

    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver,
                Duration.ofSeconds(ConfigReader.getInstance().getTimeout()));
    }

    protected WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    protected void type(By locator, String value) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(value);
    }

    protected String getText(By locator) {
        return waitForVisible(locator).getText();
    }

    protected boolean isDisplayed(By locator) {
        try {
            return waitForVisible(locator).isDisplayed();
        } catch (org.openqa.selenium.TimeoutException e) {
            return false;
        }
    }

    protected void waitForUrlContains(String fragment) {
        wait.until(ExpectedConditions.urlContains(fragment));
    }
}
```

### `src/main/java/com/project/utils/TestDataGenerator.java`

```java
package com.project.utils;

/** Data unique + traceable — truy ngược được test nào sinh ra. */
public final class TestDataGenerator {

    private TestDataGenerator() {}

    private static long stamp() {
        return System.currentTimeMillis();
    }

    public static String email(String testName) {
        return String.format("auto_%s_%d@auto.test", testName, stamp());
    }

    public static String username(String testName) {
        return String.format("auto_%s_%d", testName, stamp());
    }

    public static String code(String prefix) {
        return String.format("%s_%d", prefix, stamp());
    }
}
```

### `src/main/java/com/project/utils/ScreenshotUtil.java`

```java
package com.project.utils;

import io.qameta.allure.Allure;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.ByteArrayInputStream;

public final class ScreenshotUtil {

    private ScreenshotUtil() {}

    public static void captureAndAttach(WebDriver driver, String name) {
        byte[] png = ((TakesScreenshot) driver).getScreenshotAs(OutputType.BYTES);
        Allure.addAttachment(name, new ByteArrayInputStream(png));
    }
}
```

---

## 4. Appium + Java (Maven + TestNG)

### `src/main/java/com/project/drivers/AppiumDriverFactory.java`

```java
package com.project.drivers;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.MalformedURLException;
import java.net.URL;

public class AppiumDriverFactory {

    private static final ThreadLocal<AppiumDriver> DRIVER = new ThreadLocal<>();

    public static AppiumDriver initDriver(String platform, String deviceKey) {
        DesiredCapabilities caps = CapabilitiesManager.load(platform, deviceKey);
        URL serverUrl = appiumServerUrl();

        AppiumDriver driver = "android".equalsIgnoreCase(platform)
                ? new AndroidDriver(serverUrl, caps)
                : new IOSDriver(serverUrl, caps);

        DRIVER.set(driver);
        return driver;
    }

    private static URL appiumServerUrl() {
        String url = System.getProperty("appium.server", "http://127.0.0.1:4723");
        try {
            return new URL(url);
        } catch (MalformedURLException e) {
            throw new IllegalStateException("Appium server URL không hợp lệ: " + url, e);
        }
    }

    public static AppiumDriver getDriver() {
        return DRIVER.get();
    }

    public static void quitDriver() {
        if (DRIVER.get() != null) {
            DRIVER.get().quit();
            DRIVER.remove();
        }
    }
}
```

### `src/main/java/com/project/screens/BaseScreen.java`

```java
package com.project.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public abstract class BaseScreen {

    protected final AppiumDriver driver;
    protected final WebDriverWait wait;

    protected BaseScreen(AppiumDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(15));
    }

    protected WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected void tap(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    protected void type(By locator, String value) {
        WebElement element = waitForVisible(locator);
        element.clear();
        element.sendKeys(value);
    }

    /** Scroll tới element theo text (Android) — thay cho việc tap mù vào vùng off-screen. */
    protected WebElement scrollToText(String text) {
        return driver.findElement(AppiumBy.androidUIAutomator(
                "new UiScrollable(new UiSelector().scrollable(true))"
                        + ".scrollIntoView(new UiSelector().text(\"" + text + "\"))"));
    }
}
```

---

## 5. Playwright + Python (Pytest)

### `conftest.py`

```python
import os

import pytest
from dotenv import load_dotenv
from playwright.sync_api import Browser, Page, Playwright, sync_playwright

load_dotenv()


@pytest.fixture(scope="session")
def playwright_instance() -> Playwright:
    with sync_playwright() as p:
        yield p


@pytest.fixture(scope="session")
def browser(playwright_instance: Playwright) -> Browser:
    headless = os.getenv("HEADLESS", "true").lower() != "false"
    browser = playwright_instance.chromium.launch(headless=headless)
    yield browser
    browser.close()


@pytest.fixture
def page(browser: Browser) -> Page:
    context = browser.new_context(viewport={"width": 1920, "height": 1080})
    page = context.new_page()
    page.goto(os.environ["BASE_URL"])
    yield page
    context.close()


@pytest.hookimpl(hookwrapper=True, tryfirst=True)
def pytest_runtest_makereport(item, call):
    """Đính ảnh trạng thái cuối cho MỌI test — cả PASS lẫn FAIL. Xem § 7.2."""
    outcome = yield
    report = outcome.get_result()

    if report.when != "call":
        return

    page = item.funcargs.get("page")
    if page is None:
        return

    import allure
    name = "trang_thai_cuoi_cua_test" if report.passed else "trang_thai_khi_that_bai"
    allure.attach(
        page.screenshot(full_page=True),
        name=name,
        attachment_type=allure.attachment_type.PNG,
    )
```

### `src/pages/base_page.py`

```python
from playwright.sync_api import Locator, Page, expect


class BasePage:
    def __init__(self, page: Page) -> None:
        self.page = page

    def goto(self, path: str = "") -> None:
        self.page.goto(path)
        self.page.wait_for_load_state("domcontentloaded")

    def click(self, locator: Locator) -> None:
        expect(locator).to_be_enabled()
        locator.click()

    def fill(self, locator: Locator, value: str) -> None:
        expect(locator).to_be_visible()
        locator.fill(value)

    def get_text(self, locator: Locator) -> str:
        expect(locator).to_be_visible()
        return locator.inner_text()
```

### `src/utils/test_data.py`

```python
import time


def _stamp() -> int:
    return int(time.time() * 1000)


def email(test_name: str) -> str:
    return f"auto_{test_name}_{_stamp()}@auto.test"


def username(test_name: str) -> str:
    return f"auto_{test_name}_{_stamp()}"


def code(prefix: str) -> str:
    return f"{prefix}_{_stamp()}"
```

---

## 6. CI/CD — GitHub Actions

### Playwright + TypeScript — `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Run tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
          HEADLESS: 'true'
        run: npx playwright test

      - name: Sinh Allure report
        if: always()
        run: npx allure generate reports/allure-results -o reports/allure-report --clean

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: reports/
          retention-days: 14
```

### Selenium / Playwright Java — `.github/workflows/java-tests.yml`

```yaml
name: Java Automation Tests

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 40
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '17'
          cache: maven

      - name: Run tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
          TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
        run: mvn clean test -Dheadless=true

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: reports/
          retention-days: 14
```

---

## 7. Allure Reporting

> Tuân thủ [`.claude/rules/reporting_rules.md`](../../../rules/reporting_rules.md): metadata đầy đủ · step Tiếng Việt · ảnh cuối **mọi** test · **không** stdout.

### 7.1 Playwright + TypeScript

**`src/tests/auth/login.spec.ts`** — test mẫu đủ metadata + step + ảnh cuối

```typescript
import { allure } from 'allure-playwright';
import { test, expect } from '../../fixtures/base.fixture';
import { env } from '../../utils/env.config';

test.describe('Đăng nhập', () => {
  test.afterEach(async ({ page }, testInfo) => {
    const name = testInfo.status === 'passed'
      ? 'trang_thai_cuoi_cua_test'
      : 'trang_thai_khi_that_bai';

    await testInfo.attach(name, {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('Đăng nhập thành công với tài khoản admin hợp lệ', async ({ loginPage, dashboardPage }) => {
    await allure.description(
      'Kiểm tra người dùng đăng nhập bằng email và mật khẩu hợp lệ '
      + 'thì được chuyển vào Dashboard và thấy menu điều hướng.',
    );
    await allure.severity('blocker');
    await allure.tags('smoke', 'login');
    await allure.label('testId', 'CRM_LOGIN_TC_001');

    await test.step('Arrange: Mở trang Login', async () => {
      await loginPage.goto('/login');
    });

    await test.step('Act: Đăng nhập bằng tài khoản admin', async () => {
      await loginPage.login(env.username, env.password);
    });

    await test.step('Assert: Hệ thống chuyển vào Dashboard', async () => {
      await expect(dashboardPage.navigationMenu).toBeVisible();
      await dashboardPage.waitForUrl(/dashboard/);
    });
  });
});
```

**Page Object — sub-step sinh tự động**

```typescript
import { test } from '@playwright/test';

export class LoginPage extends BasePage {
  readonly emailInput = this.page.getByLabel('Email');
  readonly passwordInput = this.page.getByLabel('Mật khẩu');
  readonly submitButton = this.page.getByRole('button', { name: 'Đăng nhập' });

  /** test.step lồng trong POM → hiện thành sub-step trong report */
  async login(email: string, password: string): Promise<void> {
    await test.step(`Nhập email: ${email}`, () => this.fillField(this.emailInput, email));
    await test.step('Nhập mật khẩu', () => this.fillField(this.passwordInput, password));
    await test.step('Bấm nút Đăng nhập', () => this.clickWhenReady(this.submitButton));
  }
}
```

> Ảnh đính kèm cả khi PASS → **không** dùng `screenshot: 'only-on-failure'` trong `playwright.config.ts`.
> Để `screenshot: 'off'` và attach thủ công ở `afterEach` như trên, tránh ảnh bị đính 2 lần.

### 7.2 Pytest + Python

**`pyproject.toml`** — tắt attachment stdout/stderr + gom output vào `reports/`

```toml
[tool.pytest.ini_options]
addopts = """
    --alluredir=reports/allure-results
    --allure-no-capture
    --html=reports/html/index.html
    --self-contained-html
    -v
"""
testpaths = ["src/tests"]
log_file = "reports/logs/pytest.log"
log_file_level = "INFO"
```

**`conftest.py`** — hook đính ảnh cuối **mọi** test

```python
import allure
import pytest


@pytest.hookimpl(hookwrapper=True, tryfirst=True)
def pytest_runtest_makereport(item, call):
    """Đính ảnh trạng thái cuối cho mọi test — cả PASS lẫn FAIL."""
    outcome = yield
    report = outcome.get_result()

    if report.when != "call":
        return

    page = item.funcargs.get("page")
    if page is None:
        return

    name = "trang_thai_cuoi_cua_test" if report.passed else "trang_thai_khi_that_bai"
    allure.attach(
        page.screenshot(full_page=True),
        name=name,
        attachment_type=allure.attachment_type.PNG,
    )
```

**`src/tests/test_login.py`**

```python
import allure
import pytest

from src.pages.login_page import LoginPage
from src.pages.dashboard_page import DashboardPage


@allure.feature("Đăng nhập")
class TestLogin:

    @allure.title("Đăng nhập thành công với tài khoản admin hợp lệ")
    @allure.description(
        "Kiểm tra người dùng đăng nhập bằng email và mật khẩu hợp lệ "
        "thì được chuyển vào Dashboard và thấy menu điều hướng."
    )
    @allure.severity(allure.severity_level.BLOCKER)
    @allure.tag("smoke", "login")
    @allure.label("testId", "CRM_LOGIN_TC_001")
    def test_login_with_valid_credentials(self, page, config):
        login_page = LoginPage(page)
        dashboard_page = DashboardPage(page)

        with allure.step("Arrange: Mở trang Login"):
            login_page.goto("/login")

        with allure.step("Act: Đăng nhập bằng tài khoản admin"):
            login_page.login(config.username, config.password)

        with allure.step("Assert: Hệ thống chuyển vào Dashboard"):
            assert dashboard_page.is_navigation_visible(), \
                "Menu điều hướng phải hiển thị sau khi đăng nhập thành công"
```

**Page Object — sub-step bằng decorator**

```python
import allure


class LoginPage(BasePage):

    @allure.step("Nhập email: {email}")
    def enter_email(self, email: str) -> None:
        self.fill(self.email_input, email)

    @allure.step("Nhập mật khẩu")
    def enter_password(self, password: str) -> None:
        self.fill(self.password_input, password)

    @allure.step("Bấm nút Đăng nhập")
    def submit(self) -> None:
        self.click(self.submit_button)

    def login(self, email: str, password: str) -> None:
        self.enter_email(email)
        self.enter_password(password)
        self.submit()
```

### 7.3 TestNG + Java (Selenium / Playwright / Appium)

**`BaseTest.java`** — đính ảnh cuối **mọi** test

```java
@AfterMethod(alwaysRun = true)
public void tearDown(ITestResult result) {
    String name = result.isSuccess()
            ? "trang_thai_cuoi_cua_test"
            : "trang_thai_khi_that_bai";
    ScreenshotUtil.captureAndAttach(DriverFactory.getDriver(), name);
    DriverFactory.quitDriver();
}
```

**`LoginTest.java`**

```java
package com.project.tests;

import com.project.base.BaseTest;
import com.project.pages.DashboardPage;
import com.project.pages.LoginPage;
import io.qameta.allure.*;
import org.testng.Assert;
import org.testng.annotations.Test;

@Feature("Đăng nhập")
public class LoginTest extends BaseTest {

    @Test(groups = {"smoke", "login"}, description = "Đăng nhập thành công với tài khoản admin hợp lệ")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Kiểm tra người dùng đăng nhập bằng email và mật khẩu hợp lệ "
            + "thì được chuyển vào Dashboard và thấy menu điều hướng.")
    public void testLoginWithValidCredentials() {
        Allure.label("testId", "CRM_LOGIN_TC_001");

        LoginPage loginPage = new LoginPage(driver);
        DashboardPage dashboardPage = new DashboardPage(driver);

        Allure.step("Arrange: Mở trang Login", () -> loginPage.open());

        Allure.step("Act: Đăng nhập bằng tài khoản admin",
                () -> loginPage.login(config.getUsername(), config.getPassword()));

        Allure.step("Assert: Hệ thống chuyển vào Dashboard", () ->
                Assert.assertTrue(dashboardPage.isNavigationDisplayed(),
                        "Menu điều hướng phải hiển thị sau khi đăng nhập thành công"));
    }
}
```

**Page Object — sub-step bằng `@Step`**

```java
public class LoginPage extends BasePage {

    @Step("Nhập email: {email}")
    public void enterEmail(String email) {
        type(EMAIL_INPUT, email);
    }

    @Step("Nhập mật khẩu")
    public void enterPassword(String password) {
        type(PASSWORD_INPUT, password);
    }

    @Step("Bấm nút Đăng nhập")
    public void submit() {
        click(SUBMIT_BUTTON);
    }

    public void login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        submit();
    }
}
```

### 7.4 Gom output vào `reports/`

**Maven (`pom.xml`)** — trỏ allure-results + surefire vào `reports/`

```xml
<plugin>
  <groupId>org.apache.maven.plugins</groupId>
  <artifactId>maven-surefire-plugin</artifactId>
  <version>3.2.5</version>
  <configuration>
    <suiteXmlFiles>
      <suiteXmlFile>testng.xml</suiteXmlFile>
    </suiteXmlFiles>
    <reportsDirectory>${project.basedir}/reports/surefire</reportsDirectory>
    <systemPropertyVariables>
      <allure.results.directory>${project.basedir}/reports/allure-results</allure.results.directory>
    </systemPropertyVariables>
  </configuration>
</plugin>
```

**Log4j2 (`log4j2.xml`)** — ghi log vào `reports/logs/`

```xml
<Appenders>
  <File name="FileAppender" fileName="reports/logs/test-execution.log">
    <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss} [%t] %-5level %logger{36} - %msg%n"/>
  </File>
</Appenders>
```

**`.gitignore`** — không commit output test

```gitignore
# Test output — gom hết trong reports/
reports/

# Thư mục mặc định của tool (phòng khi config bị bỏ sót)
allure-results/
test-results/
playwright-report/
target/
__pycache__/
.env
```

**Lệnh sinh report**

```bash
allure generate reports/allure-results -o reports/allure-report --clean
```

```bash
allure generate reports/allure-results -o reports/allure-report-single --single-file --clean
```

```bash
allure open reports/allure-report
```

> ⚠️ Sau khi chạy test, kiểm tra root project **không** còn `allure-results/` / `test-results/` / `playwright-report/` lạc ra ngoài. Nếu còn nghĩa là config output chưa ăn.

---

## Checklist khi dùng template

- [ ] Đổi `com.project` thành package thật của project
- [ ] Thay locator ví dụ bằng locator **đã inspect DOM thực tế** — không dùng nguyên placeholder
- [ ] Điền `.env.example` đầy đủ key, `.env` thật **không** commit
- [ ] Xoá phần code của stack không dùng đến
- [ ] Chạy build (`npm ci` / `mvn clean compile` / `pip install -r requirements.txt`) xác nhận không lỗi
