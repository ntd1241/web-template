import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import type {
  ContractTemplate,
  ContractTemplateDetail,
  ContractTemplateFormValues,
  ContractTemplateLineValues,
  ContractTemplateListParams,
  ContractTemplateListResult,
  ContractTemplateStatus,
  ContractTemplateVersion,
  ContractTemplateVersionLine,
  ContractTemplateVersionLineRow,
} from '../model/contract-template';
import {
  normalizeContractVersionLineForSubmit,
  type ContractVersionLineValuesForApi,
} from './contracts.api';

interface ContractTemplateListRpcRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string;
  status: ContractTemplateStatus;
  currency_code: string;
  auto_renew_default: boolean;
  note: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  latest_version_no: number | null;
  latest_version_status: ContractTemplate['latestVersionStatus'];
  line_count: number;
  contract_count: number;
}

interface ContractTemplateListRpcResponse {
  items: ContractTemplateListRpcRow[];
  total: number | string;
}

interface ContractTemplateRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string;
  status: ContractTemplateStatus;
  currency_code: string;
  auto_renew_default: boolean;
  note: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ContractTemplateVersionRow {
  id: string;
  template_id: string;
  version_no: number;
  status: ContractTemplateVersion['status'];
  terms_snapshot: ContractTemplateFormValues;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

function numberValue(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function mapTemplateRow(row: ContractTemplateListRpcRow): ContractTemplate {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    code: row.code,
    name: row.name,
    description: row.description,
    status: row.status,
    currencyCode: row.currency_code,
    autoRenewDefault: row.auto_renew_default,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    latestVersionNo: row.latest_version_no,
    latestVersionStatus: row.latest_version_status,
    lineCount: numberValue(row.line_count),
    contractCount: numberValue(row.contract_count),
  };
}

function mapTemplateRowToDetail(row: ContractTemplateRow): ContractTemplate {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    code: row.code,
    name: row.name,
    description: row.description,
    status: row.status,
    currencyCode: row.currency_code,
    autoRenewDefault: row.auto_renew_default,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    latestVersionNo: null,
    latestVersionStatus: null,
    lineCount: 0,
    contractCount: 0,
  };
}

