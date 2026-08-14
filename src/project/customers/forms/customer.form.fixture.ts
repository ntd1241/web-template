import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'Customer',
  schemaImport: '../model/customer',
  schemaName: 'customerFormSchema',
  valuesType: 'CustomerFormValues',
  title: 'Thêm khách hàng',
  specPath: 'src/project/customers/forms/customer.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'customerCode',
      label: 'Mã khách hàng',
      width: 'normal',
      required: true,
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên khách hàng',
      width: 'normal',
      required: true,
    },
    {
      kind: 'select',
      name: 'businessType',
      label: 'Loại hình đơn vị',
      width: 'normal',
      options: [
        { value: 'individual', label: 'Cá nhân' },
        { value: 'organization', label: 'Doanh nghiệp' },
      ],
    },
    {
      kind: 'select',
      name: 'status',
      label: 'Trạng thái',
      width: 'normal',
      options: [
        { value: 'active', label: 'Đang hoạt động' },
        { value: 'inactive', label: 'Ngừng hoạt động' },
      ],
    },
    {
      kind: 'text',
      name: 'phone',
      label: 'Số điện thoại',
      width: 'normal',
      inputType: 'tel',
    },
    {
      kind: 'text',
      name: 'email',
      label: 'Email',
      width: 'normal',
      inputType: 'email',
    },
    {
      kind: 'text',
      name: 'address',
      label: 'Địa chỉ',
      width: 'full',
    },
    {
      kind: 'textarea',
      name: 'note',
      label: 'Ghi chú',
      width: 'full',
      rows: 3,
    },
  ],
};

export default spec;
