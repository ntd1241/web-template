import { MessageSquareWarning } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function FeedbackTab() {
  return (
    <TabPlaceholder
      title="Phản ánh"
      description="Gửi phản ánh khi bình bị mất niêm phong, tụt áp, hư hỏng hoặc không còn đúng vị trí."
      icon={MessageSquareWarning}
    />
  );
}
