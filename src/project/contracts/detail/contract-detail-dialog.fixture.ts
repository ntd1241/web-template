const spec = {
  componentName: 'ContractDetailDialogShell',
  specPath: 'src/project/contracts/detail/contract-detail-dialog.fixture.ts',
  defaultTab: 'general',
  tabs: [
    {
      value: 'general',
      label: 'Thông tin chung',
      icon: 'Info',
      fieldProp: 'generalFields',
      searchTextProp: 'generalSearchText',
      searchMatchCountProp: 'generalSearchMatchCount',
    },
    {
      value: 'fees',
      label: 'Khoản phí',
      icon: 'ReceiptText',
      contentMode: 'custom',
      contentProp: 'feesContent',
      searchTextProp: 'feesSearchText',
      searchMatchCountProp: 'feesSearchMatchCount',
    },
  ],
} as const;

export default spec;
