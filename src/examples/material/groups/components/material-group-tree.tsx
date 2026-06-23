import { useState } from 'react';
import { ChevronRight, FolderTree, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { GroupTreeNode } from '../group-tree';

interface MaterialGroupTreeProps {
  nodes: GroupTreeNode[];
  selectedId: string | null;
  modelCountByGroup: Map<string, number>;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function MaterialGroupTree({
  nodes,
  selectedId,
  modelCountByGroup,
  onSelect,
  onAddChild,
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
}: {
  node: GroupTreeNode;
  selectedId: string | null;
  modelCountByGroup: Map<string, number>;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = node.id === selectedId;
  const modelCount = modelCountByGroup.get(node.id) ?? 0;

  return (
    <li>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-admin-control py-1.5 pr-1.5 text-sm hover:bg-admin-surface-alt',
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
          className="flex min-w-0 flex-1 items-center gap-2 text-start"
          onClick={() => onSelect(node.id)}
        >
          <FolderTree className="size-4 shrink-0 text-admin-blue-dark" />
          <span
            className={cn(
              'truncate',
              isSelected ? 'font-medium text-foreground' : 'text-foreground',
              !node.isActive && 'text-muted-foreground line-through',
            )}
          >
            {node.name}
          </span>
          {modelCount > 0 && (
            <span className="shrink-0 rounded-full bg-admin-surface-alt px-1.5 text-xs text-muted-foreground">
              {modelCount}
            </span>
          )}
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Thêm nhóm con"
          className="size-6 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100"
          onClick={() => onAddChild(node.id)}
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {hasChildren && isExpanded && (
        <MaterialGroupTree
          nodes={node.children}
          selectedId={selectedId}
          modelCountByGroup={modelCountByGroup}
          onSelect={onSelect}
          onAddChild={onAddChild}
        />
      )}
    </li>
  );
}
