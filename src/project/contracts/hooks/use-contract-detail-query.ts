import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import { loadContractDetail } from '../api/contracts.api';

export function useContractDetailQuery(contractId?: string) {
  const { userId } = useUser();
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['project', 'contracts', 'detail', userId, contractId, tenantId],
    queryFn: () => {
      if (!userId || !contractId || !tenantId) {
        throw new Error('Thiếu thông tin hợp đồng.');
      }
      return loadContractDetail(userId, contractId, tenantId);
    },
    enabled: Boolean(userId && contractId && tenantId),
  });
}
