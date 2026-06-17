/**
 * Vietnamese number formatting uses `.` for thousands and `,` for decimals.
 * Keep values numeric until the final display step so callers do not
 * double-format user-visible numbers.
 */

const numberFormatter = new Intl.NumberFormat('vi-VN');
const currencyVndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const compactFormatter = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatterCache = new Map<string, Intl.NumberFormat>();
const percentFormatterCache = new Map<number, Intl.NumberFormat>();

function isFormattableNumber(
  value: number | null | undefined,
): value is number {
  return value !== null && value !== undefined && !Number.isNaN(value);
}

function getNumberFormatter(
  options: Intl.NumberFormatOptions | undefined,
): Intl.NumberFormat {
  if (!options) {
    return numberFormatter;
  }

  const cacheKey = JSON.stringify(options);
  const cachedFormatter = numberFormatterCache.get(cacheKey);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.NumberFormat('vi-VN', options);
  numberFormatterCache.set(cacheKey, formatter);

  return formatter;
}

function getPercentFormatter(fractionDigits: number): Intl.NumberFormat {
  const cachedFormatter = percentFormatterCache.get(fractionDigits);

  if (cachedFormatter) {
    return cachedFormatter;
  }

  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  percentFormatterCache.set(fractionDigits, formatter);

  return formatter;
}

export function formatNumber(
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (!isFormattableNumber(value)) {
    return '';
  }

  try {
    return getNumberFormatter(options).format(value);
  } catch {
    return '';
  }
}

export function formatCurrencyVND(value: number | null | undefined): string {
  if (!isFormattableNumber(value)) {
    return '';
  }

  try {
    return currencyVndFormatter.format(value);
  } catch {
    return '';
  }
}

/** Formats a ratio as a percent: `0.125` renders as `12,5%`. */
export function formatPercent(
  value: number | null | undefined,
  fractionDigits = 0,
): string {
  if (!isFormattableNumber(value)) {
    return '';
  }

  try {
    return getPercentFormatter(fractionDigits).format(value);
  } catch {
    return '';
  }
}

export function formatCompact(value: number | null | undefined): string {
  if (!isFormattableNumber(value)) {
    return '';
  }

  try {
    return compactFormatter.format(value);
  } catch {
    return '';
  }
}
