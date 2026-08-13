import type { FormSpec } from '@/builders/form';

const spec: FormSpec = {
  entity: 'Employee',
  schemaImport: '../model/employee',
  schemaName: 'employeeFormSchema',
  valuesType: 'EmployeeFormValues',
  title: 'Thêm nhân viên',
  specPath: 'src/project/employees/forms/employee.form.fixture.ts',
  fields: [
    {
      kind: 'text',
      name: 'employeeCode',
      label: 'Mã nhân viên',
      width: 'normal',
      required: true,
    },
    {
      kind: 'text',
      name: 'firstName',
      label: 'Tên',
      width: 'normal',
      required: true,
    },
    { kind: 'text', name: 'lastName', label: 'Họ và tên đệm', width: 'normal' },
    { kind: 'text', name: 'jobTitle', label: 'Chức vụ', width: 'normal' },
    { kind: 'text', name: 'department', label: 'Phòng ban', width: 'normal' },
    {
      kind: 'text',
      name: 'phone',
      label: 'Số điện thoại',
      width: 'normal',
      inputType: 'tel',
    },
    {
      kind: 'select',
      name: 'status',
      label: 'Trạng thái',
      width: 'normal',
      options: [
        { value: 'active', label: 'Đang làm việc' },
        { value: 'inactive', label: 'Ngừng làm việc' },
      ],
    },
    {
      kind: 'date',
      name: 'joinedAt',
      label: 'Ngày vào làm',
      width: 'normal',
      format: 'display',
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
