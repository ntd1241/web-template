import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  resolveEffectiveLabel,
  resolveEffectiveOptions,
  resolveEffectiveSelectionMode,
  resolveEffectiveValueSet,
} from '../../lib/resolve-effective-specs';
import { isNumberSpecValue } from '../../lib/spec-value';
import {
  MATERIAL_MODEL_SPEC_SOURCE_LABELS,
  type CustomSpecDefinition,
} from '../../model/material-model';
import {
  LIST_SELECTION_MODE_LABELS,
  SPEC_DATA_TYPE_LABELS,
  type ListSelectionMode,
  type SpecDataType,
  type SpecDefinition,
  type SpecOption,
  type SpecValue,
} from '../../model/spec-definition';
import type { SpecValueSet } from '../../model/spec-value-set';
import type {
  MaterialModelFormValues,
  ModelSpecFormValue,
} from '../material-model.schema';

interface ModelSpecEditorProps {
  form: UseFormReturn<MaterialModelFormValues>;
  definitions: SpecDefinition[];
  valueSets: SpecValueSet[];
}

let catalogSpecSeq = 0;
let customSpecSeq = 0;
let customOptionSeq = 0;

function nextCatalogSpecId(specDefinitionId: string): string {
  catalogSpecSeq += 1;
  return `${specDefinitionId}-${catalogSpecSeq}`;
}

function nextCustomSpecId(): string {
  customSpecSeq += 1;
  return `custom-spec-${customSpecSeq}`;
}

function nextCustomOptionId(): string {
  customOptionSeq += 1;
  return `custom-option-${customOptionSeq}`;
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
      code: spec.customDefinition.code,
      name: spec.customDefinition.name,
      dataType: spec.customDefinition.dataType,
      unit: spec.customDefinition.unit,
      defaultSelectionMode: spec.customDefinition.defaultSelectionMode,
      allowModelSelectionOverride: true,
      allowModelValueSetOverride: true,
      defaultValue: spec.customDefinition.defaultValue,
      description: spec.customDefinition.description,
    };
  }
  return spec.specDefinitionId ? defById.get(spec.specDefinitionId) : undefined;
}

function makeCatalogSpec(def: SpecDefinition): ModelSpecFormValue {
  return {
    id: nextCatalogSpecId(def.id),
    source: 'catalog',
    specDefinitionId: def.id,
    optionSource: def.dataType === 'list' ? { mode: 'inherit' } : undefined,
    materialValueMode: 'locked',
    defaultValue: cloneSpecValue(def.defaultValue),
    isRequired: false,
  };
}

function makeCustomDefinition(): CustomSpecDefinition {
  return {
    code: 'TS-RIENG',
    name: 'Thông số riêng',
    dataType: 'text',
    defaultSelectionMode: 'single',
    defaultValue: '',
  };
}

