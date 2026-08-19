import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  AvatarGroup,
  AvatarGroupItem,
  AvatarGroupTooltip,
} from '@/components/ui/avatar-group';
import {
  GRADIENT_AVATAR_TONES,
  GradientAvatar,
} from '@/components/common/gradient-avatar';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import type { ContractEmployeeOption } from '../model/contract';

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getTone(name: string) {
  const score = name
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return GRADIENT_AVATAR_TONES[score % GRADIENT_AVATAR_TONES.length];
}

export function ContractResponsibleAvatarGroup({
  employees,
  onClick,
}: {
  employees: ContractEmployeeOption[];
  onClick?: () => void;
}) {
  const visibleEmployees = useMemo(() => employees.slice(0, 3), [employees]);
  const isEmpty = employees.length === 0;
  const content =
    employees.length === 1 ? (
      <EmployeeIdentity employee={employees[0]} />
    ) : employees.length > 1 ? (
      <AvatarGroup className="items-center -space-x-2">
        {visibleEmployees.map((employee) => (
          <AvatarGroupItem key={employee.id}>
            <GradientAvatar
              src={employee.avatarUrl}
              alt={employee.displayName}
              fallback={getInitials(employee.displayName)}
              tone={getTone(employee.displayName)}
              className="size-9 rounded-full border-2 border-background"
            />
            <AvatarGroupTooltip>
              <span>{employee.displayName}</span>
              <span className="text-white/70">{employee.employeeCode}</span>
            </AvatarGroupTooltip>
          </AvatarGroupItem>
        ))}
        {employees.length > visibleEmployees.length ? (
          <span className="relative z-0 flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-semibold text-muted-foreground">
            +{employees.length - visibleEmployees.length}
          </span>
        ) : null}
      </AvatarGroup>
    ) : onClick ? (
      <span className="text-sm font-medium text-primary underline-offset-4 hover:underline">
        Thêm nhân viên
      </span>
    ) : (
      <span className="text-sm font-normal text-muted-foreground">
        Chưa phân công
      </span>
    );

  if (!onClick) return content;

  return (
    <button
      type="button"
      className={cn(
        'max-w-full rounded-md p-1.5 -m-1.5 text-start outline-none transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      )}
      onClick={onClick}
      aria-label={
        isEmpty ? 'Thêm nhân viên phụ trách' : 'Quản lý nhân viên phụ trách'
      }
    >
      {content}
    </button>
  );
}
