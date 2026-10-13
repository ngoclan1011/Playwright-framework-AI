import { expect, test } from '../../fixtures/api.fixture';
import { meta } from '../../utils/allure-meta';
import { validateSchema } from '../../utils/schema-validator';

test.describe('API Thể loại sách', () => {
  test('API lấy danh sách thể loại sách', {
    tag: ['@smoke', '@api', '@category'],
  }, async ({ categoryApi }) => {
    await meta({
      id: 'BOOK_CATEGORY_TC_001',
      feature: 'API Thể loại',
      severity: 'normal',
      description: 'Gọi GET /api/category-book (không cần đăng nhập): trả 200, mỗi thể loại có tên và số sách không âm.',
    });

    const response = await test.step('Act: Lấy danh sách thể loại', () => categoryApi.list({ page: 1, limit: 20 }));

    await test.step('Assert: Trả 200 và đúng schema', async () => {
      expect(response.status(), 'Lấy danh sách thể loại phải trả 200').toBe(200);
      const body = await response.json();
      expect(validateSchema('category-list', body), 'Body phải khớp schema category-list').toEqual([]);
      expect(body.list.length, 'Phải có ít nhất 1 thể loại').toBeGreaterThan(0);
    });
  });
});