export function ModelSpecEditor({
  form,
  definitions,
  valueSets,
}: ModelSpecEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'specs',
  });
  const specs = form.watch('specs');
  const [openSpecId, setOpenSpecId] = useState<string | null>(null);
  const defById = useMemo(
    () => new Map(definitions.map((definition) => [definition.id, definition])),
    [definitions],
  );

  const handleAddCatalog = (specDefinitionId: string) => {
    const def = defById.get(specDefinitionId);
    if (!def) return;
    const next = makeCatalogSpec(def);
    append(next);
    setOpenSpecId(next.id);
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
    setOpenSpecId(id);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-5">
      <div className="grid shrink-0 grid-cols-1 gap-2 xl:grid-cols-[18rem_auto_auto]">
        <Select value="" onValueChange={handleAddCatalog}>
          <SelectTrigger
            size="sm"
            className="justify-start border-dashed bg-background text-muted-foreground"
          >
            <span className="flex items-center gap-1.5 text-sm">
              <Plus className="size-3.5" />
              Thêm từ danh mục
            </span>
          </SelectTrigger>
          <SelectContent>
            {definitions.map((definition) => (
              <SelectItem key={definition.id} value={definition.id}>
                {definition.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="justify-start"
          onClick={handleAddCustom}
        >
          <Plus className="size-3.5" />
          Thêm thông số riêng
        </Button>
        <div className="text-xs text-muted-foreground xl:self-center xl:text-right">
          Có thể thêm cùng một thông số nhiều lần; khi lặp, nhập partKey riêng.
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_15rem] px-3 text-xs font-medium uppercase text-secondary-foreground">
        <div>Thông số</div>
        <div>Nguồn giá trị</div>
        <div className="text-right">Cờ + cấu hình</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-admin-control border border-border">
        {fields.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Chưa gán thông số nào.
          </p>
        ) : (
          fields.map((field, index) => {
            const spec = specs[index];
            const def = definitionForSpec(spec, defById);
            if (!def) return null;
            return (
              <ModelSpecListRow
                key={field.id}
                form={form}
                index={index}
                spec={spec}
                def={def}
                valueSets={valueSets}
                open={openSpecId === spec.id}
                onOpenChange={(open) => setOpenSpecId(open ? spec.id : null)}
                onRemove={() => remove(index)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function ModelSpecListRow({
  form,
  index,
  spec,
  def,
  valueSets,
  open,
  onOpenChange,
  onRemove,
}: {
  form: UseFormReturn<MaterialModelFormValues>;
  index: number;
  spec: ModelSpecFormValue;
  def: SpecDefinition;
  valueSets: SpecValueSet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemove: () => void;
}) {
  const base = `specs.${index}` as const;
  const isRequired = form.watch(`${base}.isRequired`);
  const materialValueMode = form.watch(`${base}.materialValueMode`);
  const label = resolveEffectiveLabel(spec, def);
  const options = resolveEffectiveOptions(spec, def, valueSets) ?? [];
  const selectionMode = resolveEffectiveSelectionMode(spec, def);
  const valueSet = resolveEffectiveValueSet(spec, def, valueSets);
  const sourceSummary =
    def.dataType === 'list'
      ? `${valueSet?.name ?? 'Chưa chọn value set'} · ${options.length} lựa chọn · ${
          selectionMode ? LIST_SELECTION_MODE_LABELS[selectionMode] : '—'
        }`
      : `${SPEC_DATA_TYPE_LABELS[def.dataType]}${def.unit ? ` · ${def.unit}` : ''}`;

  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_15rem] items-center gap-3 border-b border-border px-3 py-2 last:border-b-0">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {label}
          </span>
          <Badge variant="secondary" appearance="light">
            {MATERIAL_MODEL_SPEC_SOURCE_LABELS[spec.source]}
          </Badge>
        </div>
        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">{def.name}</span>
          {spec.partKey && (
            <Badge variant="secondary" appearance="light">
              {spec.partKey}
            </Badge>
          )}
        </div>
      </div>
      <div className="min-w-0 truncate text-sm text-muted-foreground">
        {sourceSummary}
      </div>
      <div className="flex items-center justify-end gap-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Checkbox
            size="sm"
            checked={materialValueMode === 'editable'}
            aria-label={`Vật tư nhập riêng ${label}`}
            onCheckedChange={(checked) =>
              form.setValue(
                `${base}.materialValueMode`,
                checked === true ? 'editable' : 'locked',
                { shouldDirty: true },
              )
            }
          />
          Vật tư nhập riêng
        </label>
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Checkbox
            size="sm"
            checked={isRequired}
            aria-label={`Bắt buộc ${label}`}
            onCheckedChange={(checked) =>
              form.setValue(`${base}.isRequired`, checked === true, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
          Bắt buộc
        </label>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Cấu hình ${label}`}
          onClick={() => onOpenChange(true)}
        >
          <Settings className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Bỏ ${label}`}
          className="text-muted-foreground"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <ModelSpecSheet
        form={form}
        base={base}
        spec={spec}
        def={def}
        valueSets={valueSets}
        open={open}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}

function ModelSpecSheet({
  form,
  base,
  spec,
  def,
  valueSets,
  open,
  onOpenChange,
}: {
  form: UseFormReturn<MaterialModelFormValues>;
  base: `specs.${number}`;
  spec: ModelSpecFormValue;
  def: SpecDefinition;
  valueSets: SpecValueSet[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const label = resolveEffectiveLabel(spec, def);
  const selectionMode = resolveEffectiveSelectionMode(spec, def);
  const valueSet = resolveEffectiveValueSet(spec, def, valueSets);
  const options = resolveEffectiveOptions(spec, def, valueSets) ?? [];
  const defaultValue = form.watch(`${base}.defaultValue`);
  const isCatalog = spec.source === 'catalog';
  const canConfigureValueSet = isCatalog && def.allowModelValueSetOverride;
  const subsetIds =
    spec.optionSource?.mode === 'subset' ? spec.optionSource.optionIds : [];

  const handleDataTypeChange = (dataType: SpecDataType) => {
    form.setValue(`${base}.customDefinition.dataType`, dataType, {
      shouldDirty: true,
    });
    form.setValue(`${base}.customDefinition.defaultSelectionMode`, 'single', {
      shouldDirty: true,
    });
    form.setValue(`${base}.defaultValue`, dataType === 'boolean' ? false : '', {
      shouldDirty: true,
    });
  };

  const handleSelectionModeChange = (mode: ListSelectionMode) => {
    form.setValue(`${base}.selectionModeOverride`, mode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(`${base}.defaultValue`, mode === 'multi' ? [] : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleValueSetChange = (valueSetId: string) => {
    form.setValue(
      `${base}.valueSetIdOverride`,
      valueSetId === '__default__' ? undefined : valueSetId,
      { shouldDirty: true, shouldValidate: true },
    );
    form.setValue(
      `${base}.optionSource`,
      { mode: 'inherit' },
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.setValue(`${base}.defaultValue`, selectionMode === 'multi' ? [] : '', {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSubsetToggle = (optionId: string, checked: boolean) => {
    const nextIds = checked
      ? [...subsetIds, optionId]
      : subsetIds.filter((id) => id !== optionId);
    form.setValue(
      `${base}.optionSource`,
      nextIds.length === 0
        ? { mode: 'inherit' }
        : { mode: 'subset', optionIds: nextIds },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden p-0 sm:max-w-xl">
        <SheetHeader className="shrink-0 border-b border-border px-5 py-4">
          <SheetTitle>{label}</SheetTitle>
          <SheetDescription>
            Cấu hình thông số trong phạm vi mẫu vật tư.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-4">
            {spec.source === 'custom' ? (
              <CustomDefinitionEditor
                form={form}
                base={base}
                def={def}
                onDataTypeChange={handleDataTypeChange}
              />
            ) : (
              <ReadOnlyDefinitionSummary def={def} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <FieldBlock label="Nhãn hiển thị">
                <Input
                  variant="sm"
                  placeholder={def.name}
                  value={spec.labelOverride ?? ''}
                  onChange={(event) =>
                    form.setValue(
                      `${base}.labelOverride`,
                      event.target.value || undefined,
                      { shouldDirty: true },
                    )
                  }
                />
              </FieldBlock>
              <FieldBlock label="partKey">
                <Input
                  variant="sm"
                  placeholder="vd: glass"
                  value={spec.partKey ?? ''}
                  onChange={(event) =>
                    form.setValue(
                      `${base}.partKey`,
                      event.target.value || undefined,
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                />
              </FieldBlock>
            </div>

            {def.dataType === 'list' && def.allowModelSelectionOverride && (
              <FieldBlock label="Chế độ chọn">
                <Select
                  value={selectionMode ?? 'single'}
                  onValueChange={handleSelectionModeChange}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Chọn 1</SelectItem>
                    <SelectItem value="multi">Chọn nhiều</SelectItem>
                  </SelectContent>
                </Select>
              </FieldBlock>
            )}

            {def.dataType === 'list' && canConfigureValueSet && (
              <FieldBlock label="Nguồn giá trị">
                <Select
                  value={spec.valueSetIdOverride ?? '__default__'}
                  onValueChange={handleValueSetChange}
                >
                  <SelectTrigger size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__default__">
                      Mặc định từ danh mục
                    </SelectItem>
                    {valueSets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldBlock>
            )}

            {def.dataType === 'list' && canConfigureValueSet && valueSet && (
              <FieldBlock label="Subset lựa chọn">
                <div className="flex flex-wrap gap-2">
                  {valueSet.options.map((option) => {
                    const isChecked =
                      spec.optionSource?.mode !== 'subset' ||
                      subsetIds.includes(option.id);
                    return (
                      <Button
                        key={option.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="inline-flex h-7 items-center gap-1.5 rounded-admin-control border border-border px-2 text-xs data-[checked=true]:border-primary data-[checked=true]:bg-primary/10 data-[checked=true]:text-primary"
                        data-checked={isChecked}
                        onClick={() =>
                          handleSubsetToggle(
                            option.id,
                            !subsetIds.includes(option.id),
                          )
                        }
                      >
                        {option.colorHex && (
                          <span
                            className="size-2.5 rounded-full border border-border"
                            style={{ backgroundColor: option.colorHex }}
                          />
                        )}
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </FieldBlock>
            )}

            {spec.source === 'custom' && def.dataType === 'list' && (
              <CustomOptionsEditor
                value={spec.customDefinition?.options ?? []}
                onChange={(nextOptions) =>
                  form.setValue(
                    `${base}.customDefinition.options`,
                    nextOptions,
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }
              />
            )}

            <FieldBlock label="Giá trị mặc định">
              <FixedValueEditor
                def={def}
                value={defaultValue}
                options={options}
                selectionMode={selectionMode}
                onChange={(value) =>
                  form.setValue(`${base}.defaultValue`, value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </FieldBlock>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ReadOnlyDefinitionSummary({ def }: { def: SpecDefinition }) {
  return (
    <div className="rounded-admin-control border border-border bg-admin-surface-alt px-3 py-2 text-sm">
      <div className="font-medium text-foreground">{def.name}</div>
      <div className="mt-1 text-xs text-muted-foreground">
        {def.code} · {SPEC_DATA_TYPE_LABELS[def.dataType]}
        {def.unit ? ` · ${def.unit}` : ''}
      </div>
    </div>
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
    <div className="grid gap-3 rounded-admin-control border border-border p-3">
      <div className="grid grid-cols-2 gap-3">
        <FieldBlock label="Tên thông số">
          <Input
            variant="sm"
            value={def.name}
            onChange={(event) =>
              form.setValue(
                `${base}.customDefinition.name`,
                event.target.value,
                {
                  shouldDirty: true,
                },
              )
            }
          />
        </FieldBlock>
        <FieldBlock label="Mã">
          <Input
            variant="sm"
            value={def.code}
            onChange={(event) =>
              form.setValue(
                `${base}.customDefinition.code`,
                event.target.value,
                {
                  shouldDirty: true,
                },
              )
            }
          />
        </FieldBlock>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldBlock label="Kiểu dữ liệu">
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
        </FieldBlock>
        <FieldBlock label="Đơn vị">
          <Input
            variant="sm"
            placeholder="vd: kg"
            disabled={def.dataType !== 'number'}
            value={def.unit ?? ''}
            onChange={(event) =>
              form.setValue(
                `${base}.customDefinition.unit`,
                event.target.value,
                {
                  shouldDirty: true,
                },
              )
            }
          />
        </FieldBlock>
      </div>
    </div>
  );
}

function FixedValueEditor({
  def,
  value,
  options,
  selectionMode,
  onChange,
}: {
  def: SpecDefinition;
  value: SpecValue | undefined;
  options: SpecOption[];
  selectionMode: ListSelectionMode | undefined;
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
            onChange={(event) =>
              onChange({ amount: Number(event.target.value), unit: def.unit })
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
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case 'list':
      if (selectionMode === 'multi') {
        return (
          <MultiSelect
            value={Array.isArray(value) ? value : []}
            options={options.map((option) => ({
              value: option.id,
              label: option.label,
              searchableText: `${option.label} ${option.value}`,
            }))}
            placeholder="Chọn giá trị mặc định"
            searchPlaceholder="Tìm lựa chọn..."
            emptyMessage="Không có lựa chọn"
            maxChips={3}
            className="h-8"
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
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    default:
      return (
        <Input
          variant="sm"
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

function CustomOptionsEditor({
  value,
  onChange,
}: {
  value: SpecOption[];
  onChange: (options: SpecOption[]) => void;
}) {
  const handleAdd = () => {
    const id = nextCustomOptionId();
    onChange([...value, { id, label: '', value: id }]);
  };

  const handleChange = (
    index: number,
    patch: Partial<Pick<SpecOption, 'label' | 'value' | 'colorHex'>>,
  ) => {
    onChange(
      value.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    );
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Lựa chọn riêng
        </span>
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          <Plus className="size-3.5" />
          Thêm
        </Button>
      </div>
      {value.length === 0 ? (
        <p className="rounded-admin-control border border-dashed border-border bg-admin-surface-alt px-3 py-3 text-center text-sm text-muted-foreground">
          Chưa có lựa chọn riêng.
        </p>
      ) : (
        <div className="grid gap-2">
          {value.map((option, index) => (
            <div
              key={option.id}
              className="grid grid-cols-[1fr_1fr_auto] gap-2"
            >
              <Input
                variant="sm"
                placeholder="Mã"
                value={option.value}
                onChange={(event) =>
                  handleChange(index, { value: event.target.value })
                }
              />
              <Input
                variant="sm"
                placeholder="Nhãn"
                value={option.label}
                onChange={(event) =>
                  handleChange(index, { label: event.target.value })
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Xóa lựa chọn"
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
