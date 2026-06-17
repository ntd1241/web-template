import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge, type StatusBadgeConfig } from './status-badge';

type TestStatus = 'active' | 'locked';

const config: StatusBadgeConfig<TestStatus> = {
  active: {
    label: 'Hoat dong',
    variant: 'success',
    dotClassName: 'bg-admin-success-dot',
  },
  locked: {
    label: 'Da khoa',
    variant: 'outline',
  },
};

describe('StatusBadge', () => {
  it('renders the configured label and badge variant', () => {
    render(<StatusBadge status="active" config={config} />);

    const badge = screen.getByText('Hoat dong');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('color-success-accent');
    expect(document.querySelector('[data-slot="badge-dot"]')).toHaveClass(
      'bg-admin-success-dot',
    );
  });

  it('falls back to the raw status when missing from config', () => {
    render(<StatusBadge status="archived" config={config} />);

    expect(screen.getByText('archived')).toBeInTheDocument();
  });
});
