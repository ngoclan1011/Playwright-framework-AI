import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';
import { DASHBOARD_URL, LOGIN_URL } from './login-flow';

test.describe('CRM · Đăng nhập — Giao thức và điều kiện mạng', () => {
  test('Truy cập trang đăng nhập qua HTTP thuần phải bị ép chuyển hướng sang HTTPS', {
    tag: ['@regression', '@security', '@knownbug', '@techcheck', '@login', '@crm'],
  }, async ({ request }) => {
    await meta({
      id: 'CRM_LOGIN_TC_039',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: '🐞 Bug đang mở BUG_login_1785678750_TC039: gọi trang đăng nhập qua http:// phải bị chuyển hướng 301/308 sang https://. '
        + 'Đo trực tiếp ở tầng HTTP (không qua Chrome để tránh tự nâng cấp HTTPS làm PASS giả). Hiện trạng trả 200 — FAIL là kết quả đúng.',
    });
    const httpUrl = `${env.crmBaseURL.replace(/^https:/, 'http:')}/admin/authentication`;

    const response = await test.step('Act: Gọi trang đăng nhập bằng giao thức http thuần, không theo chuyển hướng', async () => {
      return request.get(httpUrl, { maxRedirects: 0, headers: { Accept: 'text/html' } });
    });

    await test.step('Assert: Máy chủ phải trả 301/308 kèm Location sang https', async () => {
      expect([301, 308], 'Request http đầu tiên phải được chuyển hướng cố định (301/308), không được trả nội dung trang')
        .toContain(response.status());
      expect(response.headers()['location'] ?? '', 'Header Location phải trỏ sang https://').toMatch(new RegExp(`^${env.crmBaseURL}/admin/authentication`));
    });
  });

  test('Mất kết nối mạng giữa lúc gửi biểu mẫu thì không tạo phiên', {
    tag: ['@regression', '@networkresilience', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page, context }) => {
    await meta({
      id: 'CRM_LOGIN_TC_040',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Ngắt mạng sau khi nhập đúng tài khoản rồi bấm Login: request không gửi được, ứng dụng không hiện dải thông báo sai lệch; '
        + 'bật lại mạng và mở /admin/ thì vẫn bị đưa về trang đăng nhập — không phiên nào được tạo.',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Mở trang đăng nhập đã tải xong, nhập đúng tài khoản Admin', async () => {
      await crmLoginPage.open();
      await crmLoginPage.fillCredentials(email, password);
    });

    await test.step('Act: Ngắt kết nối mạng rồi bấm Login', async () => {
      await context.setOffline(true);
      const failed = page.waitForEvent('requestfailed', request => request.method() === 'POST');
      await crmLoginPage.clickLoginButton();
      await failed;
    });

    await test.step('Act: Bật lại mạng rồi mở thẳng /admin/', async () => {
      await context.setOffline(false);
      await page.goto('/admin/');
    });

    await test.step('Assert: Không phiên nào được tạo — bị đưa về trang đăng nhập, không dải thông báo sai lệch', async () => {
      await expect(page, 'Phải bị đưa về /admin/authentication').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.alerts, 'Không được có dải thông báo nào').toHaveCount(0);
    });
  });

  test('Đăng nhập trên đường truyền chậm vẫn hoàn tất và vào đúng Dashboard', {
    tag: ['@regression', '@networkresilience', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_041',
      feature: 'CRM · Đăng nhập',
      severity: 'minor',
      description: 'Giả lập mạng Slow 3G, bấm Login một lần duy nhất: không báo hết thời gian chờ, '
        + 'đăng nhập vẫn hoàn tất và dừng ở /admin/ với tab có chữ Dashboard.',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Mở trang đăng nhập rồi bật giả lập mạng Slow 3G', async () => {
      await crmLoginPage.open();
      await crmLoginPage.emulateSlow3G();
    });

    await test.step('Act: Nhập đúng tài khoản Admin, bấm Login một lần duy nhất', async () => {
      await crmLoginPage.login(email, password);
    });

    await test.step('Assert: Đăng nhập hoàn tất, vào đúng Dashboard', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      await expect(page, 'Tab trình duyệt phải có chữ Dashboard').toHaveTitle(/Dashboard/);
    });
  });
});
