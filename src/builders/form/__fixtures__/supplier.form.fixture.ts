import type { FormSpec } from '../form-spec';

/**
 * Golden fixture spec for the form builder. Exercises every field kind + all
 * width presets (normal/large/full). `npm run gen:form` turns this into the
 * committed `supplier-form-dialog.generated.tsx`; the builder test asserts the
 * output still matches, so any builder drift fails CI.
 *
 * Named `.fixture.ts` (not `.spec.ts`) so vitest does not collect it as a test.
 */
const spec: FormSpec = {
  entity: 'Supplier',
  schemaImport: './supplier-form.schema',
  schemaName: 'createSupplierFormSchema',
  valuesType: 'CreateSupplierFormValues',
  title: 'Thêm nhà cung cấp',
  description: 'Khai báo thông tin nhà cung cấp mới.',
  specPath: 'src/builders/form/__fixtures__/supplier.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'code',
      label: 'Mã NCC',
      width: 'normal',
      required: true,
      placeholder: 'vd: NCC-001',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên nhà cung cấp',
      width: 'large',
      required: true,
    },
    { kind: 'text', name: 'contact', label: 'Người liên hệ', width: 'normal' },
    {
      kind: 'text',
      name: 'phone',
      label: 'Số điện thoại',
      width: 'normal',
      inputType: 'tel',
    },
    { kind: 'number', name: 'debt', label: 'Công nợ đầu kỳ', width: 'normal' },
    {
      kind: 'select',
      name: 'group',
      label: 'Nhóm',
      width: 'normal',
      required: true,
      placeholder: 'Chọn nhóm',
      options: [
        { value: 'vat-tu', label: 'Vật tư' },
        { value: 'dich-vu', label: 'Dịch vụ' },
      ],
    },
    {
      kind: 'combobox',
      name: 'region',
      label: 'Khu vực',
      width: 'normal',
      placeholder: 'Chọn khu vực',
      options: [
        { value: 'mien-bac', label: 'Miền Bắc' },
        { value: 'mien-trung', label: 'Miền Trung' },
        { value: 'mien-nam', label: 'Miền Nam' },
      ],
    },
    {
      kind: 'multiselect',
      name: 'tags',
      label: 'Thẻ',
      width: 'full',
      placeholder: 'Chọn thẻ',
      searchPlaceholder: 'Tìm thẻ...',
      emptyMessage: 'Không có thẻ phù hợp',
      options: [
        { value: 'uu-tien', label: 'Ưu tiên' },
        { value: 'noi-dia', label: 'Nội địa' },
      ],
    },
    {
      kind: 'textarea',
      name: 'note',
      label: 'Ghi chú',
      width: 'full',
      rows: 3,
    },
    { kind: 'switch', name: 'active', label: 'Kích hoạt ngay', width: 'full' },
  ],
};

export default spec;
