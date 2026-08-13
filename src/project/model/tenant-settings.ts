import { z } from 'zod';

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
  };
}

function getStringSetting(settings: Record<string, unknown>, key: string) {
  const value = settings[key];
  return typeof value === 'string' ? value : '';
}
