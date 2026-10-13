package com.anhtester.mobile.drivers;

import com.anhtester.mobile.config.AppConfig;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.MutableCapabilities;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URL;

/**
 * Tạo và giữ driver THEO TỪNG THREAD (ThreadLocal) — điều kiện bắt buộc vì suite chạy song song theo device.
 * quitDriver() luôn remove() để thread sau không nhận nhầm driver đã đóng.
 */
public final class AppiumDriverFactory {

    private static final Logger LOG = LogManager.getLogger(AppiumDriverFactory.class);
    private static final ThreadLocal<AppiumDriver> DRIVER = new ThreadLocal<>();

    private AppiumDriverFactory() {
    }

    public static AppiumDriver initDriver(String platform, String deviceKey) {
        MutableCapabilities caps = CapabilitiesManager.load(deviceKey);
        URL server = appiumServerUrl();
        LOG.info("Mở phiên {} trên device '{}' qua {}", platform, deviceKey, server);
        AppiumDriver driver = "ios".equalsIgnoreCase(platform)
                ? new IOSDriver(server, caps)
                : new AndroidDriver(server, caps);
        DRIVER.set(driver);
        return driver;
    }

    public static AppiumDriver getDriver() {
        return DRIVER.get();
    }

    public static void quitDriver() {
        AppiumDriver driver = DRIVER.get();
        if (driver != null) {
            try {
                driver.quit();
            } finally {
                DRIVER.remove();
            }
        }
    }

    private static URL appiumServerUrl() {
        String url = AppConfig.appiumServer();
        try {
            return URI.create(url).toURL();
        } catch (MalformedURLException | IllegalArgumentException e) {
            throw new IllegalStateException("APPIUM_SERVER không hợp lệ: " + url, e);
        }
    }
}
