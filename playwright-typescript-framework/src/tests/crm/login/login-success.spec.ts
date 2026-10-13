import emailVariants from '../../../../test-data/crm-login-email-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';

const DASHBOARD_URL = `${env.crmBaseURL}/admin/`;
const AUTOLOGIN_COOKIE = 'autologin';
// Hình thái cookie ghi nhớ — chỉ kiểm HÌNH THÁI, không bao giờ in giá trị ra report
const AUTOLOGIN_SHAPE = /^a:2:\{s:7:"user_id";s:\d+:"\d+";s:3:"key";s:16:"[0-9a-f]{16}";\}$/;
const PM_HIDDEN_MENUS = ['Subscriptions', 'Expenses', 'Estimate Request', 'Knowledge Base', 'Reports'];

test.describe('CRM · Đăng nhập — Đăng nhập thành công & Ghi nhớ đăng nhập', () => {
  test('Đăng nhập bằng tài khoản Admin hợp lệ thì vào được Dashboard', {
    tag: ['@smoke', '@criticalpath', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, crmDashboardPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_005',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Chưa đăng nhập, nhập đúng tài khoản Admin, để trống Remember me rồi bấm Login: '
        + 'không báo lỗi, dừng ở /admin/, tab có chữ Dashboard, thấy menu trái và ảnh đại diện góc trên bên phải.',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Nhập tài khoản Admin, để trống Remember me, bấm Login', async () => {
      await crmLoginPage.login(email, password);
    });

    await test.step('Assert: Chuyển trang, không dải báo lỗi, không quay lại trang đăng nhập', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      await expect(crmLoginPage.invalidCredentialsAlert, 'Không được hiện dải báo lỗi').toHaveCount(0);
    });

    await test.step('Assert: Tab có chữ Dashboard, thấy menu trái và ảnh đại diện góc trên bên phải', async () => {
      await expect(page, 'Tab trình duyệt phải có chữ Dashboard').toHaveTitle(/Dashboard/);
      await expect(crmDashboardPage.sideMenu, 'Phải thấy menu điều hướng bên trái').toBeVisible();
      await expect(crmDashboardPage.avatar, 'Phải thấy ảnh đại diện').toBeVisible();
      const box = await crmDashboardPage.avatar.boundingBox();
      const viewport = page.viewportSize()!;
      expect(box!.x, 'Ảnh đại diện phải nằm nửa bên phải màn hình').toBeGreaterThan(viewport.width / 2);
      expect(box!.y, 'Ảnh đại diện phải nằm ở thanh đầu trang').toBeLessThan(100);
    });

    await test.step('Assert: 🔧 Kỹ thuật — body mang đủ class của Dashboard Admin', async () => {
      for (const cls of ['app', 'admin', 'dashboard', 'user-id-2']) {
        await expect(crmDashboardPage.body, `body phải mang class ${cls}`).toHaveClass(new RegExp(`\\b${cls}\\b`));
      }
    });
  });

  test('Đăng nhập bằng tài khoản Project Manager thì vào Dashboard với bộ menu rút gọn', {
    tag: ['@regression', '@permission', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, crmDashboardPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_006',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Đăng nhập bằng tài khoản Project Manager: vào /admin/ với menu trái đúng 9 mục (Admin có 14), '
        + 'không có Subscriptions, Expenses, Estimate Request, Knowledge Base, Reports.',
    });
    const { email, password } = env.crmProjectManager();

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Nhập tài khoản Project Manager, bấm Login', async () => {
      await crmLoginPage.login(email, password);
    });

    await test.step('Assert: Đăng nhập thành công, dừng ở /admin/', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      await expect(crmLoginPage.invalidCredentialsAlert, 'Không được hiện dải báo lỗi').toHaveCount(0);
    });

    await test.step('Assert: Menu trái đúng 9 mục', async () => {
      await expect(crmDashboardPage.sideMenuItems, 'Menu trái của PM phải có đúng 9 mục').toHaveCount(9);
    });

    await test.step('Assert: Không có 5 mục dành riêng cho Admin', async () => {
      const labels = await crmDashboardPage.sideMenuLabels();
      for (const hidden of PM_HIDDEN_MENUS) {
        expect(labels, `Menu của PM không được có mục "${hidden}"`).not.toContain(hidden);
      }
    });

    await test.step('Assert: 🔧 Kỹ thuật — body mang class user-id-3', async () => {
      await expect(crmDashboardPage.body, 'body phải mang class user-id-3').toHaveClass(/\buser-id-3\b/);
    });
  });

  // TC gộp 4 biến thể (độ hạt GỘP của bộ TC) → 1 test; mỗi biến thể 1 step mang mã riêng để FAIL vẫn chỉ đúng biến thể
  test('Email được chuẩn hoá — khác kiểu chữ và thừa khoảng trắng vẫn đăng nhập được', {
    tag: ['@regression', '@boundary', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_007',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Đăng nhập Admin với 4 biến thể email (a: lẫn hoa thường · b: toàn chữ HOA · c: 2 dấu cách mỗi đầu · '
        + 'd: 1 dấu cách cuối): mọi biến thể đều không báo "Invalid email or password" và vào Dashboard.',
    });
    const { password } = env.crmAdmin();

    for (const data of emailVariants) {
      await test.step(`Biến thể CRM_LOGIN_TC_007-${data.variant} — ${data.title} ("${data.email}")`, async () => {
        await test.step('Arrange: Kết thúc phiên cũ bằng URL đăng xuất, mở trang đăng nhập', async () => {
          await crmLoginPage.logoutByUrl();
          await crmLoginPage.open();
        });

        await test.step('Act: Đăng nhập bằng email biến thể', async () => {
          await crmLoginPage.login(data.email, password);
        });

        await test.step('Assert: Không báo lỗi, vào Dashboard', async () => {
          await expect.soft(page, `[${data.variant}] Phải dừng ở /admin/`).toHaveURL(DASHBOARD_URL);
          await expect.soft(page, `[${data.variant}] Tab trình duyệt phải có chữ Dashboard`).toHaveTitle(/Dashboard/);
          await expect.soft(crmLoginPage.invalidCredentialsAlert,
            `[${data.variant}] Không được hiện "Invalid email or password"`).toHaveCount(0);
        });
      });
    }
  });

  test('Tích Ghi nhớ đăng nhập thì hệ thống phát hành cookie ghi nhớ', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page, context }) => {
    await meta({
      id: 'CRM_LOGIN_TC_008',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Trình duyệt sạch cookie, đăng nhập Admin có tích Remember me: đăng nhập thành công '
        + 'và hệ thống phát hành cookie "autologin" đúng hình thái (key 16 ký tự hex).',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Xác nhận trình duyệt chưa có cookie nào', async () => {
      expect(await context.cookies(), 'Trước khi mở trang, danh sách cookie phải rỗng').toEqual([]);
      await crmLoginPage.open();
    });

    await test.step('Act: Nhập tài khoản Admin, tích Remember me', async () => {
      await crmLoginPage.fillCredentials(email, password);
      await crmLoginPage.clickRememberLabel();
      await expect(crmLoginPage.rememberCheckbox, 'Ô Remember me phải được tích').toBeChecked();
    });

    await test.step('Act: Bấm nút Login', async () => {
      await crmLoginPage.clickLoginButton();
    });

    await test.step('Assert: Đăng nhập thành công, không dải báo lỗi', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      await expect(crmLoginPage.invalidCredentialsAlert, 'Không được hiện dải báo lỗi').toHaveCount(0);
    });

    await test.step('Assert: 🔧 Kỹ thuật — có cookie autologin đúng hình thái', async () => {
      const cookie = (await context.cookies()).find(c => c.name === AUTOLOGIN_COOKIE);
      expect(cookie, 'Phải tồn tại cookie autologin sau khi đăng nhập có Remember me').toBeDefined();
      expect(AUTOLOGIN_SHAPE.test(decodeURIComponent(cookie!.value)),
        'Cookie autologin phải khớp hình thái a:2:{user_id; key 16 ký tự hex}').toBe(true);
    });
  });

  test('Không tích Ghi nhớ đăng nhập thì hoàn toàn không phát hành cookie ghi nhớ', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page, context }) => {
    await meta({
      id: 'CRM_LOGIN_TC_009',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Trình duyệt sạch cookie, đã kết thúc mọi phiên, đăng nhập Admin KHÔNG tích Remember me: '
        + 'đăng nhập thành công và không có cookie "autologin".',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Xoá cookie, mở URL đăng xuất, mở trang đăng nhập', async () => {
      await context.clearCookies();
      await crmLoginPage.logoutByUrl();
      await crmLoginPage.open();
      await expect(crmLoginPage.rememberCheckbox, 'Ô Remember me phải đang rỗng').not.toBeChecked();
      expect((await context.cookies()).some(c => c.name === AUTOLOGIN_COOKIE), 'Chưa được có cookie autologin').toBe(false);
    });

    await test.step('Act: Nhập tài khoản Admin, không động vào Remember me, bấm Login', async () => {
      await crmLoginPage.login(email, password);
    });

    await test.step('Assert: Đăng nhập thành công', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
    });

    await test.step('Assert: 🔧 Kỹ thuật — không có cookie autologin', async () => {
      expect((await context.cookies()).some(c => c.name === AUTOLOGIN_COOKIE),
        'Không tích Remember me thì KHÔNG được phát hành cookie autologin').toBe(false);
    });
  });

  test('Bấm nút Login hai lần liên tiếp vẫn vào đúng Dashboard, không sinh trang lỗi', {
    tag: ['@regression', '@racecondition', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_010',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Nhập đúng tài khoản Admin rồi bấm Login hai lần liên tiếp trong dưới 1 giây: '
        + 'vẫn vào đúng Dashboard, không dải báo lỗi, không hiện "419 Page Expired!".',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Mở trang đăng nhập, nhập tài khoản Admin', async () => {
      await crmLoginPage.open();
      await crmLoginPage.fillCredentials(email, password);
    });

    await test.step('Act: Bấm nút Login hai lần liên tiếp', async () => {
      await crmLoginPage.doubleClickLogin();
    });

    await test.step('Assert: Dừng ở Dashboard, không báo lỗi, không có trang 419', async () => {
      await expect(page, 'Phải dừng ở /admin/').toHaveURL(DASHBOARD_URL);
      await expect(page, 'Tab trình duyệt phải có chữ Dashboard').toHaveTitle(/Dashboard/);
      await expect(crmLoginPage.invalidCredentialsAlert, 'Không được hiện dải báo lỗi').toHaveCount(0);
      await expect(crmLoginPage.pageExpiredMessage, 'Không được hiện "419 Page Expired!"').toHaveCount(0);
    });
  });
});
