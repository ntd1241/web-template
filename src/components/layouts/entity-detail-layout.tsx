import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface EntityDetailTab {
  value: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
}

export function EntityDetailProfileCard({
  avatar,
  title,
  subtitle,
  children,
  className,
}: {
  avatar: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="flex flex-col items-center p-6 text-center">
        {avatar}
        <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        {children ? (
          <div className="mt-6 w-full space-y-3 border-t border-border pt-5 text-left">
            {children}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EntityDetailInformationCard({
  children,
  status,
  actions,
  className,
}: {
  children: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('h-full', className)}>
      <CardContent className="flex h-full flex-col">
        {status ? <div className="mb-6 flex justify-end">{status}</div> : null}
        <div>{children}</div>
        {actions ? (
          <div className="mt-auto flex justify-end gap-1 pt-6">{actions}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EntityDetailTabs({
  tabs,
  defaultValue,
  className,
}: {
  tabs: EntityDetailTab[];
  defaultValue?: string;
  className?: string;
}) {
  const initialTab = defaultValue ?? tabs[0]?.value;

  return (
    <Tabs defaultValue={initialTab} className={cn('min-w-0', className)}>
      <TabsList
        variant="line"
        size="md"
        className="w-full min-w-0 justify-start overflow-x-auto"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              {Icon ? <Icon className="size-4" /> : null}
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function EntityDetailLayout({
  profile,
  information,
  tabs,
  className,
}: {
  profile: ReactNode;
  information: ReactNode;
  tabs?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-6',
        className,
      )}
    >
      <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
        {profile}
        {information}
      </div>
      {tabs}
    </div>
  );
}
