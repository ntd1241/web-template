import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SavedViewList } from '@/components/ui/saved-view-list';
import type { CustomerSavedView } from '../model/customer-saved-view';

interface CustomerSavedViewsProps {
  views: readonly CustomerSavedView[];
  activeViewId: string | null;
  canManage: boolean;
  isLoading?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  onSelect: (viewId: string | null) => void;
  onCreate: () => void;
  onEdit: (view: CustomerSavedView) => void;
  onSaveCurrent: () => void;
}

export function CustomerSavedViews({
  views,
  activeViewId,
  canManage,
  isLoading = false,
  isDirty = false,
  isSaving = false,
  onSelect,
  onCreate,
  onEdit,
  onSaveCurrent,
}: CustomerSavedViewsProps) {
  return (
    <div className="flex min-w-0 max-w-full items-center gap-3">
      <SavedViewList
        views={views}
        activeViewId={activeViewId}
        onViewChange={onSelect}
        onViewSettings={canManage ? onEdit : undefined}
        onAdd={onCreate}
        canAdd={canManage}
        addLabel="Tạo view"
        disabled={isLoading}
        className="min-w-0 flex-1"
      />
      {canManage ? (
        <div className="flex shrink-0 items-center gap-3">
          {isDirty ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveCurrent}
              disabled={isSaving}
              title="Lưu thay đổi vào chế độ xem"
            >
              <Save />
              Lưu vào view
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
