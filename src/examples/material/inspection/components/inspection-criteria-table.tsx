import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { InspectionCriterion } from '../../model/inspection-table';

interface InspectionCriteriaTableProps {
  criteria: InspectionCriterion[];
  onEdit: (criterion: InspectionCriterion) => void;
  onDelete: (criterion: InspectionCriterion) => void;
}

export function InspectionCriteriaTable({
  criteria,
  onEdit,
  onDelete,
}: InspectionCriteriaTableProps) {
  if (criteria.length === 0) {
    return (
      <div className="rounded-admin-control border border-dashed border-border p-4 text-sm text-muted-foreground">
        Chưa có tiêu chí nào
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-admin-control border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">STT</TableHead>
            <TableHead>Nội dung</TableHead>
            <TableHead className="w-28 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {criteria
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((criterion) => (
              <TableRow key={criterion.id}>
                <TableCell>{criterion.order}</TableCell>
                <TableCell className="whitespace-normal">
                  {criterion.content}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Sửa tiêu chí"
                      onClick={() => onEdit(criterion)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Xóa tiêu chí"
                      className="text-admin-red-primary"
                      onClick={() => onDelete(criterion)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
