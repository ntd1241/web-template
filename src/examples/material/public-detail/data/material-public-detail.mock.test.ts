import { describe, expect, it } from 'vitest';
import { materialGalleryItems } from './material-public-detail.mock';

describe('materialGalleryItems', () => {
  it('sử dụng ảnh thật được cung cấp thay cho SVG mock', () => {
    expect(materialGalleryItems.map((item) => item.url)).toEqual([
      '/media/images/ChatGPT Image Jun 30, 2026, 04_02_48 PM.png',
      '/media/images/ChatGPT Image Jun 30, 2026, 04_11_54 PM.png',
    ]);
    expect(
      materialGalleryItems.every(
        (item) => !item.url.startsWith('data:image/svg+xml'),
      ),
    ).toBe(true);
  });
});
