const spec = {
  componentName: 'ShowcaseDialog',
  specPath: 'src/builders/dialog/__fixtures__/showcase.dialog.fixture.ts',
  title: 'Tạo bản ghi',
  description: 'Nhập thông tin để tạo bản ghi mới.',
  width: 'md',
  actions: [
    { name: 'cancel', label: 'Hủy', variant: 'outline' },
    {
      name: 'submit',
      label: 'Lưu',
      variant: 'primary',
      type: 'submit',
      icon: 'Check',
      loadingProp: 'isSaving',
      loadingText: 'Đang lưu...',
    },
  ],
} as const;

export default spec;
