package com.anhtester.mobile.tests;

import com.anhtester.mobile.base.BaseTest;
import com.anhtester.mobile.screens.DashboardScreen;
import com.anhtester.mobile.screens.SignInScreen;
import com.anhtester.mobile.utils.JsonDataReader;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.util.Map;

/** Ví dụ data-driven: mỗi dòng trong test-data/signin-invalid.json là một TC có mã riêng. */
@Feature("Xác thực — Đăng nhập (Android)")
public class SignInValidationTest extends BaseTest {

    @DataProvider(name = "invalidSignIn")
    public Object[][] invalidSignIn() {
        return JsonDataReader.asDataProvider("test-data/signin-invalid.json");
    }

    @Test(dataProvider = "invalidSignIn", groups = {"regression", "auth", "validation"},
            description = "Sign in: dữ liệu không hợp lệ bị app chặn, hiện câu lỗi dưới ô")
    @Story("Kiểm tra dữ liệu nhập ở Sign in")
    @Severity(SeverityLevel.NORMAL)
    @Description("Nhập bộ dữ liệu không hợp lệ rồi bấm Login account → app chặn ngay, hiện đúng câu lỗi dưới ô "
            + "và vẫn ở màn Sign in. Dữ liệu: test-data/signin-invalid.json.")
    public void signInIsBlockedByClientValidation(Map<String, String> row) {
        Allure.label("testId", row.get("tcId"));
        Allure.label("tag", "@Validation");
        Allure.getLifecycle().updateTestCase(tc -> tc.setName(row.get("title")));
        startFromCleanApp();

        SignInScreen signIn = Allure.step("Arrange: Mở màn Sign in từ Dashboard",
                () -> new DashboardScreen(driver()).waitUntilLoaded().openSignIn());

        Allure.step("Act: Nhập Email '" + row.get("email") + "', Password theo bộ dữ liệu rồi bấm Login account", () -> {
            signIn.enterEmail(row.get("email"));
            signIn.enterPassword(row.get("password"));
            signIn.submit();
        });

        Allure.step("Assert: Hiện câu lỗi '" + row.get("expectedError") + "' và vẫn ở Sign in", () -> {
            Assert.assertTrue(signIn.isErrorDisplayed(row.get("expectedError")),
                    "Phải hiện câu lỗi '" + row.get("expectedError") + "' dưới ô");
            Assert.assertTrue(signIn.isDisplayed(), "Vẫn phải ở màn Sign in — form không được gửi đi");
        });
    }
}
