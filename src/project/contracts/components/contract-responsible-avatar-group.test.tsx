import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContractResponsibleAvatarGroup } from './contract-responsible-avatar-group';

const employees = [
  {
    id: 'employee-1',
    userId: 'user-1',
    employeeCode: 'NV01',
    displayName: 'Nguyễn Văn A',
    avatarUrl: null,
  },
  {
    id: 'employee-2',
    userId: 'user-2',
    employeeCode: 'NV02',
    displayName: 'Trần Thị B',
    avatarUrl: null,
  },
  {
    id: 'employee-3',
    userId: 'user-3',
    employeeCode: 'NV03',
    displayName: 'Lê Văn C',
    avatarUrl: null,
  },
  {
    id: 'employee-4',
    userId: 'user-4',
    employeeCode: 'NV04',
    displayName: 'Phạm Thị D',
    avatarUrl: null,
  },
];

describe('ContractResponsibleAvatarGroup', () => {
  it('shows an add-employee link when no one is assigned', () => {
    render(
      <ContractResponsibleAvatarGroup
        employees={[]}
        onClick={() => undefined}
      />,
    );

    expect(screen.getByText('Thêm nhân viên')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Thêm nhân viên phụ trách' }),
    ).toBeInTheDocument();
  });

  it('uses the employee identity layout for one responsible employee', () => {
    render(
      <ContractResponsibleAvatarGroup employees={employees.slice(0, 1)} />,
    );

    expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
    expect(screen.getByText('NV01')).toBeInTheDocument();
  });

  it('uses a stacked group and overflow count for multiple employees', () => {
    render(
      <ContractResponsibleAvatarGroup
        employees={employees}
        onClick={() => undefined}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Quản lý nhân viên phụ trách' }),
    ).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});
