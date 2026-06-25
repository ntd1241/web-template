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
  MATERIAL_MODEL_SPEC_SOURCE_LABELS,
  type CustomSpecDefinition,
} from '../../model/material-model';
import {
  SPEC_DATA_TYPE_LABELS,
  type SpecDataType,
  type SpecDefinition,
  type SpecOption,
  type SpecValue,
} from '../../model/spec-definition';
import type {
  MaterialModelFormValues,
  ModelSpecFormValue,
} from '../material-model.schema';

interface ModelSpecEditorProps {
  form: UseFormReturn<MaterialModelFormValues>;
  definitions: SpecDefinition[];
}

let dynamicOptionSeq = 0;
let customSpecSeq = 0;

function nextDynamicOptionId(): string {
  dynamicOptionSeq += 1;
  return `dynamic-opt-${dynamicOptionSeq}`;
}

function nextCustomSpecId(): string {
  customSpecSeq += 1;
  return `custom-spec-${customSpecSeq}`;
}

function cloneOptions(options: SpecOption[] | undefined): SpecOption[] {
  return (options ?? []).map((option) => ({ ...option }));
}

function cloneSpecValue(value: SpecValue | undefined): SpecValue | undefined {
  if (Array.isArray(value)) return [...value];
  if (typeof value === 'object' && value !== null) return { ...value };
  return value;
}

function definitionForSpec(
  spec: ModelSpecFormValue,
  defById: Map<string, SpecDefinition>,
): SpecDefinition | undefined {
  if (spec.source === 'custom' && spec.customDefinition) {
    return {
      id: spec.id,
      ...spec.customDefinition,
      allowModelOverride: true,
    };
  }
  return spec.specDefinitionId ? defById.get(spec.specDefinitionId) : undefined;
}

function optionsForSpec(
  spec: ModelSpecFormValue,
  def: SpecDefinition,
): SpecOption[] {
  return spec.allowedOptions ?? def.options ?? [];
}

function canOverrideSpec(spec: ModelSpecFormValue, def: SpecDefinition) {
  return spec.source === 'custom' || def.allowModelOverride;
}

function makeCatalogSpec(def: SpecDefinition): ModelSpecFormValue {
  return {
    id: def.id,
    source: 'catalog',
    specDefinitionId: def.id,
    materialValueMode: 'locked',
    defaultValue: cloneSpecValue(def.defaultValue),
    allowedOptions:
      def.dataType === 'list' && def.allowDynamicValues
        ? cloneOptions(def.options)
        : undefined,
    isRequired: false,
  };
}

function makeCustomDefinition(): CustomSpecDefinition {
  return {
    code: 'TS-RIENG',
    name: 'Thông số riêng',
    dataType: 'text',
    allowMultiple: false,
    allowDynamicValues: true,
    defaultValue: '',
  };
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

  const usedCatalogIds = new Set(
    specs
      .filter((spec) => spec.source === 'catalog')
      .map((spec) => spec.specDefinitionId),
  );
  const available = definitions.filter((d) => !usedCatalogIds.has(d.id));

  const handleAddCatalog = (specDefinitionId: string) => {
    const def = defById.get(specDefinitionId);
    if (def) append(makeCatalogSpec(def));
  };

  const handleAddCustom = () => {
    const id = nextCustomSpecId();
    append({
      id,
      source: 'custom',
      customDefinition: makeCustomDefinition(),
      materialValueMode: 'locked',
      defaultValue: '',
      isRequired: false,
    });
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col [&_[data-slot=table-wrapper]]:h-full [&_[data-slot=table-wrapper]]:min-h-0">
      <Table className="min-w-[1080px]">
        <TableHeader className="sticky top-0 z-20 bg-muted">
          <TableRow>
            <TableHead className="w-80">Thông số ({fields.length})</TableHead>
            <TableHead>Giá trị mặc định / danh sách</TableHead>
            <TableHead className="w-36 text-center">
              Vật tư nhập riêng
            </TableHead>
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
                colSpan={5}
              >
                Chưa gán thông số nào.
              </TableCell>
            </TableRow>
          )}
          {fields.map((field, index) => {
            const spec = specs[index];
            const def = definitionForSpec(spec, defById);
            if (!def) return null;
            return (
              <ModelSpecTableRow
                key={field.id}
                form={form}
                index={index}
                spec={spec}
                def={def}
                onRemove={() => remove(index)}
              />
            );
          })}
          <AddSpecTableRow
            available={available}
            onAddCatalog={handleAddCatalog}
            onAddCustom={handleAddCustom}
          />
        </TableBody>
      </Table>
    </div>
  );
}

