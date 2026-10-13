import variants from '../../../../test-data/crm-login-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';
import { DASHBOARD_URL } from './login-flow';

const CSRF_SHAPE = /^[0-9a-f]{32}$/;

test.describe('CRM · Đăng nhập — Mã chống CSRF của biểu mẫu', () => {
  test('Biểu mẫu đăng nhập mang mã chống CSRF đúng hình thái và gửi kèm khi submit', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_024',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Biểu mẫu có đúng 1 mã csrf_token_name dài 32 ký tự hex, giữ nguyên sau F5 trong cùng phiên, '
        + 'và request đăng nhập gửi đủ 4 tham số csrf_token_name, email, password, remember; đăng nhập vẫn thành công.',
    });
    const { email, password } = env.crmAdmin();
    let tokenBeforeReload = '';

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    await test.step('Assert: 🔧 Có đúng 1 mã ẩn, dài 32 ký tự hex', async () => {
      await expect(crmLoginPage.csrfInput, 'Phải có đúng 1 input ẩn csrf_token_name').toHaveCount(1);
      tokenBeforeReload = await crmLoginPage.csrfInput.inputValue();
      expect(CSRF_SHAPE.test(tokenBeforeReload), 'Mã chống CSRF phải khớp hình thái 32 ký tự hex (giá trị không ghi vào report)').toBe(true);
    });

    await test.step('Act: Nhấn F5 nạp lại trang', async () => {
      await page.reload({ waitUntil: 'domcontentloaded' });
    });

    await test.step('Assert: 🔧 Mã giữ nguyên trong cùng một phiên', async () => {
      const tokenAfterReload = await crmLoginPage.csrfInput.inputValue();
      expect(tokenAfterReload === tokenBeforeReload, 'Sau F5 trong cùng phiên, mã chống CSRF phải giữ nguyên').toBe(true);
    });

    await test.step('Act: Nhập tài khoản Admin, tích Remember me', async () => {
      await crmLoginPage.fillCredentials(email, password);
      await crmLoginPage.clickRememberLabel();
    });

    await test.step('Assert: Ô Remember me đã được tích', async () => {
      await expect(crmLoginPage.rememberCheckbox, 'Ô Remember me phải được tích').toBeChecked();
    });

    const params = await test.step('Act: Bấm Login', async () => crmLoginPage.clickLoginAndCapturePostParams());

    await test.step('Assert: Đăng nhập thành công và request gửi đủ 4 tham số', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      for (const name of ['csrf_token_name', 'email', 'password', 'remember']) {
        expect(params.has(name), `Thân POST phải chứa tham số ${name}`).toBe(true);
      }
    });
  });

  // TC gộp 2 biến thể → 1 test; sửa mã ẩn bằng script thay cho DevTools của tester
  test('Gửi biểu mẫu với mã CSRF không hợp lệ thì bị chặn, không xử lý đăng nhập', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_025',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Sửa mã CSRF ẩn thành chuỗi 0 (a) hoặc xoá rỗng (b) rồi gửi đúng tài khoản Admin: chuyển sang trang lỗi, '
        + 'tab ghi "Error", hiển thị "419 Page Expired!" kèm câu hướng dẫn, không vào được /admin/.',
    });
    const { email, password } = env.crmAdmin();

    for (const data of variants.tc025) {
      await test.step(`Biến thể CRM_LOGIN_TC_025-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        await test.step('Act: Sửa mã CSRF ẩn, nhập tài khoản Admin đúng, bấm Login', async () => {
          await crmLoginPage.tamperCsrfToken(data.token);
          await crmLoginPage.fillCredentials(email, password);
          await crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Hiện trang lỗi 419, không đăng nhập được', async () => {
          await expect.soft(page, `[${data.variant}] Tab trình duyệt phải ghi "Error"`).toHaveTitle('Error');
          await expect.soft(crmLoginPage.pageExpiredMessage, `[${data.variant}] Phải hiện dòng "419 Page Expired!"`).toBeVisible();
          await expect.soft(crmLoginPage.pageExpiredDetail, `[${data.variant}] Phải hiện câu hướng dẫn tải lại trang`).toBeVisible();
          expect.soft(page.url(), `[${data.variant}] Không được vào /admin/`).not.toBe(DASHBOARD_URL);
        });
      });
    }
  });
});
