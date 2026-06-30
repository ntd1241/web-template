import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MaterialSummarySidebar } from './material-summary-sidebar';

describe('MaterialSummarySidebar', () => {
  it('hiển thị icon bên trái và QR thật bên phải mã vật tư', () => {
    render(<MaterialSummarySidebar />);

    const qrImage = screen.getAllByRole('img', {
      name: 'QR Code PCCC-BC-00128',
    })[0];
    const materialCode = screen.getAllByText('PCCC-BC-00128')[0];

    expect(qrImage.tagName).toBe('svg');
    expect(qrImage).toHaveAttribute('data-qr-value', window.location.href);
    expect(
      materialCode.compareDocumentPosition(qrImage) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(materialCode.closest('.flex.items-center')).toContainElement(
      document.querySelector('.lucide-qr-code'),
    );
  });
});
