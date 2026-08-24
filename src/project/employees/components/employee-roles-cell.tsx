import type { Employee } from '../model/employee';
import { EmployeeRoleBadge } from './employee-badges';

export function EmployeeRolesCell({ employee }: { employee: Employee }) {
  if (employee.roles.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">Chưa gán vai trò</span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {employee.roles.map((role) => (
        <EmployeeRoleBadge key={role.name} role={role} />
      ))}
    </div>
  );
}
