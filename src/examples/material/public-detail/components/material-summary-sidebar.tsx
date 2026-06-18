import { cn } from '@/lib/utils';
import {
  materialFacts,
  materialPublicInfo,
  publicDetailIcons,
} from '../data/material-public-detail.mock';
import { PublicInfoCard } from './public-info-card';

export function MaterialSummarySidebar() {
  const AlertCircleIcon = publicDetailIcons.AlertCircle;
  const ClipboardListIcon = publicDetailIcons.ClipboardList;
  const HardHatIcon = publicDetailIcons.HardHat;

  return (
    <aside className="flex min-w-0 flex-col gap-4">
      <PublicInfoCard title="Thông tin vật tư" icon={publicDetailIcons.Info}>
        <div className="flex flex-col gap-4">
          {materialFacts.map((fact) => {
            const Icon = fact.icon;

            return (
              <div key={fact.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                    fact.tone === 'primary'
                      ? 'bg-admin-primary-bg text-admin-primary-dark'
                      : 'bg-admin-neutral-bg text-admin-neutral-600',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-admin-neutral-500">
                    {fact.label}
                  </span>
                  <span className="truncate text-sm font-medium text-admin-neutral-800">
                    {fact.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </PublicInfoCard>

      <PublicInfoCard
        title="Tình trạng sử dụng"
        icon={publicDetailIcons.ShieldCheck}
        tone="blue"
      >
        <div className="rounded-2xl border border-admin-blue-border bg-admin-blue-bg p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-admin-blue-primary text-white">
              <HardHatIcon className="size-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase text-admin-blue-dark">
                Đang vận hành
              </span>
              <span className="text-sm font-medium text-admin-neutral-800">
                Sẵn sàng bàn giao và kiểm kê
              </span>
            </div>
          </div>
        </div>
      </PublicInfoCard>

      <PublicInfoCard
        title="Lịch kiểm kê gần nhất"
        icon={publicDetailIcons.CalendarClock}
        tone="amber"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-admin-amber-bg text-admin-amber-dark">
            <ClipboardListIcon className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase text-admin-amber-dark">
              {materialPublicInfo.lastInventoryDate}
            </span>
            <span className="text-sm font-medium text-admin-neutral-800">
              Kiểm kê định kỳ quý II
            </span>
          </div>
        </div>
      </PublicInfoCard>

      <PublicInfoCard
        title="Bảo trì"
        icon={publicDetailIcons.Hammer}
        tone="violet"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-admin-violet-bg text-admin-violet-primary">
            <AlertCircleIcon className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium uppercase text-admin-violet-primary">
              Theo dõi định kỳ
            </span>
            <span className="text-sm font-medium text-admin-neutral-800">
              Lần bảo trì tiếp theo: {materialPublicInfo.nextMaintenanceDate}
            </span>
          </div>
        </div>
      </PublicInfoCard>
    </aside>
  );
}
