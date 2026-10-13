import { Response } from '@playwright/test';
import { BasePage } from '../base.page';

/** Trang Quên mật khẩu khu quản trị Perfex CRM. Locator verify trên DOM thật ngày 10-10-2026 */
export class CrmForgotPasswordPage extends BasePage {
  protected readonly path = '/admin/authentication/forgot_password';

  readonly heading = this.page.getByRole('heading', { name: 'Forgot Password', level: 1 });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email Address' });
  readonly confirmButton = this.page.getByRole('button', { name: 'Confirm' });
  readonly alerts = this.page.locator('.alert');

  // Nhóm kiểm kỹ thuật (@TechCheck) — không có biểu hiện nhìn thấy nên dùng CSS
  readonly form = this.page.locator('form');
  readonly csrfInput = this.page.locator('input[type=hidden][name=csrf_token_name]');
  readonly allLinks = this.page.locator('a');

  /** Nhập email rồi bấm Confirm — dùng khi trình duyệt có thể chặn gửi (email sai định dạng) nên không đợi trang nạp lại */
  async submitEmail(email: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email Address');
    await this.clickWhenReady(this.confirmButton, 'Bấm nút Confirm');
  }

  async submitEmailAndWaitForPage(email: string): Promise<Response | null> {
    await this.fillField(this.emailInput, email, 'Email Address');
    return this.confirmAndWaitForPage();
  }

  /** Bấm Confirm rồi đợi trình duyệt nạp xong trang phản hồi (cùng URL với trang cũ) */
  async confirmAndWaitForPage(): Promise<Response | null> {
    return this.clickAndWaitForPage(this.confirmButton, 'Bấm nút Confirm và đợi trang phản hồi nạp xong');
  }
}
