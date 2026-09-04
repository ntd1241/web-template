const spec = {
  componentName: 'CustomFieldOptionsDialogShell',
  specPath:
    'src/project/data-configuration/components/custom-field-options.dialog.fixture.ts',
  title: 'Danh sách giá trị',
  titleProp: 'dialogTitle',
  width: 'lg',
  actions: [
    {
      name: 'cancel',
      label: 'Hủy',
      variant: 'outline',
      disabledProp: 'isSaving',
    },
    {
      name: 'save',
      label: 'Lưu danh sách',
      variant: 'primary',
      icon: 'Save',
      loadingProp: 'isSaving',
      loadingText: 'Đang lưu...',
      disabledProp: 'canSave',
      disabledWhen: 'falsy',
    },
  ],
} as const;

export default spec;
