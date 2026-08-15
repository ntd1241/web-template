import type { CountryOption } from '@/lib/countries';
import { COUNTRY_OPTIONS, getCountryFlagName } from '@/lib/countries';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

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
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={placeholder}>
          {selectedOption ? (
            <CountryOptionContent option={selectedOption} />
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            textValue={option.label}
          >
            <CountryOptionContent option={option} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
