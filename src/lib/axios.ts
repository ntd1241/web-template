import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiError } from '@/types/api.types';
import { env } from '@/config/env';

/**
 * Axios instance dùng chung. Trả về `response.data` trực tiếp và chuẩn hóa lỗi
 * về dạng `ApiError`. Token được lấy từ auth store (xem `@/stores/auth.store`).
 *
 * Mock-first: khi `env.useMock` bật, feature API nên trả mock data và không
 * chạm tới instance này — xem `src/mocks/`.
 */
export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// Đặt qua setter để tránh import vòng giữa axios và store.
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export function configureApiAuth(options: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (
    error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>,
  ) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }
    const normalized: ApiError = {
      message:
        error.response?.data?.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại.',
      status: error.response?.status,
      errors: error.response?.data?.errors,
    };
    return Promise.reject(normalized);
  },
);
