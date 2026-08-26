/**
 * Scaffolded by detail-dialog-builder from `src/project/contracts/detail/contract-detail-dialog.fixture.ts`. Run `npm run gen:detail-dialog` — do NOT hand-write this file.
 * You own this file now — wire local data and tab content to screen logic.
 * To change the tab structure, edit the spec and re-gen to a scratch path first.
 */
import type { ReactNode } from 'react';
import { History, Info, ReceiptText } from 'lucide-react';
import {
  EntityDetailDialog,
  EntityDetailDialogTable,
  type EntityDetailDialogField,
  type EntityDetailDialogTab,
  type EntityDetailDialogTabContext,
} from '@/components/layouts/entity-detail-dialog';

export interface ContractDetailDialogShellProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  data: TData | null;
  isLoading?: boolean;
  searchPlaceholder?: string;
  generalFields: (
    context: EntityDetailDialogTabContext<TData>,
  ) => EntityDetailDialogField[];
  versionFields: (
    context: EntityDetailDialogTabContext<TData>,
  ) => EntityDetailDialogField[];
  feesContent: (context: EntityDetailDialogTabContext<TData>) => ReactNode;
  generalSearchText?: (data: TData) => string;
  versionSearchText?: (data: TData) => string;
  feesSearchText?: (data: TData) => string;
  generalSearchMatchCount?: (
    context: EntityDetailDialogTabContext<TData>,
  ) => number;
  versionSearchMatchCount?: (
    context: EntityDetailDialogTabContext<TData>,
  ) => number;
  feesSearchMatchCount?: (
    context: EntityDetailDialogTabContext<TData>,
  ) => number;
  className?: string;
}
export function ContractDetailDialogShell<TData>({
  open,
  onOpenChange,
  title,
  data,
  isLoading,
  searchPlaceholder,
  generalFields,
  versionFields,
  feesContent,
  generalSearchText,
  versionSearchText,
  feesSearchText,
  generalSearchMatchCount,
  versionSearchMatchCount,
  feesSearchMatchCount,
  className,
}: ContractDetailDialogShellProps<TData>) {
  const tabs: EntityDetailDialogTab<TData>[] = [
    {
      value: 'general',
      label: 'Thông tin chung',
      icon: Info,
      searchText: generalSearchText,
      getMatchCount: generalSearchMatchCount,
      content: (context) => (
        <EntityDetailDialogTable
          fields={generalFields(context)}
          matches={context.matches}
        />
      ),
    },
    {
      value: 'version',
      label: 'Phiên bản',
      icon: History,
      searchText: versionSearchText,
      getMatchCount: versionSearchMatchCount,
      content: (context) => (
        <EntityDetailDialogTable
          fields={versionFields(context)}
          matches={context.matches}
        />
      ),
    },
    {
      value: 'fees',
      label: 'Khoản phí',
      icon: ReceiptText,
      searchText: feesSearchText,
      getMatchCount: feesSearchMatchCount,
      content: feesContent,
    },
  ];

  return (
    <EntityDetailDialog<TData>
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      data={data}
      isLoading={isLoading}
      tabs={tabs}
      defaultTab="general"
      searchPlaceholder={searchPlaceholder}
      className={className}
    />
  );
}
