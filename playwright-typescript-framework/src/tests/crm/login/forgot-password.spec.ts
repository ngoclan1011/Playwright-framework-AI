import variants from '../../../../test-data/crm-login-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { TestData } from '../../../utils/test-data';
import { expect, test } from '../../../fixtures/ui.fixture';
import { EMAIL_REQUIRED, FORGOT_PASSWORD_URL } from './login-flow';

test.describe('CRM · Đăng nhập — Quên mật khẩu', () => {
  test('Trang Quên mật khẩu mở đúng, đủ thành phần và không có lối quay lại đăng nhập', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage, crmForgotPasswordPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_027',
      feature: 'CRM · Quên mật khẩu',
      severity: 'critical',
      description: 'Bấm "Forgot Password?" từ trang đăng nhập: URL đúng, có tiêu đề, đúng 1 ô Email Address, nút Confirm rộng hết khối, '
        + 'không có liên kết nào dẫn ngược về trang đăng nhập; biểu mẫu POST đúng đích, có mã CSRF 32 ký tự hex.',
    });

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Bấm liên kết Forgot Password?', async () => {
      await crmLoginPage.clickForgotPassword();
    });

    await test.step('Assert: Mục 1 — URL dừng đúng ở trang Quên mật khẩu', async () => {
      await expect(page, 'Thanh địa chỉ phải dừng ở /admin/authentication/forgot_password').toHaveURL(FORGOT_PASSWORD_URL);
    });

    await test.step('Assert: Mục 2 — đủ tiêu đề, 1 ô Email Address, nút Confirm chiếm hết chiều ngang khối', async () => {
      await expect(crmForgotPasswordPage.heading, 'Phải có tiêu đề "Forgot Password"').toBeVisible();
      await expect(crmForgotPasswordPage.emailInput, 'Phải có đúng 1 ô nhập nhãn Email Address').toHaveCount(1);
      const inputBox = await crmForgotPasswordPage.emailInput.boundingBox();
      const buttonBox = await crmForgotPasswordPage.confirmButton.boundingBox();
      expect(Math.abs(buttonBox!.width - inputBox!.width),
        'Nút Confirm phải rộng bằng ô nhập (chiếm hết chiều ngang khối)').toBeLessThanOrEqual(2);
    });

    await test.step('Assert: Mục 3 — không có liên kết nào dẫn ngược về trang đăng nhập, chỉ còn logo', async () => {
      await expect(crmForgotPasswordPage.allLinks, 'Toàn trang chỉ được có đúng 1 liên kết (logo)').toHaveCount(1);
      await expect(crmForgotPasswordPage.allLinks, 'Liên kết duy nhất phải là logo dẫn về trang chủ')
        .toHaveAttribute('href', `${env.crmBaseURL}/`);
    });

    await test.step('Assert: 🔧 Kỹ thuật — form POST đúng đích và có mã CSRF 32 ký tự hex', async () => {
      await expect(crmForgotPasswordPage.form, 'Action của form phải trỏ về chính trang Quên mật khẩu')
        .toHaveAttribute('action', FORGOT_PASSWORD_URL);
      await expect(crmForgotPasswordPage.form, 'Method của form phải là post').toHaveAttribute('method', 'post');
      await expect(crmForgotPasswordPage.csrfInput, 'Phải có đúng 1 input ẩn csrf_token_name').toHaveCount(1);
      expect(/^[0-9a-f]{32}$/.test(await crmForgotPasswordPage.csrfInput.inputValue()),
        'Mã CSRF phải đủ 32 ký tự hex (giá trị không ghi vào report)').toBe(true);
    });
  });

  test('Bỏ trống email rồi bấm Confirm phải báo thiếu trường bắt buộc', {
    tag: ['@regression', '@knownbug', '@login', '@crm'],
  }, async ({ crmForgotPasswordPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_028',
      feature: 'CRM · Quên mật khẩu',
      severity: 'critical',
      description: '🐞 Bug đang mở BUG_login_1787226516_TC028: bỏ trống email rồi bấm Confirm phải báo "The Email Address field is required.". '
        + 'Hiện trạng hệ thống trả "Email not found" — FAIL là kết quả đúng, không sửa test.',
    });

    await test.step('Arrange: Mở trang Quên mật khẩu, ô email rỗng', async () => {
      await crmForgotPasswordPage.open();
      await expect(crmForgotPasswordPage.emailInput, 'Ô Email Address phải đang rỗng').toHaveValue('');
    });

    await test.step('Act: Bấm nút Confirm', async () => {
      await crmForgotPasswordPage.confirmAndWaitForPage();
    });

    await test.step('Assert: Đúng 1 dải báo thiếu trường bắt buộc, ở lại trang Quên mật khẩu', async () => {
      await expect(crmForgotPasswordPage.alerts,
        `Phải đúng 1 dải, nguyên văn "${EMAIL_REQUIRED}"`).toHaveText([EMAIL_REQUIRED]);
      await expect(page, 'Phải ở lại trang Quên mật khẩu').toHaveURL(FORGOT_PASSWORD_URL);
    });
  });

  test('Nhập email không tồn tại trong hệ thống thì báo không tìm thấy', {
    tag: ['@regression', '@knownbug', '@login', '@crm'],
  }, async ({ crmForgotPasswordPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_029',
      feature: 'CRM · Quên mật khẩu',
      severity: 'critical',
      description: 'Gửi email không tồn tại ở Quên mật khẩu: trang nạp lại, đúng 1 dải "Email not found", ở lại trang và ô Email trở về rỗng. '
        + '🐞 Bug đang mở BUG_login_1787226517_TC029: hiện trạng ô Email không tự rỗng.',
    });

    await test.step('Arrange: Mở trang Quên mật khẩu', async () => {
      await crmForgotPasswordPage.open();
    });

    await test.step('Act: Nhập email không tồn tại, bấm Confirm', async () => {
      await crmForgotPasswordPage.submitEmailAndWaitForPage(TestData.email('tc029'));
    });

    await test.step('Assert: Đúng 1 dải "Email not found", ở lại trang', async () => {
      await expect(crmForgotPasswordPage.alerts, 'Phải đúng 1 dải, nguyên văn "Email not found"').toHaveText(['Email not found']);
      await expect(page, 'Phải ở lại trang Quên mật khẩu').toHaveURL(FORGOT_PASSWORD_URL);
    });

    await test.step('Assert: Ô Email trở về rỗng', async () => {
      await expect(crmForgotPasswordPage.emailInput, 'Ô Email phải trở về rỗng sau khi gửi').toHaveValue('');
    });
  });

  test('Email sai định dạng ở trang Quên mật khẩu bị trình duyệt chặn', {
    tag: ['@regression', '@boundary', '@techcheck', '@login', '@crm'],
  }, async ({ crmForgotPasswordPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_030',
      feature: 'CRM · Quên mật khẩu',
      severity: 'normal',
      description: 'Nhập "abc" vào ô Email ở Quên mật khẩu rồi bấm Confirm: trình duyệt chặn tại ô, không có request POST, '
        + 'trang không nạp lại, chữ còn nguyên, không dải báo lỗi của hệ thống.',
    });
    const invalidEmail = 'abc';

    await test.step('Arrange: Mở trang Quên mật khẩu, bắt đầu theo dõi request gửi đi', async () => {
      await crmForgotPasswordPage.open();
    });
    const posts = crmForgotPasswordPage.watchPostRequests();

    await test.step('Act: Nhập email sai định dạng, bấm Confirm', async () => {
      await crmForgotPasswordPage.submitEmail(invalidEmail);
    });
    posts.stop();

    await test.step('Assert: Bị trình duyệt chặn — không gửi request, không nạp lại, chữ còn nguyên', async () => {
      const emailIsInvalid = await crmForgotPasswordPage.emailInput.evaluate(el => !(el as HTMLInputElement).validity.valid);
      expect(emailIsInvalid, 'Trình duyệt phải đánh dấu ô Email không hợp lệ (bong bóng cảnh báo)').toBe(true);
      expect(posts.urls, 'Không được có request POST nào gửi lên máy chủ').toHaveLength(0);
      await expect(page, 'Trang không được chuyển hướng').toHaveURL(FORGOT_PASSWORD_URL);
      await expect(crmForgotPasswordPage.emailInput, 'Chữ "abc" phải còn nguyên trong ô').toHaveValue(invalidEmail);
      await expect(crmForgotPasswordPage.alerts, 'Không được hiện dải báo lỗi của hệ thống').toHaveCount(0);
    });
  });

  test('Mở liên kết đặt lại mật khẩu không hợp lệ thì máy chủ trả lỗi 500 với thân rỗng', {
    tag: ['@regression', '@login', '@crm'],
  }, async ({ request }) => {
    await meta({
      id: 'CRM_LOGIN_TC_031',
      feature: 'CRM · Quên mật khẩu',
      severity: 'normal',
      description: 'Mở liên kết reset_password với mã khoá sai (a) hoặc mã người dùng không tồn tại (b): máy chủ trả HTTP 500 với thân rỗng — '
        + 'hành vi được chấp nhận theo quyết định 18-08-2026 (AMB-LOGIN-03).',
    });

    for (const data of variants.tc031) {
      await test.step(`Biến thể CRM_LOGIN_TC_031-${data.variant} — ${data.title}`, async () => {
        const response = await test.step('Act: Gọi thẳng liên kết đặt lại mật khẩu không hợp lệ', async () => {
          return request.get(`${env.crmBaseURL}${data.path}`, { maxRedirects: 0, headers: { Accept: 'text/html' } });
        });

        await test.step('Assert: HTTP 500 và thân phản hồi rỗng', async () => {
          expect.soft(response.status(), `[${data.variant}] Máy chủ phải trả HTTP 500`).toBe(500);
          expect.soft((await response.body()).length, `[${data.variant}] Thân phản hồi phải rỗng`).toBe(0);
        });
      });
    }
  });
});
