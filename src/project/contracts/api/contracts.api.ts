import { formatCurrency } from '@/lib/format';
import {
  getPublicStorageUrl,
  removeStorageObjects,
  TENANT_ASSETS_BUCKET,
  uploadStorageObject,
} from '@/lib/storage';
import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import { loadCustomerDetail } from '../../customers/api/customers.api';
import type { Customer } from '../../customers/model/customer';
import { getPaymentReminderDays } from '../../model/tenant-settings';
import { replaceSubjectTags } from '../../tags/api/tags.api';
import { CONTRACT_TAG_GROUP_CODE } from '../../tags/model/tag';
import {
  mapContractRow,
  mapContractVersionLineRow,
  mapContractVersionRow,
  type Contract,
  type ContractAttachment,
  type ContractEmployeeOption,
  type ContractFormValues,
  type ContractListParams,
  type ContractListResult,
  type ContractRow,
  type ContractTagOption,
  type ContractVersion,
  type ContractVersionLine,
  type ContractVersionLineRow,
  type ContractVersionRow,
} from '../model/contract';
import type {
  ContractResponsibleAssignmentInput,
  ContractResponsibleWorkspace,
} from '../model/contract-responsible';
import {
  mapContractChargeBalanceRow,
  mapContractReceivablePeriodRpcRow,
  mapCustomerPaymentAllocationRow,
  mapCustomerPaymentRow,
  mapCustomerReceivableSummaryRow,
  type ContractChargeBalance,
  type ContractChargeBalanceRow,
  type ContractPaymentHistory,
  type ContractReceivablePeriodListParams,
  type ContractReceivablePeriodListResult,
  type ContractReceivablePeriodRpcResponse,
  type CustomerPaymentAllocationRow,
  type CustomerPaymentRow,
  type CustomerReceivableSummary,
  type CustomerReceivableSummaryRow,
} from '../model/receivable';

interface TenantMembershipRow {
  tenant_id: string;
}

interface CustomerOptionRow {
  id: string;
  customer_code: string;
  name: string;
  image_url: string | null;
}

interface ContractEmployeeRow {
  id: string;
  user_id: string | null;
  employee_code: string;
  first_name: string;
  last_name: string;
}

interface EmployeeAvatarRow {
  id: string;
  avatar_url: string | null;
}

interface ContractResponsibleRow {
  employee_id: string;
}

interface ContractAttachmentRow {
  id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number | string;
  storage_path: string;
  uploaded_by: string | null;
  created_at: string;
}

interface ContractTagRow {
  id: string;
  name: string;
  color: string | null;
}

interface ContractTagGroupRow {
  id: string;
}

interface ContractTagAssignmentRow {
  tag_id: string;
}

interface TenantSettingsRow {
  settings: Record<string, unknown>;
}

interface ContractListRpcRow extends ContractRow {
  customer_name: string;
  customer_code: string;
  customer_image_url: string | null;
  total_outstanding: number | string;
  next_due_date: string | null;
}

interface ContractListRpcResponse {
  items: ContractListRpcRow[];
  total: number | string;
}

export interface ContractWorkspace {
  tenantId: string;
  contracts: Contract[];
}

export async function loadContractList(
  tenantId: string,
  params: ContractListParams,
  signal?: AbortSignal,
): Promise<ContractListResult> {
  assertSupabaseConfigured();
  const response = await request<ContractListRpcResponse>(
    supabaseApi.post(
      '/rpc/list_contracts',
      {
        p_tenant_id: tenantId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        p_status: params.status ?? null,
      },
      { signal },
    ),
  );

  return {
    contracts: response.items.map((row) => ({
      ...mapContractRow(row),
      customerName: row.customer_name,
      customerCode: row.customer_code,
      customerImageUrl: row.customer_image_url,
      totalOutstanding: numberValue(row.total_outstanding),
      nextDueDate: row.next_due_date,
    })),
    total: numberValue(response.total),
  };
}

