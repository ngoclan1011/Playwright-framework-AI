import { CrmClientLoginPage } from '../pages/crm/crm-client-login.page';
import { CrmDashboardPage } from '../pages/crm/crm-dashboard.page';
import { CrmForgotPasswordPage } from '../pages/crm/crm-forgot-password.page';
import { CrmLoginPage } from '../pages/crm/crm-login.page';
import { CrmTasksPage } from '../pages/crm/crm-tasks.page';
import { SignInPage } from '../pages/sign-in.page';
import { SignUpPage } from '../pages/sign-up.page';
import { test as apiTest } from './api.fixture';

type UiFixtures = {
  signUpPage: SignUpPage;
  signInPage: SignInPage;
  crmLoginPage: CrmLoginPage;
  crmDashboardPage: CrmDashboardPage;
  crmForgotPasswordPage: CrmForgotPasswordPage;
  crmClientLoginPage: CrmClientLoginPage;
  crmTasksPage: CrmTasksPage;
  finalScreenshot: void;
};

/** Kế thừa fixture API → test UI gọi được API để chuẩn bị / kiểm chứng dữ liệu */
export const test = apiTest.extend<UiFixtures>({
  signUpPage: async ({ page }, use) => use(new SignUpPage(page)),
  signInPage: async ({ page }, use) => use(new SignInPage(page)),
  crmLoginPage: async ({ page }, use) => use(new CrmLoginPage(page)),
  crmDashboardPage: async ({ page }, use) => use(new CrmDashboardPage(page)),
  crmForgotPasswordPage: async ({ page }, use) => use(new CrmForgotPasswordPage(page)),
  crmClientLoginPage: async ({ page }, use) => use(new CrmClientLoginPage(page)),
  crmTasksPage: async ({ page }, use) => use(new CrmTasksPage(page)),

  // Ảnh cuối MỌI test, cả PASS lẫn FAIL (reporting_rules.md mục 3)
  finalScreenshot: [async ({ page }, use, testInfo) => {
    await use();
    const passed = testInfo.status === testInfo.expectedStatus;
    await testInfo.attach(passed ? 'trang_thai_cuoi_cua_test' : 'trang_thai_khi_that_bai', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  }, { auto: true }],
});

export { expect } from './api.fixture';
