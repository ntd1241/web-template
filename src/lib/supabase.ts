import { env } from '@/config/env';
import { createApiClient, getConfiguredApiToken } from './axios';

/**
 * Supabase PostgREST client dùng Axios.
 *
 * Chỉ dùng publishable/anon key ở browser. RLS mới là lớp bảo vệ dữ liệu;
 * tuyệt đối không đưa service_role key vào VITE_* hoặc bundle frontend.
 */
export const supabaseApi = createApiClient({
  baseURL: env.supabaseRestUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
    apikey: env.supabaseAnonKey,
  },
});

/** Supabase Auth API, cũng gọi qua Axios để dùng chung timeout/error handling. */
export const supabaseAuthApi = createApiClient({
  baseURL: env.supabaseAuthUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
    apikey: env.supabaseAnonKey,
  },
});

/** Supabase Storage REST client dùng cùng token/session với PostgREST. */
export const supabaseStorageApi = createApiClient({
  baseURL: env.supabaseUrl ? `${env.supabaseUrl}/storage/v1` : '',
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: 'application/json',
    apikey: env.supabaseAnonKey,
  },
});

supabaseApi.interceptors.request.use((config) => {
  config.headers.set('apikey', env.supabaseAnonKey);
  config.headers.set(
    'Authorization',
    `Bearer ${getConfiguredApiToken() ?? env.supabaseAnonKey}`,
  );

  if (env.supabaseSchema !== 'public') {
    config.headers.set('Accept-Profile', env.supabaseSchema);
    if (config.method !== 'get' && config.method !== 'head') {
      config.headers.set('Content-Profile', env.supabaseSchema);
    }
  }

  return config;
});

supabaseAuthApi.interceptors.request.use((config) => {
  config.headers.set('apikey', env.supabaseAnonKey);
  config.headers.set(
    'Authorization',
    `Bearer ${getConfiguredApiToken() ?? env.supabaseAnonKey}`,
  );
  return config;
});

supabaseStorageApi.interceptors.request.use((config) => {
  config.headers.set('apikey', env.supabaseAnonKey);
  config.headers.set(
    'Authorization',
    `Bearer ${getConfiguredApiToken() ?? env.supabaseAnonKey}`,
  );
  return config;
});

export function assertSupabaseConfigured(): void {
  if (!env.supabaseEnabled) {
    throw new Error(
      'Supabase chưa được cấu hình. Hãy thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.',
    );
  }
}
