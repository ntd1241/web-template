import { z } from 'zod';
import { formatMessage } from './messages';

/**
 * Thin Zod v4 builders for shared form constraints (docs/01 §8).
 * Keep business and cross-field rules in feature schemas with `.refine()`;
 * this layer only wires common constraints to the i18n validation catalog.
 */

export interface VStringOptions {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  trim?: boolean;
}

export interface VNumberOptions {
  required?: boolean;
  min?: number;
  max?: number;
  int?: boolean;
}

type RequiredOption = { required?: true };
type OptionalOption = { required: false };

export function vString(options?: VStringOptions & RequiredOption): z.ZodString;
export function vString(
  options: VStringOptions & OptionalOption,
): z.ZodOptional<z.ZodString>;
export function vString(
  options: VStringOptions = {},
): z.ZodString | z.ZodOptional<z.ZodString> {
  const { required = true, min, max, pattern, trim = false } = options;
  let schema = z.string({
    error: () => formatMessage('validation.required'),
  });

  if (trim) {
    schema = schema.trim();
  }

  if (required) {
    schema = schema.min(1, {
      error: () => formatMessage('validation.required'),
    });
  }

  if (min !== undefined) {
    schema = schema.min(min, {
      error: () => formatMessage('validation.string.min', { min }),
    });
  }

  if (max !== undefined) {
    schema = schema.max(max, {
      error: () => formatMessage('validation.string.max', { max }),
    });
  }

  if (pattern) {
    schema = schema.regex(pattern, {
      error: () => formatMessage('validation.string.pattern'),
    });
  }

  return required ? schema : schema.optional();
}

export function vNumber(options?: VNumberOptions & RequiredOption): z.ZodNumber;
export function vNumber(
  options: VNumberOptions & OptionalOption,
): z.ZodOptional<z.ZodNumber>;
export function vNumber(
  options: VNumberOptions = {},
): z.ZodNumber | z.ZodOptional<z.ZodNumber> {
  const { required = true, min, max, int = false } = options;
  let schema = z.number({
    error: () => formatMessage('validation.required'),
  });

  if (int) {
    schema = schema.int({
      error: () => formatMessage('validation.number.int'),
    });
  }

  if (min !== undefined) {
    schema = schema.min(min, {
      error: () => formatMessage('validation.number.min', { min }),
    });
  }

  if (max !== undefined) {
    schema = schema.max(max, {
      error: () => formatMessage('validation.number.max', { max }),
    });
  }

  return required ? schema : schema.optional();
}

export function vEmail(options?: RequiredOption): z.ZodString;
export function vEmail(options: OptionalOption): z.ZodOptional<z.ZodString>;
export function vEmail(
  options: RequiredOption | OptionalOption = {},
): z.ZodString | z.ZodOptional<z.ZodString> {
  const { required = true } = options;
  let schema = z.string({
    error: () => formatMessage('validation.required'),
  });

  if (required) {
    schema = schema.min(1, {
      error: () => formatMessage('validation.required'),
    });
  }

  schema = schema.email({
    error: () => formatMessage('validation.email'),
  });

  return required ? schema : schema.optional();
}

export function vPhoneVN(options?: RequiredOption): z.ZodString;
export function vPhoneVN(options: OptionalOption): z.ZodOptional<z.ZodString>;
export function vPhoneVN(
  options: RequiredOption | OptionalOption = {},
): z.ZodString | z.ZodOptional<z.ZodString> {
  const { required = true } = options;
  const phonePattern = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
  let schema = z.string({
    error: () => formatMessage('validation.required'),
  });

  if (required) {
    schema = schema.min(1, {
      error: () => formatMessage('validation.required'),
    });
  }

  schema = schema.regex(phonePattern, {
    error: () => formatMessage('validation.phoneVN'),
  });

  return required ? schema : schema.optional();
}

export function vRequiredEnum<
  const TValues extends readonly [string, ...string[]],
>(values: TValues) {
  return z.array(z.enum(values)).min(1, {
    error: () => formatMessage('validation.required'),
  });
}