function mapVersionRow(
  row: ContractTemplateVersionRow,
): ContractTemplateVersion {
  return {
    id: row.id,
    templateId: row.template_id,
    versionNo: row.version_no,
    status: row.status,
    termsSnapshot: row.terms_snapshot,
    createdBy: row.created_by,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTemplateLinePayload(
  line: ContractTemplateLineValues | ContractVersionLineValuesForApi,
  versionId: string,
  index: number,
) {
  const normalizedLine = normalizeContractVersionLineForSubmit(line);
  return {
    template_version_id: versionId,
    direction: normalizedLine.direction,
    name: normalizedLine.name,
    quantity: normalizedLine.quantity,
    unit_price: normalizedLine.unitPrice,
    billing_type: normalizedLine.billingType,
    billing_unit: normalizedLine.billingUnit,
    billing_interval: normalizedLine.billingInterval,
    charge_date: normalizedLine.chargeDate,
    due_rule: normalizedLine.dueRule,
    due_days: normalizedLine.dueDays,
    start_date: normalizedLine.startDate,
    end_date: normalizedLine.endDate,
    sort_order: index,
  };
}

function templateTermsSnapshot(values: ContractTemplateFormValues) {
  return { ...values };
}

export async function loadContractTemplateList(
  tenantId: string,
  params: ContractTemplateListParams,
  signal?: AbortSignal,
): Promise<ContractTemplateListResult> {
  assertSupabaseConfigured();
  const response = await request<ContractTemplateListRpcResponse>(
    supabaseApi.post(
      '/rpc/list_contract_templates',
      {
        p_tenant_id: tenantId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        p_template_search: params.templateSearch?.trim() || null,
        p_statuses: params.statuses ?? [],
        p_line_count_min: params.lineCountMin ?? null,
        p_line_count_max: params.lineCountMax ?? null,
        p_contract_count_min: params.contractCountMin ?? null,
        p_contract_count_max: params.contractCountMax ?? null,
        p_version_no_min: params.versionNoMin ?? null,
        p_version_no_max: params.versionNoMax ?? null,
        p_updated_from: params.updatedFrom ?? null,
        p_updated_to: params.updatedTo ?? null,
      },
      { signal },
    ),
  );

  return {
    templates: response.items.map(mapTemplateRow),
    total: numberValue(response.total),
  };
}

export async function loadContractTemplateDetail(
  tenantId: string,
  templateId: string,
): Promise<ContractTemplateDetail> {
  assertSupabaseConfigured();
  const [templateRows, versionRows] = await Promise.all([
    request<ContractTemplateRow[]>(
      supabaseApi.get(
        '/contract_templates',
        queryParams({
          select: '*',
          id: `eq.${templateId}`,
          tenant_id: `eq.${tenantId}`,
          limit: '1',
        }),
      ),
    ),
    request<ContractTemplateVersionRow[]>(
      supabaseApi.get(
        '/contract_template_versions',
        queryParams({
          select: '*',
          template_id: `eq.${templateId}`,
          order: 'version_no.desc',
        }),
      ),
    ),
  ]);
  const template = templateRows[0];
  if (!template) throw new Error('Không tìm thấy mẫu hợp đồng.');

  const versionIds = versionRows.map((version) => version.id);
  const lineRows = versionIds.length
    ? await request<ContractTemplateVersionLineRow[]>(
        supabaseApi.get(
          '/contract_template_version_lines',
          queryParams({
            select: '*',
            template_version_id: `in.(${versionIds.join(',')})`,
            order: 'sort_order.asc,id.asc',
          }),
        ),
      )
    : [];
  const mappedTemplate = mapTemplateRowToDetail(template);
  return {
    ...mappedTemplate,
    latestVersionNo: versionRows[0]?.version_no ?? null,
    latestVersionStatus: versionRows[0]?.status ?? null,
    lineCount: lineRows.filter(
      (line) => line.template_version_id === versionRows[0]?.id,
    ).length,
    contractCount: 0,
    versions: versionRows.map(mapVersionRow),
    lines: lineRows.map((line) => {
      const mapped: ContractTemplateVersionLine = {
        id: line.id,
        templateVersionId: line.template_version_id,
        direction: line.direction,
        name: line.name,
        quantity: numberValue(line.quantity),
        unitPrice: numberValue(line.unit_price),
        amount: numberValue(line.amount),
        billingType: line.billing_type,
        billingUnit: line.billing_unit,
        billingInterval: line.billing_interval,
        chargeDate: line.charge_date,
        dueRule: line.due_rule,
        dueDays: line.due_days,
        startDate: line.start_date,
        endDate: line.end_date,
        sortOrder: line.sort_order,
        createdAt: line.created_at,
        updatedAt: line.updated_at,
      };
      return mapped;
    }),
  };
}

export async function createContractTemplate(
  tenantId: string,
  userId: string,
  values: ContractTemplateFormValues,
  lines: ContractTemplateLineValues[],
) {
  assertSupabaseConfigured();
  const templateRows = await request<ContractTemplateRow[]>(
    supabaseApi.post(
      '/contract_templates',
      {
        tenant_id: tenantId,
        code: values.code,
        name: values.name,
        description: values.description,
        currency_code: values.currencyCode,
        auto_renew_default: values.autoRenewDefault,
        note: values.note,
        created_by: userId,
      },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const template = templateRows[0];
  if (!template) throw new Error('Không thể tạo mẫu hợp đồng.');

  await insertTemplateVersion(template.id, userId, values, lines, 1);
  return mapTemplateRowToDetail(template);
}

export async function updateContractTemplate(
  templateId: string,
  userId: string,
  values: ContractTemplateFormValues,
  lines: ContractTemplateLineValues[],
) {
  assertSupabaseConfigured();
  const templateRows = await request<ContractTemplateRow[]>(
    supabaseApi.patch(
      '/contract_templates',
      {
        code: values.code,
        name: values.name,
        description: values.description,
        currency_code: values.currencyCode,
        auto_renew_default: values.autoRenewDefault,
        note: values.note,
        updated_at: new Date().toISOString(),
      },
      {
        ...queryParams({ id: `eq.${templateId}` }),
        headers: { Prefer: 'return=representation' },
      },
    ),
  );
  const template = templateRows[0];
  if (!template) throw new Error('Không tìm thấy mẫu hợp đồng để cập nhật.');

  const versions = await request<ContractTemplateVersionRow[]>(
    supabaseApi.get(
      '/contract_template_versions',
      queryParams({
        select: '*',
        template_id: `eq.${templateId}`,
        order: 'version_no.desc',
        limit: '1',
      }),
    ),
  );
  const latest = versions[0];
  if (!latest || latest.status !== 'draft') {
    await insertTemplateVersion(
      templateId,
      userId,
      values,
      lines,
      (latest?.version_no ?? 0) + 1,
    );
  } else {
    await supabaseApi.patch(
      '/contract_template_versions',
      {
        terms_snapshot: templateTermsSnapshot(values),
        updated_at: new Date().toISOString(),
      },
      queryParams({ id: `eq.${latest.id}` }),
    );
    await supabaseApi.delete(
      '/contract_template_version_lines',
      queryParams({ template_version_id: `eq.${latest.id}` }),
    );
    if (lines.length > 0) {
      await supabaseApi.post(
        '/contract_template_version_lines',
        lines.map((line, index) =>
          toTemplateLinePayload(line, latest.id, index),
        ),
      );
    }
  }
  return mapTemplateRowToDetail(template);
}

async function insertTemplateVersion(
  templateId: string,
  userId: string,
  values: ContractTemplateFormValues,
  lines: ContractTemplateLineValues[],
  versionNo: number,
) {
  const versionRows = await request<ContractTemplateVersionRow[]>(
    supabaseApi.post(
      '/contract_template_versions',
      {
        template_id: templateId,
        version_no: versionNo,
        status: 'draft',
        terms_snapshot: templateTermsSnapshot(values),
        created_by: userId,
      },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const version = versionRows[0];
  if (!version) throw new Error('Không thể tạo phiên bản mẫu hợp đồng.');
  if (lines.length > 0) {
    await supabaseApi.post(
      '/contract_template_version_lines',
      lines.map((line, index) =>
        toTemplateLinePayload(line, version.id, index),
      ),
    );
  }
  return version;
}

export async function publishContractTemplateVersion(
  tenantId: string,
  templateId: string,
  versionId: string,
) {
  assertSupabaseConfigured();
  await supabaseApi.post('/rpc/publish_contract_template_version', {
    p_tenant_id: tenantId,
    p_template_id: templateId,
    p_version_id: versionId,
  });
}

export async function archiveContractTemplate(templateId: string) {
  assertSupabaseConfigured();
  await supabaseApi.patch(
    '/contract_templates',
    { status: 'archived', updated_at: new Date().toISOString() },
    queryParams({ id: `eq.${templateId}` }),
  );
}
