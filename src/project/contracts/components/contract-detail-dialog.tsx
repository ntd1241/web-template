import { formatDate, formatDateTime } from '@/lib/date';
import { useNumberFormat } from '@/providers/number-format-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Tag } from '@/components/ui/tag';
import {
  countMatchingEntityDetailDialogFields,
  type EntityDetailDialogField,
  type EntityDetailDialogTabContext,
} from '@/components/layouts/entity-detail-dialog';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import type { ContractDetail } from '../api/contracts.api';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  CONTRACT_CASHFLOW_DIRECTION_LABELS,
  CONTRACT_STATUS_LABELS,
  type ContractVersionLine,
} from '../model/contract';
import type {
  ContractResponsibleEmployee,
  ContractResponsibleWorkspace,
} from '../model/contract-responsible';
import { ContractDetailDialogShell } from './contract-detail-dialog.generated';
import { ContractStatusBadge } from './contract-status-badge';

function joinSearchText(...values: unknown[]) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => value !== null && value !== undefined)
    .join(' ');
}

function getResponsibleWorkspace(
  contract: ContractDetail,
): ContractResponsibleWorkspace {
  if (contract.responsibleWorkspace) return contract.responsibleWorkspace;

  const employees: ContractResponsibleEmployee[] =
    contract.responsibleEmployees.map((employee) => ({
      ...employee,
      jobTitle: '',
      department: '',
      status: 'active',
      defaultPermissionCodes: [],
    }));

  return {
    employees,
    assignments: employees.map((employee) => ({
      employeeId: employee.id,
      assignedBy: null,
      createdAt: contract.updatedAt,
      disabledPermissionCodes: [],
    })),
    permissionDefinitions: [],
  };
}

function buildGeneralSearchText(contract: ContractDetail) {
  const workspace = getResponsibleWorkspace(contract);
  const responsibleEmployees = workspace.employees.filter((employee) =>
    workspace.assignments.some(
      (assignment) => assignment.employeeId === employee.id,
    ),
  );
  const responsiblePermissions = responsibleEmployees.flatMap((employee) =>
    employee.defaultPermissionCodes
      .map((code) =>
        workspace.permissionDefinitions.find(
          (permission) => permission.code === code,
        ),
      )
      .filter((permission): permission is NonNullable<typeof permission> =>
        Boolean(permission),
      )
      .map((permission) => permission.name),
  );

  return joinSearchText(
    'thông tin chung trạng thái',
    contract.name,
    'mã hợp đồng',
    contract.contractCode,
    'khách hàng',
    contract.customer.name,
    contract.customer.customerCode,
    CONTRACT_STATUS_LABELS[contract.status],
    'ngày bắt đầu',
    contract.startDate,
    'ngày kết thúc',
    contract.endDate,
    'tự động gia hạn',
    contract.autoRenew ? 'có yes true' : 'không no false',
    'tiền tệ',
    contract.currencyCode,
    'người tạo hợp đồng',
    contract.createdByEmployee?.displayName,
    contract.createdByEmployee?.employeeCode,
    'nhân viên phụ trách',
    responsibleEmployees.map((employee) => [
      employee.displayName,
      employee.employeeCode,
    ]),
    responsiblePermissions,
    'nhãn',
    contract.tags.map((tag) => tag.name),
    'ghi chú',
    contract.note,
    'cập nhật lần cuối',
    contract.updatedAt,
  );
}

function getCurrentContractFeeLines(contract: ContractDetail) {
  const currentVersionId = contract.versions[0]?.id;

  return contract.lines
    .filter((line) => line.contractVersionId === currentVersionId)
    .sort((left, right) => left.sortOrder - right.sortOrder);
}

function getFeeScheduleText(line: ContractVersionLine) {
  if (line.billingType === 'one_time') {
    return joinSearchText(
      BILLING_TYPE_LABELS.one_time,
      formatDate(line.chargeDate ?? line.startDate),
    );
  }

  return joinSearchText(
    BILLING_TYPE_LABELS.recurring,
    'Mỗi',
    line.billingInterval,
    line.billingUnit ? BILLING_UNIT_LABELS[line.billingUnit] : null,
  );
}

