import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConfirmDeleteDialog } from '../../components/confirm-delete-dialog';
import type {
  InspectionCriterion,
  InspectionTable,
} from '../../model/inspection-table';
import {
  nextInspectionTableId,
  useMaterialCatalogStore,
} from '../../stores/material-catalog.store';
import { CriterionFormDialog } from '../components/criterion-form-dialog';
import { InspectionCriteriaTable } from '../components/inspection-criteria-table';
import {
  inspectionTableDefaultValues,
  InspectionTableForm,
  mapInspectionTableToFormValues,
  useInspectionTableForm,
} from '../components/inspection-table-form.generated';
import { InspectionTableList } from '../components/inspection-table-list';
import type { InspectionTableFormValues } from '../inspection-table.schema';

type CriterionDialogState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; criterion: InspectionCriterion };

export function InspectionTablesPage() {
  const {
    inspectionTables,
    materialModels,
    upsertInspectionTable,
    removeInspectionTable,
  } = useMaterialCatalogStore();
  const [selectedId, setSelectedId] = useState<string | null>(
    inspectionTables[0]?.id ?? null,
  );
  const [deleting, setDeleting] = useState<InspectionTable | null>(null);
  const [deletingCriterion, setDeletingCriterion] =
    useState<InspectionCriterion | null>(null);
  const [criterionDialog, setCriterionDialog] = useState<CriterionDialogState>({
    kind: 'closed',
  });
  const form = useInspectionTableForm();

  const selectedTable = useMemo(
    () =>
      selectedId
        ? (inspectionTables.find((table) => table.id === selectedId) ?? null)
        : null,
    [inspectionTables, selectedId],
  );

  useEffect(() => {
    if (selectedTable) {
      form.reset(mapInspectionTableToFormValues(selectedTable));
      return;
    }
    form.reset(inspectionTableDefaultValues);
  }, [form, selectedTable]);

  const handleAddTable = () => {
    const nextTable: InspectionTable = {
      id: nextInspectionTableId(),
      code: 'KD-MOI',
      name: 'Bảng kiểm định mới',
      description: '',
      criteria: [],
    };
    upsertInspectionTable(nextTable);
    setSelectedId(nextTable.id);
    toast.success('Đã thêm bảng kiểm định mới');
  };

  const handleSubmit = (values: InspectionTableFormValues) => {
    if (!selectedTable) return;
    const nextTable: InspectionTable = {
      ...selectedTable,
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || undefined,
    };
    upsertInspectionTable(nextTable);
    toast.success(`Đã cập nhật bảng "${nextTable.name}"`);
  };

  const handleRequestDeleteTable = () => {
    if (!selectedTable) return;
    const isUsed = materialModels.some(
      (model) => model.inspectionTableId === selectedTable.id,
    );
    if (isUsed) {
      toast.error('Không thể xóa: bảng đang gắn với mẫu vật tư.');
      return;
    }
    setDeleting(selectedTable);
  };

  const handleConfirmDeleteTable = () => {
    if (!deleting) return;
    removeInspectionTable(deleting.id);
    toast.success(`Đã xóa bảng "${deleting.name}"`);
    const remaining = inspectionTables.filter(
      (table) => table.id !== deleting.id,
    );
    setSelectedId(remaining[0]?.id ?? null);
    setDeleting(null);
  };

  const handleSubmitCriterion = (content: string) => {
    if (!selectedTable || criterionDialog.kind === 'closed') return;
    const criteria =
      criterionDialog.kind === 'edit'
        ? selectedTable.criteria.map((criterion) =>
            criterion.id === criterionDialog.criterion.id
              ? { ...criterion, content }
              : criterion,
          )
        : [
            ...selectedTable.criteria,
            {
              id: `${selectedTable.id}-tc-${Date.now()}`,
              order: selectedTable.criteria.length + 1,
              content,
            },
          ];
    upsertInspectionTable({ ...selectedTable, criteria });
    toast.success(
      criterionDialog.kind === 'edit'
        ? 'Đã cập nhật tiêu chí'
        : 'Đã thêm tiêu chí',
    );
    setCriterionDialog({ kind: 'closed' });
  };

  const handleConfirmDeleteCriterion = () => {
    if (!selectedTable || !deletingCriterion) return;
    const criteria = selectedTable.criteria
      .filter((criterion) => criterion.id !== deletingCriterion.id)
      .sort((a, b) => a.order - b.order)
      .map((criterion, index) => ({ ...criterion, order: index + 1 }));
    upsertInspectionTable({ ...selectedTable, criteria });
    toast.success('Đã xóa tiêu chí');
    setDeletingCriterion(null);
  };

  const initialCriterionContent =
    criterionDialog.kind === 'edit' ? criterionDialog.criterion.content : '';

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 xl:flex-row">
      <Card className="flex min-h-0 w-full flex-col overflow-hidden xl:w-96 xl:shrink-0">
        <CardHeader className="items-center justify-between gap-2 p-4">
          <CardHeading>
            <CardTitle>Bảng kiểm định</CardTitle>
            <CardDescription>
              Checklist an toàn theo từng loại mẫu
            </CardDescription>
          </CardHeading>
          <Button variant="primary" size="sm" onClick={handleAddTable}>
            <Plus className="size-4" />
            Thêm bảng
          </Button>
        </CardHeader>
        <ScrollArea className="min-h-0 flex-1 px-2 pb-3">
          <InspectionTableList
            tables={inspectionTables}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </ScrollArea>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {selectedTable ? (
          <>
            <CardHeader>
              <CardHeading>
                <CardTitle>{selectedTable.name}</CardTitle>
                <CardDescription>
                  Cập nhật thông tin bảng và checklist tiêu chí
                </CardDescription>
              </CardHeading>
              <CardToolbar>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-admin-red-primary"
                  onClick={handleRequestDeleteTable}
                >
                  <Trash2 className="size-4" />
                  Xóa bảng
                </Button>
              </CardToolbar>
            </CardHeader>
            <ScrollArea className="min-h-0 flex-1">
              <div className="flex flex-col gap-6 px-5 py-5">
                <InspectionTableForm form={form} onSubmit={handleSubmit} />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    form="inspectionTable-form"
                  >
                    Lưu thông tin
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">
                        Tiêu chí kiểm định
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Thêm, sửa hoặc xóa từng dòng checklist.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCriterionDialog({ kind: 'create' })}
                    >
                      <Plus className="size-4" />
                      Thêm tiêu chí
                    </Button>
                  </div>
                  <InspectionCriteriaTable
                    criteria={selectedTable.criteria}
                    onEdit={(criterion) =>
                      setCriterionDialog({ kind: 'edit', criterion })
                    }
                    onDelete={setDeletingCriterion}
                  />
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center text-muted-foreground">
            <ClipboardCheck className="size-10" />
            <p>Chọn một bảng kiểm định để xem chi tiết, hoặc thêm bảng mới.</p>
          </div>
        )}
      </Card>

      <CriterionFormDialog
        open={criterionDialog.kind !== 'closed'}
        onOpenChange={(open) => !open && setCriterionDialog({ kind: 'closed' })}
        initialContent={initialCriterionContent}
        onSubmit={handleSubmitCriterion}
      />

      <ConfirmDeleteDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Xóa bảng kiểm định"
        description={`Bạn chắc chắn muốn xóa bảng "${deleting?.name ?? ''}"?`}
        onConfirm={handleConfirmDeleteTable}
      />

      <ConfirmDeleteDialog
        open={deletingCriterion !== null}
        onOpenChange={(open) => !open && setDeletingCriterion(null)}
        title="Xóa tiêu chí kiểm định"
        description="Bạn chắc chắn muốn xóa tiêu chí này?"
        onConfirm={handleConfirmDeleteCriterion}
      />
    </div>
  );
}
