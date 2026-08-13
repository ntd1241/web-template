/**
 * Scaffolded by table-builder from `src/project/tags/table/tag.table.fixture.ts`. Run `npm run gen:table` — do NOT hand-write this file.
 * You own this file now — fill the `cell: () => null` stubs and wire it up. To change columns or
 * badge config, edit the spec and re-gen to a scratch path, then reconcile your edits. Do not
 * hand-edit this banner or the generated badge config — that's how review detects a bypassed builder.
 */
import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Pencil,
  Plus,
  Tag as TagIcon,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createColumnHelpers } from '@/components/ui/data-grid-columns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Tag } from '../model/tag';

export interface UseTagColumnsParams {
  onAddTag: (row: Tag) => void;
  onEdit: (row: Tag) => void;
  onDelete: (row: Tag) => void;
  onToggleGroup: (groupId: string) => void;
}

export function useTagColumns(params: UseTagColumnsParams): ColumnDef<Tag>[] {
  return useMemo(() => {
    const col = createColumnHelpers<Tag>();

    return [
      col.custom({
        id: 'name',
        header: 'Nhãn',
        headerClassName: 'min-w-[220px]',
        cell: (row) => (
          <div
            className={
              row.isGroup
                ? 'flex min-w-0 items-center gap-2 font-semibold'
                : 'flex min-w-0 items-center gap-2 ps-6'
            }
          >
            {row.isGroup ? (
              <button
                type="button"
                className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Thu gọn hoặc mở rộng nhóm ${row.name}`}
                aria-expanded={row.isExpanded}
                onClick={(event) => {
                  event.stopPropagation();
                  params.onToggleGroup(row.id);
                }}
              >
                {row.isExpanded ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </button>
            ) : (
              <TagIcon
                className="size-4 shrink-0"
                fill="currentColor"
                style={{ color: row.color ?? '#2563eb' }}
              />
            )}
            {row.isGroup ? (
              <Folder className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
            <div className="min-w-0">
              <div className="truncate text-foreground">{row.name}</div>
              {row.isGroup && row.groupDescription ? (
                <div className="truncate text-xs font-normal text-muted-foreground">
                  {row.groupDescription}
                </div>
              ) : (
                <div className="truncate text-xs font-normal text-muted-foreground">
                  {row.code}
                </div>
              )}
            </div>
          </div>
        ),
      }),
      col.text({
        id: 'description',
        header: 'Mô tả',
        get: (row) => row.description,
        headerClassName: 'min-w-[280px]',
      }),
      col.actions({
        id: 'actions',
        header: '',
        headerClassName: 'w-[220px]',
        cellClassName: 'text-right',
        cell: (row) => (
          <div
            className="flex justify-end gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            {row.isGroup ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Thêm nhãn cho nhóm ${row.name}`}
                    onClick={() => params.onAddTag(row)}
                  >
                    <Plus className="size-3.5" />
                    Thêm nhãn
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thêm nhãn</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Sửa ${row.isGroup ? 'nhóm' : 'nhãn'} ${row.name}`}
                  onClick={() => params.onEdit(row)}
                >
                  <Pencil className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  aria-label={`Xóa ${row.isGroup ? 'nhóm' : 'nhãn'} ${row.name}`}
                  className="text-destructive hover:text-destructive"
                  onClick={() => params.onDelete(row)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent variant="destructive">Xóa</TooltipContent>
            </Tooltip>
          </div>
        ),
      }),
    ];
  }, [params]);
}
