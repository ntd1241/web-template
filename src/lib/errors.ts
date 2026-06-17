import { toast } from 'sonner';
import type { ApiError } from '@/types/api.types';
import { formatMessage } from './validation/messages';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFieldErrors(value: unknown): value is Record<string, string[]> {
  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(
    (messages) =>
      Array.isArray(messages) &&
      messages.every((message) => typeof message === 'string'),
  );
}

function getFallbackMessage(): string {
  const message = formatMessage('common.state.error');

  return isNonEmptyString(message) ? message : 'Đã có lỗi xảy ra';
}

export function isApiError(value: unknown): value is ApiError {
  if (!isRecord(value) || typeof value.message !== 'string') {
    return false;
  }

  return value.status === undefined || typeof value.status === 'number';
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error) && isNonEmptyString(error.message)) {
    return error.message;
  }

  if (error instanceof Error && isNonEmptyString(error.message)) {
    return error.message;
  }

  if (isNonEmptyString(error)) {
    return error;
  }

  return getFallbackMessage();
}

export function getFieldErrors(
  error: unknown,
): Record<string, string[]> | undefined {
  if (!isApiError(error) || !isFieldErrors(error.errors)) {
    return undefined;
  }

  return error.errors;
}

export function toastError(error: unknown): void {
  toast.error(getErrorMessage(error));
}
