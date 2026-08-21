/**
 * Scaffolded by segmented-control-builder from `src/builders/segmented-control/__fixtures__/showcase.segmented-control.fixture.ts`. Run npm run gen:segmented-control — do NOT hand-write this file.
 * You own this file now — wire the generated control into the feature and keep domain state outside the component.
 * To change options or control styling, edit the spec and re-gen to a scratch path first.
 */
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface ShowcaseSegmentedControlOption {
  value: string;
  label: string;
}

const ShowcaseSegmentedControlOptions: ShowcaseSegmentedControlOption[] = [
  { value: 'one', label: 'Một' },
  { value: 'two', label: 'Hai' },
];

export interface ShowcaseSegmentedControlProps {
  value: string;
  onValueChange: (value: string) => void;
  options?: ShowcaseSegmentedControlOption[];
  disabled?: boolean;
  className?: string;
}

export function ShowcaseSegmentedControl({
  value,
  onValueChange,
  options = ShowcaseSegmentedControlOptions,
  disabled = false,
  className,
}: ShowcaseSegmentedControlProps) {
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
      aria-label="Chế độ hiển thị"
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
