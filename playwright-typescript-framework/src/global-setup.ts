import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Xoá kết quả Allure của lần chạy trước — nếu không, report cộng dồn và lẫn các lần chạy.
 * Bỏ qua khi `KEEP_ALLURE_RESULTS=1`: scripts/run-browsers.mjs chạy lần lượt từng trình duyệt
 * (mỗi trình duyệt một lượt `playwright test`) và tự xoá MỘT lần ở đầu, để kết quả
 * của trình duyệt chạy trước không bị lượt sau xoá mất.
 */
export default function globalSetup(): void {
  if (process.env.KEEP_ALLURE_RESULTS === '1') return;
  fs.rmSync(path.resolve(__dirname, '../reports/allure-results'), { recursive: true, force: true });
}
