import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
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
import { toast } from 'sonner';
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
    theme: string;
    density: string;
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
    density: 'comfortable',
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

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsValues>(initialSettings);
  const [savedSettings, setSavedSettings] =
    useState<SettingsValues>(initialSettings);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedSettings(settings);
    toast.success('Đã lưu cài đặt ứng dụng');
  };

  const handleReset = () => {
    setSettings(savedSettings);
    toast.info('Đã hoàn tác các thay đổi chưa lưu');
  };

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
        <Tabs
          defaultValue="profile"
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
                <SettingsActions isDirty={isDirty} onReset={handleReset} />
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
                <SettingsActions isDirty={isDirty} onReset={handleReset} />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 space-y-5">
                <SettingsSection
                  icon={Bell}
                  title="Kênh thông báo"
                  description="Chọn những loại thông báo bạn muốn nhận."
                >
                  <div className="divide-y divide-border rounded-lg border border-border/70">
                    <SettingsSwitchRow
                      title="Thông báo qua email"
                      description="Nhận cập nhật quan trọng và thông báo phê duyệt qua email."
                      checked={settings.notifications.email}
                      onCheckedChange={(email) =>
                        updateSection('notifications', { email })
                      }
                    />
                    <SettingsSwitchRow
                      title="Thông báo trong ứng dụng"
                      description="Hiển thị thông báo trong trung tâm thông báo."
                      checked={settings.notifications.inApp}
                      onCheckedChange={(inApp) =>
                        updateSection('notifications', { inApp })
                      }
                    />
                    <SettingsSwitchRow
                      title="Bảo trì hệ thống"
                      description="Thông báo trước khi hệ thống có lịch bảo trì."
                      checked={settings.notifications.maintenance}
                      onCheckedChange={(maintenance) =>
                        updateSection('notifications', { maintenance })
                      }
                    />
                    <SettingsSwitchRow
                      title="Báo cáo tổng hợp hàng tuần"
                      description="Tóm tắt hoạt động và chỉ số vận hành mỗi tuần."
                      checked={settings.notifications.weeklySummary}
                      onCheckedChange={(weeklySummary) =>
                        updateSection('notifications', { weeklySummary })
                      }
                    />
                  </div>
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
                <SettingsActions isDirty={isDirty} onReset={handleReset} />
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-5">
                <SettingsSection
                  icon={ShieldCheck}
                  title="Bảo mật tài khoản"
                  description="Tăng cường bảo vệ tài khoản và kiểm soát phiên đăng nhập."
                >
                  <div className="divide-y divide-border rounded-lg border border-border/70">
                    <SettingsSwitchRow
                      title="Xác thực hai bước"
                      description="Yêu cầu mã xác thực ngoài mật khẩu khi đăng nhập."
                      checked={settings.security.twoFactor}
                      onCheckedChange={(twoFactor) =>
                        updateSection('security', { twoFactor })
                      }
                    />
                    <SettingsSwitchRow
                      title="Cảnh báo đăng nhập mới"
                      description="Thông báo khi tài khoản đăng nhập từ thiết bị mới."
                      checked={settings.security.loginAlerts}
                      onCheckedChange={(loginAlerts) =>
                        updateSection('security', { loginAlerts })
                      }
                    />
                  </div>

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
                <SettingsActions isDirty={isDirty} onReset={handleReset} />
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
                        onValueChange={(theme) =>
                          updateSection('appearance', { theme })
                        }
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
                        onValueChange={(density) =>
                          updateSection('appearance', { density })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="comfortable">Thoải mái</SelectItem>
                          <SelectItem value="compact">Gọn</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingsField>
                  </div>

                  <Separator />

                  <SettingsSwitchRow
                    title="Thu gọn sidebar mặc định"
                    description="Mở nội dung rộng hơn khi làm việc với bảng dữ liệu."
                    checked={settings.appearance.sidebarCollapsed}
                    onCheckedChange={(sidebarCollapsed) =>
                      updateSection('appearance', { sidebarCollapsed })
                    }
                  />
                </SettingsSection>
                <SettingsActions isDirty={isDirty} onReset={handleReset} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </form>
    </div>
  );
}

function SettingsActions({
  isDirty,
  onReset,
}: {
  isDirty: boolean;
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
      <Button type="submit" variant="primary" disabled={!isDirty}>
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

function SettingsSwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <SwitchWrapper className="shrink-0">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </SwitchWrapper>
    </div>
  );
}
