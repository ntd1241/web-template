import { AvatarIdentity } from '@/components/common/avatar-identity';
import type { Customer } from '../model/customer';

export type CustomerIdentityData = Pick<
  Customer,
  'name' | 'customerCode' | 'imageUrl'
>;

export function CustomerIdentity({
  customer,
  className,
}: {
  customer: CustomerIdentityData;
  className?: string;
}) {
  return (
    <AvatarIdentity
      name={customer.name}
      code={customer.customerCode}
      avatarUrl={customer.imageUrl}
      className={className}
    />
  );
}
