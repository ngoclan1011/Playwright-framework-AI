import type { Response } from '@playwright/test';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { expect, test } from '../../../fixtures/ui.fixture';
import { DASHBOARD_URL, LOGIN_URL, signIn } from './login-flow';

const AUTOLOGIN_COOKIE = 'autologin';
const USER_MENU_LABELS = ['My Profile', 'My Timesheets', 'Edit Profile', 'Language', 'Logout'];

test.describe('CRM · Đăng nhập — Đăng xuất', () => {
  // Bộ đếm giờ gắn với tài khoản Admin dùng chung: TC_034 bật bộ đếm, còn TC_032/033/035 bấm Logout trên giao diện
  // (có bộ đếm sẽ hiện hộp xác nhận) — nên 4 TC chạy TUẦN TỰ trong một luồng, không song song với nhau
  test.describe('Đăng xuất trên giao diện (Admin dùng chung bộ đếm giờ)', () => {
    test.describe.configure({ mode: 'serial' });

    test('Ở viewport desktop chỉ có một lối đăng xuất dùng được — trong menu ảnh đại diện', {
      tag: ['@smoke', '@criticalpath', '@techcheck', '@login', '@crm', '@auth'],
    }, async ({ crmLoginPage, crmDashboardPage, page }) => {
      await meta({
        id: 'CRM_LOGIN_TC_032',
        feature: 'CRM · Đăng xuất',
        severity: 'blocker',
        description: 'Admin ở viewport desktop: thanh đầu trang không có nút Logout nhìn thấy được; bấm ảnh đại diện mở menu 5 mục '
          + 'My Profile → My Timesheets → Edit Profile → Language → Logout (Logout cuối cùng); bấm Logout thì chuyển hướng đăng xuất.',
      });

      await test.step('Arrange: Đăng nhập bằng Admin, đang ở Dashboard', async () => {
        await signIn(crmLoginPage, page, env.crmAdmin());
      });

      await test.step('Assert: Thanh đầu trang không có nút Logout nào nhìn thấy được', async () => {
        await expect(crmDashboardPage.visibleLogoutEntries, 'Khi chưa mở menu ảnh đại diện, không được thấy mục Logout nào').toHaveCount(0);
      });

      await test.step('Act: Bấm ảnh đại diện góc trên bên phải', async () => {
        await crmDashboardPage.openUserMenu();
      });

      await test.step('Assert: Menu mở ra, đủ 5 mục đúng thứ tự, Logout là mục cuối', async () => {
        await expect(crmDashboardPage.userMenu, 'Menu ảnh đại diện phải mở ra').toBeVisible();
        expect(await crmDashboardPage.userMenuLabels(), 'Menu phải có đúng 5 mục theo thứ tự trên xuống').toEqual(USER_MENU_LABELS);
      });

      await test.step('Assert: 🔧 Kỹ thuật — DOM có 2 li.header-logout, chỉ phần tử trong menu desktop có kích thước', async () => {
        await expect(crmDashboardPage.allLogoutEntries, 'DOM phải có đúng 2 phần tử li.header-logout').toHaveCount(2);
        await expect(crmDashboardPage.userMenuLogout, 'Chỉ có đúng 1 li.header-logout là con trực tiếp của .dropdown-menu').toHaveCount(1);
        await expect(crmDashboardPage.userMenuLogout, 'Mục Logout trong menu desktop phải nhìn thấy được').toBeVisible();
      });

      await test.step('Act: Bấm mục Logout', async () => {
        await crmDashboardPage.clickLogoutInUserMenu();
      });

      await test.step('Assert: Trình duyệt chuyển hướng đăng xuất về trang đăng nhập', async () => {
        await expect(page, 'Phải chuyển về /admin/authentication').toHaveURL(LOGIN_URL);
      });
    });

    test('Ở viewport mobile đăng xuất được qua menu điều hướng thu gọn', {
      tag: ['@regression', '@login', '@crm', '@auth'],
    }, async ({ crmLoginPage, crmDashboardPage, page }) => {
      await meta({
        id: 'CRM_LOGIN_TC_033',
        feature: 'CRM · Đăng xuất',
        severity: 'normal',
        description: 'Admin đổi sang viewport mobile 375×812 và nạp lại: bấm nút ba gạch mở menu thu gọn, thấy mục Logout hiển thị rõ, '
          + 'bấm Logout thì về trang đăng nhập.',
      });

      await test.step('Arrange: Đăng nhập Admin rồi đổi sang viewport mobile 375×812 và nạp lại /admin/', async () => {
        await signIn(crmLoginPage, page, env.crmAdmin());
        await page.setViewportSize({ width: 375, height: 812 });
        await crmDashboardPage.open();
      });

      await test.step('Act: Bấm nút mở menu điều hướng thu gọn', async () => {
        await crmDashboardPage.openMobileMenu();
      });

      await test.step('Assert: Menu thu gọn mở ra, thấy mục Logout', async () => {
        await expect(crmDashboardPage.mobileMenu, 'Menu thu gọn phải mở ra').toBeVisible();
        await expect(crmDashboardPage.mobileLogout, 'Phải thấy mục Logout hiển thị rõ, bấm được').toBeVisible();
      });

      await test.step('Act: Bấm Logout', async () => {
        await crmDashboardPage.clickLogoutInMobileMenu();
      });

      await test.step('Assert: Về trang đăng nhập', async () => {
        await expect(page, 'Phải dừng ở /admin/authentication').toHaveURL(LOGIN_URL);
      });
    });

    test('Đăng xuất trong lúc còn bộ đếm giờ công việc đang chạy thì phải xác nhận trước', {
      tag: ['@regression', '@login', '@crm', '@auth'],
    }, async ({ crmLoginPage, crmDashboardPage, crmTasksPage, page }) => {
      await meta({
        id: 'CRM_LOGIN_TC_034',
        feature: 'CRM · Đăng xuất',
        severity: 'normal',
        description: 'Tự tạo task riêng tư và bấm Start Timer, rồi bấm Logout: hiện lớp xác nhận "Started tasks timers found!" kèm câu hỏi '
          + 'và nút Logout, chưa đăng xuất cho tới khi người dùng chọn. Test tự dọn: đóng lớp xác nhận, xoá task đã tạo.',
      });
      const subject = `Auto_LOGIN_TC034_${Date.now()}`;
      let taskCreated = false;

      try {
        await test.step('Arrange: Đăng nhập Admin, tạo task riêng tư rồi bấm Start Timer', async () => {
          await signIn(crmLoginPage, page, env.crmAdmin());
          await crmTasksPage.open();
          await crmTasksPage.createPrivateTask(subject);
          taskCreated = true;
          await crmTasksPage.startTimer();
        });

        await test.step('Arrange: Mở Dashboard, xác nhận bộ đếm giờ đang chạy hiện trên thanh đầu trang', async () => {
          await crmDashboardPage.open();
          await expect(crmDashboardPage.timersList, 'Danh sách bộ đếm giờ phải có đúng task vừa tạo').toContainText(subject);
          await expect(crmDashboardPage.timersList, 'Dòng bộ đếm phải ghi thời điểm bắt đầu').toContainText('Started at');
        });

        await test.step('Act: Bấm ảnh đại diện rồi bấm Logout', async () => {
          await crmDashboardPage.openUserMenu();
          await crmDashboardPage.clickLogoutInUserMenu();
        });

        await test.step('Assert: Hiện lớp xác nhận với đúng nội dung và nút Logout', async () => {
          await expect(crmDashboardPage.timerLogoutDialog, 'Phải bật lên lớp xác nhận che toàn màn hình').toBeVisible();
          await expect(crmDashboardPage.timerLogoutTitle, 'Phải có dòng "Started tasks timers found!"').toBeVisible();
          await expect(crmDashboardPage.timerLogoutQuestion, 'Phải có câu hỏi xác nhận đăng xuất khi chưa dừng bộ đếm').toBeVisible();
          await expect(crmDashboardPage.timerLogoutConfirmButton, 'Phải có nút Logout trong lớp xác nhận').toBeVisible();
        });

        await test.step('Assert: Chưa đăng xuất — vẫn ở Dashboard cho tới khi người dùng chọn', async () => {
          await expect(page, 'Phải vẫn ở /admin/').toHaveURL(DASHBOARD_URL);
        });
      } finally {
        if (taskCreated) {
          await crmTasksPage.deleteTask(subject);
        }
      }

      await test.step('Assert: Dọn dẹp xong — tìm lại không còn task, không còn bộ đếm giờ nào chạy', async () => {
        await crmTasksPage.searchTask(subject);
        await expect(crmTasksPage.tableBody, 'Tìm lại task vừa xoá phải trả "No matching records found"')
          .toContainText('No matching records found');
        await crmDashboardPage.open();
        await expect(crmDashboardPage.timersList, 'Sau khi xoá task, danh sách phải báo không còn bộ đếm nào')
          .toContainText('No started timers found');
      });
    });

    test('Không có bộ đếm giờ nào chạy thì bấm Logout đi thẳng, không hỏi lại', {
      tag: ['@smoke', '@regression', '@login', '@crm', '@auth'],
    }, async ({ crmLoginPage, crmDashboardPage, page }) => {
      await meta({
        id: 'CRM_LOGIN_TC_035',
        feature: 'CRM · Đăng xuất',
        severity: 'critical',
        description: 'Admin không có bộ đếm giờ công việc nào đang chạy bấm Logout: không hộp thoại xác nhận, '
          + 'đi thẳng về trang đăng nhập.',
      });

      await test.step('Arrange: Đăng nhập Admin, xác nhận không có bộ đếm giờ nào chạy', async () => {
        await signIn(crmLoginPage, page, env.crmAdmin());
        await expect(crmDashboardPage.timersList, 'Danh sách bộ đếm giờ phải báo không có bộ đếm nào đang chạy')
          .toContainText('No started timers found');
      });

      await test.step('Act: Bấm ảnh đại diện rồi bấm Logout', async () => {
        await crmDashboardPage.openUserMenu();
        await crmDashboardPage.clickLogoutInUserMenu();
      });

      await test.step('Assert: Đi thẳng về trang đăng nhập, không hộp thoại xác nhận nào', async () => {
        await expect(page, 'Phải đi thẳng về /admin/authentication').toHaveURL(LOGIN_URL);
        await expect(crmLoginPage.heading, 'Phải hiển thị biểu mẫu đăng nhập').toBeVisible();
      });
    });
  });

  // TC gộp 2 biến thể → 1 test
  test('Đăng xuất kết thúc phiên và URL nội bộ không dùng lại được, kể cả bằng nút Back', {
    tag: ['@smoke', '@criticalpath', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, crmDashboardPage, page, context }) => {
    await meta({
      id: 'CRM_LOGIN_TC_036',
      feature: 'CRM · Đăng xuất',
      severity: 'blocker',
      description: 'Mở URL đăng xuất khi đang có phiên (a) hoặc khi chưa đăng nhập (b): về trang đăng nhập với hai ô rỗng, không dải thông báo nào; '
        + 'riêng (a) gõ lại /admin/clients và bấm Back đều bị đưa về trang đăng nhập, không thấy lại dữ liệu cũ.',
    });
    const { email, password } = env.crmAdmin();
    let clientsResponse: Response | null = null;

    await test.step('Biến thể CRM_LOGIN_TC_036-a — Đang có phiên', async () => {
      await test.step('Arrange: Đăng nhập Admin và mở /admin/clients một lần cho vào lịch sử', async () => {
        await context.clearCookies();
        await crmLoginPage.open();
        await crmLoginPage.login(email, password);
        await expect(page, 'Đăng nhập tiền đề phải vào Dashboard').toHaveURL(DASHBOARD_URL);
        clientsResponse = await page.goto('/admin/clients');
      });

      await test.step('Assert: 🔧 Trang nội bộ mang cache-control no-store', async () => {
        expect.soft(clientsResponse?.headers()['cache-control'] ?? '',
          '🔧 Trang nội bộ phải mang cache-control no-store để Back không hiện lại dữ liệu').toContain('no-store');
      });

      await test.step('Act: Mở URL đăng xuất', async () => {
        await crmLoginPage.logoutByUrl();
      });

      await test.step('Assert: Về trang đăng nhập, hai ô rỗng, không dải thông báo nào', async () => {
        await expect.soft(page, '[a] Phải dừng ở /admin/authentication').toHaveURL(LOGIN_URL);
        await expect.soft(crmLoginPage.emailInput, '[a] Ô Email phải rỗng').toHaveValue('');
        await expect.soft(crmLoginPage.passwordInput, '[a] Ô Password phải rỗng').toHaveValue('');
        await expect.soft(crmLoginPage.alerts, '[a] Không được có dải thông báo nào, kể cả thông báo đăng xuất thành công').toHaveCount(0);
      });

      await test.step('Act: Gõ thẳng /admin/clients', async () => {
        await page.goto('/admin/clients');
      });

      await test.step('Assert: Bị đưa về trang đăng nhập, không thấy dữ liệu khách hàng', async () => {
        await expect.soft(page, '[a] Phải bị đưa về /admin/authentication').toHaveURL(LOGIN_URL);
        await expect.soft(crmDashboardPage.sideMenu, '[a] Không được thấy menu nghiệp vụ nào').toHaveCount(0);
      });

      await test.step('Act: Bấm nút Back của trình duyệt', async () => {
        await page.goBack();
      });

      await test.step('Assert: Back không hiển thị lại dữ liệu đã tải trước đó', async () => {
        await expect.soft(page, '[a] Sau Back vẫn phải ở /admin/authentication').toHaveURL(LOGIN_URL);
        await expect.soft(crmDashboardPage.sideMenu, '[a] Sau Back không được thấy lại menu/dữ liệu nghiệp vụ').toHaveCount(0);
      });
    });

    await test.step('Biến thể CRM_LOGIN_TC_036-b — Chưa đăng nhập', async () => {
      await test.step('Arrange: Xoá mọi phiên, bảo đảm chưa đăng nhập', async () => {
        await context.clearCookies();
      });

      await test.step('Act: Mở URL đăng xuất', async () => {
        await crmLoginPage.logoutByUrl();
      });

      await test.step('Assert: Về trang đăng nhập, hai ô rỗng, không trang lỗi, không dải thông báo', async () => {
        await expect.soft(page, '[b] Phải dừng ở /admin/authentication').toHaveURL(LOGIN_URL);
        await expect.soft(crmLoginPage.emailInput, '[b] Ô Email phải rỗng').toHaveValue('');
        await expect.soft(crmLoginPage.alerts, '[b] Không được có dải thông báo nào').toHaveCount(0);
      });
    });
  });

  test('Cookie ghi nhớ còn lại sau khi đăng xuất chủ động không tự đăng nhập lại', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page, context }) => {
    await meta({
      id: 'CRM_LOGIN_TC_037',
      feature: 'CRM · Đăng xuất',
      severity: 'critical',
      description: 'Đăng nhập có tích Remember me rồi đăng xuất chủ động: cookie autologin vẫn còn nhưng gõ thẳng /admin/ '
        + 'vẫn bị đưa về trang đăng nhập — cookie còn mà vô hiệu.',
    });
    const { email, password } = env.crmAdmin();
    let cookieBeforeLogout = '';

    await test.step('Arrange: Xoá cookie rồi đăng nhập Admin có tích Remember me', async () => {
      await context.clearCookies();
      await crmLoginPage.open();
      await crmLoginPage.fillCredentials(email, password);
      await crmLoginPage.clickRememberLabel();
      await crmLoginPage.clickLoginButton();
      await expect(page, 'Đăng nhập tiền đề phải vào Dashboard').toHaveURL(DASHBOARD_URL);
    });

    await test.step('Assert: 🔧 Có cookie autologin sau khi đăng nhập', async () => {
      const cookie = (await context.cookies()).find(c => c.name === AUTOLOGIN_COOKIE);
      expect(cookie, 'Phải tồn tại cookie autologin khi tích Remember me').toBeDefined();
      cookieBeforeLogout = cookie!.value;
    });

    await test.step('Act: Mở URL đăng xuất', async () => {
      await crmLoginPage.logoutByUrl();
    });

    await test.step('Assert: Đăng xuất thành công, dừng ở trang đăng nhập', async () => {
      await expect(page, 'Đăng xuất phải dừng ở trang đăng nhập').toHaveURL(LOGIN_URL);
    });

    await test.step('Act: Gõ thẳng /admin/', async () => {
      await page.goto('/admin/');
    });

    await test.step('Assert: Không tự đăng nhập lại — vẫn ở trang đăng nhập', async () => {
      await expect(page, 'Phải bị đưa về /admin/authentication, không tự đăng nhập lại').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.heading, 'Phải hiển thị biểu mẫu đăng nhập').toBeVisible();
    });

    await test.step('Assert: 🔧 Cookie autologin vẫn còn nguyên giá trị nhưng vô hiệu', async () => {
      const cookie = (await context.cookies()).find(c => c.name === AUTOLOGIN_COOKIE);
      expect(cookie?.value === cookieBeforeLogout, 'Cookie autologin phải còn nguyên giá trị sau khi đăng xuất chủ động').toBe(true);
    });
  });
});
