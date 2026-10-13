import { expect, test } from '../../fixtures/api.fixture';
import { meta } from '../../utils/allure-meta';
import { validateSchema } from '../../utils/schema-validator';
import { TestData } from '../../utils/test-data';

test.describe('API Sách', () => {
  test('API lấy danh sách sách trả đúng số lượng theo limit', {
    tag: ['@smoke', '@api', '@book'],
  }, async ({ bookApi }) => {
    await meta({
      id: 'BOOK_BOOKS_TC_001',
      feature: 'API Sách',
      severity: 'critical',
      description: 'Gọi GET /api/book?page=1&limit=2 (không cần đăng nhập): trả 200, tối đa 2 cuốn, '
        + 'thông tin phân trang khớp với số bản ghi trả về.',
    });

    const response = await test.step('Act: Lấy trang 1, mỗi trang 2 cuốn', () => bookApi.list({ page: 1, limit: 2 }));

    await test.step('Assert: Trả 200, đúng schema và đúng phân trang', async () => {
      expect(response.status(), 'Lấy danh sách phải trả 200').toBe(200);
      const body = await response.json();
      expect(validateSchema('book-list', body), 'Body phải khớp schema book-list').toEqual([]);
      expect(body.list.length, 'Số cuốn trả về không vượt quá limit=2').toBeLessThanOrEqual(2);
      expect(body.pagination.currentPage, 'Trang hiện tại phải là 1').toBe(1);
      expect(body.pagination.lengthData, 'lengthData phải bằng số cuốn trả về').toBe(body.list.length);
    });
  });

  test('API lấy chi tiết sách theo id', {
    tag: ['@regression', '@api', '@book'],
  }, async ({ bookApi }) => {
    await meta({
      id: 'BOOK_BOOKS_TC_002',
      feature: 'API Sách',
      severity: 'normal',
      description: 'Lấy id của một cuốn trong danh sách, gọi GET /api/book/{id}: trả 200 và đúng cuốn sách đó.',
    });

    const target = await test.step('Arrange: Lấy id một cuốn sách từ danh sách', async () => {
      const body = await (await bookApi.list({ page: 1, limit: 1 })).json();
      expect(body.list.length, 'Hệ thống phải có ít nhất 1 cuốn sách để kiểm').toBeGreaterThan(0);
      return body.list[0] as { id: string; name: string };
    });

    const response = await test.step('Act: Lấy chi tiết sách theo id', () => bookApi.getById(target.id));

    await test.step('Assert: Trả 200 và đúng cuốn sách', async () => {
      expect(response.status(), 'Lấy chi tiết phải trả 200').toBe(200);
      const body = await response.json();
      expect(validateSchema('book-detail', body), 'Body phải khớp schema book-detail').toEqual([]);
      expect(body.id, 'Phải trả đúng id đã hỏi').toBe(target.id);
      expect(body.name, 'Tên sách phải khớp với danh sách').toBe(target.name);
    });
  });

  test('API trả 404 khi lấy sách không tồn tại', {
    tag: ['@regression', '@api', '@book'],
  }, async ({ bookApi }) => {
    await meta({
      id: 'BOOK_BOOKS_TC_003',
      feature: 'API Sách',
      severity: 'normal',
      description: 'Gọi GET /api/book/{id} với id không tồn tại thì trả 404 kèm thông báo "Book not found."',
    });

    const response = await test.step('Act: Lấy chi tiết với id không tồn tại',
      () => bookApi.getById(TestData.bookName('notFound')));

    await test.step('Assert: Trả 404 kèm thông báo', async () => {
      expect(response.status(), 'id không tồn tại phải trả 404').toBe(404);
      const body = await response.json();
      expect(body.msg, 'Thông báo lỗi phải đúng nguyên văn').toBe('Book not found.');
    });
  });

  test('API tạo sách mới thành công và tìm lại được theo tên', {
    tag: ['@smoke', '@api', '@book', '@auth'],
  }, async ({ bookApi, categoryApi, accessToken }) => {
    await meta({
      id: 'BOOK_BOOKS_TC_004',
      feature: 'API Sách',
      severity: 'blocker',
      description: 'Đã đăng nhập, tạo thể loại riêng rồi tạo sách mới qua POST /api/book: trả thành công kèm "Book created successfully.", '
        + 'tìm lại được cuốn sách theo tên với đúng giá và thể loại. Test tự xoá sách và thể loại đã tạo. '
        + 'Mã đúng 201 theo spec kiểm riêng ở BOOK_BOOKS_TC_005 (@knownbug).',
    });
    const category = TestData.bookName('bookCategory');
    const book = { name: TestData.bookName('createBook'), status: 'AVAILABLE' as const, categories: [category], price: 125_000 };
    let createdId: string | undefined;

    try {
      await test.step('Arrange: Tạo thể loại riêng cho test', async () => {
        const response = await categoryApi.create(category, accessToken);
        expect(response.status(), 'Tạo thể loại phải trả 201').toBe(201);
      });

      const response = await test.step('Act: Tạo sách mới', () => bookApi.create(book, accessToken));

      await test.step('Assert: Tạo thành công và tìm lại được sách đúng dữ liệu', async () => {
        expect(response.ok(), `Tạo sách phải thành công (2xx), nhận ${response.status()}`).toBe(true);
        expect((await response.json()).msg, 'Thông báo phải đúng nguyên văn').toBe('Book created successfully.');
        const found = await bookApi.findByName(book.name);
        expect(found, 'Phải tìm lại được sách vừa tạo theo tên').toBeDefined();
        createdId = found!.id;
        const detail = await (await bookApi.getById(createdId)).json();
        expect(detail.price, 'Giá sách phải đúng giá đã tạo').toBe(book.price);
        expect(detail.categories, 'Thể loại phải đúng thể loại đã tạo').toEqual([category]);
      });
    } finally {
      // Chỉ xoá đúng bản ghi test này tạo — môi trường dùng chung
      await test.step('Cleanup: Xoá sách và thể loại đã tạo', async () => {
        if (createdId) await bookApi.remove(createdId, accessToken);
        await categoryApi.remove(category, accessToken);
      });
    }
  });

  test('API tạo sách mới phải trả đúng mã 201 Created theo spec', {
    tag: ['@regression', '@api', '@book', '@auth', '@knownbug'],
  }, async ({ bookApi, categoryApi, accessToken }) => {
    await meta({
      id: 'BOOK_BOOKS_TC_005',
      feature: 'API Sách',
      severity: 'minor',
      description: '🐞 REQ-BK-BOOK-83 · AMB-BK-BOOK-23 (chốt: spec đúng): tạo sách thành công qua POST /api/book phải trả 201. '
        + 'Hiện trạng hệ thống trả 200 — FAIL là kết quả đúng, không hạ assertion. Test tự xoá sách và thể loại đã tạo.',
    });
    const category = TestData.bookName('bookCategory201');
    const book = { name: TestData.bookName('createBook201'), status: 'AVAILABLE' as const, categories: [category], price: 125_000 };

    try {
      await test.step('Arrange: Tạo thể loại riêng cho test', async () => {
        const response = await categoryApi.create(category, accessToken);
        expect(response.status(), 'Tạo thể loại phải trả 201').toBe(201);
      });

      const response = await test.step('Act: Tạo sách mới', () => bookApi.create(book, accessToken));

      await test.step('Assert: Trả đúng 201 Created', async () => {
        expect(response.status(), 'Tạo sách phải trả 201 theo spec').toBe(201);
      });
    } finally {
      // Chỉ xoá đúng bản ghi test này tạo — môi trường dùng chung
      await test.step('Cleanup: Xoá sách và thể loại đã tạo', async () => {
        const found = await bookApi.findByName(book.name);
        if (found) await bookApi.remove(found.id, accessToken);
        await categoryApi.remove(category, accessToken);
      });
    }
  });
});
