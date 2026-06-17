import { Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input, InputWrapper } from '@/components/ui/input';
import { EMPLOYEE_ROLE_LABELS, EMPLOYEE_ROLES } from '../model/employee';
import type { EmployeeRole } from '../model/employee';

const roleOptions = EMPLOYEE_ROLES.map((role) => ({
  value: role,
  label: EMPLOYEE_ROLE_LABELS[role],
  searchableText: EMPLOYEE_ROLE_LABELS[role],
}));

function isEmployeeRole(value: string): value is EmployeeRole {
  return EMPLOYEE_ROLES.some((role) => role === value);
}

interface EmployeesToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  roleFilter: EmployeeRole | '';
  onRoleFilterChange: (value: EmployeeRole | '') => void;
  onRefresh: () => void;
  canManage: boolean;
}

/** Toolbar của trang: tìm kiếm + làm mới + nút cấp tài khoản (gated theo quyền). */
export function EmployeesToolbar({
  keyword,
  onKeywordChange,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
  canManage,
}: EmployeesToolbarProps) {
  const handleRoleFilterChange = (nextValue: string) => {
    onRoleFilterChange(isEmployeeRole(nextValue) ? nextValue : '');
  };

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

      <div className="w-44">
        <Combobox
          value={roleFilter}
          onChange={handleRoleFilterChange}
          options={roleOptions}
          placeholder="Táº¥t cáº£ vai trÃ²"
          searchPlaceholder="TÃ¬m vai trÃ²..."
          emptyMessage="KhÃ´ng cÃ³ vai trÃ² phÃ¹ há»£p"
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
        <Button variant="primary">
          <Plus />
          Cấp tài khoản
        </Button>
      )}
    </div>
  );
}
