import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'TagGroup',
  schemaImport: '../model/tag',
  schemaName: 'tagGroupFormSchema',
  valuesType: 'TagGroupFormValues',
  title: 'Nhóm nhãn',
  description: 'Tạo nhóm để quản lý các nhãn liên quan.',
  specPath: 'src/project/tags/forms/tag-group.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'name',
      label: 'Tên nhóm',
      width: 'large',
      required: true,
    },
    {
      kind: 'text',
      name: 'code',
      label: 'Mã nhóm',
      width: 'normal',
      required: true,
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Mô tả',
      width: 'full',
      rows: 3,
    },
  ],
};

export default spec;
