import { ClipboardPenLine, ListChecks, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

const checklistItems = [
  'Tem kiểm định còn hạn và đọc rõ thông tin',
  'Áp suất/niêm phong đạt yêu cầu vận hành',
  'Vị trí đặt bình thông thoáng, dễ tiếp cận',
  'Vỏ bình, vòi phun và chốt an toàn không hư hỏng',
];

export function MaterialSafetyInspectionFormPage() {
  return (
    <section className="space-y-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-admin-blue-bg text-admin-blue-primary">
          <ClipboardPenLine className="size-4.5" />
        </span>
        <div className="min-w-0 space-y-1">
          <h2 className="text-base font-semibold leading-none tracking-tight text-admin-neutral-900">
            Phiếu kiểm tra mới
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Ghi nhận checklist, nhận xét và kết quả kiểm tra an toàn.
          </p>
        </div>
      </div>

      <form className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-xs">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Ngày kiểm tra
            <DatePickerInput
              aria-label="Ngày kiểm tra"
              variant="md"
              valueMode="iso-date"
              calendarLabel="Chọn ngày kiểm tra"
            />
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
            Người kiểm tra
            <Input
              aria-label="Người kiểm tra"
              variant="md"
              placeholder="Nhập tên người kiểm tra"
            />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="flex items-center gap-2 text-sm font-semibold text-admin-neutral-900">
            <ListChecks className="size-4" />
            Checklist kiểm tra
          </legend>
          <div className="grid gap-2">
            {checklistItems.map((item) => (
              <label
                key={item}
                className="flex items-start gap-2 rounded-lg border border-border p-3 text-sm text-admin-neutral-700"
              >
                <Checkbox aria-label={item} size="sm" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
          Nhận xét
          <Textarea
            aria-label="Nhận xét"
            variant="md"
            rows={4}
            placeholder="Nhập nhận xét sau kiểm tra"
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-admin-neutral-900">
            Đánh giá kết quả
          </legend>
          <RadioGroup defaultValue="passed" className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-admin-neutral-700">
              <RadioGroupItem value="passed" aria-label="Đạt" />
              Đạt
            </label>
            <label className="flex items-center gap-2 text-sm text-admin-neutral-700">
              <RadioGroupItem value="failed" aria-label="Chưa đạt" />
              Chưa đạt
            </label>
          </RadioGroup>
        </fieldset>

        <div className="flex justify-end">
          <Button type="button">
            <Save className="size-4" />
            Lưu phiếu
          </Button>
        </div>
      </form>
    </section>
  );
}