export async function loadContractReceivablePeriodList(
  tenantId: string,
  contractId: string,
  params: ContractReceivablePeriodListParams,
  signal?: AbortSignal,
): Promise<ContractReceivablePeriodListResult> {
  assertSupabaseConfigured();
  const response = await request<ContractReceivablePeriodRpcResponse>(
    supabaseApi.post(
      '/rpc/list_contract_receivable_periods_scoped',
      {
        p_tenant_id: tenantId,
        p_contract_id: contractId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        p_status: params.status ?? null,
        p_sort: params.sort,
        p_due_soon_days: params.dueSoonDays,
      },
      { signal },
    ),
  );

  return {
    rows: response.items.map(mapContractReceivablePeriodRpcRow),
    total: numberValue(response.total),
  };
}

export interface ContractCreationWorkspace {
  tenantId: string;
  employees: ContractEmployeeOption[];
  defaultResponsibleEmployeeId: string | null;
}

export interface ContractMetadataInput {
  responsibleEmployeeIds: string[];
  tagIds: string[];
  attachmentIdsToKeep: string[];
  attachments: File[];
}

export async function loadContractCreationWorkspace(
  userId: string,
  includeInactiveEmployees = false,
  tenantIdOverride?: string,
): Promise<ContractCreationWorkspace> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const employees = await loadContractEmployeeOptions(
    tenantId,
    includeInactiveEmployees,
  );
  return {
    tenantId,
    employees,
    defaultResponsibleEmployeeId:
      employees.find((employee) => employee.userId === userId)?.id ?? null,
  };
}

export interface ContractDetail extends Contract {
  paymentReminderDays: number;
  customer: Customer;
  versions: ContractVersion[];
  lines: ContractVersionLine[];
  charges: ContractChargeBalance[];
  payments: ContractPaymentHistory[];
  receivableSummary: CustomerReceivableSummary | null;
  createdByEmployee: ContractEmployeeOption | null;
  responsibleEmployees: ContractEmployeeOption[];
  attachments: ContractAttachment[];
  tags: ContractTagOption[];
}

function queryParams(params: Record<string, string>) {
  return { params };
}

async function request<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as T;
}

async function resolveTenantId(userId: string): Promise<string> {
  const rows = await request<TenantMembershipRow[]>(
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
  const tenantId = rows[0]?.tenant_id;
  if (!tenantId) throw new Error('Tài khoản chưa thuộc tenant đang hoạt động.');
  return tenantId;
}

function mapContractEmployee(
  row: ContractEmployeeRow,
  avatarUrl: string | null,
): ContractEmployeeOption {
  return {
    id: row.id,
    userId: row.user_id,
    employeeCode: row.employee_code,
    displayName:
      [row.last_name, row.first_name].filter(Boolean).join(' ').trim() ||
      row.employee_code,
    avatarUrl,
  };
}

async function loadContractEmployeeOptions(
  tenantId: string,
  includeInactive = false,
): Promise<ContractEmployeeOption[]> {
  const [rows, profiles] = await Promise.all([
    request<ContractEmployeeRow[]>(
      supabaseApi.get(
        '/employees',
        queryParams({
          select: 'id,user_id,employee_code,first_name,last_name',
          tenant_id: `eq.${tenantId}`,
          ...(includeInactive ? {} : { status: 'eq.active' }),
          order: 'last_name.asc,first_name.asc',
        }),
      ),
    ),
    request<EmployeeAvatarRow[]>(
      supabaseApi.get(
        '/user_profiles',
        queryParams({ select: 'id,avatar_url' }),
      ),
    ),
  ]);
  const avatarByUserId = new Map(
    profiles.map((profile) => [profile.id, profile.avatar_url]),
  );
  return rows.map((row) =>
    mapContractEmployee(
      row,
      row.user_id ? (avatarByUserId.get(row.user_id) ?? null) : null,
    ),
  );
}

async function loadContractTagOptions(
  tenantId: string,
  includeInactive = false,
): Promise<ContractTagOption[]> {
  const groupRows = await request<ContractTagGroupRow[]>(
    supabaseApi.get(
      '/tag_groups',
      queryParams({
        select: 'id',
        tenant_id: `eq.${tenantId}`,
        is_active: 'eq.true',
        or: `(module_code.is.null,module_code.eq.${CONTRACT_TAG_GROUP_CODE})`,
      }),
    ),
  );
  const groupIds = groupRows.map((group) => group.id);
  if (groupIds.length === 0) return [];

  const rows = await request<ContractTagRow[]>(
    supabaseApi.get(
      '/tags',
      queryParams({
        select: 'id,name,color',
        tenant_id: `eq.${tenantId}`,
        group_id: `in.(${groupIds.join(',')})`,
        ...(includeInactive ? {} : { is_active: 'eq.true' }),
        order: 'sort_order.asc,name.asc',
      }),
    ),
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
  }));
}

