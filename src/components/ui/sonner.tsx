'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="group toaster [&_[data-type=success]>[data-icon]]:text-admin-success-text [&_[data-type=success]_[data-title]]:text-admin-success-text [&_[data-type=info]_[data-title]]:text-info [&_[data-type=error]>[data-icon]]:text-destructive-foreground [&_[data-type=error]_[data-title]]:text-destructive-foreground [&_[data-type=error]_[data-description]]:text-destructive-foreground/85"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground! group-[.toaster]:border-border group-[.toaster]:shadow-lg has-[[role=alert]]:border-0! has-[[role=alert]]:shadow-none!',
          description: 'group-[.toast]:text-muted-foreground',
          error:
            'group-[.toaster]:bg-destructive! group-[.toaster]:text-destructive-foreground! group-[.toaster]:border-destructive!',
          actionButton:
            'group-[.toast]:rounded-md! group-[.toast]:bg-primary group-[.toast]:text-primary-foreground!',
          cancelButton:
            'group-[.toast]:rounded-md! group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground!',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
