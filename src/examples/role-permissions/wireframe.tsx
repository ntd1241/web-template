import { useEffect, useState } from 'react';

/**
 * GREYBOX CHI TIẾT (block layout level 2) cho nội dung trang Phân quyền vai trò
 * — xem skill `block-layout`. Vẫn là khối inline-style/unstyled (không design
 * system), nhưng đã blockframe xuống từng phần tử con: từng vai trò, từng cột
 * quyền, từng ô checkbox, từng nút. Mục đích: chốt cấu trúc + mật độ trước khi
 * thay bằng component thật. Render trong MainLayout (content area).
 */
function block(
  color: string,
  style: React.CSSProperties = {},
): React.CSSProperties {
  return {
    border: '1px solid rgba(0,0,0,0.22)',
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

const C = {
  roles: 'rgba(99,102,241,0.10)',
  header: 'rgba(16,185,129,0.12)',
  matrix: 'rgba(59,130,246,0.08)',
  action: 'rgba(236,72,153,0.12)',
  leaf: 'rgba(255,255,255,0.85)',
  btn: 'rgba(0,0,0,0.06)',
  btnPrimary: 'rgba(16,185,129,0.30)',
};

const ROLES = [
  { name: 'Admin', count: 12, selected: false },
  { name: 'Quản lý', count: 8, selected: true },
  { name: 'Nhân viên', count: 24, selected: false },
  { name: 'Kế toán', count: 5, selected: false },
];

const MODULES = [
  'Nhân viên',
  'Đơn hàng',
  'Kho',
  'Báo cáo',
  'Cài đặt',
  'Phân quyền',
];
const PERMS = ['Xem', 'Tạo', 'Sửa', 'Xóa', 'Duyệt', 'Xuất'];
// mẫu trạng thái tick để thấy mật độ (true = đã cấp)
const GRANTED: boolean[][] = [
  [true, true, true, false, false, true],
  [true, true, true, true, true, true],
  [true, false, false, false, false, true],
  [true, false, false, false, false, false],
  [true, true, false, false, false, false],
  [true, false, false, false, false, false],
];

function Checkbox({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        border: '1px solid rgba(0,0,0,0.45)',
        background: on ? 'rgba(16,185,129,0.55)' : 'transparent',
        display: 'inline-block',
      }}
    />
  );
}

export function RolePermissionsWireframe() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const gridCols = `minmax(150px, 1fr) repeat(${PERMS.length}, 64px)`;

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
      {/* ROLES PANEL — từng vai trò là 1 item */}
      <div
        style={block(C.roles, {
          flexDirection: 'column',
          gap: 6,
          width: isMobile ? 'auto' : 260,
          flexShrink: 0,
        })}
      >
        <div style={{ opacity: 0.7, marginBottom: 2 }}>
          ROLES PANEL → Card nav
        </div>
        <div style={block(C.leaf, { padding: 8 })}>🔍 Tìm vai trò… (Input)</div>
        {ROLES.map((r) => (
          <div
            key={r.name}
            style={block(r.selected ? 'rgba(16,185,129,0.22)' : C.leaf, {
              padding: 8,
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <span>{r.name}</span>
            <span
              style={block(C.btn, {
                padding: '1px 6px',
                font: '600 11px ui-monospace',
              })}
            >
              {r.count}
            </span>
          </div>
        ))}
        <div
          style={block(C.btn, {
            padding: 8,
            justifyContent: 'center',
            marginTop: 'auto',
          })}
        >
          + Thêm vai trò (Button)
        </div>
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
        {/* MATRIX HEADER */}
        <div
          style={block(C.header, {
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          })}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span>Vai trò: Quản lý</span>
            <span style={{ fontWeight: 400, opacity: 0.7 }}>
              Mô tả quyền hạn của vai trò (CardDescription)
            </span>
          </div>
          <span
            style={block(C.action, {
              padding: '2px 8px',
              font: '600 11px ui-monospace',
            })}
          >
            ● 3 thay đổi chưa lưu (Badge)
          </span>
        </div>

        {/* MATRIX — grid module × quyền, mỗi ô là checkbox */}
        <div
          style={block(C.matrix, {
            flex: 1,
            flexDirection: 'column',
            overflow: 'auto',
            padding: 8,
            gap: 0,
          })}
        >
          <div style={{ marginBottom: 6, opacity: 0.7 }}>
            MATRIX → DataGrid / Table + Checkbox
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              minWidth: 150 + PERMS.length * 64,
            }}
          >
            {/* header row */}
            <div style={block(C.btn, { padding: 6, fontWeight: 700 })}>
              Module
            </div>
            {PERMS.map((p) => (
              <div
                key={p}
                style={block(C.btn, {
                  padding: 6,
                  justifyContent: 'center',
                  fontWeight: 700,
                })}
              >
                {p}
              </div>
            ))}
            {/* body rows */}
            {MODULES.map((m, ri) => (
              <Row key={m} module={m} cols={GRANTED[ri]} />
            ))}
          </div>
        </div>

        {/* ACTION BAR — từng nút */}
        <div
          style={block(C.action, {
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            position: 'sticky',
            bottom: 0,
          })}
        >
          <span style={{ fontWeight: 400, opacity: 0.8 }}>
            3 thay đổi chưa lưu
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={block(C.btn, { padding: '6px 14px' })}>Khôi phục</div>
            <div style={block(C.btnPrimary, { padding: '6px 14px' })}>
              Lưu thay đổi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ module, cols }: { module: string; cols: boolean[] }) {
  return (
    <>
      <div style={block(C.leaf, { padding: 6, alignItems: 'center' })}>
        {module}
      </div>
      {cols.map((on, ci) => (
        <div
          key={ci}
          style={block(C.leaf, {
            padding: 6,
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          <Checkbox on={on} />
        </div>
      ))}
    </>
  );
}
