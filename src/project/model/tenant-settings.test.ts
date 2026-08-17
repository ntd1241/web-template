import { describe, expect, it } from 'vitest';
import {
  DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
  getChargeGenerationLeadDays,
  mapTenantSettingsRow,
  tenantSettingsSchema,
} from './tenant-settings';

describe('tenant charge generation settings', () => {
  it('defaults missing or invalid lead days to zero', () => {
    expect(getChargeGenerationLeadDays(undefined)).toBe(
      DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
    );
    expect(getChargeGenerationLeadDays({ chargeGenerationLeadDays: -1 })).toBe(
      DEFAULT_CHARGE_GENERATION_LEAD_DAYS,
    );
    expect(getChargeGenerationLeadDays({ chargeGenerationLeadDays: 14 })).toBe(
      14,
    );
  });

  it('maps the lead window without changing the reminder window', () => {
    const values = mapTenantSettingsRow({
      id: 'tenant-1',
      name: 'Tenant',
      legal_name: null,
      logo_url: null,
      settings: {
        paymentReminderDays: 7,
        chargeGenerationLeadDays: 14,
      },
    });

    expect(values.paymentReminderDays).toBe(7);
    expect(values.chargeGenerationLeadDays).toBe(14);
  });

  it('rejects a negative lead window', () => {
    const result = tenantSettingsSchema.safeParse({
      name: 'Tenant',
      legalName: '',
      description: '',
      logoUrl: '',
      address: '',
      email: '',
      phone: '',
      taxCode: '',
      website: '',
      paymentReminderDays: 7,
      chargeGenerationLeadDays: -1,
    });

    expect(result.success).toBe(false);
  });
});
