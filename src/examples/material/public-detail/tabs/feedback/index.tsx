import { MessageSquareWarning } from 'lucide-react';
import { TabPlaceholder } from '../tab-placeholder';

export function FeedbackTab() {
  return (
    <TabPlaceholder
      title="Phản ánh"
      description="Khung phản ánh sẽ được bổ sung ở bước sau."
      icon={MessageSquareWarning}
    />
  );
}
