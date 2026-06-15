# Example Pages Proposal

Tài liệu này đề xuất các trang example nên có cho template admin generic hướng thị trường Việt Nam. Các trang code sau này nên đặt trong `src/pages/example`, mỗi trang đại diện cho một nhu cầu quản trị phổ biến và một kiểu giao diện/luồng thao tác khác nhau.

Mục tiêu không phải tạo thật nhiều CRUD giống nhau. Mục tiêu là có đủ mẫu để khi bắt đầu dự án mới, agent/dev có thể copy một page gần đúng về layout, chỉnh domain data, rồi đi tiếp nhanh.

---

## Nguyên Tắc Chọn Trang

- Ưu tiên màn hình người dùng admin gặp hằng ngày: danh sách, lọc, nhập liệu, duyệt, phân quyền, theo dõi trạng thái.
- Mỗi example phải khác nhau về ít nhất một yếu tố: layout, mật độ dữ liệu, luồng thao tác, trạng thái dữ liệu, hoặc loại component.
- Tránh tạo nhiều trang chỉ là `table + modal form` nếu giá trị học được giống nhau.
- Dùng tiếng Việt trong UI mẫu: nhãn form, lỗi validate, trạng thái, empty state, confirm dialog.
- Tối ưu desktop 1366px đến 1920px, nhưng vẫn có fallback hợp lý cho tablet/mobile.

---

## Danh Sách Đề Xuất

| Ưu tiên | Page | Path đề xuất | Mục đích | Pattern chính |
|---|---|---|---|---|
| P0 | Quản lý nhân viên | `src/pages/example/employees` | Trang CRUD nhiều thông tin, dùng làm mẫu table chuẩn | Data table dense, bulk actions, drawer form, permission actions |
| P0 | Chi tiết nhân viên | `src/pages/example/employee-detail` | Trang detail có nhiều tab nghiệp vụ | Profile header, tabs, activity timeline, side summary |
| P0 | Phân quyền vai trò | `src/pages/example/role-permissions` | Mẫu RBAC/phân quyền phổ biến | Permission matrix, grouped checkbox, sticky action bar |
| P0 | Dashboard vận hành | `src/pages/example/operations-dashboard` | Màn hình tổng quan sau đăng nhập | KPI compact, chart, task list, alert panel |
| P1 | Quản lý phòng ban | `src/pages/example/departments` | Mẫu cây tổ chức, ít giống employee CRUD | Tree/sidebar, department detail panel, member table |
| P1 | Hộp duyệt yêu cầu | `src/pages/example/approval-inbox` | Mẫu workflow duyệt/từ chối | Master-detail, status queue, approve/reject panel |
| P1 | Quản lý đơn hàng | `src/pages/example/orders` | Mẫu nghiệp vụ có trạng thái vòng đời | Table + status stepper + detail modal |
| P1 | Quản lý kho | `src/pages/example/inventory` | Mẫu table nhiều cột/số liệu | Sticky columns, stock warning, quick adjustment |
| P1 | Form tạo hồ sơ | `src/pages/example/create-record` | Mẫu form dài, chia section | Multi-section form, validation, save draft |
| P2 | Báo cáo phân tích | `src/pages/example/reports` | Mẫu lọc dữ liệu + biểu đồ + bảng | Filter bar, chart grid, export table |
| P2 | Nhật ký hệ thống | `src/pages/example/audit-logs` | Mẫu log/search chuyên sâu | Timeline/table hybrid, advanced filters, JSON detail |
| P2 | Cài đặt hệ thống | `src/pages/example/settings` | Mẫu settings page nhiều nhóm | Settings sections, toggles, inline save states |

---

## Chi Tiết Từng Trang

### 1. Quản Lý Nhân Viên

**Lý do ưu tiên:** Đây là trang đại diện tốt nhất cho admin CRUD thực tế tại Việt Nam: dữ liệu nhiều, cần tìm kiếm nhanh, phân quyền, trạng thái tài khoản, phòng ban, chức vụ, thao tác hàng loạt.

