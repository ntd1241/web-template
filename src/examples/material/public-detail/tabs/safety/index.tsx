import { useMemo, useState } from 'react';
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  ClipboardPenLine,
  ListChecks,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import { materialSafetyInspectionItems } from '../../data/material-safety-inspection.mock';
import type {
  MaterialSafetyInspectionItem,
  MaterialSafetyInspectionResult,
} from '../../model/material-safety-inspection';

const resultConfig: Record<
  MaterialSafetyInspectionResult,
  {
    icon: LucideIcon;
    badgeVariant: 'success' | 'destructive';
    iconClassName: string;
    ringClassName: string;
  }
> = {
  passed: {
    icon: CircleCheck,
    badgeVariant: 'success',
    iconClassName: 'bg-green-50 text-green-700',
    ringClassName: 'border-green-200',
  },
  failed: {
    icon: CircleX,
    badgeVariant: 'destructive',
    iconClassName: 'bg-red-50 text-red-700',
    ringClassName: 'border-red-200',
  },
};

function formatDate(value: string) {
  return value.split('-').reverse().join('/');
}

function compareInspectionItems(
  firstItem: MaterialSafetyInspectionItem,
  secondItem: MaterialSafetyInspectionItem,
) {
  return secondItem.inspectedAt.localeCompare(firstItem.inspectedAt);
}

function isWithinRange(
  item: MaterialSafetyInspectionItem,
  fromDate: string,
  toDate: string,
) {
  if (fromDate && item.inspectedAt < fromDate) {
    return false;
  }

  if (toDate && item.inspectedAt > toDate) {
    return false;
  }

  return true;
}

function SafetyInspectionCard({
  item,
}: {
  item: MaterialSafetyInspectionItem;
}) {
  const config = resultConfig[item.result];
  const ResultIcon = config.icon;

  return (
    <article
      aria-label={`Kiểm tra an toàn ngày ${formatDate(item.inspectedAt)}`}
      className="grid gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs sm:grid-cols-[auto_minmax(0,1fr)] sm:p-4"
    >
      <div className="flex sm:flex-col sm:items-center">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl border ${config.iconClassName} ${config.ringClassName}`}
        >
          <ResultIcon className="size-4.5" />
        </span>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-[15px] font-semibold text-admin-neutral-900">
                Kiểm tra an toàn định kỳ
              </h4>
              <Badge
                variant={config.badgeVariant}
                appearance="light"
                size="sm"
                className="shrink-0"
              >
                {item.resultLabel}
              </Badge>
            </div>
            <p className="text-[13px] leading-5 text-admin-neutral-600">
              {item.comment}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground sm:justify-end">
            <CalendarDays className="size-3.5" />
            <span>{formatDate(item.inspectedAt)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            appearance="outline"
            size="sm"
            className="gap-1.5 font-medium"
          >
            <UserRound className="size-3.5" />
            {item.inspector}
          </Badge>
          <Badge
            variant="secondary"
            appearance="outline"
            size="sm"
            className="gap-1.5 font-medium"
          >
            <ListChecks className="size-3.5" />
            {item.passedCriteria}/{item.totalCriteria} chỉ tiêu
          </Badge>
        </div>
      </div>
    </article>
  );
}

export function SafetyTab({
  isAuthenticated = false,
  onCreateInspection,
}: {
  isAuthenticated?: boolean;
  onCreateInspection?: () => void;
}) {
  const [draftFromDate, setDraftFromDate] = useState('');
  const [draftToDate, setDraftToDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const inspectionItems = useMemo(
    () =>
      materialSafetyInspectionItems
        .filter((item) => isWithinRange(item, fromDate, toDate))
        .sort(compareInspectionItems),
    [fromDate, toDate],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-admin-blue-bg text-admin-blue-primary">
            <ClipboardPenLine className="size-4.5" />
          </span>
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-semibold leading-none tracking-tight text-admin-neutral-900">
              Quản lý an toàn
            </h3>
            <p className="text-[13px] text-muted-foreground">
              Số lượng: {inspectionItems.length}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end">
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Từ ngày
            <DatePickerInput
              aria-label="Từ ngày"
              variant="sm"
              valueMode="iso-date"
              value={draftFromDate}
              onChange={(value) =>
                setDraftFromDate(typeof value === 'string' ? value : '')
              }
              calendarLabel="Chọn từ ngày"
              className="w-[150px]"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-muted-foreground">
            Đến ngày
            <DatePickerInput
              aria-label="Đến ngày"
              variant="sm"
              valueMode="iso-date"
              value={draftToDate}
              onChange={(value) =>
                setDraftToDate(typeof value === 'string' ? value : '')
              }
              calendarLabel="Chọn đến ngày"
              className="w-[150px]"
            />
          </label>
          <Button
            type="button"
            size="sm"
            className="self-end"
            onClick={() => {
              setFromDate(draftFromDate);
              setToDate(draftToDate);
            }}
          >
            Lọc
          </Button>
          {isAuthenticated ? (
            <Button
              type="button"
              size="sm"
              className="self-end"
              onClick={onCreateInspection}
            >
              <ClipboardPenLine className="size-3.5" />
              Phiếu kiểm tra mới
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        {inspectionItems.length > 0 ? (
          inspectionItems.map((item) => (
            <SafetyInspectionCard key={item.id} item={item} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Không có lịch sử kiểm tra trong khoảng thời gian đã chọn.
          </div>
        )}
      </div>
    </div>
  );
}
