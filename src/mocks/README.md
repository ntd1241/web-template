# Mock-first data layer

Template chạy **mock-first**: mặc định `VITE_USE_MOCK=1`, feature API trả mock data nên
chạy được ngay không cần backend. Khi có API thật, đặt `VITE_USE_MOCK=0` và `VITE_API_URL`.

## Quy ước

- Mock data đặt trong `src/mocks/data/<domain>.ts`.
- Mỗi feature có một file API (`features/<domain>/api/<domain>.api.ts`) **rẽ nhánh theo
  `env.useMock`**: bật thì trả mock (qua `mockResponse`), tắt thì gọi `api` (axios).
- Dùng `mockResponse(data, delayMs)` để giả lập độ trễ mạng, giữ UI loading/skeleton thật.

```ts
import { mockEmployees } from '@/mocks/data/employees';
import { mockResponse } from '@/mocks/mock-response';
import { env } from '@/config/env';
import { api } from '@/lib/axios';

export const employeeApi = {
  getList: (params: EmployeeListParams) =>
    env.useMock
      ? mockResponse({
          items: mockEmployees,
          total: mockEmployees.length,
          ...params,
        })
      : api.get<PaginatedResponse<Employee>>('/employees', { params }),
};
```

## Nâng cấp tùy chọn

Nếu cần mock ở tầng network (intercept fetch/XHR thật), thêm [MSW](https://mswjs.io) sau —
khi đó các file `*.api.ts` không cần rẽ nhánh `env.useMock` nữa.
