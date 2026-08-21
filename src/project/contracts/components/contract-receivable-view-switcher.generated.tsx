/**
 * Scaffolded by segmented-control-builder from `src/project/contracts/components/contract-receivable-view-switcher.segmented-control.fixture.ts`. Run npm run gen:segmented-control — do NOT hand-write this file.
 * You own this file now — wire the generated control into the feature and keep domain state outside the component.
 * To change options or control styling, edit the spec and re-gen to a scratch path first.
 */
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface ContractReceivableViewSwitcherOption {
  value: string;
  label: string;
}

const ContractReceivableViewSwitcherOptions: ContractReceivableViewSwitcherOption[] =
  [
    { value: 'period', label: 'Theo kỳ' },
    { value: 'month', label: 'Theo tháng' },
    { value: 'year', label: 'Theo năm' },
  ];

export interface ContractReceivableViewSwitcherProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: ContractReceivableViewSwitcherOption[];
  disabled?: boolean;
  className?: string;
}

export function ContractReceivableViewSwitcher({
  value,
  onValueChange,
  options = ContractReceivableViewSwitcherOptions,
  disabled = false,
  className,
}: ContractReceivableViewSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(nextValue) => {
        if (nextValue) onValueChange(nextValue);
      }}
      disabled={disabled}
      variant="outline"
      size="lg"
      className={cn('w-fit', className)}
      aria-label="Cách hiển thị kỳ thanh toán"
    >
      {options.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className={cn(
            'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          )}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
