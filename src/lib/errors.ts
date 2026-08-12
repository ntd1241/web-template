import { toast } from 'sonner';
import type { ApiError } from '@/types/api.types';
import { formatMessage } from './validation/messages';

export interface ApiErrorMessageOptions {
  fallbackMessage?: string;
  statusMessages?: Partial<Record<number, string>>;
}

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

function getStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  const status =
    error.status ?? (isRecord(error.response) && error.response.status);
  return typeof status === 'number' ? status : undefined;
}

function getResponseData(error: unknown): unknown {
  if (!isRecord(error) || !isRecord(error.response)) return undefined;

  return error.response.data;
}

function getPayloadMessage(payload: unknown): string | undefined {
  if (isNonEmptyString(payload)) return payload.trim();
  if (!isRecord(payload)) return undefined;

  return (
    (isNonEmptyString(payload.message) && payload.message.trim()) ||
    (isNonEmptyString(payload.detail) && payload.detail.trim()) ||
    (isNonEmptyString(payload.title) && payload.title.trim()) ||
    undefined
  );
}

export function getApiErrorMessage(
  error: unknown,
  options: ApiErrorMessageOptions = {},
): string {
  const status = getStatus(error);
  const statusMessage = status && options.statusMessages?.[status];

  if (statusMessage) return statusMessage;
  if (status === 413) {
    return 'Tệp tải lên vượt quá dung lượng cho phép. Vui lòng chọn tệp nhỏ hơn.';
  }

  if (isApiError(error) && isNonEmptyString(error.message)) {
    return error.message;
  }

  const backendMessage = getPayloadMessage(getResponseData(error));
  if (backendMessage) return backendMessage;

  if (error instanceof Error && isNonEmptyString(error.message)) {
    return error.message;
  }

  if (isNonEmptyString(error)) {
    return error;
  }

  return options.fallbackMessage ?? getFallbackMessage();
}

export function getErrorMessage(error: unknown): string {
  return getApiErrorMessage(error);
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
  if (
    (error instanceof Error && error.name === 'AbortError') ||
    (isRecord(error) && error.code === 'ERR_CANCELED')
  ) {
    return;
  }

  toast.error(getErrorMessage(error));
}
