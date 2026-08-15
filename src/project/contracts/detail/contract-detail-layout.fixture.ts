const spec = {
  componentName: 'ContractDetailLayout',
  specPath: 'src/project/contracts/detail/contract-detail-layout.fixture.ts',
  defaultTab: 'overview',
  tabs: [
    { value: 'overview', label: 'Tổng quan', icon: 'LayoutDashboard' },
    { value: 'receivables', label: 'Kỳ thanh toán', icon: 'ReceiptText' },
    { value: 'versions', label: 'Phiên bản', icon: 'History' },
    { value: 'payments', label: 'Thanh toán', icon: 'WalletCards' },
  ],
} as const;

export default spec;
