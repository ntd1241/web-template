import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { InspectionTable } from '../../model/inspection-table';
import type { SpecDefinition } from '../../model/spec-definition';
import type { SpecValueSet } from '../../model/spec-value-set';
import type { MaterialModelFormValues } from '../material-model.schema';
import { MaterialModelForm } from './material-model-form.generated';
import { ModelSpecEditor } from './model-spec-editor';

interface MaterialModelWizardProps {
  form: UseFormReturn<MaterialModelFormValues>;
  definitions: SpecDefinition[];
  valueSets: SpecValueSet[];
  groupOptions: { value: string; label: string }[];
  inspectionTableIdOptions: { value: string; label: string }[];
  inspectionTables: InspectionTable[];
  onSubmit: (values: MaterialModelFormValues) => void;
  onCancel: () => void;
  title: string;
}

const STEPS = ['Thông tin cơ bản', 'Thông số kỹ thuật'] as const;

export function MaterialModelWizard({
  form,
  definitions,
  valueSets,
  groupOptions,
  inspectionTableIdOptions,
  inspectionTables,
  onSubmit,
  onCancel,
  title,
}: MaterialModelWizardProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
  }, [title]);

  const handleNext = async () => {
    const valid = await form.trigger([
      'name',
      'code',
      'groupId',
      'isSafetyManaged',
      'inspectionTableId',
    ]);
    if (valid) setStep(1);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden gap-y-5">
      <div className="shrink-0">
        <ol className="flex flex-wrap items-center gap-3">
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
      </div>

      <div className="min-h-0 flex-1 overflow-hidden  rounded-xl bg-card border border-border">
        <div className="flex h-full min-h-0 flex-col">
          <div
            className={cn(
              'min-h-0 flex-1 overflow-y-auto  px-6 py-5',
              step !== 0 && 'hidden',
            )}
          >
            <div className="max-w-6xl">
              <MaterialModelForm
                form={form}
                onSubmit={() => {}}
                groupIdOptions={groupOptions}
                inspectionTableIdOptions={inspectionTableIdOptions}
                inspectionTables={inspectionTables}
              />
            </div>
          </div>
          <div className={cn('min-h-0 flex-1', step !== 1 && 'hidden')}>
            <ModelSpecEditor
              form={form}
              definitions={definitions}
              valueSets={valueSets}
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => (step === 0 ? onCancel() : setStep(0))}
          >
            {step === 0 ? 'Hủy' : 'Quay lại'}
          </Button>
        </div>
        <div>
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
        </div>
      </div>
    </div>
  );
}
