import type { FormSpec } from '@/builders/form';

/**
 * Form-builder spec cho nhóm vật tư. Render inline trong detail panel.
 *
 *   npm run gen:form -- src/examples/material/groups/form/material-group.form.fixture.ts \
 *     src/examples/material/groups/components/material-group-form.generated.tsx
 */
const spec: FormSpec = {
  entity: 'MaterialGroup',
  schemaImport: '../material-group.schema',
  schemaName: 'materialGroupFormSchema',
  valuesType: 'MaterialGroupFormValues',
  title: 'Nhóm vật tư',
  description: 'Thông tin nhóm vật tư.',
  specPath: 'src/examples/material/groups/form/material-group.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'code',
      label: 'Mã nhóm',
      width: 'normal',
      required: true,
      placeholder: 'vd: NHOM-DT',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên nhóm',
      width: 'normal',
      required: true,
      placeholder: 'vd: Điện thoại',
    },
    {
      kind: 'select',
      name: 'parentId',
      label: 'Nhóm cha',
      width: 'full',
      required: true,
      placeholder: 'Chọn nhóm cha',
      optionsFrom: 'prop',
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Mô tả',
      width: 'full',
      rows: 2,
    },
    { kind: 'switch', name: 'isActive', label: 'Đang sử dụng', width: 'full' },
  ],
};

export default spec;
