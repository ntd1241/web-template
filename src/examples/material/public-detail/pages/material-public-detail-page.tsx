import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { MaterialGalleryCard } from '../components/material-gallery-card';
import { MaterialHeroCard } from '../components/material-hero-card';
import { MaterialSummarySidebar } from '../components/material-summary-sidebar';
import { PublicDetailHeader } from '../components/public-detail-header';
import { PublicDetailShell } from '../components/public-detail-shell';
import type { MaterialPublicTabValue } from '../data/material-public-detail.mock';
import { CommonTab } from '../tabs/common';
import { FeedbackTab } from '../tabs/feedback';
import { HandoverTab } from '../tabs/handover';
import { InventoryTab } from '../tabs/inventory';
import { RepairTab } from '../tabs/repair';

export function MaterialPublicDetailPage() {
  const [activeTab, setActiveTab] = useState<MaterialPublicTabValue>('general');

  return (
    <>
      <PublicDetailHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="py-8">
        <PublicDetailShell>
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as MaterialPublicTabValue)
            }
            className="min-w-0"
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
              <div className="flex min-w-0 flex-col gap-6">
                <MaterialHeroCard />
                <MaterialGalleryCard />

                <TabsContent value="general" className="mt-0">
                  <CommonTab />
                </TabsContent>
                <TabsContent value="handover" className="mt-0">
                  <HandoverTab />
                </TabsContent>
                <TabsContent value="inventory" className="mt-0">
                  <InventoryTab />
                </TabsContent>
                <TabsContent value="repair" className="mt-0">
                  <RepairTab />
                </TabsContent>
                <TabsContent value="feedback" className="mt-0">
                  <FeedbackTab />
                </TabsContent>
              </div>

              <MaterialSummarySidebar />
            </div>
          </Tabs>
        </PublicDetailShell>
      </main>
    </>
  );
}
