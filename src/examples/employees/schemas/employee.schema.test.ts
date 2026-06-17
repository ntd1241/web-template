import { describe, expect, it } from 'vitest';
import type { EmployeeFormValues } from './employee.schema';
import { employeeFormSchema } from './employee.schema';

describe('employeeFormSchema', () => {
  const validEmployee: EmployeeFormValues = {
    name: 'Nguyễn Văn A',
    username: 'nguyenvana',
    roles: ['nhan-vien'],
    status: 'active',
  };

  it('keeps the accepted employee form shape unchanged', () => {
    expect(employeeFormSchema.safeParse(validEmployee).success).toBe(true);
  });

  it('keeps the existing validation boundaries and enum rules', () => {
    expect(
      employeeFormSchema.safeParse({ ...validEmployee, name: '' }).success,
    ).toBe(false);
    expect(
      employeeFormSchema.safeParse({
        ...validEmployee,
        name: 'a'.repeat(101),
      }).success,
    ).toBe(false);
    expect(
      employeeFormSchema.safeParse({ ...validEmployee, username: 'ab' })
        .success,
    ).toBe(false);
    expect(
      employeeFormSchema.safeParse({ ...validEmployee, username: 'ABC' })
        .success,
    ).toBe(false);
    expect(
      employeeFormSchema.safeParse({ ...validEmployee, roles: [] }).success,
    ).toBe(false);
    expect(
      employeeFormSchema.safeParse({ ...validEmployee, status: 'draft' })
        .success,
    ).toBe(false);
  });
});
