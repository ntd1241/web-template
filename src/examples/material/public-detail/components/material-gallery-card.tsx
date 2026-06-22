import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Inline from 'yet-another-react-lightbox/plugins/inline';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { cn } from '@/lib/utils';
import { materialGalleryItems } from '../data/material-public-detail.mock';

const slides = materialGalleryItems.map((item) => ({
  src: item.url,
  alt: item.label,
  imageFit: 'contain' as const,
}));

export function MaterialGalleryCard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = materialGalleryItems[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-admin-neutral-100 bg-black sm:aspect-[16/10]">
        <Lightbox
          plugins={[Inline]}
          inline={{
            className: 'material-gallery-inline size-full bg-black',
          }}
          slides={slides}
          index={activeIndex}
          carousel={{
            finite: true,
            imageFit: 'contain',
            padding: 0,
            spacing: 0,
          }}
          toolbar={{ buttons: [] }}
          render={{ buttonPrev: () => null, buttonNext: () => null }}
          on={{
            view: ({ index }) => setActiveIndex(index),
            click: ({ index }) => {
              setActiveIndex(index);
              setLightboxOpen(true);
            },
          }}
          labels={{
            Carousel: 'Thư viện ảnh vật tư',
            Slide: 'Ảnh vật tư',
            '{index} of {total}': '{index} / {total}',
          }}
        />
        <button
          type="button"
          aria-label={`Mở ảnh ${activeImage.label}`}
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Maximize2 className="size-4" />
        </button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-t from-black/65 to-transparent px-4 py-3">
          <span className="truncate text-sm font-medium text-white">
            {activeImage.label}
          </span>
          <span className="shrink-0 rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white">
            {activeIndex + 1}/{materialGalleryItems.length}
          </span>
        </div>
      </div>

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

      <div className="flex gap-2 overflow-x-auto pb-1">
        {materialGalleryItems.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-current={index === activeIndex}
            className={cn(
              'relative size-16 shrink-0 overflow-hidden rounded-xl border-2 bg-black transition-colors',
              index === activeIndex
                ? 'border-admin-primary'
                : 'border-admin-neutral-100 hover:border-admin-neutral-500',
            )}
          >
            <img
              src={item.url}
              alt={item.label}
              className={cn(
                'size-full object-contain transition-opacity',
                index === activeIndex ? 'opacity-100' : 'opacity-70',
              )}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={activeIndex}
        plugins={[Zoom, Fullscreen]}
        carousel={{ finite: true, imageFit: 'contain' }}
        on={{ view: ({ index }) => setActiveIndex(index) }}
        labels={{
          Previous: 'Ảnh trước',
          Next: 'Ảnh sau',
          Close: 'Đóng',
          Slide: 'Ảnh vật tư',
          Carousel: 'Thư viện ảnh vật tư',
          Lightbox: 'Xem ảnh vật tư',
          '{index} of {total}': '{index} / {total}',
        }}
      />
    </div>
  );
}
