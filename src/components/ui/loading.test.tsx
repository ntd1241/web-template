import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CardLoading, PageLoading, SectionLoading } from './loading';

describe('loading components', () => {
  it('renders card loading with a large dot-circle indicator', () => {
    render(<CardLoading label="Đang tải tổ chức..." />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-slot',
      'card-loading',
    );
    expect(screen.getByText('Đang tải tổ chức...')).toBeInTheDocument();
    expect(
      screen
        .getByRole('status')
        .querySelector('[data-slot="dot-circle-indicator"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('status')
        .querySelectorAll('[data-slot="dot-circle-indicator"] > span'),
    ).toHaveLength(12);
  });

  it('provides the previous compact loading style as section loading', () => {
    render(<SectionLoading label="Đang tải section..." />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-slot',
      'section-loading',
    );
    expect(screen.getByText('Đang tải section...')).toBeInTheDocument();
    expect(screen.getByRole('status').querySelectorAll('span')).toHaveLength(5);
  });

  it('renders full page loading with a distinct indicator', () => {
    render(<PageLoading label="Đang tải trang quản trị..." />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-slot',
      'page-loading',
    );
    expect(screen.getByText('Đang tải trang quản trị...')).toBeInTheDocument();
    expect(screen.getByRole('status').querySelector('svg')).toHaveClass(
      'animate-spin',
    );
  });
});
