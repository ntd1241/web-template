import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'InspectionTable',
  schemaImport: '../inspection-table.schema',
  schemaName: 'inspectionTableFormSchema',
  valuesType: 'InspectionTableFormValues',
  title: 'Bảng kiểm định',
  description: 'Thông tin cơ bản của bảng kiểm định.',
  specPath:
    'src/examples/material/inspection/form/inspection-table.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'code',
      label: 'Mã bảng',
      width: 'normal',
      required: true,
      placeholder: 'vd: KD-PALANG',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên bảng',
      width: 'normal',
      required: true,
      placeholder: 'vd: Tiêu chuẩn kiểm định palăng',
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
