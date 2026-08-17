# Table filter, sorting, and pagination foundation

## Goal

Chuẩn hóa state và hành vi cho các bảng quản lý của project thật, bắt đầu bằng
bảng Hợp đồng. Các bảng sau này có thể dùng cùng một pattern cho tìm kiếm,
filter, sort và pagination mà không lặp lại state ở từng page.

## Scope của đợt đầu

- Tạo hook dùng chung cho `keyword`, filter state, sorting state và pagination.
- Tạo helper chọn/lọc/sắp xếp/phân trang dữ liệu khi page hiện vẫn tải toàn bộ
  workspace về client.
- Migrate bảng Hợp đồng làm pilot.
- Thêm filter trạng thái hợp đồng để kiểm chứng việc reset về trang đầu khi
  filter thay đổi.
- Giữ `DataGridPagination` là component trình bày; không đưa query hoặc
  business logic vào component này.
- Chưa tạo filter builder. Sau pilot sẽ đánh giá các filter field thực tế trước
  khi đóng thành builder.

## Ranh giới trách nhiệm

```text
Table builder
  -> column definitions

useTableListState
  -> keyword, filters, sorting, pageIndex, pageSize

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

Đợt đầu dùng client-side selector vì các API workspace hiện đang trả toàn bộ
danh sách. Selector phải trả cả `items` và `total` để sau này thay bằng query
server-side mà không đổi page contract.

Khi chuyển sang server-side:

- Feature query nhận `ListQueryParams` đã normalize.
- Query key chứa toàn bộ params có ý nghĩa.
- Fetcher nhận và truyền tiếp `AbortSignal`.
- Dùng `placeholderData: keepPreviousData`.
- Không cache tổng cũ khi kết quả filter là 0.

### 3. URL sync

Chưa bật mặc định trong pilot. URL codec sẽ là bước riêng sau khi chốt danh
sách filter nào cần deep-link/back-forward. Không serialize một object `extra`
tùy ý vào URL.

### 4. Builder

Chưa tạo `filter builder` trong đợt đầu. Filter không luôn tương ứng 1-1 với
column: tag, khoảng ngày, trạng thái ẩn hoặc filter tác động nhiều field đều là
các trường hợp phổ biến. Sau khi ít nhất ba bảng dùng chung filter field, có thể
thêm metadata `filters` vào spec hoặc tạo builder riêng chỉ sinh filter config
và form; builder vẫn không sở hữu fetch/query/mutation.

## Pilot: bảng Hợp đồng

- Di chuyển keyword và pagination state vào `useTableListState`.
- Thêm filter `status` với lựa chọn “Tất cả” và các trạng thái nghiệp vụ hiện có.
- Dùng selector dùng chung để lọc rồi phân trang.
- `recordCount` lấy từ tổng sau filter, không lấy tổng trước filter.
- Giữ API workspace và table builder hiện tại không thay đổi.

## Tiêu chí nghiệm thu

- Filter keyword/status đưa về trang đầu.
- Đổi page size đưa về trang đầu.
- Pagination hiển thị đúng tổng sau filter.
- Không làm thay đổi create/edit/delete contract.
- Unit test cho state reset và selector filter/pagination.
- `npm run build` pass.

## Bước tiếp theo

Sau pilot, áp dụng cùng hook cho Customers và Employees. Chỉ khi hai bảng này
không cần thêm ngoại lệ lớn mới quyết định tạo filter builder.
