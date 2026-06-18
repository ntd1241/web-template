import { History } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function HandoverTab() {
  return (
    <TabPlaceholder
      title="Lịch sử bàn giao"
      description="Khung lịch sử bàn giao sẽ được bổ sung ở bước sau."
      icon={History}
    />
  );
}
