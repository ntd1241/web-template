# Table filter, sorting, and pagination foundation

## Goal

Chuẩn hóa state và hành vi cho các bảng quản lý của project thật, bắt đầu bằng
bảng Hợp đồng. Các bảng sau này có thể dùng cùng một pattern cho tìm kiếm,
filter, sort và pagination mà không lặp lại state ở từng page.

## Scope của đợt đầu

- Tạo hook dùng chung cho `keyword`, filter state, sorting state và pagination.
- Tạo helper chọn/lọc/sắp xếp/phân trang dữ liệu cho các page vẫn phải tải toàn
  bộ workspace về client.
- Migrate bảng Hợp đồng làm pilot.
- Thêm filter trạng thái hợp đồng để kiểm chứng việc reset về trang đầu khi
  filter thay đổi.
- Chuyển pilot Hợp đồng sang server-side query với tổng bản ghi từ database.
- Giữ `DataGridPagination` là component trình bày; không đưa query hoặc
  business logic vào component này.
- Tạo filter builder độc lập cho toolbar search/select và query params builder
  để chuẩn hóa state trước khi đi vào từng API adapter.

## Ranh giới trách nhiệm

```text
Table builder
  -> column definitions

useTableListState
  -> keyword, filters, sorting, pageIndex, pageSize

filter builder
  -> filter toolbar UI và typed callbacks

list query params builder
  -> trim/omit/serialize search, filters, sort và pagination

client list selector / query hook
  -> filter, sort, paginate, fetch và total

Page/feature
  -> filter field cụ thể, API adapter, mutation và composition
```

Table builder hiện chỉ sinh columns theo [table builder guide](../../builders/table.md).
Không để generated columns biết về React Query, URL, API params hoặc filter
business rule.

## Quyết định kỹ thuật

### 1. State dùng chung

`useTableListState<TFilters>()` trả về:

- `keyword` và `setKeyword`.
- `filters` và `setFilters`/`setFilter`.
- `sorting` theo `@tanstack/react-table` để có thể nối trực tiếp vào
  `useReactTable`.
- `pagination` theo `PaginationState` để nối trực tiếp vào
  `DataGridPagination`.
- `resetFilters`.

Các thay đổi keyword, filter, sorting hoặc page size đều đưa `pageIndex` về 0.
Filter state vẫn do từng feature định nghĩa type, không dùng `Record<string,
unknown>` làm API chung.

### 2. Client-side và server-side

Helper client-side vẫn được giữ cho các API workspace chưa hỗ trợ phân trang.
Pilot Hợp đồng hiện dùng server-side query để không tải toàn bộ danh sách về
trình duyệt.

Khi chuyển sang server-side:

- Feature query nhận `ListQueryParams` đã normalize.
- Query key chứa toàn bộ params có ý nghĩa.
- Fetcher nhận và truyền tiếp `AbortSignal`.
- Dùng `placeholderData: keepPreviousData`.
- Không cache tổng cũ khi kết quả filter là 0.

Server-side contract của Hợp đồng:

- RPC `public.list_contracts` nhận `p_tenant_id`, `p_page`, `p_page_size`,
  `p_search` và `p_status`.
- RPC trả `{ items, total }`, lọc theo mã/tên hợp đồng và mã/tên khách hàng,
  đồng thời tính `total_outstanding` và `next_due_date` từ charge/payment
  allocations.
- Query mặc định sắp xếp hợp đồng mới nhất trước theo `created_at desc, id
desc`.
- RPC kiểm tra user đăng nhập và quyền `contracts:view`; migration tạo index
  phục vụ thứ tự mặc định.

Bảng Kỳ thanh toán trong trang chi tiết Hợp đồng cũng dùng server-side query:

- RPC `public.list_contract_receivable_periods` nhận tenant, contract, phân
  trang, search theo khoản phí/ngày, trạng thái, sort và số ngày “sắp tới hạn”.
- Database group các charge cùng kỳ thành một row, trả tổng tiền, đã thu, còn
  lại, trạng thái hiển thị và danh sách khoản phí để dialog thanh toán vẫn phân
  bổ đúng charge.
- Query key chứa toàn bộ params; đổi search/filter/sort/page/page size gọi lại
  RPC và dùng `manualPagination` ở table.

### 3. URL sync

Chưa bật mặc định trong pilot. URL codec sẽ là bước riêng sau khi chốt danh
sách filter nào cần deep-link/back-forward. Không serialize một object `extra`
tùy ý vào URL.

### 4. Filter builder và query params builder

`filter builder` là builder độc lập với table builder. Nó sinh wrapper typed
quanh `FilterToolbar`, chỉ sở hữu thứ tự field, label, placeholder, option tĩnh
và callback renderer. Feature vẫn sở hữu filter type, badge renderer và reset
behavior thông qua `useTableListState`.

`buildListQueryParams` là helper thuần, nhận state chuẩn và spec mapping để
chuẩn hóa `page`, `pageSize`, search, filter và sort. Kết quả này chưa biết
Supabase/RPC; API adapter của từng feature chuyển tiếp sang `p_*` hoặc format
backend tương ứng. Vì vậy thay đổi wire format backend chỉ cần sửa adapter.

Builder không sở hữu fetch/query/mutation/business rule. Filter không bắt buộc
tương ứng 1-1 với column: tag, khoảng ngày, trạng thái ẩn hoặc filter tác động
nhiều field vẫn do feature định nghĩa.

## Pilot: bảng Hợp đồng

- Di chuyển keyword và pagination state vào `useTableListState`.
- Thêm filter `status` với lựa chọn “Tất cả” và các trạng thái nghiệp vụ hiện có.
- Dùng `useTableListState` để chuẩn hóa params, nhưng fetch/filter/pagination
  do server xử lý qua `public.list_contracts`.
- `recordCount` lấy từ `total` do RPC trả về, kể cả khi kết quả filter là 0.
- Search debounce 300ms; đổi search, status, page hoặc page size tạo query key
  mới và gọi lại endpoint.
- Giữ table builder chỉ chịu trách nhiệm column definitions; không đưa query
  hoặc pagination vào builder.

## Tiêu chí nghiệm thu

- Filter keyword/status đưa về trang đầu.
- Đổi page size đưa về trang đầu.
- Pagination hiển thị đúng tổng sau filter.
- Không làm thay đổi create/edit/delete contract.
- Unit test cho state reset và selector filter/pagination.
- Live verification cho RPC với search, status filter và trường hợp không có
  kết quả.
- `npm run build` pass.

### Bước tiếp theo

Migrate Customers và Employees sang server-side bằng cùng `useTableListState`,
filter builder và query params builder. Các filter đặc thù như tag hoặc phòng
ban sẽ khai báo ở feature, còn transport mapper tiếp tục nằm trong API adapter.
