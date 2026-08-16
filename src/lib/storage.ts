import { env } from '@/config/env';
import { assertSupabaseConfigured, supabaseStorageApi } from './supabase';

export function getStorageItem<T>(key: string): T | undefined {
  try {
    const storage = globalThis.localStorage;
    const value = storage.getItem(key);

    if (value === null) {
      return undefined;
    }

    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage can be unavailable or full; persistence is best effort.
  }
}

export const TENANT_ASSETS_BUCKET = 'tenant-assets';

export interface StorageObjectInput {
  bucket: string;
  path: string;
  file: File;
  upsert?: boolean;
}

export async function uploadStorageObject({
  bucket,
  path,
  file,
  upsert = false,
}: StorageObjectInput): Promise<void> {
  assertSupabaseConfigured();

  await supabaseStorageApi.post(`/object/${bucket}/${path}`, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': String(upsert),
    },
  });
}

export async function removeStorageObjects(
  bucket: string,
  paths: string[],
): Promise<void> {
  const normalizedPaths = Array.from(
    new Set(paths.map((path) => path.trim()).filter(Boolean)),
  );
  if (normalizedPaths.length === 0) return;

  assertSupabaseConfigured();
  await supabaseStorageApi.delete(`/object/${bucket}`, {
    data: { prefixes: normalizedPaths },
    headers: { 'Content-Type': 'application/json' },
  });
}

export function getPublicStorageUrl(bucket: string, path: string): string {
  return `${env.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
