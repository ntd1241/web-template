import { ImageAvatar } from '@/components/ui/image-avatar';
import {
  GRADIENT_AVATAR_TONES,
  GradientAvatar,
  type GradientAvatarTone,
} from '@/components/common/gradient-avatar';
import type { Customer } from '../model/customer';

export function getCustomerInitials(customer: Customer) {
  return customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function getCustomerAvatarTone(customer: Customer): GradientAvatarTone {
  const score = customer.name
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return GRADIENT_AVATAR_TONES[score % GRADIENT_AVATAR_TONES.length];
}

export function CustomerAvatar({
  customer,
  className,
}: {
  customer: Customer;
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
      tone={getCustomerAvatarTone(customer)}
      className={className}
    />
  );
}
