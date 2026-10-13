import wardCases from '../../../test-data/address-wards.json';
import { expect, test } from '../../fixtures/api.fixture';
import { meta } from '../../utils/allure-meta';
import { validateSchema } from '../../utils/schema-validator';

test.describe('API Địa chỉ', () => {
  test('API lấy danh sách tỉnh/thành', {
    tag: ['@smoke', '@api', '@address'],
  }, async ({ addressApi }) => {
    await meta({
      id: 'BOOK_ADDRESS_TC_001',
      feature: 'API Địa chỉ',
      severity: 'normal',
      description: 'Gọi GET /api/address (không cần đăng nhập): trả 200, danh sách tỉnh/thành không rỗng và có "Thành phố Hà Nội".',
    });

    const response = await test.step('Act: Lấy danh sách tỉnh/thành', () => addressApi.divisions());

    await test.step('Assert: Trả 200, danh sách có Thành phố Hà Nội', async () => {
      expect(response.status(), 'Lấy tỉnh/thành phải trả 200').toBe(200);
      const body = await response.json();
      expect(validateSchema('string-array', body), 'Body phải là mảng chuỗi').toEqual([]);
      expect(body, 'Danh sách phải có Thành phố Hà Nội').toContain('Thành phố Hà Nội');
    });
  });

  for (const data of wardCases) {
    test(`API danh sách phường/xã: ${data.title}`, {
      tag: ['@regression', '@api', '@address'],
    }, async ({ addressApi }) => {
      await meta({
        id: `BOOK_ADDRESS_TC_002-${data.variant}`,
        feature: 'API Địa chỉ',
        severity: 'normal',
        description: `Gọi GET /api/address/{divname} với "${data.division}": ${data.title}.`,
      });

      const response = await test.step(`Act: Lấy phường/xã của "${data.division}"`, () => addressApi.wards(data.division));

      await test.step('Assert: Trả 200 và danh sách đúng kỳ vọng', async () => {
        expect(response.status(), 'Lấy phường/xã phải trả 200').toBe(200);
        const body = await response.json();
        expect(validateSchema('string-array', body), 'Body phải là mảng chuỗi').toEqual([]);
        if (data.expectEmpty) {
          expect(body, 'Tỉnh/thành không tồn tại phải trả danh sách rỗng').toEqual([]);
        } else {
          expect(body, `Danh sách phải có "${data.sampleWard}"`).toContain(data.sampleWard);
        }
      });
    });
  }
});
