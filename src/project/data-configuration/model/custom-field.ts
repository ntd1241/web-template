import { z } from 'zod';

export const CUSTOM_FIELD_ENTITY_TYPES = [
  'customer',
  'employee',
  'contract',
] as const;

export type CustomFieldEntityType = (typeof CUSTOM_FIELD_ENTITY_TYPES)[number];

export const CUSTOM_FIELD_ENTITY_META: Record<
  CustomFieldEntityType,
  { label: string }
> = {
  customer: {
    label: 'Khách hàng',
  },
  employee: {
    label: 'Nhân viên',
  },
  contract: {
    label: 'Hợp đồng',
  },
};

export const CUSTOM_FIELD_TYPES = ['text', 'number', 'select'] as const;
export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export const customFieldFormSchema = z.object({
  label: z.string().trim().min(1, 'Vui lòng nhập tên trường.'),
  key: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã trường.')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Mã chỉ gồm chữ thường, số, dấu gạch dưới và bắt đầu bằng chữ cái.',
    ),
  fieldType: z.enum(CUSTOM_FIELD_TYPES),
  isRequired: z.boolean(),
  isActive: z.boolean(),
});

export type CustomFieldFormValues = z.infer<typeof customFieldFormSchema>;

export interface CustomFieldOptionInput {
  value: string;
  label: string;
}

export const emptyCustomFieldForm: CustomFieldFormValues = {
  label: '',
  key: '',
  fieldType: 'text',
  isRequired: false,
  isActive: true,
};

export const CUSTOM_FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: 'Chữ',
  number: 'Số',
  select: 'Danh sách lựa chọn',
};

export interface CustomFieldOption {
  id: string;
  value: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
}

export interface CustomField {
  id: string;
  tenantId: string;
  entityType: CustomFieldEntityType;
  key: string;
  label: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  isActive: boolean;
  sortOrder: number;
  options: CustomFieldOption[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldDefinitionRow {
  id: string;
  tenant_id: string;
  entity_type: CustomFieldEntityType;
  field_key: string;
  label: string;
  field_type: CustomFieldType;
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CustomFieldOptionRow {
  id: string;
  field_id: string;
  value: string;
  label: string;
  sort_order: number;
  is_active: boolean;
}

export const customFieldDefinitionRowSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  entity_type: z.enum(CUSTOM_FIELD_ENTITY_TYPES),
  field_key: z.string(),
  label: z.string(),
  field_type: z.enum(CUSTOM_FIELD_TYPES),
  is_required: z.boolean(),
  is_active: z.boolean(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const customFieldOptionRowSchema = z.object({
  id: z.string(),
  field_id: z.string(),
  value: z.string(),
  label: z.string(),
  sort_order: z.number(),
  is_active: z.boolean(),
});
