import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { ImageAvatar } from './image-avatar';

interface ImageUploadFieldProps {
  value?: string | null;
  onValueChange?: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  label?: string;
  fallbackText?: string;
  className?: string;
}

const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp';

function isAcceptedFile(file: File, accept: string) {
  const acceptedTypes = accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return acceptedTypes.length === 0 || acceptedTypes.includes(file.type);
}

export function ImageUploadField({
  value,
  onValueChange,
  onFileChange,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = 5,
  label = 'Ảnh đại diện',
  fallbackText = 'V',
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFile(null);
    setError(null);
  }, [value]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFile = (nextFile: File | undefined) => {
    if (!nextFile) return;

    if (!isAcceptedFile(nextFile, accept)) {
      setError('Vui lòng chọn tệp ảnh đúng định dạng.');
      return;
    }

    if (nextFile.size > maxSizeMb * 1024 * 1024) {
      setError(`Ảnh không được vượt quá ${maxSizeMb}MB.`);
      return;
    }

    setError(null);
    setFile(nextFile);
    onFileChange?.(nextFile);
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    onFileChange?.(null);
    onValueChange?.('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const imageSource = previewUrl ?? value ?? null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-4">
        <ImageAvatar
          src={imageSource}
          alt={`Xem trước ${label.toLowerCase()}`}
          fallback={fallbackText}
          className="size-20 rounded-xl text-xl"
        />
        <div className="min-w-0 space-y-1">
          <p className="text-base font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            JPG, PNG hoặc WEBP, tối đa {maxSizeMb}MB
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            {file || value ? 'Thay ảnh' : 'Chọn ảnh'}
          </Button>
          {file && (
            <button
              type="button"
              className="ms-2 text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={clearFile}
            >
              Xóa lựa chọn
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
