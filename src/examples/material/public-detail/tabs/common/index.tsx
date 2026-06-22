import { Info } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function CommonTab() {
  return (
    <TabPlaceholder
      title="Thông tin chung"
      description="Bình bột ABC 4kg, dùng cho đám cháy chất rắn, chất lỏng và thiết bị điện. Khối lượng tổng 5,6kg; áp suất làm việc 1,2 MPa."
      icon={Info}
    />
  );
}
