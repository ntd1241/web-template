const spec = {
  componentName: 'CustomerDetailDialog',
  specPath:
    'src/builders/detail-dialog/__fixtures__/customer-detail-dialog.fixture.ts',
  defaultTab: 'general',
  tabs: [
    {
      value: 'general',
      label: 'Thông tin chung',
      icon: 'Info',
      searchTextProp: 'generalSearchText',
    },
    {
      value: 'contracts',
      label: 'Hợp đồng',
      icon: 'FileText',
      contentMode: 'custom',
      contentProp: 'contractsPanel',
      searchTextProp: 'contractsSearchText',
    },
  ],
} as const;

export default spec;
