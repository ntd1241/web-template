import { z } from 'zod';
import {
  CUSTOM_FIELD_TYPES,
  type CustomField,
  type CustomFieldOptionInput,
} from '../model/custom-field';

const customFieldEditorRowSchema = z.object({
  id: z.string().uuid().optional(),
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
  options: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    }),
  ),
});

export const customFieldsEditorFormSchema = z.object({
  fields: z.array(customFieldEditorRowSchema),
});

export type CustomFieldEditorRow = z.infer<
  typeof customFieldEditorRowSchema
> & {
  options: CustomFieldOptionInput[];
};

export type CustomFieldsFormValues = {
  fields: CustomFieldEditorRow[];
};

export function mapCustomFieldToEditorRow(
  field: CustomField,
): CustomFieldEditorRow {
  return {
    id: field.id,
    key: field.key,
    label: field.label,
    fieldType: field.fieldType,
    isRequired: field.isRequired,
    isActive: field.isActive,
    options: field.options.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  };
}

export function createEmptyCustomFieldEditorRow(): CustomFieldEditorRow {
  return {
    id: undefined,
    key: '',
    label: '',
    fieldType: 'text',
    isRequired: false,
    isActive: true,
    options: [],
  };
}
