import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ImageAvatarProps {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
}

export function ImageAvatar({
  src,
  alt,
  fallback,
  className,
}: ImageAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const imageSource = src?.trim() && !hasError ? src : null;

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return imageSource ? (
    <img
      src={imageSource}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('shrink-0 object-cover', className)}
    />
  ) : (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center border border-admin-amber-light bg-gradient-to-br from-[#fff3e0] to-[#ffb74d] font-bold text-[#f57c00] shadow-sm',
        className,
      )}
    >
      {fallback}
    </span>
  );
}