function mapContractAttachment(row: ContractAttachmentRow): ContractAttachment {
  return {
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: numberValue(row.size_bytes),
    storagePath: row.storage_path,
    url: getPublicStorageUrl(TENANT_ASSETS_BUCKET, row.storage_path),
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function previousIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function numberValue(value: number | string | null | undefined) {
  return value == null ? 0 : typeof value === 'number' ? value : Number(value);
}

async function ensureCharges(tenantId: string, throughDate = todayIso()) {
  await request<number>(
    supabaseApi.post('/rpc/ensure_contract_charges', {
      p_tenant_id: tenantId,
      p_through_date: throughDate,
    }),
  );
}

function attachListSummary(
  contract: Contract,
  customer: CustomerOptionRow | undefined,
  balances: ContractChargeBalance[],
): Contract {
  const contractBalances = balances.filter(
    (balance) =>
      balance.contractId === contract.id &&
      balance.direction === 'receivable' &&
      balance.status !== 'voided',
  );
  const outstanding = contractBalances.reduce(
    (sum, balance) => sum + balance.outstandingAmount,
    0,
  );
  const nextDueDate = contractBalances
    .filter((balance) => balance.outstandingAmount > 0)
    .map((balance) => balance.dueDate)
    .sort()[0];

  return {
    ...contract,
    customerName: customer?.name,
    customerCode: customer?.customer_code,
    customerImageUrl: customer?.image_url,
    totalOutstanding: outstanding,
    nextDueDate: nextDueDate ?? null,
  };
}

export async function loadContractWorkspace(
  userId: string,
  tenantIdOverride?: string,
): Promise<ContractWorkspace> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  await ensureCharges(tenantId);

  const [contractRows, customerRows, balanceRows] = await Promise.all([
    request<ContractRow[]>(
      supabaseApi.get(
        '/contracts',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          order: 'created_at.desc',
        }),
      ),
    ),
    request<CustomerOptionRow[]>(
      supabaseApi.get(
        '/customers',
        queryParams({
          select: 'id,customer_code,name,image_url',
          tenant_id: `eq.${tenantId}`,
          status: 'eq.active',
          order: 'name.asc',
        }),
      ),
    ),
    request<ContractChargeBalanceRow[]>(
      supabaseApi.get(
        '/contract_charge_balances',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          status: 'neq.voided',
        }),
      ),
    ),
  ]);

  const balances = balanceRows.map(mapContractChargeBalanceRow);
  const customersById = new Map(customerRows.map((row) => [row.id, row]));
  const contracts = contractRows.map((row) =>
    attachListSummary(
      mapContractRow(row),
      customersById.get(row.customer_id),
      balances,
    ),
  );

  return {
    tenantId,
    contracts,
  };
}

