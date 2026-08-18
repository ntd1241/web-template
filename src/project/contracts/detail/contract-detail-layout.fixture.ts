const spec = {
  componentName: 'ContractDetailLayout',
  specPath: 'src/project/contracts/detail/contract-detail-layout.fixture.ts',
  defaultTab: 'overview',
  tabs: [
    { value: 'overview', label: 'Tổng quan', icon: 'LayoutDashboard' },
    {
      value: 'receivables',
      label: 'Kỳ thanh toán',
      icon: 'ReceiptText',
      badgeProp: 'receivablesBadge',
    },
    { value: 'versions', label: 'Phiên bản', icon: 'History' },
    {
      value: 'payments',
      label: 'Lịch sử thanh toán',
      icon: 'WalletCards',
    },
    { value: 'attachments', label: 'Tài liệu', icon: 'Paperclip' },
  ],
} as const;

export default spec;
