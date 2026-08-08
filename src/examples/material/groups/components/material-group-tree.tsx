import { useState } from 'react';
import { ChevronRight, Folder, Pencil, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { GroupTreeNode } from '../group-tree';

interface MaterialGroupTreeProps {
  nodes: GroupTreeNode[];
  selectedId: string | null;
  modelCountByGroup: Map<string, number>;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string | null) => void;
  onEdit?: (node: GroupTreeNode) => void;
  onDelete?: (node: GroupTreeNode) => void;
}

interface MaterialGroupTreePanelProps extends MaterialGroupTreeProps {
  className?: string;
  allCount?: number;
  isAllSelected?: boolean;
  onSelectAll?: () => void;
}

export function MaterialGroupTreePanel({
  className,
  allCount,
  isAllSelected = false,
  onSelectAll,
  ...treeProps
}: MaterialGroupTreePanelProps) {
  return (
    <ScrollArea className={cn('min-h-0 flex-1 px-2 pt-2 pb-3', className)}>
      {onSelectAll && allCount !== undefined && (
        <div className="group relative mb-1 flex w-full items-center rounded-admin-control hover:bg-admin-surface-alt">
          <button
            type="button"
            aria-pressed={isAllSelected}
            className={cn(
              'flex w-full items-center rounded-admin-control px-3 py-1.5 text-start text-sm',
              isAllSelected ? 'font-medium text-primary' : 'text-foreground',
            )}
            onClick={onSelectAll}
          >
            <span>Tất cả</span>
          </button>
          <Badge
            size="sm"
            shape="circle"
            variant={isAllSelected ? 'primary' : 'secondary'}
            appearance={isAllSelected ? 'default' : 'light'}
            className="absolute end-3 top-1/2 -translate-y-1/2 group-hover:hidden"
          >
            {allCount}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Thêm nhóm"
                className="absolute end-3 top-1/2 size-6 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100"
                onClick={() => treeProps.onAddChild(null)}
              >
                <Plus className="size-3.5 !opacity-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="light">Thêm nhóm</TooltipContent>
          </Tooltip>
        </div>
      )}
      <MaterialGroupTree {...treeProps} />
    </ScrollArea>
  );
}

export function MaterialGroupTree({
  nodes,
  selectedId,
  modelCountByGroup,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
}: MaterialGroupTreeProps) {
  return (
    <ul className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <MaterialGroupTreeItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          modelCountByGroup={modelCountByGroup}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function MaterialGroupTreeItem({
  node,
  selectedId,
  modelCountByGroup,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
}: {
  node: GroupTreeNode;
  selectedId: string | null;
  modelCountByGroup: Map<string, number>;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string | null) => void;
  onEdit?: (node: GroupTreeNode) => void;
  onDelete?: (node: GroupTreeNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;
  const modelCount = modelCountByGroup.get(node.id) ?? 0;

  return (
    <li>
      <div
        className={cn(
          'group relative flex items-center gap-1 rounded-admin-control py-1.5 pr-3 text-sm hover:bg-admin-surface-alt',
          isSelected && 'bg-admin-surface-alt',
        )}
        style={{ paddingLeft: `${node.depth * 16 + 4}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            className="flex size-5 shrink-0 items-center justify-center text-muted-foreground"
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            <ChevronRight
              className={cn(
                'size-4 transition-transform',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className="size-5 shrink-0" />
        )}

        <button
          type="button"
          aria-pressed={isSelected}
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 text-start',
            isSelected && 'font-medium text-primary',
          )}
          onClick={() => onSelect(node.id)}
        >
          <Folder
            className={cn(
              'size-4 shrink-0 text-admin-blue-dark',
              isSelected && 'text-primary',
            )}
          />
          <span className="truncate">{node.name}</span>
        </button>

        <Badge
          size="sm"
          shape="circle"
          variant={isSelected ? 'primary' : 'secondary'}
          appearance={isSelected ? 'default' : 'light'}
          className="ms-auto shrink-0 group-hover:hidden"
        >
          {modelCount}
        </Badge>

        <div className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Thêm nhóm con"
                className="size-6 text-muted-foreground"
                onClick={() => onAddChild(node.id)}
              >
                <Plus className="size-3.5 !opacity-100" />
              </Button>
            </TooltipTrigger>
            <TooltipContent variant="light">Thêm nhóm con</TooltipContent>
          </Tooltip>
          {onEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Sửa nhóm ${node.name}`}
                  className="size-6 text-primary"
                  onClick={() => onEdit(node)}
                >
                  <Pencil className="size-3.5 !opacity-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent variant="light">Sửa nhóm</TooltipContent>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Xóa nhóm ${node.name}`}
                  className="size-6 text-destructive"
                  onClick={() => onDelete(node)}
                >
                  <Trash2 className="size-3.5 !opacity-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent variant="light">Xóa nhóm</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <MaterialGroupTree
          nodes={node.children}
          selectedId={selectedId}
          modelCountByGroup={modelCountByGroup}
          onSelect={onSelect}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </li>
  );
}
