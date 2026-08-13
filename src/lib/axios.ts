import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
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
type ApiErrorPayload = {
  message?: unknown;
  detail?: unknown;
  title?: unknown;
  code?: unknown;
  errors?: unknown;
  [key: string]: unknown;
};

function getString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim();
  return normalized || undefined;
}

function getPayloadMessage(payload: unknown): string | undefined {
  const direct = getString(payload);
  if (direct) return direct;
  if (!payload || typeof payload !== 'object') return undefined;

  const data = payload as ApiErrorPayload;
  return (
    getString(data.message) ??
    getString(data.detail) ??
    getString(data.title) ??
    getString(data.msg)
  );
}

function getFieldErrors(value: unknown): Record<string, string[]> | undefined {
  if (!value || typeof value !== 'object') return undefined;

  const entries = Object.entries(value as Record<string, unknown>);
  if (
    entries.length === 0 ||
    !entries.every(
      ([, messages]) =>
        Array.isArray(messages) &&
        messages.every((message) => typeof message === 'string'),
    )
  ) {
    return undefined;
  }

  return Object.fromEntries(
    entries.map(([field, messages]) => [field, messages as string[]]),
  );
}

function getHeaderValue(
  response: AxiosResponse | undefined,
  name: string,
): string | undefined {
  const headers = response?.headers;
  if (!headers) return undefined;

  const value = headers.get?.(name) ?? headers[name];
  return getString(value);
}

function hasFormDataBody(data: unknown): boolean {
  return typeof FormData !== 'undefined' && data instanceof FormData;
}

function shouldUseJsonContentType(data: unknown): boolean {
  return (
    data !== undefined &&
    data !== null &&
    typeof data === 'object' &&
    !hasFormDataBody(data) &&
    !(data instanceof Blob) &&
    !(data instanceof ArrayBuffer) &&
    !(typeof URLSearchParams !== 'undefined' && data instanceof URLSearchParams)
  );
}

// Đặt qua setter để tránh import vòng giữa axios và store.
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};
let refreshAccessToken:
  | (() => Promise<{ token: string; refreshToken?: string | null }>)
  | null = null;
let getRefreshToken: () => string | null = () => null;
let refreshPromise: Promise<{
  token: string;
  refreshToken?: string | null;
}> | null = null;

export function configureApiAuth(options: {
  getToken: () => string | null;
  getRefreshToken?: () => string | null;
  refreshAccessToken?: () => Promise<{
    token: string;
    refreshToken?: string | null;
  }>;
  onUnauthorized: () => void;
}) {
  getToken = options.getToken;
  getRefreshToken = options.getRefreshToken ?? (() => null);
  refreshAccessToken = options.refreshAccessToken ?? null;
  onUnauthorized = options.onUnauthorized;
}

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

function isAuthTokenRequest(config: AuthRequestConfig | undefined): boolean {
  if (!config) return false;

  const requestUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
  return (
    config.url?.startsWith('/token') === true ||
    requestUrl.includes('/auth/v1/token')
  );
}

async function handleResponseError(
  error: AxiosError<ApiErrorPayload>,
  instance: AxiosInstance,
): Promise<never> {
  if (error.response?.status === 401) {
    const requestConfig = error.config as AuthRequestConfig | undefined;
    const authTokenRequest = isAuthTokenRequest(requestConfig);
    const currentRefreshToken = getRefreshToken();

    if (
      !authTokenRequest &&
      requestConfig &&
      !requestConfig._authRetry &&
      currentRefreshToken &&
      refreshAccessToken
    ) {
      requestConfig._authRetry = true;
      const pendingRefresh =
        refreshPromise ?? (refreshPromise = refreshAccessToken());

      try {
        const refreshed = await pendingRefresh;
        requestConfig.headers.set('Authorization', `Bearer ${refreshed.token}`);
        return instance.request(requestConfig);
      } catch {
        // A rejected refresh means the persisted session is no longer usable.
      } finally {
        if (refreshPromise === pendingRefresh) {
          refreshPromise = null;
        }
      }
    }

    if (!authTokenRequest) {
      onUnauthorized();
    }
  }
  if (axios.isCancel(error)) {
    return Promise.reject(error);
  }

  const payload = error.response?.data as ApiErrorPayload | undefined;
  const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  const normalized: ApiError = {
    message:
      getPayloadMessage(payload) ??
      (isTimeout
        ? 'Yêu cầu mất quá nhiều thời gian, vui lòng thử lại.'
        : error.response
          ? 'Đã có lỗi xảy ra, vui lòng thử lại.'
          : 'Không thể kết nối đến máy chủ, vui lòng kiểm tra mạng.'),
    status: error.response?.status,
    code: getString(payload?.code) ?? error.code,
    errors: getFieldErrors(payload?.errors),
    details: payload,
    requestId: getHeaderValue(error.response, 'x-request-id'),
    isNetworkError: !error.response,
    isTimeout,
  };
  return Promise.reject(normalized);
}

export function getConfiguredApiToken(): string | null {
  return getToken();
}

export function createApiClient(
  config: AxiosRequestConfig = {},
): AxiosInstance {
  const instance = axios.create({
    timeout: 30_000,
    ...config,
  });

  instance.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      if (
        shouldUseJsonContentType(requestConfig.data) &&
        !requestConfig.headers.has('Content-Type')
      ) {
        requestConfig.headers.set('Content-Type', 'application/json');
      }

      const token = getToken();
      if (token && !requestConfig.headers.has('Authorization')) {
        requestConfig.headers.set('Authorization', `Bearer ${token}`);
      }
      return requestConfig;
    },
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: AxiosError<ApiErrorPayload>) =>
      handleResponseError(error, instance),
  );

  return instance;
}

export const api = createApiClient({
  baseURL: env.apiUrl,
  timeout: env.apiTimeoutMs,
});
