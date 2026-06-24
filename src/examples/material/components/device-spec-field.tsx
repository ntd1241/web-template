import { useMemo } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { resolveEffectiveSpecs } from '../lib/resolve-effective-specs';
import {
  formatSpecValue,
  isMultiSelectValue,
  isNumberSpecValue,
} from '../lib/spec-value';
import type { MaterialFormValues } from '../material.schema';
import {
  SPEC_DEVICE_MODE_LABELS,
  type MaterialModel,
} from '../model/material-model';
import type {
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../model/spec-definition';

interface DeviceSpecFieldProps {
  form: UseFormReturn<MaterialFormValues>;
  model: MaterialModel | undefined;
  definitions: SpecDefinition[];
}

export function DeviceSpecField({
  form,
  model,
  definitions,
}: DeviceSpecFieldProps) {
  const specValues = form.watch('specValues');

  const modelSpecById = useMemo(
    () =>
      new Map(
        (model?.specs ?? []).map((modelSpec) => [
          modelSpec.specDefinitionId,
          modelSpec,
        ]),
      ),
    [model],
  );

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
  );

  if (effectiveSpecs.length === 0) {
    return (
      <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-6 text-center text-sm text-muted-foreground">
        Mẫu này chưa gán thông số kỹ thuật.
      </p>
    );
  }

  const handleChange = (specDefinitionId: string, value: SpecValue) => {
    const current = form.getValues('specValues');
    const next = current.some(
      (item) => item.specDefinitionId === specDefinitionId,
    )
      ? current.map((item) =>
          item.specDefinitionId === specDefinitionId
            ? { ...item, value }
            : item,
        )
      : [...current, { specDefinitionId, value }];

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

        const modelSpec = modelSpecById.get(effectiveSpec.specDefinitionId);
        const allowedOptions =
          definition.dataType === 'list' && definition.allowDynamicValues
            ? (modelSpec?.dynamicOptions ?? [])
            : modelSpec?.allowedOptionIds
              ? (definition.options ?? []).filter((option) =>
                  modelSpec.allowedOptionIds?.includes(option.id),
                )
              : (definition.options ?? []);

        return (
          <div
            key={effectiveSpec.specDefinitionId}
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
                <Badge variant="secondary" appearance="light">
                  {SPEC_DEVICE_MODE_LABELS[effectiveSpec.deviceMode]}
                </Badge>
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
                  )}
                </div>
              ) : (
                <SpecValueEditor
                  definition={definition}
                  value={effectiveSpec.value}
                  allowedOptions={allowedOptions}
                  onChange={(value) =>
                    handleChange(effectiveSpec.specDefinitionId, value)
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
  onChange,
}: {
  definition: SpecDefinition;
  value: SpecValue | undefined;
  allowedOptions: SpecOption[];
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
      if (definition.allowMultiple) {
        return (
          <MultiSelect
            value={isMultiSelectValue(value) ? value : []}
            options={allowedOptions.map((option) => ({
              value: option.id,
              label: option.label,
              searchableText: `${option.label} ${option.value}`,
            }))}
            placeholder="Chọn giá trị"
            searchPlaceholder="Tìm lựa chọn..."
            emptyMessage="Không có lựa chọn"
            maxChips={3}
            onChange={onChange}
          />
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