function AddSpecTableRow({
  available,
  onAddCatalog,
  onAddCustom,
}: {
  available: SpecDefinition[];
  onAddCatalog: (specDefinitionId: string) => void;
  onAddCustom: () => void;
}) {
  return (
    <TableRow className="bg-admin-surface-alt/40 hover:bg-admin-surface-alt/60">
      <TableCell className="px-4 py-3" colSpan={5}>
        <div className="flex flex-wrap gap-2">
          <Select value="" onValueChange={onAddCatalog}>
            <SelectTrigger
              size="sm"
              className="w-full justify-start border-dashed bg-background text-muted-foreground md:w-72"
            >
              <span className="flex items-center gap-1.5 text-sm">
                <Plus className="size-3.5" />
                Thêm từ danh mục
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddCustom}
          >
            <Plus className="size-3.5" />
            Thêm thông số riêng
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ModelSpecTableRow({
  form,
  index,
  spec,
  def,
  onRemove,
}: {
  form: UseFormReturn<MaterialModelFormValues>;
  index: number;
  spec: ModelSpecFormValue;
  def: SpecDefinition;
  onRemove: () => void;
}) {
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  const base = `specs.${index}` as const;
  const isRequired = form.watch(`${base}.isRequired`);
  const materialValueMode = form.watch(`${base}.materialValueMode`);
  const defaultValue = form.watch(`${base}.defaultValue`);
  const allowedOptions = optionsForSpec(spec, def);
  const canOverride = canOverrideSpec(spec, def);
  const isCustom = spec.source === 'custom';

  const handleDataTypeChange = (dataType: SpecDataType) => {
    form.setValue(`${base}.customDefinition.dataType`, dataType, {
      shouldDirty: true,
    });
    form.setValue(`${base}.defaultValue`, dataType === 'boolean' ? false : '', {
      shouldDirty: true,
    });
    form.setValue(`${base}.allowedOptions`, undefined, { shouldDirty: true });
  };

  return (
    <>
      <TableRow>
        <TableCell className="px-4 py-3 align-top">
          {isCustom ? (
            <CustomDefinitionEditor
              form={form}
              base={base}
              def={def}
              onDataTypeChange={handleDataTypeChange}
            />
          ) : (
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate font-medium text-foreground">
                {def.name}
              </span>
              <span className="truncate text-[11px] leading-4 text-muted-foreground">
                {def.code}
                {def.unit ? ` · ${def.unit}` : ''}
                {` · ${SPEC_DATA_TYPE_LABELS[def.dataType]}`}
              </span>
              <Badge variant="secondary" appearance="light" className="w-fit">
                {MATERIAL_MODEL_SPEC_SOURCE_LABELS[spec.source]}
              </Badge>
            </div>
          )}
        </TableCell>
        <TableCell className="px-4 py-3 align-top">
          <ModelDefaultValueEditor
            def={def}
            value={defaultValue}
            options={allowedOptions}
            disabled={!canOverride}
            onChange={(val) =>
              form.setValue(`${base}.defaultValue`, val, {
                shouldDirty: true,
              })
            }
            onOpenOptionsDialog={() => setOptionsDialogOpen(true)}
          />
        </TableCell>
        <TableCell className="px-4 py-3 text-center align-top">
          <Checkbox
            size="sm"
            checked={materialValueMode === 'editable'}
            aria-label={`Vật tư nhập riêng ${def.name}`}
            onCheckedChange={(checked) =>
              form.setValue(
                `${base}.materialValueMode`,
                checked === true ? 'editable' : 'locked',
                { shouldDirty: true },
              )
            }
          />
        </TableCell>
        <TableCell className="px-4 py-3 text-center align-top">
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
        <TableCell className="sticky right-0 bg-card px-3 py-3 align-top">
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
      {def.dataType === 'list' && canOverride && (
        <OptionsDialog
          def={def}
          open={optionsDialogOpen}
          value={allowedOptions}
          onOpenChange={setOptionsDialogOpen}
          onChange={(options) =>
            form.setValue(`${base}.allowedOptions`, options, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />
      )}
    </>
  );
}

function CustomDefinitionEditor({
  form,
  base,
  def,
  onDataTypeChange,
}: {
  form: UseFormReturn<MaterialModelFormValues>;
  base: `specs.${number}`;
  def: SpecDefinition;
  onDataTypeChange: (dataType: SpecDataType) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <Input
          variant="sm"
          value={def.name}
          onChange={(event) =>
            form.setValue(`${base}.customDefinition.name`, event.target.value, {
              shouldDirty: true,
            })
          }
        />
        <Input
          variant="sm"
          value={def.code}
          onChange={(event) =>
            form.setValue(`${base}.customDefinition.code`, event.target.value, {
              shouldDirty: true,
            })
          }
        />
      </div>
      <div className="grid grid-cols-[1fr_6.5rem] gap-2">
        <Select value={def.dataType} onValueChange={onDataTypeChange}>
          <SelectTrigger size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SPEC_DATA_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          variant="sm"
          placeholder="Đơn vị"
          disabled={def.dataType !== 'number'}
          value={def.unit ?? ''}
          onChange={(event) =>
            form.setValue(`${base}.customDefinition.unit`, event.target.value, {
              shouldDirty: true,
            })
          }
        />
      </div>
      <Badge variant="secondary" appearance="light" className="w-fit">
        {MATERIAL_MODEL_SPEC_SOURCE_LABELS.custom}
      </Badge>
    </div>
  );
}

function ModelDefaultValueEditor({
  def,
  value,
  options,
  disabled,
  onChange,
  onOpenOptionsDialog,
}: {
  def: SpecDefinition;
  value: SpecValue | undefined;
  options: SpecOption[];
  disabled: boolean;
  onChange: (value: SpecValue) => void;
  onOpenOptionsDialog: () => void;
}) {
  if (disabled) {
    return (
      <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-2 text-sm text-muted-foreground">
        Theo mặc định từ danh mục.
      </p>
    );
  }

  if (def.dataType === 'list') {
    return (
      <div className="grid gap-2">
        <FixedValueEditor
          def={{ ...def, options }}
          value={value}
          onChange={onChange}
        />
        <Button
          type="button"
          variant="outline"
          className="h-7 w-full min-w-0 justify-start px-2.5 text-left text-xs font-normal"
          onClick={onOpenOptionsDialog}
        >
          <span className="min-w-0 truncate">
            {summarizeOptions(options, 'Chưa có lựa chọn cho mẫu')}
          </span>
        </Button>
      </div>
    );
  }

  return <FixedValueEditor def={def} value={value} onChange={onChange} />;
}

function OptionsDialog({
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
            Khai báo danh sách lựa chọn dùng riêng cho mẫu vật tư.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="min-h-0 overflow-y-auto px-5 pb-5">
          <OptionsEditor value={value} onChange={onChange} />
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
        return (
          <SpecMultiSelect
            value={Array.isArray(value) ? value : []}
            options={def.options ?? []}
            placeholder="Chọn giá trị mặc định"
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
            <SelectValue placeholder="Chọn giá trị mặc định" />
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

function OptionsEditor({
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
          Lựa chọn của mẫu
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="size-3.5" />
          Thêm lựa chọn
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-3 text-center text-sm text-muted-foreground">
          Chưa có lựa chọn cho mẫu.
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
