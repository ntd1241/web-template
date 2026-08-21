import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProcessingStep } from './processing-step';

describe('ProcessingStep', () => {
  it.each([
    ['idle', 'text-muted-foreground'],
    ['processing', 'text-primary'],
    ['success', 'text-[var(--color-success-accent,var(--color-green-600))]'],
    ['error', 'text-destructive'],
  ] as const)('applies the %s state to the icon and title', (state, color) => {
    render(
      <ProcessingStep
        state={state}
        title="Kiểm tra dữ liệu"
        description="Đang kiểm tra dữ liệu."
      />,
    );

    expect(screen.getByRole('heading')).toHaveClass(color);
    expect(
      screen.getByRole('heading').parentElement?.parentElement,
    ).toHaveAttribute('data-state', state);
  });
});
