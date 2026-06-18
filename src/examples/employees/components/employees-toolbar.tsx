import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/inputs/search-input';
import { MultiSelect } from '@/components/ui/multi-select';
import { EMPLOYEE_ROLE_LABELS, EMPLOYEE_ROLES } from '../model/employee';
import type { EmployeeRole } from '../model/employee';

const roleOptions = EMPLOYEE_ROLES.map((role) => ({
  value: role,
  label: EMPLOYEE_ROLE_LABELS[role],
  searchableText: EMPLOYEE_ROLE_LABELS[role],
  group: 'Vai trò',
}));

function isEmployeeRole(value: string): value is EmployeeRole {
  return EMPLOYEE_ROLES.some((role) => role === value);
}

interface EmployeesToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  roleFilter: EmployeeRole[];
  onRoleFilterChange: (value: EmployeeRole[]) => void;
  onRefresh: () => void;
  onCreate: () => void;
  canManage: boolean;
}

/** Toolbar của trang: tìm kiếm + lọc vai trò + làm mới + nút cấp tài khoản. */
export function EmployeesToolbar({
  keyword,
  onKeywordChange,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
  onCreate,
  canManage,
}: EmployeesToolbarProps) {
  const handleRoleFilterChange = (nextValues: string[]) => {
    onRoleFilterChange(nextValues.filter(isEmployeeRole));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <SearchInput
        className="w-64"
        placeholder="Tìm theo tên hoặc tên đăng nhập"
        value={keyword}
        debounceMs={0}
        onSearch={onKeywordChange}
      />

      <div className="w-44">
        <MultiSelect
          value={roleFilter}
          onChange={handleRoleFilterChange}
          options={roleOptions}
          placeholder="Tất cả vai trò"
          searchPlaceholder="Tìm vai trò..."
          emptyMessage="Không có vai trò phù hợp"
        />
      </div>

      <Button
        variant="outline"
        mode="icon"
        onClick={onRefresh}
        aria-label="Làm mới danh sách"
      >
        <RefreshCw />
      </Button>

      {canManage && (
        <Button variant="primary" onClick={onCreate}>
          <Plus />
          Cấp tài khoản
        </Button>
      )}
    </div>
  );
}
