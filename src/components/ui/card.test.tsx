import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardFooter, CardHeader } from './card';

describe('CardHeader', () => {
  it('uses the shared p-5 padding by default', () => {
    render(
      <Card>
        <CardHeader data-testid="card-header" />
      </Card>,
    );

    expect(screen.getByTestId('card-header')).toHaveClass('p-5');
  });

  it('does not render section borders by default', () => {
    render(
      <Card>
        <CardHeader data-testid="card-header" />
        <CardFooter data-testid="card-footer" />
      </Card>,
    );

    expect(screen.getByTestId('card-header')).not.toHaveClass('border-b');
    expect(screen.getByTestId('card-footer')).not.toHaveClass('border-t');
  });

  it('renders section borders when enabled', () => {
    render(
      <Card sectionBorders="default">
        <CardHeader data-testid="card-header" />
        <CardFooter data-testid="card-footer" />
      </Card>,
    );

    expect(screen.getByTestId('card-header')).toHaveClass('border-b');
    expect(screen.getByTestId('card-footer')).toHaveClass('border-t');
  });
});
