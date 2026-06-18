import { useRef, useState, type DragEvent } from 'react';
import { ImageUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmployeeAvatarDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

const ACCEPT = 'image/png,image/jpeg';

/**
 * Vùng kéo-thả chọn ảnh đại diện. Demo-only: chưa có primitive FileUpload nên
 * dùng input file ẩn + label. Ảnh không nằm trong schema, chỉ trình diễn UI.
 */
export function EmployeeAvatarDropzone({
  file,
  onChange,
}: EmployeeAvatarDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      onChange(dropped);
    }
  };

  if (file) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-admin-card border border-input bg-admin-surface-alt px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-admin-primary-bg text-admin-primary-dark">
            <ImageUp className="size-5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-foreground">
              {file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          mode="icon"
          onClick={() => onChange(null)}
          aria-label="Xóa ảnh đã chọn"
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-admin-card border border-dashed border-input bg-admin-surface-alt px-6 py-7 text-center transition-colors hover:border-admin-primary hover:bg-admin-primary-bg/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        isDragging && 'border-admin-primary bg-admin-primary-bg/40',
      )}
    >
      <ImageUp className="size-6 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">
        Chọn ảnh hoặc kéo thả vào đây
      </span>
      <span className="text-xs text-muted-foreground">
        JPG hoặc PNG, dung lượng tối đa 5MB
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
