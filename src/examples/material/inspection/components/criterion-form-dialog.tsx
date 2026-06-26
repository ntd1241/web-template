import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CriterionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent: string;
  onSubmit: (content: string) => void;
}

export function CriterionFormDialog({
  open,
  onOpenChange,
  initialContent,
  onSubmit,
}: CriterionFormDialogProps) {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (open) setContent(initialContent);
  }, [initialContent, open]);

  const handleSubmit = () => {
    const nextContent = content.trim();
    if (!nextContent) return;
    onSubmit(nextContent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tiêu chí kiểm định</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="criterion-content">Nội dung tiêu chí</Label>
          <Textarea
            id="criterion-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nhập nội dung tiêu chí"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
