/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL của REST API. Ví dụ: http://localhost:3000/api/v1 */
  readonly VITE_API_URL: string;
  /** Timeout request API tính theo mili-giây. */
  readonly VITE_API_TIMEOUT_MS?: string;
  /** URL project Supabase, ví dụ https://<project-ref>.supabase.co. */
  readonly VITE_SUPABASE_URL?: string;
  /** Publishable/anon key, chỉ dùng ở browser cùng với RLS. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Schema PostgREST mặc định, thường là public. */
  readonly VITE_SUPABASE_SCHEMA?: string;
  /** Domain dùng để map alias đăng nhập ngắn như `admin` thành email. */
  readonly VITE_SUPABASE_LOGIN_DOMAIN?: string;
  /** Bật mock data thay vì gọi API thật. '1' | 'true' để bật. */
  readonly VITE_USE_MOCK: string;
  /** Tên app, dùng cho <title>, header. */
  readonly VITE_APP_NAME: string;
  /** Ngôn ngữ mặc định: 'vi' | 'en'. */
  readonly VITE_DEFAULT_LOCALE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
