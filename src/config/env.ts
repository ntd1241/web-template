/**
 * Truy cập biến môi trường đã được type hóa.
 * Mọi nơi cần env nên import từ đây, không đọc `import.meta.env` rải rác.
 */

function toBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? '/api/v1',
  useMock: toBool(import.meta.env.VITE_USE_MOCK, true),
  appName: import.meta.env.VITE_APP_NAME ?? 'Admin Template',
  defaultLocale: (import.meta.env.VITE_DEFAULT_LOCALE ?? 'vi') as 'vi' | 'en',
} as const;

export type AppEnv = typeof env;
