import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { OrdersExamplePage } from './orders-page';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrdersExamplePage />
    </QueryClientProvider>,
  );
}

describe('OrdersExamplePage', () => {
  it('renders orders with editable status selects', async () => {
    renderPage();

    expect(await screen.findByText('DH-2606-001')).toBeInTheDocument();
    expect(screen.getByText('Nguyễn Minh An')).toBeInTheDocument();
    expect(screen.getByText('Danh sách đơn hàng')).toBeInTheDocument();
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(1);
  });

  it('shows the bulk action bar after selecting a row', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('DH-2606-001');
    await user.click(screen.getAllByLabelText('Chọn dòng')[0]);

    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(screen.getByText('Đã chọn 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Áp dụng' })).toBeInTheDocument();
  });
});
