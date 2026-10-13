import { test } from '@playwright/test';
import { BasePage } from '../base.page';

/**
 * Danh sách Task của Perfex CRM — chỉ dùng để dựng và dọn dữ liệu cho TC cần bộ đếm giờ đang chạy.
 * Locator verify trên DOM thật (phiên Admin) ngày 10-10-2026. Page class chỉ CHỜ trạng thái, không assert —
 * phần kiểm chứng kết quả nằm ở test.
 */
export class CrmTasksPage extends BasePage {
  protected readonly path = '/admin/tasks';

  readonly newTaskButton = this.page.getByRole('link', { name: 'New Task' }).first();
  readonly newTaskModal = this.page.locator('#_task_modal');
  readonly subjectInput = this.newTaskModal.locator('#name');
  readonly publicCheckbox = this.newTaskModal.locator('#task_is_public');
  readonly publicLabel = this.newTaskModal.getByText('Public', { exact: true });
  readonly saveButton = this.newTaskModal.getByRole('button', { name: 'Save' });

  readonly taskDetailModal = this.page.locator('.task-modal-single');
  readonly startTimerLink = this.taskDetailModal.getByRole('link', { name: 'Start Timer' });

  readonly searchInput = this.page.locator('#tasks_filter input[type=search]');
  readonly rows = this.page.locator('#tasks tbody tr');
  readonly tableBody = this.page.locator('#tasks tbody');

  /** Tạo task riêng tư (bỏ tích Public); sau khi lưu hệ thống mở cửa sổ chi tiết task */
  async createPrivateTask(subject: string): Promise<void> {
    await test.step(`Tạo task riêng tư "${subject}"`, async () => {
      await this.clickWhenReady(this.newTaskButton, 'Bấm nút New Task');
      await this.newTaskModal.waitFor();
      await this.fillField(this.subjectInput, subject, 'Subject');
      if (await this.publicCheckbox.isChecked()) await this.publicLabel.click();
      await this.clickWhenReady(this.saveButton, 'Bấm Save');
      await this.taskDetailModal.waitFor();
    });
  }

  async startTimer(): Promise<void> {
    await this.clickWhenReady(this.startTimerLink, 'Bấm Start Timer trong cửa sổ chi tiết task');
  }

  async searchTask(subject: string): Promise<void> {
    await this.fillField(this.searchInput, subject, 'Ô tìm kiếm task');
  }

  /** Xoá task theo Subject qua nút Delete của dòng (có hộp xác nhận gốc của trình duyệt), đợi dòng biến mất */
  async deleteTask(subject: string): Promise<void> {
    await test.step(`Dọn dẹp: xoá task "${subject}"`, async () => {
      await this.open();
      await this.searchTask(subject);
      const row = this.rows.filter({ hasText: subject });
      await row.hover();
      this.page.once('dialog', dialog => void dialog.accept());
      await row.getByRole('link', { name: 'Delete' }).click();
      await row.waitFor({ state: 'detached' });
    });
  }
}
