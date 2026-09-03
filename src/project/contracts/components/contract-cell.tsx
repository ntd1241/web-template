import { buildPath, ROUTES } from '@/constants/routes';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CustomerAvatar } from '../../customers/components/customer-avatar';
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

export function ContractCustomerCell({
  contract,
  className,
}: {
  contract: Contract;
  className?: string;
}) {
  const customerName = contract.customerName ?? 'Chưa có khách hàng';
  const customerCode = contract.customerCode ?? '';
  const customerTooltip = customerCode
    ? `${customerName} (${customerCode})`
    : customerName;

  return (
    <Link
      to={buildPath(ROUTES.PROJECT.CONTRACT_DETAIL, { id: contract.id })}
      className={cn(
        'flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label={`Xem chi tiết hợp đồng ${contract.name}`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={customerTooltip}
          >
            <CustomerAvatar
              customer={{
                name: customerName,
                imageUrl: contract.customerImageUrl,
              }}
              className="size-9 rounded-lg"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent variant="light">{customerTooltip}</TooltipContent>
      </Tooltip>
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