**Giao diện nên có:**
- Header: tiêu đề, mô tả ngắn, nút `Thêm nhân viên`, nút `Nhập Excel`.
- Toolbar: search, filter phòng ban, filter trạng thái, filter vai trò, nút refresh.
- Table: avatar chữ cái, mã nhân viên, họ tên, phòng ban, chức vụ, vai trò, trạng thái, lần đăng nhập cuối, cột thao tác cố định.
- Bulk action: chọn nhiều dòng để khóa tài khoản, gán phòng ban, xuất Excel.
- Empty/loading/error states: skeleton table, empty có CTA, lỗi tải dữ liệu có retry.

**Luồng chính:**
1. Tìm và lọc nhân viên.
2. Mở drawer thêm/sửa nhân viên.
3. Gán vai trò hoặc mở trang phân quyền.
4. Khóa/mở khóa tài khoản với confirm dialog.

**Component/pattern template nhận được:** table chuẩn, drawer form, badge trạng thái, row action, bulk action, confirm dialog.

---

### 2. Chi Tiết Nhân Viên

**Lý do:** Nhiều hệ thống cần trang detail thay vì chỉ modal. Đây là mẫu cho entity detail nhiều tab.

**Giao diện nên có:**
- Profile header: avatar, tên, mã nhân viên, trạng thái, phòng ban, action chính.
- Tabs: `Thông tin`, `Phân quyền`, `Lịch sử hoạt động`, `Tài liệu`.
- Side summary: thông tin nhanh, người quản lý, ngày vào làm, lần đăng nhập.
- Activity timeline: đăng nhập, đổi quyền, cập nhật hồ sơ.

**Luồng chính:**
1. Vào từ table nhân viên.
2. Xem thông tin tổng quan.
3. Chỉnh từng nhóm thông tin trong tab.
4. Theo dõi lịch sử thay đổi.

**Component/pattern template nhận được:** detail layout, tabs, timeline, side summary panel.

---

### 3. Phân Quyền Vai Trò

**Lý do:** Permission là nhu cầu lớn của template admin, khác rõ với CRUD thông thường.

**Giao diện nên có:**
- Sidebar danh sách vai trò: Admin, Quản lý, Nhân viên, Kế toán.
- Main content: permission matrix theo module.
- Cột quyền: Xem, Tạo, Sửa, Xóa, Duyệt, Xuất dữ liệu.
- Sticky footer/action bar: `Lưu thay đổi`, `Khôi phục`, trạng thái unsaved changes.

**Luồng chính:**
1. Chọn vai trò.
2. Bật/tắt quyền theo nhóm module.
3. Cảnh báo khi cấp quyền nguy hiểm.
4. Lưu và hiển thị success/error state.

**Component/pattern template nhận được:** permission matrix, grouped checkbox, sticky action bar, warning state.

---

### 4. Dashboard Vận Hành

**Lý do:** Template cần một trang tổng quan thật sự dùng được, nhưng không nên mang cảm giác landing page.

**Giao diện nên có:**
- KPI compact: doanh thu, yêu cầu chờ duyệt, đơn đang xử lý, cảnh báo.
- Chart nhỏ: xu hướng 7/30 ngày.
- Task list: việc cần xử lý hôm nay.
- Alert panel: cảnh báo tồn kho, quá hạn, lỗi đồng bộ.
- Recent activity: hoạt động mới nhất.

**Luồng chính:**
1. Người dùng vào dashboard để biết việc cần xử lý.
2. Click KPI/task để đi vào màn hình nghiệp vụ.
3. Dismiss hoặc xử lý cảnh báo.

**Component/pattern template nhận được:** operational dashboard, KPI cards compact, chart/table mix, alert list.

---

### 5. Quản Lý Phòng Ban

**Lý do:** Vẫn thuộc HR/admin nhưng khác employee page: cần tree và relationship.

