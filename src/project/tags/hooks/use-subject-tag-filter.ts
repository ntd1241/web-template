import { useQuery } from '@tanstack/react-query';
import { useTenant } from '@/providers/tenant-provider';
import {
  loadSubjectTagFilter,
  type TaggableSubjectType,
  type TagSelectConfig,
} from '../api/tags.api';

export function useSubjectTagFilter(
  subjectType: TaggableSubjectType,
  config: TagSelectConfig,
) {
  const { tenantId } = useTenant();
  const moduleCodes = config.moduleCodes ?? [];
  const allowCustomGroups = config.allowCustomGroups ?? true;

  return useQuery({
    queryKey: [
      'project',
      'tags',
      'subject-filter',
      tenantId,
      subjectType,
      moduleCodes,
      allowCustomGroups,
    ],
    queryFn: () =>
      loadSubjectTagFilter(tenantId!, subjectType, {
        moduleCodes,
        allowCustomGroups,
      }),
    enabled: Boolean(tenantId),
    staleTime: 5 * 60 * 1000,
  });
}
