import { SavedViewsToolbar } from '@/project/saved-views/components/saved-views-toolbar';
import type { CustomerListFilters } from '../model/customer';
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
    <SavedViewsToolbar<CustomerListFilters>
      views={views}
      activeViewId={activeViewId}
      canManage={canManage}
      isLoading={isLoading}
      isDirty={isDirty}
      isSaving={isSaving}
      onSelect={onSelect}
      onCreate={onCreate}
      onEdit={onEdit}
      onSaveCurrent={onSaveCurrent}
    />
  );
}
