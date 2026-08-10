import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Bell,
  Building2,
  Check,
  Globe2,
  Palette,
  RotateCcw,
  Save,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import {
  useAppSettings,
  type AppAppearanceSettings,
  type AppDensity,
  type AppTheme,
} from '@/providers/app-settings-provider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { SettingsGroup, SettingsRow } from '@/components/ui/settings';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type SettingsValues = {
  profile: {
    fullName: string;
    email: string;
    phone: string;
    language: string;
    timeZone: string;
  };
  organization: {
    name: string;
    taxCode: string;
    address: string;
    warehouse: string;
  };
  notifications: {
    email: boolean;
    inApp: boolean;
    maintenance: boolean;
    weeklySummary: boolean;
    digest: string;
  };
  security: {
    twoFactor: boolean;
    loginAlerts: boolean;
    sessionTimeout: string;
  };
  appearance: {
    theme: AppTheme;
    density: AppDensity;
    sidebarCollapsed: boolean;
  };
};

const initialSettings: SettingsValues = {
  profile: {
    fullName: 'Lê Minh Tuấn',
    email: 'tuan.le@vacom.vn',
    phone: '090 123 4567',
    language: 'vi',
    timeZone: 'asia-ho-chi-minh',
  },
  organization: {
    name: 'Công ty TNHH Vacom',
    taxCode: '0312345678',
    address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    warehouse: 'kho-trung-tam',
  },
  notifications: {
    email: true,
    inApp: true,
    maintenance: true,
    weeklySummary: false,
    digest: 'daily',
  },
  security: {
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: '30',
  },
  appearance: {
    theme: 'system',
    density: 'large',
    sidebarCollapsed: false,
  },
};

const tabs = [
  { value: 'profile', label: 'Tài khoản', icon: UserRound },
  { value: 'organization', label: 'Tổ chức', icon: Building2 },
  { value: 'notifications', label: 'Thông báo', icon: Bell },
  { value: 'security', label: 'Bảo mật', icon: ShieldCheck },
  { value: 'appearance', label: 'Giao diện', icon: Palette },
] as const;

type SettingsTab = (typeof tabs)[number]['value'];
type SavedSettingsTab = Exclude<SettingsTab, 'appearance'>;

function createInitialSettings(
  appearance: AppAppearanceSettings,
  activeTheme?: string,
): SettingsValues {
  const theme =
    activeTheme === 'light' ||
    activeTheme === 'dark' ||
    activeTheme === 'system'
      ? activeTheme
      : appearance.theme;

  return {
    ...initialSettings,
    appearance: {
      ...initialSettings.appearance,
      theme,
      density: appearance.density,
      sidebarCollapsed: appearance.sidebarCollapsed,
    },
  };
}

