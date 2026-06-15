/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL của REST API. Ví dụ: http://localhost:3000/api/v1 */
  readonly VITE_API_URL: string;
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
