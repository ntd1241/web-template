import { cn } from '@/lib/utils';
import { TagSelect } from './tag-select';

export interface TagColumnFilterProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  moduleCodes: string[];
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** Shared grouped multi-select used by tag columns across list tables. */
export function TagColumnFilter({
  value,
  onChange,
  moduleCodes,
  disabled = false,
  className,
  ariaLabel = 'Nhóm/nhãn',
}: TagColumnFilterProps) {
  return (
    <TagSelect
      value={value}
      onChange={onChange}
      moduleCodes={moduleCodes}
      allowCustomGroups
      placeholder=""
      searchPlaceholder="Tìm nhãn..."
      ariaLabel={ariaLabel}
      size="sm"
      disabled={disabled}
      className={cn('min-w-[200px]', className)}
    />
  );
}
