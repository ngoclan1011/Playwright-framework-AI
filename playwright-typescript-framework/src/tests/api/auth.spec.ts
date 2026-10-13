import { expect, test } from '../../fixtures/api.fixture';
import { meta } from '../../utils/allure-meta';
import { env } from '../../utils/env.config';
import { validateSchema } from '../../utils/schema-validator';
import { TestData } from '../../utils/test-data';

test.describe('API Xác thực', () => {
  test('API /api/me từ chối khi không gửi token', {
    tag: ['@smoke', '@api', '@security'],
  }, async ({ authApi }) => {
    await meta({
      id: 'BOOK_AUTH_TC_007',
      feature: 'API Xác thực',
      severity: 'critical',
      description: 'Gọi GET /api/me không kèm header Authorization thì API phải từ chối với mã 401 và có thông báo lỗi.',
    });

    const response = await test.step('Act: Gọi /api/me không kèm token', () => authApi.me());

    await test.step('Assert: Trả 401 kèm thông báo lỗi', async () => {
      expect(response.status(), 'Thiếu token phải trả 401').toBe(401);
      expect(validateSchema('message', await response.json()), 'Body lỗi phải có trường msg').toEqual([]);
    });
  });

  test('API đăng ký tài khoản mới rồi đăng nhập và lấy hồ sơ thành công', {
    tag: ['@smoke', '@api', '@auth'],
  }, async ({ authApi }) => {
    await meta({
      id: 'BOOK_AUTH_TC_008',
      feature: 'API Xác thực',
      severity: 'blocker',
      description: 'Đăng ký tài khoản mới qua POST /api/register, đăng nhập bằng tài khoản đó để lấy accessToken, '
        + 'rồi gọi GET /api/me — hồ sơ trả về đúng email vừa đăng ký.',
    });
    const user = { name: TestData.name('registerApi'), email: TestData.email('registerApi'), password: TestData.password() };

    await test.step('Arrange: Đăng ký tài khoản mới', async () => {
      const response = await authApi.register(user);
      expect(response.status(), 'Đăng ký phải trả 201').toBe(201);
    });

    const token = await test.step('Act: Đăng nhập bằng tài khoản vừa đăng ký', async () => {
      const response = await authApi.login(user.email, user.password);
      expect(response.status(), 'Đăng nhập phải trả 200').toBe(200);
      const body = await response.json();
      expect(validateSchema('login-success', body), 'Body đăng nhập phải khớp schema login-success').toEqual([]);
      return body.accessToken as string;
    });

    await test.step('Assert: /api/me trả đúng hồ sơ của tài khoản vừa tạo', async () => {
      const response = await authApi.me(token);
      expect(response.status(), 'Có token hợp lệ phải trả 200').toBe(200);
      const body = await response.json();
      expect(validateSchema('me', body), 'Hồ sơ phải khớp schema me').toEqual([]);
      expect(body.email, 'Email hồ sơ phải là email vừa đăng ký').toBe(user.email);
    });
  });

  test('API đăng nhập thất bại khi sai mật khẩu', {
    tag: ['@regression', '@api', '@auth'],
  }, async ({ authApi }) => {
    await meta({
      id: 'BOOK_AUTH_TC_009',
      feature: 'API Xác thực',
      severity: 'critical',
      description: 'Đăng nhập POST /api/login bằng email của tài khoản demo nhưng sai mật khẩu thì bị từ chối (4xx) và không cấp token.',
    });
    const { email } = env.credentials();

    const response = await test.step('Act: Đăng nhập với mật khẩu sai', () => authApi.login(email, 'Wrong@123456'));

    await test.step('Assert: Bị từ chối, không có accessToken', async () => {
      expect(response.status(), 'Sai mật khẩu phải trả mã 4xx').toBeGreaterThanOrEqual(400);
      expect(response.status(), 'Sai mật khẩu phải trả mã 4xx').toBeLessThan(500);
      const body = await response.json();
      expect(body.accessToken, 'Không được cấp accessToken khi sai mật khẩu').toBeUndefined();
    });
  });
});
