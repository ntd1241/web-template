import { useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { isNumberSpecValue } from '../../lib/spec-value';
import {
  SPEC_DEVICE_MODE_LABELS,
  type SpecDeviceMode,
} from '../../model/material-model';
import {
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
  if (def.dataType === 'list' && def.allowDynamicValues) return ['select'];
  return def.dataType === 'list'
    ? ['fixed', 'input', 'select']
    : ['fixed', 'input'];
}

let dynamicOptionSeq = 0;
function nextDynamicOptionId(): string {
  dynamicOptionSeq += 1;
  return `dynamic-opt-${dynamicOptionSeq}`;
}

function cloneOptions(options: SpecOption[] | undefined): SpecOption[] {
  return (options ?? []).map((option) => ({ ...option }));
}

function cloneSpecValue(value: SpecValue | undefined): SpecValue | undefined {
  if (Array.isArray(value)) return [...value];
  if (typeof value === 'object' && value !== null) return { ...value };
  return value;
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
  const available = definitions.filter((d) => !usedIds.has(d.id));

  const handleAdd = (specDefinitionId: string) => {
    const def = defById.get(specDefinitionId);
    if (!def) return;
    const isList = def.dataType === 'list';
    const isDynamicList = isList && def.allowDynamicValues;
    append({
      specDefinitionId,
      deviceMode: isDynamicList ? 'select' : 'fixed',
      modelValue: isDynamicList ? undefined : cloneSpecValue(def.defaultValue),
      allowedOptionIds: isList && !isDynamicList ? [] : undefined,
      dynamicOptions: isDynamicList ? cloneOptions(def.options) : undefined,
      isRequired: false,
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col [&_[data-slot=table-wrapper]]:h-full [&_[data-slot=table-wrapper]]:min-h-0">
      <Table className="min-w-[1040px]">
        <TableHeader className="sticky top-0 z-20 bg-muted">
          <TableRow>
            <TableHead className="w-72">Thông số ({fields.length})</TableHead>
            <TableHead className="w-36">Kiểu</TableHead>
            <TableHead className="w-48">Chế độ thiết bị</TableHead>
            <TableHead>Giá trị / danh sách</TableHead>
            <TableHead className="w-28 text-center">Bắt buộc</TableHead>
            <TableHead className="sticky right-0 z-30 w-24 bg-muted text-center">
              Thao tác
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.length === 0 && (
            <TableRow>
              <TableCell
                className="px-4 py-6 text-center text-sm text-muted-foreground"
                colSpan={6}
              >
                Chưa gán thông số nào.
              </TableCell>
            </TableRow>
          )}
          {fields.map((field, index) => {
            const def = defById.get(specs[index]?.specDefinitionId);
            if (!def) return null;
            return (
              <ModelSpecTableRow
                key={field.id}
                form={form}
                index={index}
                def={def}
                onRemove={() => remove(index)}
              />
            );
          })}
          <AddSpecTableRow available={available} onAdd={handleAdd} />
        </TableBody>
      </Table>
    </div>
  );
}

function AddSpecTableRow({
  available,
  onAdd,
}: {
  available: SpecDefinition[];
  onAdd: (specDefinitionId: string) => void;
}) {
  return (
    <TableRow className="bg-admin-surface-alt/40 hover:bg-admin-surface-alt/60">
      <TableCell className="px-4 py-3" colSpan={6}>
        <Select value="" onValueChange={onAdd}>
          <SelectTrigger
            size="sm"
            className="w-full justify-start border-dashed bg-background text-muted-foreground md:w-72"
          >
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
      </TableCell>
    </TableRow>
  );
}

function ModelSpecTableRow({
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
  const [dynamicDialogOpen, setDynamicDialogOpen] = useState(false);
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
    form.setValue(
      `${base}.modelValue`,
      mode === 'select' ? undefined : cloneSpecValue(def.defaultValue),
      { shouldDirty: true },
    );
    form.setValue(
      `${base}.allowedOptionIds`,
      mode === 'select' && def.dataType === 'list' && !def.allowDynamicValues
        ? []
        : undefined,
      { shouldDirty: true },
    );
    form.setValue(
      `${base}.dynamicOptions`,
      mode === 'select' && def.dataType === 'list' && def.allowDynamicValues
        ? cloneOptions(def.options)
        : undefined,
      { shouldDirty: true },
    );
  };

  return (
    <>
      <TableRow>
        <TableCell className="px-4 py-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-medium text-foreground">
              {def.name}
            </span>
            <span className="truncate text-[11px] leading-4 text-muted-foreground">
              {def.code}
              {def.unit ? ` · ${def.unit}` : ''}
            </span>
          </div>
        </TableCell>
        <TableCell className="px-4 py-3">
          <Badge variant="secondary" appearance="light">
            {SPEC_DATA_TYPE_LABELS[def.dataType]}
          </Badge>
        </TableCell>
        <TableCell className="px-4 py-3">
          <Select value={deviceMode} onValueChange={handleModeChange}>
            <SelectTrigger size="sm">
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
        </TableCell>
        <TableCell className="px-4 py-3">
          <CompactValueEditor
            def={def}
            deviceMode={deviceMode}
            modelValue={modelValue}
            allowedOptionIds={allowedOptionIds}
            dynamicOptions={dynamicOptions}
            onAllowedOptionIdsChange={(ids) =>
              form.setValue(`${base}.allowedOptionIds`, ids, {
                shouldDirty: true,
              })
            }
            onModelValueChange={(val) =>
              form.setValue(`${base}.modelValue`, val, { shouldDirty: true })
            }
            onOpenDynamicDialog={() => setDynamicDialogOpen(true)}
          />
        </TableCell>
        <TableCell className="px-4 py-3 text-center">
          <Checkbox
            size="sm"
            checked={isRequired}
            aria-label={`Bắt buộc ${def.name}`}
            onCheckedChange={(checked) =>
              form.setValue(`${base}.isRequired`, checked === true, {
                shouldDirty: true,
              })
            }
          />
        </TableCell>
        <TableCell className="sticky right-0 bg-card px-3 py-3">
          <div className="flex items-center justify-center gap-1">
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
        </TableCell>
      </TableRow>
      {def.dataType === 'list' && def.allowDynamicValues && (
        <DynamicOptionsDialog
          def={def}
          open={dynamicDialogOpen}
          value={dynamicOptions}
          onOpenChange={setDynamicDialogOpen}
          onChange={(options) =>
            form.setValue(`${base}.dynamicOptions`, options, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      )}
    </>
  );
}

function CompactValueEditor({
  def,
  deviceMode,
  modelValue,
  allowedOptionIds,
  dynamicOptions,
  onModelValueChange,
  onAllowedOptionIdsChange,
  onOpenDynamicDialog,
}: {
  def: SpecDefinition;
  deviceMode: SpecDeviceMode;
  modelValue: SpecValue | undefined;
  allowedOptionIds: string[];
  dynamicOptions: SpecOption[];
  onModelValueChange: (value: SpecValue) => void;
  onAllowedOptionIdsChange: (ids: string[]) => void;
  onOpenDynamicDialog: () => void;
}) {
  if (deviceMode === 'input') {
    return (
      <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-2 text-sm text-muted-foreground">
        Thiết bị tự nhập khi tạo.
      </p>
    );
  }

  if (deviceMode === 'select') {
    if (def.dataType === 'list' && def.allowDynamicValues) {
      return (
        <Button
          type="button"
          variant="outline"
          className="h-7 w-full min-w-0 justify-start px-2.5 text-left text-xs font-normal"
          onClick={onOpenDynamicDialog}
        >
          <span className="min-w-0 truncate">
            {summarizeOptions(dynamicOptions, 'Chưa có lựa chọn riêng cho mẫu')}
          </span>
        </Button>
      );
    }

    if (def.dataType === 'list' && !def.allowMultiple) {
      return (
        <Select
          value={allowedOptionIds[0] ?? ''}
          onValueChange={(id) => onAllowedOptionIdsChange(id ? [id] : [])}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder="Chọn lựa chọn cho phép" />
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
    }

    if (def.dataType === 'list' && def.allowMultiple) {
      return (
        <SpecMultiSelect
          value={allowedOptionIds}
          options={def.options ?? []}
          placeholder="Chọn lựa chọn cho phép"
          onChange={onAllowedOptionIdsChange}
        />
      );
    }
  }

  return (
    <FixedValueEditor
      def={def}
      value={modelValue}
      onChange={onModelValueChange}
    />
  );
}

function DynamicOptionsDialog({
  def,
  open,
  value,
  onOpenChange,
  onChange,
}: {
  def: SpecDefinition;
  open: boolean;
  value: SpecOption[];
  onOpenChange: (open: boolean) => void;
  onChange: (options: SpecOption[]) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-5 py-4">
          <DialogTitle>{def.name}</DialogTitle>
          <DialogDescription>
            Khai báo danh sách lựa chọn riêng cho mẫu vật tư.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="min-h-0 overflow-y-auto px-5 pb-5">
          <DynamicOptionsEditor value={value} onChange={onChange} />
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

function SpecMultiSelect({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string[];
  options: SpecOption[];
  placeholder: string;
  onChange: (ids: string[]) => void;
}) {
  return (
    <MultiSelect
      value={value}
      options={options.map((option) => ({
        value: option.id,
        label: option.label,
        searchableText: `${option.label} ${option.value}`,
      }))}
      placeholder={placeholder}
      searchPlaceholder="Tìm lựa chọn..."
      emptyMessage="Không có lựa chọn"
      maxChips={2}
      className="h-7 text-xs"
      onChange={onChange}
    />
  );
}

function summarizeOptions(options: SpecOption[], emptyLabel: string): string {
  if (options.length === 0) return emptyLabel;
  return options.map((option) => option.label || option.value).join(', ');
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
            variant="sm"
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
          variant="sm"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'list': {
      if (def.allowMultiple) {
        const selected = Array.isArray(value) ? value : [];
        return (
          <SpecMultiSelect
            value={selected}
            options={def.options ?? []}
            placeholder="Chọn giá trị"
            onChange={onChange}
          />
        );
      }
      return (
        <Select
          value={typeof value === 'string' ? value : ''}
          onValueChange={onChange}
        >
          <SelectTrigger size="sm">
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
    }
    default:
      return (
        <Input
          variant="sm"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
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
    <div className="flex flex-col gap-2 rounded-admin-control border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">
          Lựa chọn riêng của mẫu
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="size-3.5" />
          Thêm lựa chọn
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-3 text-center text-sm text-muted-foreground">
          Chưa có lựa chọn riêng cho mẫu.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {value.map((option, index) => (
            <div
              key={option.id}
              className="grid grid-cols-[1fr_1fr_auto_auto] gap-2"
            >
              <Input
                variant="sm"
                placeholder="Mã"
                value={option.value}
                onChange={(event) =>
                  updateOption(index, { value: event.target.value })
                }
              />
              <Input
                variant="sm"
                placeholder="Nhãn (vd: Xanh Titan)"
                value={option.label}
                onChange={(event) =>
                  updateOption(index, { label: event.target.value })
                }
              />
              <Input
                type="color"
                variant="sm"
                aria-label="Màu hiển thị"
                className="h-7 w-10 shrink-0 p-1"
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
          ))}
        </div>
      )}
    </div>
  );
}
