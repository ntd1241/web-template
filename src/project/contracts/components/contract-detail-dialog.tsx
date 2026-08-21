import { formatDate, formatDateTime } from '@/lib/date';
import { useNumberFormat } from '@/providers/number-format-provider';
import { type EntityDetailDialogField } from '@/components/layouts/entity-detail-dialog';
import { CustomerIdentity } from '../../customers/components/customer-identity';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import type { ContractDetail } from '../api/contracts.api';
import { CONTRACT_STATUS_LABELS } from '../model/contract';
import { ContractDetailDialogShell } from './contract-detail-dialog.generated';
import { ContractResponsibleAvatarGroup } from './contract-responsible-avatar-group';
import { ContractStatusBadge } from './contract-status-badge';

function joinSearchText(...values: unknown[]) {
  return values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value) => value !== null && value !== undefined)
    .join(' ');
}

function buildGeneralSearchText(contract: ContractDetail) {
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
    contract.responsibleEmployees.map((employee) => [
      employee.displayName,
      employee.employeeCode,
    ]),
    'nhãn',
    contract.tags.map((tag) => tag.name),
    'ghi chú',
    contract.note,
    'cập nhật lần cuối',
    contract.updatedAt,
  );
}

function ContractGeneralFields({
  contract,
  formatCurrency,
}: {
  contract: ContractDetail;
  formatCurrency: (
    value: number | null | undefined,
    currencyCode?: string,
  ) => string;
}): EntityDetailDialogField[] {
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
      value: (
        <ContractResponsibleAvatarGroup
          employees={contract.responsibleEmployees}
        />
      ),
      searchText: joinSearchText(
        contract.responsibleEmployees.map((employee) => [
          employee.displayName,
          employee.employeeCode,
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
  const { formatCurrency } = useNumberFormat();

  return (
    <ContractDetailDialogShell<ContractDetail>
      open={open}
      onOpenChange={onOpenChange}
      title="Chi tiết hợp đồng"
      data={contract}
      searchPlaceholder="Tìm theo tên, mã, khách hàng..."
      generalFields={({ data }) =>
        ContractGeneralFields({ contract: data, formatCurrency })
      }
      generalSearchText={buildGeneralSearchText}
    />
  );
}
