import { ClipboardCheck } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function InventoryTab() {
  return (
    <TabPlaceholder
      title="Lịch sử kiểm kê"
      description="Khung lịch sử kiểm kê sẽ được bổ sung ở bước sau."
      icon={ClipboardCheck}
    />
  );
}
