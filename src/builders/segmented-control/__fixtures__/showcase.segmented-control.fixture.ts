const spec = {
  componentName: 'ShowcaseSegmentedControl',
  specPath:
    'src/builders/segmented-control/__fixtures__/showcase.segmented-control.fixture.ts',
  ariaLabel: 'Chế độ hiển thị',
  options: [
    { value: 'one', label: 'Một' },
    { value: 'two', label: 'Hai' },
  ],
  size: 'lg',
  variant: 'outline',
  itemClassName:
    'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
} as const;

export default spec;
