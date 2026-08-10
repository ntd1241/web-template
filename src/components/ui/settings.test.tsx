import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsGroup, SettingsRow } from './settings';

describe('SettingsGroup and SettingsRow', () => {
  it('supports rich title and description content', () => {
    render(
      <SettingsGroup>
        <SettingsRow
          title={
            <span data-testid="rich-title">
              Email <strong>quan trọng</strong>
            </span>
          }
          description={<a href="/notifications">Xem tùy chọn</a>}
          control={<button type="button">Bật</button>}
        />
      </SettingsGroup>,
    );

    expect(screen.getByTestId('rich-title')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Xem tùy chọn' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bật' })).toBeInTheDocument();
    expect(screen.getByTestId('rich-title').parentElement).toHaveAttribute(
      'data-slot',
      'settings-row-title',
    );
  });

  it('allows row and slot class customization', () => {
    render(
      <SettingsRow
        title="Tiêu đề"
        description="Mô tả"
        titleClassName="text-primary"
        descriptionClassName="text-foreground"
        controlClassName="text-destructive"
        className="bg-muted"
        control={<span>Action</span>}
      />,
    );

    expect(screen.getByText('Tiêu đề')).toHaveClass('text-primary');
    expect(screen.getByText('Mô tả')).toHaveClass('text-foreground');
    expect(screen.getByText('Action').parentElement).toHaveClass(
      'text-destructive',
    );
    expect(
      screen.getByText('Tiêu đề').closest('[data-slot="settings-row"]'),
    ).toHaveClass('bg-muted');
  });
});
