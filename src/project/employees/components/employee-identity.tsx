import { AvatarIdentity } from '@/components/common/avatar-identity';
import type { Employee } from '../model/employee';

export type EmployeeIdentityData = Pick<
  Employee,
  'displayName' | 'employeeCode' | 'avatarUrl'
>;

export function EmployeeIdentity({
  employee,
  className,
}: {
  employee: EmployeeIdentityData;
  className?: string;
}) {
  return (
    <AvatarIdentity
      name={employee.displayName}
      code={employee.employeeCode}
      avatarUrl={employee.avatarUrl}
      className={className}
    />
  );
}
