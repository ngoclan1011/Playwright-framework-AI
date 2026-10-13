import { APIResponse } from '@playwright/test';
import { BaseApi } from './base.api';

export class AddressApi extends BaseApi {
  /** Danh sách tỉnh/thành */
  divisions(): Promise<APIResponse> {
    return this.send('GET', '/api/address');
  }

  /** Danh sách phường/xã của một tỉnh/thành */
  wards(division: string): Promise<APIResponse> {
    return this.send('GET', `/api/address/${encodeURIComponent(division)}`);
  }
}
