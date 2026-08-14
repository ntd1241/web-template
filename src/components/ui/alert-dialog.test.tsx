import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
} from './alert-dialog';

describe('AlertDialogAction', () => {
  it('renders the shared loading indicator and disables the action', () => {
    render(
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogAction loading loadingText="Đang xóa">
            Xóa
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const action = screen.getByRole('button', { name: 'Đang xóa' });

    expect(action).toBeDisabled();
    expect(action).toHaveAttribute('aria-busy', 'true');
    expect(action.querySelector('svg.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Xóa')).not.toBeInTheDocument();
  });
});
