import type { LucideIcon } from 'lucide-react';
import { BarChart3, FileText, Users } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Customer } from '../model/customer';

type CustomerDetailTab = {
  value: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

const CUSTOMER_DETAIL_TABS: CustomerDetailTab[] = [
  {
    value: 'contracts',
    label: 'Hợp đồng',
    icon: FileText,
    description: 'Quản lý các hợp đồng và thỏa thuận của khách hàng.',
  },
  {
    value: 'employees',
    label: 'Nhân viên',
    icon: Users,
    description: 'Danh sách nhân viên và đầu mối liên hệ của khách hàng.',
  },
  {
    value: 'reports',
    label: 'Báo cáo',
    icon: BarChart3,
    description: 'Theo dõi báo cáo và các chỉ số liên quan.',
  },
];

function CustomerDetailTabPlaceholder({
  customer,
  tab,
}: {
  customer: Customer;
  tab: CustomerDetailTab;
}) {
  const Icon = tab.icon;

  return (
    <Card>
      <CardHeader className="flex-col items-stretch gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <CardHeading>
          <CardTitle>{tab.label}</CardTitle>
          <CardDescription>{tab.description}</CardDescription>
        </CardHeading>
        <span className="text-sm text-muted-foreground">Chưa có dữ liệu</span>
      </CardHeader>
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="font-medium text-foreground">
            Chưa có {tab.label.toLowerCase()}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Dữ liệu của khách hàng {customer.name} sẽ hiển thị tại đây.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerDetailTabs({ customer }: { customer: Customer }) {
  return (
    <Tabs defaultValue={CUSTOMER_DETAIL_TABS[0].value} className="min-w-0">
      <TabsList
        variant="line"
        size="md"
        className="w-full min-w-0 justify-start overflow-x-auto"
      >
        {CUSTOMER_DETAIL_TABS.map((tab) => {
          const Icon = tab.icon;

          return (
            <TabsTrigger key={tab.value} value={tab.value}>
              <Icon className="size-4" />
              {tab.label}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {CUSTOMER_DETAIL_TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          <CustomerDetailTabPlaceholder customer={customer} tab={tab} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
