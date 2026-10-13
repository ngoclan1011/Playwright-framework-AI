package com.anhtester.mobile.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.AppiumDriver;
import io.qameta.allure.Step;
import org.openqa.selenium.By;

import java.time.Duration;

/**
 * Màn Sign in của app Book Anhtester.
 * Ghi chú từ khảo sát (requirements_auth_mobile.md mục 8):
 *  - resource-id của ô nhập TỰ SINH (_r_k_ …) → CẤM dùng.
 *  - hint bị nối câu lỗi khi ô đang lỗi → dùng starts-with(@hint, ...), KHÔNG dùng @hint='...'.
 *  - Bấm "Login account" có lúc không gửi form (RISK-BK-AUTH-08) → ẩn bàn phím trước, assert theo KẾT QUẢ.
 */
public class SignInScreen extends BaseScreen {

    private final By emailInput = byPlatform(
            AppiumBy.xpath("//android.widget.EditText[starts-with(@hint,'Email address')]"),
            // ⚠️ PLACEHOLDER iOS — app chưa khảo sát trên iOS
            AppiumBy.iOSNsPredicateString("type == 'XCUIElementTypeTextField' AND placeholderValue BEGINSWITH 'Email address'"));

    private final By passwordInput = byPlatform(
            AppiumBy.xpath("//android.widget.EditText[starts-with(@hint,'Password')]"),
            // ⚠️ PLACEHOLDER iOS
            AppiumBy.iOSNsPredicateString("type == 'XCUIElementTypeSecureTextField'"));

    private final By loginButton = byPlatform(
            AppiumBy.xpath("//android.widget.Button[@text='Login account']"),
            // ⚠️ PLACEHOLDER iOS
            AppiumBy.iOSNsPredicateString("type == 'XCUIElementTypeButton' AND label == 'Login account'"));

    private final By getStartedLink = byPlatform(
            AppiumBy.accessibilityId("Get started"),
            // ⚠️ PLACEHOLDER iOS
            AppiumBy.accessibilityId("Get started"));

    public SignInScreen(AppiumDriver driver) {
        super(driver);
    }

    @Step("Chờ màn Sign in hiển thị")
    public SignInScreen waitUntilLoaded() {
        waitForVisible(emailInput);
        waitForVisible(loginButton);
        return this;
    }

    @Step("Nhập Email address: {email}")
    public SignInScreen enterEmail(String email) {
        type(emailInput, email);
        return this;
    }

    @Step("Nhập Password")
    public SignInScreen enterPassword(String password) {
        type(passwordInput, password);
        return this;
    }

    @Step("Bấm 'Login account'")
    public void submit() {
        hideKeyboardIfShown();
        tap(loginButton);
    }

    @Step("Đăng nhập bằng tài khoản {email}")
    public DashboardScreen login(String email, String password) {
        enterEmail(email);
        enterPassword(password);
        submit();
        return new DashboardScreen(driver);
    }

    /** Câu lỗi dưới ô hiện bằng TextView có text đúng nguyên văn — tìm theo text, không theo resource-id. */
    public boolean isErrorDisplayed(String message) {
        By error = byPlatform(
                AppiumBy.xpath("//*[@text=" + xpathLiteral(message) + "]"),
                AppiumBy.iOSNsPredicateString("label == '" + message.replace("'", "\\'") + "'"));
        return isVisible(error, Duration.ofSeconds(10));
    }

    public boolean isDisplayed() {
        return isVisible(emailInput, Duration.ofSeconds(5));
    }

    public boolean isGetStartedDisplayed() {
        return isVisible(getStartedLink, Duration.ofSeconds(5));
    }

    private static String xpathLiteral(String value) {
        return value.contains("'") ? "\"" + value + "\"" : "'" + value + "'";
    }
}
