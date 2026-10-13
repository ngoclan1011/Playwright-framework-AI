import { meta } from '../../../utils/allure-meta';
import { TestData } from '../../../utils/test-data';
import { expect, test } from '../../../fixtures/ui.fixture';

test.describe('Đăng ký tài khoản', () => {
  test('Trang Đăng ký hiển thị đủ trường và khoá Ward/Address khi chưa chọn Division', {
    tag: ['@smoke', '@ui', '@signup'],
  }, async ({ signUpPage, page }) => {
    await meta({
      id: 'BOOK_AUTH_TC_001',
      feature: 'Đăng ký',
      severity: 'critical',
      description: 'Mở trang Sign up khi chưa đăng nhập: hiển thị đủ các ô nhập và nút Register; '
        + 'ô Ward và Address bị khoá cho tới khi người dùng chọn Division.',
    });

    await test.step('Arrange: Mở trang Sign up', async () => {
      await signUpPage.open();
    });

    await test.step('Assert: Tiêu đề trang và các ô nhập hiển thị đủ', async () => {
      await expect(page, 'Tiêu đề tab phải chứa "Sign up"').toHaveTitle(/Sign up/);
      await expect(signUpPage.heading, 'Phải thấy tiêu đề "Sign up"').toBeVisible();
      for (const field of [signUpPage.nameInput, signUpPage.phoneInput, signUpPage.divisionSelect,
        signUpPage.emailInput, signUpPage.passwordInput, signUpPage.passwordConfirmInput]) {
        await expect(field, 'Ô nhập phải hiển thị và nhập được').toBeEditable();
      }
    });

    await test.step('Assert: Ward và Address bị khoá khi chưa chọn Division', async () => {
      await expect(signUpPage.wardSelect, 'Ward phải bị khoá khi chưa chọn Division').toBeDisabled();
      await expect(signUpPage.addressInput, 'Address phải bị khoá khi chưa chọn Division').toBeDisabled();
    });

    await test.step('Assert: Nút Register bấm được, có liên kết sang Sign in', async () => {
      await expect(signUpPage.registerButton, 'Nút Register phải bấm được').toBeEnabled();
      await expect(signUpPage.signInLink, 'Liên kết Sign in phải trỏ tới /sign-in').toHaveAttribute('href', '/sign-in');
    });
  });

  test('Đăng ký tài khoản mới thành công với đủ trường bắt buộc', {
    tag: ['@smoke', '@ui', '@signup', '@auth'],
  }, async ({ signUpPage, page, authApi }) => {
    await meta({
      id: 'BOOK_AUTH_TC_002',
      feature: 'Đăng ký',
      severity: 'blocker',
      description: 'Điền Name, Phone, Email, Password, Password Confirmation hợp lệ rồi bấm Register: '
        + 'hệ thống tạo tài khoản, và đăng nhập bằng chính tài khoản đó thành công.',
    });

    const user = {
      name: TestData.name('signUpUi'),
      email: TestData.email('signUpUi'),
      password: TestData.password(),
      phone: TestData.phone(),
    };

    await test.step('Arrange: Mở trang Sign up và điền dữ liệu hợp lệ', async () => {
      await signUpPage.open();
      await signUpPage.fillForm(user);
    });

    const registerResponse = await test.step('Act: Bấm Register', async () => {
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().endsWith('/api/register') && res.request().method() === 'POST'),
        signUpPage.submit(),
      ]);
      return response;
    });

    await test.step('Assert: Hệ thống tạo tài khoản thành công', async () => {
      expect(registerResponse.status(), 'Đăng ký phải trả 201 Created').toBe(201);
    });

    await test.step('Assert: Đăng nhập được bằng tài khoản vừa đăng ký', async () => {
      const login = await authApi.login(user.email, user.password);
      expect(login.status(), 'Tài khoản vừa tạo phải đăng nhập được').toBe(200);
    });
  });
});
