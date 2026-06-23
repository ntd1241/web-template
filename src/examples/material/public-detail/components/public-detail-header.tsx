import { ArrowLeft, LockKeyhole, LogOut, PackageCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  materialPublicInfo,
  materialPublicTabs,
  type MaterialPublicTabValue,
} from '../data/material-public-detail.mock';
import { PublicDetailShell } from './public-detail-shell';

export function PublicDetailHeader({
  activeTab,
  isAuthenticated,
  isFormView = false,
  onAuthToggle,
  onBack,
  onTabChange,
}: {
  activeTab: MaterialPublicTabValue;
  isAuthenticated: boolean;
  isFormView?: boolean;
  onAuthToggle: () => void;
  onBack?: () => void;
  onTabChange: (tab: MaterialPublicTabValue) => void;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-admin-neutral-100 bg-card">
      <PublicDetailShell>
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {isFormView ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                shape="circle"
                onClick={onBack}
                aria-label="Quay lại"
              >
                <ArrowLeft className="size-3.5" />
              </Button>
            ) : null}
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PackageCheck className="size-3.5" />
            </span>
            <h1 className="truncate text-sm font-medium text-admin-neutral-800 md:text-base">
              {materialPublicInfo.name}
            </h1>
          </div>
          <Button
            type="button"
            shape="circle"
            className="px-4"
            onClick={onAuthToggle}
          >
            {isAuthenticated ? (
              <LogOut className="size-3.5" />
            ) : (
              <LockKeyhole className="size-3.5" />
            )}
            {isAuthenticated ? 'Đăng xuất' : 'Đăng nhập'}
          </Button>
        </div>

        {isFormView ? null : (
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              onTabChange(value as MaterialPublicTabValue)
            }
            className="min-w-0"
          >
            <TabsList
              variant="line"
              size="sm"
              className="w-full min-w-0 overflow-x-auto border-b-0"
            >
              {materialPublicTabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    <Icon className="size-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        )}
      </PublicDetailShell>
    </header>
  );
}
