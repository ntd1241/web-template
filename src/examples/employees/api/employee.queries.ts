import { createQueryKeys } from '@/constants/query-keys';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ApiError } from '@/types/api.types';
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
    onError: (error: ApiError) => {
      toast.error(error.message);
    },
  });
}
