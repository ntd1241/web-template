import type { FormSpec } from '@/builders/form';
import { CUSTOMER_COUNTRY_OPTIONS } from '../model/customer';

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
      kind: 'text',
      name: 'businessRegistrationCode',
      label: 'Mã số thuế / QHNS / ĐKKD',
      width: 'normal',
    },
    {
      kind: 'image',
      name: 'imageUrl',
      label: 'Ảnh khách hàng',
      width: 'full',
      accept: 'image/png,image/jpeg,image/webp',
      maxSizeMb: 5,
      fallbackText: 'K',
    },
    {
      kind: 'select',
      name: 'countryCode',
      label: 'Quốc gia',
      width: 'normal',
      options: [...CUSTOMER_COUNTRY_OPTIONS],
    },
    {
      kind: 'select',
      name: 'regionCode',
      label: 'Tỉnh/Thành phố',
      width: 'normal',
      optionsFrom: 'prop',
      placeholder: 'Chọn tỉnh/thành phố',
    },
    {
      kind: 'text',
      name: 'regionName',
      label: 'Tỉnh/Bang/Khu vực',
      width: 'normal',
      placeholder: 'Nhập khu vực hành chính',
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
      modes: ['edit'],
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
      name: 'addressDetail',
      label: 'Địa chỉ chi tiết',
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
