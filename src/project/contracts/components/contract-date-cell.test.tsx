import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ContractDateCell } from './contract-date-cell';

describe('ContractDateCell', () => {
  it('hides the status subtext outside the reminder window', () => {
    render(
      <ContractDateCell
        date="2026-09-10"
        reminderDays={2}
        emptyLabel="Chưa phát sinh"
        today={new Date(2026, 8, 3)}
      />,
    );

    expect(screen.getByText('10/09/2026')).toBeInTheDocument();
    expect(screen.queryByText('Còn lại 7 ngày')).not.toBeInTheDocument();
  });

  it('colors only the status subtext', () => {
    render(
      <ContractDateCell
        date="2026-09-05"
        reminderDays={2}
        emptyLabel="Chưa phát sinh"
        today={new Date(2026, 8, 3)}
      />,
    );

    const status = screen.getByText('Còn lại 2 ngày');
    const date = status.previousElementSibling;

    expect(status).toHaveClass('text-admin-amber-dark');
    expect(date).not.toHaveClass('text-admin-amber-dark');
  });
});
