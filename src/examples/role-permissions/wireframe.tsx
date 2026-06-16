import { useEffect, useState } from 'react';

/**
 * GREYBOX (block layout) cho phần NỘI DUNG trang Phân quyền vai trò — xem skill
 * `block-layout`. Render bên trong MainLayout (sidebar/topbar thật bao quanh),
 * nên ở đây chỉ block hoá vùng content. Div thuần + inline style, không phụ
 * thuộc design system. Throwaway: thay dần bằng component thật, hoặc giữ làm
 * tài liệu layout (dev-only, không lọt vào production build).
 */
function block(
  color: string,
  style: React.CSSProperties = {},
): React.CSSProperties {
  return {
    border: '1px solid rgba(0,0,0,0.25)',
    borderRadius: 0,
    background: color,
    color: '#1a1a1a',
    font: '600 12px/1.4 ui-monospace, monospace',
    padding: 10,
    boxSizing: 'border-box',
    display: 'flex',
    ...style,
  };
}

const COLORS = {
  roles: 'rgba(99,102,241,0.14)',
  header: 'rgba(16,185,129,0.14)',
  matrix: 'rgba(59,130,246,0.12)',
  action: 'rgba(236,72,153,0.14)',
};

export function RolePermissionsWireframe() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        gap: 8,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* ROLES PANEL (nội dung trang, không phải sidebar app) */}
      <div
        style={block(COLORS.roles, {
          flexDirection: 'column',
          width: isMobile ? 'auto' : 260,
          height: isMobile ? 48 : 'auto',
          alignItems: isMobile ? 'center' : 'flex-start',
        })}
      >
        {isMobile
          ? 'ROLES → Select/Drawer chọn vai trò'
          : 'ROLES PANEL → danh sách vai trò (Card nav: Admin / Quản lý / Nhân viên / Kế toán)'}
      </div>

      {/* MAIN COLUMN */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          gap: 8,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <div
          style={block(COLORS.header, {
            height: 64,
            flexDirection: 'column',
            gap: 4,
          })}
        >
          MATRIX HEADER → tên vai trò + mô tả + trạng thái “chưa lưu”
        </div>

        <div
          style={block(COLORS.matrix, {
            flex: 1,
            flexDirection: 'column',
            overflow: 'auto',
          })}
        >
          MATRIX → ma trận quyền theo module (Table + Checkbox)
          <div style={{ marginTop: 6, fontWeight: 400, opacity: 0.75 }}>
            hàng = module (Nhân viên, Đơn hàng, Kho…) · cột = Xem / Tạo / Sửa /
            Xóa / Duyệt / Xuất
            {isMobile ? ' · (mobile: cuộn ngang)' : ''}
          </div>
        </div>

        {/* STICKY ACTION BAR */}
        <div
          style={block(COLORS.action, {
            height: 56,
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 8,
            position: 'sticky',
            bottom: 0,
          })}
        >
          ACTION BAR (sticky) → Khôi phục · Lưu thay đổi
        </div>
      </div>
    </div>
  );
}
