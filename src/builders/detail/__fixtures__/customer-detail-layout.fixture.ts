const spec = {
  componentName: 'CustomerDetailLayout',
  specPath:
    'src/builders/detail/__fixtures__/customer-detail-layout.fixture.ts',
  defaultTab: 'contracts',
  tabs: [
    { value: 'contracts', label: 'Hợp đồng', icon: 'FileText' },
    { value: 'employees', label: 'Nhân viên', icon: 'Users' },
    { value: 'reports', label: 'Báo cáo', icon: 'BarChart3' },
  ],
} as const;

export default spec;
