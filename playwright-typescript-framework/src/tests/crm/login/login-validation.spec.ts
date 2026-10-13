import variants from '../../../../test-data/crm-login-variants.json';
import { meta } from '../../../utils/allure-meta';
import { env } from '../../../utils/env.config';
import { TestData } from '../../../utils/test-data';
import { expect, test } from '../../../fixtures/ui.fixture';
import { DASHBOARD_URL, INVALID_CREDENTIALS, LOGIN_URL } from './login-flow';

test.describe('CRM · Đăng nhập — Kiểm tra dữ liệu đầu vào & Đăng nhập thất bại', () => {
  // TC gộp 4 biến thể → 1 test; mỗi biến thể 1 step mang mã riêng để FAIL vẫn chỉ đúng biến thể
  test('Kiểm tra trường bắt buộc trên biểu mẫu đăng nhập', {
    tag: ['@smoke', '@regression', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_011',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Gửi biểu mẫu với 4 biến thể bỏ trống (a: cả hai · b: riêng Email · c: riêng Password · d: toàn khoảng trắng): '
        + 'không vào được Dashboard, báo đúng từng dải "field is required" theo đúng thứ tự, không kèm "Invalid email or password".',
    });

    for (const data of variants.tc011) {
      await test.step(`Biến thể CRM_LOGIN_TC_011-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        await test.step('Act: Nhập dữ liệu biến thể và bấm Login', async () => {
          await crmLoginPage.fillCredentials(data.usesAdminEmail ? env.crmAdmin().email : data.email, data.password);
          await crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Ở lại trang đăng nhập, đúng số dải và đúng nội dung từng dải theo thứ tự', async () => {
          await expect.soft(page, `[${data.variant}] Không được vào Dashboard, phải ở lại trang đăng nhập`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.alerts,
            `[${data.variant}] Số dải và nội dung từng dải phải đúng nguyên văn, đúng thứ tự trên xuống`).toHaveText(data.alerts);
        });
      });
    }
  });

  test('Email sai định dạng bị trình duyệt chặn ngay, biểu mẫu không gửi đi', {
    tag: ['@regression', '@boundary', '@security', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_012',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Nhập 5 biến thể email sai định dạng (thiếu @, thiếu tên miền, thiếu phần trước @, nhiều @, chuỗi tiêm SQL): '
        + 'trình duyệt chặn tại ô Email, không có request POST nào gửi đi, trang không nạp lại, dữ liệu hai ô còn nguyên.',
    });
    const password = 'Abc12345';

    for (const data of variants.tc012) {
      await test.step(`Biến thể CRM_LOGIN_TC_012-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập và bắt đầu theo dõi request gửi đi', async () => {
          await crmLoginPage.open();
        });
        const posts = crmLoginPage.watchPostRequests();

        await test.step('Act: Nhập email sai định dạng, nhập mật khẩu, bấm Login', async () => {
          await crmLoginPage.fillCredentials(data.email, password);
          await crmLoginPage.clickLoginButton();
        });
        posts.stop();

        await test.step('Assert: Trình duyệt chặn ở ô Email — không gửi request, không nạp lại, dữ liệu còn nguyên', async () => {
          const emailIsInvalid = await crmLoginPage.emailInput.evaluate(el => !(el as HTMLInputElement).validity.valid);
          expect.soft(emailIsInvalid, `[${data.variant}] Trình duyệt phải đánh dấu ô Email không hợp lệ (bong bóng cảnh báo)`).toBe(true);
          expect.soft(posts.urls, `[${data.variant}] Không được có request POST nào gửi lên máy chủ`).toHaveLength(0);
          await expect.soft(page, `[${data.variant}] Trang không được chuyển hướng`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.emailInput, `[${data.variant}] Ô Email phải còn nguyên chữ đã nhập`).toHaveValue(data.email);
          await expect.soft(crmLoginPage.passwordInput, `[${data.variant}] Ô Password phải còn nguyên chữ đã nhập`).toHaveValue(password);
          await expect.soft(crmLoginPage.alerts, `[${data.variant}] Không được hiện dải báo lỗi của hệ thống`).toHaveCount(0);
        });
      });
    }
  });

  test('Sai thông tin đăng nhập trả về một thông báo chung, không tiết lộ email nào có thật', {
    tag: ['@smoke', '@regression', '@security', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_013',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Gửi (a) email có thật + mật khẩu sai và (b) email không tồn tại: cả hai đều ở lại trang đăng nhập, đúng 1 dải '
        + '"Invalid email or password", kết quả giống hệt nhau — không lộ email nào có thật.',
    });
    const adminEmail = env.crmAdmin().email;
    const cases = [
      { variant: 'a', title: 'Email có thật, mật khẩu sai', email: adminEmail, password: TestData.wrongPassword('tc013a') },
      { variant: 'b', title: 'Email không tồn tại', email: TestData.email('tc013b'), password: TestData.wrongPassword('tc013b') },
    ];
    const observed: Array<{ alerts: string[]; url: string }> = [];

    for (const data of cases) {
      await test.step(`Biến thể CRM_LOGIN_TC_013-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        await test.step('Act: Nhập thông tin biến thể và bấm Login', async () => {
          await crmLoginPage.fillCredentials(data.email, data.password);
          await crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Ở lại trang đăng nhập, đúng 1 dải "Invalid email or password"', async () => {
          await expect.soft(page, `[${data.variant}] Phải ở lại trang đăng nhập`).toHaveURL(LOGIN_URL);
          await expect.soft(crmLoginPage.alerts, `[${data.variant}] Phải đúng 1 dải, nguyên văn "${INVALID_CREDENTIALS}"`)
            .toHaveText([INVALID_CREDENTIALS]);
          observed.push({ alerts: await crmLoginPage.alerts.allInnerTexts(), url: page.url() });
        });
      });
    }

    await test.step('Assert: Hai bộ kết quả giống hệt nhau — không lộ email nào có thật', async () => {
      expect(observed, 'Phải thu đủ kết quả của cả hai biến thể').toHaveLength(2);
      expect(observed[1], 'Kết quả (nội dung, số dải, URL) của email không tồn tại phải giống hệt email có thật')
        .toEqual(observed[0]);
    });
  });

  test('Mật khẩu đúng nhưng sai kiểu chữ hoa/thường thì bị từ chối', {
    tag: ['@regression', '@security', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_014',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Nhập đúng email staff test nhưng mật khẩu bị đảo kiểu chữ hoa/thường: không vào được Dashboard, '
        + 'đúng 1 dải "Invalid email or password". Cần tài khoản có mật khẩu chứa chữ cái (CRM_TC014_EMAIL / CRM_TC014_PASSWORD).',
    });
    const account = env.crmTc014();
    test.skip(!account, 'Chưa khai CRM_TC014_EMAIL / CRM_TC014_PASSWORD trong .env — tài khoản demo admin chỉ có mật khẩu bằng số');
    const { email, password } = account!;

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Nhập email đúng và mật khẩu đã đảo hoa/thường, bấm Login', async () => {
      await crmLoginPage.fillCredentials(email, TestData.swapCase(password));
      await crmLoginPage.clickLoginAndWaitForPage();
    });

    await test.step('Assert: Bị từ chối bằng đúng 1 dải "Invalid email or password"', async () => {
      await expect(page, 'Không được vào Dashboard').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.alerts, 'Phải đúng 1 dải báo lỗi chung').toHaveText([INVALID_CREDENTIALS]);
    });
  });

  test('Đăng nhập sai nhiều lần liên tiếp không làm khoá tài khoản và không chặn theo IP', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_015',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Gửi sai 6 lần cùng 1 email (a) rồi sai 5 lần với 5 email khác nhau (b): mọi lần đều chỉ báo "Invalid email or password", '
        + 'không có từ khoá khoá/giới hạn, không HTTP 429, và đăng nhập đúng ngay sau đó vẫn vào được Dashboard.',
    });
    const { email: adminEmail, password: adminPassword } = env.crmAdmin();
    const cases = [
      { variant: 'a', title: 'Khoá theo email — 6 lần cùng email', emails: Array<string>(6).fill(adminEmail) },
      { variant: 'b', title: 'Khoá theo IP — 5 email khác nhau',
        emails: Array.from({ length: 5 }, (_, i) => TestData.email(`tc015b${i + 1}`)) },
    ];
    const lockoutWords = ['locked', 'blocked', 'too many', 'try again in'];
    const statuses = crmLoginPage.watchResponseStatuses('/admin/authentication');

    for (const data of cases) {
      await test.step(`Biến thể CRM_LOGIN_TC_015-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Kết thúc phiên cũ bằng URL đăng xuất, mở trang đăng nhập', async () => {
          await crmLoginPage.logoutByUrl();
          await crmLoginPage.open();
        });

        for (const [index, email] of data.emails.entries()) {
          await test.step(`Lần gửi sai thứ ${index + 1}/${data.emails.length}`, async () => {
            await test.step('Act: Gửi biểu mẫu với mật khẩu sai', async () => {
              await crmLoginPage.fillCredentials(email, TestData.wrongPassword('tc015'));
              await crmLoginPage.clickLoginAndWaitForPage();
            });

            await test.step('Assert: Đúng 1 dải báo lỗi chung, nội dung không đổi qua các lần', async () => {
              await expect.soft(crmLoginPage.alerts,
                `[${data.variant}] Lần ${index + 1}: phải đúng 1 dải "${INVALID_CREDENTIALS}", không đổi qua các lần`)
                .toHaveText([INVALID_CREDENTIALS]);
            });
          });
        }

        await test.step('Assert: Không có từ khoá khoá tài khoản / giới hạn và không HTTP 429', async () => {
          const text = (await crmLoginPage.visibleText()).toLowerCase();
          for (const word of lockoutWords) {
            expect.soft(text, `[${data.variant}] Trang không được chứa "${word}"`).not.toContain(word);
          }
          expect.soft(statuses, `[${data.variant}] Không phản hồi nào được trả HTTP 429`).not.toContain(429);
        });

        await test.step('Act: Đăng nhập bằng cặp đúng ngay sau đó', async () => {
          await crmLoginPage.login(adminEmail, adminPassword);
        });

        await test.step('Assert: Đăng nhập thành công, dừng ở /admin/', async () => {
          await expect.soft(page, `[${data.variant}] Tài khoản không được bị khoá — phải vào Dashboard`).toHaveURL(DASHBOARD_URL);
        });
      });
    }
  });

  test('Sau khi đăng nhập thất bại, ô Email phải còn giữ email vừa nhập', {
    tag: ['@regression', '@knownbug', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage }) => {
    await meta({
      id: 'CRM_LOGIN_TC_016',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: '🐞 Bug đang mở BUG_login_1787226514_TC016: sau khi đăng nhập thất bại, ô Email phải còn email vừa nhập. '
        + 'Hiện trạng ô Email trở về rỗng — FAIL là kết quả đúng, không sửa test.',
    });
    const { email } = env.crmAdmin();

    await test.step('Arrange: Mở trang đăng nhập (ngữ cảnh sạch, không tự điền)', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Nhập email đúng + mật khẩu sai, bấm Login', async () => {
      await crmLoginPage.fillCredentials(email, TestData.wrongPassword('tc016'));
      await crmLoginPage.clickLoginAndWaitForPage();
    });

    await test.step('Assert: Hiện dải lỗi và ô Email còn giữ email vừa nhập', async () => {
      await expect(crmLoginPage.alerts, 'Phải hiện dải báo lỗi chung').toHaveText([INVALID_CREDENTIALS]);
      await expect(crmLoginPage.emailInput, 'Ô Email phải còn giữ email vừa nhập — người dùng không phải gõ lại').toHaveValue(email);
    });
  });

  test('Chuỗi tấn công nhập vào ô Password không vượt qua được xác thực và không được thực thi', {
    tag: ['@regression', '@security', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_017',
      feature: 'CRM · Đăng nhập',
      severity: 'blocker',
      description: 'Nhập chuỗi XSS (a) và chuỗi tiêm SQL (b) vào ô Password: không vào được Dashboard, không hộp thoại nào bật lên, '
        + 'chỉ báo "Invalid email or password", HTTP 200, không lộ lỗi cơ sở dữ liệu, chuỗi tấn công không thành thẻ script sống.',
    });
    const dialogs = crmLoginPage.watchDialogs();

    for (const data of variants.tc017) {
      await test.step(`Biến thể CRM_LOGIN_TC_017-${data.variant} — ${data.title}`, async () => {
        await test.step('Arrange: Nạp lại trang đăng nhập', async () => {
          await crmLoginPage.open();
        });

        const response = await test.step('Act: Nhập chuỗi tấn công vào ô Password, bấm Login', async () => {
          const email = data.usesAdminEmail ? env.crmAdmin().email : TestData.email('tc017');
          await crmLoginPage.fillCredentials(email, data.password);
          return crmLoginPage.clickLoginAndWaitForPage();
        });

        await test.step('Assert: Bị từ chối, không hộp thoại, không lộ lỗi, chuỗi tấn công không thực thi', async () => {
          await expect.soft(page, `[${data.variant}] Không được vào Dashboard`).toHaveURL(LOGIN_URL);
          expect.soft(dialogs, `[${data.variant}] Không được có hộp thoại nào bật lên`).toHaveLength(0);
          await expect.soft(crmLoginPage.alerts, `[${data.variant}] Phải chỉ có dải "${INVALID_CREDENTIALS}"`).toHaveText([INVALID_CREDENTIALS]);
          expect.soft(response?.status(), `[${data.variant}] Phản hồi phải là HTTP 200, không phải 500`).toBe(200);
          const html = await page.content();
          expect.soft(html, `[${data.variant}] Chuỗi tấn công không được xuất hiện dạng thẻ script sống`)
            .not.toContain('<script>alert(1)</script>');
          const text = (await crmLoginPage.visibleText()).toLowerCase();
          for (const trace of ['sql syntax', 'mysqli', 'database error', 'a php error']) {
            expect.soft(text, `[${data.variant}] Không được lộ dấu vết lỗi cơ sở dữ liệu "${trace}"`).not.toContain(trace);
          }
        });
      });
    }
  });

  test('Mật khẩu chứa ký tự đa ngôn ngữ và emoji không làm hệ thống lỗi máy chủ', {
    tag: ['@regression', '@boundary', '@localization', '@techcheck', '@login', '@crm'],
  }, async ({ crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_018',
      feature: 'CRM · Đăng nhập',
      severity: 'normal',
      description: 'Nhập mật khẩu tiếng Việt có dấu kèm emoji: trang nạp lại bình thường (HTTP 200), đúng 1 dải '
        + '"Invalid email or password", không vỡ ký tự, không trang lỗi máy chủ.',
    });

    await test.step('Arrange: Mở trang đăng nhập', async () => {
      await crmLoginPage.open();
    });

    const response = await test.step('Act: Nhập email không tồn tại + mật khẩu đa ngôn ngữ kèm emoji, bấm Login', async () => {
      await crmLoginPage.fillCredentials(TestData.email('tc018'), 'MậtKhẩuTiếngViệt😀🎉');
      return crmLoginPage.clickLoginAndWaitForPage();
    });

    await test.step('Assert: Về đúng trang đăng nhập, HTTP 200, đúng 1 dải báo lỗi chung', async () => {
      expect(response?.status(), 'Phản hồi phải là HTTP 200, không phải 500').toBe(200);
      await expect(page, 'Phải ở lại trang đăng nhập').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.alerts, 'Phải đúng 1 dải, hiển thị đúng tiếng Anh, không vỡ ký tự').toHaveText([INVALID_CREDENTIALS]);
    });
  });

  test('Tài khoản khách hàng hợp lệ bị từ chối ở khu quản trị mà không lộ ra rằng email đó có tài khoản', {
    tag: ['@regression', '@security', '@permission', '@techcheck', '@login', '@crm', '@auth'],
  }, async ({ crmLoginPage, crmClientLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_019',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Cặp Customer hợp lệ: bị từ chối ở /admin với thông báo chung, nhưng đăng nhập được ở cổng khách hàng '
        + '(loại trừ sai mật khẩu); kết quả ở /admin giống hệt email không tồn tại — không lộ email có tài khoản.',
    });
    const customer = env.crmCustomer();
    test.skip(!customer, 'Chưa khai CRM_CUSTOMER_EMAIL / CRM_CUSTOMER_PASSWORD trong .env');
    const { email, password } = customer!;
    const observed: Array<{ alerts: string[]; url: string }> = [];

    await test.step('Arrange: Mở trang đăng nhập khu quản trị', async () => {
      await crmLoginPage.open();
    });

    await test.step('Act: Gửi cặp Customer ở khu quản trị', async () => {
      await crmLoginPage.fillCredentials(email, password);
      await crmLoginPage.clickLoginAndWaitForPage();
    });

    await test.step('Assert: Bị từ chối bằng đúng 1 dải "Invalid email or password"', async () => {
      await expect(page, 'Không được vào /admin/').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.alerts, 'Phải đúng 1 dải báo lỗi chung').toHaveText([INVALID_CREDENTIALS]);
      observed.push({ alerts: await crmLoginPage.alerts.allInnerTexts(), url: page.url() });
    });

    await test.step('Act: Gửi đúng cặp đó ở cổng khách hàng', async () => {
      await crmClientLoginPage.open();
      await crmClientLoginPage.login(email, password);
    });

    await test.step('Assert: Đăng nhập thành công ở cổng khách hàng — loại trừ khả năng sai mật khẩu', async () => {
      await expect(page, 'Phải dừng ở trang chủ cổng khách hàng').toHaveURL(`${env.crmBaseURL}/`);
      await expect(page, 'Tab trình duyệt của cổng khách hàng phải ghi HKD Anh Tester').toHaveTitle(/HKD Anh Tester/);
    });

    await test.step('Act: Quay lại khu quản trị, gửi email không tồn tại', async () => {
      await crmLoginPage.open();
      await crmLoginPage.fillCredentials(TestData.email('tc019'), TestData.wrongPassword('tc019'));
      await crmLoginPage.clickLoginAndWaitForPage();
      observed.push({ alerts: await crmLoginPage.alerts.allInnerTexts(), url: page.url() });
    });

    await test.step('Assert: Kết quả Customer giống hệt email không tồn tại — không lộ email có tài khoản', async () => {
      expect(observed[1], 'Nội dung dải, số dải và URL phải giống hệt giữa email Customer và email không tồn tại')
        .toEqual(observed[0]);
    });
  });

  test('Đang có phiên cổng khách hàng hợp lệ vẫn không mở được URL nội bộ khu quản trị', {
    tag: ['@regression', '@security', '@permission', '@login', '@crm', '@auth'],
  }, async ({ crmClientLoginPage, crmLoginPage, page }) => {
    await meta({
      id: 'CRM_LOGIN_TC_020',
      feature: 'CRM · Đăng nhập',
      severity: 'critical',
      description: 'Đang đăng nhập cổng khách hàng, gõ thẳng /admin/clients: bị đưa về trang đăng nhập khu quản trị, '
        + 'không thấy dữ liệu nghiệp vụ — Customer hành xử như khách chưa đăng nhập.',
    });
    const customer = env.crmCustomer();
    test.skip(!customer, 'Chưa khai CRM_CUSTOMER_EMAIL / CRM_CUSTOMER_PASSWORD trong .env');
    const { email, password } = customer!;

    await test.step('Arrange: Đăng nhập ở cổng khách hàng', async () => {
      await crmClientLoginPage.open();
      await crmClientLoginPage.login(email, password);
      await expect(page, 'Phiên cổng khách hàng phải đang hoạt động').toHaveURL(`${env.crmBaseURL}/`);
    });

    await test.step('Act: Gõ thẳng URL nội bộ /admin/clients', async () => {
      await page.goto('/admin/clients');
    });

    await test.step('Assert: Bị đưa về trang đăng nhập khu quản trị, không thấy dữ liệu nghiệp vụ', async () => {
      await expect(page, 'Phải dừng ở /admin/authentication').toHaveURL(LOGIN_URL);
      await expect(crmLoginPage.heading, 'Phải hiển thị biểu mẫu đăng nhập khu quản trị').toBeVisible();
    });
  });
});