export async function loadContractDetail(
  userId: string,
  contractId: string,
  tenantIdOverride?: string,
): Promise<ContractDetail> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  await ensureCharges(tenantId);

  const contractRows = await request<ContractRow[]>(
    supabaseApi.get(
      '/contracts',
      queryParams({
        select: '*',
        tenant_id: `eq.${tenantId}`,
        id: `eq.${contractId}`,
        limit: '1',
      }),
    ),
  );
  const contract = contractRows[0];
  if (!contract) throw new Error('Không tìm thấy hợp đồng.');

  const [
    customer,
    versionRows,
    balanceRows,
    paymentRows,
    summaryRows,
    tenantSettingsRows,
    employeeOptions,
    responsibleRows,
    attachmentRows,
    tagAssignmentRows,
    contractTagOptions,
  ] = await Promise.all([
    loadCustomerDetail(userId, contract.customer_id, tenantId),
    request<ContractVersionRow[]>(
      supabaseApi.get(
        '/contract_versions',
        queryParams({
          select: '*',
          contract_id: `eq.${contractId}`,
          order: 'version_no.desc',
        }),
      ),
    ),
    request<ContractChargeBalanceRow[]>(
      supabaseApi.get(
        '/contract_charge_balances',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          contract_id: `eq.${contractId}`,
          status: 'neq.voided',
          order:
            'period_start.desc,period_end.desc,due_date.desc,direction.asc',
        }),
      ),
    ),
    request<CustomerPaymentRow[]>(
      supabaseApi.get(
        '/customer_payments',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          customer_id: `eq.${contract.customer_id}`,
          order: 'received_at.desc',
        }),
      ),
    ),
    request<CustomerReceivableSummaryRow[]>(
      supabaseApi.get(
        '/customer_receivable_summary',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          customer_id: `eq.${contract.customer_id}`,
        }),
      ),
    ),
    request<TenantSettingsRow[]>(
      supabaseApi.get(
        '/tenants',
        queryParams({
          select: 'settings',
          id: `eq.${tenantId}`,
          limit: '1',
        }),
      ),
    ),
    loadContractEmployeeOptions(tenantId, true),
    request<ContractResponsibleRow[]>(
      supabaseApi.get(
        '/contract_responsibles',
        queryParams({
          select: 'employee_id',
          tenant_id: `eq.${tenantId}`,
          contract_id: `eq.${contractId}`,
        }),
      ),
    ),
    request<ContractAttachmentRow[]>(
      supabaseApi.get(
        '/contract_attachments',
        queryParams({
          select: '*',
          tenant_id: `eq.${tenantId}`,
          contract_id: `eq.${contractId}`,
          order: 'created_at.desc',
        }),
      ),
    ),
    request<ContractTagAssignmentRow[]>(
      supabaseApi.get(
        '/tag_assignments',
        queryParams({
          select: 'tag_id',
          tenant_id: `eq.${tenantId}`,
          subject_type: 'eq.contract',
          subject_id: `eq.${contractId}`,
        }),
      ),
    ),
    loadContractTagOptions(tenantId, true),
  ]);

  const responsibleEmployeeIds = new Set(
    responsibleRows.map((row) => row.employee_id),
  );
  const tagIds = new Set(tagAssignmentRows.map((row) => row.tag_id));
  const tags = contractTagOptions.filter((tag) => tagIds.has(tag.id));

  const versions = versionRows.map(mapContractVersionRow);
  const versionIds = versions.map((version) => version.id);
  let lineRows: ContractVersionLineRow[] = [];
  if (versionIds.length > 0) {
    lineRows = await request<ContractVersionLineRow[]>(
      supabaseApi.get(
        '/contract_version_lines',
        queryParams({
          select: '*',
          contract_version_id: `in.(${versionIds.join(',')})`,
          order: 'sort_order.asc,id.asc',
        }),
      ),
    );
  }

  const charges = balanceRows.map(mapContractChargeBalanceRow);
  const allocationRows =
    charges.length > 0
      ? await request<CustomerPaymentAllocationRow[]>(
          supabaseApi.get(
            '/customer_payment_allocations',
            queryParams({
              select: '*',
              charge_id: `in.(${charges.map((charge) => charge.id).join(',')})`,
            }),
          ),
        )
      : [];
  const lineNameById = new Map(lineRows.map((line) => [line.id, line.name]));
  const chargeById = new Map(charges.map((charge) => [charge.id, charge]));
  const allocationsByPaymentId = new Map<
    string,
    ContractPaymentHistory['allocations']
  >();

  for (const allocationRow of allocationRows) {
    const charge = chargeById.get(allocationRow.charge_id);
    if (!charge) continue;

    const allocation = mapCustomerPaymentAllocationRow(allocationRow);
    const details = allocationsByPaymentId.get(allocation.paymentId) ?? [];
    details.push({
      ...allocation,
      periodStart: charge.periodStart,
      periodEnd: charge.periodEnd,
      dueDate: charge.dueDate,
      feeName: lineNameById.get(charge.contractVersionLineId) ?? 'Khoản phí',
      chargeAmount: charge.amount,
      currencyCode: charge.currencyCode,
    });
    allocationsByPaymentId.set(allocation.paymentId, details);
  }

  const payments = paymentRows
    .map(mapCustomerPaymentRow)
    .map((payment) => ({
      ...payment,
      allocations: allocationsByPaymentId.get(payment.id) ?? [],
    }))
    .filter((payment) => payment.allocations.length > 0);

  return {
    ...mapContractRow(contract),
    paymentReminderDays: getPaymentReminderDays(
      tenantSettingsRows[0]?.settings,
    ),
    customerName: customer.name,
    customerCode: customer.customerCode,
    customer,
    versions,
    lines: lineRows.map(mapContractVersionLineRow),
    charges,
    payments,
    receivableSummary: summaryRows[0]
      ? mapCustomerReceivableSummaryRow(summaryRows[0])
      : null,
    createdByEmployee:
      employeeOptions.find(
        (employee) => employee.userId === contract.created_by,
      ) ?? null,
    responsibleEmployees: employeeOptions.filter((employee) =>
      responsibleEmployeeIds.has(employee.id),
    ),
    attachments: attachmentRows.map(mapContractAttachment),
    tags,
  };
}

