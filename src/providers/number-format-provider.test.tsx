import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  NumberFormatProvider,
  useNumberFormat,
} from './number-format-provider';
import { TenantProvider } from './tenant-provider';
import { UserProvider } from './user-provider';

function NumberFormatProbe() {
  const { formatCurrency, formatNumber, inputSeparators } = useNumberFormat();

  return (
    <output>
      <span data-testid="number">{formatNumber(1234.5)}</span>
      <span data-testid="currency">{formatCurrency(1234.5)}</span>
      <span data-testid="separators">
        {inputSeparators.thousandSeparator}|{inputSeparators.decimalSeparator}
      </span>
    </output>
  );
}

describe('NumberFormatProvider', () => {
  it('provides formatters from the organization settings', () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <TenantProvider>
            <NumberFormatProvider
              settings={{
                locale: 'en-US',
                currencyCode: 'USD',
                compactDisplay: 'short',
              }}
            >
              <NumberFormatProbe />
            </NumberFormatProvider>
          </TenantProvider>
        </UserProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId('number')).toHaveTextContent('1,234.5');
    expect(screen.getByTestId('currency')).toHaveTextContent('$1,235');
    expect(screen.getByTestId('separators')).toHaveTextContent(',|.');
  });
});
