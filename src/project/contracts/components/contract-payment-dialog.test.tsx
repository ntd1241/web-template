import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { loadContractReceivablePeriodList } from '../api/contracts.api';
import type { ContractReceivableTableRow } from '../model/receivable';
import { ContractReceivablesContent } from './contract-detail-tab-content';
import { ContractPaymentDialog } from './contract-payment-dialog';

vi.mock('../api/contracts.api', async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    '../api/contracts.api',
  );
  return {
    ...actual,
    loadContractReceivablePeriodList: vi.fn(),
  };
});

const loadReceivablePeriods = vi.mocked(loadContractReceivablePeriodList);

function createPeriodRow(
  overrides: Partial<ContractReceivableTableRow> = {},
): ContractReceivableTableRow {
  return {
    id: 'period-1',
    direction: 'receivable',
    periodStart: '2026-08-17',
    periodEnd: '2026-09-16',
    dueDate: '2026-09-16',
    amount: 1_000_000,
    currencyCode: 'VND',
    status: 'open',
    paidAmount: 0,
    outstandingAmount: 1_000_000,
    displayStatus: 'unpaid',
    fees: [
      {
        id: 'fee-1',
        chargeId: 'charge-1',
        name: 'Phí bảo trì',
        amount: 1_000_000,
        outstandingAmount: 1_000_000,
        currencyCode: 'VND',
      },
    ],
    ...overrides,
  };
}

function renderReceivables(rows: ContractReceivableTableRow[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  loadReceivablePeriods.mockResolvedValue({ rows, total: rows.length });

  return render(
    <QueryClientProvider client={queryClient}>
      <ContractReceivablesContent
        tenantId="tenant-1"
        dueSoonDays={7}
        userId="user-1"
        contractId="contract-1"
        customerId="customer-1"
        currencyCode="VND"
        onPaymentRecorded={vi.fn(async () => undefined)}
      />
    </QueryClientProvider>,
  );
}

describe('ContractPaymentDialog', () => {
  it('renders the payment form when a receivable period is selected', () => {
    render(
      <ContractPaymentDialog
        open
        row={createPeriodRow()}
        currencyCode="VND"
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Thanh toán kỳ/)).toBeInTheDocument();
    expect(screen.getByLabelText('Số tiền thanh toán')).toHaveValue(
      '1.000.000 ₫',
    );
    expect(screen.getByLabelText('Số tiền thanh toán')).toHaveClass(
      'text-2xl',
      'text-primary',
      'border-0',
    );
    expect(screen.getByText('Tổng tiền kỳ:')).toBeInTheDocument();
    expect(screen.getByText('Đã thanh toán:')).toBeInTheDocument();
    expect(screen.getByText('Còn lại:')).toBeInTheDocument();
    expect(screen.getAllByText(/1\.000\.000/)).toHaveLength(4);
    expect(screen.getByRole('dialog')).toHaveClass('max-h-[90dvh]');
    expect(screen.getByTestId('payment-allocation-progress')).toHaveAttribute(
      'data-payment-tone',
      'success',
    );
  });

  it('opens the payment form from the receivable table action', async () => {
    const user = userEvent.setup();
    renderReceivables([createPeriodRow()]);

    await user.click(
      await screen.findByRole('button', { name: /Thanh toán kỳ/ }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('refetches the server-side list when search, filter, and sort change', async () => {
    const user = userEvent.setup();
    renderReceivables([
      createPeriodRow(),
      createPeriodRow({
        id: 'period-2',
        periodStart: '2026-07-17',
        periodEnd: '2026-08-16',
        dueDate: '2026-08-16',
        amount: 2_000_000,
        paidAmount: 2_000_000,
        outstandingAmount: 0,
        displayStatus: 'paid',
        status: 'paid',
        fees: [
          {
            id: 'fee-2',
            chargeId: 'charge-2',
            name: 'Phí dịch vụ',
            amount: 2_000_000,
            outstandingAmount: 0,
            currencyCode: 'VND',
          },
        ],
      }),
    ]);

    await waitFor(() => expect(loadReceivablePeriods).toHaveBeenCalled());

    await user.click(
      screen.getByRole('combobox', { name: 'Sắp xếp kỳ thanh toán' }),
    );
    await user.click(screen.getByRole('option', { name: 'Kỳ cũ nhất' }));
    await waitFor(() => {
      expect(loadReceivablePeriods.mock.calls.at(-1)?.[2]).toMatchObject({
        sort: 'periodStart_asc',
        page: 1,
      });
    });

    await user.click(
      screen.getByRole('combobox', { name: 'Lọc trạng thái kỳ thanh toán' }),
    );
    await user.click(screen.getByRole('option', { name: 'Đã thu' }));
    await waitFor(() => {
      expect(loadReceivablePeriods.mock.calls.at(-1)?.[2]).toMatchObject({
        status: 'paid',
        page: 1,
      });
    });

    const search = screen.getByPlaceholderText('Tìm theo khoản phí hoặc ngày');
    await user.type(search, 'bảo trì');
    await waitFor(() => {
      expect(loadReceivablePeriods.mock.calls.at(-1)?.[2]).toMatchObject({
        search: 'bảo trì',
        page: 1,
      });
    });
  });
});
