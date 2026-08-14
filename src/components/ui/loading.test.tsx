import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CardLoading,
  LogoSquareLoader,
  PageLoading,
  SectionLoading,
} from './loading';

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

  it('renders section loading with staggered sync dots', () => {
    render(<SectionLoading label="Đang tải section..." />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-slot',
      'section-loading',
    );
    expect(screen.getByText('Đang tải section...')).toBeInTheDocument();
    const dots = screen
      .getByRole('status')
      .querySelectorAll('[data-slot="section-loading-indicator"] > span');

    expect(dots).toHaveLength(3);
    expect(dots[0]).toHaveStyle({ animationDelay: '70ms' });
    expect(dots[1]).toHaveStyle({ animationDelay: '140ms' });
    expect(dots[2]).toHaveStyle({ animationDelay: '210ms' });
  });

  it('renders full page loading with the project logo in a square loader', () => {
    render(<PageLoading label="Đang tải trang quản trị..." />);

    expect(screen.getByRole('status')).toHaveAttribute(
      'data-slot',
      'page-loading',
    );
    expect(screen.getByText('Đang tải trang quản trị...')).toBeInTheDocument();
    expect(
      screen
        .getByRole('status')
        .querySelector('[data-slot="logo-square-loader"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('status')
        .querySelector('[data-slot="logo-square-loader"] img'),
    ).toHaveAttribute('src', '/media/app/android-chrome-512x512.png');
  });

  it('exposes the logo square loader as a reusable indicator', () => {
    render(<LogoSquareLoader />);

    expect(
      document.querySelector('[data-slot="logo-square-loader"] img'),
    ).toHaveAttribute('src', '/media/app/android-chrome-512x512.png');
  });
});
