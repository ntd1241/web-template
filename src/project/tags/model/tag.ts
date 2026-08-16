import { z } from 'zod';

export const EMPLOYEE_TAG_GROUP_CODE = 'employees' as const;
export const CUSTOMER_TAG_GROUP_CODE = 'customers' as const;
export const CONTRACT_TAG_GROUP_CODE = 'contracts' as const;

export const tagGroupFormSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhóm nhãn.'),
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã nhóm nhãn.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Mã chỉ gồm chữ thường, số và dấu gạch ngang.',
    ),
  description: z.string().trim().max(300, 'Mô tả không được quá 300 ký tự.'),
});

export const tagFormSchema = z.object({
  groupId: z.string().uuid('Vui lòng chọn nhóm nhãn.'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên nhãn.'),
  description: z.string().trim().max(500, 'Mô tả không được quá 500 ký tự.'),
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã nhãn.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Mã chỉ gồm chữ thường, số và dấu gạch ngang.',
    ),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Màu phải có dạng #RRGGBB.'),
});

export type TagGroupFormValues = z.infer<typeof tagGroupFormSchema>;
export type TagFormValues = z.infer<typeof tagFormSchema>;

export interface TagGroup {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  moduleCode: string | null;
  moduleName: string | null;
  isSystem: boolean;
  sortOrder: number;
  isActive: boolean;
  tagCount: number;
}

export interface Tag {
  id: string;
  tenantId: string;
  groupId: string;
  code: string;
  name: string;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  groupName: string;
  assignmentCount: number;
  description: string;
  groupDescription?: string;
  moduleCode?: string | null;
  isSystem?: boolean;
  isGroup?: boolean;
  isExpanded?: boolean;
}

export interface TagSelectOption {
  id: string;
  name: string;
  color: string | null;
  groupId: string;
  groupName: string;
  moduleCode: string | null;
  isSystem: boolean;
  isActive: boolean;
}

export interface TagAssignment {
  id: string;
  tenantId: string;
  tagId: string;
  subjectType: string;
  subjectId: string;
}

export interface TagWorkspace {
  tenantId: string;
  groups: TagGroup[];
  tags: Tag[];
  assignments: TagAssignment[];
}

export const emptyTagGroupForm: TagGroupFormValues = {
  name: '',
  code: '',
  description: '',
};

export const emptyTagForm: TagFormValues = {
  groupId: '',
  name: '',
  description: '',
  code: '',
  color: '#2563eb',
};

export interface TagGroupRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string;
  module_code: string | null;
  is_system: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface TagRow {
  id: string;
  tenant_id: string;
  group_id: string;
  code: string;
  name: string;
  description: string;
  color: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface TagAssignmentRow {
  id: string;
  tenant_id: string;
  tag_id: string;
  subject_type: string;
  subject_id: string;
}
