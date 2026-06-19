import { buildPath, ROUTES } from '@/constants/routes';
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useMaterialColumns } from '../components/material-columns.generated';
import { MATERIALS_MOCK } from '../data/materials.mock';

const sampleMaterialId = '601af811-5def-4bd0-b8d3-8429dece65a7';

export function MaterialsManagementPage() {
  const columns = useMaterialColumns();
  const table = useReactTable({
    data: MATERIALS_MOCK,
    columns,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const publicUrl = buildPath(ROUTES.EXAMPLE.MATERIAL_PUBLIC_DETAIL, {
    id: sampleMaterialId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <DataGrid
        table={table}
        recordCount={MATERIALS_MOCK.length}
        emptyMessage="Chưa có vật tư nào"
      >
        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
            <CardHeading>
              <CardTitle>Quản lý vật tư</CardTitle>
              <CardDescription>
                Danh sách vật tư / thiết bị gắn mã QR
              </CardDescription>
            </CardHeading>
            <CardToolbar>
              <Button asChild variant="outline">
                <Link to={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" />
                  Mở trang public
                </Link>
              </Button>
            </CardToolbar>
          </CardHeader>

          <CardTable className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>

          <CardFooter className="justify-between">
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>
    </div>
  );
}
