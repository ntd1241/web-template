import { History } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function HandoverTab() {
  return (
    <TabPlaceholder
      title="Lịch sử bàn giao"
      description="Bàn giao ngày 20/05/2024 cho Ban Quản lý tòa nhà, người nhận Trần Quốc Bảo."
      icon={History}
    />
  );
}
