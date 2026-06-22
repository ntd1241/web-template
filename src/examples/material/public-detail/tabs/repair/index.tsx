import { Wrench } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function RepairTab() {
  return (
    <TabPlaceholder
      title="Lịch sử sửa chữa"
      description="Chưa phát sinh sửa chữa. Lần nạp sạc gần nhất ngày 15/12/2025."
      icon={Wrench}
    />
  );
}
