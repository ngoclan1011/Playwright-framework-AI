package com.anhtester.mobile.listeners;

import com.anhtester.mobile.drivers.AppiumDriverFactory;
import com.anhtester.mobile.utils.ScreenshotUtil;
import org.testng.IInvokedMethod;
import org.testng.IInvokedMethodListener;
import org.testng.ITestResult;

/**
 * Chụp ảnh trạng thái cuối cho MỌI test (PASS lẫn FAIL) và đính vào đúng kết quả test trong Allure.
 * Chạy ngay sau thân test — trước khi Allure đóng kết quả và trước @AfterMethod đóng driver.
 * (Chụp trong @AfterMethod thì ảnh rơi vào phần tear-down, không nằm trong kết quả test.)
 */
public class ScreenshotListener implements IInvokedMethodListener {

    @Override
    public void afterInvocation(IInvokedMethod method, ITestResult result) {
        if (!method.isTestMethod()) {
            return;
        }
        String name = result.getStatus() == ITestResult.SUCCESS ? "trang_thai_cuoi_cua_test" : "trang_thai_khi_that_bai";
        ScreenshotUtil.captureAndAttach(AppiumDriverFactory.getDriver(), name, result.getMethod().getMethodName());
    }
}
