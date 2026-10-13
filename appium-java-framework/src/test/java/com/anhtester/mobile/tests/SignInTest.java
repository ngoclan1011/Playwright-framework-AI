package com.anhtester.mobile.tests;

import com.anhtester.mobile.base.BaseTest;
import com.anhtester.mobile.config.AppConfig;
import com.anhtester.mobile.screens.DashboardScreen;
import com.anhtester.mobile.screens.SignInScreen;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import io.qameta.allure.Story;
import org.testng.Assert;
import org.testng.SkipException;
import org.testng.annotations.Test;

@Feature("Xác thực — Đăng nhập (Android)")
public class SignInTest extends BaseTest {

    @Test(groups = {"smoke", "auth"},
            description = "Chưa đăng nhập, bấm thẻ \"Book management sign in\" trên Dashboard mở Sign in")
    @Story("Mở màn Sign in")
    @Severity(SeverityLevel.CRITICAL)
    @Description("Mở app ở trạng thái sạch, bấm thẻ 'Book management sign in' trên Dashboard → màn Sign in hiện "
            + "đủ ô Email address, Password, nút Login account và liên kết Get started. Nguồn: REQ-BK-AUTH-51.")
    public void openSignInFromDashboardCard() {
        Allure.label("testId", "BK_AUTH_TC_003");
        Allure.label("tag", "@Smoke");
        startFromCleanApp();

        DashboardScreen dashboard = new DashboardScreen(driver());
        Allure.step("Arrange: Chờ Dashboard tải xong ở trạng thái chưa đăng nhập", () -> dashboard.waitUntilLoaded());

        SignInScreen signIn = Allure.step("Act: Bấm thẻ 'Book management sign in'", () -> dashboard.openSignIn());

        Allure.step("Assert: Màn Sign in hiện đủ thành phần", () -> {
            Assert.assertTrue(signIn.isDisplayed(), "Ô 'Email address' phải hiển thị trên màn Sign in");
            Assert.assertTrue(signIn.isGetStartedDisplayed(), "Liên kết 'Get started' phải hiển thị trên màn Sign in");
        });
    }

    @Test(groups = {"smoke", "auth"},
            description = "Đăng nhập thành công bằng tài khoản đã đăng ký, Dashboard hiện lời chào")
    @Story("Đăng nhập thành công")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Đăng nhập bằng tài khoản cấu hình ở BOOK_USER_EMAIL / BOOK_USER_PASSWORD → Dashboard hiện "
            + "'Welcome <tên>'. Khác BK_AUTH_TC_004 ở chỗ dùng tài khoản có sẵn thay vì tài khoản vừa đăng ký. "
            + "Test bị SKIP nếu chưa khai tài khoản.")
    public void signInWithRegisteredAccount() {
        Allure.label("testId", "BK_AUTH_TC_004");
        Allure.label("tag", "@Smoke");
        String email = AppConfig.bookUserEmail();
        String password = AppConfig.bookUserPassword();
        if (email.isBlank() || password.isBlank()) {
            throw new SkipException("Chưa khai BOOK_USER_EMAIL / BOOK_USER_PASSWORD trong .env");
        }
        startFromCleanApp();

        SignInScreen signIn = Allure.step("Arrange: Mở màn Sign in từ Dashboard",
                () -> new DashboardScreen(driver()).waitUntilLoaded().openSignIn());

        DashboardScreen dashboard = Allure.step("Act: Đăng nhập bằng tài khoản đã đăng ký",
                () -> signIn.login(email, password));

        Allure.step("Assert: Dashboard hiện lời chào 'Welcome'", () ->
                Assert.assertTrue(dashboard.isWelcomeDisplayed(),
                        "Sau khi đăng nhập thành công, Dashboard phải hiện lời chào bắt đầu bằng 'Welcome'"));
    }
}
