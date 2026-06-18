import { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, InputGroup } from '@/components/ui/input';

interface EmployeeSkillsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

/**
 * Ô nhập kỹ năng dạng "tags": gõ + Enter (hoặc nút +) để thêm, mỗi chip có nút xóa.
 * Demo-only cho dialog tạo nhân viên — bỏ qua trùng lặp, tự cắt khoảng trắng.
 */
export function EmployeeSkillsField({
  value,
  onChange,
  placeholder = 'Thêm kỹ năng (vd: React, Figma)',
}: EmployeeSkillsFieldProps) {
  const [draft, setDraft] = useState('');

  const handleAdd = () => {
    const next = draft.trim();
    if (!next || value.includes(next)) {
      setDraft('');
      return;
    }
    onChange([...value, next]);
    setDraft('');
  };

  const handleRemove = (skill: string) => {
    onChange(value.filter((item) => item !== skill));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
    if (event.key === 'Backspace' && !draft && value.length > 0) {
      handleRemove(value[value.length - 1]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <InputGroup>
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="outline"
          mode="icon"
          onClick={handleAdd}
          aria-label="Thêm kỹ năng"
        >
          <Plus />
        </Button>
      </InputGroup>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-input bg-background py-1 pe-1 ps-3 text-sm text-foreground"
            >
              {skill}
              <Button
                type="button"
                variant="ghost"
                mode="icon"
                onClick={() => handleRemove(skill)}
                aria-label={`Xóa ${skill}`}
                className="size-5 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </Button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
