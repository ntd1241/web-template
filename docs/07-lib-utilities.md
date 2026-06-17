# Lib Utilities

> Các tiện ích dùng chung ở `src/lib/*` — validation, format, date, search, errors.
> Component UI: xem [`docs/06`](./06-component-usage-guide.md) + [`docs/components/`](./components/).
> Khi phình to, tách mỗi util thành `docs/lib/*.md`.

---

## Validation — schema factory + message catalog

`src/lib/validation` — builder mỏng trên `zod` v4, message lấy từ i18n catalog (namespace
`validation.*` trong `src/i18n/messages`). **Không** viết message tiếng Việt inline trong schema.

```ts
import { z } from 'zod';
import { vString, vNumber, vEmail, vPhoneVN, vRequiredEnum } from '@/lib/validation';

export const employeeFormSchema = z.object({
  name: vString({ min: 1, max: 100 }),
  username: vString({ min: 3, pattern: /^[a-z0-9_]+$/ }),
  age: vNumber({ min: 18, int: true, required: false }),
  email: vEmail(),
  phone: vPhoneVN(),
  roles: vRequiredEnum(EMPLOYEE_ROLES),
});
```

| Builder | Tham số |
|---|---|
| `vString` | `{ required?, min?, max?, pattern?, trim? }` |
| `vNumber` | `{ required?, min?, max?, int? }` |
| `vEmail` / `vPhoneVN` | `{ required? }` |
| `vRequiredEnum(values)` | mảng enum, "chọn ít nhất 1" |

`required: false` → `.optional()`. **Logic cross-field** (vd `end > start`) đặt ở `.refine()` của
schema cụ thể, **không** nhồi vào factory. Ráp với form qua `@hookform/resolvers/zod`.

---

## Format — số / tiền / phần trăm (vi-VN)

`src/lib/format.ts` — qua `Intl.NumberFormat('vi-VN')`. Nhận `number | null | undefined`, rỗng/`NaN`
→ `''` (không throw). VN dùng `.` ngăn nghìn, `,` thập phân.

```ts
import { formatCurrencyVND, formatNumber, formatPercent, formatCompact } from '@/lib/format';

formatCurrencyVND(1234567);   // "1.234.567 ₫"
formatNumber(1234567);        // "1.234.567"
formatPercent(0.125);         // "12,5%"   (input là tỉ lệ)
formatCompact(1200000);       // "1,2 Tr"
```

---

## Date — định dạng + thời gian tương đối

`src/lib/date.ts` — trên `date-fns` + locale `vi`. Nhận `Date | string | number`, input lỗi → `''`.

```ts
import { formatDate, formatDateTime, formatTime, formatRelative } from '@/lib/date';

formatDate(d);       // "17/06/2026"
formatDateTime(d);   // "17/06/2026 14:30"
formatRelative(d);   // "3 giờ trước"
```

UI: component [`<RelativeTime />`](./components/display.md#relativetime--x-phút-trước) hoặc cột
`col.date({ mode: 'relative' })`.

---

## Search — tìm kiếm tiếng Việt (bỏ dấu)

`src/lib/search.ts` — chuẩn hóa rồi `includes` (không phân biệt dấu/hoa-thường). Nền cho
`Combobox`/`MultiSelect`.

```ts
import { normalizeVi, searchMatch } from '@/lib/search';

normalizeVi('Nguyễn Đăng');        // "nguyen dang"
searchMatch('Nguyễn', 'nguyen');   // true
searchMatch(text, '');             // true  (query rỗng = khớp tất cả)
```

---

## Errors — chuẩn hóa lỗi API → toast/message

`src/lib/errors.ts` — đứng trên `ApiError` đã được `src/lib/axios.ts` chuẩn hóa. An toàn với
`unknown` (không throw, luôn trả chuỗi). Message fallback lấy từ i18n (`common.state.error`).

```ts
import { getErrorMessage, getFieldErrors, toastError } from '@/lib/errors';

// react-query mutation
useMutation({
  mutationFn,
  onError: (error) => toastError(error),        // toast.error(message)
});

// map lỗi field vào react-hook-form
const fieldErrors = getFieldErrors(error);       // Record<string, string[]> | undefined
```

| Hàm | Trả về |
|---|---|
| `getErrorMessage(error: unknown)` | chuỗi message (ApiError → Error → string → fallback) |
| `getFieldErrors(error: unknown)` | `Record<string,string[]> \| undefined` |
| `toastError(error: unknown)` | bắn `toast.error` (sonner) |
| `isApiError(value)` | type guard `ApiError` |
