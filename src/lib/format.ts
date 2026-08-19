/**
 * Shared number formatting primitives.
 *
 * Values stay numeric until the final display step. The provider layer can
 * create these formatters from tenant settings, while these exports keep a
 * safe Vietnamese/VND default for non-React code and legacy callers.
 */

export type CompactDisplay = 'long' | 'short';

export interface NumberFormatSettings {
  locale: string;
  currencyCode: string;
  compactDisplay: CompactDisplay;
}

export const DEFAULT_NUMBER_FORMAT_SETTINGS: NumberFormatSettings = {
  locale: 'vi-VN',
  currencyCode: 'VND',
  compactDisplay: 'long',
};

export interface NumberInputSeparators {
  thousandSeparator: string;
  decimalSeparator: string;
}

export interface NumberFormatters {
  settings: NumberFormatSettings;
  inputSeparators: NumberInputSeparators;
  formatNumber: (
    value: number | null | undefined,
    options?: Intl.NumberFormatOptions,
  ) => string;
  formatCurrency: (
    value: number | null | undefined,
    currencyCode?: string,
    options?: Intl.NumberFormatOptions,
  ) => string;
  formatCurrencyVND: (value: number | null | undefined) => string;
  formatPercent: (
    value: number | null | undefined,
    fractionDigits?: number,
  ) => string;
  formatCompact: (value: number | null | undefined) => string;
  formatCompactCurrency: (
    value: number | null | undefined,
    currencyCode?: string,
  ) => string;
}

const formatterCache = new Map<string, Intl.NumberFormat>();

function isFormattableNumber(
  value: number | null | undefined,
): value is number {
  return value !== null && value !== undefined && Number.isFinite(value);
}

function safeLocale(locale: string): string {
  try {
    new Intl.NumberFormat(locale);
    return locale;
  } catch {
    return DEFAULT_NUMBER_FORMAT_SETTINGS.locale;
  }
}

function safeCurrencyCode(currencyCode: string): string {
  return /^[A-Z]{3}$/.test(currencyCode)
    ? currencyCode
    : DEFAULT_NUMBER_FORMAT_SETTINGS.currencyCode;
}

