import type { FormSpec } from '@/builders/form';

/**
 * Form-builder spec cho danh mục thông số kỹ thuật.
 *
 *   npm run gen:form -- src/examples/material/specs/form/spec-definition.form.fixture.ts \
 *     src/examples/material/specs/components/spec-definition-form.generated.tsx
 *
 * OWNED sau khi gen: thêm `unit` có điều kiện (chỉ kiểu number), checkbox phụ
 * cho kiểu `list`, giá trị mặc định theo dataType và trình quản lý `options`.
 */
const spec: FormSpec = {
  entity: 'SpecDefinition',
  schemaImport: '../spec-definition.schema',
  schemaName: 'specDefinitionFormSchema',
  valuesType: 'SpecDefinitionFormValues',
  title: 'Thêm thông số kỹ thuật',
  description: 'Khai báo một thông số dùng chung cho mẫu vật tư.',
  specPath: 'src/examples/material/specs/form/spec-definition.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'code',
      label: 'Mã thông số',
      width: 'normal',
      required: true,
      placeholder: 'vd: TS-MAU',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên thông số',
      width: 'normal',
      required: true,
      placeholder: 'vd: Màu sắc',
    },
    {
      kind: 'select',
      name: 'dataType',
      label: 'Kiểu dữ liệu',
      width: 'full',
      required: true,
      placeholder: 'Chọn kiểu dữ liệu',
      options: [
        { value: 'text', label: 'Văn bản' },
        { value: 'number', label: 'Số + đơn vị' },
        { value: 'list', label: 'Danh sách' },
        { value: 'boolean', label: 'Có / Không' },
        { value: 'date', label: 'Ngày tháng' },
      ],
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
