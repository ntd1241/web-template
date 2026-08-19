import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Building2, Palette, Save, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { queryClient } from '@/lib/query-client';
import {
  useAppSettings,
  type AppDensity,
  type AppTheme,
} from '@/providers/app-settings-provider';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CardLoading } from '@/components/ui/loading';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  loadCurrentTenantSettings,
  updateTenantSettings,
  uploadTenantLogo,
} from '../api/tenant-settings.api';
import {
  TenantSettingsForm,
  useTenantSettingsForm,
} from '../forms/tenant-form.generated';
import type { TenantSettingsValues } from '../model/tenant-settings';

const tabs = [
  { value: 'organization', label: 'Tổ chức', icon: Building2 },
  { value: 'appearance', label: 'Giao diện', icon: Palette },
] as const;

type SettingsTab = (typeof tabs)[number]['value'];

export function ProjectSettingsPage() {
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const { theme, setTheme } = useTheme();
  const { appearance, saveAppearance } = useAppSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>('organization');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const tenantSettingsQuery = useQuery({
    queryKey: ['project', 'tenant-settings', userId, tenantId],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadCurrentTenantSettings(userId, tenantId);
    },
    enabled: Boolean(userId && tenantId),
  });
  const form = useTenantSettingsForm();
  const currentSettingsRef = useRef<Record<string, unknown>>({});
  const hydratedTenantIdRef = useRef<string | null>(null);

  useEffect(() => {
    const data = tenantSettingsQuery.data;
    if (!data || hydratedTenantIdRef.current === data.tenantId) return;

    form.reset(data.values);
    setLogoFile(null);
    currentSettingsRef.current = data.settings;
    hydratedTenantIdRef.current = data.tenantId;
  }, [form, tenantSettingsQuery.data]);

  const tenantMutation = useMutation({
    mutationFn: async (values: TenantSettingsValues) => {
      const tenantId = tenantSettingsQuery.data?.tenantId;
      if (!tenantId) throw new Error('Chưa tải được tenant hiện tại.');

      const savedValues = logoFile
        ? {
            ...values,
            logoUrl: await uploadTenantLogo(tenantId, logoFile),
          }
        : values;

      await updateTenantSettings(
        tenantId,
        savedValues,
        currentSettingsRef.current,
      );

      return savedValues;
    },
    onSuccess: async (values) => {
      currentSettingsRef.current = {
        ...currentSettingsRef.current,
        description: values.description,
        address: values.address,
        email: values.email,
        phone: values.phone,
        taxCode: values.taxCode,
        website: values.website,
        paymentReminderDays: values.paymentReminderDays,
        chargeGenerationLeadDays: values.chargeGenerationLeadDays,
        numberLocale: values.numberLocale,
        currencyCode: values.currencyCode,
        compactDisplay: values.compactDisplay,
      };
      form.reset(values);
      setLogoFile(null);
      await queryClient.invalidateQueries({
        queryKey: ['project', 'tenant-settings', userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ['project', 'context', userId],
      });
      toast.success('Đã lưu thông tin tổ chức.');
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Không thể lưu thông tin tổ chức.',
      );
    },
  });

  const organizationDirty = form.formState.isDirty || Boolean(logoFile);
  const confirmLeave = useCallback(
    (message: string) => !organizationDirty || window.confirm(message),
    [organizationDirty],
  );

  useEffect(() => {
    if (!organizationDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;

      const target = event.target as Element | null;
      const link = target?.closest('a[href]');
      if (
        !link ||
        link.getAttribute('target') === '_blank' ||
        link.hasAttribute('download') ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href === window.location.pathname) {
        return;
      }

      if (!confirmLeave('Bạn có thay đổi chưa lưu. Bạn vẫn muốn rời trang?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleInternalNavigation, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleInternalNavigation, true);
    };
  }, [confirmLeave, organizationDirty]);

  const handleTabChange = (nextTab: string) => {
    if (nextTab === activeTab) return;

    if (
      activeTab === 'organization' &&
      organizationDirty &&
      !confirmLeave(
        'Tab Tổ chức có thay đổi chưa lưu. Bạn vẫn muốn chuyển tab?',
      )
    ) {
      return;
    }

    if (tabs.some((tab) => tab.value === nextTab)) {
      setActiveTab(nextTab as SettingsTab);
    }
  };

  const currentTheme = theme === 'light' || theme === 'dark' ? theme : 'system';

  return (
    <div className="h-full min-h-0">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="flex h-full min-h-0 flex-col lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-5"
      >
        <div className="shrink-0 px-6 pt-6 lg:min-h-0 lg:pe-0">
          <Card className="flex h-fit max-h-full min-h-0 self-start flex-col">
            <ScrollArea className="max-h-full min-h-0 flex-1">
              <TabsList className="flex-col items-stretch gap-1 bg-transparent p-2 [&_[data-slot=tabs-trigger]]:justify-start [&_[data-slot=tabs-trigger]]:gap-3 [&_[data-slot=tabs-trigger]]:rounded-lg [&_[data-slot=tabs-trigger]]:px-3 [&_[data-slot=tabs-trigger]]:py-2.5 [&_[data-slot=tabs-trigger][data-state=active]]:bg-primary/10 [&_[data-slot=tabs-trigger][data-state=active]]:text-primary [&_[data-slot=tabs-trigger][data-state=active]_svg]:text-primary">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      <Icon className="size-4" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>
          </Card>
        </div>

        <ScrollArea className="min-h-0 flex-1" viewportClassName="h-full">
          <div className="min-w-0 space-y-5 px-6 pb-6 pt-6 lg:ps-0 lg:pe-6">
            <TabsContent value="organization" className="mt-0 space-y-5">
              <Card>
                <CardHeader className="p-5">
                  <CardHeading>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="size-4 text-primary" />
                      Thông tin tổ chức
                    </CardTitle>
                  </CardHeading>
                </CardHeader>
                <CardContent className="space-y-5 p-5">
                  {tenantSettingsQuery.isPending ? (
                    <CardLoading label="Đang tải thông tin tổ chức..." />
                  ) : tenantSettingsQuery.isError ? (
                    <p className="text-sm text-destructive">
                      Không thể tải thông tin tổ chức.
                    </p>
                  ) : (
                    <TenantSettingsForm
                      form={form}
                      onSubmit={(values) => tenantMutation.mutate(values)}
                      onLogoUrlFileChange={setLogoFile}
                      id="project-tenant-settings-form"
                    />
                  )}
                </CardContent>
              </Card>

              <SettingsActions
                isDirty={organizationDirty}
                isPending={tenantMutation.isPending}
                formId="project-tenant-settings-form"
              />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 space-y-5">
              <SettingsSection icon={Palette} title="Giao diện ứng dụng">
                <div className="grid gap-4 md:grid-cols-2">
                  <SettingsField label="Chủ đề">
                    <Select
                      value={currentTheme}
                      onValueChange={(value) => {
                        if (
                          value === 'system' ||
                          value === 'light' ||
                          value === 'dark'
                        ) {
                          setTheme(value);
                          saveAppearance({
                            ...appearance,
                            theme: value as AppTheme,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">Theo hệ thống</SelectItem>
                        <SelectItem value="light">Sáng</SelectItem>
                        <SelectItem value="dark">Tối</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                  <SettingsField label="Mật độ hiển thị">
                    <Select
                      value={appearance.density}
                      onValueChange={(value) => {
                        if (
                          value === 'small' ||
                          value === 'medium' ||
                          value === 'large'
                        ) {
                          saveAppearance({
                            ...appearance,
                            density: value as AppDensity,
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Nhỏ (90%)</SelectItem>
                        <SelectItem value="medium">Vừa (95%)</SelectItem>
                        <SelectItem value="large">Lớn (100%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <label className="flex items-center justify-between gap-4">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-foreground">
                        Tự động thu gọn sidebar ở trang chi tiết
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Các route không có trong sidebar sẽ thu gọn menu về
                        thanh icon.
                      </span>
                    </span>
                    <Switch
                      checked={appearance.autoCollapseSidebarOnDetail}
                      onCheckedChange={(checked) =>
                        saveAppearance({
                          ...appearance,
                          autoCollapseSidebarOnDetail: checked,
                        })
                      }
                      aria-label="Tự động thu gọn sidebar ở trang chi tiết"
                    />
                  </label>
                </div>
              </SettingsSection>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function SettingsActions({
  isDirty,
  isPending,
  formId,
}: {
  isDirty: boolean;
  isPending: boolean;
  formId: string;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <Button
        type="submit"
        variant="primary"
        form={formId}
        disabled={!isDirty}
        loading={isPending}
        loadingText="Đang lưu..."
      >
        <Save />
        Lưu thay đổi
      </Button>
    </div>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="p-5">
        <CardHeading>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeading>
      </CardHeader>
      <CardContent className="space-y-5 p-5">{children}</CardContent>
    </Card>
  );
}

function SettingsField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
