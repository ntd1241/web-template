/**
 * Scaffolded by detail-builder from `src/project/contracts/detail/contract-detail-layout.fixture.ts`. Run `npm run gen:detail` — do NOT hand-write this file.
 * You own this file now — wire profile, information, actions, and tab content to screen logic.
 * To change the tab structure, edit the spec and re-gen to a scratch path first.
 */
import type { ReactNode } from 'react';
import {
  History,
  LayoutDashboard,
  ReceiptText,
  WalletCards,
} from 'lucide-react';
import {
  EntityDetailLayout,
  EntityDetailTabs,
  type EntityDetailTab,
} from '@/components/layouts/entity-detail-layout';

export interface ContractDetailLayoutProps {
  profile: ReactNode;
  information: ReactNode;
  overviewContent: ReactNode;
  receivablesContent: ReactNode;
  versionsContent: ReactNode;
  paymentsContent: ReactNode;
  receivablesBadge?: ReactNode;
  className?: string;
}
export function ContractDetailLayout({
  profile,
  information,
  overviewContent,
  receivablesContent,
  versionsContent,
  paymentsContent,
  receivablesBadge,
  className,
}: ContractDetailLayoutProps) {
  const tabs: EntityDetailTab[] = [
    {
      value: 'overview',
      label: 'Tổng quan',
      icon: LayoutDashboard,
      content: overviewContent,
    },
    {
      value: 'receivables',
      label: 'Kỳ thanh toán',
      icon: ReceiptText,
      content: receivablesContent,
      badge: receivablesBadge,
    },
    {
      value: 'versions',
      label: 'Phiên bản',
      icon: History,
      content: versionsContent,
    },
    {
      value: 'payments',
      label: 'Thanh toán',
      icon: WalletCards,
      content: paymentsContent,
    },
  ];

  return (
    <EntityDetailLayout
      profile={profile}
      information={information}
      tabs={<EntityDetailTabs tabs={tabs} defaultValue="overview" />}
      className={className}
    />
  );
}
