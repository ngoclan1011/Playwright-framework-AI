import * as dotenv from 'dotenv';
import * as path from 'node:path';

const projectRoot = path.resolve(__dirname, '../..');
dotenv.config({ path: path.join(projectRoot, '.env'), quiet: true });

/**
 * Trình duyệt do Playwright tải (Firefox, ffmpeg quay video) nằm TRONG project — mặc định `.browsers/`.
 * Lý do: trên Windows, tiến trình chạy trong app đóng gói (MSIX) bị ảo hoá %LOCALAPPDATA%\ms-playwright,
 * Firefox cài ở đó báo "side-by-side configuration is incorrect" (không nạp được mozglue.dll).
 * Đặt ở đây (config nạp trước khi Playwright mở worker) nên mọi worker dùng chung đường dẫn này.
 * Chrome và Edge là bản cài sẵn trên máy (`channel`), không phụ thuộc biến này.
 */
process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve(projectRoot, process.env.PLAYWRIGHT_BROWSERS_PATH || '.browsers');

/** Cặp tài khoản tuỳ chọn — null khi chưa khai báo đủ trong .env; test cần nó tự skip, không làm đỏ cả suite */
function optionalCredentials(emailKey: string, passwordKey: string): Credentials | null {
  const email = process.env[emailKey];
  const password = process.env[passwordKey];
  return email && password ? { email, password } : null;
}

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}. Kiểm tra file .env (xem .env.example)`);
  }
  return value;
}

export interface Credentials {
  email: string;
  password: string;
}

export const env = {
  baseURL: process.env.BASE_URL ?? 'https://book.anhtester.com',
  crmBaseURL: process.env.CRM_URL ?? 'https://crm.anhtester.com',
  headless: process.env.HEADLESS !== 'false',
  timeout: Number(process.env.TIMEOUT ?? 60_000),
  /** Số luồng song song CHO MỖI TRÌNH DUYỆT (các trình duyệt chạy lần lượt, không chạy cùng lúc) */
  workers: Number(process.env.WORKERS ?? 5),
  /** Đọc lười: chỉ test @auth mới gọi, nên thiếu tài khoản vẫn chạy được test công khai */
  credentials(): Credentials {
    return { email: required('TEST_EMAIL'), password: required('TEST_PASSWORD') };
  },
  crmAdmin(): Credentials {
    return { email: required('CRM_ADMIN_EMAIL'), password: required('CRM_ADMIN_PASSWORD') };
  },
  crmProjectManager(): Credentials {
    return { email: required('CRM_PM_EMAIL'), password: required('CRM_PM_PASSWORD') };
  },
  /** Tài khoản khách hàng (cổng /login) — dùng cho TC có vai Customer */
  crmCustomer(): Credentials | null {
    return optionalCredentials('CRM_CUSTOMER_EMAIL', 'CRM_CUSTOMER_PASSWORD');
  },
  /** Tài khoản staff có mật khẩu chứa chữ cái — dùng cho TC đổi kiểu chữ hoa/thường (admin demo chỉ có số) */
  crmTc014(): Credentials | null {
    return optionalCredentials('CRM_TC014_EMAIL', 'CRM_TC014_PASSWORD');
  },
} as const;
