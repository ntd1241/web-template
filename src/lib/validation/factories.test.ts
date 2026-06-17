import { describe, expect, it } from 'vitest';
import { vEmail, vNumber, vPhoneVN, vRequiredEnum, vString } from './factories';
import { formatMessage, setValidationLocale } from './messages';

describe('validation factories', () => {
  it('validates string min and max boundaries with catalog messages', () => {
    setValidationLocale('vi');
    const schema = vString({ min: 3, max: 5 });

    expect(schema.safeParse('abc').success).toBe(true);
    expect(schema.safeParse('abcdef').success).toBe(false);
    expect(schema.safeParse('ab').error?.issues[0]?.message).toBe(
      formatMessage('validation.string.min', { min: 3 }),
    );
    expect(schema.safeParse('abcdef').error?.issues[0]?.message).toBe(
      formatMessage('validation.string.max', { max: 5 }),
    );
  });

  it('distinguishes optional and required strings', () => {
    expect(vString({ required: false }).safeParse(undefined).success).toBe(
      true,
    );
    expect(vString().safeParse('').error?.issues[0]?.message).toBe(
      formatMessage('validation.required'),
    );
  });

  it('validates number min, max, and integer boundaries', () => {
    const schema = vNumber({ min: 1, max: 10, int: true });

    expect(schema.safeParse(5).success).toBe(true);
    expect(schema.safeParse(1.5).error?.issues[0]?.message).toBe(
      formatMessage('validation.number.int'),
    );
    expect(schema.safeParse(0).error?.issues[0]?.message).toBe(
      formatMessage('validation.number.min', { min: 1 }),
    );
    expect(schema.safeParse(11).error?.issues[0]?.message).toBe(
      formatMessage('validation.number.max', { max: 10 }),
    );
    expect(vNumber({ required: false }).safeParse(undefined).success).toBe(
      true,
    );
  });

  it('validates email and Vietnamese phone numbers', () => {
    expect(vEmail().safeParse('name@example.com').success).toBe(true);
    expect(vEmail().safeParse('bad-email').error?.issues[0]?.message).toBe(
      formatMessage('validation.email'),
    );

    expect(vPhoneVN().safeParse('0912345678').success).toBe(true);
    expect(vPhoneVN().safeParse('12345').error?.issues[0]?.message).toBe(
      formatMessage('validation.phoneVN'),
    );
  });

  it('validates required enum arrays', () => {
    const schema = vRequiredEnum(['admin', 'staff'] as const);

    expect(schema.safeParse(['admin']).success).toBe(true);
    expect(schema.safeParse([]).error?.issues[0]?.message).toBe(
      formatMessage('validation.required'),
    );
  });
});