export async function loadContractResponsibleWorkspace(
  tenantId: string,
  contractId: string,
): Promise<ContractResponsibleWorkspace> {
  assertSupabaseConfigured();
  return request<ContractResponsibleWorkspace>(
    supabaseApi.post('/rpc/get_contract_responsible_workspace', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
    }),
  );
}

export async function replaceContractResponsibleAccess(
  tenantId: string,
  contractId: string,
  assignments: ContractResponsibleAssignmentInput[],
): Promise<void> {
  assertSupabaseConfigured();
  await request(
    supabaseApi.post('/rpc/replace_contract_responsible_access', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
      p_assignments: assignments.map((assignment) => ({
        employee_id: assignment.employeeId,
        disabled_permission_codes: assignment.disabledPermissionCodes,
      })),
    }),
  );
}

export async function loadContractPaymentPeriodCount(
  userId: string,
  contractId: string,
  tenantIdOverride?: string,
): Promise<number> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));

  const count = await request<number | string>(
    supabaseApi.post('/rpc/get_contract_payment_period_count', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
    }),
  );

  return numberValue(count);
}

export interface RecordContractPeriodPaymentInput {
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  amount: number;
  allocations: Array<{
    chargeId: string;
    allocatedAmount: number;
  }>;
}

interface RecordContractPeriodPaymentRpcRow {
  payment_id: string;
  allocated_amount: number | string;
  unapplied_amount: number | string;
}

