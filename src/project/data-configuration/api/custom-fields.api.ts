import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type {
  CustomField,
  CustomFieldDefinitionRow,
  CustomFieldEntityType,
  CustomFieldFormValues,
  CustomFieldOptionInput,
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

async function replaceCustomFieldOptions(
  fieldId: string,
  options: CustomFieldOptionInput[],
): Promise<void> {
  await request(
    supabaseApi.delete(
      '/tenant_custom_field_options',
      queryParams({ field_id: `eq.${fieldId}` }),
    ),
  );

  if (options.length === 0) return;

  await request(
    supabaseApi.post(
      '/tenant_custom_field_options',
      options.map((option, index) => ({
        field_id: fieldId,
        value: option.value,
        label: option.label,
        sort_order: index,
      })),
    ),
  );
}

export async function createCustomField(
  tenantId: string,
  entityType: CustomFieldEntityType,
  values: CustomFieldFormValues,
  options: CustomFieldOptionInput[],
): Promise<void> {
  assertSupabaseConfigured();
  const rows = await request<CustomFieldDefinitionRow[]>(
    supabaseApi.post(
      '/tenant_custom_field_definitions',
      {
        tenant_id: tenantId,
        entity_type: entityType,
        field_key: values.key,
        label: values.label,
        field_type: values.fieldType,
        is_required: values.isRequired,
        is_active: values.isActive,
      },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const fieldId = rows[0]?.id;
  if (!fieldId) throw new Error('Không nhận được trường vừa tạo.');
  await replaceCustomFieldOptions(fieldId, options);
}

export async function updateCustomField(
  fieldId: string,
  values: CustomFieldFormValues,
  options: CustomFieldOptionInput[],
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.patch(
      '/tenant_custom_field_definitions',
      {
        field_key: values.key,
        label: values.label,
        field_type: values.fieldType,
        is_required: values.isRequired,
        is_active: values.isActive,
      },
      {
        ...queryParams({ id: `eq.${fieldId}` }),
        headers: { Prefer: 'return=minimal' },
      },
    ),
  );
  await replaceCustomFieldOptions(fieldId, options);
}

export async function deleteCustomField(fieldId: string): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.delete(
      '/tenant_custom_field_definitions',
      queryParams({ id: `eq.${fieldId}` }),
    ),
  );
}
