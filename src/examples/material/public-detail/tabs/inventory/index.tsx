import { ClipboardCheck } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function InventoryTab() {
  return (
    <TabPlaceholder
      title="Lịch sử kiểm kê"
      description="Kiểm kê ngày 15/06/2026: đúng vị trí, tem kiểm định còn hạn, áp suất đạt yêu cầu."
      icon={ClipboardCheck}
    />
  );
}
