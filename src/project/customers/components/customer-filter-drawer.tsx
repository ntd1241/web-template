import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataGridFilterDrawer } from '@/components/ui/data-grid-filter-drawer';
import { DrawerClose } from '@/components/ui/drawer';
import {
  customerFilterDefaultValues,
  CustomerFilterForm,
  useCustomerFilterForm,
} from '../forms/customer-filter-form.generated';
import type {
  CustomerFilterFormValues,
  CustomerListFilters,
} from '../model/customer';

interface CustomerFilterDrawerProps {
  filters: CustomerListFilters;
  onApply: (values: CustomerFilterFormValues) => void;
  onReset: () => void;
}

export function CustomerFilterDrawer({
  filters,
  onApply,
  onReset,
}: CustomerFilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const form = useCustomerFilterForm({ defaultValues: filters });

  useEffect(() => {
    form.reset(filters);
  }, [filters, form]);

  const handleSubmit = (values: CustomerFilterFormValues) => {
    onApply(values);
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) form.reset(filters);
  };

  const handleReset = () => {
    form.reset(customerFilterDefaultValues);
    onReset();
  };

  return (
    <DataGridFilterDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title="Bộ lọc khách hàng"
      description="Lọc chi tiết danh sách khách hàng."
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Xóa bộ lọc
          </Button>
          <div className="flex items-center gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Đóng
              </Button>
            </DrawerClose>
            <Button type="submit" form="customer-filter-form" variant="primary">
              Áp dụng
            </Button>
          </div>
        </div>
      }
    >
      <CustomerFilterForm
        form={form}
        onSubmit={handleSubmit}
        id="customer-filter-form"
      />
    </DataGridFilterDrawer>
  );
}
