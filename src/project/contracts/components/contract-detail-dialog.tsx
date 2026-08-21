import { formatDate, formatDateTime } from '@/lib/date';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { type EntityDetailDialogField } from '@/components/layouts/entity-detail-dialog';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import type { ContractDetail } from '../api/contracts.api';
import { CONTRACT_STATUS_LABELS } from '../model/contract';
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
      generalSearchText={buildGeneralSearchText}
    />
  );
}
