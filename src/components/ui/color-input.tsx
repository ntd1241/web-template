import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, type inputVariants } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ColorPreset {
  value: string;
  label: string;
  group?: string;
}

const DEFAULT_SYSTEM_PRESETS: readonly ColorPreset[] = [
  { value: '#f44336', label: 'Đỏ', group: 'Màu hệ thống' },
  { value: '#e91e63', label: 'Hồng', group: 'Màu hệ thống' },
  { value: '#9c27b0', label: 'Tím đậm', group: 'Màu hệ thống' },
  { value: '#673ab7', label: 'Tím xanh', group: 'Màu hệ thống' },
  { value: '#3f51b5', label: 'Chàm', group: 'Màu hệ thống' },
  { value: '#2196f3', label: 'Xanh biển', group: 'Màu hệ thống' },
  { value: '#03a9f4', label: 'Xanh da trời', group: 'Màu hệ thống' },
  { value: '#00bcd4', label: 'Xanh ngọc', group: 'Màu hệ thống' },
  { value: '#009688', label: 'Xanh teal', group: 'Màu hệ thống' },
  { value: '#4caf50', label: 'Xanh lá', group: 'Màu hệ thống' },
  { value: '#8bc34a', label: 'Xanh mạ', group: 'Màu hệ thống' },
  { value: '#ffeb3b', label: 'Vàng sáng', group: 'Màu hệ thống' },
  { value: '#ff9800', label: 'Cam sáng', group: 'Màu hệ thống' },
  { value: '#795548', label: 'Nâu', group: 'Màu hệ thống' },
  { value: '#607d8b', label: 'Xanh xám', group: 'Màu hệ thống' },
  { value: '#9e9e9e', label: 'Xám chuẩn', group: 'Màu hệ thống' },
];

export const DEFAULT_COLOR_PRESETS: readonly ColorPreset[] =
  DEFAULT_SYSTEM_PRESETS;

const DEFAULT_COLOR = '#1677ff';

function normalizeHexColor(
  value: string | undefined | null,
): string | undefined {
  if (!value) return undefined;

  const withHash = value.trim().startsWith('#')
    ? value.trim()
    : `#${value.trim()}`;
  const match = withHash.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return undefined;

  const hex = match[1].toLowerCase();
  return hex.length === 3
    ? `#${hex
        .split('')
        .map((character) => `${character}${character}`)
        .join('')}`
    : `#${hex}`;
}

export interface ColorInputProps
  extends
    Omit<
      React.ComponentProps<typeof Input>,
      'type' | 'value' | 'defaultValue' | 'onChange'
    >,
    VariantProps<typeof inputVariants> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  presets?: readonly ColorPreset[];
  pickerLabel?: string;
  expanded?: boolean;
}

