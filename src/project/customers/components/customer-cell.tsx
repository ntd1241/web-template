import { buildPath, ROUTES } from '@/constants/routes';
import { Link } from 'react-router-dom';
import type { Customer } from '../model/customer';
import { CustomerIdentity } from './customer-identity';

export function CustomerCell({ customer }: { customer: Customer }) {
  return (
    <Link
      to={buildPath(ROUTES.PROJECT.CUSTOMER_DETAIL, { id: customer.id })}
      className="group flex min-w-0 items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Xem chi tiết khách hàng ${customer.name}`}
    >
      <CustomerIdentity customer={customer} />
    </Link>
  );
}
