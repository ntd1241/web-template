import { useState } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Mail, MapPin, Pencil, Phone, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { getApiErrorMessage } from '@/lib/errors';
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
import { Tag } from '@/components/ui/tag';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { deleteCustomer, loadCustomerDetail } from '../api/customers.api';
import { CustomerAvatar } from '../components/customer-avatar';
import { CustomerDetailTabs } from '../components/customer-detail-tabs';
import {
  BUSINESS_TYPE_LABELS,
  CUSTOMER_STATUS_LABELS,
  type Customer,
} from '../model/customer';

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-semibold text-foreground">
        {value || 'Chưa cập nhật'}
      </dd>
    </div>
  );
}

function CustomerProfileCard({ customer }: { customer: Customer }) {
  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center p-6 text-center">
        <CustomerAvatar
          customer={customer}
          className="size-24 rounded-2xl text-2xl"
        />
        <h1 className="mt-4 text-xl font-semibold text-foreground">
          {customer.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {customer.customerCode}
        </p>
        <div className="mt-6 w-full space-y-3 border-t border-border pt-5 text-left">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span className="truncate">
              {customer.phone || 'Chưa có số điện thoại'}
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate">
              {customer.email || 'Chưa có email'}
            </span>
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
        </div>
      </CardContent>
    </Card>
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
    <Card className="h-full">
      <CardContent className="flex h-full flex-col">
        <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          <DetailValue label="Mã khách hàng" value={customer.customerCode} />
          <DetailValue
            label="Loại hình đơn vị"
            value={BUSINESS_TYPE_LABELS[customer.businessType]}
          />
          <DetailValue
            label="Mã số thuế / QHNS / ĐKKD"
            value={customer.businessRegistrationCode}
          />
          <DetailValue
            label="Quốc gia"
            value={country?.label ?? customer.countryCode}
          />
          <DetailValue label="Tỉnh/Thành phố" value={customer.regionName} />
          <DetailValue
            label="Địa chỉ chi tiết"
            value={customer.addressDetail}
          />
          <DetailValue label="Số điện thoại" value={customer.phone} />
          <DetailValue label="Email" value={customer.email} />
        </dl>
        {customer.note ? (
          <div className="mt-6 flex gap-2.5 border-t border-border pt-5 text-sm">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="whitespace-pre-wrap text-muted-foreground">
              {customer.note}
            </p>
          </div>
        ) : null}
        <div className="mt-auto flex justify-end gap-1 pt-6">
          <Button type="button" variant="ghost" onClick={onEdit}>
            <Pencil />
            Sửa thông tin
          </Button>
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
        </div>
      </CardContent>
    </Card>
  );
}

function useCustomerQuery() {
  const userId = useAuthStore((state) => state.user?.id);
  const { id } = useParams<{ id: string }>();

  return useQuery({
    queryKey: ['project', 'customers', 'detail', userId, id],
    queryFn: () => {
      if (!userId || !id) throw new Error('Thiếu thông tin khách hàng.');
      return loadCustomerDetail(userId, id);
    },
    enabled: Boolean(userId && id),
  });
}

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const customerQuery = useCustomerQuery();
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
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-6">
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        <CustomerProfileCard customer={customer} />
        <CustomerInformationCard
          customer={customer}
          onEdit={() =>
            navigate(ROUTES.PROJECT.CUSTOMERS, {
              state: { editCustomerId: customer.id },
            })
          }
          onDelete={() => setDeleteDialogOpen(true)}
        />
      </div>
      <CustomerDetailTabs customer={customer} />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa khách hàng?"
        description={`Bạn có chắc muốn xóa khách hàng "${customer.name}"?`}
        confirmLabel="Xóa khách hàng"
        confirmVariant="destructive"
        onConfirm={() => deleteMutation.mutate(customer.id)}
      />
    </div>
  );
}
