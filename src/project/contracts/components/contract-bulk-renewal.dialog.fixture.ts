const spec = {
  componentName: 'ContractBulkRenewalDialogShell',
  specPath:
    'src/project/contracts/components/contract-bulk-renewal.dialog.fixture.ts',
  title: 'Gia hạn hợp đồng',
  titleProp: 'dialogTitle',
  width: 'xl',
  actions: [
    {
      name: 'cancel',
      label: 'Hủy',
      variant: 'outline',
      disabledProp: 'isSubmitting',
    },
    {
      name: 'confirm',
      label: 'Tạo bản nháp gia hạn',
      variant: 'primary',
      icon: 'RefreshCw',
      loadingProp: 'isSubmitting',
      loadingText: 'Đang tạo...',
      disabledProp: 'canConfirm',
      disabledWhen: 'falsy',
    },
  ],
} as const;

export default spec;
