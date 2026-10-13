import invalidCases from '../../../../test-data/sign-in-invalid.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { TestData } from '../../../utils/test-data';
import { expect, test } from '../../../fixtures/ui.fixture';

test.describe('Đăng nhập', () => {
  test('Trang Đăng nhập hiển thị đủ trường, ô Password che ký tự', {
    tag: ['@smoke', '@ui', '@signin'],
  }, async ({ signInPage, page }) => {
    await meta({
      id: 'BOOK_AUTH_TC_003',
      feature: 'Đăng nhập',
      severity: 'critical',
      description: 'Mở trang Sign in khi chưa đăng nhập: hiển thị ô Email address, ô Password (che ký tự), '
        + 'nút Login account và liên kết Get started.',
    });

    await test.step('Arrange: Mở trang Sign in', async () => {
      await signInPage.open();
    });

    await test.step('Assert: Tiêu đề trang và các thành phần hiển thị đủ', async () => {
      await expect(page, 'Tiêu đề tab phải chứa "Sign in"').toHaveTitle(/Sign in/);
      await expect(signInPage.heading, 'Phải thấy tiêu đề "Sign in"').toBeVisible();
      await expect(signInPage.emailInput, 'Ô Email address phải rỗng khi mới mở').toHaveValue('');
      await expect(signInPage.passwordInput, 'Ô Password phải che ký tự').toHaveAttribute('type', 'password');
      await expect(signInPage.loginButton, 'Nút Login account phải bấm được').toBeEnabled();
      await expect(signInPage.getStartedLink, 'Phải có liên kết Get started').toBeVisible();
    });
  });

  test('Bấm "Get started" chuyển sang trang Đăng ký', {
    tag: ['@regression', '@ui', '@signin'],
  }, async ({ signInPage, signUpPage, page }) => {
    await meta({
      id: 'BOOK_AUTH_TC_004',
      feature: 'Đăng nhập',
      severity: 'normal',
      description: 'Người chưa có tài khoản bấm liên kết Get started ở trang Sign in thì được đưa sang trang Sign up.',
    });

    await test.step('Arrange: Mở trang Sign in', async () => {
      await signInPage.open();
    });

    await test.step('Act: Bấm liên kết Get started', async () => {
      await signInPage.goToSignUp();
    });

    await test.step('Assert: Trang Sign up hiển thị', async () => {
      await expect(page, 'URL phải chuyển sang /sign-up').toHaveURL(/\/sign-up$/);
      await expect(signUpPage.heading, 'Phải thấy tiêu đề "Sign up"').toBeVisible();
    });
  });

  test('Đăng nhập thành công bằng tài khoản hợp lệ', {
    tag: ['@smoke', '@ui', '@signin', '@auth'],
  }, async ({ signInPage, page }) => {
    await meta({
      id: 'BOOK_AUTH_TC_005',
      feature: 'Đăng nhập',
      severity: 'blocker',
      description: 'Nhập đúng email và mật khẩu của tài khoản demo rồi bấm Login account: '
        + 'đăng nhập thành công và rời khỏi trang Sign in.',
    });
    const { email, password } = env.credentials();

    await test.step('Arrange: Mở trang Sign in', async () => {
      await signInPage.open();
    });

    const loginResponse = await test.step('Act: Đăng nhập bằng tài khoản demo', async () => {
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().endsWith('/api/login') && res.request().method() === 'POST'),
        signInPage.login(email, password),
      ]);
      return response;
    });

    await test.step('Assert: Đăng nhập thành công, rời trang Sign in', async () => {
      expect(loginResponse.status(), 'Đăng nhập phải trả 200').toBe(200);
      // Trang đích sau đăng nhập chưa được inspect (cần tài khoản) — chỉ kiểm đã rời /sign-in
      await expect(page, 'Phải rời khỏi trang /sign-in sau khi đăng nhập').not.toHaveURL(/\/sign-in/);
    });
  });

  for (const data of invalidCases) {
    test(`Đăng nhập thất bại khi ${data.title}`, {
      tag: ['@regression', '@ui', '@signin', '@auth'],
    }, async ({ signInPage, page }) => {
      await meta({
        id: `BOOK_AUTH_TC_006-${data.variant}`,
        feature: 'Đăng nhập',
        severity: 'critical',
        description: `Đăng nhập với ${data.title}: hệ thống từ chối và người dùng vẫn ở trang Sign in.`,
      });
      const email = data.useAccountEmail ? env.credentials().email : TestData.email('signInInvalid');

      await test.step('Arrange: Mở trang Sign in', async () => {
        await signInPage.open();
      });

      const loginResponse = await test.step(`Act: Đăng nhập với ${data.title}`, async () => {
        const [response] = await Promise.all([
          page.waitForResponse(res => res.url().endsWith('/api/login') && res.request().method() === 'POST'),
          signInPage.login(email, data.password),
        ]);
        return response;
      });

      await test.step('Assert: Hệ thống từ chối, vẫn ở trang Sign in', async () => {
        expect(loginResponse.status(), 'Đăng nhập sai phải bị từ chối (mã 4xx)').toBeGreaterThanOrEqual(400);
        expect(loginResponse.status(), 'Đăng nhập sai phải bị từ chối (mã 4xx)').toBeLessThan(500);
        await expect(page, 'Phải ở lại trang /sign-in').toHaveURL(/\/sign-in/);
      });
    });
  }
});
