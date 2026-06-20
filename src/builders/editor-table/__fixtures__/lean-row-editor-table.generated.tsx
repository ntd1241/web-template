/**
 * Scaffolded by editor-table-builder from `src/builders/editor-table/__fixtures__/lean-row.editor-table.fixture.ts`. Run `npm run gen:editor-table` — do NOT hand-write this file.
 * You own this file now — fill computed cell stubs and wire it into the page/card layout. To change
 * columns or viewport behavior, edit the spec and re-gen to a scratch path, then reconcile your edits.
 */
import { Plus } from 'lucide-react';
import { Controller, useFieldArray } from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { LeanRow, LeanRowsFormValues } from './lean-row';

interface LeanRowEditorTableProps {
  form: UseFormReturn<LeanRowsFormValues>;
  createRow: () => LeanRow;
}

export function LeanRowEditorTable({
  form,
  createRow,
}: LeanRowEditorTableProps) {
  const { fields, append } = useFieldArray({
    control: form.control,
    name: 'rows',
    keyName: 'fieldId',
  });
  const watchedRows = form.watch('rows') ?? [];

  const handleAddRow = () => {
    append(createRow());
  };

  return (
    <ScrollArea>
      <table className="min-w-[640px] w-full caption-bottom text-foreground text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky top-0 z-20 bg-muted w-14">
              STT
            </TableHead>
            <TableHead className="sticky top-0 z-20 bg-muted min-w-56">
              Tên
            </TableHead>
            <TableHead className="sticky top-0 z-20 bg-muted w-32 text-right">
              Số lượng
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="h-28 text-center">
                <div className="flex flex-col items-center gap-3">
                  <span className="text-muted-foreground">Chưa có dữ liệu</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                  >
                    <Plus />
                    Thêm dòng
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            fields.map((field, index) => {
              const row = watchedRows[index] as LeanRow | undefined;
              const errors = form.formState.errors.rows?.[index];
              void row;

              return (
                <TableRow key={field.fieldId}>
                  <TableCell className="px-4 py-2 text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <Controller
                      control={form.control}
                      name={`rows.${index}.name`}
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          aria-label={`Tên dòng ${index + 1}`}
                          aria-invalid={!!errors?.name}
                          variant="sm"
                        />
                      )}
                    />
                    {errors?.name && (
                      <div className="mt-1 text-xs text-destructive">
                        {errors?.name?.message}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-2 py-2">
                    <Controller
                      control={form.control}
                      name={`rows.${index}.quantity`}
                      render={({ field: inputField }) => (
                        <Input
                          aria-label={`Số lượng dòng ${index + 1}`}
                          aria-invalid={!!errors?.quantity}
                          className="text-right tabular-nums"
                          min={0}
                          type="number"
                          value={inputField.value}
                          variant="sm"
                          onBlur={inputField.onBlur}
                          onChange={(event) =>
                            inputField.onChange(
                              Number.isNaN(event.target.valueAsNumber)
                                ? 0
                                : event.target.valueAsNumber,
                            )
                          }
                        />
                      )}
                    />
                    {errors?.quantity && (
                      <div className="mt-1 text-right text-xs text-destructive">
                        {errors?.quantity?.message}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
