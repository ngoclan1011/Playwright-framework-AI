import * as path from 'node:path';
import winston from 'winston';

// Chỉ ghi ra file: ghi ra console sẽ thành attachment stdout trong Allure (reporting_rules.md mục 4)
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) =>
      `${timestamp} [worker ${process.env.TEST_WORKER_INDEX ?? '-'}] ${level.toUpperCase()} ${message}`),
  ),
  transports: [
    new winston.transports.File({
      filename: path.resolve(__dirname, '../../reports/logs/test-execution.log'),
    }),
  ],
});
