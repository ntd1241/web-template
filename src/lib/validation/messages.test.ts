import { DEFAULT_LOCALE } from '@/i18n/config';
import { describe, expect, it } from 'vitest';
import { formatMessage, setValidationLocale } from './messages';

describe('validation message formatter', () => {
  it('formats Vietnamese catalog messages with params by default', () => {
    setValidationLocale(DEFAULT_LOCALE);

    expect(formatMessage('validation.string.min', { min: 3 })).toBe(
      'Tối thiểu 3 ký tự',
    );
  });

  it('falls back gracefully when a key is missing', () => {
    setValidationLocale(DEFAULT_LOCALE);

    expect(formatMessage('validation.unknown')).toBe('validation.unknown');
  });

  it('keeps module-scope formatting in sync with active locale', () => {
    setValidationLocale('en');

    expect(formatMessage('validation.number.max', { max: 10 })).toBe(
      'Maximum is 10',
    );

    setValidationLocale(DEFAULT_LOCALE);
  });
});
