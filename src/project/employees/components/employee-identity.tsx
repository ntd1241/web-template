import {
  AvatarIdentity,
  AvatarIdentityAlertsBadge,
  type AvatarIdentityAlert,
} from '@/components/common/avatar-identity';
import { IDENTITY_AVATAR_TONES } from '@/components/common/gradient-avatar';
import type { Employee } from '../model/employee';

export type EmployeeIdentityData = Pick<
  Employee,
  'displayName' | 'employeeCode' | 'avatarUrl' | 'userId'
> & {
  alerts?: AvatarIdentityAlert[];
};

export function EmployeeIdentity({
  employee,
  className,
}: {
  employee: EmployeeIdentityData;
  className?: string;
}) {
  const alerts: AvatarIdentityAlert[] = [
    ...(!employee.userId
      ? [
          {
            id: 'account-not-linked',
            message: 'Chưa liên kết tài khoản',
            tone: 'warning' as const,
          },
        ]
      : []),
    ...(employee.alerts ?? []),
  ];

  return (
    <AvatarIdentity
      name={employee.displayName}
      code={employee.employeeCode}
      avatarUrl={employee.avatarUrl}
      tone={IDENTITY_AVATAR_TONES.employee}
      badge={<AvatarIdentityAlertsBadge alerts={alerts} />}
      className={className}
    />
  );
}
