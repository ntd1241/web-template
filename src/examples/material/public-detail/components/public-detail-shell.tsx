import type { ReactNode } from 'react';

export function PublicDetailShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      {children}
    </div>
  );
}