export async function recordContractPeriodPayment(
  userId: string,
  contractId: string,
  customerId: string,
  currencyCode: string,
  input: RecordContractPeriodPaymentInput,
  tenantIdOverride?: string,
): Promise<RecordContractPeriodPaymentRpcRow> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const response = await request<
    RecordContractPeriodPaymentRpcRow[] | RecordContractPeriodPaymentRpcRow
  >(
    supabaseApi.post('/rpc/record_contract_period_payment_scoped', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
      p_customer_id: customerId,
      p_period_start: input.periodStart,
      p_period_end: input.periodEnd,
      p_due_date: input.dueDate,
      p_amount: input.amount,
      p_currency_code: currencyCode,
      p_received_at: new Date().toISOString(),
      p_payment_method: 'other',
      p_reference: '',
      p_note: '',
      p_allocations: input.allocations.map((allocation) => ({
        charge_id: allocation.chargeId,
        allocated_amount: allocation.allocatedAmount,
      })),
    }),
  );
  const row = Array.isArray(response) ? response[0] : response;
  if (!row) throw new Error('Không nhận được kết quả ghi nhận thanh toán.');
  return row;
}

function toContractPayload(values: ContractFormValues) {
  return {
    customer_id: values.customerId,
    contract_code: values.contractCode,
    name: values.name,
    currency_code: values.currencyCode,
    start_date: values.startDate,
    end_date: values.endDate,
    auto_renew: values.autoRenew,
    note: values.note,
  };
}

function toContractTermsSnapshot(values: ContractFormValues) {
  const metadataKeys = new Set(['responsibleEmployeeIds', 'tagIds']);
  return Object.fromEntries(
    Object.entries(values).filter(([key]) => !metadataKeys.has(key)),
  );
}

export function normalizeContractVersionLineForSubmit(
  line: ContractVersionLineValuesForApi,
): ContractVersionLineValuesForApi {
  return {
    ...line,
    billingUnit: line.billingType === 'recurring' ? line.billingUnit : null,
    billingInterval:
      line.billingType === 'recurring' ? line.billingInterval : null,
    chargeDate: line.billingType === 'one_time' ? line.chargeDate : null,
    dueDays: line.dueRule === 'after_days' ? line.dueDays : null,
  };
}

