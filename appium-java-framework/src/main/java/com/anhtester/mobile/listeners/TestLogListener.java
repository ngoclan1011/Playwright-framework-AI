package com.anhtester.mobile.listeners;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.testng.ITestListener;
import org.testng.ITestResult;

/** Ghi log bắt đầu / kết thúc từng test kèm tên thread — nhìn log là biết các device có chạy song song không. */
public class TestLogListener implements ITestListener {

    private static final Logger LOG = LogManager.getLogger(TestLogListener.class);

    @Override
    public void onTestStart(ITestResult result) {
        LOG.info("▶ BẮT ĐẦU [{}] {} · device={}", Thread.currentThread().getName(),
                result.getMethod().getQualifiedName(), result.getTestContext().getName());
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        LOG.info("✔ PASS [{}] {}", Thread.currentThread().getName(), result.getMethod().getMethodName());
    }

    @Override
    public void onTestFailure(ITestResult result) {
        LOG.error("✘ FAIL [{}] {} — {}", Thread.currentThread().getName(), result.getMethod().getMethodName(),
                result.getThrowable() == null ? "" : result.getThrowable().getMessage());
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        LOG.warn("⤼ SKIP [{}] {} — {}", Thread.currentThread().getName(), result.getMethod().getMethodName(),
                result.getThrowable() == null ? "" : result.getThrowable().getMessage());
    }
}
