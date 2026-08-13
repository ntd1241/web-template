import axios, { AxiosError, type AxiosAdapter } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api, configureApiAuth } from './axios';

const adapter = vi.fn<AxiosAdapter>();

describe('api axios instance', () => {
  beforeEach(() => {
    api.defaults.adapter = adapter;
    configureApiAuth({
      getToken: () => 'test-token',
      onUnauthorized: vi.fn(),
    });
  });

  afterEach(() => {
    adapter.mockReset();
  });

  it('gắn token và Content-Type JSON cho request object', async () => {
    adapter.mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    await api.post('/employees', { name: 'Thanh Hiếu' });

    const request = adapter.mock.calls[0][0];
    expect(request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(request.headers.get('Content-Type')).toBe('application/json');
  });

  it('không ép Content-Type JSON cho FormData', async () => {
    adapter.mockResolvedValue({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    const body = new FormData();
    body.append('file', new Blob(['demo']), 'demo.txt');

    await api.post('/files', body);

    const request = adapter.mock.calls[0][0];
    expect(request.headers.get('Content-Type')).not.toBe('application/json');
  });

  it('chuẩn hóa lỗi response và gọi logout cho 401', async () => {
    const onUnauthorized = vi.fn();
    configureApiAuth({ getToken: () => null, onUnauthorized });

    adapter.mockRejectedValue(
      new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        undefined,
        undefined,
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: { 'x-request-id': 'request-123' },
          config: {} as never,
          data: {
            message: 'Phiên đăng nhập đã hết hạn',
            code: 'AUTH_EXPIRED',
            errors: { token: ['Token hết hạn'] },
          },
        },
      ),
    );

    await expect(api.get('/me')).rejects.toMatchObject({
      message: 'Phiên đăng nhập đã hết hạn',
      status: 401,
      code: 'AUTH_EXPIRED',
      requestId: 'request-123',
      errors: { token: ['Token hết hạn'] },
      isNetworkError: false,
    });
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it('refresh token rồi retry request khi access token hết hạn', async () => {
    const onUnauthorized = vi.fn();
    const refreshAccessToken = vi.fn().mockResolvedValue({
      token: 'refreshed-token',
      refreshToken: 'refreshed-refresh-token',
    });
    configureApiAuth({
      getToken: () => 'expired-token',
      getRefreshToken: () => 'refresh-token',
      refreshAccessToken,
      onUnauthorized,
    });

    adapter.mockImplementationOnce(async (config) => {
      throw new AxiosError(
        'Request failed',
        'ERR_BAD_REQUEST',
        config,
        undefined,
        {
          status: 401,
          statusText: 'Unauthorized',
          headers: {},
          config,
          data: { message: 'Phiên đăng nhập đã hết hạn' },
        },
      );
    });
    adapter.mockResolvedValueOnce({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    await expect(api.get('/me')).resolves.toEqual({ ok: true });

    expect(refreshAccessToken).toHaveBeenCalledOnce();
    expect(onUnauthorized).not.toHaveBeenCalled();
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(adapter.mock.calls[1][0].headers.get('Authorization')).toBe(
      'Bearer refreshed-token',
    );
  });
});
