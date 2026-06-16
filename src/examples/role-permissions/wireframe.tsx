import { useEffect, useState } from 'react';

/**
 * GREYBOX (block layout) cho trang Phân quyền vai trò — xem skill `block-layout`.
 * Chỉ là wireframe độ-trung-thực-thấp: div thuần + inline style, không phụ thuộc
 * design system. Dùng để chốt bố cục + responsive TRƯỚC khi dựng component thật.
 * Throwaway: xóa file này khi trang thật xong.
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
  topbar: 'rgba(245,158,11,0.16)',
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
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        gap: 8,
        padding: 8,
        boxSizing: 'border-box',
        background: '#fff',
      }}
    >
      {/* TOPBAR */}
      <div style={block(COLORS.topbar, { height: 56, alignItems: 'center' })}>
        TOPBAR → header (Phân quyền vai trò + breadcrumb)
      </div>

      {/* BODY: desktop = [roles | main], mobile = single column */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          flex: 1,
          gap: 8,
          minHeight: 0,
        }}
      >
        {/* ROLES */}
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
            : 'ROLES SIDEBAR → danh sách vai trò (Card nav: Admin / Quản lý / Nhân viên / Kế toán)'}
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
              hàng = module (Nhân viên, Đơn hàng, Kho…) · cột = Xem / Tạo / Sửa
              / Xóa / Duyệt / Xuất
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

      {/* mode indicator (chỉ để debug greybox) */}
      <div style={{ font: '600 11px ui-monospace, monospace', color: '#888' }}>
        breakpoint: {isMobile ? 'MOBILE (<768)' : 'DESKTOP (≥768)'} — resize để
        xem reflow
      </div>
    </div>
  );
}
