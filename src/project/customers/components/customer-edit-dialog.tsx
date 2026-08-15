import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import {
  loadCustomerRegionOptions,
  updateCustomer,
  uploadCustomerImage,
} from '../api/customers.api';
import {
  CustomerFormDialog,
  useCustomerForm,
} from '../forms/customer-form.generated';
import {
  mapCustomerToFormValues,
  type Customer,
  type CustomerFormValues,
} from '../model/customer';

interface CustomerEditDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerEditDialog({
  customer,
  open,
  onOpenChange,
}: CustomerEditDialogProps) {
  const queryClient = useQueryClient();
  const [customerImageFile, setCustomerImageFile] = useState<File | null>(null);
  const form = useCustomerForm();
  const customerRegionQuery = useQuery({
    queryKey: ['project', 'customers', 'regions'],
    queryFn: loadCustomerRegionOptions,
  });

  useEffect(() => {
    if (!open) return;

    form.reset(mapCustomerToFormValues(customer));
    setCustomerImageFile(null);
  }, [customer, form, open]);

  const saveMutation = useMutation({
    mutationFn: async (values: CustomerFormValues) => {
      const imageUrl = customerImageFile
        ? await uploadCustomerImage(
            customer.tenantId,
            customer.id,
            customerImageFile,
          )
        : values.imageUrl;

      return updateCustomer(customer.id, { ...values, imageUrl });
    },
    onSuccess: async () => {
      toast.success('Đã cập nhật khách hàng.');
      setCustomerImageFile(null);
      await queryClient.invalidateQueries({
        queryKey: ['project', 'customers'],
      });
      onOpenChange(false);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <CustomerFormDialog
      open={open}
      onOpenChange={onOpenChange}
      mode="edit"
      form={form}
      onSubmit={(values) => saveMutation.mutate(values)}
      onImageUrlFileChange={setCustomerImageFile}
      regionCodeOptions={customerRegionQuery.data ?? []}
      isSaving={saveMutation.isPending}
      title="Sửa khách hàng"
    />
  );
}
