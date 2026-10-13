package com.anhtester.mobile.tests;

import com.anhtester.mobile.base.BaseTest;
import com.anhtester.mobile.config.AppConfig;
import io.appium.java_client.android.AndroidDriver;
import org.openqa.selenium.support.ui.WebDriverWait;
import io.qameta.allure.Allure;
import io.qameta.allure.Description;
import io.qameta.allure.Feature;
import io.qameta.allure.Severity;
import io.qameta.allure.SeverityLevel;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Kiểm kết nối Appium ↔ device mà KHÔNG cần app cần test (dùng app Cài đặt có sẵn).
 * Chạy: mvnw test -Dsuite=testng-device-check.xml — dùng khi nghi môi trường (emulator, Appium, driver) có vấn đề.
 */
@Feature("Môi trường — Kết nối thiết bị")
public class DeviceConnectionTest extends BaseTest {

    @Test(groups = {"env"}, description = "Mở được phiên Appium trên emulator và đọc được thông tin thiết bị")
    @Severity(SeverityLevel.BLOCKER)
    @Description("Tạo phiên UiAutomator2 trên device khai trong testng-device-check.xml, mở app Cài đặt, "
            + "đọc phiên bản Android và gói app đang mở. Test đỏ ở đây là lỗi môi trường, không phải lỗi app.")
    public void appiumSessionOpensOnDevice() {
        Allure.label("testId", "ENV_DEVICE_TC_001");
        Allure.label("tag", "@Env");
        AndroidDriver driver = (AndroidDriver) driver();

        String currentPackage = Allure.step("Act: Chờ app Cài đặt lên tiền cảnh rồi đọc gói app", () -> {
            driver.activateApp("com.android.settings");
            new WebDriverWait(driver, AppConfig.explicitWait())
                    .until(d -> "com.android.settings".equals(driver.getCurrentPackage()));
            return driver.getCurrentPackage();
        });

        Allure.step("Assert: App Cài đặt đang mở và thiết bị trả về phiên bản Android", () -> {
            Assert.assertEquals(currentPackage, "com.android.settings", "App ở tiền cảnh phải là app Cài đặt");
            Object version = driver.getCapabilities().getCapability("platformVersion");
            Assert.assertNotNull(version, "Phiên Appium phải trả về platformVersion của thiết bị");
            log.info("Thiết bị Android {} · gói đang mở {}", version, currentPackage);
        });
    }
}
