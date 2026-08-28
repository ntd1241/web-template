import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SavedViewList } from './saved-view-list';

describe('SavedViewList', () => {
  it('renders the all chip, saved view chips, and add action', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const onAdd = vi.fn();

    render(
      <SavedViewList
        views={[{ id: 'potential', name: 'Khách hàng tiềm năng' }]}
        activeViewId={null}
        onViewChange={onViewChange}
        onAdd={onAdd}
      />,
    );

    expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Khách hàng tiềm năng' }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Khách hàng tiềm năng' }),
    );
    await user.click(screen.getByRole('button', { name: 'Thêm view' }));

    expect(onViewChange).toHaveBeenCalledWith('potential');
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('can hide the add action when the page permission does not allow management', () => {
    render(
      <SavedViewList
        views={[]}
        activeViewId={null}
        onViewChange={vi.fn()}
        onAdd={vi.fn()}
        canAdd={false}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Thêm view' })).toBeNull();
  });

  it('shows settings only on the active view and keeps it separate from selection', async () => {
    const user = userEvent.setup();
    const onViewSettings = vi.fn();

    render(
      <SavedViewList
        views={[
          { id: 'potential', name: 'Khách hàng tiềm năng' },
          { id: 'south', name: 'Khách hàng miền Nam' },
        ]}
        activeViewId="potential"
        onViewChange={vi.fn()}
        onViewSettings={onViewSettings}
        onAdd={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Chỉnh sửa Khách hàng tiềm năng',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Chỉnh sửa Khách hàng miền Nam' }),
    ).toBeNull();

    await user.click(
      screen.getByRole('button', {
        name: 'Chỉnh sửa Khách hàng tiềm năng',
      }),
    );

    expect(onViewSettings).toHaveBeenCalledWith({
      id: 'potential',
      name: 'Khách hàng tiềm năng',
    });
  });
});
