import type { Page } from '@playwright/test';
import { expect } from '../../../fixtures/ui.fixture';
import { env } from '../../../utils/env.config';
import type { Credentials } from '../../../utils/env.config';
import type { CrmLoginPage } from '../../../pages/crm/crm-login.page';

export const LOGIN_URL = `${env.crmBaseURL}/admin/authentication`;
export const DASHBOARD_URL = `${env.crmBaseURL}/admin/`;
export const FORGOT_PASSWORD_URL = `${env.crmBaseURL}/admin/authentication/forgot_password`;
export const CLIENTS_URL = `${env.crmBaseURL}/admin/clients`;
export const LOGIN_PAGE_TITLE = 'Perfex CRM | Anh Tester Demo - Login';

export const INVALID_CREDENTIALS = 'Invalid email or password';
export const EMAIL_REQUIRED = 'The Email Address field is required.';
export const EMAIL_NOT_VALID = 'The Email Address field must contain a valid email address.';

/** Mở trang đăng nhập, đăng nhập bằng tài khoản đã cho và xác nhận đã vào Dashboard — bước Arrange dùng chung của nhiều TC */
export async function signIn(crmLoginPage: CrmLoginPage, page: Page, { email, password }: Credentials): Promise<void> {
  await crmLoginPage.open();
  await crmLoginPage.login(email, password);
  await expect(page, 'Đăng nhập tiền đề phải vào được Dashboard').toHaveURL(DASHBOARD_URL);
  // Dashboard còn request AJAX đang bay — đợi yên trước khi thao tác tiếp để không đụng nhau (xem logoutByUrl)
  await page.waitForLoadState('networkidle');
}
