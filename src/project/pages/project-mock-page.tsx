import { Card, CardContent } from '@/components/ui/card';

export function ProjectMockPage() {
  return (
    <div className="flex h-full min-h-0 flex-col p-6">
      <div className="mb-5 shrink-0">
        <h1 className="text-xl font-bold text-foreground">Tổng quan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Trang mock đầu tiên của project thật. Các module nghiệp vụ sẽ được
          thêm dần vào sidebar riêng của project.
        </p>
      </div>

      <Card className="min-h-48">
        <CardContent className="flex h-full min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
          Khu vực nội dung chính của project thật.
        </CardContent>
      </Card>
    </div>
  );
}
