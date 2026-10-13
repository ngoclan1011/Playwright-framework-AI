import { APIResponse } from '@playwright/test';
import { BaseApi } from './base.api';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}

export interface NewBook {
  name: string;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  categories: string[];
  price: number;
  description?: string;
}

export interface BookSummary {
  id: string;
  name: string;
}

export class BookApi extends BaseApi {
  list(params: ListParams = {}): Promise<APIResponse> {
    return this.send('GET', '/api/book', { params: { ...params } });
  }

  getById(id: string): Promise<APIResponse> {
    return this.send('GET', `/api/book/${encodeURIComponent(id)}`);
  }

  create(book: NewBook, token: string): Promise<APIResponse> {
    return this.send('POST', '/api/book', { data: book, token });
  }

  remove(id: string, token: string): Promise<APIResponse> {
    return this.send('DELETE', `/api/book/${encodeURIComponent(id)}`, { token });
  }

  /** POST /api/book trả 201 nhưng KHÔNG trả id → tìm lại theo tên (tên do TestData sinh, luôn unique) */
  async findByName(name: string): Promise<BookSummary | undefined> {
    const response = await this.list({ search: name, limit: 10 });
    const body = (await response.json()) as { list: BookSummary[] };
    return body.list.find(book => book.name === name);
  }
}