export function ColorInput({
  value,
  defaultValue = DEFAULT_COLOR,
  onValueChange,
  presets = DEFAULT_COLOR_PRESETS,
  pickerLabel = 'Mở bảng chọn màu',
  expanded = false,
  variant,
  className,
  disabled,
  placeholder = '#1677ff',
  onBlur,
  onKeyDown,
  ...inputProps
}: ColorInputProps) {
  const pickerId = React.useId();
  const { id: triggerId, ...textInputProps } = inputProps;
  const initialColor =
    normalizeHexColor(value ?? defaultValue) ?? DEFAULT_COLOR;
  const [internalColor, setInternalColor] = React.useState(initialColor);
  const [draftValue, setDraftValue] = React.useState(initialColor);
  const selectedColor = normalizeHexColor(value) ?? internalColor;

  React.useEffect(() => {
    if (value === undefined) return;

    const nextColor = normalizeHexColor(value);
    if (nextColor) {
      setInternalColor(nextColor);
      setDraftValue(nextColor);
    }
  }, [value]);

  const commitColor = (nextValue: string) => {
    const nextColor = normalizeHexColor(nextValue);
    if (!nextColor || disabled) return;

    setInternalColor(nextColor);
    setDraftValue(nextColor);
    onValueChange?.(nextColor);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setDraftValue(nextValue);

    // Wait for a full six-digit value while typing so `#fff` is not
    // normalized too early and the user's next keystroke is lost.
    if (/^#?[0-9a-f]{6}$/i.test(nextValue.trim())) {
      commitColor(nextValue);
    }
  };

  const handleTextBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const nextColor = normalizeHexColor(draftValue);
    if (nextColor && nextColor !== selectedColor) {
      commitColor(nextColor);
    } else {
      setDraftValue(selectedColor);
    }
    onBlur?.(event);
  };

  const handleTextKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitColor(draftValue);
    }

    onKeyDown?.(event);
  };

  const groupedPresets = React.useMemo(() => {
    const groups = new Map<string, ColorPreset[]>();

    presets.forEach((preset) => {
      const group = preset.group ?? 'Màu có sẵn';
      groups.set(group, [...(groups.get(group) ?? []), preset]);
    });

    return [...groups.entries()];
  }, [presets]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={triggerId}
          data-color-input-trigger="true"
          variant="outline"
          mode={expanded ? 'input' : 'icon'}
          size={variant ?? 'md'}
          aria-label={pickerLabel}
          disabled={disabled}
          className={cn(
            expanded
              ? 'relative w-full justify-start overflow-hidden p-1'
              : 'p-1',
            className,
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'rounded-sm border border-black/10 shadow-inner',
              expanded ? 'absolute inset-1 rounded-sm' : 'size-full',
            )}
            style={{ backgroundColor: selectedColor }}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="max-h-[min(34rem,calc(100vh-2rem))] w-[18rem] overflow-y-auto p-3"
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-foreground">Chọn màu</p>
          <code className="rounded bg-muted px-1.5 py-0.5 text-[0.6875rem] font-medium uppercase text-muted-foreground">
            {selectedColor}
          </code>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <label
            htmlFor={pickerId}
            className="relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background p-1 transition-colors hover:bg-background"
            title="Mở colorwheel"
          >
            <span
              aria-hidden="true"
              className="size-full rounded-sm border border-black/10 shadow-inner"
              style={{ backgroundColor: selectedColor }}
            />
          </label>
          <Input
            {...textInputProps}
            type="text"
            variant={variant}
            value={draftValue}
            disabled={disabled}
            aria-label={textInputProps['aria-label'] ?? 'Mã màu HEX'}
            placeholder={placeholder}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
          />
          <input
            id={pickerId}
            type="color"
            value={selectedColor}
            disabled={disabled}
            aria-label="Màu tùy chỉnh"
            className="absolute size-px opacity-0"
            onChange={(event) => commitColor(event.target.value)}
          />
        </div>

        <div className="mt-3 space-y-3">
          {groupedPresets.map(([group, groupPresets]) => (
            <section key={group} aria-label={group}>
              <h3 className="mb-1.5 text-[0.6875rem] font-medium text-muted-foreground">
                {group}
              </h3>
              <div
                className="grid grid-cols-8 gap-1.5"
                role="group"
                aria-label={group}
              >
                {groupPresets.map((preset) => {
                  const presetColor =
                    normalizeHexColor(preset.value) ?? DEFAULT_COLOR;
                  const isSelected = presetColor === selectedColor;

                  return (
                    <button
                      key={`${group}-${preset.value}`}
                      type="button"
                      title={`${preset.label} (${presetColor})`}
                      aria-label={preset.label}
                      aria-pressed={isSelected}
                      disabled={disabled}
                      className="relative inline-flex size-7 cursor-pointer items-center justify-center rounded-sm border border-black/10 shadow-xs transition-transform hover:z-10 hover:scale-110 focus-visible:z-10 disabled:pointer-events-none disabled:opacity-60"
                      style={{ backgroundColor: presetColor }}
                      onClick={() => commitColor(presetColor)}
                    >
                      {isSelected ? (
                        <Check
                          aria-hidden="true"
                          className={cn(
                            'size-3.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]',
                            presetColor === '#ffffff' ||
                              presetColor === '#ffeb3b'
                              ? 'text-black'
                              : 'text-white',
                          )}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
