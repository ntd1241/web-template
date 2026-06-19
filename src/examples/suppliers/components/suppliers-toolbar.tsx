import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/inputs/search-input';

interface SuppliersToolbarProps {
  keyword: string;
  isLoading: boolean;
  onKeywordChange: (value: string) => void;
  onRefresh: () => void;
}

export function SuppliersToolbar({
  keyword,
  isLoading,
  onKeywordChange,
  onRefresh,
}: SuppliersToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <SearchInput
        value={keyword}
        onSearch={onKeywordChange}
        placeholder="Tìm mã, tên, người liên hệ, số điện thoại"
        className="w-full sm:w-[320px]"
      />
      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={onRefresh}
      >
        <RefreshCw className="size-4" />
        Tải lại
      </Button>
      <Button type="button" disabled>
        <Plus className="size-4" />
        Thêm nhà cung cấp
      </Button>
    </div>
  );
}
