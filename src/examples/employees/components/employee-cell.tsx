import { GradientAvatar } from '@/components/common/gradient-avatar';
import type { AvatarTone, Employee } from '../model/employee';

/** Ô "Nhân viên": avatar chữ cái + tên + username. Dùng Avatar primitive (docs/06 §5). */
export function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3">
      <GradientAvatar
        tone={employee.avatarTone}
        fallback={employee.name.charAt(0)}
        alt={employee.name}
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-5 text-admin-blue-darkest">
          {employee.name}
        </div>
        <div className="mt-0.5 truncate text-xs leading-4 text-admin-blue-muted">
          {employee.username}
        </div>
      </div>
    </div>
  );
}
