import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'CustomerFilter',
  schemaImport: '../model/customer',
  schemaName: 'customerFilterFormSchema',
  valuesType: 'CustomerFilterFormValues',
  title: 'Bộ lọc khách hàng',
  specPath: 'src/project/customers/forms/customer-filter.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'customerSearch',
      label: 'Khách hàng',
      width: 'full',
      placeholder: 'Tìm theo tên hoặc mã khách hàng',
    },
    {
      kind: 'multiselect',
      name: 'businessTypes',
      label: 'Loại hình đơn vị',
      width: 'full',
      placeholder: 'Chọn loại hình',
      searchPlaceholder: 'Tìm loại hình...',
      options: [
        { value: 'individual', label: 'Cá nhân' },
        { value: 'organization', label: 'Doanh nghiệp' },
      ],
    },
    {
      kind: 'text',
      name: 'contactSearch',
      label: 'Liên hệ',
      width: 'full',
      placeholder: 'Tìm theo số điện thoại hoặc email',
    },
    {
      kind: 'tagSelect',
      name: 'tagIds',
      label: 'Nhóm/nhãn',
      width: 'full',
      placeholder: 'Chọn nhãn',
      searchPlaceholder: 'Tìm nhãn...',
      moduleCodes: ['customers'],
      allowCustomGroups: true,
    },
    {
      kind: 'multiselect',
      name: 'statuses',
      label: 'Trạng thái',
      width: 'full',
      placeholder: 'Chọn trạng thái',
      searchPlaceholder: 'Tìm trạng thái...',
      options: [
        { value: 'active', label: 'Đang hoạt động' },
        { value: 'inactive', label: 'Ngừng hoạt động' },
      ],
    },
  ],
};

export default spec;
