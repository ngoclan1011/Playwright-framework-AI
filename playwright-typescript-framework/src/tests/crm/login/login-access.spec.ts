import variants from '../../../../test-data/crm-login-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';
import { CLIENTS_URL, DASHBOARD_URL, LOGIN_PAGE_TITLE, LOGIN_URL } from './login-flow';

test.describe('CRM · Đăng nhập — Phiên & điều hướng khi chưa / đã đăng nhập', () => {
  test('Mở thẳng URL nội bộ khi chưa đăng nhập thì bị đưa về trang đăng nhập', {
    tag: ['@smoke', '@regression', '@security', '@login', '@crm'],
  }, async ({ crmLoginPage, crmDashboardPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_021',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Chưa đăng nhập, gõ thẳng /admin/clients (a) và /admin/ (b): tự chuyển về /admin/authentication, '
        + 'tab ghi "Perfex CRM | Anh Tester Demo - Login", thấy biểu mẫu đăng nhập và không thấy menu nghiệp vụ nào.',
    });
    const cases = [
      { variant: 'a', title: 'Danh sách khách hàng', url: CLIENTS_URL },
      { variant: 'b', title: 'Trang Dashboard', url: DASHBOARD_URL },
    ];

    for (const data of cases) {
      await test.step(`Biến thể CRM_LOGIN_TC_021-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Xoá mọi phiên, bảo đảm chưa đăng nhập', async () => {
          await page.context().clearCookies();
        });

        await test.step('Act: Gõ thẳng URL nội bộ vào thanh địa chỉ', async () => {
          await page.goto(data.url);
        });

        await test.step('Assert: Bị đưa về trang đăng nhập, không thấy nội dung nghiệp vụ', async () => {
          await expect.soft(page, `[${data.variant}] Phải dừng ở /admin/authentication`).toHaveURL(LOGIN_URL);
          await expect.soft(page, `[${data.variant}] Tab trình duyệt phải ghi đúng tiêu đề trang đăng nhập`).toHaveTitle(LOGIN_PAGE_TITLE);
          await expect.soft(crmLoginPage.heading, `[${data.variant}] Phải hiển thị biểu mẫu đăng nhập`).toBeVisible();
          await expect.soft(crmDashboardPage.sideMenu, `[${data.variant}] Không được thấy menu nghiệp vụ nào`).toHaveCount(0);
        });
      });
    }
  });

  test('Bị chuyển về trang đăng nhập thì không giữ lại URL đích ban đầu', {
    tag: ['@regression', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_022',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Gõ thẳng /admin/clients khi chưa đăng nhập: URL trang đăng nhập trần, không có tham số redirect; '
        + 'đăng nhập xong vào Dashboard chứ không quay lại /admin/clients.',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Gõ thẳng /admin/clients khi chưa đăng nhập', async () => {
      await page.goto(CLIENTS_URL);
    });

    await test.step('Assert: URL trang đăng nhập trần, không giữ URL đích', async () => {
      await expect(page, 'URL phải đúng bằng /admin/authentication, không có ?redirect= / ?return_url= / ?next=').toHaveURL(LOGIN_URL);
      expect(new URL(page.url()).search, 'Không được có tham số nào sau dấu ?').toBe('');
    });

    await test.step('Act: Đăng nhập bằng tài khoản Admin', async () => {
      await crmLoginPage.login(email, password);
    });

    await test.step('Assert: Vào Dashboard, không tự quay lại /admin/clients', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      await expect(page, 'Tab trình duyệt phải có chữ Dashboard').toHaveTitle(/Dashboard/);
    });
  });

  test('Đang có phiên thì mở trang đăng nhập hoặc Quên mật khẩu đều bị đưa về Dashboard', {
    tag: ['@regression', '@permission', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, crmForgotPasswordPage, crmDashboardPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_023',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Đã đăng nhập (Admin, Project Manager) rồi gõ thẳng /admin/authentication hoặc /admin/authentication/forgot_password: '
        + 'tự chuyển về /admin/, tab có chữ Dashboard, không hiển thị biểu mẫu nào; body mang đúng class user-id của vai trò.',
    });
    const accounts = { admin: env.crmAdmin(), pm: env.crmProjectManager() };

    for (const data of variants.tc023) {
      await test.step(`Biến thể CRM_LOGIN_TC_023-${data.variant} — ${data.title}`, async () => {
        await test.step(`Arrange: Đăng nhập bằng vai trò ${data.role}`, async () => {
          await crmLoginPage.logoutByUrl();
          await crmLoginPage.open();
          const { email, password } = accounts[data.role as 'admin' | 'pm'];
          await crmLoginPage.login(email, password);
          await expect(page, `[${data.variant}] Đăng nhập tiền đề phải vào Dashboard`).toHaveURL(DASHBOARD_URL);
        });

        await test.step('Act: Gõ thẳng URL của biến thể vào thanh địa chỉ', async () => {
          await page.goto(data.path);
        });

        await test.step('Assert: Tự chuyển về Dashboard, không hiển thị biểu mẫu nào', async () => {
          await expect.soft(page, `[${data.variant}] Phải dừng ở /admin/`).toHaveURL(DASHBOARD_URL);
          await expect.soft(page, `[${data.variant}] Tab trình duyệt phải có chữ Dashboard`).toHaveTitle(/Dashboard/);
          await expect.soft(crmLoginPage.heading, `[${data.variant}] Không được hiển thị biểu mẫu đăng nhập`).toHaveCount(0);
          await expect.soft(crmForgotPasswordPage.heading, `[${data.variant}] Không được hiển thị biểu mẫu Quên mật khẩu`).toHaveCount(0);
          await expect.soft(crmDashboardPage.body,
            `[${data.variant}] 🔧 body phải mang class ${data.userClass}`).toHaveClass(new RegExp(`\\b${data.userClass}\\b`));
        });
      });
    }
  });
});
