import { z } from 'zod';

export const DEFAULT_PAYMENT_REMINDER_DAYS = 7;
export const MAX_PAYMENT_REMINDER_DAYS = 365;
export const DEFAULT_CHARGE_GENERATION_LEAD_DAYS = 0;
export const MAX_CHARGE_GENERATION_LEAD_DAYS = 365;

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
  chargeGenerationLeadDays: z
    .number()
    .int('Số ngày phải là số nguyên.')
    .min(0, 'Số ngày không được âm.')
    .max(
      MAX_CHARGE_GENERATION_LEAD_DAYS,
      `Số ngày không được lớn hơn ${MAX_CHARGE_GENERATION_LEAD_DAYS}.`,
    ),
});

export type TenantSettingsValues = z.infer<typeof tenantSettingsSchema>;

export interface TenantSettingsRow {
  id: string;
  name: string;
  legal_name: string | null;
  logo_url: string | null;
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
  chargeGenerationLeadDays: DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
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
    chargeGenerationLeadDays: getChargeGenerationLeadDays(row.settings),
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
