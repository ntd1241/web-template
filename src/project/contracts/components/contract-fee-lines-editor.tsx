import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ContractVersionLineValuesForApi } from '../api/contracts.api';
import {
  BILLING_TYPE_LABELS,
  BILLING_UNIT_LABELS,
  DUE_RULE_LABELS,
  type BillingType,
  type BillingUnit,
  type DueRule,
} from '../model/contract';

export function createDefaultContractFeeLine(
  startDate: string,
): ContractVersionLineValuesForApi {
  return {
    name: '',
    quantity: 1,
    unitPrice: 0,
    billingType: 'recurring',
    billingUnit: 'month',
    billingInterval: 1,
    chargeDate: null,
    dueRule: 'on_period_end',
    dueDays: null,
    startDate,
    endDate: null,
  };
}

interface ContractFeeLinesEditorProps {
  lines: ContractVersionLineValuesForApi[];
  onChange: (lines: ContractVersionLineValuesForApi[]) => void;
}

function updateLine(
  lines: ContractVersionLineValuesForApi[],
  index: number,
  patch: Partial<ContractVersionLineValuesForApi>,
) {
  return lines.map((line, lineIndex) =>
    lineIndex === index ? { ...line, ...patch } : line,
  );
}

export function ContractFeeLinesEditor({
  lines,
  onChange,
}: ContractFeeLinesEditorProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Các khoản phí
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Mỗi khoản phí có thể là định kỳ hoặc phát sinh một lần.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...lines,
              createDefaultContractFeeLine(lines[0]?.startDate ?? ''),
            ])
          }
        >
          <Plus />
          Thêm khoản phí
        </Button>
      </div>

      <div className="space-y-3">
        {lines.map((line, index) => {
          const amount = line.quantity * line.unitPrice;
          return (
            <div
              key={`${index}-${line.name}`}
              className="grid gap-3 rounded-lg border border-border bg-background p-3 md:grid-cols-12"
            >
              <div className="space-y-1 md:col-span-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Tên khoản phí
                </label>
                <Input
                  value={line.name}
                  placeholder="Ví dụ: Phí dịch vụ"
                  variant="md"
                  onChange={(event) =>
                    onChange(
                      updateLine(lines, index, { name: event.target.value }),
                    )
                  }
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Số lượng
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={line.quantity}
                  variant="md"
                  onChange={(event) =>
                    onChange(
                      updateLine(lines, index, {
                        quantity: Number(event.target.value),
                      }),
                    )
                  }
                />
              </div>
              <div className="space-y-1 md:col-span-3">
                <label className="text-xs font-medium text-muted-foreground">
                  Đơn giá
                </label>
                <Input
                  type="number"
                  min={0}
                  step="any"
                  value={line.unitPrice}
                  variant="md"
                  onChange={(event) =>
                    onChange(
                      updateLine(lines, index, {
                        unitPrice: Number(event.target.value),
                      }),
                    )
                  }
                />
              </div>
              <div className="flex items-end justify-between gap-2 md:col-span-3">
                <div className="min-w-0">
                  <span className="block text-xs text-muted-foreground">
                    Thành tiền
                  </span>
                  <span className="block truncate text-sm font-semibold tabular-nums">
                    {new Intl.NumberFormat('vi-VN').format(amount)} VND
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  className="shrink-0 text-destructive hover:text-destructive"
                  aria-label={`Xóa khoản phí ${index + 1}`}
                  disabled={lines.length === 1}
                  onClick={() => onChange(lines.filter((_, i) => i !== index))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="space-y-1 md:col-span-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Loại phí
                </label>
                <Select
                  value={line.billingType}
                  onValueChange={(value: BillingType) =>
                    onChange(
                      updateLine(lines, index, {
                        billingType: value,
                        billingUnit: value === 'recurring' ? 'month' : null,
                        billingInterval: value === 'recurring' ? 1 : null,
                        chargeDate:
                          value === 'one_time' ? line.startDate : null,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(BILLING_TYPE_LABELS) as [
                        BillingType,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {line.billingType === 'recurring' ? (
                <>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Mỗi
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={line.billingInterval ?? 1}
                      variant="md"
                      onChange={(event) =>
                        onChange(
                          updateLine(lines, index, {
                            billingInterval: Number(event.target.value),
                          }),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Chu kỳ
                    </label>
                    <Select
                      value={line.billingUnit ?? 'month'}
                      onValueChange={(value: BillingUnit) =>
                        onChange(
                          updateLine(lines, index, { billingUnit: value }),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(BILLING_UNIT_LABELS) as [
                            BillingUnit,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-1 md:col-span-4">
                  <label className="text-xs font-medium text-muted-foreground">
                    Ngày phát sinh
                  </label>
                  <Input
                    type="date"
                    value={line.chargeDate ?? line.startDate}
                    variant="md"
                    onChange={(event) =>
                      onChange(
                        updateLine(lines, index, {
                          chargeDate: event.target.value,
                          startDate: event.target.value,
                        }),
                      )
                    }
                  />
                </div>
              )}

              <div className="space-y-1 md:col-span-4">
                <label className="text-xs font-medium text-muted-foreground">
                  Hạn thanh toán
                </label>
                <Select
                  value={line.dueRule}
                  onValueChange={(value: DueRule) =>
                    onChange(
                      updateLine(lines, index, {
                        dueRule: value,
                        dueDays: value === 'after_days' ? 0 : null,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.entries(DUE_RULE_LABELS) as [DueRule, string][]
                    ).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {line.dueRule === 'after_days' ? (
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Số ngày
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={line.dueDays ?? 0}
                    variant="md"
                    onChange={(event) =>
                      onChange(
                        updateLine(lines, index, {
                          dueDays: Number(event.target.value),
                        }),
                      )
                    }
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          'text-xs text-muted-foreground',
          lines.length === 0 && 'text-destructive',
        )}
      >
        {lines.length === 0
          ? 'Hợp đồng cần ít nhất một khoản phí.'
          : 'Các khoản phí định kỳ sẽ được sinh thành từng kỳ phải thu khi hợp đồng có hiệu lực.'}
      </p>
    </section>
  );
}
