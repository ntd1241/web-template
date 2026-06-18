import { buildPath, ROUTES } from '@/constants/routes';
import { ExternalLink, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
  CardToolbar,
} from '@/components/ui/card';

const sampleMaterialId = '601af811-5def-4bd0-b8d3-8429dece65a7';

export function MaterialsManagementPage() {
  const publicUrl = buildPath(ROUTES.EXAMPLE.MATERIAL_PUBLIC_DETAIL, {
    id: sampleMaterialId,
  });

  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <Card className="min-h-0 flex-1 overflow-hidden">
        <CardHeader className="gap-4 p-5">
          <CardHeading>
            <CardTitle>Quản lý vật tư</CardTitle>
            <CardDescription>
              Màn hình khởi tạo để mở trang thông tin public của vật tư.
            </CardDescription>
          </CardHeading>
          <CardToolbar>
            <Button asChild>
              <Link to={publicUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                Mở trang public
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardContent className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-admin-primary-bg text-admin-primary-dark">
            <PackageCheck className="size-6" />
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-admin-neutral-800">
              Danh sách vật tư sẽ được bổ sung sau
            </h2>
            <p className="max-w-[420px] text-sm text-muted-foreground">
              Giai đoạn này chỉ cần điểm truy cập để xem layout public info theo
              mã QR mẫu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
