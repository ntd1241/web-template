import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/errors';
import { useTenant } from '@/providers/tenant-provider';
import { useUser } from '@/providers/user-provider';
import {
  MultiSelect,
  type MultiSelectProps,
} from '@/components/ui/multi-select';
import { Tag } from '@/components/ui/tag';
import { loadTagSelectOptions, type TagSelectConfig } from '../api/tags.api';

export interface TagSelectProps
  extends
    Omit<MultiSelectProps, 'options' | 'loading' | 'loadingMessage'>,
    TagSelectConfig {}

export function TagSelect({
  value = [],
  moduleCodes = [],
  allowCustomGroups = true,
  placeholder = 'Chọn nhãn',
  searchPlaceholder = 'Tìm nhãn...',
  emptyMessage = 'Không tìm thấy nhãn',
  disabled = false,
  ...props
}: TagSelectProps) {
  const { userId } = useUser();
  const { tenantId } = useTenant();
  const normalizedModuleCodes = useMemo(
    () =>
      Array.from(
        new Set(moduleCodes.map((code) => code.trim()).filter(Boolean)),
      ),
    [moduleCodes],
  );
  const query = useQuery({
    queryKey: [
      'project',
      'tags',
      'select-options',
      userId,
      tenantId,
      normalizedModuleCodes,
      allowCustomGroups,
    ],
    queryFn: () => {
      if (!userId || !tenantId) {
        throw new Error('Chưa xác định tổ chức hiện tại.');
      }
      return loadTagSelectOptions(
        userId,
        {
          moduleCodes: normalizedModuleCodes,
          allowCustomGroups,
        },
        tenantId,
      );
    },
    enabled: Boolean(userId && tenantId),
    staleTime: 5 * 60 * 1000,
  });

  const options = useMemo(
    () =>
      (query.data ?? [])
        .filter((tag) => tag.isActive || value.includes(tag.id))
        .map((tag) => ({
          value: tag.id,
          label: <Tag color={tag.color ?? '#64748b'}>{tag.name}</Tag>,
          searchableText: `${tag.name} ${tag.groupName}`,
          group: tag.groupName,
          disabled: !tag.isActive,
          data: tag,
        })),
    [query.data, value],
  );

  return (
    <MultiSelect
      {...props}
      value={value}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      searchMode="inline"
      emptyMessage={
        query.isError ? getApiErrorMessage(query.error) : emptyMessage
      }
      loading={query.isPending}
      loadingMessage="Đang tải danh sách nhãn..."
      disabled={disabled || !userId}
      renderSelectedOption={(option, onRemove) => {
        const tag = option.data;
        const color = tag?.color ?? '#64748b';
        const name = tag?.name ?? option.value;

        return (
          <Tag color={color} className="max-w-full justify-start">
            <span className="min-w-0 truncate">{name}</span>
            <span
              role="button"
              tabIndex={0}
              aria-label={`Bỏ nhãn ${name}`}
              className="inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-opacity hover:opacity-75"
              style={{ backgroundColor: color }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onRemove();
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                event.stopPropagation();
                onRemove();
              }}
            >
              <X className="size-2.5" strokeWidth={2.5} />
            </span>
          </Tag>
        );
      }}
    />
  );
}
