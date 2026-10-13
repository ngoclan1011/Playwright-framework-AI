import { randomBytes } from 'node:crypto';

/** Data unique + traceable: `auto_<testName>_<timestamp>_<random>` — nhìn dữ liệu là biết test nào tạo */
export class TestData {
  private static suffix(): string {
    return `${Date.now()}_${randomBytes(2).toString('hex')}`;
  }

  static email(testName: string): string {
    return `auto_${testName}_${this.suffix()}@auto.test`.toLowerCase();
  }

  static name(testName: string): string {
    return `Auto ${testName} ${this.suffix()}`;
  }

  static bookName(testName: string): string {
    return `auto_${testName}_${this.suffix()}`;
  }

  /** Mật khẩu đủ chữ hoa, chữ thường, số và ký tự đặc biệt */
  static password(): string {
    return `Auto@${randomBytes(4).toString('hex')}9A`;
  }

  /** Mật khẩu sai — khác mọi mật khẩu thật, truy vết được theo test */
  static wrongPassword(testName: string): string {
    return `Sai_${testName}_${this.suffix()}`;
  }

  /** Đảo kiểu chữ: hoa → thường, thường → hoa; ký tự không phải chữ cái giữ nguyên */
  static swapCase(value: string): string {
    return [...value].map(ch => (ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase())).join('');
  }

  /** Số di động 10 chữ số, đầu 09 */
  static phone(): string {
    return `09${String(Math.floor(Math.random() * 100_000_000)).padStart(8, '0')}`;
  }
}
