import { useRef, useState } from 'react';
import { FileText, Paperclip, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ContractAttachment } from '../model/contract';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContractAttachmentsField({
  files,
  onChange,
  existingAttachments = [],
  onRemoveExisting,
  disabled = false,
  className,
}: {
  files: File[];
  onChange: (files: File[]) => void;
  existingAttachments?: ContractAttachment[];
  onRemoveExisting?: (attachmentId: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFiles(nextFiles: File[]) {
    const invalidFile = nextFiles.find((file) => file.size > MAX_FILE_SIZE);
    if (invalidFile) {
      setError(`Tệp "${invalidFile.name}" vượt quá dung lượng tối đa 20MB.`);
      return;
    }

    setError(null);
    onChange([...files, ...nextFiles]);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Tài liệu đính kèm
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Có thể đính kèm PDF, Word, Excel hoặc hình ảnh, tối đa 20MB mỗi tệp.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload />
          Thêm tài liệu
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
          onChange={(event) =>
            handleFiles(Array.from(event.target.files ?? []))
          }
        />
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {existingAttachments.length > 0 || files.length > 0 ? (
        <div className="divide-y divide-border rounded-lg border border-border">
          {existingAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 px-3 py-2.5 text-sm"
            >
              <a
                href={attachment.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-w-0 flex-1 items-center gap-3 hover:text-primary"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {attachment.fileName}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatFileSize(attachment.sizeBytes)}
                </span>
              </a>
              {onRemoveExisting ? (
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  disabled={disabled}
                  aria-label={`Xóa tệp ${attachment.fileName}`}
                  onClick={() => onRemoveExisting(attachment.id)}
                >
                  <X />
                </Button>
              ) : null}
            </div>
          ))}
          {files.map((file, index) => (
            <div
              key={`${file.name}-${file.lastModified}-${index}`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm"
            >
              <Paperclip className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-foreground">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                mode="icon"
                size="sm"
                disabled={disabled}
                aria-label={`Xóa tệp ${file.name}`}
                onClick={() =>
                  onChange(files.filter((_, fileIndex) => fileIndex !== index))
                }
              >
                <X />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
