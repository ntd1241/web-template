import type { ReactNode } from 'react';
import { AlertTriangle, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  GRADIENT_AVATAR_TONES,
  GradientAvatar,
  type GradientAvatarTone,
} from './gradient-avatar';

export interface AvatarIdentityData {
  name: string;
  code: string;
  avatarUrl?: string | null;
}

export type AvatarIdentityAlertTone = 'warning' | 'destructive' | 'info';

export interface AvatarIdentityAlert {
  id: string;
  message: string;
  tone?: AvatarIdentityAlertTone;
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getAvatarTone(name: string): GradientAvatarTone {
  const score = name
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return GRADIENT_AVATAR_TONES[score % GRADIENT_AVATAR_TONES.length];
}

export function AvatarIdentity({
  name,
  code,
  avatarUrl,
  badge,
  className,
}: AvatarIdentityData & { badge?: ReactNode; className?: string }) {
  return (
    <span className={cn('group flex min-w-0 items-center gap-3', className)}>
      <GradientAvatar
        src={avatarUrl}
        alt={name}
        fallback={getInitials(name)}
        tone={getAvatarTone(name)}
        className="size-9 rounded-lg text-sm transition-transform group-hover:scale-105"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">
          {name}
        </span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs leading-4 text-muted-foreground">
          <span className="min-w-0 truncate">{code}</span>
          {badge}
        </span>
      </span>
    </span>
  );
}

const ALERT_TONE_PRIORITY: Record<AvatarIdentityAlertTone, number> = {
  info: 1,
  warning: 2,
  destructive: 3,
};

function getAlertTone(alerts: AvatarIdentityAlert[]) {
  return alerts.reduce<AvatarIdentityAlertTone>((currentTone, alert) => {
    const nextTone = alert.tone ?? 'warning';
    return ALERT_TONE_PRIORITY[nextTone] > ALERT_TONE_PRIORITY[currentTone]
      ? nextTone
      : currentTone;
  }, 'info');
}

export function AvatarIdentityAlertsBadge({
  alerts,
}: {
  alerts: AvatarIdentityAlert[];
}) {
  if (alerts.length === 0) return null;

  const tone = getAlertTone(alerts);
  const Icon = tone === 'destructive' ? CircleAlert : AlertTriangle;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={tone}
          appearance="light"
          size="xs"
          shape="circle"
          aria-label={`Có ${alerts.length} cảnh báo`}
        >
          <Icon />
        </Badge>
      </TooltipTrigger>
      <TooltipContent
        variant={tone === 'destructive' ? 'destructive' : 'warning'}
        className="max-w-xs"
      >
        <ul className="space-y-1">
          {alerts.map((alert) => (
            <li key={alert.id}>{alert.message}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
