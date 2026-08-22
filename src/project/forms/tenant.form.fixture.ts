import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'TenantSettings',
  schemaImport: '../model/tenant-settings',
  schemaName: 'tenantSettingsSchema',
  valuesType: 'TenantSettingsValues',
  title: 'Thông tin tổ chức',
  description: 'Cập nhật thông tin nhận diện và liên hệ của tổ chức.',
  specPath: 'src/project/forms/tenant.form.fixture.ts',
  fields: [
    {
      kind: 'image',
      name: 'logoUrl',
      label: 'Logo tổ chức',
      width: 'full',
      accept: 'image/png,image/jpeg,image/webp',
      maxSizeMb: 5,
      fallbackText: 'V',
    },
    {
      kind: 'text',
      name: 'name',
      label: 'Tên tổ chức',
      width: 'normal',
      required: true,
    },
    {
      kind: 'text',
      name: 'legalName',
      label: 'Tên pháp lý',
      width: 'normal',
    },
    {
      kind: 'textarea',
      name: 'description',
      label: 'Mô tả',
      width: 'full',
      rows: 3,
    },
    {
      kind: 'text',
      name: 'taxCode',
      label: 'Mã số thuế',
      width: 'normal',
    },
    {
      kind: 'text',
      name: 'email',
      label: 'Email liên hệ',
      width: 'normal',
      inputType: 'email',
    },
    {
      kind: 'text',
      name: 'phone',
      label: 'Số điện thoại',
      width: 'normal',
      inputType: 'tel',
    },
    {
      kind: 'textarea',
      name: 'address',
      label: 'Địa chỉ',
      width: 'full',
      rows: 3,
    },
    {
      kind: 'text',
      name: 'website',
      label: 'Website',
      width: 'normal',
      placeholder: 'https://...',
    },
    {
      kind: 'number',
      name: 'paymentReminderDays',
      label: 'Nhắc hạn thanh toán trước (ngày)',
      width: 'normal',
      format: 'plain',
    },
    {
      kind: 'number',
      name: 'chargeGenerationLeadDays',
      label: 'Tạo kỳ thanh toán trước (ngày)',
      width: 'normal',
      format: 'plain',
    },
    {
      kind: 'select',
      name: 'numberLocale',
      label: 'Định dạng số',
      width: 'normal',
      options: [
        { value: 'vi-VN', label: 'Việt Nam (1.234,56)' },
        { value: 'en-US', label: 'Quốc tế (1,234.56)' },
      ],
    },
    {
      kind: 'select',
      name: 'currencyCode',
      label: 'Đơn vị tiền tệ mặc định',
      width: 'normal',
      optionsFrom: 'prop',
    },
    {
      kind: 'select',
      name: 'compactDisplay',
      label: 'Đơn vị số rút gọn',
      width: 'normal',
      options: [
        { value: 'long', label: 'Đầy đủ (triệu, tỷ)' },
        { value: 'short', label: 'Viết tắt (Tr, Tỷ)' },
      ],
    },
  ],
};

export default spec;
