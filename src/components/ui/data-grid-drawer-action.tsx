import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataGridDrawerActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function DataGridDrawerAction({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  loading = false,
}: DataGridDrawerActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex"
          tabIndex={disabled ? 0 : undefined}
          aria-disabled={disabled || undefined}
        >
          <Button
            type="button"
            variant="ghost"
            mode="icon"
            size="md"
            aria-label={label}
            disabled={disabled}
            loading={loading}
            loadingText={null}
            onClick={onClick}
          >
            <Icon />
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent variant="light">{label}</TooltipContent>
    </Tooltip>
  );
}
