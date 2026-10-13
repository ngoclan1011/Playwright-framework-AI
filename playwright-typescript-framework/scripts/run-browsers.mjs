// Chạy test lần lượt từng trình duyệt (Chrome → Edge → Firefox), mỗi trình duyệt chạy song song `WORKERS` luồng (mặc định 5).
//
// Vì sao không dùng `dependencies` của Playwright: project phụ thuộc sẽ BỊ BỎ QUA nếu project trước có test đỏ,
// nên Chrome đỏ là mất kết quả Edge/Firefox. Ở đây mỗi trình duyệt là một lượt chạy riêng, đỏ vẫn chạy tiếp lượt sau.
//
// Cách dùng:
//   node scripts/run-browsers.mjs                         → 3 trình duyệt UI lần lượt
//   node scripts/run-browsers.mjs --all                   → 3 trình duyệt UI, rồi crm, rồi api
//   node scripts/run-browsers.mjs ui-edge ui-firefox      → chỉ các project nêu tên, theo thứ tự đó
//   node scripts/run-browsers.mjs --grep @smoke           → tham số còn lại chuyển nguyên cho `playwright test`
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UI_BROWSERS = ['ui-chrome', 'ui-edge', 'ui-firefox'];
const OTHER_PROJECTS = ['crm', 'api'];
const KNOWN = [...UI_BROWSERS, ...OTHER_PROJECTS];

const args = process.argv.slice(2);
const runAll = args.includes('--all');
const named = args.filter(a => KNOWN.includes(a));
const passthrough = args.filter(a => a !== '--all' && !KNOWN.includes(a));

// `shell: true` (cần cho `npx` trên Windows) tách tham số theo dấu cách → bọc những tham số có dấu cách như `--grep "đăng nhập"`
const quote = a => (/\s/.test(a) && !a.startsWith('"') ? `"${a}"` : a);
const queue = named.length > 0 ? named : [...UI_BROWSERS, ...(runAll ? OTHER_PROJECTS : [])];
const listOnly = passthrough.includes('--list');

// Xoá kết quả Allure cũ ĐÚNG MỘT LẦN ở đầu; các lượt sau giữ lại để gộp thành một report (global-setup.ts bỏ qua khi KEEP_ALLURE_RESULTS=1)
if (!listOnly) {
  fs.rmSync(path.join(root, 'reports', 'allure-results'), { recursive: true, force: true });
}

const summary = [];
for (const project of queue) {
  console.log(`\n===== ${project} — bắt đầu =====`);
  const started = Date.now();
  const result = spawnSync('npx', ['playwright', 'test', `--project=${project}`, ...passthrough.map(quote)], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      KEEP_ALLURE_RESULTS: '1',
      // Mỗi trình duyệt một thư mục HTML report riêng — nếu dùng chung, lượt sau ghi đè lượt trước
      PLAYWRIGHT_HTML_REPORT: path.join(root, 'reports', 'html', project),
    },
  });
  summary.push({ project, code: result.status ?? 1, seconds: Math.round((Date.now() - started) / 1000) });
}

console.log('\n===== Tổng kết theo trình duyệt =====');
for (const s of summary) {
  console.log(`${s.code === 0 ? 'PASS' : 'FAIL'}  ${s.project.padEnd(12)} exit ${s.code}  ${s.seconds}s`);
}
process.exit(summary.every(s => s.code === 0) ? 0 : 1);
