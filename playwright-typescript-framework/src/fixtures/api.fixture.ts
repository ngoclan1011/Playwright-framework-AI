import { test as base, expect } from '@playwright/test';
import { AddressApi } from '../api/address.api';
import { AuthApi } from '../api/auth.api';
import { ApiCallLog } from '../api/base.api';
import { BookApi } from '../api/book.api';
import { CategoryApi } from '../api/category.api';
import { env } from '../utils/env.config';

type ApiFixtures = {
  apiLog: ApiCallLog;
  authApi: AuthApi;
  bookApi: BookApi;
  categoryApi: CategoryApi;
  addressApi: AddressApi;
  /** Token của tài khoản trong .env — chỉ test @auth mới dùng */
  accessToken: string;
};

export const test = base.extend<ApiFixtures>({
  apiLog: [async ({}, use, testInfo) => {
    const log = new ApiCallLog();
    await use(log);
    if (log.calls.length > 0) {
      await testInfo.attach('nhat_ky_api', {
        body: JSON.stringify(log.calls, null, 2),
        contentType: 'application/json',
      });
    }
  }, { auto: true }],

  authApi: async ({ request, apiLog }, use) => use(new AuthApi(request, apiLog)),
  bookApi: async ({ request, apiLog }, use) => use(new BookApi(request, apiLog)),
  categoryApi: async ({ request, apiLog }, use) => use(new CategoryApi(request, apiLog)),
  addressApi: async ({ request, apiLog }, use) => use(new AddressApi(request, apiLog)),

  accessToken: async ({ authApi }, use) => {
    const { email, password } = env.credentials();
    const response = await authApi.login(email, password);
    expect(response.status(), 'Đăng nhập API bằng TEST_EMAIL/TEST_PASSWORD trong .env phải trả 200').toBe(200);
    const body = (await response.json()) as { accessToken: string };
    await use(body.accessToken);
  },
});

export { expect };
