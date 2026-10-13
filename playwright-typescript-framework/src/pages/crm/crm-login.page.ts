import { Locator, Request, Response, test } from '@playwright/test';
import { BasePage } from '../base.page';

/** Trang đăng nhập khu quản trị Perfex CRM. Locator verify trên DOM thật ngày 24-09-2026, bổ sung 10-10-2026 — mỗi locator khớp đúng 1 phần tử */
export class CrmLoginPage extends BasePage {
  protected readonly path = '/admin/authentication';

  readonly body = this.page.locator('body');
  readonly logoLink = this.page.getByRole('link', { name: 'Perfex CRM | Anh Tester Demo' });
  readonly heading = this.page.getByRole('heading', { name: 'Login', level: 1 });
  readonly emailInput = this.page.getByRole('textbox', { name: 'Email Address' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly rememberCheckbox = this.page.getByRole('checkbox', { name: 'Remember me' });
  readonly rememberLabel = this.page.getByText('Remember me', { exact: true });
  readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  readonly forgotPasswordLink = this.page.getByRole('link', { name: 'Forgot Password?' });
  readonly invalidCredentialsAlert = this.page.getByText('Invalid email or password');
  readonly pageExpiredMessage = this.page.getByText('419 Page Expired!');
  readonly thirdPartyLoginButtons = this.page.getByRole('button', { name: /google|facebook|microsoft/i });

  // Nhóm kiểm kỹ thuật (@TechCheck) — không có biểu hiện nhìn thấy nên dùng CSS
  readonly loginForm = this.page.locator('form', { has: this.page.locator('#password') });
  readonly submitButtons = this.page.locator('button[type=submit], input[type=submit]');
  readonly captchaWidgets = this.page.locator('.g-recaptcha, [class*=captcha], iframe[src*=recaptcha]');
  readonly scripts = this.page.locator('script');
  readonly formLabels = this.page.locator('form label');
  readonly formButtons = this.page.locator('form button');
  readonly passwordToggleControls = this.loginForm
    .locator('i[class*="eye"], [class*="toggle-password"], [class*="show-password"]')
    .or(this.loginForm.getByText(/^(Show|Hiện)$/))
    .or(this.loginForm.getByRole('button', { name: /show|hide|hiện|ẩn/i }));

  /** Mọi dải báo lỗi của hệ thống (nền đỏ) — gồm cả báo thiếu trường bắt buộc và "Invalid email or password" */
  readonly alerts = this.page.locator('.alert');
  readonly csrfInput = this.page.locator('input[type=hidden][name=csrf_token_name]');
  readonly pageExpiredDetail = this.page.getByText(
    'Sorry, the page has expired, return to previous page and refresh to continue.');

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email Address');
    await this.fillField(this.passwordInput, password, 'Password', true);
  }

  async login(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.clickLoginButton();
  }

  async clickLoginButton(): Promise<void> {
    await this.clickWhenReady(this.loginButton, 'Bấm nút Login');
  }

  /**
   * Bấm Login rồi đợi trình duyệt nạp xong trang phản hồi. Dùng khi trang kết quả cùng URL và cùng dải báo lỗi
   * với trang cũ (gửi sai nhiều lần liên tiếp) — chỉ riêng assertion trên dải báo lỗi không phân biệt được hai trang.
   */
  async clickLoginAndWaitForPage(): Promise<Response | null> {
    return this.clickAndWaitForPage(this.loginButton, 'Bấm nút Login và đợi trang phản hồi nạp xong');
  }

  /** Bấm Login và trả về tham số của request POST đã gửi — chỉ để kiểm TÊN tham số, không đọc giá trị mật khẩu ra ngoài */
  async clickLoginAndCapturePostParams(): Promise<URLSearchParams> {
    return test.step('Bấm nút Login và ghi lại tham số của request gửi đi', async () => {
      const posted = this.page.waitForRequest(
        request => request.method() === 'POST' && request.url().endsWith('/admin/authentication'));
      await this.clickWhenReady(this.loginButton, 'Bấm nút Login');
      return new URLSearchParams((await posted).postData() ?? '');
    });
  }

  /** Sửa giá trị mã chống CSRF ẩn của biểu mẫu — thay cho thao tác DevTools của tester */
  async tamperCsrfToken(value: string): Promise<void> {
    await test.step('Sửa giá trị mã chống CSRF ẩn của biểu mẫu', async () => {
      await this.csrfInput.evaluate((input, newValue) => {
        (input as HTMLInputElement).value = newValue;
      }, value);
    });
  }

  /** Toàn bộ chữ đang hiển thị trên trang — dùng để tìm dấu vết khoá tài khoản / lỗi cơ sở dữ liệu */
  async visibleText(): Promise<string> {
    return this.body.innerText();
  }

  /** Bấm Login 2 lần liên tiếp (< 1 giây) — kiểm chống gửi trùng */
  async doubleClickLogin(): Promise<void> {
    await test.step('Bấm nút Login hai lần liên tiếp', async () => {
      await this.loginButton.dblclick();
    });
  }

  /** Chỉ gõ vào ô Password để kiểm việc che ký tự — không gửi biểu mẫu. Giá trị luôn che trong report/log */
  async typePassword(value: string): Promise<void> {
    await this.fillField(this.passwordInput, value, 'Password', true);
  }

  async clickRememberLabel(): Promise<void> {
    await this.clickWhenReady(this.rememberLabel, 'Bấm vào chữ Remember me');
  }

  async fillEmail(email: string): Promise<void> {
    await this.fillField(this.emailInput, email, 'Email Address');
  }

  /** Gõ bằng bàn phím vào ô đang có tiêu điểm — không chọn ô bằng chuột */
  async typeWithKeyboard(text: string): Promise<void> {
    await test.step('Gõ bằng bàn phím vào ô đang có tiêu điểm', async () => {
      await this.page.keyboard.type(text);
    });
  }

  async pressKey(key: string): Promise<void> {
    await test.step(`Nhấn phím ${key}`, async () => {
      await this.page.keyboard.press(key);
    });
  }

  /** Đưa giá trị vào clipboard rồi dán vào ô Password bằng Ctrl+V — cần quyền clipboard của context (Chromium) */
  async pastePassword(value: string): Promise<void> {
    await test.step('Dán mật khẩu từ clipboard vào ô Password bằng Ctrl+V', async () => {
      await this.passwordInput.clear();
      await this.passwordInput.focus();
      await this.page.evaluate(text => navigator.clipboard.writeText(text), value);
      try {
        await this.page.keyboard.press('Control+V');
      } finally {
        // Không để mật khẩu thật nằm lại trong clipboard của máy chạy test (headed dùng clipboard của hệ điều hành)
        await this.page.evaluate(() => navigator.clipboard.writeText(''));
      }
    });
  }

  /** Kiểu viền hiện tại của một ô nhập (màu, độ dày, bóng đổ) — để so ô có tiêu điểm với ô không có tiêu điểm */
  async borderOf(locator: Locator): Promise<string> {
    return locator.evaluate(el => {
      const style = getComputedStyle(el);
      return `${style.borderTopColor}|${style.borderTopWidth}|${style.boxShadow}`;
    });
  }

  /** 7 thành phần phải thấy trên trang đăng nhập, theo thứ tự từ trên xuống */
  sevenComponents(): Record<string, Locator> {
    return {
      'logo Anh Tester': this.logoLink,
      'tiêu đề Login': this.heading,
      'ô Email Address': this.emailInput,
      'ô Password': this.passwordInput,
      'ô tích Remember me': this.rememberCheckbox,
      'nút Login': this.loginButton,
      'liên kết Forgot Password?': this.forgotPasswordLink,
    };
  }

  /** Đo bố cục: khung nằm giữa, nút Login rộng bằng ô nhập, 7 thành phần xếp trên xuống, khối sau không chồng lên khối trước */
  async measureLayout(): Promise<{
    leftSpace: number; rightSpace: number; buttonWidth: number; inputWidth: number; verticalOrderIsClean: boolean;
  }> {
    const formBox = (await this.loginForm.boundingBox())!;
    const viewportWidth = this.page.viewportSize()!.width;
    const inputBox = (await this.emailInput.boundingBox())!;
    const buttonBox = (await this.loginButton.boundingBox())!;
    const boxes = [];
    for (const [name, element] of Object.entries(this.sevenComponents())) {
      const box = await element.boundingBox();
      if (!box) throw new Error(`Không đo được vị trí "${name}" — thành phần đang bị ẩn`);
      boxes.push(box);
    }
    let clean = true;
    for (let i = 1; i < boxes.length; i++) {
      // Đỉnh khối sau không được nằm trên đáy khối trước (cho phép lệch 1px do làm tròn)
      if (boxes[i].y + 1 < boxes[i - 1].y + boxes[i - 1].height) clean = false;
    }
    return {
      leftSpace: formBox.x,
      rightSpace: viewportWidth - (formBox.x + formBox.width),
      buttonWidth: buttonBox.width,
      inputWidth: inputBox.width,
      verticalOrderIsClean: clean,
    };
  }

  async clickForgotPassword(): Promise<void> {
    await this.clickWhenReady(this.forgotPasswordLink, 'Bấm liên kết Forgot Password?');
  }

  async clickLogo(): Promise<void> {
    await this.clickWhenReady(this.logoLink, 'Bấm logo ANHTESTER');
  }

  /** Nạp lại trang, trả về số request tải file JavaScript */
  async reloadCountingScriptRequests(): Promise<number> {
    return test.step('Nạp lại trang đăng nhập', async () => {
      let scriptRequests = 0;
      const onRequest = (request: Request): void => {
        if (request.resourceType() === 'script') scriptRequests++;
      };
      this.page.on('request', onRequest);
      try {
        await this.page.reload({ waitUntil: 'load' });
      } finally {
        this.page.off('request', onRequest);
      }
      return scriptRequests;
    });
  }

  /**
   * Đợi mạng yên rồi mới mở URL đăng xuất. Dashboard còn request AJAX đang bay (vd /admin/tasks/table): nếu phiên bị
   * kết thúc lúc đó, Perfex lưu URL AJAX làm "trang quay lại sau đăng nhập" nên lần đăng nhập kế tiếp bị chuyển
   * sai chỗ (hoặc gặp 419) — gây đỏ thất thường khi chạy song song.
   */
  async logoutByUrl(): Promise<void> {
    await test.step('Mở URL đăng xuất để kết thúc mọi phiên còn sót', async () => {
      await this.page.waitForLoadState('networkidle');
      await this.page.goto('/admin/authentication/logout');
    });
  }
}
