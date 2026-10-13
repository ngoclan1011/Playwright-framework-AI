package com.anhtester.mobile.utils;

import io.qameta.allure.Allure;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/** Chụp màn hình, đính vào Allure và lưu bản sao vào reports/screenshots/. */
public final class ScreenshotUtil {

    private static final Logger LOG = LogManager.getLogger(ScreenshotUtil.class);
    private static final Path DIR = Path.of("reports", "screenshots");
    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss_SSS");

    private ScreenshotUtil() {
    }

    public static void captureAndAttach(WebDriver driver, String name, String testName) {
        if (!(driver instanceof TakesScreenshot shooter)) {
            LOG.warn("Không có driver để chụp màn hình cho '{}'", testName);
            return;
        }
        try {
            byte[] png = shooter.getScreenshotAs(OutputType.BYTES);
            Allure.addAttachment(name, "image/png", new ByteArrayInputStream(png), "png");
            Files.createDirectories(DIR);
            Path file = DIR.resolve(testName + "_" + name + "_" + LocalDateTime.now().format(STAMP) + ".png");
            Files.write(file, png);
        } catch (IOException | RuntimeException e) {
            LOG.warn("Không chụp được màn hình cho '{}': {}", testName, e.getMessage());
        }
    }
}
