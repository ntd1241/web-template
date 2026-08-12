export const TENANT_STATUSES = ['active', 'suspended', 'archived'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const TENANT_PLANS = [
  'free',
  'starter',
  'business',
  'enterprise',
] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

export const TENANT_MEMBER_ROLES = ['owner', 'admin', 'member'] as const;
export type TenantMemberRole = (typeof TENANT_MEMBER_ROLES)[number];

export const TENANT_MEMBER_STATUSES = [
  'invited',
  'active',
  'suspended',
  'removed',
] as const;
export type TenantMemberStatus = (typeof TENANT_MEMBER_STATUSES)[number];

export interface TenantSettings {
  locale?: string;
  timezone?: string;
  dateFormat?: string;
  [key: string]: unknown;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  legalName: string | null;
  logoUrl: string | null;
  status: TenantStatus;
  plan: TenantPlan;
  settings: TenantSettings;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

/** Row shape trả về trực tiếp từ PostgREST/Supabase. */
export interface TenantRow {
  id: string;
  slug: string;
  name: string;
  legal_name: string | null;
  logo_url: string | null;
  status: TenantStatus;
  plan: TenantPlan;
  settings: TenantSettings;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface TenantMember {
  tenantId: string;
  userId: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
  invitedAt: string | null;
  joinedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMemberRow {
  tenant_id: string;
  user_id: string;
  role: TenantMemberRole;
  status: TenantMemberStatus;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export function mapTenantRow(row: TenantRow): Tenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    legalName: row.legal_name,
    logoUrl: row.logo_url,
    status: row.status,
    plan: row.plan,
    settings: row.settings,
    metadata: row.metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
  };
}

export function mapTenantMemberRow(row: TenantMemberRow): TenantMember {
  return {
    tenantId: row.tenant_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    invitedAt: row.invited_at,
    joinedAt: row.joined_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  legalName?: string;
  plan?: TenantPlan;
  settings?: TenantSettings;
  metadata?: Record<string, unknown>;
}

export interface UpdateTenantInput {
  name?: string;
  legalName?: string | null;
  logoUrl?: string | null;
  status?: TenantStatus;
  plan?: TenantPlan;
  settings?: TenantSettings;
  metadata?: Record<string, unknown>;
}
