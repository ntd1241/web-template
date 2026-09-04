import type { EditorTableSpec } from '@/builders/editor-table';

const spec: EditorTableSpec = {
  entity: 'CustomFieldEditorRow',
  componentName: 'CustomFieldsEditorTable',
  modelImport: '../forms/custom-fields-editor',
  valuesType: 'CustomFieldsFormValues',
  valuesImport: '../forms/custom-fields-editor',
  arrayName: 'fields',
  specPath:
    'src/project/data-configuration/table/custom-fields.editor-table.fixture.ts',
  tableMinWidthClass: 'min-w-[1120px]',
  toolbar: {
    title: 'Trường bổ sung',
    titleProp: 'toolbarTitle',
    addLabel: 'Thêm trường',
    contentPosition: 'afterAdd',
  },
  viewport: { mode: 'remaining' },
  actions: {
    enabled: true,
    widthClass: 'w-16',
    duplicate: false,
    insert: false,
    delete: true,
  },
  reorder: {
    enabled: true,
    header: '',
    widthClass: 'w-12',
  },
  columns: [
    {
      kind: 'text',
      name: 'key',
      header: 'Mã trường',
      widthClass: 'w-48',
      inputType: 'text',
    },
    {
      kind: 'text',
      name: 'label',
      header: 'Tên trường',
      widthClass: 'min-w-56',
      inputType: 'text',
    },
    {
      kind: 'custom',
      id: 'fieldType',
      header: 'Kiểu dữ liệu',
      widthClass: 'w-52',
    },
    {
      kind: 'custom',
      id: 'isRequired',
      header: 'Bắt buộc',
      widthClass: 'w-32',
    },
    {
      kind: 'custom',
      id: 'isActive',
      header: 'Kích hoạt',
      widthClass: 'w-32',
    },
    {
      kind: 'custom',
      id: 'options',
      header: 'Danh sách giá trị',
      widthClass: 'w-48',
    },
  ],
};

export default spec;
