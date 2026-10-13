import { APIResponse } from '@playwright/test';
import { BaseApi } from './base.api';
import { ListParams } from './book.api';

export class CategoryApi extends BaseApi {
  list(params: Pick<ListParams, 'page' | 'limit' | 'search'> = {}): Promise<APIResponse> {
    return this.send('GET', '/api/category-book', { params: { ...params } });
  }

  create(name: string, token: string): Promise<APIResponse> {
    return this.send('POST', '/api/category-book', { data: { name }, token });
  }

  remove(name: string, token: string): Promise<APIResponse> {
    return this.send('DELETE', `/api/category-book/${encodeURIComponent(name)}`, { token });
  }
}
