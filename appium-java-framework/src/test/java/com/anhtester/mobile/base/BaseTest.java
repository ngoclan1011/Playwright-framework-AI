package com.anhtester.mobile.base;

import com.anhtester.mobile.drivers.AppiumDriverFactory;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.InteractsWithApps;
import io.qameta.allure.Allure;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Optional;
import org.testng.annotations.Parameters;

import java.util.Map;

/**
 * Vòng đời mỗi test: mở phiên Appium trên đúng device của khối <test> (testng.xml) → chạy test →
 * ScreenshotListener đính ảnh trạng thái cuối (cả PASS lẫn FAIL) → đóng phiên. Driver lấy qua ThreadLocal — không static dùng chung.
 */
public abstract class BaseTest {

    protected final Logger log = LogManager.getLogger(getClass());

    @Parameters({"platform", "deviceKey"})
    @BeforeMethod(alwaysRun = true)
    public void setUp(@Optional("android") String platform, @Optional("android_pixel_10_pro_xl") String deviceKey) {
        AppiumDriverFactory.initDriver(platform, deviceKey);
    }

    /** Ảnh trạng thái cuối đã được ScreenshotListener chụp và đính vào kết quả test — ở đây chỉ đóng phiên. */
    @AfterMethod(alwaysRun = true)
    public void tearDown() {
        AppiumDriverFactory.quitDriver();
    }

    protected AppiumDriver driver() {
        return AppiumDriverFactory.getDriver();
    }

    /**
     * Đưa app về trạng thái sạch (chưa đăng nhập) để test độc lập với lần chạy trước — capabilities đang để noReset=true.
     * Android: xoá dữ liệu app rồi mở lại. Tài liệu khảo sát xác nhận app không có màn giới thiệu sau khi xoá dữ liệu.
     */
    protected void startFromCleanApp() {
        AppiumDriver driver = driver();
        Object appId = driver.getCapabilities().getCapability("appium:appPackage");
        if (appId == null) {
            appId = driver.getCapabilities().getCapability("appPackage");
        }
        if (appId == null) {
            log.warn("Không có appPackage trong capabilities — bỏ qua bước xoá dữ liệu app");
            return;
        }
        String pkg = appId.toString();
        Allure.step("Arrange: Xoá dữ liệu app " + pkg + " và mở lại", () -> {
            driver.executeScript("mobile: clearApp", Map.of("appId", pkg));
            ((InteractsWithApps) driver).activateApp(pkg);
        });
    }
}
