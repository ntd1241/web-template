/**
 * Truy cập biến môi trường đã được type hóa.
 * Mọi nơi cần env nên import từ đây, không đọc `import.meta.env` rải rác.
 */

function toBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value === '1' || value.toLowerCase() === 'true';
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeApiUrl(value: string | undefined): string {
  const normalized = value?.trim();
  if (!normalized) return '/api/v1';

  return normalized.replace(/\/+$/, '') || '/';
}

function normalizeOptionalUrl(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, '') ?? '';
}

function getOptionalString(value: string | undefined): string {
  return value?.trim() ?? '';
}

const supabaseUrl = normalizeOptionalUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey = getOptionalString(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export const env = {
  apiUrl: normalizeApiUrl(import.meta.env.VITE_API_URL),
  apiTimeoutMs: toPositiveInt(import.meta.env.VITE_API_TIMEOUT_MS, 30_000),
  supabaseUrl,
  supabaseRestUrl: supabaseUrl ? `${supabaseUrl}/rest/v1` : '',
  supabaseAnonKey,
  supabaseSchema:
    getOptionalString(import.meta.env.VITE_SUPABASE_SCHEMA) || 'public',
  supabaseEnabled: Boolean(supabaseUrl && supabaseAnonKey),
  useMock: toBool(import.meta.env.VITE_USE_MOCK, true),
  appName: import.meta.env.VITE_APP_NAME ?? 'Admin Template',
  defaultLocale: (import.meta.env.VITE_DEFAULT_LOCALE ?? 'vi') as 'vi' | 'en',
} as const;

export type AppEnv = typeof env;