**Giao diện nên có:**
- Left panel: cây phòng ban có search.
- Right panel: thông tin phòng ban đang chọn.
- Table nhỏ: danh sách thành viên thuộc phòng ban.
- Inline actions: đổi trưởng phòng, chuyển nhân viên, thêm phòng ban con.

**Luồng chính:**
1. Tìm/chọn phòng ban trong tree.
2. Sửa thông tin phòng ban.
3. Quản lý thành viên trong phòng ban.
4. Kéo thả hoặc dùng action để đổi cấu trúc.

**Component/pattern template nhận được:** split layout, tree navigation, detail panel, nested entity management.

---

### 6. Hộp Duyệt Yêu Cầu

**Lý do:** Rất nhiều hệ thống Việt Nam có luồng duyệt: nghỉ phép, mua hàng, thanh toán, thay đổi dữ liệu.

**Giao diện nên có:**
- Queue bên trái: danh sách yêu cầu, filter trạng thái, độ ưu tiên.
- Detail bên phải: nội dung yêu cầu, người gửi, lịch sử duyệt.
- Action panel: duyệt, từ chối, yêu cầu bổ sung.
- Comment box: lý do duyệt/từ chối.

**Luồng chính:**
1. Chọn yêu cầu trong queue.
2. Xem detail và lịch sử.
3. Duyệt/từ chối có confirm và note bắt buộc.
4. Chuyển sang item tiếp theo.

**Component/pattern template nhận được:** master-detail, approval workflow, comment/reason form, status queue.

---

### 7. Quản Lý Đơn Hàng

**Lý do:** Đại diện cho nghiệp vụ có vòng đời trạng thái, detail modal lớn và nhiều action phụ.

**Giao diện nên có:**
- Table: mã đơn, khách hàng, tổng tiền, trạng thái, ngày tạo, người phụ trách.
- Status tags: mới, đang xử lý, đã giao, hủy, quá hạn.
- Detail modal/drawer: thông tin khách hàng, danh sách sản phẩm, lịch sử trạng thái.
- Stepper trạng thái trong detail.

**Luồng chính:**
1. Lọc đơn theo trạng thái/ngày.
2. Mở detail đơn hàng.
3. Cập nhật trạng thái hoặc hủy đơn.
4. In/xuất hóa đơn.

**Component/pattern template nhận được:** lifecycle status, large drawer/modal, line-item table, stepper.

---

### 8. Quản Lý Kho

**Lý do:** Mẫu table nhiều số liệu, cảnh báo, sticky column, thao tác nhanh.

**Giao diện nên có:**
- Table nhiều cột: SKU, tên hàng, nhóm, tồn khả dụng, tồn tối thiểu, vị trí, cập nhật cuối.
- Row warning: dưới tồn tối thiểu, sắp hết hạn, lệch kiểm kê.
- Quick action: nhập/xuất/điều chỉnh tồn.
- Summary strip: tổng SKU, cảnh báo, giá trị tồn.

**Luồng chính:**
1. Lọc nhóm hàng/kho/trạng thái.
2. Xem cảnh báo tồn kho.
3. Mở popover/drawer điều chỉnh nhanh.
4. Ghi nhận lịch sử thay đổi.

**Component/pattern template nhận được:** numeric table, warning rows, quick adjustment, sticky table behavior.

---

### 9. Form Tạo Hồ Sơ

**Lý do:** Nhiều admin app cần form dài, validation rõ, save draft, chia section.

**Giao diện nên có:**
- Form chia section: thông tin chung, liên hệ, cấu hình, ghi chú.
- Required markers rõ.
- Validation tiếng Việt dưới field.
- Sticky footer: Hủy, Lưu nháp, Tạo hồ sơ.
- Side progress: section nào còn lỗi.

**Luồng chính:**
1. Nhập form theo section.
2. Lưu nháp.
3. Validate và focus field lỗi đầu tiên.
4. Submit thành công và điều hướng về detail.

**Component/pattern template nhận được:** long form, validation, sticky footer, draft state.

---

### 10. Báo Cáo Phân Tích

