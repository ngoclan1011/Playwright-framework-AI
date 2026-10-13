import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';

const LOGIN_URL = `${env.crmBaseURL}/admin/authentication`;
const PUBLIC_HOME_URL = `${env.crmBaseURL}/`;
const CLIENT_LOGIN_URL = `${env.crmBaseURL}/authentication/login`;

test.describe('CRM · Đăng nhập — Giao diện & cấu trúc trang', () => {
  test('Mở trang đăng nhập khi chưa có phiên thì thấy biểu mẫu đăng nhập', {
    tag: ['@smoke', '@criticalpath', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_001',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Trình duyệt sạch, chưa từng đăng nhập: mở /admin/authentication thì trang tải bình thường, '
        + 'URL giữ nguyên, tab ghi "Perfex CRM | Anh Tester Demo - Login" và khối biểu mẫu có tiêu đề "Login".',
    });

    const response = await test.step('Arrange: Mở trang đăng nhập trên trình duyệt sạch', () => crmLoginPage.open());

    await test.step('Assert: Trang tải xong bình thường, không phải trang lỗi', async () => {
      expect(response?.status(), 'Tài liệu trang đăng nhập phải trả HTTP 200').toBe(200);
      await expect(crmLoginPage.body, 'body phải mang class login_admin').toHaveClass(/\blogin_admin\b/);
    });

    await test.step('Assert: Thanh địa chỉ dừng đúng ở trang đăng nhập', async () => {
      await expect(page, 'Không được bị chuyển hướng đi nơi khác').toHaveURL(LOGIN_URL);
    });

    await test.step('Assert: Tab trình duyệt ghi đúng tiêu đề', async () => {
      await expect(page, 'Tiêu đề tab phải đúng nguyên văn').toHaveTitle('Perfex CRM | Anh Tester Demo - Login');
    });

    await test.step('Assert: Khối biểu mẫu có tiêu đề Login', async () => {
      await expect(crmLoginPage.heading, 'Phải thấy tiêu đề "Login"').toBeVisible();
    });
  });

  test('Biểu mẫu đăng nhập đủ thành phần và đúng trạng thái mặc định', {
    tag: ['@smoke', '@criticalpath', '@accessibility', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage }) => {
    await meta({
      id: 'CRM_LOGIN_TC_002',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Trang vừa nạp, chưa nhập gì: đủ 5 thành phần, con trỏ sẵn ở ô Email, Remember me rỗng và bật, '
        + 'nút Login xanh chữ trắng bấm được, ô Password che ký tự, bấm chữ "Remember me" thì ô được tích.',
    });

    await test.step('Arrange: Mở trang đăng nhập, không bấm vào đâu', async () => {
      await crmLoginPage.open();
    });

    await test.step('Assert: Mục 1 — đủ 5 thành phần, Forgot Password? nằm dưới nút Login', async () => {
      for (const element of [crmLoginPage.emailInput, crmLoginPage.passwordInput, crmLoginPage.rememberCheckbox,
        crmLoginPage.loginButton, crmLoginPage.forgotPasswordLink]) {
        await expect(element, 'Thành phần của biểu mẫu phải hiển thị').toBeVisible();
      }
      const login = await crmLoginPage.loginButton.boundingBox();
      const forgot = await crmLoginPage.forgotPasswordLink.boundingBox();
      expect(forgot!.y, 'Liên kết Forgot Password? phải nằm dưới nút Login').toBeGreaterThanOrEqual(login!.y + login!.height);
    });

    await test.step('Assert: Mục 2 — con trỏ nằm sẵn trong ô Email', async () => {
      await expect(crmLoginPage.emailInput, 'Ô Email phải được focus sẵn khi mở trang').toBeFocused();
    });

    await test.step('Assert: Mục 3 — ô Remember me rỗng và không bị khoá', async () => {
      await expect(crmLoginPage.rememberCheckbox, 'Remember me phải rỗng khi mới mở').not.toBeChecked();
      await expect(crmLoginPage.rememberCheckbox, 'Remember me không được bị khoá').toBeEnabled();
    });

    await test.step('Assert: Mục 4 — nút Login nền xanh chữ trắng, bấm được khi hai ô còn rỗng', async () => {
      await expect(crmLoginPage.loginButton, 'Nút Login phải bấm được').toBeEnabled();
      await expect(crmLoginPage.loginButton, 'Nút Login phải nền xanh').toHaveCSS('background-color', 'rgb(37, 99, 235)');
      await expect(crmLoginPage.loginButton, 'Nút Login phải chữ trắng').toHaveCSS('color', 'rgb(255, 255, 255)');
    });

    await test.step('Act + Assert: Mục 5 — gõ Abc12345 vào ô Password thì bị che', async () => {
      await crmLoginPage.typePassword('Abc12345');
      await expect(crmLoginPage.passwordInput, 'Ô Password phải che ký tự').toHaveAttribute('type', 'password');
      await expect(crmLoginPage.passwordInput, 'Ô Password phải nhận đủ 8 ký tự').toHaveValue('Abc12345');
    });

    await test.step('Act + Assert: Mục 6 — bấm chữ "Remember me" thì ô được tích', async () => {
      await crmLoginPage.clickRememberLabel();
      await expect(crmLoginPage.rememberCheckbox, 'Bấm nhãn phải tích được ô Remember me').toBeChecked();
    });

    await test.step('Assert: 🔧 Kỹ thuật — form gửi POST về đúng địa chỉ, nhãn khớp ô nhập', async () => {
      await expect(crmLoginPage.loginForm, 'Form phải gửi về /admin/authentication').toHaveAttribute('action', LOGIN_URL);
      await expect(crmLoginPage.loginForm, 'Form phải dùng method post').toHaveAttribute('method', 'post');
      const labelsFor = await crmLoginPage.formLabels.evaluateAll(labels => labels.map(l => (l as HTMLLabelElement).htmlFor));
      expect(labelsFor, 'Ba nhãn phải trỏ đúng email / password / remember').toEqual(['email', 'password', 'remember']);
    });
  });

  test('Trang đăng nhập không có CAPTCHA, không đăng nhập bên thứ ba, không nạp JavaScript', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage }) => {
    await meta({
      id: 'CRM_LOGIN_TC_003',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Trang đăng nhập vừa nạp: không có CAPTCHA, chỉ một nút gửi duy nhất là Login, '
        + 'không có nút đăng nhập bên thứ ba và không nạp bất kỳ file JavaScript nào.',
    });

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    const scriptRequests = await test.step('Act: Nạp lại trang một lần', () => crmLoginPage.reloadCountingScriptRequests());

    await test.step('Assert: Mục 1 — không có CAPTCHA', async () => {
      await expect(crmLoginPage.captchaWidgets, 'Không được có khối CAPTCHA nào').toHaveCount(0);
    });

    await test.step('Assert: Mục 2 — chỉ một nút gửi Login, không có đăng nhập bên thứ ba', async () => {
      await expect(crmLoginPage.loginForm, 'Toàn trang chỉ có đúng 1 biểu mẫu').toHaveCount(1);
      await expect(crmLoginPage.submitButtons, 'Chỉ có đúng 1 nút gửi').toHaveCount(1);
      await expect(crmLoginPage.loginButton, 'Nút gửi duy nhất là Login').toBeVisible();
      await expect(crmLoginPage.thirdPartyLoginButtons, 'Không có nút Google / Facebook / Microsoft').toHaveCount(0);
    });

    await test.step('Assert: Mục 3 — trang không nạp JavaScript, bấm được ngay', async () => {
      await expect(crmLoginPage.scripts, 'Trang không được có thẻ script nào').toHaveCount(0);
      expect(scriptRequests, 'Không được có request tải file JavaScript nào').toBe(0);
      await expect(crmLoginPage.loginButton, 'Nút Login bấm được ngay khi vừa tải').toBeEnabled();
    });
  });

  test('Bấm logo trên trang đăng nhập thì về trang chủ công khai', {
    tag: ['@regression', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_004',
      feature: 'CRM · Đăng nhập',
      severity: 'minor',
      description: 'Bấm logo ANHTESTER trên trang đăng nhập: logo trỏ tới trang chủ công khai https://crm.anhtester.com/, '
        + 'khách chưa đăng nhập được chuyển tiếp tới trang đăng nhập cổng khách hàng /authentication/login (user xác nhận 24-09-2026).',
    });

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
      await expect(crmLoginPage.logoLink, 'Logo phải trỏ tới trang chủ công khai').toHaveAttribute('href', PUBLIC_HOME_URL);
    });

    await test.step('Act: Bấm vào logo ANHTESTER', async () => {
      await crmLoginPage.clickLogo();
    });

    await test.step('Assert: Chuyển sang khu công khai, dừng ở trang đăng nhập cổng khách hàng', async () => {
      await expect(page, 'Phải dừng ở /authentication/login của cổng khách hàng').toHaveURL(CLIENT_LOGIN_URL);
      expect(new URL(page.url()).pathname, 'Không còn ở khu /admin').not.toMatch(/^\/admin/);
    });
  });
});
