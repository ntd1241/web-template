import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  type ReactNode,
} from 'react';
import { Check, Paperclip, Upload, X } from 'lucide-react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024;

function getFileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const MIME_TYPE_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function toDropzoneAccept(accept: string): Accept {
  return accept.split(',').reduce<Accept>((result, value) => {
    const token = value.trim().toLowerCase();
    if (!token) return result;

    if (token.startsWith('.')) {
      const mimeType =
        MIME_TYPE_BY_EXTENSION[token] ?? 'application/octet-stream';
      result[mimeType] = Array.from(
        new Set([...(result[mimeType] ?? []), token]),
      );
      return result;
    }

    result[token] = [];
    return result;
  }, {});
}

export interface FileUploadContentProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxFileSize?: number;
  disabled?: boolean;
  isUploading?: boolean;
  uploadLabel?: string;
  className?: string;
  onUploadError?: (error: unknown) => void;
  children?: ReactNode;
  showUploadButton?: boolean;
}

export interface FileUploadContentHandle {
  openFileDialog: () => void;
}

export const FileUploadContent = forwardRef<
  FileUploadContentHandle,
  FileUploadContentProps
>(function FileUploadContent(
  {
    onUpload,
    accept = '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp',
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    disabled = false,
    isUploading = false,
    uploadLabel = 'Tải tệp lên',
    className,
    onUploadError,
    children,
    showUploadButton = true,
  },
  ref,
) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = disabled || isUploading;

  const handleIncomingFiles = useCallback(
    (nextFiles: File[]) => {
      if (nextFiles.length === 0 || isDisabled) return;

      const invalidFile = nextFiles.find((file) => file.size > maxFileSize);
      if (invalidFile) {
        setError(
          `Tệp "${invalidFile.name}" vượt quá dung lượng tối đa ${Math.round(maxFileSize / (1024 * 1024))}MB.`,
        );
        return;
      }

      const currentKeys = new Set(pendingFiles.map(getFileKey));
      const uniqueFiles = nextFiles.filter((file) => {
        const key = getFileKey(file);
        if (currentKeys.has(key)) return false;
        currentKeys.add(key);
        return true;
      });

      if (uniqueFiles.length === 0) {
        setError('Các tệp này đã có trong danh sách chờ.');
        return;
      }

      setError(null);
      setPendingFiles((current) => [...current, ...uniqueFiles]);
    },
    [isDisabled, maxFileSize, pendingFiles],
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      handleIncomingFiles(acceptedFiles);

      const rejection = fileRejections[0];
      if (!rejection) return;

      const errorCode = rejection.errors[0]?.code;
      if (errorCode === 'file-too-large') {
        setError(
          `Tệp "${rejection.file.name}" vượt quá dung lượng tối đa ${Math.round(maxFileSize / (1024 * 1024))}MB.`,
        );
        return;
      }

      if (errorCode === 'file-invalid-type') {
        setError(`Tệp "${rejection.file.name}" không đúng định dạng cho phép.`);
        return;
      }

      setError(`Không thể thêm tệp "${rejection.file.name}".`);
    },
    [handleIncomingFiles, maxFileSize],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: toDropzoneAccept(accept),
    disabled: isDisabled,
    maxSize: maxFileSize,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: handleDrop,
  });

  useImperativeHandle(ref, () => ({ openFileDialog: open }), [open]);

  async function confirmUpload() {
    if (pendingFiles.length === 0 || isDisabled) return;

    try {
      await onUpload(pendingFiles);
      setPendingFiles([]);
      setError(null);
    } catch (uploadError) {
      onUploadError?.(uploadError);
    }
  }

  return (
    <div
      data-slot="file-upload-dropzone"
      {...getRootProps({ className: cn('relative space-y-4', className) })}
    >
      <input {...getInputProps()} />
      {showUploadButton ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isDisabled}
            onClick={open}
          >
            <Upload />
            {uploadLabel}
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {pendingFiles.length > 0 ? (
        <div className="m-5 divide-y divide-border rounded-lg border border-dashed border-primary/40 bg-primary/5">
          <div className="px-3 py-2 text-xs font-medium text-primary">
            {pendingFiles.length} tệp đang chờ xác nhận tải lên
          </div>
          {pendingFiles.map((file, index) => (
            <div
              key={`${getFileKey(file)}-${index}`}
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
                disabled={isDisabled}
                aria-label={`Bỏ tệp ${file.name}`}
                onClick={() =>
                  setPendingFiles((current) =>
                    current.filter((_, fileIndex) => fileIndex !== index),
                  )
                }
              >
                <X />
              </Button>
            </div>
          ))}
          <div className="flex justify-end gap-2 border-t border-border bg-muted/20 px-3 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDisabled}
              onClick={() => setPendingFiles([])}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={isUploading}
              loadingText="Đang tải lên..."
              onClick={() => void confirmUpload()}
            >
              <Check />
              Xác nhận tải lên
            </Button>
          </div>
        </div>
      ) : null}

      {children}

      {isDragActive ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-primary/10 backdrop-blur-[1px]">
          <div className="rounded-xl border-2 border-dashed border-primary bg-background/95 px-8 py-6 text-center shadow-lg">
            <Upload className="mx-auto size-8 text-primary" />
            <p className="mt-2 text-sm font-semibold text-foreground">
              Thả tệp để thêm vào danh sách chờ
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Chưa upload cho đến khi bạn xác nhận
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
});

FileUploadContent.displayName = 'FileUploadContent';
