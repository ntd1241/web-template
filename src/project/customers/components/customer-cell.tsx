import { ImageAvatar } from '@/components/ui/image-avatar';
import {
  GRADIENT_AVATAR_TONES,
  GradientAvatar,
  type GradientAvatarTone,
} from '@/components/common/gradient-avatar';
import type { Customer } from '../model/customer';

function getInitials(customer: Customer) {
  return customer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getAvatarTone(customer: Customer): GradientAvatarTone {
  const score = customer.name
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);
  return GRADIENT_AVATAR_TONES[score % GRADIENT_AVATAR_TONES.length];
}

export function CustomerCell({ customer }: { customer: Customer }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {customer.imageUrl ? (
        <ImageAvatar
          src={customer.imageUrl}
          alt={customer.name}
          fallback={getInitials(customer)}
          className="size-9 rounded-lg text-sm"
        />
      ) : (
        <GradientAvatar
          fallback={getInitials(customer)}
          tone={getAvatarTone(customer)}
          className="shrink-0"
        />
      )}
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-5 text-foreground">
          {customer.name}
        </div>
        <div className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
          {customer.customerCode}
        </div>
      </div>
    </div>
  );
}
