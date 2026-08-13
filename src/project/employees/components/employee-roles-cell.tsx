import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Employee } from '../model/employee';

function getRoleClass(role: string) {
  const normalized = role.toLocaleLowerCase('vi-VN');
  if (
    normalized.includes('admin') ||
    normalized.includes('chủ sở hữu') ||
    normalized.includes('owner')
  ) {
    return 'border-admin-red-light bg-admin-red-bg text-admin-red-dark';
  }
  if (normalized.includes('quản lý') || normalized.includes('manager')) {
    return 'border-[#ddd6ff] bg-admin-violet-bg text-admin-violet-dark';
  }
  return 'border-admin-blue-light bg-secondary text-secondary-foreground';
}

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
          key={role}
          variant="outline"
          className={cn('rounded-md px-2.5 py-1 text-xs', getRoleClass(role))}
        >
          {role}
        </Badge>
      ))}
    </div>
  );
}
