import type { UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { resolveEffectiveSpecs } from '../lib/resolve-effective-specs';
import { formatSpecValue, isNumberSpecValue } from '../lib/spec-value';
import type { MaterialFormValues } from '../material.schema';
import type { MaterialModel } from '../model/material-model';
import type {
  ListSelectionMode,
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../model/spec-definition';
import type { SpecValueSet } from '../model/spec-value-set';

interface DeviceSpecFieldProps {
  form: UseFormReturn<MaterialFormValues>;
  model: MaterialModel | undefined;
  definitions: SpecDefinition[];
  valueSets: SpecValueSet[];
}

export function DeviceSpecField({
  form,
  model,
  definitions,
  valueSets,
}: DeviceSpecFieldProps) {
  const specValues = form.watch('specValues');

  if (!model) {
    return (
      <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-6 text-center text-sm text-muted-foreground">
        Chọn mẫu để nhập thông số thiết bị.
      </p>
    );
  }

  const effectiveSpecs = resolveEffectiveSpecs(
    model,
    { specValues },
    definitions,
    valueSets,
  );

  if (effectiveSpecs.length === 0) {
    return (
      <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-6 text-center text-sm text-muted-foreground">
        Mẫu này chưa gán thông số kỹ thuật.
      </p>
    );
  }

  const handleChange = (materialModelSpecId: string, value: SpecValue) => {
    const current = form.getValues('specValues');
    const next = current.some(
      (item) => item.materialModelSpecId === materialModelSpecId,
    )
      ? current.map((item) =>
          item.materialModelSpecId === materialModelSpecId
            ? { ...item, value }
            : item,
        )
      : [...current, { materialModelSpecId, value }];

    form.setValue('specValues', next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Thông số kế thừa ({effectiveSpecs.length})
        </p>
        <Badge variant="secondary" appearance="light">
          {model.name}
        </Badge>
      </div>

      {effectiveSpecs.map((effectiveSpec) => {
        const definition = effectiveSpec.definition;
        if (!definition) return null;

        const allowedOptions = effectiveSpec.options ?? [];

        return (
          <div
            key={effectiveSpec.materialModelSpecId}
            className="rounded-admin-control border border-border p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {definition.name}
                  {effectiveSpec.isRequired && (
                    <span className="text-destructive"> *</span>
                  )}
                </span>
                {effectiveSpec.isReadOnly && (
                  <Badge variant="secondary" appearance="light">
                    Khóa theo mẫu
                  </Badge>
                )}
              </div>
              {effectiveSpec.isReadOnly && (
                <span className="text-xs text-muted-foreground">
                  Kế thừa từ mẫu
                </span>
              )}
            </div>

            <div className="mt-3">
              {effectiveSpec.isReadOnly ? (
                <div className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-2 text-sm text-foreground">
                  {formatSpecValue(
                    definition,
                    effectiveSpec.value,
                    effectiveSpec.options,
                    effectiveSpec.selectionMode,
                  )}
                </div>
              ) : (
                <SpecValueEditor
                  definition={definition}
                  value={effectiveSpec.value}
                  allowedOptions={allowedOptions}
                  selectionMode={effectiveSpec.selectionMode}
                  onChange={(value) =>
                    handleChange(effectiveSpec.materialModelSpecId, value)
                  }
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpecValueEditor({
  definition,
  value,
  allowedOptions,
  selectionMode,
  onChange,
}: {
  definition: SpecDefinition;
  value: SpecValue | undefined;
  allowedOptions: SpecOption[];
  selectionMode: ListSelectionMode | undefined;
  onChange: (value: SpecValue) => void;
}) {
  switch (definition.dataType) {
    case 'number': {
      const amount = isNumberSpecValue(value) ? value.amount : undefined;
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            variant="md"
            value={Number.isFinite(amount) ? String(amount) : ''}
            onChange={(event) =>
              onChange({
                amount: Number(event.target.value),
                unit: definition.unit,
              })
            }
          />
          {definition.unit && (
            <span className="text-sm text-muted-foreground">
              {definition.unit}
            </span>
          )}
        </div>
      );
    }
    case 'boolean':
      return (
        <div className="flex h-9 items-center gap-2">
          <Switch checked={value === true} onCheckedChange={onChange} />
          <span className="text-sm text-foreground">
            {value === true ? 'Có' : 'Không'}
          </span>
        </div>
      );
    case 'date':
      return (
        <Input
          type="date"
          variant="md"
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'list': {
      if (selectionMode === 'multi') {
        const selected = Array.isArray(value) ? value : [];
        const handleToggle = (optionId: string, checked: boolean) => {
          onChange(
            checked
              ? [...selected, optionId]
              : selected.filter((id) => id !== optionId),
          );
        };
        if (allowedOptions.length === 0) {
          return (
            <span className="text-sm text-muted-foreground">
              Không có lựa chọn
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {allowedOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <Checkbox
                  size="sm"
                  checked={selected.includes(option.id)}
                  aria-label={option.label}
                  onCheckedChange={(checked) =>
                    handleToggle(option.id, checked === true)
                  }
                />
                <OptionLabel option={option} />
              </label>
            ))}
          </div>
        );
      }
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn giá trị" />
          </SelectTrigger>
          <SelectContent>
            {allowedOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <OptionLabel option={option} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    default:
      return (
        <div>
          <Label className="sr-only">{definition.name}</Label>
          <Input
            variant="md"
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      );
  }
}

function OptionLabel({ option }: { option: SpecOption }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {option.colorHex && (
        <span
          className="size-3 rounded-full border border-border"
          style={{ backgroundColor: option.colorHex }}
        />
      )}
      {option.label}
    </span>
  );
}
