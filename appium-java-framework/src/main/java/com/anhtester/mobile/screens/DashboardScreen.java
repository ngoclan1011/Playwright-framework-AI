package com.anhtester.mobile.screens;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.AppiumDriver;
import io.qameta.allure.Step;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;

import java.time.Duration;

/**
 * Màn Dashboard của app Book Anhtester (tab mặc định khi mở app).
 * Locator Android lấy từ khảo sát thực tế: docs/requirements/_book-api/auth/mobile/requirements_auth_mobile.md mục 8.
 * App là Hybrid (Capacitor) — đọc qua cây NATIVE_APP của WebView.
 */
public class DashboardScreen extends BaseScreen {

    private final By signInCard = byPlatform(
            AppiumBy.accessibilityId("Book management sign in"),
            // ⚠️ PLACEHOLDER iOS — app chưa khảo sát trên iOS
            AppiumBy.accessibilityId("Book management sign in"));

    private final By welcomeText = byPlatform(
            AppiumBy.xpath("//*[starts-with(@text,'Welcome')]"),
            // ⚠️ PLACEHOLDER iOS
            AppiumBy.iOSNsPredicateString("label BEGINSWITH 'Welcome'"));

    private final By anyWebContent = byPlatform(
            AppiumBy.xpath("//android.webkit.WebView//*[@text!='' or @content-desc!='']"),
            // ⚠️ PLACEHOLDER iOS
            AppiumBy.iOSNsPredicateString("type == 'XCUIElementTypeStaticText'"));

    public DashboardScreen(AppiumDriver driver) {
        super(driver);
    }

    /**
     * RISK-BK-AUTH-11: lúc mới mở phiên, cây phần tử của WebView có thể rỗng cho tới lần chạm đầu tiên.
     * Nếu chưa thấy nội dung, chạm một lần vào vùng tiêu đề (không có nút) để WebView dựng cây rồi mới chờ tiếp.
     */
    @Step("Chờ Dashboard tải xong")
    public DashboardScreen waitUntilLoaded() {
        if (!isVisible(anyWebContent, Duration.ofSeconds(8))) {
            Dimension size = driver.manage().window().getSize();
            log.info("Cây WebView còn rỗng — chạm vùng tiêu đề để WebView dựng cây phần tử");
            gestures.tapAt(new Point(size.getWidth() / 2, (int) (size.getHeight() * 0.12)));
        }
        wait.until(d -> isPresent(signInCard) || isPresent(welcomeText));
        return this;
    }

    public boolean isSignedIn() {
        return isVisible(welcomeText, Duration.ofSeconds(5));
    }

    @Step("Mở màn Sign in từ thẻ 'Book management sign in'")
    public SignInScreen openSignIn() {
        tap(signInCard);
        return new SignInScreen(driver).waitUntilLoaded();
    }

    @Step("Đọc lời chào trên Dashboard")
    public String welcomeMessage() {
        return getText(welcomeText);
    }

    public boolean isWelcomeDisplayed() {
        return isVisible(welcomeText, Duration.ofSeconds(15));
    }
}
