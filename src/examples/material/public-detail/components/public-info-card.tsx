import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PublicInfoCardTone = 'primary' | 'blue' | 'amber' | 'violet';

const toneClassNames: Record<
  PublicInfoCardTone,
  { card: string; header: string; icon: string }
> = {
  primary: {
    card: 'border-admin-primary-foam',
    header: 'border-admin-primary-bg text-admin-primary-dark',
    icon: 'bg-admin-primary-bg text-admin-primary-dark',
  },
  blue: {
    card: 'border-admin-blue-border',
    header: 'border-admin-blue-bg text-admin-blue-dark',
    icon: 'bg-admin-blue-primary text-white',
  },
  amber: {
    card: 'border-admin-amber-border',
    header: 'border-admin-amber-bg text-admin-amber-dark',
    icon: 'bg-admin-amber-bg text-admin-amber-dark',
  },
  violet: {
    card: 'border-admin-violet-border',
    header: 'border-admin-violet-bg text-admin-violet-primary',
    icon: 'bg-admin-violet-bg text-admin-violet-primary',
  },
};

export function PublicInfoCard({
  title,
  icon: Icon,
  tone = 'primary',
  children,
}: {
  title: string;
  icon: LucideIcon;
  tone?: PublicInfoCardTone;
  children: ReactNode;
}) {
  const classes = toneClassNames[tone];

  return (
    <Card className={cn('overflow-hidden rounded-[21px]', classes.card)}>
      <CardHeader
        className={cn(
          'min-h-0 justify-start gap-2 border-b px-5 py-3.5',
          classes.header,
        )}
      >
        <span
          className={cn(
            'flex size-7 items-center justify-center rounded-lg',
            classes.icon,
          )}
        >
          <Icon className="size-3.5" />
        </span>
        <CardTitle className="text-[12px] font-semibold uppercase tracking-[0.08em]">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
