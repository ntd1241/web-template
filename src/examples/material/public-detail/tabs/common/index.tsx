import { Info } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function CommonTab() {
  return (
    <TabPlaceholder
      title="Thông tin chung"
      description="Khung thông tin chung sẽ được bổ sung ở bước sau."
      icon={Info}
    />
  );
}
