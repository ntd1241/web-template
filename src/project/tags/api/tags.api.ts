import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type {
  Tag,
  TagAssignment,
  TagAssignmentRow,
  TagFormValues,
  TagGroup,
  TagGroupFormValues,
  TagGroupRow,
  TagRow,
  TagSelectOption,
  TagWorkspace,
} from '../model/tag';

interface TenantMembershipRow {
  tenant_id: string;
}

interface PermissionModuleRow {
  code: string;
  name: string;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

async function getCurrentTenantId(userId: string): Promise<string> {
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

  return tenantId;
}

function mapGroup(
  row: TagGroupRow,
  tagCount: number,
  moduleNameByCode: ReadonlyMap<string, string>,
): TagGroup {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    code: row.code,
    name: row.name,
    description: row.description,
    moduleCode: row.module_code ?? null,
    moduleName: row.module_code
      ? (moduleNameByCode.get(row.module_code) ?? null)
      : null,
    isSystem: row.is_system ?? false,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    tagCount,
  };
}

function mapTag(row: TagRow, groupName: string, assignmentCount: number): Tag {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    groupId: row.group_id,
    code: row.code,
    name: row.name,
    color: row.color,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    groupName,
    assignmentCount,
    description: row.description,
  };
}

export async function loadTagWorkspace(
  userId: string,
  tenantIdOverride?: string,
): Promise<TagWorkspace> {
  assertSupabaseConfigured();

  const tenantId = tenantIdOverride ?? (await getCurrentTenantId(userId));
  const [groupRows, tagRows, assignmentRows, moduleRows] = await Promise.all([
    request<TagGroupRow[]>(
      supabaseApi.get(
        '/tag_groups',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          order: 'sort_order.asc,name.asc',
        }),
      ),
    ),
    request<TagRow[]>(
      supabaseApi.get(
        '/tags',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          order: 'sort_order.asc,name.asc',
        }),
      ),
    ),
    request<TagAssignmentRow[]>(
      supabaseApi.get(
        '/tag_assignments',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          order: 'created_at.asc',
        }),
      ),
    ),
    request<PermissionModuleRow[]>(
      supabaseApi.get(
        '/permission_modules',
        queryParams({
          select: 'code,name',
          is_active: 'eq.true',
          order: 'sort_order.asc,code.asc',
        }),
      ),
    ),
  ]);
  const moduleNameByCode = new Map(
    moduleRows.map((module) => [module.code, module.name]),
  );
  const groupNameById = new Map(
    groupRows.map((group) => [group.id, group.name]),
  );
  const assignmentCountByTagId = new Map<string, number>();
  for (const assignment of assignmentRows) {
    assignmentCountByTagId.set(
      assignment.tag_id,
      (assignmentCountByTagId.get(assignment.tag_id) ?? 0) + 1,
    );
  }

  const tagCountByGroupId = new Map<string, number>();
  for (const tag of tagRows) {
    tagCountByGroupId.set(
      tag.group_id,
      (tagCountByGroupId.get(tag.group_id) ?? 0) + 1,
    );
  }

  return {
    tenantId,
    groups: groupRows.map((group) =>
      mapGroup(group, tagCountByGroupId.get(group.id) ?? 0, moduleNameByCode),
    ),
    tags: tagRows.map((tag) =>
      mapTag(
        tag,
        groupNameById.get(tag.group_id) ?? 'Chưa phân nhóm',
        assignmentCountByTagId.get(tag.id) ?? 0,
      ),
    ),
    assignments: assignmentRows.map<TagAssignment>((assignment) => ({
      id: assignment.id,
      tenantId: assignment.tenant_id,
      tagId: assignment.tag_id,
      subjectType: assignment.subject_type,
      subjectId: assignment.subject_id,
    })),
  };
}

export interface TagSelectConfig {
  moduleCodes?: string[];
  allowCustomGroups?: boolean;
}

export type TaggableSubjectType = 'employee' | 'customer' | 'contract_template';

export interface SubjectTagFilterData {
  options: TagSelectOption[];
  tagsBySubjectId: Record<string, TagSelectOption[]>;
}

interface SubjectTagAssignmentRow {
  tag_id: string;
  subject_id: string;
}

export async function loadTagSelectOptions(
  userId: string,
  config: TagSelectConfig = {},
  tenantIdOverride?: string,
): Promise<TagSelectOption[]> {
  assertSupabaseConfigured();

  const tenantId = tenantIdOverride ?? (await getCurrentTenantId(userId));
  const moduleCodes = Array.from(
    new Set(
      (config.moduleCodes ?? []).map((code) => code.trim()).filter(Boolean),
    ),
  );
  const allowCustomGroups = config.allowCustomGroups ?? true;

  if (!allowCustomGroups && moduleCodes.length === 0) return [];

  const groupFilter = allowCustomGroups
    ? moduleCodes.length > 0
      ? `(module_code.is.null,module_code.in.(${moduleCodes.join(',')}))`
      : 'module_code.is.null'
    : `module_code.in.(${moduleCodes.join(',')})`;

  const groups = await request<TagGroupRow[]>(
    supabaseApi.get(
      '/tag_groups',
      queryParams({
        select: 'id,name,module_code,is_system,is_active',
        tenant_id: `eq.${tenantId}`,
        is_active: 'eq.true',
        or: groupFilter,
        order: 'sort_order.asc,name.asc',
      }),
    ),
  );
  const groupIds = groups.map((group) => group.id);
  if (groupIds.length === 0) return [];

  const tags = await request<TagRow[]>(
    supabaseApi.get(
      '/tags',
      queryParams({
        select: 'id,group_id,name,color,is_active,sort_order',
        tenant_id: `eq.${tenantId}`,
        group_id: `in.(${groupIds.join(',')})`,
        order: 'sort_order.asc,name.asc',
      }),
    ),
  );
  const groupById = new Map(groups.map((group) => [group.id, group]));

  return tags.flatMap((tag) => {
    const group = groupById.get(tag.group_id);
    if (!group) return [];
    return [
      {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        groupId: tag.group_id,
        groupName: group.name,
        moduleCode: group.module_code,
        isSystem: group.is_system,
        isActive: tag.is_active,
      },
    ];
  });
}

