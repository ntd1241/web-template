import { Badge } from '@/components/ui/badge';
import type { Employee } from '../model/employee';

export function EmployeeRolesCell({ employee }: { employee: Employee }) {
  if (employee.roles.length === 0) {
    return (
      <span className="text-sm text-muted-foreground">Chưa gán vai trò</span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {employee.roles.map((role) => (
        <Badge
          key={role.name}
          variant={role.color}
          appearance="light"
          className="rounded-md px-2.5 py-1 text-xs"
        >
          {role.name}
        </Badge>
      ))}
    </div>
  );
}
