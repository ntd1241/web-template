# Phân công nhân viên và quyền theo hợp đồng

## Mục tiêu

- Cho phép phân công một hoặc nhiều nhân viên phụ trách hợp đồng.
- Cho phép thu hẹp quyền của từng nhân viên riêng trên từng hợp đồng.
- Thay đổi phân công/quyền không tạo contract version và không phát sinh lại kỳ thanh toán.

## Quyết định thiết kế

- Quyền ở module/tenant là quyền nền của người dùng.
- Assignment là scope tài nguyên: người dùng có quyền thao tác trên hợp đồng khi có quyền nền và thuộc phạm vi hợp đồng.
- Override ở hợp đồng chỉ có hiệu lực `deny`; không được cấp quyền vượt quyền nền.
- Owner/Admin được bypass scope. Role có scope `all` được thao tác mọi hợp đồng, trừ quyền bị deny riêng trên hợp đồng.
- Nhân viên chưa liên kết tài khoản vẫn có thể được lưu làm người phụ trách, nhưng không thể thao tác trên hệ thống.
- Phân công ban đầu của hợp đồng draft được phép bởi người tạo hợp đồng; các thay đổi sau đó cần `contracts:assign`.

## Luồng triển khai

1. Database thêm `contracts:assign`, bảng override quyền và RLS chỉ đọc.
2. RPC `get_contract_responsible_workspace` tải nhân viên, quyền nền, assignment và các deny hiện tại.
3. RPC `replace_contract_responsible_access` kiểm tra toàn bộ payload rồi thay thế assignment/override trong một transaction.
4. RPC danh sách kỳ và ghi nhận thanh toán được bọc bởi kiểm tra quyền theo hợp đồng; RPC thanh toán cũ bị revoke khỏi role `authenticated`.
5. Frontend hiển thị avatar đơn/stack, dialog thêm-xóa nhân viên và checkbox quyền theo từng module.
6. Luồng cập nhật thông tin hợp đồng không còn ghi lại responsibility metadata, tránh tạo version ngoài ý muốn.

## Kiểm tra cần duy trì

- Không cho duplicate employee trong payload.
- Không cho deny một quyền nhân viên chưa được cấp ở tenant.
- Không cho employee inactive mới được assign.
- Xóa assignment phải cascade các deny override.
- Kiểm tra lại quyền sau khi refresh session vì permission catalog đã thay đổi.
