import { z } from 'zod';
import type { ContractVersionLineValuesForApi } from '../api/contracts.api';

export const CONTRACT_TEMPLATE_STATUSES = [
  'draft',
  'published',
  'archived',
] as const;
export type ContractTemplateStatus =
  (typeof CONTRACT_TEMPLATE_STATUSES)[number];

export const CONTRACT_TEMPLATE_STATUS_LABELS: Record<
  ContractTemplateStatus,
  string
> = {
  draft: 'Bản nháp',
  published: 'Đang phát hành',
  archived: 'Đã lưu trữ',
};

const currencyCode = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/, 'Mã tiền tệ phải gồm 3 chữ cái viết hoa.');

export const contractTemplateFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, 'Vui lòng nhập mã mẫu hợp đồng.')
    .regex(/^[A-Za-z0-9-]+$/, 'Mã mẫu chỉ gồm chữ, số và dấu gạch ngang.'),
  name: z.string().trim().min(1, 'Vui lòng nhập tên mẫu hợp đồng.'),
  description: z.string().trim().max(500, 'Mô tả không được quá 500 ký tự.'),
  currencyCode,
  autoRenewDefault: z.boolean(),
  note: z.string().trim().max(1000, 'Ghi chú không được quá 1000 ký tự.'),
});

export type ContractTemplateFormValues = z.infer<
  typeof contractTemplateFormSchema
>;

export type ContractTemplateLineValues = Omit<
  ContractVersionLineValuesForApi,
  'sourceLineId'
>;

export interface ContractTemplate {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string;
  status: ContractTemplateStatus;
  currencyCode: string;
  autoRenewDefault: boolean;
  note: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  latestVersionNo: number | null;
  latestVersionStatus: ContractTemplateVersionStatus | null;
  lineCount: number;
  contractCount: number;
}

export const CONTRACT_TEMPLATE_VERSION_STATUSES = [
  'draft',
  'published',
  'superseded',
] as const;
export type ContractTemplateVersionStatus =
  (typeof CONTRACT_TEMPLATE_VERSION_STATUSES)[number];

export interface ContractTemplateVersion {
  id: string;
  templateId: string;
  versionNo: number;
  status: ContractTemplateVersionStatus;
  termsSnapshot: ContractTemplateFormValues;
  createdBy: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContractTemplateVersionLine extends ContractTemplateLineValues {
  id: string;
  templateVersionId: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractTemplateDetail extends ContractTemplate {
  versions: ContractTemplateVersion[];
  lines: ContractTemplateVersionLine[];
}

export interface ContractTemplateListParams {
  page: number;
  pageSize: number;
  search?: string;
  templateSearch?: string;
  statuses?: ContractTemplateStatus[];
  tagIds?: string[];
  lineCountMin?: number;
  lineCountMax?: number;
  contractCountMin?: number;
  contractCountMax?: number;
  versionNoMin?: number;
  versionNoMax?: number;
  updatedFrom?: string;
  updatedTo?: string;
}

export interface ContractTemplateListResult {
  templates: ContractTemplate[];
  total: number;
}

export interface ContractTemplateVersionLineRow {
  id: string;
  template_version_id: string;
  direction: ContractTemplateLineValues['direction'];
  name: string;
  quantity: number | string;
  unit_price: number | string;
  amount: number | string;
  billing_type: ContractTemplateLineValues['billingType'];
  billing_unit: ContractTemplateLineValues['billingUnit'];
  billing_interval: number | null;
  charge_date: string | null;
  due_rule: ContractTemplateLineValues['dueRule'];
  due_days: number | null;
  start_date: string;
  end_date: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function mapContractTemplateRow(
  row: ContractTemplate,
): ContractTemplate {
  return row;
}

export function mapContractTemplateLineRow(
  row: ContractTemplateVersionLineRow,
): ContractTemplateVersionLine {
  return {
    id: row.id,
    templateVersionId: row.template_version_id,
    direction: row.direction,
    name: row.name,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unit_price),
    amount: Number(row.amount),
    billingType: row.billing_type,
    billingUnit: row.billing_unit,
    billingInterval: row.billing_interval,
    chargeDate: row.charge_date,
    dueRule: row.due_rule,
    dueDays: row.due_days,
    startDate: row.start_date,
    endDate: row.end_date,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
