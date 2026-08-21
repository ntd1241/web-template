import type { SegmentedControlSpec } from '@/builders/segmented-control';

const spec = {
  componentName: 'ContractReceivableViewSwitcher',
  specPath:
    'src/project/contracts/components/contract-receivable-view-switcher.segmented-control.fixture.ts',
  ariaLabel: 'Cách hiển thị kỳ thanh toán',
  options: [
    { value: 'period', label: 'Theo kỳ' },
    { value: 'month', label: 'Theo tháng' },
    { value: 'year', label: 'Theo năm' },
  ],
  size: 'lg',
  variant: 'outline',
  itemClassName:
    'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
} satisfies SegmentedControlSpec;

export default spec;
