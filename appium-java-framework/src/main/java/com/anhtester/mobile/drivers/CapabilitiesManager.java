package com.anhtester.mobile.drivers;

import com.anhtester.mobile.config.AppConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openqa.selenium.MutableCapabilities;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;

/**
 * Đọc capabilities của từng device từ file JSON (mặc định capabilities/devices.json).
 * Mỗi khối là một device — systemPort (Android) / wdaLocalPort (iOS) riêng để chạy song song.
 * Khoá bắt đầu bằng "_" (ví dụ "_comment") bị bỏ qua.
 */
public final class CapabilitiesManager {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private CapabilitiesManager() {
    }

    public static MutableCapabilities load(String deviceKey) {
        Path file = Path.of(AppConfig.capabilitiesFile());
        JsonNode root = readJson(file);
        JsonNode device = root.get(deviceKey);
        if (device == null || !device.isObject()) {
            throw new IllegalArgumentException("Không có khối \"" + deviceKey + "\" trong " + file.toAbsolutePath());
        }
        MutableCapabilities caps = new MutableCapabilities();
        Iterator<Map.Entry<String, JsonNode>> fields = device.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> field = fields.next();
            if (field.getKey().startsWith("_")) {
                continue;
            }
            caps.setCapability(field.getKey(), toJavaValue(field.getValue()));
        }
        return caps;
    }

    private static JsonNode readJson(Path file) {
        try {
            return MAPPER.readTree(Files.readString(file));
        } catch (IOException e) {
            throw new IllegalStateException("Không đọc được file capabilities: " + file.toAbsolutePath(), e);
        }
    }

    private static Object toJavaValue(JsonNode node) {
        if (node.isBoolean()) {
            return node.booleanValue();
        }
        if (node.isInt() || node.isLong()) {
            return node.longValue();
        }
        if (node.isNumber()) {
            return node.doubleValue();
        }
        if (node.isContainerNode()) {
            return MAPPER.convertValue(node, Object.class);
        }
        return node.asText();
    }
}
