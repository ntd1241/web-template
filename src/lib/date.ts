import type { Locale } from '@/i18n/config';
import {
  format as formatDateFns,
  formatDistanceToNow,
  isValid,
} from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { getValidationLocale } from './validation';

export type DateInput = Date | string | number | undefined;

const DATE_LOCALES: Partial<Record<Locale, typeof vi>> = {
  vi,
};

function getDateLocale(): typeof vi {
  return DATE_LOCALES[getValidationLocale()] ?? vi;
}

function toValidDate(value: DateInput): Date | null {
  if (value === undefined) return null;

  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return isValid(date) ? date : null;
}

function formatWithPattern(value: DateInput, pattern: string): string {
  const date = toValidDate(value);
  if (!date) return '';

  try {
    return formatDateFns(date, pattern, { locale: getDateLocale() });
  } catch {
    return '';
  }
}

export function formatRelative(value: DateInput): string {
  const date = toValidDate(value);
  if (!date) return '';

  try {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: getDateLocale(),
    });
  } catch {
    return '';
  }
}

export function formatDate(value: DateInput): string {
  return formatWithPattern(value, 'dd/MM/yyyy');
}

export function formatDateTime(value: DateInput): string {
  return formatWithPattern(value, 'dd/MM/yyyy HH:mm');
}

export function formatTime(value: DateInput): string {
  return formatWithPattern(value, 'HH:mm');
}
