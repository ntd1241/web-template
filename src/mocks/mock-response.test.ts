import { describe, expect, it } from 'vitest';
import { mockResponse } from './mock-response';

describe('mockResponse', () => {
  it('rejects with AbortError when the signal is cancelled', async () => {
    const controller = new AbortController();
    const pending = mockResponse('done', 100, controller.signal);

    controller.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
