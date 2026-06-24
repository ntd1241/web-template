/**
 * Scaffolded by table-builder from `src/examples/material/specs/table/spec-definition.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createColumnHelpers,
  type StatusBadgeConfig,
} from '@/components/ui/data-grid-columns';
import { TruncatedContainer } from '@/components/ui/truncated-container';
import {
  formatSpecValue,
  isEmptySpecValue,
  isNumberSpecValue,
} from '../../lib/spec-value';
import type { SpecDefinition, SpecOption } from '../../model/spec-definition';

export interface UseSpecDefinitionColumnsParams {
  onEdit: (row: SpecDefinition) => void;
  onDelete: (row: SpecDefinition) => void;
}

const dataTypeBadgeConfig: StatusBadgeConfig<string> = {
  text: { label: 'Văn bản', variant: 'secondary' },
  number: { label: 'Số + đơn vị', variant: 'info' },
  list: { label: 'Danh sách', variant: 'primary' },
  boolean: { label: 'Có / Không', variant: 'warning' },
  date: { label: 'Ngày tháng', variant: 'secondary' },
};

export function useSpecDefinitionColumns({
  onEdit,
  onDelete,
}: UseSpecDefinitionColumnsParams): ColumnDef<SpecDefinition>[] {
  return useMemo(() => {
    const col = createColumnHelpers<SpecDefinition>();

    return [
      col.index({
        header: 'STT',
        headerClassName: 'w-[64px]',
        size: 64,
      }),
      col.custom({
        id: 'identity',
        header: 'Thông số',
        headerClassName: 'min-w-[260px]',
        size: 320,
        cell: (row) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium text-foreground">
              {row.name}
            </span>
            <span className="text-xs text-muted-foreground">{row.code}</span>
          </div>
        ),
      }),
      col.custom({
        id: 'dataType',
        header: 'Kiểu dữ liệu',
        headerClassName: 'w-[170px]',
        size: 170,
        cell: (row) => {
          const config = dataTypeBadgeConfig[row.dataType];
          return (
            <div className="flex flex-col items-start gap-1">
              <Badge variant={config.variant} appearance="light">
                {config.label}
              </Badge>
              {row.dataType === 'list' && (
                <span className="text-xs text-muted-foreground">
                  {[
                    row.allowMultiple ? 'Chọn nhiều' : 'Chọn 1',
                    row.allowDynamicValues ? 'Động' : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              )}
            </div>
          );
        },
      }),
      col.custom({
        id: 'defaultValue',
        header: 'Giá trị mặc định',
        headerClassName: 'min-w-[220px]',
        size: 260,
        cell: (row) => <DefaultValueCell row={row} />,
      }),
      col.actions({
        header: 'Thao tác',
        headerClassName: 'w-[120px]',
        cellClassName: 'text-right',
        size: 120,
        cell: (row) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sửa thông số"
              onClick={() => onEdit(row)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Xóa thông số"
              className="text-muted-foreground"
              onClick={() => onDelete(row)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ),
      }),
    ];
  }, [onEdit, onDelete]);
}

function DefaultValueCell({ row }: { row: SpecDefinition }) {
  if (row.dataType === 'list') {
    return (
      <ListDefaultBadges
        valueIds={listDisplayOptionIds(row)}
        options={row.options ?? []}
      />
    );
  }

  if (row.dataType === 'number') {
    if (isNumberSpecValue(row.defaultValue)) {
      return (
        <span className="text-foreground">
          {formatSpecValue(row, row.defaultValue)}
        </span>
      );
    }
    return (
      <span className="text-muted-foreground">
        {row.unit ? `— ${row.unit}` : '—'}
      </span>
    );
  }

  if (isEmptySpecValue(row.defaultValue)) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <span className="text-foreground">
      {formatSpecValue(row, row.defaultValue)}
    </span>
  );
}

function ListDefaultBadges({
  valueIds,
  options,
}: {
  valueIds: string[];
  options: SpecOption[];
}) {
  if (valueIds.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const optionById = new Map(options.map((option) => [option.id, option]));

  return (
    <TruncatedContainer
      items={valueIds}
      gap={4}
      className="min-w-0 max-w-full"
      renderTruncator={(hiddenChildren, hiddenItems) => (
        <Badge variant="secondary" appearance="light">
          +{hiddenItems?.length ?? hiddenChildren.length}
        </Badge>
      )}
    >
      {valueIds.map((id) => {
        const option = optionById.get(id);
        return (
          <Badge key={id} variant="secondary" appearance="light">
            {option?.colorHex && (
              <span
                className="size-2.5 rounded-full border border-border"
                style={{ backgroundColor: option.colorHex }}
              />
            )}
            <span className="max-w-28 truncate">{option?.label ?? id}</span>
          </Badge>
        );
      })}
    </TruncatedContainer>
  );
}

function listDisplayOptionIds(row: SpecDefinition): string[] {
  if (row.allowDynamicValues) {
    return (row.options ?? []).map((option) => option.id);
  }
  return listValueIds(row.defaultValue);
}

function listValueIds(value: SpecDefinition['defaultValue']): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value) return [value];
  return [];
}
