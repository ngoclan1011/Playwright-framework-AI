import variants from '../../../../test-data/crm-login-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';
import { DASHBOARD_URL, LOGIN_URL } from './login-flow';

test.describe('CRM · Đăng nhập — Hành vi giao diện của biểu mẫu', () => {
  test('Điều hướng và gửi biểu mẫu đăng nhập hoàn toàn bằng bàn phím, có viền tiêu điểm rõ ràng', {
    tag: ['@regression', '@accessibility', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_038',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Không dùng chuột: ô Email có tiêu điểm sẵn, Tab đi lần lượt Email → Password → Remember me → nút Login, '
        + 'Space tích được ô Remember me, Enter gửi biểu mẫu và vào Dashboard; viền tiêu điểm khác viền ô không có tiêu điểm.',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Mở trang đăng nhập, chưa bấm chuột vào đâu', async () => {
      await crmLoginPage.open();
    });

    await test.step('Assert: Mục 1 — ô Email có tiêu điểm sẵn, viền khác viền ô Password', async () => {
      await expect(crmLoginPage.emailInput, 'Ô Email phải có tiêu điểm sẵn khi trang vừa nạp').toBeFocused();
      const emailBorder = await crmLoginPage.borderOf(crmLoginPage.emailInput);
      const passwordBorder = await crmLoginPage.borderOf(crmLoginPage.passwordInput);
      expect(emailBorder, 'Viền ô đang có tiêu điểm phải khác viền ô không có tiêu điểm').not.toEqual(passwordBorder);
    });

    await test.step('Act: Gõ email bằng bàn phím rồi nhấn Tab', async () => {
      await crmLoginPage.typeWithKeyboard(email);
      await crmLoginPage.pressKey('Tab');
    });

    await test.step('Assert: Tiêu điểm chuyển sang ô Password', async () => {
      await expect(crmLoginPage.passwordInput, 'Sau Tab tiêu điểm phải sang ô Password').toBeFocused();
    });

    await test.step('Act: Gõ mật khẩu bằng bàn phím rồi nhấn Tab', async () => {
      await crmLoginPage.typeWithKeyboard(password);
      await crmLoginPage.pressKey('Tab');
    });

    await test.step('Assert: Tiêu điểm tới ô Remember me', async () => {
      await expect(crmLoginPage.rememberCheckbox, 'Tiêu điểm phải tới ô Remember me').toBeFocused();
    });

    await test.step('Act: Nhấn phím Space', async () => {
      await crmLoginPage.pressKey('Space');
    });

    await test.step('Assert: Phím Space tích được ô Remember me', async () => {
      await expect(crmLoginPage.rememberCheckbox, 'Phím Space phải tích được ô Remember me').toBeChecked();
    });

    await test.step('Act: Nhấn Tab', async () => {
      await crmLoginPage.pressKey('Tab');
    });

    await test.step('Assert: Tiêu điểm tới nút Login', async () => {
      await expect(crmLoginPage.loginButton, 'Tiêu điểm phải tới nút Login').toBeFocused();
    });

    await test.step('Act: Nhấn Enter', async () => {
      await crmLoginPage.pressKey('Enter');
    });

    await test.step('Assert: Enter gửi biểu mẫu và đăng nhập thành công', async () => {
      await expect(page, 'Phải vào /admin/').toHaveURL(DASHBOARD_URL);
    });
  });

  test('Ô Mật khẩu che ký tự, dán được, và biểu mẫu không có nút hiện/ẩn mật khẩu', {
    tag: ['@regression', '@uibehavior', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page, context }) => {
    await meta({
      id: 'CRM_LOGIN_TC_042',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Ô Password che ký tự, không có biểu tượng con mắt hay nút Show/Hiện, dán (Ctrl+V) được và chuỗi dán dùng được thật: '
        + 'đăng nhập thành công bằng mật khẩu dán vào.',
    });
    const { email, password } = env.crmAdmin();

    await test.step('Arrange: Cấp quyền clipboard, mở trang đăng nhập', async () => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: env.crmBaseURL });
      await crmLoginPage.open();
    });

    await test.step('Act: Gõ tay mật khẩu vào ô Password', async () => {
      await crmLoginPage.typePassword('Abc12345');
    });

    await test.step('Assert: Ô Password che ký tự và biểu mẫu không có nút hiện/ẩn mật khẩu', async () => {
      await expect(crmLoginPage.passwordInput, 'Ô Password phải là kiểu password (che ký tự)').toHaveAttribute('type', 'password');
      await expect(crmLoginPage.formButtons, 'Biểu mẫu chỉ được có đúng 1 nút (Login), không có nút hiện/ẩn mật khẩu').toHaveCount(1);
      await expect(crmLoginPage.passwordToggleControls, 'Không được có biểu tượng con mắt hay chữ Show / Hiện').toHaveCount(0);
    });

    await test.step('Act: Dán mật khẩu từ clipboard vào ô Password bằng Ctrl+V', async () => {
      await crmLoginPage.pastePassword(password);
    });

    await test.step('Assert: Dán thành công — ô nhận đủ ký tự và vẫn che', async () => {
      await expect(crmLoginPage.passwordInput, 'Ô Password vẫn phải che ký tự sau khi dán').toHaveAttribute('type', 'password');
      await expect(crmLoginPage.passwordInput, 'Ô phải nhận đủ chuỗi đã dán').toHaveValue(password);
    });

    await test.step('Act: Nhập email và bấm Login', async () => {
      await crmLoginPage.fillEmail(email);
      await crmLoginPage.clickLoginButton();
    });

    await test.step('Assert: Đăng nhập thành công — chuỗi dán dùng được thật', async () => {
      await expect(page, 'Phải vào /admin/').toHaveURL(DASHBOARD_URL);
    });
  });

  // TC gộp 3 biến thể → 1 test
  test('Nút Login luôn bấm được, không tự khoá theo trạng thái biểu mẫu', {
    tag: ['@regression', '@uibehavior', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_043',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Ở 3 trạng thái biểu mẫu (rỗng cả hai · chỉ Email · chỉ Password): nút Login luôn nền đậm chữ trắng, '
        + 'con trỏ hình bàn tay, bấm được và trang nạp lại với dải báo lỗi.',
    });

    for (const data of variants.tc043) {
      await test.step(`Biến thể CRM_LOGIN_TC_043-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang và nhập dữ liệu biến thể', async () => {
          await crmLoginPage.open();
          await crmLoginPage.fillCredentials(data.usesAdminEmail ? env.crmAdmin().email : data.email, data.password);
        });

        await test.step('Assert: Nút Login bấm được — chữ trắng, con trỏ bàn tay, không bị khoá', async () => {
          await expect.soft(crmLoginPage.loginButton, `[${data.variant}] Nút Login phải ở trạng thái bấm được`).toBeEnabled();
          await expect.soft(crmLoginPage.loginButton, `[${data.variant}] Chữ nút Login phải màu trắng`)
            .toHaveCSS('color', 'rgb(255, 255, 255)');
          await expect.soft(crmLoginPage.loginButton, `[${data.variant}] Con trỏ chuột phải là bàn tay chỉ`)
            .toHaveCSS('cursor', 'pointer');
        });

        await test.step('Act: Bấm nút Login một lần', async () => {
          await crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Trang nạp lại và hiện dải báo lỗi, ở lại trang đăng nhập', async () => {
          await expect.soft(page, `[${data.variant}] Phải ở lại trang đăng nhập`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.alerts, `[${data.variant}] Phải hiện ít nhất một dải báo lỗi`).not.toHaveCount(0);
        });
      });
    }
  });

  test('Ô Email không tự cắt bớt ký tự khi dán chuỗi dài vào', {
    tag: ['@regression', '@boundary', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage }) => {
    await meta({
      id: 'CRM_LOGIN_TC_048',
      feature: 'CRM · Đăng nhập',
      severity: 'minor',
      description: 'Dán chuỗi 300 ký tự vào ô Email: ô giữ đủ 300 ký tự, không cắt ở mốc nào; ô Password cũng nhận đủ 300 ký tự '
        + '(không thuộc tính giới hạn độ dài ở phía trình duyệt). Không bấm Login.',
    });
    const longValue = 'a'.repeat(300);

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Nhập chuỗi 300 ký tự vào ô Email và ô Password', async () => {
      await crmLoginPage.fillCredentials(longValue, longValue);
    });

    await test.step('Assert: Cả hai ô giữ đủ 300 ký tự, không cắt bớt', async () => {
      expect((await crmLoginPage.emailInput.inputValue()).length, 'Ô Email phải giữ đủ 300 ký tự').toBe(300);
      expect((await crmLoginPage.passwordInput.inputValue()).length, '🔧 Ô Password phải giữ đủ 300 ký tự').toBe(300);
      await expect(crmLoginPage.emailInput, '🔧 Ô Email không được đặt thuộc tính maxlength').not.toHaveAttribute('maxlength', /.*/);
      await expect(crmLoginPage.passwordInput, '🔧 Ô Password không được đặt thuộc tính maxlength').not.toHaveAttribute('maxlength', /.*/);
    });
  });

  // TC gộp 5 biến thể kích thước → 1 test
  test('Trang đăng nhập giữ đúng bố cục ở mọi kích thước màn hình đã chốt', {
    tag: ['@regression', '@responsive', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_049',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Ở 5 kích thước màn hình (1920×1080, 1600×750, 1366×700, 768×1024, 375×700): không cuộn ngang được, thấy đủ 7 thành phần, '
        + 'khung đăng nhập nằm giữa theo chiều ngang, nút Login rộng bằng ô nhập, chữ và khung không đè lên nhau.',
    });

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    for (const data of variants.tc049) {
      await test.step(`Biến thể CRM_LOGIN_TC_049-${data.variant} — ${data.title} (${data.width}×${data.height})`, async () => {
        await test.step('Act: Đặt kích thước màn hình rồi nạp lại trang', async () => {
          await page.setViewportSize({ width: data.width, height: data.height });
          await page.reload({ waitUntil: 'domcontentloaded' });
        });

        await test.step('Assert: Không cuộn ngang được', async () => {
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect.soft(overflow, `[${data.variant}] Trang phải vừa khít bề ngang, không cuộn ngang`).toBeLessThanOrEqual(0);
        });

        await test.step('Assert: Thấy đủ 7 thành phần', async () => {
          for (const [name, element] of Object.entries(crmLoginPage.sevenComponents())) {
            await expect.soft(element, `[${data.variant}] Thành phần "${name}" phải hiển thị`).toBeVisible();
          }
        });

        await test.step('Assert: Bố cục — khung nằm giữa, nút Login rộng bằng ô nhập, các khối không đè lên nhau', async () => {
          const layout = await crmLoginPage.measureLayout();
          expect.soft(Math.abs(layout.leftSpace - layout.rightSpace),
            `[${data.variant}] Khung đăng nhập phải nằm giữa theo chiều ngang`).toBeLessThanOrEqual(2);
          expect.soft(Math.abs(layout.buttonWidth - layout.inputWidth),
            `[${data.variant}] Nút Login phải rộng bằng ô nhập phía trên`).toBeLessThanOrEqual(2);
          expect.soft(layout.verticalOrderIsClean, `[${data.variant}] Các khối phải xếp trên xuống, không đè lên nhau`).toBe(true);
        });
      });
    }
  });
});