function getFormatter(
  locale: string,
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormat {
  const normalizedLocale = safeLocale(locale);
  const cacheKey = JSON.stringify([normalizedLocale, options]);
  const cachedFormatter = formatterCache.get(cacheKey);

  if (cachedFormatter) return cachedFormatter;

  const formatter = new Intl.NumberFormat(normalizedLocale, options);
  formatterCache.set(cacheKey, formatter);
  return formatter;
}

function getInputSeparators(locale: string): NumberInputSeparators {
  const parts = getFormatter(locale).formatToParts(12345.6);
  return {
    thousandSeparator:
      parts.find((part) => part.type === 'group')?.value ?? ',',
    decimalSeparator:
      parts.find((part) => part.type === 'decimal')?.value ?? '.',
  };
}

function getCompactUnit(
  locale: string,
  value: number,
  compactDisplay: CompactDisplay,
) {
  const absValue = Math.abs(value);
  const isVietnamese = locale.toLowerCase().startsWith('vi');

  if (absValue >= 1_000_000_000) {
    return isVietnamese
      ? compactDisplay === 'long'
        ? { divisor: 1_000_000_000, label: 'tỷ' }
        : { divisor: 1_000_000_000, label: 'Tỷ' }
      : compactDisplay === 'long'
        ? { divisor: 1_000_000_000, label: 'billion' }
        : { divisor: 1_000_000_000, label: 'B' };
  }

  if (absValue >= 1_000_000) {
    return isVietnamese
      ? compactDisplay === 'long'
        ? { divisor: 1_000_000, label: 'triệu' }
        : { divisor: 1_000_000, label: 'Tr' }
      : compactDisplay === 'long'
        ? { divisor: 1_000_000, label: 'million' }
        : { divisor: 1_000_000, label: 'M' };
  }

  if (absValue >= 1_000) {
    return isVietnamese
      ? compactDisplay === 'long'
        ? { divisor: 1_000, label: 'nghìn' }
        : { divisor: 1_000, label: 'N' }
      : compactDisplay === 'long'
        ? { divisor: 1_000, label: 'thousand' }
        : { divisor: 1_000, label: 'K' };
  }

  return null;
}

function formatCompactCurrencyValue(
  value: number,
  locale: string,
  currencyCode: string,
  compactDisplay: CompactDisplay,
): string {
  const unit = getCompactUnit(locale, value, compactDisplay);
  if (!unit) {
    return getFormatter(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const scaledValue = value / unit.divisor;
  const numberText = getFormatter(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(scaledValue);
  const currencyParts = getFormatter(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);
  const currencyPart = currencyParts.find((part) => part.type === 'currency');

  if (!currencyPart) return `${numberText} ${unit.label}`;

  const firstNumberIndex = currencyParts.findIndex(
    (part) => part.type === 'integer' || part.type === 'decimal',
  );
  const currencyIndex = currencyParts.findIndex(
    (part) => part.type === 'currency',
  );

  return currencyIndex < firstNumberIndex
    ? `${currencyPart.value}${numberText} ${unit.label}`
    : `${numberText} ${unit.label} ${currencyPart.value}`;
}

export function createNumberFormatters(
  settings: NumberFormatSettings = DEFAULT_NUMBER_FORMAT_SETTINGS,
): NumberFormatters {
  const normalizedSettings: NumberFormatSettings = {
    locale: safeLocale(settings.locale),
    currencyCode: safeCurrencyCode(settings.currencyCode),
    compactDisplay: settings.compactDisplay === 'short' ? 'short' : 'long',
  };

  const formatNumber = (
    value: number | null | undefined,
    options?: Intl.NumberFormatOptions,
  ) => {
    if (!isFormattableNumber(value)) return '';
    return getFormatter(normalizedSettings.locale, options).format(value);
  };

  const formatCurrency = (
    value: number | null | undefined,
    currencyCode = normalizedSettings.currencyCode,
    options: Intl.NumberFormatOptions = {},
  ) => {
    if (!isFormattableNumber(value)) return '';
    return getFormatter(normalizedSettings.locale, {
      style: 'currency',
      currency: safeCurrencyCode(currencyCode),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    }).format(value);
  };

  const formatCurrencyVND = (value: number | null | undefined) =>
    formatCurrency(value, 'VND');

  const formatPercent = (
    value: number | null | undefined,
    fractionDigits = 0,
  ) => {
    if (!isFormattableNumber(value)) return '';
    return getFormatter(normalizedSettings.locale, {
      style: 'percent',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  };

  const formatCompact = (value: number | null | undefined) => {
    if (!isFormattableNumber(value)) return '';
    return getFormatter(normalizedSettings.locale, {
      notation: 'compact',
      compactDisplay: normalizedSettings.compactDisplay,
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatCompactCurrency = (
    value: number | null | undefined,
    currencyCode = normalizedSettings.currencyCode,
  ) => {
    if (!isFormattableNumber(value)) return '';
    return formatCompactCurrencyValue(
      value,
      normalizedSettings.locale,
      safeCurrencyCode(currencyCode),
      normalizedSettings.compactDisplay,
    );
  };

  return {
    settings: normalizedSettings,
    inputSeparators: getInputSeparators(normalizedSettings.locale),
    formatNumber,
    formatCurrency,
    formatCurrencyVND,
    formatPercent,
    formatCompact,
    formatCompactCurrency,
  };
}

const defaultFormatters = createNumberFormatters();

export const formatNumber = defaultFormatters.formatNumber;
export const formatCurrency = defaultFormatters.formatCurrency;
export const formatCurrencyVND = defaultFormatters.formatCurrencyVND;
export const formatPercent = defaultFormatters.formatPercent;
export const formatCompact = defaultFormatters.formatCompact;
export const formatCompactCurrency = defaultFormatters.formatCompactCurrency;
