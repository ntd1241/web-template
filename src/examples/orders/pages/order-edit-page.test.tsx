import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { orderApi } from '../api/order.api';
import { OrderEditPage } from './order-edit-page';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <OrderEditPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OrderEditPage', () => {
  it('renders the loaded rows', async () => {
    const { container } = renderPage();

    expect(await screen.findByDisplayValue('Gạo ST25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cà phê rang xay')).toBeInTheDocument();
    expect(screen.getByDisplayValue('ST25-10KG')).toBeInTheDocument();
    expect(screen.getByText('12 dòng')).toBeInTheDocument();
    expect(screen.getByTestId('order-edit-page')).toHaveClass(
      'overflow-hidden',
    );
    expect(container.querySelector('form')).toHaveClass('flex', 'flex-col');
    expect(container.querySelector('[data-slot="card"]')).toHaveClass('flex-1');
    expect(container.querySelector('[data-slot="card-table"]')).toHaveClass(
      'min-h-0',
      'flex-1',
    );
    expect(screen.getAllByRole('button', { name: 'Lưu' })).toHaveLength(1);
  });

  it('appends a row from the add button', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Gạo ST25');
    await user.click(screen.getByRole('button', { name: 'Thêm dòng' }));

    expect(screen.getByText('13 dòng')).toBeInTheDocument();
    expect(screen.getByLabelText('Tên hàng hóa dòng 13')).toBeInTheDocument();
  });

  it('removes a row from the row action', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Gạo ST25');
    await user.click(screen.getByRole('button', { name: 'Xóa dòng 1' }));

    expect(screen.queryByDisplayValue('Gạo ST25')).not.toBeInTheDocument();
    expect(screen.getByText('11 dòng')).toBeInTheDocument();
  });

  it('updates the computed row total when quantity and unit price change', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Gạo ST25');
    const quantityInput = screen.getByLabelText('Số lượng dòng 1');
    const unitPriceInput = screen.getByLabelText('Đơn giá dòng 1');

    await user.clear(quantityInput);
    await user.type(quantityInput, '2');
    await user.clear(unitPriceInput);
    await user.type(unitPriceInput, '1234');

    await waitFor(() => {
      expect(screen.getByText('2.468 ₫')).toBeInTheDocument();
    });
  });

  it('applies multi edit values to selected rows from the action bar', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Gạo ST25');
    await user.click(screen.getByRole('checkbox', { name: 'Chọn dòng 1' }));

    expect(
      screen.getByRole('toolbar', { name: 'Thao tác hàng loạt' }),
    ).toHaveTextContent('Đã chọn 1 dòng');

    const bulkValue = screen.getByLabelText('Giá trị áp dụng hàng loạt');
    await user.type(bulkValue, 'Kho Z');
    await user.click(screen.getByRole('button', { name: 'Áp dụng' }));

    expect(screen.getByLabelText('Kho dòng 1')).toHaveValue('Kho Z');
    expect(screen.getByLabelText('Kho dòng 2')).toHaveValue('Kho B');
  });

  it('applies header bulk inputs only to selected rows', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByDisplayValue('Gạo ST25');
    await user.click(screen.getByRole('checkbox', { name: 'Chọn dòng 2' }));

    const headerWarehouse = screen.getByLabelText(
      'Áp dụng kho cho dòng đã chọn',
    );
    fireEvent.change(headerWarehouse, { target: { value: 'Kho Header' } });

    expect(screen.getByLabelText('Kho dòng 1')).toHaveValue('Kho A');
    expect(screen.getByLabelText('Kho dòng 2')).toHaveValue('Kho Header');
  });

  it('saves valid edited line items', async () => {
    const user = userEvent.setup();
    const saveSpy = vi.spyOn(orderApi, 'saveItems');
    renderPage();

    await screen.findByDisplayValue('Gạo ST25');
    await user.clear(screen.getByLabelText('Số lượng dòng 1'));
    await user.type(screen.getByLabelText('Số lượng dòng 1'), '3');
    await user.click(screen.getByRole('button', { name: 'Lưu' }));

    await waitFor(() => {
      expect(saveSpy).toHaveBeenCalledWith(
        'demo',
        expect.arrayContaining([
          expect.objectContaining({ id: 'oi01', quantity: 3 }),
        ]),
      );
    });
  });
});
