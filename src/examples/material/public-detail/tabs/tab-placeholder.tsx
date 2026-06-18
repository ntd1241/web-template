import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TabPlaceholder({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="rounded-[21px] border-admin-blue-border bg-card shadow-xs">
      <CardContent className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-admin-blue-bg text-admin-blue-primary">
          <Icon className="size-5" />
        </span>
        <div className="space-y-1">
          <h3 className="text-[15px] font-semibold text-admin-neutral-800">
            {title}
          </h3>
          <p className="max-w-[420px] text-[13px] leading-5 text-admin-neutral-500">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
