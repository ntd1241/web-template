import { Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, InputWrapper } from '@/components/ui/input';

interface EmployeesToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onRefresh: () => void;
  canManage: boolean;
}

/** Toolbar của trang: tìm kiếm + làm mới + nút cấp tài khoản (gated theo quyền). */
export function EmployeesToolbar({
  keyword,
  onKeywordChange,
  onRefresh,
  canManage,
}: EmployeesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <InputWrapper className="w-64">
        <Search />
        <Input
          type="search"
          placeholder="Tìm theo tên hoặc tên đăng nhập"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </InputWrapper>

      <Button
        variant="outline"
        mode="icon"
        onClick={onRefresh}
        aria-label="Làm mới danh sách"
      >
        <RefreshCw />
      </Button>

      {canManage && (
        <Button variant="primary">
          <Plus />
          Cấp tài khoản
        </Button>
      )}
    </div>
  );
}
