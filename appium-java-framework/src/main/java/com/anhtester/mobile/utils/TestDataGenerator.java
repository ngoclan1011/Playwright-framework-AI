package com.anhtester.mobile.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/** Sinh dữ liệu test DUY NHẤT và truy vết được (timestamp + số ngẫu nhiên) — an toàn khi chạy song song. */
public final class TestDataGenerator {

    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyMMddHHmmss");

    private TestDataGenerator() {
    }

    public static String uniqueSuffix() {
        return LocalDateTime.now().format(STAMP) + ThreadLocalRandom.current().nextInt(100, 1000);
    }

    public static String email(String prefix) {
        return "auto_" + prefix + "_" + uniqueSuffix() + "@auto.test";
    }

    public static String name(String prefix) {
        return "Auto " + prefix + " " + uniqueSuffix();
    }

    public static String phone() {
        return "09" + ThreadLocalRandom.current().nextInt(10_000_000, 99_999_999);
    }
}