function getFeeSearchText(line: ContractVersionLine) {
  return joinSearchText(
    line.name,
    CONTRACT_CASHFLOW_DIRECTION_LABELS[line.direction],
    line.direction,
    line.quantity,
    line.unitPrice,
    line.amount,
    getFeeScheduleText(line),
    line.startDate,
    line.endDate,
    line.dueRule,
    line.dueDays,
  );
}

function buildFeesSearchText(contract: ContractDetail) {
  const currentVersion = contract.versions[0];

  return joinSearchText(
    'khoản phí phí hợp đồng',
    currentVersion ? `v${currentVersion.versionNo}` : null,
    getCurrentContractFeeLines(contract).map(getFeeSearchText),
  );
}

function ContractFeeDirectionTag({
  direction,
}: Pick<ContractVersionLine, 'direction'>) {
  const isReceivable = direction === 'receivable';

  return (
    <Tag size="sm" shape="circle" color={isReceivable ? '#16a34a' : '#dc2626'}>
      {CONTRACT_CASHFLOW_DIRECTION_LABELS[direction]}
    </Tag>
  );
}

function ContractFeesContent({
  contract,
  matches,
}: {
  contract: ContractDetail;
  matches: (value: unknown) => boolean;
}) {
  const { formatCurrency } = useNumberFormat();
  const feeLines = getCurrentContractFeeLines(contract).filter((line) =>
    matches(getFeeSearchText(line)),
  );

  if (feeLines.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        {getCurrentContractFeeLines(contract).length === 0
          ? 'Chưa có khoản phí trong phiên bản hiện tại.'
          : 'Không có khoản phí phù hợp trong mục này.'}
      </div>
    );
  }

  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2">
      {feeLines.map((line) => (
        <div
          key={line.id}
          className="min-w-0 rounded-lg border border-border bg-background p-4"
        >
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {line.name}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {getFeeScheduleText(line)}
              </p>
            </div>
            <ContractFeeDirectionTag direction={line.direction} />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-border/70 pt-3">
            <div className="text-xs text-muted-foreground">
              <div>
                {line.quantity} ×{' '}
                {formatCurrency(line.unitPrice, contract.currencyCode)}
              </div>
              <div className="mt-1">
                Áp dụng từ {formatDate(line.startDate)}
                {line.endDate ? ` đến ${formatDate(line.endDate)}` : ''}
              </div>
            </div>
            <p className="shrink-0 text-right font-semibold tabular-nums text-foreground">
              {formatCurrency(line.amount, contract.currencyCode)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResponsibleEmployeesList({ contract }: { contract: ContractDetail }) {
  const workspace = getResponsibleWorkspace(contract);
  const assignments = workspace.assignments;
  const employeesById = new Map(
    workspace.employees.map((employee) => [employee.id, employee]),
  );
  const permissionsByCode = new Map(
    workspace.permissionDefinitions.map((permission) => [
      permission.code,
      permission,
    ]),
  );

  if (assignments.length === 0) return 'Chưa phân công';

  return (
    <Accordion type="multiple" variant="outline">
      {assignments.map((assignment) => {
        const employee = employeesById.get(assignment.employeeId);
        if (!employee) return null;

        const disabledPermissions = new Set(assignment.disabledPermissionCodes);
        const defaultPermissions = employee.defaultPermissionCodes
          .map((code) => permissionsByCode.get(code))
          .filter((permission): permission is NonNullable<typeof permission> =>
            Boolean(permission),
          );
        const permissions = defaultPermissions.filter(
          (permission) => !disabledPermissions.has(permission.code),
        );
        const permissionSummary = employee.userId
          ? `${permissions.length}/${defaultPermissions.length} quyền`
          : 'Chưa liên kết';

        return (
          <AccordionItem key={employee.id} value={employee.id}>
            <AccordionTrigger className="px-0 py-2.5 text-start hover:no-underline">
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <EmployeeIdentity employee={employee} />
                </div>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {permissionSummary}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="border-t border-border/70 pb-4 pt-3">
                {permissions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {permissions.map((permission) => (
                      <span
                        key={permission.code}
                        className="rounded-md bg-background px-2 py-1 text-xs text-foreground"
                      >
                        {permission.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {employee.userId
                      ? 'Không có quyền được cấp riêng trên hợp đồng'
                      : 'Chưa liên kết tài khoản nên chưa có quyền mặc định để kế thừa'}
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function ContractGeneralFields({
  contract,
}: {
  contract: ContractDetail;
}): EntityDetailDialogField[] {
  const workspace = getResponsibleWorkspace(contract);

  return [
    {
      label: 'Trạng thái',
      value: <ContractStatusBadge status={contract.status} />,
      searchText: CONTRACT_STATUS_LABELS[contract.status],
    },
    {
      label: 'Khách hàng',
      value: <CustomerIdentity customer={contract.customer} />,
      searchText: joinSearchText(
        contract.customer.name,
        contract.customer.customerCode,
      ),
    },
    {
      label: 'Mã hợp đồng',
      value: contract.contractCode,
      searchText: contract.contractCode,
    },
    {
      label: 'Ngày bắt đầu',
      value: formatDate(contract.startDate),
      searchText: contract.startDate,
    },
    {
      label: 'Ngày kết thúc',
      value: contract.endDate ? formatDate(contract.endDate) : 'Không giới hạn',
      searchText: contract.endDate ?? 'Không giới hạn',
    },
    {
      label: 'Tự động gia hạn',
      value: contract.autoRenew ? 'Có' : 'Không',
      searchText: contract.autoRenew ? 'Có yes true' : 'Không no false',
    },
    {
      label: 'Tiền tệ',
      value: contract.currencyCode,
      searchText: contract.currencyCode,
    },
    {
      label: 'Người tạo hợp đồng',
      value: contract.createdByEmployee ? (
        <EmployeeIdentity employee={contract.createdByEmployee} />
      ) : (
        'Chưa cập nhật'
      ),
      searchText: joinSearchText(
        contract.createdByEmployee?.displayName,
        contract.createdByEmployee?.employeeCode,
      ),
    },
    {
      label: 'Nhân viên phụ trách',
      value: <ResponsibleEmployeesList contract={contract} />,
      searchText: joinSearchText(
        workspace.employees.map((employee) => [
          employee.displayName,
          employee.employeeCode,
          employee.defaultPermissionCodes,
        ]),
      ),
    },
    {
      label: 'Nhãn',
      value:
        contract.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {contract.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-muted px-2 py-1 text-xs font-medium"
              >
                {tag.name}
              </span>
            ))}
          </div>
        ) : (
          'Chưa cập nhật'
        ),
      searchText: joinSearchText(contract.tags.map((tag) => tag.name)),
    },
    {
      label: 'Ghi chú',
      value: contract.note || 'Chưa cập nhật',
      searchText: contract.note,
    },
    {
      label: 'Cập nhật lần cuối',
      value: formatDateTime(contract.updatedAt),
      searchText: contract.updatedAt,
    },
  ];
}

function countMatchingGeneralFields({
  data,
  matches,
}: EntityDetailDialogTabContext<ContractDetail>) {
  return countMatchingEntityDetailDialogFields(
    ContractGeneralFields({ contract: data }),
    matches,
  );
}

function countMatchingFees({
  data,
  matches,
}: EntityDetailDialogTabContext<ContractDetail>) {
  return getCurrentContractFeeLines(data).filter((line) =>
    matches(getFeeSearchText(line)),
  ).length;
}

export function ContractDetailDialog({
  open,
  onOpenChange,
  contract,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: ContractDetail | null;
}) {
  return (
    <ContractDetailDialogShell<ContractDetail>
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết hợp đồng"
      data={contract}
      searchPlaceholder="Tìm theo tên, mã, khách hàng..."
      generalFields={({ data }) => ContractGeneralFields({ contract: data })}
      feesContent={({ data, matches }) => (
        <ContractFeesContent contract={data} matches={matches} />
      )}
      generalSearchText={buildGeneralSearchText}
      feesSearchText={buildFeesSearchText}
      generalSearchMatchCount={countMatchingGeneralFields}
      feesSearchMatchCount={countMatchingFees}
    />
  );
}
