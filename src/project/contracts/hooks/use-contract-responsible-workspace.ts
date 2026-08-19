import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loadContractResponsibleWorkspace,
  replaceContractResponsibleAccess,
} from '../api/contracts.api';
import type { ContractResponsibleAssignmentInput } from '../model/contract-responsible';

export function useContractResponsibleWorkspace({
  tenantId,
  contractId,
  enabled,
}: {
  tenantId: string;
  contractId: string;
  enabled: boolean;
}) {
  const queryClient = useQueryClient();
  const workspaceQuery = useQuery({
    queryKey: [
      'project',
      'contracts',
      'responsible-workspace',
      tenantId,
      contractId,
    ],
    queryFn: () => loadContractResponsibleWorkspace(tenantId, contractId),
    enabled,
    staleTime: 60 * 1000,
  });

  const saveMutation = useMutation({
    mutationFn: (assignments: ContractResponsibleAssignmentInput[]) =>
      replaceContractResponsibleAccess(tenantId, contractId, assignments),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['project', 'contracts', 'detail'],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            'project',
            'contracts',
            'responsible-workspace',
            tenantId,
            contractId,
          ],
        }),
      ]);
    },
  });

  return { workspaceQuery, saveMutation };
}
