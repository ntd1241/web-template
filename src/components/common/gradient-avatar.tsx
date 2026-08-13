import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const GRADIENT_AVATAR_TONES = [
  'slate',
  'amber',
  'red',
  'green',
  'brown',
  'lime',
] as const;

export type GradientAvatarTone = (typeof GRADIENT_AVATAR_TONES)[number];

const TONE_CLASSES: Record<GradientAvatarTone, string> = {
  slate: 'from-[#ecf0f1] to-[#90a4ae] border-[#b0bec5] text-[#455a64]',
  amber: 'from-[#fff3e0] to-[#ffb74d] border-[#ffcc80] text-[#f57c00]',
  red: 'from-[#fbe9e7] to-[#ff8a65] border-[#ffab91] text-[#e64a19]',
  green: 'from-[#e8f5e9] to-[#81c784] border-[#a5d6a7] text-[#388e3c]',
  brown: 'from-[#efebe9] to-[#a1887f] border-[#d7ccc8] text-[#5d4037]',
  lime: 'from-[#fbfce7] to-[#dce775] border-[#e6ee9c] text-[#827717]',
};

interface GradientAvatarProps {
  src?: string | null;
  alt?: string;
  fallback: string;
  tone?: GradientAvatarTone;
  className?: string;
}

export function GradientAvatar({
  src,
  alt = '',
  fallback,
  tone = 'slate',
  className,
}: GradientAvatarProps) {
  return (
    <Avatar className={cn('size-9', className)}>
      {src ? <AvatarImage src={src} alt={alt} /> : null}
      <AvatarFallback
        className={cn(
          'border bg-gradient-to-br text-sm font-bold shadow-sm',
          TONE_CLASSES[tone],
        )}
      >
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
