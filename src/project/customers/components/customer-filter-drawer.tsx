import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataGridFilterDrawer } from '@/components/ui/data-grid-filter-drawer';
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
  onSaveToView?: (values: CustomerFilterFormValues) => void;
  canSaveToView?: boolean;
  saveDisabled?: boolean;
  isSaving?: boolean;
}

export function CustomerFilterDrawer({
  filters,
  onApply,
  onReset,
  onSaveToView,
  canSaveToView = true,
  saveDisabled = false,
  isSaving = false,
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

  const handleSaveToView = () => {
    if (!onSaveToView) return;

    void form.handleSubmit((values) => {
      onApply(values);
      onSaveToView(values);
      setOpen(false);
    })();
  };

  return (
    <DataGridFilterDrawer
      open={open}
      onOpenChange={handleOpenChange}
      title="Bộ lọc khách hàng"
      onSaveToView={onSaveToView ? handleSaveToView : undefined}
      canSaveToView={canSaveToView}
      saveDisabled={saveDisabled && !form.formState.isDirty}
      isSaving={isSaving}
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" onClick={handleReset}>
            Xóa bộ lọc
          </Button>
          <Button type="submit" form="customer-filter-form" variant="primary">
            Áp dụng
          </Button>
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
