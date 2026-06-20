import { createQueryKeys } from '@/constants/query-keys';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { toastError } from '@/lib/errors';
import type { EmployeeListParams, EmployeeStatus } from '../model/employee';
import { employeeApi } from './employee.api';

export const employeeKeys = createQueryKeys<EmployeeListParams>('employees');

/** Query danh sách nhân viên (giữ data cũ khi đổi trang để tránh nháy). */
export function useEmployeeListQuery(params: EmployeeListParams) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => employeeApi.getList(params),
    placeholderData: keepPreviousData,
  });
}

/** Mutation khóa/mở khóa tài khoản — invalidate danh sách sau khi thành công. */
export function useSetEmployeeStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EmployeeStatus }) =>
      employeeApi.setStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error) => {
      toastError(error);
    },
  });
}

/** Cập nhật trạng thái cho nhiều nhân viên trong một lần — chỉ một toast. */
export function useSetEmployeesStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: EmployeeStatus }) =>
      Promise.all(ids.map((id) => employeeApi.setStatus(id, status))),
    onSuccess: (_data, { ids }) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success(`Đã cập nhật ${ids.length} nhân viên`);
    },
    onError: (error) => {
      toastError(error);
    },
  });
}
