import { DEFAULT_LOCALE } from '@/i18n/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiError } from '@/types/api.types';
import {
  getErrorMessage,
  getFieldErrors,
  isApiError,
  toastError,
} from './errors';
import { setValidationLocale } from './validation/messages';

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: toastErrorMock,
  },
}));

describe('error helpers', () => {
  beforeEach(() => {
    toastErrorMock.mockClear();
    setValidationLocale(DEFAULT_LOCALE);
  });

  it('narrows ApiError-shaped values', () => {
    expect(isApiError({ message: 'Không hợp lệ', status: 422 })).toBe(true);
    expect(isApiError({ message: 'Không hợp lệ' })).toBe(true);
    expect(isApiError({ message: 'Không hợp lệ', status: '422' })).toBe(false);
    expect(isApiError({ status: 500 })).toBe(false);
  });

  it('prefers ApiError messages', () => {
    const error: ApiError = {
      message: 'Không thể cập nhật nhân viên',
      status: 400,
    };

    expect(getErrorMessage(error)).toBe('Không thể cập nhật nhân viên');
  });

  it('uses native Error messages', () => {
    expect(getErrorMessage(new Error('Kết nối bị gián đoạn'))).toBe(
      'Kết nối bị gián đoạn',
    );
  });

  it('uses non-empty string errors', () => {
    expect(getErrorMessage('Lỗi từ mock')).toBe('Lỗi từ mock');
  });

  it('falls back to the validation message catalog', () => {
    expect(getErrorMessage({ code: 'UNKNOWN' })).toBe('Đã có lỗi xảy ra');
    expect(getErrorMessage('   ')).toBe('Đã có lỗi xảy ra');
  });

  it('returns field errors when present on ApiError', () => {
    const fieldErrors = {
      name: ['Tên nhân viên là bắt buộc'],
    };

    expect(
      getFieldErrors({ message: 'Không hợp lệ', errors: fieldErrors }),
    ).toBe(fieldErrors);
  });

  it('returns undefined when field errors are absent or invalid', () => {
    expect(getFieldErrors({ message: 'Không hợp lệ' })).toBeUndefined();
    expect(
      getFieldErrors({ message: 'Không hợp lệ', errors: { name: 'Sai' } }),
    ).toBeUndefined();
    expect(getFieldErrors(new Error('Sai'))).toBeUndefined();
  });

  it('toasts the resolved error message', () => {
    toastError({ message: 'Không thể lưu dữ liệu' });

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith('Không thể lưu dữ liệu');
  });
});
