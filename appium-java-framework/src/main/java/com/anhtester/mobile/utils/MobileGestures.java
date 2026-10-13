package com.anhtester.mobile.utils;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.PointerInput;
import org.openqa.selenium.interactions.Sequence;

import java.time.Duration;
import java.util.List;

/** Thao tác chạm / vuốt theo chuẩn W3C Actions — dùng được cho cả Android và iOS. */
public class MobileGestures {

    private final AppiumDriver driver;

    public MobileGestures(AppiumDriver driver) {
        this.driver = driver;
    }

    public void tapAt(Point point) {
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence tap = new Sequence(finger, 1)
                .addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), point.getX(), point.getY()))
                .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
                .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
        driver.perform(List.of(tap));
    }

    /** Vuốt lên (nội dung cuộn xuống) — từ 75% xuống 25% chiều cao màn hình. */
    public void swipeUp() {
        Dimension size = driver.manage().window().getSize();
        int x = size.getWidth() / 2;
        swipe(new Point(x, (int) (size.getHeight() * 0.75)), new Point(x, (int) (size.getHeight() * 0.25)));
    }

    /** Vuốt xuống (nội dung cuộn lên). */
    public void swipeDown() {
        Dimension size = driver.manage().window().getSize();
        int x = size.getWidth() / 2;
        swipe(new Point(x, (int) (size.getHeight() * 0.25)), new Point(x, (int) (size.getHeight() * 0.75)));
    }

    public void swipe(Point from, Point to) {
        PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
        Sequence swipe = new Sequence(finger, 1)
                .addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), from.getX(), from.getY()))
                .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
                .addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), to.getX(), to.getY()))
                .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
        driver.perform(List.of(swipe));
    }
}
