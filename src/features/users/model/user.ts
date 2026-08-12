export const USER_PROFILE_STATUSES = [
  'active',
  'suspended',
  'deactivated',
] as const;
export type UserProfileStatus = (typeof USER_PROFILE_STATUSES)[number];

export interface UserProfileSettings {
  locale?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  [key: string]: unknown;
}

/** Hồ sơ ứng dụng dùng chung, không chứa role/status theo tenant. */
export interface UserProfile {
  id: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  status: UserProfileStatus;
  locale: string;
  timezone: string;
  settings: UserProfileSettings;
  metadata: Record<string, unknown>;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Row shape của public.user_profiles từ PostgREST/Supabase. */
export interface UserProfileRow {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  status: UserProfileStatus;
  locale: string;
  timezone: string;
  settings: UserProfileSettings;
  metadata: Record<string, unknown>;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  userMetadata: Record<string, unknown>;
  appMetadata: Record<string, unknown>;
}

/** User đang đăng nhập: auth identity + profile ứng dụng. */
export interface CurrentUser {
  auth: AuthUser;
  profile: UserProfile | null;
}

export interface AuthUserRow {
  id: string;
  email?: string | null;
  phone?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

export function mapUserProfileRow(row: UserProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    status: row.status,
    locale: row.locale,
    timezone: row.timezone,
    settings: row.settings,
    metadata: row.metadata,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAuthUserRow(row: AuthUserRow): AuthUser {
  return {
    id: row.id,
    email: row.email ?? null,
    phone: row.phone ?? null,
    emailConfirmedAt: row.email_confirmed_at ?? null,
    lastSignInAt: row.last_sign_in_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
    userMetadata: row.user_metadata ?? {},
    appMetadata: row.app_metadata ?? {},
  };
}

export interface UpdateUserProfileInput {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  locale?: string;
  timezone?: string;
  settings?: UserProfileSettings;
  metadata?: Record<string, unknown>;
}
