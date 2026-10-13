import { APIRequestContext, APIResponse, test } from '@playwright/test';
import { logger } from '../utils/logger';

export interface ApiCall {
  method: string;
  url: string;
  status: number;
  durationMs: number;
}

/** Nhật ký request của MỘT test — fixture attach vào report ở teardown, thay cho ảnh chụp màn hình */
export class ApiCallLog {
  readonly calls: ApiCall[] = [];
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  params?: Record<string, string | number>;
  data?: unknown;
  token?: string;
}

export abstract class BaseApi {
  constructor(
    protected readonly request: APIRequestContext,
    private readonly log: ApiCallLog,
  ) {}

  /** Mỗi request là 1 sub-step. Chỉ ghi method/URL/status — KHÔNG ghi body (có mật khẩu, dữ liệu người khác) */
  protected async send(method: Method, url: string, options: RequestOptions = {}): Promise<APIResponse> {
    const query = options.params
      ? `?${new URLSearchParams(Object.entries(options.params).map(([k, v]) => [k, String(v)]))}`
      : '';
    return test.step(`${method} ${url}${query}`, async () => {
      const started = Date.now();
      const response = await this.request.fetch(url, {
        method,
        params: options.params,
        data: options.data,
        headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
      });
      const call: ApiCall = { method, url: `${url}${query}`, status: response.status(), durationMs: Date.now() - started };
      this.log.calls.push(call);
      logger.info(`${call.method} ${call.url} → ${call.status} (${call.durationMs} ms)`);
      return response;
    });
  }
}
