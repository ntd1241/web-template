import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CountrySelect } from './country-select';
import { VietnamRegionSelect } from './region-select';

describe('country and Vietnam region selects', () => {
  it('searches countries while keeping the flag in the option', async () => {
    const user = userEvent.setup();

    render(
      <CountrySelect
        value=""
        onValueChange={vi.fn()}
        options={[
          { value: 'VN', label: 'Việt Nam', flag: 'vietnam' },
          { value: 'US', label: 'Hoa Kỳ', flag: 'united-states' },
        ]}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    expect(screen.getByPlaceholderText('Tìm quốc gia...')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Tìm quốc gia...'), 'hoa');

    expect(screen.getByRole('option', { name: 'Hoa Kỳ' })).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Việt Nam' }),
    ).not.toBeInTheDocument();
  });

  it('searches Vietnamese regions from fetched options', async () => {
    const user = userEvent.setup();

    render(
      <VietnamRegionSelect
        value=""
        onValueChange={vi.fn()}
        options={[
          { value: 'HNI', label: 'Thành phố Hà Nội' },
          { value: 'HCM', label: 'Thành phố Hồ Chí Minh' },
        ]}
      />,
    );

    await user.click(screen.getByRole('combobox'));
    await user.type(
      screen.getByPlaceholderText('Tìm tỉnh/thành phố...'),
      'ho chi minh',
    );

    expect(
      screen.getByRole('option', { name: 'Thành phố Hồ Chí Minh' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Thành phố Hà Nội' }),
    ).not.toBeInTheDocument();
  });
});
