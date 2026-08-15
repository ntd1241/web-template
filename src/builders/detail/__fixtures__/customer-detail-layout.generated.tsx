/**
 * Scaffolded by detail-builder from `src/builders/detail/__fixtures__/customer-detail-layout.fixture.ts`. Run `npm run gen:detail` — do NOT hand-write this file.
 * You own this file now — wire profile, information, actions, and tab content to screen logic.
 * To change the tab structure, edit the spec and re-gen to a scratch path first.
 */
import type { ReactNode } from 'react';
import { BarChart3, FileText, Users } from 'lucide-react';
import {
  EntityDetailLayout,
  EntityDetailTabs,
  type EntityDetailTab,
} from '@/components/layouts/entity-detail-layout';

export interface CustomerDetailLayoutProps {
  profile: ReactNode;
  information: ReactNode;
  contractsContent: ReactNode;
  employeesContent: ReactNode;
  reportsContent: ReactNode;
  className?: string;
}
export function CustomerDetailLayout({
  profile,
  information,
  contractsContent,
  employeesContent,
  reportsContent,
  className,
}: CustomerDetailLayoutProps) {
  const tabs: EntityDetailTab[] = [
    {
      value: 'contracts',
      label: 'Hợp đồng',
      icon: FileText,
      content: contractsContent,
    },
    {
      value: 'employees',
      label: 'Nhân viên',
      icon: Users,
      content: employeesContent,
    },
    {
      value: 'reports',
      label: 'Báo cáo',
      icon: BarChart3,
      content: reportsContent,
    },
  ];

  return (
    <EntityDetailLayout
      profile={profile}
      information={information}
      tabs={<EntityDetailTabs tabs={tabs} defaultValue="contracts" />}
      className={className}
    />
  );
}
