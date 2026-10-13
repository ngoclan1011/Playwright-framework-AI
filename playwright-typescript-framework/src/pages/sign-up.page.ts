import { BasePage } from './base.page';

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

/** Locator đã verify trên DOM thật ngày 24-09-2026 — mỗi locator khớp đúng 1 phần tử */
export class SignUpPage extends BasePage {
  protected readonly path = '/sign-up';

  readonly heading = this.page.getByRole('heading', { name: 'Sign up', level: 3 });
  readonly signInLink = this.page.getByRole('link', { name: 'Sign in' });
  readonly nameInput = this.page.getByRole('textbox', { name: 'Name', exact: true });
  readonly phoneInput = this.page.getByRole('textbox', { name: 'Phone', exact: true });
  readonly divisionSelect = this.page.getByRole('combobox', { name: 'Division' });
  readonly wardSelect = this.page.getByRole('combobox', { name: 'Ward' });
  readonly addressInput = this.page.getByRole('textbox', { name: 'Address', exact: true });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email', exact: true });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password', exact: true });
  readonly passwordConfirmInput = this.page.getByRole('textbox', { name: 'Password Confirmation', exact: true });
  readonly registerButton = this.page.getByRole('button', { name: 'Register' });

  async fillForm(data: SignUpData): Promise<void> {
    await this.fillField(this.nameInput, data.name, 'Name');
    if (data.phone) await this.fillField(this.phoneInput, data.phone, 'Phone');
    await this.fillField(this.emailInput, data.email, 'Email');
    await this.fillField(this.passwordInput, data.password, 'Password', true);
    await this.fillField(this.passwordConfirmInput, data.password, 'Password Confirmation', true);
  }

  async submit(): Promise<void> {
    await this.clickWhenReady(this.registerButton, 'Bấm nút Register');
  }
}
