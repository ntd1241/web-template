import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { fuzzyMatch } from '@/lib/fuzzy-search';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SearchInput } from '@/components/ui/inputs/search-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface EntityDetailDialogTabContext<TData> {
  data: TData;
  searchQuery: string;
  matches: (value: unknown) => boolean;
}

export interface EntityDetailDialogField {
  label: string;
  value: ReactNode;
  searchText?: unknown;
}

export function EntityDetailDialogTable({
  fields,
  matches,
}: {
  fields: EntityDetailDialogField[];
  matches: (value: unknown) => boolean;
}) {
  const visibleFields = fields.filter((field) =>
    matches(`${field.label} ${String(field.searchText ?? '')}`),
  );

  if (visibleFields.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Không có thông tin phù hợp trong mục này.
      </div>
    );
  }

  return (
    <table className="w-full text-sm text-foreground">
      <tbody>
        {visibleFields.map((field) => (
          <tr key={field.label} className="border-b last:border-b-0">
            <td className="w-1/3 bg-muted/30 p-4 align-middle font-medium text-muted-foreground">
              {field.label}
            </td>
            <td className="p-4 align-middle text-foreground">{field.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export interface EntityDetailDialogTab<TData> {
  value: string;
  label: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  searchText?: (data: TData) => string;
  content: (context: EntityDetailDialogTabContext<TData>) => ReactNode;
}

export interface EntityDetailDialogProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  data: TData | null;
  tabs: EntityDetailDialogTab<TData>[];
  defaultTab?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function EntityDetailDialog<TData>({
  open,
  onOpenChange,
  title,
  data,
  tabs,
  defaultTab,
  searchPlaceholder = 'Tìm trong thông tin chi tiết...',
  className,
}: EntityDetailDialogProps<TData>) {
  const initialTab = defaultTab ?? tabs[0]?.value ?? '';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setSearchQuery('');
  }, [initialTab, open]);

  const visibleTabs = useMemo(() => {
    if (!data || !searchQuery.trim()) return tabs;

    return tabs.filter(
      (tab) => !tab.searchText || fuzzyMatch(searchQuery, tab.searchText(data)),
    );
  }, [data, searchQuery, tabs]);

  useEffect(() => {
    if (visibleTabs.some((tab) => tab.value === activeTab)) return;
    setActiveTab(visibleTabs[0]?.value ?? '');
  }, [activeTab, visibleTabs]);

  const activeTabData = visibleTabs.find((tab) => tab.value === activeTab);
  const renderActiveContent = () =>
    activeTabData?.content({
      data: data as TData,
      searchQuery,
      matches: (value) => fuzzyMatch(searchQuery, value),
    });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'h-[min(800px,calc(100vh-2rem))] w-[calc(100%-2rem)] max-w-5xl gap-0 overflow-hidden p-0',
          className,
        )}
        aria-labelledby="entity-detail-dialog-title"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-5 pe-14 text-start">
          <DialogTitle id="entity-detail-dialog-title">{title}</DialogTitle>
          <DialogDescription className="sr-only">
            Xem và tìm kiếm thông tin chi tiết.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-b px-2 py-1 sm:px-3 sm:py-1.5">
          <SearchInput
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder={searchPlaceholder}
            debounceMs={200}
            variant="ghost"
            className="bg-transparent px-1 shadow-none"
            aria-label={searchPlaceholder}
          />
        </div>

        {!data ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            Chưa có dữ liệu để hiển thị.
          </div>
        ) : visibleTabs.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
            Không tìm thấy thông tin phù hợp.
          </div>
        ) : visibleTabs.length === 1 ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {renderActiveContent()}
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList
              variant="line"
              size="md"
              className="shrink-0 justify-start overflow-x-auto px-6"
            >
              {visibleTabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {Icon ? <Icon /> : null}
                    {tab.label}
                    {tab.badge ? (
                      <span className="ms-1.5">{tab.badge}</span>
                    ) : null}
                  </TabsTrigger>
                );
              })}
            </TabsList>
            {activeTabData ? (
              <TabsContent
                value={activeTabData.value}
                className="mt-0 min-h-0 flex-1 overflow-y-auto"
              >
                {renderActiveContent()}
              </TabsContent>
            ) : null}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
