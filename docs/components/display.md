# Display — Badge, Avatar, RelativeTime

> Hub: [`docs/06-component-usage-guide.md`](../06-component-usage-guide.md).

---

## Badge

Thay cho `<span>` nhãn thủ công; `BadgeDot` cho chấm, `BadgeButton` cho nút X (chip).

```tsx
import { Badge, BadgeDot } from '@/components/ui/badge';

<Badge variant="success" appearance="light" className="gap-1.5">
  <BadgeDot className="bg-admin-success-dot opacity-100" />
  Hoạt động
</Badge>
```

Variant: `primary | secondary | success | warning | info | outline | destructive`. Nếu cần biến thể
ổn định cho vai trò/trạng thái dùng nhiều → **thêm variant vào `badge.tsx`**, không rải class màu ở page.

---

## StatusBadge — badge theo config (dùng trong DataGrid)

Map `enum trạng thái → nhãn + màu` qua một config, tránh switch-case rải mỗi trang. Import từ
`@/components/ui/data-grid-columns`.

```tsx
import { StatusBadge, type StatusBadgeConfig } from '@/components/ui/data-grid-columns';

const config: StatusBadgeConfig<'active' | 'locked'> = {
  active: { label: 'Hoạt động', className: 'bg-admin-success-bg text-admin-success-text', dotClassName: 'bg-admin-success-dot' },
  locked: { label: 'Đã khóa', variant: 'outline', dotClassName: 'bg-admin-neutral-400' },
};

<StatusBadge status={row.status} config={config} />
```

`StatusBadgeConfig<TStatus> = Record<TStatus, { label: string; variant?: BadgeProps['variant']; dotClassName?: string; className?: string }>`.
Trạng thái thiếu trong config → render thẳng chuỗi (không crash). Trong cột bảng dùng `col.badge(...)`
(xem [data-grid.md](./data-grid.md#2-column-factory--createcolumnhelperstrow)).

---

## Avatar

```tsx
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

<Avatar className="size-9">
  <AvatarFallback className={cn('bg-gradient-to-br font-bold', avatarClasses[emp.avatar])}>
    {emp.initials}
  </AvatarFallback>
</Avatar>
```

Map gradient theo domain giữ ở cấp trang là chấp nhận được.

---

## RelativeTime — "x phút trước"

Hiển thị thời gian tương đối, tooltip là giờ tuyệt đối. Dựng trên [`lib/date`](../07-lib-utilities.md#date).
Import từ `@/components/ui/relative-time`.

```tsx
import { RelativeTime } from '@/components/ui/relative-time';

<RelativeTime value={row.createdAt} />   {/* "3 giờ trước", hover → dd/MM/yyyy HH:mm */}
```

Trong bảng có thể thay bằng `col.date({ mode: 'relative' })`.
