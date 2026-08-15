import { APP_KEYBOARD_SHORTCUTS } from '@/lib/keyboard-shortcuts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ShortcutKey } from '@/components/ui/shortcut-tooltip';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phím tắt</DialogTitle>
          <DialogDescription>
            Dùng các phím tắt này để thao tác nhanh hơn trong hệ thống.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {APP_KEYBOARD_SHORTCUTS.map((item) => (
            <div
              key={item.shortcut}
              className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <ShortcutKey>{item.shortcut}</ShortcutKey>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
