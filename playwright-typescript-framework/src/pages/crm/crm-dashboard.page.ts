import { BasePage } from '../base.page';

/**
 * Dashboard khu quản trị Perfex CRM. Locator verify trên DOM thật (phiên Admin) ngày 24-09-2026, bổ sung 10-10-2026.
 * Menu trái và ảnh đại diện không có role/nhãn riêng (ảnh alt rỗng) nên dùng id `side-menu` và class ngữ nghĩa.
 * Trong DOM có 2 `li.header-logout` (desktop + mobile); chỉ phần tử CON TRỰC TIẾP của `.dropdown-menu` là lối desktop dùng được.
 */
export class CrmDashboardPage extends BasePage {
  protected readonly path = '/admin/';

  readonly body = this.page.locator('body');
  readonly sideMenu = this.page.locator('#side-menu');
  readonly sideMenuItems = this.sideMenu.locator(':scope > li[class*="menu-item-"]');
  readonly avatar = this.page.locator('#header img.staff-profile-image-small');

  // Menu ảnh đại diện (desktop)
  readonly userMenu = this.page.locator('ul.dropdown-menu:has(> li.header-logout)');
  readonly userMenuItems = this.userMenu.locator(':scope > li');
  readonly userMenuLogout = this.page.locator('.dropdown-menu > li.header-logout');
  readonly logoutLinkInUserMenu = this.userMenuLogout.getByRole('link', { name: 'Logout' });
  readonly allLogoutEntries = this.page.locator('li.header-logout');
  readonly visibleLogoutEntries = this.page.locator('li.header-logout:visible');

  // Bộ đếm giờ công việc ở thanh đầu trang
  readonly timersList = this.page.locator('#started-timers-top');

  // Lớp xác nhận đăng xuất khi còn bộ đếm giờ đang chạy
  readonly timerLogoutDialog = this.page.locator('#system-popup');
  readonly timerLogoutTitle = this.timerLogoutDialog.getByText('Started tasks timers found!');
  readonly timerLogoutQuestion = this.timerLogoutDialog.getByText('Are you sure you want to logout without stopping the timers?');
  readonly timerLogoutConfirmButton = this.timerLogoutDialog.getByRole('link', { name: 'Logout' });

  // Menu điều hướng thu gọn (mobile)
  readonly mobileMenuToggle = this.page.locator('button.mobile-menu-toggle');
  readonly mobileMenu = this.page.locator('#mobile-collapse');
  readonly mobileLogout = this.mobileMenu.locator('li.header-logout').getByRole('link', { name: 'Logout' });

  /** Chữ hiển thị của từng mục cấp 1 trong menu trái, theo thứ tự */
  async sideMenuLabels(): Promise<string[]> {
    const labels = await this.sideMenuItems.locator(':scope > a').allInnerTexts();
    return labels.map(label => label.trim());
  }

  /** Dòng chữ đầu tiên của từng mục trong menu ảnh đại diện (mục Language có menu con lồng bên trong) */
  async userMenuLabels(): Promise<string[]> {
    const texts = await this.userMenuItems.allInnerTexts();
    return texts.map(text => text.split('\n')[0].trim());
  }

  async openUserMenu(): Promise<void> {
    await this.clickWhenReady(this.avatar, 'Bấm ảnh đại diện góc trên bên phải');
  }

  async clickLogoutInUserMenu(): Promise<void> {
    await this.clickWhenReady(this.logoutLinkInUserMenu, 'Bấm mục Logout trong menu ảnh đại diện');
  }

  async openMobileMenu(): Promise<void> {
    await this.clickWhenReady(this.mobileMenuToggle, 'Bấm nút mở menu điều hướng thu gọn');
  }

  async clickLogoutInMobileMenu(): Promise<void> {
    await this.clickWhenReady(this.mobileLogout, 'Bấm mục Logout trong menu thu gọn');
  }
}
