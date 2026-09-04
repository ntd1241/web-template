import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type { CustomFieldEditorRow } from '../forms/custom-fields-editor';
import type {
  CustomField,
  CustomFieldDefinitionRow,
  CustomFieldEntityType,
  CustomFieldOptionRow,
} from '../model/custom-field';

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

export async function loadCustomFields(
  tenantId: string,
  entityType: CustomFieldEntityType,
): Promise<CustomField[]> {
  assertSupabaseConfigured();

  const fields = await request<CustomFieldDefinitionRow[]>(
    supabaseApi.get(
      '/tenant_custom_field_definitions',
      queryParams({
        select: '*',
        tenant_id: `eq.${tenantId}`,
        entity_type: `eq.${entityType}`,
        order: 'sort_order.asc,label.asc',
      }),
    ),
  );

  if (fields.length === 0) return [];

  const options = await request<CustomFieldOptionRow[]>(
    supabaseApi.get(
      '/tenant_custom_field_options',
      queryParams({
        select: '*',
        field_id: `in.(${fields.map((field) => field.id).join(',')})`,
        is_active: 'eq.true',
        order: 'sort_order.asc,label.asc',
      }),
    ),
  );
  const optionsByFieldId = new Map<string, CustomFieldOption[]>();

  for (const option of options) {
    const fieldOptions = optionsByFieldId.get(option.field_id) ?? [];
    fieldOptions.push({
      id: option.id,
      value: option.value,
      label: option.label,
      sortOrder: option.sort_order,
      isActive: option.is_active,
    });
    optionsByFieldId.set(option.field_id, fieldOptions);
  }

  return fields.map((field) => ({
    id: field.id,
    tenantId: field.tenant_id,
    entityType: field.entity_type,
    key: field.field_key,
    label: field.label,
    fieldType: field.field_type,
    isRequired: field.is_required,
    isActive: field.is_active,
    sortOrder: field.sort_order,
    options: optionsByFieldId.get(field.id) ?? [],
    createdAt: field.created_at,
    updatedAt: field.updated_at,
  }));
}

export async function saveCustomFields(
  tenantId: string,
  entityType: CustomFieldEntityType,
  fields: CustomFieldEditorRow[],
): Promise<void> {
  assertSupabaseConfigured();

  await request(
    supabaseApi.post('/rpc/save_tenant_custom_fields', {
      p_tenant_id: tenantId,
      p_entity_type: entityType,
      p_fields: fields.map((field) => ({
        ...(field.id ? { id: field.id } : {}),
        key: field.key,
        label: field.label,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        isActive: field.isActive,
        options: field.options,
      })),
    }),
  );
}
