import { Card, CardHeader, CardTable, CardTitle } from '@/components/ui/card';
import { MATERIAL_SPECIFICATIONS } from '../../data/material-specifications.mock';

export function CommonTab() {
  return (
    <Card className="overflow-hidden rounded-[21px]">
      <CardHeader>
        <CardTitle>Thông số kỹ thuật</CardTitle>
      </CardHeader>
      <CardTable>
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[58%]" />
          </colgroup>
          <thead className="bg-muted">
            <tr className="border-b border-border">
              <th className="px-3 py-2.5 text-xs font-semibold text-secondary-foreground sm:px-4">
                Thông số
              </th>
              <th className="px-3 py-2.5 text-xs font-semibold text-secondary-foreground sm:px-4">
                Giá trị
              </th>
            </tr>
          </thead>
          <tbody>
            {MATERIAL_SPECIFICATIONS.map((specification) => (
              <tr
                key={specification.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="break-words whitespace-normal px-3 py-2.5 align-top font-medium text-admin-neutral-800 sm:px-4">
                  {specification.name}
                </td>
                <td className="break-words whitespace-normal px-3 py-2.5 align-top text-admin-neutral-700 sm:px-4">
                  {specification.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardTable>
    </Card>
  );
}
