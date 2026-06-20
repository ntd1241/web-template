import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Calendar } from './calendar';

describe('Calendar', () => {
  it('keeps dropdown captions clean and ghost styled', () => {
    const { container } = render(
      <Calendar defaultMonth={new Date(2026, 10)} mode="single" />,
    );

    const selects = container.querySelectorAll('select');
    const hiddenCaptionLabels = container.querySelectorAll(
      'span[aria-hidden="true"].sr-only',
    );

    expect(selects).toHaveLength(2);
    expect(hiddenCaptionLabels).toHaveLength(2);
    expect(selects[0]).toHaveDisplayValue('11');
    expect(
      container.querySelector('[data-slot="calendar-caption-separator"]'),
    ).toHaveTextContent('/');
    expect(
      Array.from(selects[0].querySelectorAll('option')).some(
        (option) => option.textContent === '06',
      ),
    ).toBe(true);
    selects.forEach((select) => {
      expect(select).toHaveClass('w-16');
      expect(select).toHaveClass('appearance-none');
      expect(select).toHaveClass('border-transparent');
      expect(select).toHaveClass('bg-transparent');
    });
  });
});
