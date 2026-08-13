import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Không tìm thấy trang | Admin Template</title>
      </Helmet>
      <main className="flex min-h-svh w-full items-center justify-center bg-muted px-4 py-8">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileQuestion className="size-8" />
          </div>
          <p className="mt-6 text-7xl font-bold tracking-tight text-primary">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Không tìm thấy trang
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">
              <ArrowLeft className="size-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </main>
    </>
  );
}
