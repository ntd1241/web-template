import { LockKeyhole, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { materialPublicInfo } from '../data/material-public-detail.mock';

export function MaterialHeroCard() {
  return (
    <section className="relative h-[320px] overflow-hidden rounded-[21px] border border-admin-neutral-100 bg-admin-neutral-900 shadow-xs sm:h-[380px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(77,151,255,0.45),transparent_28%),linear-gradient(135deg,#322e37_0%,#165988_48%,#0e5cd6_100%)]" />
      <div className="absolute inset-x-5 top-5 grid grid-cols-3 gap-3 opacity-45 sm:inset-x-8 sm:top-8 sm:grid-cols-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="h-12 rounded-xl border border-white/20 bg-white/10 sm:h-14"
          />
        ))}
      </div>
      <div className="absolute right-8 top-9 hidden h-48 w-40 rounded-[24px] border border-white/25 bg-white/10 p-4 shadow-2xl backdrop-blur-sm md:block">
        <div className="h-20 rounded-2xl bg-white/20" />
        <div className="mt-4 space-y-2">
          <span className="block h-2 rounded-full bg-white/50" />
          <span className="block h-2 w-2/3 rounded-full bg-white/30" />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, index) => (
            <span key={index} className="aspect-square rounded bg-white/25" />
          ))}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 flex w-full flex-col gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-1.5 text-sm font-medium text-white/85">
          <MapPin className="size-3.5" />
          <span className="min-w-0 truncate">
            {materialPublicInfo.location}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white md:text-4xl">
          {materialPublicInfo.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="primary"
            appearance="outline"
            shape="circle"
            className="border-admin-primary-border bg-admin-primary-bg px-3 text-[13px] text-admin-primary-dark"
          >
            {materialPublicInfo.status}
          </Badge>
          <Badge
            variant="outline"
            shape="circle"
            className="bg-white/90 px-3 text-[13px] text-admin-neutral-700"
          >
            SN: {materialPublicInfo.serialNumber}
          </Badge>
        </div>
        <Button className="mt-2 w-max rounded-xl bg-admin-primary-bright px-5 py-2.5 hover:bg-admin-primary">
          <LockKeyhole className="size-3.5" />
          Đăng nhập để cập nhật thông tin
        </Button>
      </div>
    </section>
  );
}
