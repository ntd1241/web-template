/**
 * Scaffolded by detail-dialog-builder from `src/builders/detail-dialog/__fixtures__/customer-detail-dialog.fixture.ts`. Run `npm run gen:detail-dialog` — do NOT hand-write this file.
 * You own this file now — wire local data and tab content to screen logic.
 * To change the tab structure, edit the spec and re-gen to a scratch path first.
 */
import type { ReactNode } from 'react';
import { FileText, Info } from 'lucide-react';
import {
  EntityDetailDialog,
  EntityDetailDialogTable,
  type EntityDetailDialogField,
  type EntityDetailDialogTab,
  type EntityDetailDialogTabContext,
} from '@/components/layouts/entity-detail-dialog';

export interface CustomerDetailDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  data: TData | null;
  searchPlaceholder?: string;
  generalFields: (
    context: EntityDetailDialogTabContext<TData>,
  ) => EntityDetailDialogField[];
  contractsPanel: (context: EntityDetailDialogTabContext<TData>) => ReactNode;
  generalSearchText?: (data: TData) => string;
  contractsSearchText?: (data: TData) => string;
  className?: string;
}
export function CustomerDetailDialog<TData>({
  open,
  onOpenChange,
  title,
  data,
  searchPlaceholder,
  generalFields,
  contractsPanel,
  generalSearchText,
  contractsSearchText,
  className,
}: CustomerDetailDialogProps<TData>) {
  const tabs: EntityDetailDialogTab<TData>[] = [
    {
      value: 'general',
      label: 'Thông tin chung',
      icon: Info,
      searchText: generalSearchText,
      content: (context) => (
        <EntityDetailDialogTable
          fields={generalFields(context)}
          matches={context.matches}
        />
      ),
    },
    {
      value: 'contracts',
      label: 'Hợp đồng',
      icon: FileText,
      searchText: contractsSearchText,
      content: contractsPanel,
    },
  ];

  return (
    <EntityDetailDialog<TData>
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      data={data}
      tabs={tabs}
      defaultTab="general"
      searchPlaceholder={searchPlaceholder}
      className={className}
    />
  );
}
