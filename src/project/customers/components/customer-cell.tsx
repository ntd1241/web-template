import { buildPath, ROUTES } from '@/constants/routes';
import { Link } from 'react-router-dom';
import type { Customer } from '../model/customer';
import { CustomerAvatar } from './customer-avatar';

export function CustomerCell({ customer }: { customer: Customer }) {
  return (
    <Link
      to={buildPath(ROUTES.PROJECT.CUSTOMER_DETAIL, { id: customer.id })}
      className="group flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Xem chi tiết khách hàng ${customer.name}`}
    >
      <CustomerAvatar
        customer={customer}
        className="size-9 rounded-lg text-sm transition-transform group-hover:scale-105"
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-5 text-foreground group-hover:text-primary">
          {customer.name}
        </div>
        <div className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
          {customer.customerCode}
        </div>
      </div>
    </Link>
  );
}
