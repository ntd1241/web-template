import {
  DEFAULT_LOCALE,
  LOCALES,
  messagesByLocale,
  type Locale,
} from '@/i18n/config';

export type MessageParams = Record<
  string,
  string | number | boolean | null | undefined
>;

let activeLocale: Locale = DEFAULT_LOCALE;

function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function setValidationLocale(locale: Locale): void {
  activeLocale = locale;
}

export function getValidationLocale(): Locale {
  return activeLocale;
}

export function formatMessage(key: string, params: MessageParams = {}): string {
  const catalog = messagesByLocale[activeLocale] ?? messagesByLocale.vi;
  const fallbackCatalog = messagesByLocale[DEFAULT_LOCALE];
  const template = catalog[key] ?? fallbackCatalog[key] ?? key;

  return template.replace(/\{([^{}]+)\}/g, (match, paramName: string) => {
    const value = params[paramName];
    return value === undefined || value === null ? match : String(value);
  });
}

export function syncValidationLocale(locale: string): void {
  setValidationLocale(isLocale(locale) ? locale : DEFAULT_LOCALE);
}