export async function loadSubjectTagFilter(
  tenantId: string,
  subjectType: TaggableSubjectType,
  config: TagSelectConfig = {},
): Promise<SubjectTagFilterData> {
  assertSupabaseConfigured();

  const moduleCodes = Array.from(
    new Set(
      (config.moduleCodes ?? []).map((code) => code.trim()).filter(Boolean),
    ),
  );
  const allowCustomGroups = config.allowCustomGroups ?? true;
  const groupFilter = allowCustomGroups
    ? moduleCodes.length > 0
      ? `(module_code.is.null,module_code.in.(${moduleCodes.join(',')}))`
      : 'module_code.is.null'
    : `module_code.in.(${moduleCodes.join(',')})`;

  const groups = await request<TagGroupRow[]>(
    supabaseApi.get(
      '/tag_groups',
      queryParams({
        select: 'id,name,module_code,is_system,is_active',
        tenant_id: `eq.${tenantId}`,
        is_active: 'eq.true',
        or: groupFilter,
        order: 'sort_order.asc,name.asc',
      }),
    ),
  );
  const groupIds = groups.map((group) => group.id);
  if (groupIds.length === 0) {
    return { options: [], tagsBySubjectId: {} };
  }

  const [tags, assignments] = await Promise.all([
    request<TagRow[]>(
      supabaseApi.get(
        '/tags',
        queryParams({
          select: 'id,group_id,name,color,is_active,sort_order',
          tenant_id: `eq.${tenantId}`,
          group_id: `in.(${groupIds.join(',')})`,
          order: 'sort_order.asc,name.asc',
        }),
      ),
    ),
    request<SubjectTagAssignmentRow[]>(
      supabaseApi.get(
        '/tag_assignments',
        queryParams({
          select: 'tag_id,subject_id',
          tenant_id: `eq.${tenantId}`,
          subject_type: `eq.${subjectType}`,
        }),
      ),
    ),
  ]);

  const groupById = new Map(groups.map((group) => [group.id, group]));
  const options = tags.flatMap<TagSelectOption>((tag) => {
    const group = groupById.get(tag.group_id);
    if (!group) return [];
    return [
      {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        groupId: tag.group_id,
        groupName: group.name,
        moduleCode: group.module_code,
        isSystem: group.is_system,
        isActive: tag.is_active,
      },
    ];
  });
  const optionById = new Map(options.map((option) => [option.id, option]));
  const tagsBySubjectId: Record<string, TagSelectOption[]> = {};

  for (const assignment of assignments) {
    const option = optionById.get(assignment.tag_id);
    if (!option) continue;
    const subjectTags = tagsBySubjectId[assignment.subject_id] ?? [];
    subjectTags.push(option);
    tagsBySubjectId[assignment.subject_id] = subjectTags;
  }

  return { options, tagsBySubjectId };
}

export async function createTagGroup(
  tenantId: string,
  userId: string,
  values: TagGroupFormValues,
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.post('/tag_groups', {
      tenant_id: tenantId,
      code: values.code,
      name: values.name,
      description: values.description,
      created_by: userId,
    }),
  );
}

export async function updateTagGroup(
  groupId: string,
  values: TagGroupFormValues,
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.patch(
      '/tag_groups',
      {
        code: values.code,
        name: values.name,
        description: values.description,
      },
      {
        ...queryParams({ id: `eq.${groupId}` }),
        headers: { Prefer: 'return=minimal' },
      },
    ),
  );
}

export async function deleteTagGroup(groupId: string): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.delete('/tag_groups', queryParams({ id: `eq.${groupId}` })),
  );
}

export async function createTag(
  tenantId: string,
  userId: string,
  values: TagFormValues,
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.post('/tags', {
      tenant_id: tenantId,
      group_id: values.groupId,
      code: values.code,
      name: values.name,
      description: values.description,
      color: values.color,
      created_by: userId,
    }),
  );
}

export async function updateTag(
  tagId: string,
  values: TagFormValues,
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.patch(
      '/tags',
      {
        group_id: values.groupId,
        code: values.code,
        name: values.name,
        description: values.description,
        color: values.color,
      },
      {
        ...queryParams({ id: `eq.${tagId}` }),
        headers: { Prefer: 'return=minimal' },
      },
    ),
  );
}

export async function deleteTag(tagId: string): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.delete('/tags', queryParams({ id: `eq.${tagId}` })),
  );
}

export async function replaceSubjectTags(
  tenantId: string,
  subjectType: string,
  subjectId: string,
  tagIds: string[],
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.post('/rpc/replace_tag_assignments', {
      target_tenant_id: tenantId,
      target_subject_type: subjectType,
      target_subject_id: subjectId,
      target_tag_ids: tagIds,
    }),
  );
}
