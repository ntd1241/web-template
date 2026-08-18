import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ContractReceivablesContent } from './contract-detail-tab-content';
import { ContractPaymentDialog } from './contract-payment-dialog';

describe('ContractPaymentDialog', () => {
  it('renders the payment form when a receivable period is selected', () => {
    render(
      <ContractPaymentDialog
        open
        row={{
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
        }}
        currencyCode="VND"
        isSubmitting={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Thanh toán kỳ/)).toBeInTheDocument();
    expect(screen.getByLabelText('Số tiền thanh toán')).toHaveValue(1000000);
    expect(screen.getByLabelText('Số tiền thanh toán')).toHaveClass(
      'text-2xl',
      'text-primary',
      'border-0',
    );
    expect(screen.getByRole('dialog')).toHaveClass('max-h-[90dvh]');
    expect(screen.getByTestId('payment-allocation-progress')).toHaveAttribute(
      'data-payment-tone',
      'success',
    );
  });

  it('opens the payment form from the receivable table action', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <ContractReceivablesContent
          charges={[
            {
              id: 'charge-1',
              tenantId: 'tenant-1',
              customerId: 'customer-1',
              contractId: 'contract-1',
              contractVersionId: 'version-1',
              contractVersionLineId: 'line-1',
              direction: 'receivable',
              periodStart: '2026-08-17',
              periodEnd: '2026-09-16',
              dueDate: '2026-09-16',
              amount: 1_000_000,
              currencyCode: 'VND',
              status: 'open',
              voidReason: null,
              createdAt: '2026-08-17T00:00:00Z',
              paidAmount: 0,
              outstandingAmount: 1_000_000,
            },
          ]}
          lines={[
            {
              id: 'line-1',
              name: 'Phí bảo trì',
              sortOrder: 0,
            },
          ]}
          dueSoonDays={7}
          userId="user-1"
          contractId="contract-1"
          customerId="customer-1"
          currencyCode="VND"
          onPaymentRecorded={vi.fn(async () => undefined)}
        />
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: /Thanh toán kỳ/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
