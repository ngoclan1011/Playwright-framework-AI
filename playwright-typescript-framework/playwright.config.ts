import { defineConfig, devices, ReporterDescription } from '@playwright/test';
import { env } from './src/utils/env.config';

// `--list` không chạy globalSetup nhưng allure-playwright vẫn ghi kết quả skipped → làm bẩn report lần sau
const isListOnly = process.argv.includes('--list');

const allureReporter: ReporterDescription = ['allure-playwright', {
  resultsDir: 'reports/allure-results',
  // Bỏ bước nội bộ của Playwright (vd `Fill "<mật khẩu>"`) — chỉ giữ test.step + attachment, mật khẩu không lọt vào report
  detail: false,
  environmentInfo: { BASE_URL: env.baseURL, CRM_URL: env.crmBaseURL, WORKERS: String(env.workers), NODE: process.version },
}];

/** Cấu hình dùng chung cho cả 3 trình duyệt UI — chỉ khác `channel` / thiết bị */
const uiCommon = {
  viewport: { width: 1920, height: 1080 },
  headless: env.headless,
};

export default defineConfig({
  testDir: './src/tests',
  globalSetup: './src/global-setup.ts',
  timeout: env.timeout,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Parallel LUÔN bật — đổi số luồng ở .env (WORKERS), không sửa file này.
  // Mỗi trình duyệt UI chạy RIÊNG một lượt `playwright test` (scripts/run-browsers.mjs), nên số luồng này áp cho TỪNG trình duyệt
  workers: env.workers,
  // Mọi output gom vào reports/ — xem reporting_rules.md mục 6. Mỗi project có thư mục con riêng (đặt ở từng project bên dưới)
  outputDir: 'reports/test-artifacts',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ...(isListOnly ? [] : [allureReporter]),
  ],
  use: {
    baseURL: env.baseURL,
    // Ảnh cuối test được attach thủ công trong fixture cho CẢ pass lẫn fail — tránh đính 2 lần
    screenshot: 'off',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
  projects: [
    // Test giao diện Book chạy trên 3 trình duyệt — cùng một bộ test, khác trình duyệt.
    // Chạy lần lượt từng trình duyệt: `npm run test:ui` (xem scripts/run-browsers.mjs)
    {
      name: 'ui-chrome',
      testDir: './src/tests/ui',
      outputDir: 'reports/test-artifacts/ui-chrome',
      // `channel: 'chrome'` dùng Google Chrome cài trên máy
      use: { ...devices['Desktop Chrome'], channel: 'chrome', ...uiCommon },
    },
    {
      name: 'ui-edge',
      testDir: './src/tests/ui',
      outputDir: 'reports/test-artifacts/ui-edge',
      // `channel: 'msedge'` dùng Microsoft Edge cài trên máy
      use: { ...devices['Desktop Edge'], channel: 'msedge', ...uiCommon },
    },
    {
      name: 'ui-firefox',
      testDir: './src/tests/ui',
      outputDir: 'reports/test-artifacts/ui-firefox',
      // Firefox của Playwright — cài bằng `npx playwright install firefox`
      use: { ...devices['Desktop Firefox'], ...uiCommon },
    },
    {
      // Hệ thống thứ hai: Perfex CRM — baseURL riêng, không đụng project ui/api của Book
      name: 'crm',
      testDir: './src/tests/crm',
      outputDir: 'reports/test-artifacts/crm',
      use: {
        ...devices['Desktop Chrome'],
        // `channel: 'chrome'` dùng Google Chrome cài trên máy — không cần tải Chromium của Playwright
        channel: 'chrome',
        baseURL: env.crmBaseURL,
        viewport: { width: 1920, height: 1080 },
        headless: env.headless,
      },
    },
    {
      // CRM_LOGIN_TC_050 — cùng một test chạy thêm trên Edge và Firefox (Chrome đã nằm trong project 'crm')
      name: 'crm-edge',
      testDir: './src/tests/crm',
      testMatch: /login-browsers\.spec\.ts/,
      outputDir: 'reports/test-artifacts/crm-edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        baseURL: env.crmBaseURL,
        viewport: { width: 1920, height: 1080 },
        headless: env.headless,
      },
    },
    {
      name: 'crm-firefox',
      testDir: './src/tests/crm',
      testMatch: /login-browsers\.spec\.ts/,
      outputDir: 'reports/test-artifacts/crm-firefox',
      use: {
        ...devices['Desktop Firefox'],
        baseURL: env.crmBaseURL,
        viewport: { width: 1920, height: 1080 },
        headless: env.headless,
      },
    },
    {
      // Test API chỉ dùng fixture `request` → không mở trình duyệt
      name: 'api',
      testDir: './src/tests/api',
      outputDir: 'reports/test-artifacts/api',
    },
  ],
});
