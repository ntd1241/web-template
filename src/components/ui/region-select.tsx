import { useMemo } from 'react';
import { SelectSearch } from './select-search';

export interface RegionSelectOption {
  value: string;
  label: string;
}

interface VietnamRegionSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly RegionSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function VietnamRegionSelect({
  value,
  onValueChange,
  options,
  placeholder = 'Chọn tỉnh/thành phố',
  disabled,
  className,
}: VietnamRegionSelectProps) {
  const searchOptions = useMemo(
    () =>
      options.map((option) => ({
        value: option.value,
        label: option.label,
        searchableText: option.label,
      })),
    [options],
  );

  return (
    <SelectSearch
      value={value}
      options={searchOptions}
      onChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Tìm tỉnh/thành phố..."
      emptyMessage="Không tìm thấy tỉnh/thành phố"
      disabled={disabled}
      className={className}
    />
  );
}
