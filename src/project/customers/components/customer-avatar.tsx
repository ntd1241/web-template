import { ImageAvatar } from '@/components/ui/image-avatar';
import {
  GradientAvatar,
  IDENTITY_AVATAR_TONES,
} from '@/components/common/gradient-avatar';
import type { Customer } from '../model/customer';

type CustomerAvatarData = Pick<Customer, 'name' | 'imageUrl'>;

export function getCustomerInitials(customer: CustomerAvatarData) {
  return customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function CustomerAvatar({
  customer,
  className,
}: {
  customer: Pick<Customer, 'name' | 'imageUrl'>;
  className?: string;
}) {
  const fallback = getCustomerInitials(customer);

  return customer.imageUrl ? (
    <ImageAvatar
      src={customer.imageUrl}
      alt={customer.name}
      fallback={fallback}
      className={className}
    />
  ) : (
    <GradientAvatar
      fallback={fallback}
      tone={IDENTITY_AVATAR_TONES.customer}
      className={className}
    />
  );
}
