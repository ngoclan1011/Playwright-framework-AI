package com.anhtester.mobile.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/** Đọc bộ dữ liệu data-driven từ test-data/*.json → mảng cho TestNG @DataProvider. */
public final class JsonDataReader {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private JsonDataReader() {
    }

    public static Object[][] asDataProvider(String relativePath) {
        List<Map<String, String>> rows = readRows(relativePath);
        Object[][] data = new Object[rows.size()][1];
        for (int i = 0; i < rows.size(); i++) {
            data[i][0] = rows.get(i);
        }
        return data;
    }

    public static List<Map<String, String>> readRows(String relativePath) {
        Path file = Path.of(relativePath);
        try {
            return MAPPER.readValue(Files.readString(file), new TypeReference<>() {
            });
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được test data: " + file.toAbsolutePath(), e);
        }
    }
}
