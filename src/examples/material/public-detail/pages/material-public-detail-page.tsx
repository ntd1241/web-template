import { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { MaterialGalleryCard } from '../components/material-gallery-card';
import { MaterialSummarySidebar } from '../components/material-summary-sidebar';
import { PublicDetailHeader } from '../components/public-detail-header';
import { PublicDetailShell } from '../components/public-detail-shell';
import type { MaterialPublicTabValue } from '../data/material-public-detail.mock';
import { CommonTab } from '../tabs/common';
import { FeedbackTab } from '../tabs/feedback';
import { HandoverTab } from '../tabs/handover';
import { InventoryTab } from '../tabs/inventory';
import { RepairTab } from '../tabs/repair';
import { SafetyTab } from '../tabs/safety';
import { MaterialSafetyInspectionFormPage } from './material-safety-inspection-form-page';

export function MaterialPublicDetailPage() {
  const [activeTab, setActiveTab] = useState<MaterialPublicTabValue>('general');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreatingSafetyInspection, setIsCreatingSafetyInspection] =
    useState(false);

  const handleAuthToggle = () => {
    setIsAuthenticated((current) => {
      if (current) {
        setIsCreatingSafetyInspection(false);
      }

      return !current;
    });
  };

  const handleBackToSafetyTab = () => {
    setIsCreatingSafetyInspection(false);
    setActiveTab('safety');
  };

  return (
    <>
      <PublicDetailHeader
        activeTab={activeTab}
        isAuthenticated={isAuthenticated}
        isFormView={isCreatingSafetyInspection}
        onAuthToggle={handleAuthToggle}
        onBack={handleBackToSafetyTab}
        onTabChange={setActiveTab}
      />

      <main className="py-8">
        <PublicDetailShell>
          {isCreatingSafetyInspection ? (
            <MaterialSafetyInspectionFormPage />
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as MaterialPublicTabValue)
              }
              className="min-w-0"
            >
              <TabsContent value="general" className="mt-0">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
                  <div className="flex min-w-0 flex-col gap-6">
                    <MaterialGalleryCard />
                    <CommonTab />
                  </div>

                  <MaterialSummarySidebar />
                </div>
              </TabsContent>
              <TabsContent value="handover" className="mt-0">
                <HandoverTab />
              </TabsContent>
              <TabsContent value="inventory" className="mt-0">
                <InventoryTab />
              </TabsContent>
              <TabsContent value="safety" className="mt-0">
                <SafetyTab
                  isAuthenticated={isAuthenticated}
                  onCreateInspection={() => setIsCreatingSafetyInspection(true)}
                />
              </TabsContent>
              <TabsContent value="repair" className="mt-0">
                <RepairTab />
              </TabsContent>
              <TabsContent value="feedback" className="mt-0">
                <FeedbackTab />
              </TabsContent>
            </Tabs>
          )}
        </PublicDetailShell>
      </main>
    </>
  );
}
