import { describe, expect, it } from 'vitest';
import { materialGalleryItems } from './material-public-detail.mock';

describe('materialGalleryItems', () => {
  it('sử dụng ảnh thật được cung cấp thay cho SVG mock', () => {
    expect(materialGalleryItems.map((item) => item.url)).toEqual([
      'https://pcccgiaphu.com/upload/images/phan-biet-binh-chua-chay-1.jpg',
      'https://mesenco.com/wp-content/uploads/2024/03/BINH-CHUA-CHAY-KHI-CO2-MT5-5KG-2.jpg',
    ]);
    expect(
      materialGalleryItems.every(
        (item) => !item.url.startsWith('data:image/svg+xml'),
      ),
    ).toBe(true);
  });
});
