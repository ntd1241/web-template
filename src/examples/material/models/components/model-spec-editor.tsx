import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { isNumberSpecValue } from '../../lib/spec-value';
import {
  SPEC_DEVICE_MODE_LABELS,
  type SpecDeviceMode,
} from '../../model/material-model';
import {
  isChoiceDataType,
  isSelectDataType,
  SPEC_DATA_TYPE_LABELS,
  type SpecDefinition,
  type SpecOption,
  type SpecValue,
} from '../../model/spec-definition';
import type { MaterialModelFormValues } from '../material-model.schema';

interface ModelSpecEditorProps {
  form: UseFormReturn<MaterialModelFormValues>;
  definitions: SpecDefinition[];
}

function deviceModesFor(def: SpecDefinition): SpecDeviceMode[] {
  if (def.dataType === 'dynamic_list') return ['select'];
  return isSelectDataType(def.dataType)
    ? ['fixed', 'input', 'select']
    : ['fixed', 'input'];
}

let dynamicOptionSeq = 0;
function nextDynamicOptionId(): string {
  dynamicOptionSeq += 1;
  return `dynamic-opt-${dynamicOptionSeq}`;
}

export function ModelSpecEditor({ form, definitions }: ModelSpecEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'specs',
  });
  const specs = form.watch('specs');
  const defById = useMemo(
    () => new Map(definitions.map((d) => [d.id, d])),
    [definitions],
  );

  const usedIds = new Set(specs.map((s) => s.specDefinitionId));
  const available = definitions.filter((d) => d.isActive && !usedIds.has(d.id));

  const handleAdd = (specDefinitionId: string) => {
    const def = defById.get(specDefinitionId);
    if (!def) return;
    const isDynamicList = def.dataType === 'dynamic_list';
    append({
      specDefinitionId,
      deviceMode: isDynamicList ? 'select' : 'fixed',
      modelValue: undefined,
      allowedOptionIds: isSelectDataType(def.dataType) ? [] : undefined,
      dynamicOptions: isDynamicList ? [] : undefined,
      isRequired: false,
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Thông số của mẫu ({fields.length})
        </p>
        <Select value="" onValueChange={handleAdd}>
          <SelectTrigger className="w-56">
            <span className="flex items-center gap-1.5 text-sm">
              <Plus className="size-3.5" />
              Thêm thông số
            </span>
          </SelectTrigger>
          <SelectContent>
            {available.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Đã thêm hết thông số
              </div>
            ) : (
              available.map((def) => (
                <SelectItem key={def.id} value={def.id}>
                  {def.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-6 text-center text-sm text-muted-foreground">
          Chưa gán thông số nào. Chọn "Thêm thông số" để bắt đầu.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const def = defById.get(specs[index]?.specDefinitionId);
            if (!def) return null;
            return (
              <ModelSpecRow
                key={field.id}
                form={form}
                index={index}
                def={def}
                onRemove={() => remove(index)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ModelSpecRow({
  form,
  index,
  def,
  onRemove,
}: {
  form: UseFormReturn<MaterialModelFormValues>;
  index: number;
  def: SpecDefinition;
  onRemove: () => void;
}) {
  const base = `specs.${index}` as const;
  const deviceMode = form.watch(`${base}.deviceMode`);
  const isRequired = form.watch(`${base}.isRequired`);
  const modelValue = form.watch(`${base}.modelValue`);
  const allowedOptionIds = form.watch(`${base}.allowedOptionIds`) ?? [];
  const dynamicOptions = form.watch(`${base}.dynamicOptions`) ?? [];
  const modes = deviceModesFor(def);

  const handleModeChange = (value: string) => {
    const mode = value as SpecDeviceMode;
    form.setValue(`${base}.deviceMode`, mode, { shouldDirty: true });
    // Reset giá trị không còn phù hợp với chế độ mới.
    form.setValue(`${base}.modelValue`, undefined, { shouldDirty: true });
    form.setValue(
      `${base}.allowedOptionIds`,
      mode === 'select' && isSelectDataType(def.dataType) ? [] : undefined,
      { shouldDirty: true },
    );
    form.setValue(
      `${base}.dynamicOptions`,
      mode === 'select' && def.dataType === 'dynamic_list' ? [] : undefined,
      { shouldDirty: true },
    );
  };

  return (
    <div className="rounded-admin-control border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{def.name}</span>
          <Badge variant="secondary" appearance="light">
            {SPEC_DATA_TYPE_LABELS[def.dataType]}
          </Badge>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Bỏ thông số"
          className="text-muted-foreground"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-4">
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            Chế độ ở thiết bị
          </Label>
          <Select value={deviceMode} onValueChange={handleModeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {SPEC_DEVICE_MODE_LABELS[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-8">
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            {deviceMode === 'select'
              ? 'Lựa chọn cho phép'
              : deviceMode === 'input'
                ? 'Thiết bị tự nhập'
                : 'Giá trị cố định'}
          </Label>
          {deviceMode === 'input' ? (
            <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-2 text-sm text-muted-foreground">
              Giá trị do thiết bị nhập khi tạo.
            </p>
          ) : deviceMode === 'select' ? (
            def.dataType === 'dynamic_list' ? (
              <DynamicOptionsEditor
                value={dynamicOptions}
                onChange={(options) =>
                  form.setValue(`${base}.dynamicOptions`, options, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            ) : (
              <AllowedOptionsEditor
                def={def}
                value={allowedOptionIds}
                onChange={(ids) =>
                  form.setValue(`${base}.allowedOptionIds`, ids, {
                    shouldDirty: true,
                  })
                }
              />
            )
          ) : (
            <FixedValueEditor
              def={def}
              value={modelValue}
              onChange={(val) =>
                form.setValue(`${base}.modelValue`, val, { shouldDirty: true })
              }
            />
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Switch
          checked={isRequired}
          onCheckedChange={(checked) =>
            form.setValue(`${base}.isRequired`, checked, { shouldDirty: true })
          }
        />
        <span className="text-sm text-foreground">Bắt buộc</span>
      </div>
    </div>
  );
}

function AllowedOptionsEditor({
  def,
  value,
  onChange,
}: {
  def: SpecDefinition;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string, checked: boolean) => {
    onChange(checked ? [...value, id] : value.filter((x) => x !== id));
  };
  return (
    <div className="flex flex-wrap gap-3 rounded-admin-control border border-border px-3 py-2">
      {(def.options ?? []).map((opt) => (
        <label
          key={opt.id}
          className="flex cursor-pointer items-center gap-1.5 text-sm"
        >
          <Checkbox
            checked={value.includes(opt.id)}
            onCheckedChange={(checked) => toggle(opt.id, checked === true)}
          />
          {opt.colorHex && (
            <span
              className="size-3 rounded-full border border-border"
              style={{ backgroundColor: opt.colorHex }}
            />
          )}
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function DynamicOptionsEditor({
  value,
  onChange,
}: {
  value: SpecOption[];
  onChange: (options: SpecOption[]) => void;
}) {
  const addOption = () => {
    const id = nextDynamicOptionId();
    onChange([...value, { id, label: '', value: id }]);
  };

  const updateOption = (
    index: number,
    patch: Partial<Pick<SpecOption, 'label' | 'value' | 'colorHex'>>,
  ) => {
    onChange(
      value.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              ...patch,
              value:
                patch.value ??
                (patch.label !== undefined
                  ? patch.label.trim().toLowerCase().replace(/\s+/g, '-')
                  : option.value),
            }
          : option,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-2 rounded-admin-control border border-border p-3">
      {value.length === 0 ? (
        <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-3 text-center text-sm text-muted-foreground">
          Chưa có lựa chọn riêng cho mẫu.
        </p>
      ) : (
        value.map((option, index) => (
          <div key={option.id} className="flex items-start gap-2">
            <Input
              variant="md"
              placeholder="Nhãn (vd: Xanh Titan)"
              value={option.label}
              onChange={(event) =>
                updateOption(index, { label: event.target.value })
              }
            />
            <Input
              variant="md"
              placeholder="Mã"
              value={option.value}
              onChange={(event) =>
                updateOption(index, { value: event.target.value })
              }
            />
            <Input
              type="color"
              aria-label="Màu hiển thị"
              className="h-9 w-12 shrink-0 p-1"
              value={option.colorHex ?? '#ffffff'}
              onChange={(event) =>
                updateOption(index, { colorHex: event.target.value })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Xóa lựa chọn"
              className="shrink-0 text-muted-foreground"
              onClick={() =>
                onChange(
                  value.filter((_, optionIndex) => optionIndex !== index),
                )
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))
      )}
      <Button type="button" variant="outline" size="sm" onClick={addOption}>
        <Plus className="size-3.5" />
        Thêm lựa chọn của mẫu
      </Button>
    </div>
  );
}

function FixedValueEditor({
  def,
  value,
  onChange,
}: {
  def: SpecDefinition;
  value: SpecValue | undefined;
  onChange: (value: SpecValue) => void;
}) {
  switch (def.dataType) {
    case 'number': {
      const amount = isNumberSpecValue(value) ? value.amount : undefined;
      return (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            variant="md"
            value={Number.isFinite(amount) ? String(amount) : ''}
            onChange={(e) =>
              onChange({ amount: Number(e.target.value), unit: def.unit })
            }
          />
          {def.unit && (
            <span className="text-sm text-muted-foreground">{def.unit}</span>
          )}
        </div>
      );
    }
    case 'boolean':
      return (
        <div className="flex h-9 items-center gap-2">
          <Switch
            checked={value === true}
            onCheckedChange={(checked) => onChange(checked)}
          />
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
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'single_select':
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn giá trị" />
          </SelectTrigger>
          <SelectContent>
            {(def.options ?? []).map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'multi_select': {
      const selected = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-3 rounded-admin-control border border-border px-3 py-2">
          {(def.options ?? []).map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-1.5 text-sm"
            >
              <Checkbox
                checked={selected.includes(opt.id)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked === true
                      ? [...selected, opt.id]
                      : selected.filter((x) => x !== opt.id),
                  )
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    }
    case 'dynamic_list':
      return (
        <Input
          variant="md"
          value={typeof value === 'string' ? value : ''}
          placeholder="Chọn chế độ select để khai báo danh sách riêng"
          onChange={(e) => onChange(e.target.value)}
        />
      );
    default:
      return (
        <Input
          variant="md"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