export function SettingsPage() {
  const { theme: activeTheme, setTheme } = useTheme();
  const { appearance, saveAppearance } = useAppSettings();
  const initialPageSettings = useMemo(
    () => createInitialSettings(appearance, activeTheme),
    [activeTheme, appearance],
  );
  const hasHydratedInitialAppearance = useRef(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState<SettingsValues>(initialPageSettings);
  const [savedSettings, setSavedSettings] =
    useState<SettingsValues>(initialPageSettings);

  useEffect(() => {
    if (hasHydratedInitialAppearance.current || activeTheme === undefined) {
      return;
    }

    hasHydratedInitialAppearance.current = true;
    setSettings(initialPageSettings);
    setSavedSettings(initialPageSettings);
  }, [activeTheme, initialPageSettings]);

  const isSectionDirty = (section: keyof SettingsValues) =>
    JSON.stringify(settings[section]) !==
    JSON.stringify(savedSettings[section]);

  const hasUnsavedChanges = useMemo(
    () =>
      (Object.keys(settings) as Array<keyof SettingsValues>).some(
        (section) =>
          JSON.stringify(settings[section]) !==
          JSON.stringify(savedSettings[section]),
      ),
    [savedSettings, settings],
  );

  const updateSection = <K extends keyof SettingsValues>(
    section: K,
    patch: Partial<SettingsValues[K]>,
  ) => {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], ...patch },
    }));
  };

  const updateAppearance = (patch: Partial<SettingsValues['appearance']>) => {
    const nextAppearance = { ...settings.appearance, ...patch };

    setSettings((current) => ({
      ...current,
      appearance: nextAppearance,
    }));
    setSavedSettings((current) => ({
      ...current,
      appearance: nextAppearance,
    }));
    saveAppearance({
      theme: nextAppearance.theme,
      density: nextAppearance.density,
      sidebarCollapsed: nextAppearance.sidebarCollapsed,
    });
    if (patch.theme !== undefined) {
      setTheme(nextAppearance.theme);
    }
  };

  const saveSection = (section: SavedSettingsTab) => {
    setSavedSettings((current) => ({
      ...current,
      [section]: settings[section],
    }));
    toast.success(`Đã lưu cài đặt ${getTabLabel(section).toLowerCase()}`);
  };

  const resetSection = (section: SavedSettingsTab) => {
    setSettings((current) => ({
      ...current,
      [section]: savedSettings[section],
    }));
    toast.info(`Đã hoàn tác thay đổi ở tab ${getTabLabel(section)}`);
  };

  const confirmLeave = useCallback(
    (message: string) => !hasUnsavedChanges || window.confirm(message),
    [hasUnsavedChanges],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handleInternalNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

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
  }, [confirmLeave, hasUnsavedChanges]);

  const handleTabChange = (nextTab: string) => {
    if (nextTab === activeTab) {
      return;
    }

    if (
      isSectionDirty(activeTab) &&
      !confirmLeave(
        `Tab ${getTabLabel(activeTab)} có thay đổi chưa lưu. Bạn vẫn muốn chuyển tab?`,
      )
    ) {
      return;
    }

    if (tabs.some((tab) => tab.value === nextTab)) {
      setActiveTab(nextTab as SettingsTab);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <div className="flex min-h-0 flex-1 flex-col">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]"
        >
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

          <ScrollArea className="min-h-0 flex-1">
            <div className="min-w-0 space-y-5 pb-2 pe-2">
              <TabsContent value="profile" className="mt-0 space-y-5">
                <SettingsSection
                  icon={UserRound}
                  title="Thông tin cá nhân"
                  description="Thông tin hiển thị trong hồ sơ và lịch sử thao tác."
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
                      LT
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        Ảnh đại diện tài khoản
                      </p>
                      <p className="text-sm text-muted-foreground">
                        JPG hoặc PNG, tối đa 2MB.
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        Thay ảnh đại diện
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <SettingsField label="Họ và tên" htmlFor="full-name">
                      <Input
                        id="full-name"
                        value={settings.profile.fullName}
                        onChange={(event) =>
                          updateSection('profile', {
                            fullName: event.target.value,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField label="Email" htmlFor="email">
                      <Input
                        id="email"
                        type="email"
                        value={settings.profile.email}
                        onChange={(event) =>
                          updateSection('profile', {
                            email: event.target.value,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField label="Số điện thoại" htmlFor="phone">
                      <Input
                        id="phone"
                        value={settings.profile.phone}
                        onChange={(event) =>
                          updateSection('profile', {
                            phone: event.target.value,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField label="Ngôn ngữ">
                      <Select
                        value={settings.profile.language}
                        onValueChange={(language) =>
                          updateSection('profile', { language })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vi">Tiếng Việt</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                    <SettingsField label="Múi giờ" className="md:col-span-2">
                      <Select
                        value={settings.profile.timeZone}
                        onValueChange={(timeZone) =>
                          updateSection('profile', { timeZone })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asia-ho-chi-minh">
                            (GMT+07:00) Hồ Chí Minh
                          </SelectItem>
                          <SelectItem value="asia-singapore">
                            (GMT+08:00) Singapore
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                  </div>
                </SettingsSection>

                <SettingsSection
                  icon={Globe2}
                  title="Ngôn ngữ và khu vực"
                  description="Các thiết lập này ảnh hưởng đến định dạng hiển thị trong ứng dụng."
                >
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <p>
                        Thay đổi chỉ được áp dụng sau khi bạn bấm{' '}
                        <span className="font-medium text-foreground">
                          Lưu thay đổi
                        </span>
                        . Không có request riêng khi chỉnh từng trường.
                      </p>
                    </div>
                  </div>
                </SettingsSection>
                <SettingsActions
                  isDirty={isSectionDirty('profile')}
                  onSave={() => saveSection('profile')}
                  onReset={() => resetSection('profile')}
                />
              </TabsContent>

              <TabsContent value="organization" className="mt-0 space-y-5">
                <SettingsSection
                  icon={Building2}
                  title="Thông tin tổ chức"
                  description="Thông tin dùng chung cho biểu mẫu, chứng từ và các báo cáo."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SettingsField label="Tên tổ chức" htmlFor="org-name">
                      <Input
                        id="org-name"
                        value={settings.organization.name}
                        onChange={(event) =>
                          updateSection('organization', {
                            name: event.target.value,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField label="Mã số thuế" htmlFor="tax-code">
                      <Input
                        id="tax-code"
                        value={settings.organization.taxCode}
                        onChange={(event) =>
                          updateSection('organization', {
                            taxCode: event.target.value,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label="Địa chỉ"
                      htmlFor="org-address"
                      className="md:col-span-2"
                    >
                      <Textarea
                        id="org-address"
                        rows={3}
                        value={settings.organization.address}
                        onChange={(event) =>
                          updateSection('organization', {
                            address: event.target.value,
                          })
                        }
                      />
                    </SettingsField>
                    <SettingsField
                      label="Kho mặc định"
                      description="Kho được chọn mặc định khi tạo phiếu mới."
                    >
                      <Select
                        value={settings.organization.warehouse}
                        onValueChange={(warehouse) =>
                          updateSection('organization', { warehouse })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kho-trung-tam">
                            Kho trung tâm
                          </SelectItem>
                          <SelectItem value="kho-mien-bac">
                            Kho miền Bắc
                          </SelectItem>
                          <SelectItem value="kho-mien-nam">
                            Kho miền Nam
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                  </div>
                </SettingsSection>
                <SettingsActions
                  isDirty={isSectionDirty('organization')}
                  onSave={() => saveSection('organization')}
                  onReset={() => resetSection('organization')}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-5">
                <SettingsSection
                  icon={Bell}
                  title="Kênh thông báo"
                  description="Chọn những loại thông báo bạn muốn nhận."
                >
                  <SettingsGroup>
                    <SettingsRow
                      title="Thông báo qua email"
                      description="Nhận cập nhật quan trọng và thông báo phê duyệt qua email."
                      control={
                        <SwitchWrapper>
                          <Switch
                            checked={settings.notifications.email}
                            onCheckedChange={(email) =>
                              updateSection('notifications', { email })
                            }
                          />
                        </SwitchWrapper>
                      }
                    />
                    <SettingsRow
                      title="Thông báo trong ứng dụng"
                      description="Hiển thị thông báo trong trung tâm thông báo."
                      control={
                        <SwitchWrapper>
                          <Switch
                            checked={settings.notifications.inApp}
                            onCheckedChange={(inApp) =>
                              updateSection('notifications', { inApp })
                            }
                          />
                        </SwitchWrapper>
                      }
                    />
                    <SettingsRow
                      title="Bảo trì hệ thống"
                      description="Thông báo trước khi hệ thống có lịch bảo trì."
                      control={
                        <SwitchWrapper>
                          <Switch
                            checked={settings.notifications.maintenance}
                            onCheckedChange={(maintenance) =>
                              updateSection('notifications', { maintenance })
                            }
                          />
                        </SwitchWrapper>
                      }
                    />
                    <SettingsRow
                      title="Báo cáo tổng hợp hàng tuần"
                      description="Tóm tắt hoạt động và chỉ số vận hành mỗi tuần."
                      control={
                        <SwitchWrapper>
                          <Switch
                            checked={settings.notifications.weeklySummary}
                            onCheckedChange={(weeklySummary) =>
                              updateSection('notifications', { weeklySummary })
                            }
                          />
                        </SwitchWrapper>
                      }
                    />
                  </SettingsGroup>
                </SettingsSection>

                <SettingsSection
                  icon={Bell}
                  title="Tần suất gửi tổng hợp"
                  description="Quy định thời điểm hệ thống gom và gửi thông báo."
                >
                  <SettingsField label="Tần suất">
                    <Select
                      value={settings.notifications.digest}
                      onValueChange={(digest) =>
                        updateSection('notifications', { digest })
                      }
                    >
                      <SelectTrigger className="max-w-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Ngay lập tức</SelectItem>
                        <SelectItem value="daily">Mỗi ngày</SelectItem>
                        <SelectItem value="weekly">Mỗi tuần</SelectItem>
                      </SelectContent>
                    </Select>
                  </SettingsField>
                </SettingsSection>
                <SettingsActions
                  isDirty={isSectionDirty('notifications')}
                  onSave={() => saveSection('notifications')}
                  onReset={() => resetSection('notifications')}
                />
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-5">
                <SettingsSection
                  icon={ShieldCheck}
                  title="Bảo mật tài khoản"
                  description="Tăng cường bảo vệ tài khoản và kiểm soát phiên đăng nhập."
                >
                  <SettingsGroup>
                    <SettingsRow
                      title="Xác thực hai bước"
                      description="Yêu cầu mã xác thực ngoài mật khẩu khi đăng nhập."
                      control={
                        <SwitchWrapper>
                          <Switch
                            checked={settings.security.twoFactor}
                            onCheckedChange={(twoFactor) =>
                              updateSection('security', { twoFactor })
                            }
                          />
                        </SwitchWrapper>
                      }
                    />
                    <SettingsRow
                      title="Cảnh báo đăng nhập mới"
                      description="Thông báo khi tài khoản đăng nhập từ thiết bị mới."
                      control={
                        <SwitchWrapper>
                          <Switch
                            checked={settings.security.loginAlerts}
                            onCheckedChange={(loginAlerts) =>
                              updateSection('security', { loginAlerts })
                            }
                          />
                        </SwitchWrapper>
                      }
                    />
                  </SettingsGroup>

                  <div className="grid gap-4 md:grid-cols-2">
                    <SettingsField
                      label="Thời gian hết hạn phiên"
                      description="Tự động đăng xuất khi không hoạt động."
                    >
                      <Select
                        value={settings.security.sessionTimeout}
                        onValueChange={(sessionTimeout) =>
                          updateSection('security', { sessionTimeout })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 phút</SelectItem>
                          <SelectItem value="30">30 phút</SelectItem>
                          <SelectItem value="60">60 phút</SelectItem>
                          <SelectItem value="never">Không tự động</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                  </div>
                </SettingsSection>
                <SettingsActions
                  isDirty={isSectionDirty('security')}
                  onSave={() => saveSection('security')}
                  onReset={() => resetSection('security')}
                />
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-5">
                <SettingsSection
                  icon={Palette}
                  title="Giao diện ứng dụng"
                  description="Tùy chỉnh cách hiển thị phù hợp với quy trình làm việc."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SettingsField label="Chủ đề">
                      <Select
                        value={settings.appearance.theme}
                        onValueChange={(theme) => {
                          if (
                            theme === 'system' ||
                            theme === 'light' ||
                            theme === 'dark'
                          ) {
                            updateAppearance({ theme });
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
                        value={settings.appearance.density}
                        onValueChange={(density) => {
                          if (
                            density === 'small' ||
                            density === 'medium' ||
                            density === 'large'
                          ) {
                            updateAppearance({ density });
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

                  <Separator />

                  <SettingsRow
                    title="Thu gọn sidebar mặc định"
                    description="Mở nội dung rộng hơn khi làm việc với bảng dữ liệu."
                    control={
                      <SwitchWrapper>
                        <Switch
                          checked={settings.appearance.sidebarCollapsed}
                          onCheckedChange={(sidebarCollapsed) =>
                            updateAppearance({ sidebarCollapsed })
                          }
                        />
                      </SwitchWrapper>
                    }
                  />
                </SettingsSection>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

function getTabLabel(tab: SettingsTab) {
  return tabs.find((item) => item.value === tab)?.label ?? tab;
}

function SettingsActions({
  isDirty,
  onSave,
  onReset,
}: {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 pt-4">
      {!isDirty && (
        <span className="me-auto text-xs text-muted-foreground">
          Không có thay đổi chưa lưu
        </span>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        disabled={!isDirty}
      >
        <RotateCcw />
        Hoàn tác
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={onSave}
        disabled={!isDirty}
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
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardHeading>
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="size-4 text-primary" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeading>
      </CardHeader>
      <CardContent className="space-y-5 p-5">{children}</CardContent>
    </Card>
  );
}

function SettingsField({
  label,
  description,
  htmlFor,
  className,
  children,
}: {
  label: string;
  description?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className ?? ''}`}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
