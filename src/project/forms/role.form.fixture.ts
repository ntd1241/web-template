import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'Role',
  schemaImport: '../model/role-permission',
  schemaName: 'roleFormSchema',
  valuesType: 'RoleFormValues',
  title: 'Vai trò',
  description: 'Cập nhật thông tin hiển thị của vai trò.',
  specPath: 'src/project/forms/role.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'code',
      label: 'Mã vai trò',
      width: 'full',
      required: true,
      placeholder: 'ví dụ: warehouse_manager',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên vai trò',
      width: 'full',
      required: true,
    },
    {
      kind: 'select',
      name: 'color',
      label: 'Màu vai trò',
      width: 'full',
      required: true,
      options: [
        { value: 'blue', label: 'Xanh dương' },
        { value: 'violet', label: 'Tím' },
        { value: 'red', label: 'Đỏ' },
        { value: 'green', label: 'Xanh lá' },
        { value: 'amber', label: 'Cam' },
        { value: 'slate', label: 'Xám' },
      ],
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
