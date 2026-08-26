import { formatCurrency } from '@/lib/format';
import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import { loadCustomerDetail } from '../../customers/api/customers.api';
import type { Customer } from '../../customers/model/customer';
import {
  deleteFileLink,
  listFilesForSubject,
  syncFilesForSubject,
  uploadFilesForSubject,
} from '../../files/api/files.api';
import type { FileAttachment } from '../../files/model/file';
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
  type ContractVersionKind,
  type ContractVersionLine,
  type ContractVersionLineRow,
  type ContractVersionRow,
} from '../model/contract';
import type {
  ContractResponsibleAssignmentInput,
  ContractResponsibleWorkspace,
} from '../model/contract-responsible';
import {
  getContractVersionChangeCheck,
  getContractVersionTermDifferences,
  type ContractVersionComparableLine,
} from '../model/contract-version-change';
import {
  mapContractChargeBalanceRow,
  mapContractFinancialSummary,
  mapContractPaymentCandidateRpcRow,
  mapContractReceivablePeriodRpcRow,
  mapCustomerPaymentAllocationRow,
  mapCustomerPaymentRow,
  mapCustomerReceivableSummaryRow,
  type ContractChargeBalance,
  type ContractChargeBalanceRow,
  type ContractFinancialSummary,
  type ContractFinancialSummaryRpcRow,
  type ContractPaymentCandidate,
  type ContractPaymentCandidateRpcResponse,
  type ContractPaymentHistory,
  type ContractPaymentMonthRpcRow,
  type ContractPaymentScope,
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
  const selectedStatuses = params.statuses ?? [];
  const response = await request<ContractListRpcResponse>(
    supabaseApi.post(
      '/rpc/list_contracts',
      {
        p_tenant_id: tenantId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        ...(params.contractSearch?.trim()
          ? { p_contract_search: params.contractSearch.trim() }
          : {}),
        p_statuses: selectedStatuses,
        p_customer_id: params.customerId ?? null,
        p_customer_code: params.customerCode?.trim() || null,
        p_outstanding_min: params.outstandingMin ?? null,
        p_outstanding_max: params.outstandingMax ?? null,
        p_next_due_from: params.nextDueFrom ?? null,
        p_next_due_to: params.nextDueTo ?? null,
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

export async function loadContractReceivablePlanList(
  tenantId: string,
  contractId: string,
  params: ContractReceivablePeriodListParams,
  signal?: AbortSignal,
): Promise<ContractReceivablePeriodListResult> {
  assertSupabaseConfigured();
  const response = await request<ContractReceivablePeriodRpcResponse>(
    supabaseApi.post(
      '/rpc/list_contract_receivable_plan_scoped',
      {
        p_tenant_id: tenantId,
        p_contract_id: contractId,
        p_page: params.page,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || null,
        p_status: params.status ?? null,
        p_sort: params.sort,
        p_group_by: params.view,
        p_due_soon_days: params.dueSoonDays,
        p_year: params.year,
      },
      { signal },
    ),
  );

  return {
    rows: response.items.map(mapContractReceivablePeriodRpcRow),
    total: numberValue(response.total),
  };
}

// Kept as a compatibility alias for existing consumers while the endpoint
// evolves from persisted periods to the combined actual/projected plan.
export const loadContractReceivablePeriodList = loadContractReceivablePlanList;

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
  activeVersion: ContractVersion | null;
  lines: ContractVersionLine[];
  activeLines: ContractVersionLine[];
  charges: ContractChargeBalance[];
  financialSummary: ContractFinancialSummary;
  payments: ContractPaymentHistory[];
  receivableSummary: CustomerReceivableSummary | null;
  createdByEmployee: ContractEmployeeOption | null;
  responsibleEmployees: ContractEmployeeOption[];
  responsibleWorkspace?: ContractResponsibleWorkspace;
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

function attachListSummary(
  contract: Contract,
  customer: CustomerOptionRow | undefined,
  balances: ContractChargeBalance[],
): Contract {
  const currentDate = todayIso();
  const contractBalances = balances.filter(
    (balance) =>
      balance.contractId === contract.id &&
      balance.direction === 'receivable' &&
      balance.status !== 'voided',
  );
  const outstanding = contractBalances.reduce(
    (sum, balance) =>
      balance.dueDate <= currentDate ? sum + balance.outstandingAmount : sum,
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
    financialSummary,
    tenantSettingsRows,
    employeeOptions,
    responsibleRows,
    responsibleWorkspace,
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
    request<ContractFinancialSummaryRpcRow>(
      supabaseApi.post('/rpc/get_contract_financial_summary', {
        p_tenant_id: tenantId,
        p_contract_id: contractId,
      }),
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
    loadContractResponsibleWorkspace(tenantId, contractId),
    listFilesForSubject(tenantId, 'contract', contractId),
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
  const uploadedByNameByUserId = new Map(
    employeeOptions
      .filter((employee) => employee.userId)
      .map((employee) => [employee.userId as string, employee.displayName]),
  );
  const attachments: ContractAttachment[] = attachmentRows.map(
    (attachment: FileAttachment) => ({
      ...attachment,
      uploadedByName: attachment.uploadedBy
        ? (uploadedByNameByUserId.get(attachment.uploadedBy) ?? null)
        : null,
    }),
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
  const mappedLines = lineRows.map(mapContractVersionLineRow);
  const activeVersion =
    versions.find((version) => version.status === 'effective') ?? null;
  const activeLines = activeVersion
    ? mappedLines.filter((line) => line.contractVersionId === activeVersion.id)
    : [];
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
    .filter(
      (payment) =>
        payment.allocations.length > 0 || payment.contractId === contract.id,
    );

  return {
    ...mapContractRow(contract),
    paymentReminderDays: getPaymentReminderDays(
      tenantSettingsRows[0]?.settings,
    ),
    customerName: customer.name,
    customerCode: customer.customerCode,
    customer,
    versions,
    activeVersion,
    lines: mappedLines,
    activeLines,
    charges,
    financialSummary: mapContractFinancialSummary(financialSummary),
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
    responsibleWorkspace,
    attachments,
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

export interface LoadContractPaymentCandidatesResult {
  items: ContractPaymentCandidate[];
  total: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  unappliedCredit: number;
  months: Array<{
    monthStart: string;
    monthEnd: string;
    amount: number;
    paidAmount: number;
    outstandingAmount: number;
    dueOutstandingAmount: number;
    isDue: boolean;
  }>;
}

export async function loadContractPaymentCandidates(
  userId: string,
  contractId: string,
  scope: ContractPaymentScope,
  scopeStart?: string,
  scopeEnd?: string,
  tenantIdOverride?: string,
): Promise<LoadContractPaymentCandidatesResult> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const response = await request<ContractPaymentCandidateRpcResponse>(
    supabaseApi.post('/rpc/list_contract_payment_candidates_scoped', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
      p_scope: scope,
      p_scope_start: scopeStart ?? null,
      p_scope_end: scopeEnd ?? null,
    }),
  );

  return {
    items: (response.items ?? []).map(mapContractPaymentCandidateRpcRow),
    total: numberValue(response.total),
    totalAmount: numberValue(response.total_amount),
    paidAmount: numberValue(response.paid_amount),
    outstandingAmount: numberValue(response.outstanding_amount),
    unappliedCredit: numberValue(response.unapplied_credit),
    months: (response.months ?? []).map(
      (month: ContractPaymentMonthRpcRow) => ({
        monthStart: month.month_start,
        monthEnd: month.month_end,
        amount: numberValue(month.amount),
        paidAmount: numberValue(month.paid_amount),
        outstandingAmount: numberValue(month.outstanding_amount),
        dueOutstandingAmount: numberValue(month.due_outstanding_amount),
        isDue: month.is_due,
      }),
    ),
  };
}

export interface RecordContractPaymentInput {
  scope: ContractPaymentScope;
  scopeStart?: string;
  scopeEnd?: string;
  amount: number;
  allocations: Array<{
    chargeId: string;
    allocatedAmount: number;
  }>;
  monthAllocations?: Array<{
    monthStart: string;
    allocatedAmount: number;
  }>;
}

export async function recordContractPayment(
  userId: string,
  contractId: string,
  customerId: string,
  currencyCode: string,
  input: RecordContractPaymentInput,
  tenantIdOverride?: string,
): Promise<RecordContractPeriodPaymentRpcRow> {
  assertSupabaseConfigured();
  const tenantId = tenantIdOverride ?? (await resolveTenantId(userId));
  const response = await request<
    RecordContractPeriodPaymentRpcRow[] | RecordContractPeriodPaymentRpcRow
  >(
    supabaseApi.post('/rpc/record_contract_payment_scoped', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
      p_customer_id: customerId,
      p_currency_code: currencyCode,
      p_amount: input.amount,
      p_received_at: new Date().toISOString(),
      p_payment_method: 'other',
      p_reference: '',
      p_note: '',
      p_allocations:
        input.scope === 'contract'
          ? (input.monthAllocations ?? []).map((allocation) => ({
              month_start: allocation.monthStart,
              allocated_amount: allocation.allocatedAmount,
            }))
          : input.allocations.map((allocation) => ({
              charge_id: allocation.chargeId,
              allocated_amount: allocation.allocatedAmount,
            })),
      p_scope: input.scope,
      p_scope_start: input.scopeStart ?? null,
      p_scope_end: input.scopeEnd ?? null,
    }),
  );
  const row = Array.isArray(response) ? response[0] : response;
  if (!row) throw new Error('Không nhận được kết quả ghi nhận thanh toán.');
  return row;
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
  sourceLineId?: string;
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

export interface ContractRenewalInput {
  startDate: string;
  endDate: string;
  lines: ContractVersionLineValuesForApi[];
}

export interface ContractRenewalResult {
  contractId: string;
  versionId: string;
  versionNo: number;
  versionKind: ContractVersionKind;
  status: 'active';
  effectiveFrom: string;
  effectiveTo: string;
  generatedChargeCount: number;
}

async function insertVersion(
  contractId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
  versionNo: number,
  effectiveFrom: string | null = null,
  sourceTemplateVersionId?: string,
) {
  const versionRows = await request<ContractVersionRow[]>(
    supabaseApi.post(
      '/contract_versions',
      {
        contract_id: contractId,
        version_no: versionNo,
        version_kind: versionNo === 1 ? 'initial' : 'amendment',
        status: 'draft',
        effective_from: effectiveFrom,
        effective_to: null,
        change_reason:
          versionNo === 1 ? 'Khởi tạo hợp đồng' : 'Cập nhật chính sách',
        terms_snapshot: toContractTermsSnapshot(values),
        created_by: userId,
        ...(sourceTemplateVersionId
          ? { source_template_version_id: sourceTemplateVersionId }
          : {}),
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

export async function uploadContractAttachments(
  tenantId: string,
  contractId: string,
  userId: string,
  files: File[],
) {
  return uploadFilesForSubject(tenantId, 'contract', contractId, userId, files);
}

export async function deleteContractAttachment(
  tenantId: string,
  contractId: string,
  attachmentId: string,
) {
  return deleteFileLink(tenantId, attachmentId, 'contract', contractId);
}

async function syncContractAttachments(
  tenantId: string,
  contractId: string,
  userId: string,
  attachmentIdsToKeep: string[],
  files: File[],
) {
  return syncFilesForSubject(
    tenantId,
    'contract',
    contractId,
    userId,
    attachmentIdsToKeep,
    files,
  );
}

export async function updateContractNonVersionMetadata(
  tenantId: string,
  contractId: string,
  userId: string,
  metadata: ContractMetadataInput,
) {
  assertSupabaseConfigured();
  await Promise.all([
    replaceSubjectTags(tenantId, 'contract', contractId, metadata.tagIds),
    syncContractAttachments(
      tenantId,
      contractId,
      userId,
      metadata.attachmentIdsToKeep,
      metadata.attachments,
    ),
    replaceContractResponsibles(
      tenantId,
      contractId,
      metadata.responsibleEmployeeIds,
      userId,
    ),
  ]);
}

export async function createContract(
  tenantId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
  metadata: ContractMetadataInput,
  source?: { templateId: string; templateVersionId: string },
  versionEffectiveFrom: string | null = null,
) {
  assertSupabaseConfigured();
  const contractRows = await request<ContractRow[]>(
    supabaseApi.post(
      '/contracts',
      {
        tenant_id: tenantId,
        created_by: userId,
        ...(source ? { source_template_id: source.templateId } : {}),
        ...toContractPayload(values),
      },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const contract = contractRows[0];
  if (!contract) throw new Error('Không thể tạo hợp đồng.');
  await insertVersion(
    contract.id,
    userId,
    values,
    lines,
    1,
    versionEffectiveFrom,
    source?.templateVersionId,
  );
  await updateContractNonVersionMetadata(
    tenantId,
    contract.id,
    userId,
    metadata,
  );
  return mapContractRow(contract);
}

export async function updateContract(
  contractId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
  metadata: ContractMetadataInput,
  versionEffectiveFrom: string | null = null,
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
  const latestLineRows = latest
    ? await request<ContractVersionLineRow[]>(
        supabaseApi.get(
          '/contract_version_lines',
          queryParams({
            select: '*',
            contract_version_id: `eq.${latest.id}`,
            order: 'sort_order.asc,id.asc',
          }),
        ),
      )
    : [];
  const versionChangeCheck = getContractVersionChangeCheck({
    latestVersion: latest
      ? {
          versionNo: latest.version_no,
          status: latest.status,
          termsSnapshot: {
            ...(latest.terms_snapshot ?? {}),
            // Older versions stored the adjusted effective date here. The
            // contract row remains the source of truth for the contract's
            // original start date.
            startDate: contract.start_date,
          },
        }
      : undefined,
    latestLines: latestLineRows.map(toComparableLine),
    values,
    lines: lines.map(({ sourceLineId, ...line }, sortOrder) => ({
      ...line,
      id: sourceLineId,
      sortOrder,
    })),
  });
  console.groupCollapsed(`[ContractVersionCheck][API] contract ${contractId}`);
  console.log('latest version', JSON.stringify(latest ?? null));
  console.log(
    'term differences',
    JSON.stringify(
      latest
        ? getContractVersionTermDifferences({
            termsSnapshot: latest.terms_snapshot ?? {},
            values,
          })
        : [],
    ),
  );
  console.log(
    'latest lines',
    JSON.stringify(latestLineRows.map(toComparableLine)),
  );
  console.log('submitted lines', JSON.stringify(lines));
  console.log('result', JSON.stringify(versionChangeCheck));
  console.groupEnd();

  if (latest?.status === 'draft') {
    await supabaseApi.patch(
      '/contract_versions',
      {
        effective_from: versionEffectiveFrom,
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
  } else if (versionChangeCheck.requiresNewVersion) {
    console.log('[ContractVersionCheck][API] creating new version', {
      previousVersionNo: latest?.version_no,
      nextVersionNo: (latest?.version_no ?? 0) + 1,
      changedAreas: versionChangeCheck.changedAreas,
    });
    await insertVersion(
      contractId,
      userId,
      values,
      lines,
      (latest?.version_no ?? 0) + 1,
      versionEffectiveFrom,
    );
  } else {
    console.log('[ContractVersionCheck][API] keeping current version', {
      versionNo: latest?.version_no,
      changedAreas: versionChangeCheck.changedAreas,
    });
  }
  await updateContractNonVersionMetadata(
    contract.tenant_id,
    contract.id,
    userId,
    metadata,
  );
  return mapContractRow(contract);
}

export async function renewContract(
  tenantId: string,
  contractId: string,
  input: ContractRenewalInput,
): Promise<ContractRenewalResult> {
  assertSupabaseConfigured();
  const response = await request<ContractRenewalResult>(
    supabaseApi.post('/rpc/renew_contract_scoped', {
      p_tenant_id: tenantId,
      p_contract_id: contractId,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
      p_lines: input.lines.map((line) => {
        const normalizedLine = normalizeContractVersionLineForSubmit(line);
        return {
          direction: normalizedLine.direction,
          name: normalizedLine.name,
          quantity: normalizedLine.quantity,
          unit_price: normalizedLine.unitPrice,
          billing_type: normalizedLine.billingType,
          billing_unit: normalizedLine.billingUnit,
          billing_interval: normalizedLine.billingInterval,
          due_rule: normalizedLine.dueRule,
          due_days: normalizedLine.dueDays,
        };
      }),
    }),
  );

  return response;
}

function toComparableLine(
  row: ContractVersionLineRow,
): ContractVersionComparableLine {
  return {
    id: row.id,
    direction: row.direction,
    name: row.name,
    quantity: numberValue(row.quantity),
    unitPrice: numberValue(row.unit_price),
    billingType: row.billing_type,
    billingUnit: row.billing_unit,
    billingInterval: row.billing_interval,
    chargeDate: row.charge_date,
    dueRule: row.due_rule,
    dueDays: row.due_days,
    startDate: row.start_date,
    endDate: row.end_date,
    sortOrder: row.sort_order,
  };
}

export async function activateContract(
  contract: ContractDetail,
  userId: string,
  versionId?: string,
  options?: { effectiveFrom?: string },
) {
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
  const draft = versions.find(
    (version) =>
      version.status === 'draft' &&
      (versionId === undefined || version.id === versionId),
  );
  if (!draft) throw new Error('Hợp đồng chưa có phiên bản nháp để kích hoạt.');

  const effectiveFrom =
    options?.effectiveFrom ?? draft.effective_from ?? todayIso();

  const currentEffective = versions.find(
    (version) => version.status === 'effective',
  );
  if (currentEffective) {
    if (
      !currentEffective.effective_from ||
      effectiveFrom <= currentEffective.effective_from
    ) {
      throw new Error(
        'Ngày hiệu lực phiên bản mới phải sau ngày hiệu lực phiên bản hiện tại.',
      );
    }
    await supabaseApi.patch(
      '/contract_versions',
      {
        status: 'superseded',
        effective_to: previousIsoDate(effectiveFrom),
        updated_at: new Date().toISOString(),
      },
      queryParams({ id: `eq.${currentEffective.id}` }),
    );
  }
  if (draft.effective_from !== effectiveFrom) {
    await supabaseApi.patch(
      '/contract_versions',
      { effective_from: effectiveFrom, updated_at: new Date().toISOString() },
      queryParams({ id: `eq.${draft.id}` }),
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
  return mapContractRow(rows[0] ?? contract);
}

export async function updateContractVersionEffectiveDate(
  contract: ContractDetail,
  versionId: string,
  effectiveFrom: string | null,
) {
  assertSupabaseConfigured();
  const draft = contract.versions?.find((version) => version.id === versionId);
  if (!draft || draft.status !== 'draft') {
    throw new Error('Chỉ có thể chỉnh ngày dự kiến của phiên bản nháp.');
  }

  const currentEffective = contract.versions?.find(
    (version) => version.status === 'effective',
  );
  if (
    effectiveFrom &&
    currentEffective?.effectiveFrom &&
    effectiveFrom <= currentEffective.effectiveFrom
  ) {
    throw new Error(
      'Ngày dự kiến áp dụng phải sau ngày hiệu lực của phiên bản hiện tại.',
    );
  }

  await supabaseApi.patch(
    '/contract_versions',
    { effective_from: effectiveFrom, updated_at: new Date().toISOString() },
    queryParams({ id: `eq.${versionId}`, status: 'eq.draft' }),
  );
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
