import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';

interface TenantMembershipRow {
  tenant_id: string;
}

interface TenantRow {
  id: string;
  name: string;
}

interface RoleAssignmentRow {
  role_id: string;
}

interface RoleRow {
  id: string;
  name: string;
}

export interface ProjectContext {
  tenantId: string;
  tenantName: string;
  roleNames: string[];
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

export async function loadProjectContext(
  userId: string,
): Promise<ProjectContext> {
  assertSupabaseConfigured();

  const memberships = await request<TenantMembershipRow[]>(
    supabaseApi.get(
      '/tenant_members',
      queryParams({
        select: 'tenant_id',
        user_id: `eq.${userId}`,
        status: 'eq.active',
        order: 'created_at.asc',
        limit: '1',
      }),
    ),
  );
  const tenantId = memberships[0]?.tenant_id;

  if (!tenantId) {
    throw new Error('Tài khoản chưa thuộc tenant đang hoạt động.');
  }

  const [tenants, assignments, roles] = await Promise.all([
    request<TenantRow[]>(
      supabaseApi.get(
        '/tenants',
        queryParams({
          select: 'id,name',
          id: `eq.${tenantId}`,
          status: 'eq.active',
          limit: '1',
        }),
      ),
    ),
    request<RoleAssignmentRow[]>(
      supabaseApi.get(
        '/tenant_member_roles',
        queryParams({
          select: 'role_id',
          tenant_id: `eq.${tenantId}`,
          user_id: `eq.${userId}`,
        }),
      ),
    ),
    request<RoleRow[]>(
      supabaseApi.get(
        '/roles',
        queryParams({
          select: 'id,name',
          tenant_id: `eq.${tenantId}`,
          is_active: 'eq.true',
          order: 'created_at.asc',
        }),
      ),
    ),
  ]);

  const tenant = tenants[0];
  if (!tenant) {
    throw new Error('Không tìm thấy thông tin tenant đang hoạt động.');
  }

  const assignedRoleIds = new Set(
    assignments.map((assignment) => assignment.role_id),
  );
  const roleNames = roles
    .filter((role) => assignedRoleIds.has(role.id))
    .map((role) => role.name);

  return {
    tenantId,
    tenantName: tenant.name,
    roleNames,
  };
}
