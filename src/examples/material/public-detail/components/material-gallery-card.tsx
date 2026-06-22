import { useState } from 'react';
import { cn } from '@/lib/utils';
import { materialGalleryItems } from '../data/material-public-detail.mock';

export function MaterialGalleryCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = materialGalleryItems[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      {/* Ảnh preview đang chọn */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-admin-neutral-100 bg-admin-neutral-bg sm:aspect-[16/10]">
        <img
          key={activeImage.id}
          src={activeImage.url}
          alt={activeImage.label}
          className="size-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
          <span className="truncate text-sm font-medium text-white">
            {activeImage.label}
          </span>
          <span className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white">
            {activeIndex + 1}/{materialGalleryItems.length}
          </span>
        </div>
      </div>

      {/* Indicator dạng chấm */}
      <div className="flex items-center justify-center gap-1.5">
        {materialGalleryItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Xem ảnh ${item.label}`}
            aria-current={index === activeIndex}
            onClick={() => setActiveIndex(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === activeIndex
                ? 'w-5 bg-admin-primary'
                : 'w-2 bg-admin-neutral-500/40 hover:bg-admin-neutral-500/70',
            )}
          />
        ))}
      </div>

      {/* Dải thumbnail nhỏ, bấm để đổi ảnh active */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {materialGalleryItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-current={index === activeIndex}
            className={cn(
              'relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
              index === activeIndex
                ? 'border-admin-primary'
                : 'border-admin-neutral-100 hover:border-admin-neutral-500',
            )}
          >
            <img
              src={item.url}
              alt={item.label}
              className={cn(
                'size-full object-cover transition-opacity',
                index === activeIndex ? 'opacity-100' : 'opacity-70',
              )}
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
