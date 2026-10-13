import variants from '../../../../test-data/crm-login-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';
import { EMAIL_NOT_VALID, INVALID_CREDENTIALS, LOGIN_URL } from './login-flow';

const PASSWORD = 'Abc12345';

test.describe('CRM · Đăng nhập — Giá trị biên của ô nhập', () => {
  test('Email có phần trước dấu @ dài tới đúng mốc 64 ký tự vẫn được coi là đúng định dạng', {
    tag: ['@regression', '@boundary', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_045',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Email có phần trước @ dài 63 (a) và đúng 64 ký tự (b): hệ thống coi là đúng định dạng và chỉ từ chối ở bước xác thực — '
        + 'ô giữ đủ ký tự, đúng 1 dải "Invalid email or password".',
    });

    for (const data of variants.tc045) {
      const email = `${'a'.repeat(data.localPartLength)}@${data.domain}`;
      await test.step(`Biến thể CRM_LOGIN_TC_045-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        await test.step('Act: Nhập email biên và mật khẩu', async () => {
          await crmLoginPage.fillCredentials(email, PASSWORD);
        });

        await test.step('Assert: Ô Email giữ đủ số ký tự đã nhập, không bị cắt bớt', async () => {
          expect.soft((await crmLoginPage.emailInput.inputValue()).length,
            `[${data.variant}] Ô Email phải giữ đủ ${email.length} ký tự đã dán`).toBe(email.length);
        });

        await test.step('Act: Bấm Login', async () => {
          await crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Không vào Dashboard, đúng 1 dải của bước xác thực', async () => {
          await expect.soft(page, `[${data.variant}] Không được vào Dashboard`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.alerts,
            `[${data.variant}] Phải đúng 1 dải "${INVALID_CREDENTIALS}" (đã qua bước kiểm định dạng)`).toHaveText([INVALID_CREDENTIALS]);
        });
      });
    }
  });

  test('Email có phần trước dấu @ vượt mốc 64 ký tự bị máy chủ chặn ở bước kiểm tra định dạng', {
    tag: ['@regression', '@boundary', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_046',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Email có phần trước @ dài 65, 100 và 250 ký tự: bị chặn ở bước kiểm tra định dạng với dải '
        + '"The Email Address field must contain a valid email address." — khác hẳn dải của bước xác thực. Mốc 64 theo RFC 5321.',
    });

    for (const data of variants.tc046) {
      const email = `${'a'.repeat(data.localPartLength)}@${data.domain}`;
      await test.step(`Biến thể CRM_LOGIN_TC_046-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        await test.step('Act: Nhập email vượt mốc và mật khẩu, bấm Login', async () => {
          await crmLoginPage.fillCredentials(email, PASSWORD);
          await crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Không vào Dashboard, bị chặn ở bước kiểm tra định dạng', async () => {
          await expect.soft(page, `[${data.variant}] Không được vào Dashboard`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.alerts,
            `[${data.variant}] Phải đúng 1 dải "${EMAIL_NOT_VALID}", khác dải của bước xác thực`).toHaveText([EMAIL_NOT_VALID]);
        });
      });
    }
  });

  test('Mật khẩu rất dài không làm hệ thống lỗi và vẫn trả đúng thông báo xác thực', {
    tag: ['@regression', '@boundary', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_047',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Mật khẩu dài 256 (a) và 1000 ký tự (b) cùng email admin: trang nạp lại bình thường (HTTP 200), '
        + 'không trang lỗi, không lộ dấu vết lỗi máy chủ, đúng 1 dải "Invalid email or password".',
    });
    const { email } = env.crmAdmin();

    for (const data of variants.tc047) {
      await test.step(`Biến thể CRM_LOGIN_TC_047-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        const response = await test.step('Act: Nhập mật khẩu rất dài, bấm Login', async () => {
          await crmLoginPage.fillCredentials(email, 'p'.repeat(data.length));
          return crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Trang nạp lại bình thường, đúng 1 dải xác thực, không lộ lỗi máy chủ', async () => {
          expect.soft(response?.status(), `[${data.variant}] Phản hồi phải là HTTP 200`).toBe(200);
          await expect.soft(page, `[${data.variant}] Phải ở lại trang đăng nhập`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.alerts, `[${data.variant}] Phải đúng 1 dải "${INVALID_CREDENTIALS}"`).toHaveText([INVALID_CREDENTIALS]);
          const text = (await crmLoginPage.visibleText()).toLowerCase();
          for (const trace of ['fatal error', 'stack trace', 'sql syntax', 'mysqli']) {
            expect.soft(text, `[${data.variant}] Không được lộ dấu vết lỗi máy chủ "${trace}"`).not.toContain(trace);
          }
        });
      });
    }
  });
});
