import { useState } from 'react';
import { buildPath, ROUTES } from '@/constants/routes';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Plus, RefreshCw, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { archiveContractTemplate } from '../api/contract-templates.api';
import {
  CONTRACT_TEMPLATE_STATUS_LABELS,
  CONTRACT_TEMPLATE_STATUSES,
  type ContractTemplate,
} from '../model/contract-template';
import { ContractTemplateStatusBadge } from './contract-template-status-badge';
import { useContractTemplateColumns } from './contract-template.columns.generated';
import { ContractTemplateFilterBar } from './contract-template.filters.generated';
import { useContractTemplateList } from './use-contract-template-list';

const CONTRACT_TEMPLATE_FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  ...CONTRACT_TEMPLATE_STATUSES.map((status) => ({
    value: status,
    label: CONTRACT_TEMPLATE_STATUS_LABELS[status],
  })),
];

export function ContractTemplatesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [archivingTemplate, setArchivingTemplate] =
    useState<ContractTemplate | null>(null);
  const {
    templates,
    total,
    keyword,
    setKeyword,
    filters,
    setFilter,
    pagination,
    onPaginationChange,
    tenantQuery,
    listQuery,
  } = useContractTemplateList();

  const archiveMutation = useMutation({
    mutationFn: (template: ContractTemplate) =>
      archiveContractTemplate(template.id),
    onSuccess: async () => {
      toast.success('Đã lưu trữ mẫu hợp đồng.');
      setArchivingTemplate(null);
      await queryClient.invalidateQueries({
        queryKey: ['project', 'contract-templates'],
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const columns = useContractTemplateColumns({
    onView: (template) =>
      navigate(
        buildPath(ROUTES.PROJECT.CONTRACT_TEMPLATE_DETAIL, {
          id: template.id,
        }),
      ),
    onEdit: (template) =>
      navigate(
        buildPath(ROUTES.PROJECT.CONTRACT_TEMPLATE_EDIT, {
          id: template.id,
        }),
      ),
    onArchive: setArchivingTemplate,
    templateSearch: filters.templateSearch,
    onTemplateSearchChange: (value) => setFilter('templateSearch', value),
    statuses: filters.statuses,
    onStatusesChange: (value) => {
      setFilter('statuses', value as typeof filters.statuses);
      setFilter(
        'status',
        value.length === 1 ? (value[0] as typeof filters.status) : 'all',
      );
    },
    lineCount: {
      min: filters.lineCountMin,
      max: filters.lineCountMax,
    },
    onLineCountChange: (value) => {
      setFilter('lineCountMin', value.min);
      setFilter('lineCountMax', value.max);
    },
    contractCount: {
      min: filters.contractCountMin,
      max: filters.contractCountMax,
    },
    onContractCountChange: (value) => {
      setFilter('contractCountMin', value.min);
      setFilter('contractCountMax', value.max);
    },
    versionNo: {
      min: filters.versionNoMin,
      max: filters.versionNoMax,
    },
    onVersionNoChange: (value) => {
      setFilter('versionNoMin', value.min);
      setFilter('versionNoMax', value.max);
    },
    updatedAt: {
      from: filters.updatedFrom,
      to: filters.updatedTo,
    },
    onUpdatedAtChange: (value) => {
      setFilter('updatedFrom', value.from ?? '');
      setFilter('updatedTo', value.to ?? '');
    },
  });
  const table = useReactTable({
    data: templates,
    columns,
    getRowId: (row) => row.id,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
  });
  const listError = tenantQuery.error ?? listQuery.error;

  if (tenantQuery.isError || listQuery.isError) {
    return (
      <div className="p-4 lg:p-5">
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <TriangleAlert className="size-8 text-destructive" />
          <div>
            <CardTitle>Không tải được danh sách mẫu hợp đồng</CardTitle>
            <CardDescription className="mt-1">
              {getApiErrorMessage(listError)}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => void listQuery.refetch()}>
            Thử lại
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col p-4 lg:p-5">
      <DataGrid
        table={table}
        recordCount={total}
        isLoading={listQuery.isPending}
        emptyMessage="Chưa có mẫu hợp đồng"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Mẫu hợp đồng</CardTitle>
              <CardDescription>
                Quản lý mẫu dịch vụ và tạo nhanh hợp đồng cho khách hàng.
              </CardDescription>
            </CardHeading>
            <CardToolbar className="flex-wrap">
              <ContractTemplateFilterBar
                keyword={keyword}
                onKeywordChange={setKeyword}
                status={filters.status}
                onStatusChange={(value) =>
                  (() => {
                    const nextStatus = value as typeof filters.status;
                    setFilter('status', nextStatus);
                    setFilter(
                      'statuses',
                      nextStatus === 'all' ? [] : [nextStatus],
                    );
                  })()
                }
                statusOptions={CONTRACT_TEMPLATE_FILTER_STATUS_OPTIONS}
                statusRenderOption={(option) =>
                  option.value === 'all' ? (
                    option.label
                  ) : (
                    <ContractTemplateStatusBadge
                      status={option.value}
                      size="sm"
                    />
                  )
                }
                statusRenderValue={(option) =>
                  option?.value === 'all' ? (
                    option.label
                  ) : option ? (
                    <ContractTemplateStatusBadge
                      status={option.value}
                      size="sm"
                    />
                  ) : null
                }
              />
              <Button
                variant="outline"
                onClick={() => void listQuery.refetch()}
              >
                <RefreshCw />
                Làm mới
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  navigate(ROUTES.PROJECT.CONTRACT_TEMPLATE_CREATE)
                }
              >
                <Plus />
                Thêm mẫu hợp đồng
              </Button>
            </CardToolbar>
          </CardHeader>
          <CardTable className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter className="justify-between">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <ConfirmDialog
        open={Boolean(archivingTemplate)}
        onOpenChange={(open) => {
          if (!open) setArchivingTemplate(null);
        }}
        title="Lưu trữ mẫu hợp đồng?"
        description={
          archivingTemplate
            ? `Mẫu “${archivingTemplate.name}” sẽ không còn được chọn để tạo hợp đồng mới.`
            : ''
        }
        confirmLabel="Lưu trữ mẫu"
        confirmVariant="destructive"
        onConfirm={() => {
          if (archivingTemplate) archiveMutation.mutate(archivingTemplate);
        }}
      />
    </div>
  );
}
