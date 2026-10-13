import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { TestData } from '../../../utils/test-data';
import { expect, test } from '../../../fixtures/ui.fixture';
import { DASHBOARD_URL, INVALID_CREDENTIALS, LOGIN_URL } from './login-flow';

// Cùng một test chạy ở 3 project: crm (Chrome) · crm-edge · crm-firefox — mỗi trình duyệt là một biến thể a/b/c của TC
test.describe('CRM · Đăng nhập — Tương thích trình duyệt', () => {
  test('Luồng đăng nhập chạy được trên các trình duyệt đã cam kết hỗ trợ', {
    tag: ['@regression', '@compatibility', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }, testInfo) => {
    await meta({
      id: 'CRM_LOGIN_TC_050',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Trên Chrome (a), Edge (b), Firefox (c): đủ 7 thành phần của biểu mẫu, đăng nhập đúng vào /admin/, '
        + 'đăng xuất rồi đăng nhập sai thì hiện đúng 1 dải "Invalid email or password".',
    });
    const { email, password } = env.crmAdmin();

    await test.step(`Arrange: Mở trang đăng nhập trên trình duyệt của project ${testInfo.project.name}`, async () => {
      await crmLoginPage.open();
    });

    await test.step('Assert: Thấy đủ 7 thành phần, bố cục không vỡ', async () => {
      for (const [name, element] of Object.entries(crmLoginPage.sevenComponents())) {
        await expect.soft(element, `Thành phần "${name}" phải hiển thị`).toBeVisible();
      }
    });

    await test.step('Act: Đăng nhập bằng tài khoản Admin đúng', async () => {
      await crmLoginPage.login(email, password);
    });

    await test.step('Assert: Vào đúng /admin/', async () => {
      await expect(page, 'Phải vào /admin/').toHaveURL(DASHBOARD_URL);
    });

    await test.step('Act: Đăng xuất rồi đăng nhập lại với mật khẩu sai', async () => {
      await crmLoginPage.logoutByUrl();
      await crmLoginPage.open();
      await crmLoginPage.fillCredentials(email, TestData.wrongPassword('tc050'));
      await crmLoginPage.clickLoginAndWaitForPage();
    });

    await test.step('Assert: Đúng 1 dải "Invalid email or password"', async () => {
      await expect(page, 'Phải ở lại trang đăng nhập').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.alerts, 'Phải đúng 1 dải báo lỗi chung').toHaveText([INVALID_CREDENTIALS]);
    });
  });
});
