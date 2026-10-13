import * as fs from 'node:fs';
import * as path from 'node:path';
import Ajv, { ValidateFunction } from 'ajv';

const ajv = new Ajv({ allErrors: true });
const cache = new Map<string, ValidateFunction>();
const schemaDir = path.resolve(__dirname, '../../test-data/schemas');

/** Trả về danh sách lỗi (rỗng = khớp schema). Schema đặt ở test-data/schemas/<name>.json */
export function validateSchema(name: string, data: unknown): string[] {
  let validate = cache.get(name);
  if (!validate) {
    const schema = JSON.parse(fs.readFileSync(path.join(schemaDir, `${name}.json`), 'utf-8'));
    validate = ajv.compile(schema);
    cache.set(name, validate);
  }
  if (validate(data)) return [];
  return (validate.errors ?? []).map(e => `${e.instancePath || '/'} ${e.message}`);
}
