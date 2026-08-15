import { useMemo } from 'react';
import type { CountryOption } from '@/lib/countries';
import { COUNTRY_OPTIONS, getCountryFlagName } from '@/lib/countries';
import { toAbsoluteUrl } from '@/lib/helpers';
import { SelectSearch } from './select-search';

interface CountrySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: readonly CountryOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function CountryOptionContent({ option }: { option: CountryOption }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <img
        src={toAbsoluteUrl(
          `/media/flags/${option.flag ?? getCountryFlagName(option.value)}.svg`,
        )}
        alt=""
        aria-hidden="true"
        className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
      />
      <span className="truncate">{option.label}</span>
    </span>
  );
}

export function CountrySelect({
  value,
  onValueChange,
  options = COUNTRY_OPTIONS,
  placeholder = 'Chọn quốc gia',
  disabled,
  className,
}: CountrySelectProps) {
  const searchOptions = useMemo(
    () =>
      options.map((option) => ({
        value: option.value,
        label: <CountryOptionContent option={option} />,
        searchableText: option.label,
        data: option,
      })),
    [options],
  );

  return (
    <SelectSearch
      value={value}
      options={searchOptions}
      onChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Tìm quốc gia..."
      disabled={disabled}
      className={className}
    />
  );
}
