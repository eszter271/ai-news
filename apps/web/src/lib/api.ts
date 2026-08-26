// 请求封装：自动带 token、统一错误处理
import { useAuthStore } from '../store/authStore';

const BASE = '/api';

export class ApiError extends Error {
  status: number;
  code?: number;
  constructor(message: string, status: number, code?: number) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions extends RequestInit {
  json?: boolean;
  auth?: boolean;
}

export async function request<T = any>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { json = true, auth = true, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };
  let body = rest.body;
  if (json && body !== undefined && typeof body !== 'string') {
    finalHeaders['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }
  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let resp: Response;
  try {
    resp = await fetch(`${BASE}${path}`, { ...rest, body, headers: finalHeaders });
  } catch (e) {
    throw new ApiError('网络异常，请稍后重试', 0);
  }

  if (resp.status === 204) return undefined as T;

  let payload: any = null;
  const text = await resp.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!resp.ok) {
    const msg =
      (payload && typeof payload === 'object' && payload.message) ||
      `请求失败 (${resp.status})`;
    if (resp.status === 401) {
      // token 失效：清理登录态
      useAuthStore.getState().logout();
    }
    throw new ApiError(msg, resp.status, payload?.code);
  }
  return payload as T;
}

export const api = {
  get: <T = any>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T = any>(path: string, body?: any, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T = any>(path: string, body?: any, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T = any>(path: string, body?: any, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T = any>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};
