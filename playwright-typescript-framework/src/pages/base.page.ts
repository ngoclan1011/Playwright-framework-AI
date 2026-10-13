import { expect, Locator, Page, Request, Response, test } from '@playwright/test';
import { logger } from '../utils/logger';

export abstract class BasePage {
  /** Đường dẫn tương đối của trang, ghép với baseURL */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /** Trả về response của tài liệu HTML — dùng cho test cần kiểm mã HTTP */
  async open(): Promise<Response | null> {
    return test.step(`Mở trang ${this.path}`, async () => {
      logger.info(`Mở trang ${this.path}`);
      const response = await this.page.goto(this.path);
      await this.page.waitForLoadState('domcontentloaded');
      return response;
    });
  }

  /** Ghi lại request POST từ lúc gọi tới khi `stop()` — chứng minh biểu mẫu có (hoặc không) được gửi đi */
  watchPostRequests(): { urls: string[]; stop: () => void } {
    const urls: string[] = [];
    const onRequest = (request: Request): void => {
      if (request.method() === 'POST') urls.push(request.url());
    };
    this.page.on('request', onRequest);
    return { urls, stop: () => this.page.off('request', onRequest) };
  }

  /** Ghi lại mã HTTP của mọi phản hồi có URL chứa `urlPart` — chứng minh có (hoặc không) mã lỗi như 429 */
  watchResponseStatuses(urlPart: string): number[] {
    const statuses: number[] = [];
    this.page.on('response', response => {
      if (response.url().includes(urlPart)) statuses.push(response.status());
    });
    return statuses;
  }

  /** Ghi lại nội dung mọi hộp thoại JavaScript (alert/confirm) bật lên và tự đóng — chứng minh không có mã lạ được thực thi */
  watchDialogs(): string[] {
    const messages: string[] = [];
    this.page.on('dialog', async dialog => {
      messages.push(dialog.message());
      await dialog.dismiss();
    });
    return messages;
  }

  /** Giả lập mạng chậm kiểu "Slow 3G" của DevTools — chỉ chạy được trên Chromium */
  async emulateSlow3G(): Promise<void> {
    await test.step('Giả lập mạng Slow 3G', async () => {
      const session = await this.page.context().newCDPSession(this.page);
      await session.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 400,
        downloadThroughput: (400 * 1024) / 8,
        uploadThroughput: (400 * 1024) / 8,
      });
    });
  }

  /**
   * Bấm rồi đợi trình duyệt nạp xong trang phản hồi — dùng khi trang kết quả CÙNG URL với trang cũ (gửi biểu mẫu sai
   * nhiều lần liên tiếp). Không thay được bằng `waitForURL`: URL đã khớp từ trước nên nó trả về ngay, test sẽ đọc
   * nhầm trang cũ. `waitForNavigation` phải được gọi TRƯỚC khi click (trong Promise.all) để không lỡ sự kiện.
   */
  protected async clickAndWaitForPage(locator: Locator, stepName: string): Promise<Response | null> {
    return test.step(stepName, async () => {
      const [response] = await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        locator.click(),
      ]);
      return response;
    });
  }

  /** Click sau khi element sẵn sàng — dựa vào auto-waiting, không hard sleep */
  protected async clickWhenReady(locator: Locator, stepName: string): Promise<void> {
    await test.step(stepName, async () => {
      logger.info(stepName);
      await expect(locator).toBeEnabled();
      await locator.click();
    });
  }

  /** Xoá giá trị cũ rồi điền. `masked` = true với mật khẩu để không lộ trong report/log */
  protected async fillField(locator: Locator, value: string, fieldName: string, masked = false): Promise<void> {
    const shown = masked ? '******' : value;
    await test.step(`Nhập ${fieldName}: ${shown}`, async () => {
      logger.info(`Nhập ${fieldName}: ${shown}`);
      await expect(locator).toBeVisible();
      await locator.fill(value);
    });
  }
}
