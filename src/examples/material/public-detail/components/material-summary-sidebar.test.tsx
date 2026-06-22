import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MaterialSummarySidebar } from './material-summary-sidebar';

describe('MaterialSummarySidebar', () => {
  it('hiển thị icon bên trái và ảnh QR bên phải mã vật tư', () => {
    render(<MaterialSummarySidebar />);

    const qrImage = screen.getByRole('img', { name: 'Mã QR vật tư' });
    const materialCode = screen.getByText('PCCC-BC-00128');

    expect(qrImage).toHaveAttribute(
      'src',
      'https://images.seeklogo.com/logo-png/21/2/qr-code-logo-png_seeklogo-217342.png',
    );
    expect(
      materialCode.compareDocumentPosition(qrImage) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(materialCode.closest('.flex.items-center')).toContainElement(
      document.querySelector('.lucide-qr-code'),
    );
  });
});