function toLinePayload(
  line: ContractVersionLineValuesForApi,
  versionId: string,
  index: number,
) {
  const normalizedLine = normalizeContractVersionLineForSubmit(line);

  return {
    contract_version_id: versionId,
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

export type ContractVersionLineValuesForApi = {
  direction: 'receivable' | 'payable';
  name: string;
  quantity: number;
  unitPrice: number;
  billingType: 'recurring' | 'one_time';
  billingUnit: 'month' | 'quarter' | 'year' | null;
  billingInterval: number | null;
  chargeDate: string | null;
  dueRule: 'on_period_start' | 'on_period_end' | 'after_days';
  dueDays: number | null;
  startDate: string;
  endDate: string | null;
};

async function insertVersion(
  contractId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
  versionNo: number,
) {
  const versionRows = await request<ContractVersionRow[]>(
    supabaseApi.post(
      '/contract_versions',
      {
        contract_id: contractId,
        version_no: versionNo,
        status: 'draft',
        effective_from: values.startDate,
        effective_to: null,
        change_reason:
          versionNo === 1 ? 'Khởi tạo hợp đồng' : 'Cập nhật chính sách',
        terms_snapshot: toContractTermsSnapshot(values),
        created_by: userId,
      },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const version = versionRows[0];
  if (!version) throw new Error('Không thể tạo phiên bản hợp đồng.');

  if (lines.length > 0) {
    await request<unknown>(
      supabaseApi.post(
        '/contract_version_lines',
        lines.map((line, index) => toLinePayload(line, version.id, index)),
      ),
    );
  }
  return version;
}

async function replaceContractResponsibles(
  tenantId: string,
  contractId: string,
  employeeIds: string[],
  userId: string,
) {
  void userId;
  await request(
    supabaseApi.post('/rpc/replace_contract_responsible_access', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
      p_assignments: employeeIds.map((employeeId) => ({
        employee_id: employeeId,
        disabled_permission_codes: [],
      })),
    }),
  );
}

function safeAttachmentFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

async function uploadContractAttachments(
  tenantId: string,
  contractId: string,
  userId: string,
  files: File[],
) {
  if (files.length === 0) return;

  const uploadedPaths: string[] = [];
  const rows: Array<{
    tenant_id: string;
    contract_id: string;
    storage_path: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    uploaded_by: string;
  }> = [];

  try {
    for (const file of files) {
      const storagePath = `${tenantId}/contracts/${contractId}/${crypto.randomUUID()}-${safeAttachmentFileName(file.name)}`;
      await uploadStorageObject({
        bucket: TENANT_ASSETS_BUCKET,
        path: storagePath,
        file,
      });
      uploadedPaths.push(storagePath);
      rows.push({
        tenant_id: tenantId,
        contract_id: contractId,
        storage_path: storagePath,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        uploaded_by: userId,
      });
    }

    await request(
      supabaseApi.post('/contract_attachments', rows, {
        headers: { Prefer: 'return=minimal' },
      }),
    );
  } catch (error) {
    await removeStorageObjects(TENANT_ASSETS_BUCKET, uploadedPaths).catch(
      () => undefined,
    );
    throw error;
  }
}

async function syncContractAttachments(
  tenantId: string,
  contractId: string,
  userId: string,
  attachmentIdsToKeep: string[],
  files: File[],
) {
  const existingRows = await request<ContractAttachmentRow[]>(
    supabaseApi.get(
      '/contract_attachments',
      queryParams({
        select: 'id,storage_path',
        tenant_id: `eq.${tenantId}`,
        contract_id: `eq.${contractId}`,
      }),
    ),
  );
  const keepIds = new Set(attachmentIdsToKeep);
  const removedRows = existingRows.filter((row) => !keepIds.has(row.id));

  await uploadContractAttachments(tenantId, contractId, userId, files);

  if (removedRows.length === 0) return;

  await supabaseApi.delete(
    '/contract_attachments',
    queryParams({
      tenant_id: `eq.${tenantId}`,
      contract_id: `eq.${contractId}`,
      id: `in.(${removedRows.map((row) => row.id).join(',')})`,
    }),
  );
  await removeStorageObjects(
    TENANT_ASSETS_BUCKET,
    removedRows.map((row) => row.storage_path),
  );
}

async function persistContractMetadata(
  tenantId: string,
  contractId: string,
  userId: string,
  metadata: ContractMetadataInput,
  options: { includeResponsibles?: boolean } = {},
) {
  const tasks: Promise<unknown>[] = [
    replaceSubjectTags(tenantId, 'contract', contractId, metadata.tagIds),
    syncContractAttachments(
      tenantId,
      contractId,
      userId,
      metadata.attachmentIdsToKeep,
      metadata.attachments,
    ),
  ];
  if (options.includeResponsibles) {
    tasks.push(
      replaceContractResponsibles(
        tenantId,
        contractId,
        metadata.responsibleEmployeeIds,
        userId,
      ),
    );
  }
  await Promise.all(tasks);
}

export async function createContract(
  tenantId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
  metadata: ContractMetadataInput,
) {
  assertSupabaseConfigured();
  const contractRows = await request<ContractRow[]>(
    supabaseApi.post(
      '/contracts',
      {
        tenant_id: tenantId,
        created_by: userId,
        ...toContractPayload(values),
      },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const contract = contractRows[0];
  if (!contract) throw new Error('Không thể tạo hợp đồng.');
  await insertVersion(contract.id, userId, values, lines, 1);
  await persistContractMetadata(tenantId, contract.id, userId, metadata, {
    includeResponsibles: true,
  });
  return mapContractRow(contract);
}

export async function updateContract(
  contractId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
  metadata: ContractMetadataInput,
) {
  assertSupabaseConfigured();
  const contractRows = await request<ContractRow[]>(
    supabaseApi.patch('/contracts', toContractPayload(values), {
      ...queryParams({ id: `eq.${contractId}` }),
      headers: { Prefer: 'return=representation' },
    }),
  );
  const contract = contractRows[0];
  if (!contract) throw new Error('Không tìm thấy hợp đồng để cập nhật.');

  const versions = await request<ContractVersionRow[]>(
    supabaseApi.get(
      '/contract_versions',
      queryParams({
        select: '*',
        contract_id: `eq.${contractId}`,
        order: 'version_no.desc',
        limit: '1',
      }),
    ),
  );
  const latest = versions[0];
  if (latest?.status === 'draft') {
    const effectiveFrom =
      contract.status === 'active' && values.startDate < todayIso()
        ? todayIso()
        : values.startDate;
    await supabaseApi.patch(
      '/contract_versions',
      {
        effective_from: effectiveFrom,
        terms_snapshot: toContractTermsSnapshot(values),
        updated_at: new Date().toISOString(),
      },
      queryParams({ id: `eq.${latest.id}` }),
    );
    await supabaseApi.delete(
      '/contract_version_lines',
      queryParams({ contract_version_id: `eq.${latest.id}` }),
    );
    if (lines.length > 0) {
      await supabaseApi.post(
        '/contract_version_lines',
        lines.map((line, index) => toLinePayload(line, latest.id, index)),
      );
    }
  } else {
    const effectiveFrom =
      values.startDate < todayIso() ? todayIso() : values.startDate;
    await insertVersion(
      contractId,
      userId,
      { ...values, startDate: effectiveFrom },
      lines,
      (latest?.version_no ?? 0) + 1,
    );
  }
  await persistContractMetadata(
    contract.tenant_id,
    contract.id,
    userId,
    metadata,
  );
  return mapContractRow(contract);
}

export async function activateContract(contract: Contract, userId: string) {
  assertSupabaseConfigured();
  const versions = await request<ContractVersionRow[]>(
    supabaseApi.get(
      '/contract_versions',
      queryParams({
        select: '*',
        contract_id: `eq.${contract.id}`,
        order: 'version_no.desc',
      }),
    ),
  );
  const draft = versions.find((version) => version.status === 'draft');
  if (!draft) throw new Error('Hợp đồng chưa có phiên bản nháp để kích hoạt.');

  const currentEffective = versions.find(
    (version) => version.status === 'effective',
  );
  if (currentEffective) {
    if (draft.effective_from <= currentEffective.effective_from) {
      throw new Error(
        'Ngày hiệu lực phiên bản mới phải sau ngày hiệu lực phiên bản hiện tại.',
      );
    }
    await supabaseApi.patch(
      '/contract_versions',
      {
        status: 'superseded',
        effective_to: previousIsoDate(draft.effective_from),
        updated_at: new Date().toISOString(),
      },
      queryParams({ id: `eq.${currentEffective.id}` }),
    );
  }
  await supabaseApi.patch(
    '/contract_versions',
    {
      status: 'effective',
      published_at: new Date().toISOString(),
      created_by: userId,
    },
    queryParams({ id: `eq.${draft.id}` }),
  );
  const rows = await request<ContractRow[]>(
    supabaseApi.patch(
      '/contracts',
      { status: 'active' },
      {
        ...queryParams({ id: `eq.${contract.id}` }),
        headers: { Prefer: 'return=representation' },
      },
    ),
  );
  await ensureCharges(contract.tenantId);
  return mapContractRow(rows[0] ?? contract);
}

export async function deleteContract(contractId: string) {
  assertSupabaseConfigured();
  await supabaseApi.delete(
    '/contracts',
    queryParams({ id: `eq.${contractId}` }),
  );
}

export function formatContractAmount(amount: number, currencyCode = 'VND') {
  return formatCurrency(numberValue(amount), currencyCode);
}
