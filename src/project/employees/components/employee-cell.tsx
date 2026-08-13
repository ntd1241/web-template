import {
  GRADIENT_AVATAR_TONES,
  GradientAvatar,
  type GradientAvatarTone,
} from '@/components/common/gradient-avatar';
import type { Employee } from '../model/employee';

function getInitials(employee: Employee) {
  return employee.displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join('');
}

function getAvatarTone(employee: Employee): GradientAvatarTone {
  const score = employee.displayName
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return GRADIENT_AVATAR_TONES[score % GRADIENT_AVATAR_TONES.length];
}

export function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <GradientAvatar
        src={employee.avatarUrl}
        alt={employee.displayName}
        fallback={getInitials(employee)}
        tone={getAvatarTone(employee)}
        className="shrink-0"
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-5 text-foreground">
          {employee.displayName}
        </div>
        <div className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
          {employee.employeeCode}
        </div>
      </div>
    </div>
  );
}
