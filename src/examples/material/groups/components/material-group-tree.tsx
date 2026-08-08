import { useState } from 'react';
import { ChevronRight, Folder, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { GroupTreeNode } from '../group-tree';

interface MaterialGroupTreeProps {
  nodes: GroupTreeNode[];
  selectedId: string | null;
  modelCountByGroup: Map<string, number>;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onDelete?: (node: GroupTreeNode) => void;
}

export function MaterialGroupTree({
  nodes,
  selectedId,
  modelCountByGroup,
  onSelect,
  onAddChild,
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
  onDelete,
}: {
  node: GroupTreeNode;
  selectedId: string | null;
  modelCountByGroup: Map<string, number>;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
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

        <div className="absolute end-3 top-1/2 flex -translate-y-1/2 items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Thêm nhóm con"
            className="size-6 text-muted-foreground"
            onClick={() => onAddChild(node.id)}
          >
            <Plus className="size-3.5" />
          </Button>
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Xóa nhóm ${node.name}`}
              className="size-6 text-destructive"
              onClick={() => onDelete(node)}
            >
              <Trash2 className="size-3.5" />
            </Button>
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
          onDelete={onDelete}
        />
      )}
    </li>
  );
}
