import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { AvatarTone, Employee } from '../model/employee';

const TONE_CLASSES: Record<AvatarTone, string> = {
  slate: 'from-[#ecf0f1] to-[#90a4ae] border-[#b0bec5] text-[#455a64]',
  amber: 'from-[#fff3e0] to-[#ffb74d] border-[#ffcc80] text-[#f57c00]',
  red: 'from-[#fbe9e7] to-[#ff8a65] border-[#ffab91] text-[#e64a19]',
  green: 'from-[#e8f5e9] to-[#81c784] border-[#a5d6a7] text-[#388e3c]',
  brown: 'from-[#efebe9] to-[#a1887f] border-[#d7ccc8] text-[#5d4037]',
  lime: 'from-[#fbfce7] to-[#dce775] border-[#e6ee9c] text-[#827717]',
};

/** Ô "Nhân viên": avatar chữ cái + tên + username. Dùng Avatar primitive (docs/06 §5). */
export function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback
          className={cn(
            'border bg-gradient-to-br text-[14px] font-bold shadow-sm',
            TONE_CLASSES[employee.avatarTone],
          )}
        >
          {employee.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate text-[14px] font-semibold leading-5 text-admin-blue-darkest">
          {employee.name}
        </div>
        <div className="mt-0.5 truncate text-[12px] leading-4 text-admin-blue-muted">
          {employee.username}
        </div>
      </div>
    </div>
  );
}
