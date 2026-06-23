import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { SpecDefinition } from '../../model/spec-definition';
import type { MaterialModelFormValues } from '../material-model.schema';
import { MaterialModelForm } from './material-model-form.generated';
import { ModelSpecEditor } from './model-spec-editor';

interface MaterialModelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<MaterialModelFormValues>;
  definitions: SpecDefinition[];
  groupOptions: { value: string; label: string }[];
  onSubmit: (values: MaterialModelFormValues) => void;
  title: string;
}

const STEPS = ['Thông tin cơ bản', 'Thông số kỹ thuật'] as const;

export function MaterialModelWizard({
  open,
  onOpenChange,
  form,
  definitions,
  groupOptions,
  onSubmit,
  title,
}: MaterialModelWizardProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const handleNext = async () => {
    const valid = await form.trigger(['name', 'code', 'groupId']);
    if (valid) setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-3 px-6 py-5 text-start">
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Mẫu gom nhiều thiết bị cùng loại để thống kê.
            </DialogDescription>
          </div>
          <ol className="flex items-center gap-3">
            {STEPS.map((label, index) => {
              const isActive = index === step;
              const isDone = index < step;
              return (
                <li key={label} className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-6 items-center justify-center rounded-full border text-xs font-medium',
                      isActive &&
                        'border-primary bg-primary text-primary-foreground',
                      isDone && 'border-primary bg-primary/10 text-primary',
                      !isActive &&
                        !isDone &&
                        'border-border text-muted-foreground',
                    )}
                  >
                    {isDone ? <Check className="size-3.5" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      'text-sm',
                      isActive
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </DialogHeader>

        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className={cn(step !== 0 && 'hidden')}>
            <MaterialModelForm
              form={form}
              onSubmit={() => {}}
              groupIdOptions={groupOptions}
            />
          </div>
          <div className={cn(step !== 1 && 'hidden')}>
            <ModelSpecEditor form={form} definitions={definitions} />
          </div>
        </div>

        <Separator />

        <DialogFooter className="shrink-0 items-center justify-between px-6 py-4 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? onOpenChange(false) : setStep(0))}
          >
            {step === 0 ? 'Hủy' : 'Quay lại'}
          </Button>
          {step === 0 ? (
            <Button type="button" variant="primary" onClick={handleNext}>
              Tiếp tục
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              onClick={form.handleSubmit(onSubmit)}
            >
              Lưu mẫu
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
