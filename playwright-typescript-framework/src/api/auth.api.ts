import { APIResponse } from '@playwright/test';
import { BaseApi } from './base.api';

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

export class AuthApi extends BaseApi {
  register(body: RegisterBody): Promise<APIResponse> {
    return this.send('POST', '/api/register', { data: body });
  }

  login(email: string, password: string): Promise<APIResponse> {
    return this.send('POST', '/api/login', { data: { email, password } });
  }

  me(token?: string): Promise<APIResponse> {
    return this.send('GET', '/api/me', { token });
  }
}
