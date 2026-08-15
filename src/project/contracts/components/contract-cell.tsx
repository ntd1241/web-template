import { buildPath, ROUTES } from '@/constants/routes';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Contract } from '../model/contract';

export function ContractCell({
  contract,
  className,
}: {
  contract: Contract;
  className?: string;
}) {
  return (
    <Link
      to={buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, { id: contract.id })}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label={`Xem chi tiết hợp đồng ${contract.name}`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">
          {contract.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {contract.contractCode}
        </span>
      </span>
    </Link>
  );
}
