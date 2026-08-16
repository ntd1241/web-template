import { assertSupabaseConfigured, supabaseApi } from '@/lib/supabase';
import { loadCustomerDetail } from '../../customers/api/customers.api';
import type { Customer } from '../../customers/model/customer';
import {
  mapContractRow,
  mapContractVersionLineRow,
  mapContractVersionRow,
  type Contract,
  type ContractFormValues,
  type ContractRow,
  type ContractVersion,
  type ContractVersionLine,
  type ContractVersionLineRow,
  type ContractVersionRow,
} from '../model/contract';
import {
  mapContractChargeBalanceRow,
  mapCustomerPaymentRow,
  mapCustomerReceivableSummaryRow,
  type ContractChargeBalance,
  type ContractChargeBalanceRow,
  type CustomerPayment,
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
}

export interface ContractWorkspace {
  tenantId: string;
  contracts: Contract[];
}

export interface ContractCreationWorkspace {
  tenantId: string;
}

export async function loadContractCreationWorkspace(
  userId: string,
): Promise<ContractCreationWorkspace> {
  assertSupabaseConfigured();
  return { tenantId: await resolveTenantId(userId) };
}

export interface ContractDetail extends Contract {
  customer: Customer;
  versions: ContractVersion[];
  lines: ContractVersionLine[];
  charges: ContractChargeBalance[];
  payments: CustomerPayment[];
  receivableSummary: CustomerReceivableSummary | null;
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
    (balance) => balance.contractId === contract.id,
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
    totalOutstanding: outstanding,
    nextDueDate: nextDueDate ?? null,
  };
}

export async function loadContractWorkspace(
  userId: string,
): Promise<ContractWorkspace> {
  assertSupabaseConfigured();
  const tenantId = await resolveTenantId(userId);
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
          select: 'id,customer_code,name',
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
): Promise<ContractDetail> {
  assertSupabaseConfigured();
  const tenantId = await resolveTenantId(userId);
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

  const [customer, versionRows, balanceRows, paymentRows, summaryRows] =
    await Promise.all([
      loadCustomerDetail(userId, contract.customer_id),
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
            order: 'due_date.asc,period_start.asc',
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
    ]);

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

  return {
    ...mapContractRow(contract),
    customerName: customer.name,
    customerCode: customer.customerCode,
    customer,
    versions,
    lines: lineRows.map(mapContractVersionLineRow),
    charges: balanceRows.map(mapContractChargeBalanceRow),
    payments: paymentRows.map(mapCustomerPaymentRow),
    receivableSummary: summaryRows[0]
      ? mapCustomerReceivableSummaryRow(summaryRows[0])
      : null,
  };
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

function toLinePayload(
  line: ContractVersionLineValuesForApi,
  versionId: string,
  index: number,
) {
  return {
    contract_version_id: versionId,
    direction: line.direction,
    name: line.name,
    quantity: line.quantity,
    unit_price: line.unitPrice,
    billing_type: line.billingType,
    billing_unit: line.billingType === 'recurring' ? line.billingUnit : null,
    billing_interval:
      line.billingType === 'recurring' ? line.billingInterval : null,
    charge_date: line.billingType === 'one_time' ? line.chargeDate : null,
    due_rule: line.dueRule,
    due_days: line.dueRule === 'after_days' ? line.dueDays : null,
    start_date: line.startDate,
    end_date: line.endDate,
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
        terms_snapshot: values,
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

export async function createContract(
  tenantId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
) {
  assertSupabaseConfigured();
  const contractRows = await request<ContractRow[]>(
    supabaseApi.post(
      '/contracts',
      { tenant_id: tenantId, ...toContractPayload(values) },
      { headers: { Prefer: 'return=representation' } },
    ),
  );
  const contract = contractRows[0];
  if (!contract) throw new Error('Không thể tạo hợp đồng.');
  await insertVersion(contract.id, userId, values, lines, 1);
  return mapContractRow(contract);
}

export async function updateContract(
  contractId: string,
  userId: string,
  values: ContractFormValues,
  lines: ContractVersionLineValuesForApi[],
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
        terms_snapshot: values,
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
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(numberValue(amount));
}
