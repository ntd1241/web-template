import { Wrench } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function RepairTab() {
  return (
    <TabPlaceholder
      title="Lịch sử sửa chữa"
      description="Khung lịch sử sửa chữa sẽ được bổ sung ở bước sau."
      icon={Wrench}
    />
  );
}
