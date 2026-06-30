import { describe, expect, it, vi } from 'vitest';
import { toAbsoluteUrl } from './helpers';

describe('toAbsoluteUrl', () => {
  it('normalizes public asset paths for GitHub Pages base URLs', () => {
    vi.stubEnv('BASE_URL', '/web-template/');

    expect(toAbsoluteUrl('/media/images/fire-extinguisher.png')).toBe(
      '/web-template/media/images/fire-extinguisher.png',
    );
  });

  it('keeps root-hosted public asset paths absolute in local builds', () => {
    vi.stubEnv('BASE_URL', '/');

    expect(toAbsoluteUrl('/media/images/fire-extinguisher.png')).toBe(
      '/media/images/fire-extinguisher.png',
    );
  });
});