**Lý do:** Template cần mẫu cho trang không chỉ CRUD, có lọc dữ liệu và xuất báo cáo.

**Giao diện nên có:**
- Filter bar: khoảng ngày, phòng ban/kênh, trạng thái.
- Chart grid: line/bar/pie hoặc cards summary.
- Data table dưới chart: drill-down kết quả.
- Export actions: Excel/PDF/In.

**Luồng chính:**
1. Chọn bộ lọc.
2. Xem biểu đồ và bảng dữ liệu.
3. Click chart/table để drill down.
4. Xuất báo cáo.

**Component/pattern template nhận được:** report layout, filter state, chart/table composition, export toolbar.

---

### 11. Nhật Ký Hệ Thống

**Lý do:** Mẫu search/filter chuyên sâu, nhiều metadata, useful cho admin kỹ thuật.

**Giao diện nên có:**
- Advanced filter: người dùng, hành động, module, thời gian, IP.
- Timeline/table hybrid: thời gian, actor, action, resource, result.
- Detail drawer: diff trước/sau, request metadata, JSON payload.
- Severity/state: info, warning, error.

**Luồng chính:**
1. Tìm log theo điều kiện.
2. Mở chi tiết log.
3. Copy metadata hoặc tải log.
4. Reset filter nhanh.

**Component/pattern template nhận được:** advanced filters, log table, JSON viewer, technical detail drawer.

---

### 12. Cài Đặt Hệ Thống

**Lý do:** Trang settings có layout khác CRUD, nhiều toggle/select và save state từng nhóm.

**Giao diện nên có:**
- Left nav hoặc tabs theo nhóm: Chung, Bảo mật, Thông báo, Tích hợp.
- Section settings: label, mô tả, control.
- Inline save state: đã lưu, đang lưu, lỗi.
- Danger zone: reset, xóa dữ liệu mẫu, revoke integration.

**Luồng chính:**
1. Chọn nhóm cài đặt.
2. Chỉnh từng setting.
3. Auto-save hoặc lưu theo section.
4. Confirm với action nguy hiểm.

**Component/pattern template nhận được:** settings layout, toggles, section save state, danger zone.

---

## Thứ Tự Nên Implement

### Batch 1: Core Admin Foundation

- [ ] `employees`: data table chuẩn + drawer form.
- [ ] `role-permissions`: RBAC matrix.
- [ ] `operations-dashboard`: dashboard vận hành.
- [ ] `employee-detail`: detail page nhiều tab.

Batch này tạo nền cho 70% admin project: danh sách, chi tiết, phân quyền, tổng quan.

### Batch 2: Workflow Và Nghiệp Vụ

- [ ] `departments`: tree + detail.
- [ ] `approval-inbox`: master-detail duyệt.
- [ ] `orders`: lifecycle + large detail drawer.
- [ ] `create-record`: long form.

Batch này bổ sung các luồng khác CRUD, giúp template hữu dụng hơn cho hệ thống nội bộ.

### Batch 3: Data Heavy Và Settings

- [ ] `inventory`: numeric table nhiều cột.
- [ ] `reports`: filter + chart + export.
- [ ] `audit-logs`: advanced search + technical detail.
- [ ] `settings`: section settings + danger zone.

Batch này phục vụ các hệ thống lớn hơn, có báo cáo, audit, vận hành và cấu hình.

---

## Tiêu Chuẩn Chung Cho Mỗi Example Page

Mỗi page nên có đủ các trạng thái sau, kể cả khi dùng mock data:

- Default data state.
- Loading skeleton.
- Empty state.
- Error state có retry.
- Permission-aware disabled/hidden action.
- Responsive behavior tối thiểu cho mobile/tablet.
- Vietnamese copy cho label, placeholder, validation, confirm.

Mỗi page nên export component chính bằng named export, ví dụ:

```tsx
export function EmployeesExamplePage() {
  return <div />;
}
```

Mỗi page nên được thiết kế như một mẫu có thể copy sang feature thật, không chỉ là demo trang trí.
