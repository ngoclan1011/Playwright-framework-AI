import { BasePage } from '../base.page';

/** Cổng đăng nhập khách hàng (Customer) của Perfex CRM — khác hẳn khu quản trị /admin. Locator verify trên DOM thật ngày 10-10-2026 */
export class CrmClientLoginPage extends BasePage {
  protected readonly path = '/login';

  readonly emailInput = this.page.locator('#email');
  readonly passwordInput = this.page.locator('#password');
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email (cổng khách hàng)');
    await this.fillField(this.passwordInput, password, 'Password (cổng khách hàng)', true);
    await this.clickWhenReady(this.loginButton, 'Bấm nút Login ở cổng khách hàng');
  }
}
