import { BasePage } from './base.page';

/** Locator đã verify trên DOM thật ngày 24-09-2026 — mỗi locator khớp đúng 1 phần tử */
export class SignInPage extends BasePage {
  protected readonly path = '/sign-in';

  readonly heading = this.page.getByRole('heading', { name: 'Sign in', level: 3 });
  readonly getStartedLink = this.page.getByRole('link', { name: 'Get started' });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email address', exact: true });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password', exact: true });
  readonly loginButton = this.page.getByRole('button', { name: 'Login account' });

  async login(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email address');
    await this.fillField(this.passwordInput, password, 'Password', true);
    await this.clickWhenReady(this.loginButton, 'Bấm nút Login account');
  }

  async goToSignUp(): Promise<void> {
    await this.clickWhenReady(this.getStartedLink, 'Bấm liên kết Get started');
  }
}
