import type { ComponentProps } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageBackButton({
  label = 'Quay lại',
  ...props
}: Omit<ComponentProps<typeof Button>, 'children'> & {
  label?: string;
}) {
  return (
    <Button
      {...props}
      variant="outline"
      mode="icon"
      size="icon"
      aria-label={props['aria-label'] ?? label}
      title={props.title ?? label}
    >
      <ArrowLeft />
    </Button>
  );
}
