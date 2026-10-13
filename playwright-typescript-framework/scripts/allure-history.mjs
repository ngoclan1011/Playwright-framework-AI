// Allure 2 chỉ vẽ Trend khi allure-results có history/ của report lần trước — chép sang trước khi generate
import { cpSync, existsSync } from 'node:fs';

const previousHistory = 'reports/allure-report/history';
const results = 'reports/allure-results';

if (existsSync(previousHistory) && existsSync(results)) {
  cpSync(previousHistory, `${results}/history`, { recursive: true });
}
