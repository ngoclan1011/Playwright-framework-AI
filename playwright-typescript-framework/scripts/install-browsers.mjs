// Cài các trình duyệt Playwright cần cho bộ test vào thư mục RIÊNG của project (mặc định `.browsers/`),
// cùng đường dẫn mà src/utils/env.config.ts dùng lúc chạy test.
//
// Cách dùng:
//   npm run browsers:install                  → Firefox + ffmpeg (video) — Chrome, Edge dùng bản cài sẵn trên máy
//   npm run browsers:install -- --with-deps   → thêm thư viện hệ thống (dùng trên CI Linux)
//   npm run browsers:install -- chrome msedge → cài thêm Chrome/Edge bản Playwright (CI Linux không có sẵn)
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env'), quiet: true });

const browsersPath = path.resolve(root, process.env.PLAYWRIGHT_BROWSERS_PATH || '.browsers');
const extra = process.argv.slice(2);
const targets = ['firefox', 'ffmpeg', ...extra];

console.log(`Cài vào: ${browsersPath}\nThành phần: ${targets.join(' ')}`);
const result = spawnSync('npx', ['playwright', 'install', ...targets], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: browsersPath },
});
process.exit(result.status ?? 1);
