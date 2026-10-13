package com.anhtester.mobile.screens;

import com.anhtester.mobile.config.AppConfig;
import com.anhtester.mobile.utils.MobileGestures;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.HidesKeyboard;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

/**
 * Lớp cha của mọi Screen Object. Chỉ dùng chờ thông minh (WebDriverWait) — KHÔNG Thread.sleep.
 * Phân nhánh nền tảng tập trung ở byPlatform(), không rải if (isAndroid) trong test.
 */
public abstract class BaseScreen {

    protected final Logger log = LogManager.getLogger(getClass());
    protected final AppiumDriver driver;
    protected final WebDriverWait wait;
    protected final MobileGestures gestures;

    protected BaseScreen(AppiumDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, AppConfig.explicitWait());
        this.gestures = new MobileGestures(driver);
    }

    protected By byPlatform(By android, By ios) {
        return isAndroid() ? android : ios;
    }

    protected boolean isAndroid() {
        Object platform = driver.getCapabilities().getCapability("platformName");
        return platform != null && "android".equalsIgnoreCase(platform.toString());
    }

    protected WebElement waitForVisible(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected boolean isVisible(By locator, Duration timeout) {
        try {
            new WebDriverWait(driver, timeout).until(ExpectedConditions.visibilityOfElementLocated(locator));
            return true;
        } catch (org.openqa.selenium.TimeoutException e) {
            return false;
        }
    }

    protected boolean isPresent(By locator) {
        List<WebElement> found = driver.findElements(locator);
        return !found.isEmpty();
    }

    protected void tap(By locator) {
        log.info("Chạm: {}", locator);
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    /** Xoá trắng rồi nhập — app Book có lúc nối thêm vào giá trị cũ nếu không xoá trước. */
    protected void type(By locator, String value) {
        log.info("Nhập vào {}: {}", locator, value);
        WebElement element = waitForVisible(locator);
        element.click();
        element.clear();
        if (value != null && !value.isEmpty()) {
            element.sendKeys(value);
        }
    }

    protected String getText(By locator) {
        return waitForVisible(locator).getText();
    }

    protected void hideKeyboardIfShown() {
        if (driver instanceof HidesKeyboard keyboard) {
            try {
                keyboard.hideKeyboard();
            } catch (RuntimeException e) {
                log.debug("Bàn phím không hiển thị — bỏ qua hideKeyboard");
            }
        }
    }
}
