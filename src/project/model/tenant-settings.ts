import { z } from 'zod';

export const DEFAULT_PAYMENT_REMINDER_DAYS = 7;
export const MAX_PAYMENT_REMINDER_DAYS = 365;
export const DEFAULT_CONTRACT_RENEWAL_REMINDER_DAYS = 30;
export const MAX_CONTRACT_RENEWAL_REMINDER_DAYS = 365;
export const DEFAULT_CHARGE_GENERATION_LEAD_DAYS = 0;
export const MAX_CHARGE_GENERATION_LEAD_DAYS = 365;
export const NUMBER_FORMAT_LOCALES = ['vi-VN', 'en-US'] as const;
export const NUMBER_FORMAT_COMPACT_DISPLAYS = ['long', 'short'] as const;
export const DEFAULT_NUMBER_FORMAT_LOCALE = 'vi-VN';
export const DEFAULT_NUMBER_FORMAT_CURRENCY_CODE = 'VND';
export const DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY = 'long';

const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Mã tiền tệ phải gồm 3 ký tự chữ in hoa.');

export const tenantSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên tổ chức.'),
  legalName: z.string().trim(),
  description: z.string().trim().max(500, 'Mô tả không được quá 500 ký tự.'),
  logoUrl: z.string().trim(),
  address: z.string().trim(),
  email: z.union([
    z.literal(''),
    z.string().trim().email('Email không hợp lệ.'),
  ]),
  phone: z.string().trim(),
  taxCode: z.string().trim(),
  website: z.string().trim(),
  paymentReminderDays: z
    .number()
    .int('Số ngày phải là số nguyên.')
    .min(0, 'Số ngày không được âm.')
    .max(
      MAX_PAYMENT_REMINDER_DAYS,
      `Số ngày không được lớn hơn ${MAX_PAYMENT_REMINDER_DAYS}.`,
    ),
  contractRenewalReminderDays: z
    .number()
    .int('Số ngày phải là số nguyên.')
    .min(0, 'Số ngày không được âm.')
    .max(
      MAX_CONTRACT_RENEWAL_REMINDER_DAYS,
      `Số ngày không được lớn hơn ${MAX_CONTRACT_RENEWAL_REMINDER_DAYS}.`,
    ),
  chargeGenerationLeadDays: z
    .number()
    .int('Số ngày phải là số nguyên.')
    .min(0, 'Số ngày không được âm.')
    .max(
      MAX_CHARGE_GENERATION_LEAD_DAYS,
      `Số ngày không được lớn hơn ${MAX_CHARGE_GENERATION_LEAD_DAYS}.`,
    ),
  numberLocale: z.enum(NUMBER_FORMAT_LOCALES),
  currencyCode: currencyCodeSchema,
  compactDisplay: z.enum(NUMBER_FORMAT_COMPACT_DISPLAYS),
});

export type TenantSettingsValues = z.infer<typeof tenantSettingsSchema>;

export interface TenantSettingsRow {
  id: string;
  name: string;
  legal_name: string | null;
  logo_url: string | null;
  default_currency_code: string | null;
  settings: Record<string, unknown>;
}

export const emptyTenantSettings: TenantSettingsValues = {
  name: '',
  legalName: '',
  description: '',
  logoUrl: '',
  address: '',
  email: '',
  phone: '',
  taxCode: '',
  website: '',
  paymentReminderDays: DEFAULT_PAYMENT_REMINDER_DAYS,
  contractRenewalReminderDays: DEFAULT_CONTRACT_RENEWAL_REMINDER_DAYS,
  chargeGenerationLeadDays: DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
  numberLocale: DEFAULT_NUMBER_FORMAT_LOCALE,
  currencyCode: DEFAULT_NUMBER_FORMAT_CURRENCY_CODE,
  compactDisplay: DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY,
};

export function mapTenantSettingsRow(
  row: TenantSettingsRow,
): TenantSettingsValues {
  return {
    name: row.name,
    legalName: row.legal_name ?? '',
    description: getStringSetting(row.settings, 'description'),
    logoUrl: row.logo_url ?? '',
    address: getStringSetting(row.settings, 'address'),
    email: getStringSetting(row.settings, 'email'),
    phone: getStringSetting(row.settings, 'phone'),
    taxCode: getStringSetting(row.settings, 'taxCode'),
    website: getStringSetting(row.settings, 'website'),
    paymentReminderDays: getPaymentReminderDays(row.settings),
    contractRenewalReminderDays: getContractRenewalReminderDays(row.settings),
    chargeGenerationLeadDays: getChargeGenerationLeadDays(row.settings),
    numberLocale: getNumberLocale(row.settings),
    currencyCode: getCurrencyCode(row.settings, row.default_currency_code),
    compactDisplay: getCompactDisplay(row.settings),
  };
}

function getStringSetting(settings: Record<string, unknown>, key: string) {
  const value = settings[key];
  return typeof value === 'string' ? value : '';
}

export function getPaymentReminderDays(
  settings: Record<string, unknown> | null | undefined,
) {
  const value = settings?.paymentReminderDays;
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_PAYMENT_REMINDER_DAYS
    ? value
    : DEFAULT_PAYMENT_REMINDER_DAYS;
}

export function getContractRenewalReminderDays(
  settings: Record<string, unknown> | null | undefined,
) {
  const value = settings?.contractRenewalReminderDays;
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_CONTRACT_RENEWAL_REMINDER_DAYS
    ? value
    : DEFAULT_CONTRACT_RENEWAL_REMINDER_DAYS;
}

export function getChargeGenerationLeadDays(
  settings: Record<string, unknown> | null | undefined,
) {
  const value = settings?.chargeGenerationLeadDays;
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= MAX_CHARGE_GENERATION_LEAD_DAYS
    ? value
    : DEFAULT_CHARGE_GENERATION_LEAD_DAYS;
}

export function getNumberLocale(
  settings: Record<string, unknown> | null | undefined,
) {
  const value = settings?.numberLocale;
  return isNumberLocale(value) ? value : DEFAULT_NUMBER_FORMAT_LOCALE;
}

export function getCurrencyCode(
  settings: Record<string, unknown> | null | undefined,
  columnValue?: unknown,
) {
  const value = columnValue ?? settings?.currencyCode;
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value)
    ? value
    : DEFAULT_NUMBER_FORMAT_CURRENCY_CODE;
}

export function getCompactDisplay(
  settings: Record<string, unknown> | null | undefined,
) {
  const value = settings?.compactDisplay;
  return value === 'short' || value === 'long'
    ? value
    : DEFAULT_NUMBER_FORMAT_COMPACT_DISPLAY;
}

function isNumberLocale(
  value: unknown,
): value is (typeof NUMBER_FORMAT_LOCALES)[number] {
  return NUMBER_FORMAT_LOCALES.includes(
    value as (typeof NUMBER_FORMAT_LOCALES)[number],
  );
}
