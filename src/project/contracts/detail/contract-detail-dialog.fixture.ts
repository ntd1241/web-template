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
    },
  ],
} as const;

export default spec;
