# Kế hoạch kỳ thanh toán thực tế và dự kiến

## Mục tiêu

Cho phép người dùng mặc định theo dõi kế hoạch thu theo tháng và mở rộng sang
năm khác mà không biến các kỳ chưa phát sinh thành dữ liệu thanh toán thật.

## Quyết định thiết kế

- `contract_charges` tiếp tục là nguồn sự thật cho thanh toán, phân bổ tiền và
  lịch sử/audit.
- Backend trả về hai nguồn dữ liệu trong cùng một danh sách:
  - `actual`: kỳ đã có record trong `contract_charges`;
  - `projected`: kỳ suy ra từ khoản phí định kỳ hoặc một lần nhưng chưa có
    record;
  - `mixed`: nhóm tháng/năm có cả hai nguồn.
- Kỳ dự kiến không được thanh toán trực tiếp. Action thanh toán chỉ xuất hiện
  với nhóm không chứa kỳ dự kiến.
- Mỗi request có `p_year`; view mặc định là `month`. View `period`, `month` và
  `year` đều dùng cùng một phạm vi năm được chọn.
- Không tạo kỳ dự kiến ngoài khoảng:
  `max(contract.start_date, version.effective_from, line.start_date)` đến
  `min(contract.end_date, version.effective_to, line.end_date)`.
- Hợp đồng `draft`, `expired` hoặc `terminated` không sinh kỳ dự kiến; các kỳ
  thật đã tồn tại của hợp đồng vẫn được hiển thị.
- Nếu đã có bất kỳ record nào cho cùng khoản phí và `period_start`, kể cả
  record `voided`, không tạo kỳ dự kiến trùng.

## API/RPC

Thêm `list_contract_receivable_plan` và endpoint phân quyền
`list_contract_receivable_plan_scoped`. Response bổ sung:

- `display_status = projected` cho kỳ chỉ dự kiến;
- `source`, `is_projected`;
- `actual_amount`, `projected_amount`,
  `planned_outstanding_amount` để UI không nhầm số đã thanh toán thật với kế
  hoạch tương lai.

## Kiểm tra nghiệm thu

- Năm 2026 của hợp đồng demo bắt đầu tháng 8 trả các tháng thực tế/dự kiến từ
  tháng 8 trở đi.
- Khi giới hạn ngày kết thúc ở 30/09 trong transaction kiểm thử, response chỉ
  còn tháng 8 và tháng 9; transaction được rollback.
- Build frontend và các test hợp đồng liên quan phải pass.
