package com.anhtester.mobile.config;

import io.github.cdimascio.dotenv.Dotenv;

import java.time.Duration;

/**
 * Cấu hình tập trung. Thứ tự ưu tiên: -Dkey (System property) → biến môi trường / .env → giá trị mặc định.
 * Không hardcode URL, tài khoản trong test — mọi giá trị đọc qua lớp này.
 */
public final class AppConfig {

    private static final Dotenv DOTENV = Dotenv.configure().ignoreIfMissing().ignoreIfMalformed().load();

    private AppConfig() {
    }

    public static String get(String envKey, String sysPropKey, String defaultValue) {
        String fromSys = System.getProperty(sysPropKey);
        if (fromSys != null && !fromSys.isBlank()) {
            return fromSys;
        }
        String fromEnv = DOTENV.get(envKey, null);
        if (fromEnv != null && !fromEnv.isBlank()) {
            return fromEnv;
        }
        return defaultValue;
    }

    public static String appiumServer() {
        return get("APPIUM_SERVER", "appium.server", "http://127.0.0.1:4723");
    }

    public static String capabilitiesFile() {
        return get("CAPABILITIES_FILE", "capabilities.file", "capabilities/devices.json");
    }

    public static Duration explicitWait() {
        return Duration.ofSeconds(Long.parseLong(get("EXPLICIT_WAIT_SECONDS", "explicit.wait", "20")));
    }

    public static String bookUserEmail() {
        return get("BOOK_USER_EMAIL", "book.user.email", "");
    }

    public static String bookUserPassword() {
        return get("BOOK_USER_PASSWORD", "book.user.password", "");
    }
}
