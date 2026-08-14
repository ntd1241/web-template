import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardHeader } from './card';

describe('CardHeader', () => {
  it('uses the shared p-5 padding by default', () => {
    render(
      <Card>
        <CardHeader data-testid="card-header" />
      </Card>,
    );

    expect(screen.getByTestId('card-header')).toHaveClass('p-5');
  });
});
