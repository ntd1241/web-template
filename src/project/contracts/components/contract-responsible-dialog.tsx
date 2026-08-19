import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/errors';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SelectSearch,
  type SearchSelectOption,
} from '@/components/ui/select-search';
import { EmployeeIdentity } from '../../employees/components/employee-identity';
import { useContractResponsibleWorkspace } from '../hooks/use-contract-responsible-workspace';
import type {
  ContractResponsibleAssignmentInput,
  ContractResponsibleEmployee,
  ContractResponsiblePermissionDefinition,
} from '../model/contract-responsible';

interface DraftAssignment {
  employeeId: string;
  disabledPermissionCodes: string[];
}

export function ContractResponsibleDialog({
  open,
  onOpenChange,
  tenantId,
  contractId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  contractId: string;
}) {
  const { workspaceQuery, saveMutation } = useContractResponsibleWorkspace({
    tenantId,
    contractId,
    enabled: open,
  });
  const [draftAssignments, setDraftAssignments] = useState<DraftAssignment[]>(
    [],
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  useEffect(() => {
    if (!open || !workspaceQuery.data) return;
    setDraftAssignments(
      workspaceQuery.data.assignments.map((assignment) => ({
        employeeId: assignment.employeeId,
        disabledPermissionCodes: assignment.disabledPermissionCodes,
      })),
    );
    setSelectedEmployeeId('');
  }, [open, workspaceQuery.data]);

  const employeesById = useMemo(
    () =>
      new Map(
        (workspaceQuery.data?.employees ?? []).map((employee) => [
          employee.id,
          employee,
        ]),
      ),
    [workspaceQuery.data?.employees],
  );
  const availableEmployeeOptions = useMemo(
    () =>
      (workspaceQuery.data?.employees ?? [])
        .filter(
          (employee) =>
            employee.status === 'active' &&
            !draftAssignments.some(
              (assignment) => assignment.employeeId === employee.id,
            ),
        )
        .map<SearchSelectOption<ContractResponsibleEmployee>>((employee) => ({
          value: employee.id,
          data: employee,
          searchableText: `${employee.displayName} ${employee.employeeCode} ${employee.department}`,
          label: <EmployeeIdentity employee={employee} />,
        })),
    [draftAssignments, workspaceQuery.data?.employees],
  );
  const permissionDefinitions =
    workspaceQuery.data?.permissionDefinitions ?? [];

  function addEmployee(
    option: SearchSelectOption<ContractResponsibleEmployee> | undefined,
  ) {
    if (!option?.data) return;
    setDraftAssignments((current) => [
      ...current,
      { employeeId: option.data.id, disabledPermissionCodes: [] },
    ]);
    setSelectedEmployeeId('');
  }

  function removeEmployee(employeeId: string) {
    setDraftAssignments((current) =>
      current.filter((assignment) => assignment.employeeId !== employeeId),
    );
  }

  function setPermissionEnabled(
    employee: ContractResponsibleEmployee,
    permissionCode: string,
    enabled: boolean,
  ) {
    if (!employee.defaultPermissionCodes.includes(permissionCode)) return;
    setDraftAssignments((current) =>
      current.map((assignment) => {
        if (assignment.employeeId !== employee.id) return assignment;
        const disabled = new Set(assignment.disabledPermissionCodes);
        if (enabled) disabled.delete(permissionCode);
        else disabled.add(permissionCode);
        return {
          ...assignment,
          disabledPermissionCodes: [...disabled],
        };
      }),
    );
  }

  async function handleSave() {
    const payload: ContractResponsibleAssignmentInput[] = draftAssignments.map(
      (assignment) => ({
        employeeId: assignment.employeeId,
        disabledPermissionCodes: assignment.disabledPermissionCodes,
      }),
    );
    try {
      await saveMutation.mutateAsync(payload);
      toast.success('Đã cập nhật nhân viên và quyền theo hợp đồng.');
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const isLoading = workspaceQuery.isPending;
  const isError = workspaceQuery.isError;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5 text-start">
          <DialogTitle>Nhân viên phụ trách</DialogTitle>
        </DialogHeader>
        <DialogBody className="min-h-0 flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-5 px-6 py-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Thêm nhân viên
                </label>
                <SelectSearch
                  value={selectedEmployeeId}
                  options={availableEmployeeOptions}
                  onChange={setSelectedEmployeeId}
                  onSelect={addEmployee}
                  placeholder="Chọn nhân viên phụ trách"
                  searchPlaceholder="Tìm theo tên, mã hoặc phòng ban..."
                  emptyMessage="Không còn nhân viên phù hợp"
                  disabled={isLoading || isError || saveMutation.isPending}
                  canDeselect={false}
                  renderOption={(option) => option.label}
                />
              </div>

              {isLoading ? (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Đang tải danh sách nhân viên và quyền...
                </div>
              ) : isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  {getApiErrorMessage(workspaceQuery.error)}
                </div>
              ) : draftAssignments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có nhân viên phụ trách.
                </p>
              ) : (
                <Accordion type="multiple" variant="outline">
                  {draftAssignments.map((assignment) => {
                    const employee = employeesById.get(assignment.employeeId);
                    if (!employee) return null;
                    return (
                      <ResponsibleEmployeeCard
                        key={employee.id}
                        employee={employee}
                        disabledPermissionCodes={
                          assignment.disabledPermissionCodes
                        }
                        permissionDefinitions={permissionDefinitions}
                        onRemove={() => removeEmployee(employee.id)}
                        onPermissionChange={(code, enabled) =>
                          setPermissionEnabled(employee, code, enabled)
                        }
                        disabled={saveMutation.isPending}
                      />
                    );
                  })}
                </Accordion>
              )}
            </div>
          </ScrollArea>
        </DialogBody>
        <DialogFooter className="shrink-0 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => void handleSave()}
            loading={saveMutation.isPending}
            loadingText="Đang lưu..."
            disabled={isLoading || isError}
          >
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ResponsibleEmployeeCard({
  employee,
  disabledPermissionCodes,
  permissionDefinitions,
  onRemove,
  onPermissionChange,
  disabled,
}: {
  employee: ContractResponsibleEmployee;
  disabledPermissionCodes: string[];
  permissionDefinitions: ContractResponsiblePermissionDefinition[];
  onRemove: () => void;
  onPermissionChange: (permissionCode: string, enabled: boolean) => void;
  disabled: boolean;
}) {
  const disabledSet = new Set(disabledPermissionCodes);
  const defaultCount = employee.defaultPermissionCodes.filter((code) =>
    permissionDefinitions.some((permission) => permission.code === code),
  ).length;
  const enabledCount = Math.max(
    defaultCount -
      disabledPermissionCodes.filter((code) =>
        employee.defaultPermissionCodes.includes(code),
      ).length,
    0,
  );

  return (
    <AccordionItem value={employee.id}>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <AccordionTrigger className="w-full text-start hover:no-underline">
            <div className="flex w-full min-w-0 items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <EmployeeIdentity employee={employee} />
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {enabledCount}/{defaultCount} quyền
              </span>
            </div>
          </AccordionTrigger>
        </div>
        <Button
          type="button"
          mode="icon"
          variant="ghost"
          aria-label={`Xóa ${employee.displayName} khỏi hợp đồng`}
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 />
        </Button>
      </div>
      <AccordionContent>
        <div className="grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
          {permissionDefinitions.map((permission) => {
            const hasDefault = employee.defaultPermissionCodes.includes(
              permission.code,
            );
            const checked = hasDefault && !disabledSet.has(permission.code);
            return (
              <label
                key={permission.code}
                className="flex items-start gap-2.5 rounded-md px-1 py-1 text-sm hover:bg-accent/50"
              >
                <Checkbox
                  checked={checked}
                  disabled={!hasDefault || disabled || !employee.userId}
                  onCheckedChange={(value) =>
                    onPermissionChange(permission.code, value === true)
                  }
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">
                    {permission.name}
                  </span>
                  {!hasDefault ? (
                    <span className="block text-xs text-muted-foreground">
                      Chưa được cấp ở vai trò nhân viên
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
