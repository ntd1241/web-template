import type { FormSpec } from '@/builders/form';

/**
 * Form-builder spec cho thiết bị thật. Các field cơ bản dùng scaffold;
 * `specValues` là editor tùy biến ở form generated/owned.
 *
 *   npm run gen:form -- src/examples/material/form/material.form.fixture.ts \
 *     src/examples/material/components/material-form.generated.tsx
 */
const spec: FormSpec = {
  entity: 'Material',
  schemaImport: '../material.schema',
  schemaName: 'materialFormSchema',
  valuesType: 'MaterialFormValues',
  title: 'Thiết bị',
  description: 'Thông tin cơ bản và thông số kế thừa từ mẫu.',
  specPath: 'src/examples/material/form/material.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'name',
      label: 'Tên thiết bị',
      width: 'normal',
      required: true,
      placeholder: 'vd: iPhone 17 Pro - NV Kinh doanh',
    },
    {
      kind: 'text',
      name: 'code',
      label: 'Mã thiết bị',
      width: 'normal',
      required: true,
      placeholder: 'vd: DD-IP-000301',
    },
    {
      kind: 'select',
      name: 'modelId',
      label: 'Mẫu',
      width: 'full',
      required: true,
      placeholder: 'Chọn mẫu vật tư',
      optionsFrom: 'prop',
    },
  ],
};

export default spec;
