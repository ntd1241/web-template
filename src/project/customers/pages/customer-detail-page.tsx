import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PageLoading } from '@/components/ui/loading';
import { ShortcutTooltip } from '@/components/ui/shortcut-tooltip';
import { Tag } from '@/components/ui/tag';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  EntityDetailInformationCard,
  EntityDetailInformationGrid,
  EntityDetailInformationItem,
  EntityDetailProfileCard,
} from '@/components/layouts/entity-detail-layout';
import { deleteCustomer, loadCustomerDetail } from '../api/customers.api';
import { CustomerAvatar } from '../components/customer-avatar';
import { CustomerContractsTable } from '../components/customer-contracts-table';
import { CustomerDetailLayout } from '../components/customer-detail-layout.generated';
import {
  CUSTOMER_DETAIL_TAB_CONTENT,
  CustomerDetailTabContent,
} from '../components/customer-detail-tab-content';
import { CustomerEditDialog } from '../components/customer-edit-dialog';
import {
  BUSINESS_TYPE_LABELS,
  CUSTOMER_STATUS_LABELS,
  type Customer,
} from '../model/customer';

function CustomerProfileCard({ customer }: { customer: Customer }) {
  return (
    <EntityDetailProfileCard
      avatar={
        <CustomerAvatar
          customer={customer}
          className="size-24 rounded-2xl text-2xl"
        />
      }
      title={customer.name}
      subtitle={customer.customerCode}
    >
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Phone className="size-4 shrink-0" />
        <span className="truncate">
          {customer.phone || 'Chưa có số điện thoại'}
        </span>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Mail className="size-4 shrink-0" />
        <span className="truncate">{customer.email || 'Chưa có email'}</span>
      </div>
      <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
        <Building2 className="size-4 shrink-0" />
        <span className="truncate">
          {BUSINESS_TYPE_LABELS[customer.businessType]}
        </span>
      </div>
      <Tag
        size="sm"
        shape="circle"
        color={customer.status === 'active' ? '#16a34a' : '#64748b'}
      >
        {CUSTOMER_STATUS_LABELS[customer.status]}
      </Tag>
    </EntityDetailProfileCard>
  );
}

function CustomerInformationCard({
  customer,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const country = COUNTRY_OPTIONS.find(
    (option) => option.value === customer.countryCode,
  );

  return (
    <EntityDetailInformationCard
      actions={
        <>
          <ShortcutTooltip label="Sửa thông tin" shortcut="Alt + E">
            <Button
              type="button"
              variant="ghost"
              onClick={onEdit}
              data-shortcut-action="edit"
            >
              <Pencil />
              Sửa thông tin
            </Button>
          </ShortcutTooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                appearance="ghost"
                mode="icon"
                aria-label={`Xóa khách hàng ${customer.name}`}
                onClick={onDelete}
              >
                <Trash2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Xóa khách hàng</TooltipContent>
          </Tooltip>
        </>
      }
    >
      <EntityDetailInformationGrid>
        <EntityDetailInformationItem
          label="Mã khách hàng"
          value={customer.customerCode}
        />
        <EntityDetailInformationItem
          label="Loại hình đơn vị"
          value={BUSINESS_TYPE_LABELS[customer.businessType]}
        />
        <EntityDetailInformationItem
          label="Mã số thuế / QHNS / ĐKKD"
          value={customer.businessRegistrationCode}
        />
        <EntityDetailInformationItem
          label="Quốc gia"
          value={country?.label ?? customer.countryCode}
        />
        <EntityDetailInformationItem
          label="Tỉnh/Thành phố"
          value={customer.regionName}
        />
        <EntityDetailInformationItem
          label="Địa chỉ chi tiết"
          value={customer.addressDetail}
        />
        <EntityDetailInformationItem
          label="Số điện thoại"
          value={customer.phone}
        />
        <EntityDetailInformationItem label="Email" value={customer.email} />
      </EntityDetailInformationGrid>
      {customer.note ? (
        <div className="mt-6 flex gap-2.5 border-t border-border pt-5 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="whitespace-pre-wrap text-muted-foreground">
            {customer.note}
          </p>
        </div>
      ) : null}
    </EntityDetailInformationCard>
  );
}

function useCustomerQuery() {
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const { id } = useParams<{ id: string }>();

  return useQuery({
    queryKey: ['project', 'customers', 'detail', userId, tenantId, id],
    queryFn: () => {
      if (!userId || !tenantId || !id) {
        throw new Error('Thiếu thông tin khách hàng.');
      }
      return loadCustomerDetail(userId, id, tenantId);
    },
    enabled: Boolean(userId && tenantId && id),
  });
}

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customerQuery = useCustomerQuery();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['project', 'customers'],
      });
      toast.success('Đã xóa khách hàng.');
      navigate(ROUTES.PROJECT.CUSTOMERS, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (customerQuery.isPending) {
    return (
      <PageLoading
        label="Đang tải thông tin khách hàng..."
        className="h-full"
      />
    );
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <CardHeader>
            <CardHeading>
              <CardTitle>Không tải được khách hàng</CardTitle>
              <CardDescription className="mt-2">
                {getApiErrorMessage(customerQuery.error)}
              </CardDescription>
            </CardHeading>
          </CardHeader>
          <CardContent className="flex justify-center gap-2 pt-0">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button variant="primary" onClick={() => customerQuery.refetch()}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const customer = customerQuery.data;

  return (
    <>
      <CustomerDetailLayout
        profile={<CustomerProfileCard customer={customer} />}
        information={
          <CustomerInformationCard
            customer={customer}
            onEdit={() => setEditDialogOpen(true)}
            onDelete={() => setDeleteDialogOpen(true)}
          />
        }
        contractsContent={<CustomerContractsTable customerId={customer.id} />}
        employeesContent={
          <CustomerDetailTabContent
            customer={customer}
            tab={CUSTOMER_DETAIL_TAB_CONTENT[1]}
          />
        }
        reportsContent={
          <CustomerDetailTabContent
            customer={customer}
            tab={CUSTOMER_DETAIL_TAB_CONTENT[2]}
          />
        }
      />
      <CustomerEditDialog
        customer={customer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa khách hàng?"
        description={`Bạn có chắc muốn xóa khách hàng "${customer.name}"?`}
        confirmLabel="Xóa khách hàng"
        confirmVariant="destructive"
        onConfirm={() => deleteMutation.mutate(customer.id)}
      />
    </>
  );
}
