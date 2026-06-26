import type { FormSpec } from '@/builders/form';

/**
 * Form-builder spec — BƯỚC 1 của wizard mẫu vật tư (thông tin cơ bản).
 * Bước 2 (thông số) là editor tùy biến, dùng chung 1 RHF instance.
 *
 *   npm run gen:form -- src/examples/material/models/form/material-model.form.fixture.ts \
 *     src/examples/material/models/components/material-model-form.generated.tsx
 */
const spec: FormSpec = {
  entity: 'MaterialModel',
  schemaImport: '../material-model.schema',
  schemaName: 'materialModelFormSchema',
  valuesType: 'MaterialModelFormValues',
  title: 'Mẫu vật tư',
  description: 'Thông tin cơ bản của mẫu.',
  specPath: 'src/examples/material/models/form/material-model.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'name',
      label: 'Tên mẫu',
      width: 'normal',
      required: true,
      placeholder: 'vd: iPhone 17 Pro',
    },
    {
      kind: 'text',
      name: 'code',
      label: 'Mã mẫu',
      width: 'normal',
      required: true,
      placeholder: 'vd: MAU-IP17PRO',
    },
    {
      kind: 'select',
      name: 'groupId',
      label: 'Nhóm vật tư',
      width: 'normal',
      required: true,
      placeholder: 'Chọn nhóm',
      optionsFrom: 'prop',
    },
    {
      kind: 'text',
      name: 'origin',
      label: 'Xuất xứ',
      width: 'normal',
      placeholder: 'vd: Trung Quốc',
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Mô tả',
      width: 'full',
      rows: 2,
    },
  ],
};

export default spec;
