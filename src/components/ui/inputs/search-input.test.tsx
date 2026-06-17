import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from './search-input';

describe('SearchInput', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires onSearch once after the debounce window', () => {
    vi.useFakeTimers();
    const handleSearch = vi.fn();

    render(
      <SearchInput
        aria-label="Tìm kiếm"
        debounceMs={300}
        onSearch={handleSearch}
      />,
    );

    fireEvent.change(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), {
      target: { value: 'huy' },
    });

    expect(handleSearch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(299));
    expect(handleSearch).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('huy');
  });

  it('clears immediately and cancels pending debounce', () => {
    vi.useFakeTimers();
    const handleSearch = vi.fn();

    render(
      <SearchInput
        aria-label="Tìm kiếm"
        debounceMs={300}
        onSearch={handleSearch}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Tìm kiếm' });
    fireEvent.change(input, { target: { value: 'quan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tìm kiếm' }));

    expect(input).toHaveValue('');
    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('');

    act(() => vi.advanceTimersByTime(300));
    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});
