import { cn } from '@/lib/utils';
import {
  materialGalleryItems,
  publicDetailIcons,
} from '../data/material-public-detail.mock';
import { PublicInfoCard } from './public-info-card';

export function MaterialGalleryCard() {
  return (
    <PublicInfoCard
      title="Hình ảnh vật tư"
      icon={publicDetailIcons.ImageIcon}
      tone="blue"
    >
      <div className="flex gap-2 overflow-x-auto">
        {materialGalleryItems.map((item, index) => (
          <div
            key={item}
            className={cn(
              'flex size-14 shrink-0 items-center justify-center rounded-xl border text-[10px] font-semibold text-white',
              index % 2 === 0
                ? 'border-admin-blue-border bg-admin-blue-primary'
                : 'border-admin-primary-border bg-admin-primary',
            )}
          >
            {item.slice(0, 2).toUpperCase()}
          </div>
        ))}
      </div>
    </PublicInfoCard>
  );
}
