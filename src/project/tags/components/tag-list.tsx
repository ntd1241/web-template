import { Tag } from '@/components/ui/tag';
import type { TagSelectOption } from '../model/tag';

export interface TagListProps {
  tags: readonly Pick<TagSelectOption, 'id' | 'name' | 'color'>[];
  maxVisible?: number;
}

export function TagList({ tags, maxVisible = 2 }: TagListProps) {
  if (tags.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = Math.max(0, tags.length - visibleTags.length);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      {visibleTags.map((tag) => (
        <Tag key={tag.id} color={tag.color} size="sm" className="max-w-32">
          <span className="truncate">{tag.name}</span>
        </Tag>
      ))}
      {hiddenCount > 0 ? (
        <span className="text-xs font-medium text-muted-foreground">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
