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

const PERMISSION_TAGS = ['Xem', 'Chỉnh sửa', 'Xóa', 'Duyệt'] as const;

type PermissionTag = (typeof PERMISSION_TAGS)[number];
type SummaryState = 'all' | 'partial' | 'none' | 'na';

interface PermissionItem {
  name: string;
  selected: boolean;
  tags: PermissionTag[];
  sensitive?: boolean;
}

interface PermissionGroup {
  name: string;
  permissions: PermissionItem[];
}

interface PermissionModule {
  code: string;
  name: string;
  note: string;
  groups: PermissionGroup[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    code: 'employees',
    name: 'Nhân viên',
    note: 'CRUD nhân sự + thao tác tài khoản',
    groups: [
      {
        name: 'Tài khoản',
        permissions: [
          {
            name: 'Xem danh sách tài khoản',
            selected: true,
            tags: ['Xem'],
          },
          {
            name: 'Tạo / chỉnh sửa tài khoản',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            name: 'Khóa / mở khóa tài khoản',
            selected: true,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            name: 'Đặt lại mật khẩu',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            name: 'Xóa tài khoản',
            selected: false,
            tags: ['Xóa'],
            sensitive: true,
          },
        ],
      },
      {
        name: 'Hồ sơ nhân viên',
        permissions: [
          {
            name: 'Xem hồ sơ nhân viên',
            selected: true,
            tags: ['Xem'],
          },
          {
            name: 'Xem lương / phụ cấp',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
          {
            name: 'Chỉnh sửa phòng ban / chức vụ',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
        ],
      },
    ],
  },
  {
    code: 'orders',
    name: 'Đơn hàng',
    note: 'Bán hàng, trạng thái, hoàn tiền',
    groups: [
      {
        name: 'Vận hành đơn',
        permissions: [
          { name: 'Xem đơn hàng', selected: true, tags: ['Xem'] },
          {
            name: 'Tạo / chỉnh sửa đơn hàng',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            name: 'Duyệt đơn hàng',
            selected: true,
            tags: ['Duyệt'],
          },
          {
            name: 'Hủy đơn hàng',
            selected: true,
            tags: ['Xóa', 'Duyệt'],
            sensitive: true,
          },
          {
            name: 'Hoàn tiền',
            selected: false,
            tags: ['Duyệt'],
            sensitive: true,
          },
          {
            name: 'Đổi trạng thái giao hàng',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
        ],
      },
      {
        name: 'Giá & chiết khấu',
        permissions: [
          {
            name: 'Áp dụng chiết khấu vượt hạn mức',
            selected: false,
            tags: ['Duyệt'],
          },
          {
            name: 'Sửa giá sau khi xác nhận',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
        ],
      },
    ],
  },
  {
    code: 'warehouse',
    name: 'Kho',
    note: 'Nhập xuất, kiểm kê, điều chỉnh tồn',
    groups: [
      {
        name: 'Phiếu kho',
        permissions: [
          { name: 'Xem tồn kho', selected: true, tags: ['Xem'] },
          {
            name: 'Tạo phiếu nhập kho',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          {
            name: 'Tạo phiếu xuất kho',
            selected: true,
            tags: ['Chỉnh sửa'],
          },
          { name: 'Duyệt phiếu kho', selected: false, tags: ['Duyệt'] },
        ],
      },
      {
        name: 'Kiểm kê',
        permissions: [
          {
            name: 'Điều chỉnh tồn kho',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            name: 'Chốt kiểm kê',
            selected: false,
            tags: ['Duyệt'],
            sensitive: true,
          },
        ],
      },
    ],
  },
  {
    code: 'reports',
    name: 'Báo cáo',
    note: 'Chỉ xem / xuất theo từng loại báo cáo',
    groups: [
      {
        name: 'Loại báo cáo',
        permissions: [
          { name: 'Xem báo cáo doanh thu', selected: true, tags: ['Xem'] },
          { name: 'Xem báo cáo tồn kho', selected: true, tags: ['Xem'] },
          {
            name: 'Xem báo cáo công nợ',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
        ],
      },
      {
        name: 'Dữ liệu nhạy cảm',
        permissions: [
          {
            name: 'Xem / xuất lợi nhuận gộp',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
          {
            name: 'Xem / xuất dữ liệu thô',
            selected: false,
            tags: ['Xem'],
            sensitive: true,
          },
        ],
      },
    ],
  },
  {
    code: 'system',
    name: 'Hệ thống',
    note: 'Không dùng CRUD thường, nhiều quyền nhạy cảm',
    groups: [
      {
        name: 'Vai trò & phân quyền',
        permissions: [
          { name: 'Xem vai trò', selected: true, tags: ['Xem'] },
          {
            name: 'Tạo / chỉnh sửa vai trò',
            selected: true,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            name: 'Chỉnh sửa quyền của vai trò',
            selected: false,
            tags: ['Chỉnh sửa', 'Duyệt'],
            sensitive: true,
          },
          {
            name: 'Xóa vai trò',
            selected: false,
            tags: ['Xóa'],
            sensitive: true,
          },
          { name: 'Sao chép vai trò', selected: true, tags: ['Chỉnh sửa'] },
        ],
      },
      {
        name: 'Cài đặt hệ thống',
        permissions: [
          { name: 'Xem cài đặt hệ thống', selected: true, tags: ['Xem'] },
          {
            name: 'Chỉnh sửa cài đặt hệ thống',
            selected: false,
            tags: ['Chỉnh sửa'],
            sensitive: true,
          },
          {
            name: 'Quản lý cấu hình bảo mật',
            selected: false,
            tags: ['Chỉnh sửa', 'Duyệt'],
            sensitive: true,
          },
          { name: 'Xem nhật ký hệ thống', selected: true, tags: ['Xem'] },
        ],
      },
    ],
  },
];

function SummaryCheckbox({ state }: { state: SummaryState }) {
  const text = state === 'all' ? '✓' : state === 'partial' ? '-' : '';

  return (
    <span
      style={{
        width: 16,
        height: 16,
        border: '1px solid rgba(0,0,0,0.45)',
        background: state === 'all' ? 'rgba(16,185,129,0.55)' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: state === 'na' ? 0.25 : 1,
        font: '700 11px ui-monospace, monospace',
      }}
    >
      {state === 'na' ? 'N/A' : text}
    </span>
  );
}

function PermissionCheckbox({ on }: { on: boolean }) {
  return (
    <span
      style={{
        width: 16,
        height: 16,
        border: '1px solid rgba(0,0,0,0.45)',
        background: on ? 'rgba(16,185,129,0.55)' : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        font: '700 11px ui-monospace, monospace',
      }}
    >
      {on ? '✓' : ''}
    </span>
  );
}

function getModulePermissions(module: PermissionModule) {
  return module.groups.flatMap((group) => group.permissions);
}

function getTagSummary(module: PermissionModule, tag: PermissionTag) {
  const taggedPermissions = getModulePermissions(module).filter((permission) =>
    permission.tags.includes(tag),
  );

  if (taggedPermissions.length === 0) {
    return 'na';
  }

  const selectedCount = taggedPermissions.filter(
    (permission) => permission.selected,
  ).length;

  if (selectedCount === taggedPermissions.length) {
    return 'all';
  }

  if (selectedCount > 0) {
    return 'partial';
  }

  return 'none';
}

function countModulePermissions(module: PermissionModule) {
  const permissions = getModulePermissions(module);
  const selected = permissions.filter(
    (permission) => permission.selected,
  ).length;
  const sensitiveSelected = permissions.filter(
    (permission) => permission.sensitive && permission.selected,
  ).length;

  return {
    selected,
    total: permissions.length,
    sensitiveSelected,
  };
}

function countGroupPermissions(group: PermissionGroup) {
  return group.permissions.filter((permission) => permission.selected).length;
}

export function RolePermissionsWireframe() {
  const [expandedModules, setExpandedModules] = useState<string[]>(['system']);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1280 : false,
  );
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1280);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const gridCols = `minmax(230px, 1fr) repeat(${PERMISSION_TAGS.length}, 82px) 88px 82px`;
  const toggleModule = (code: string) => {
    setExpandedModules((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

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
          <div
            style={block(C.btn, {
              padding: '6px 12px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            })}
            onClick={() => setIsEditRoleOpen(true)}
          >
            Chỉnh sửa vai trò (Button → Dialog)
          </div>
        </div>

        {/* MATRIX — module overview + expandable special permission groups */}
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
            MATRIX → DataGrid accordion: tag quyền readonly + quyền con
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              minWidth: 230 + PERMISSION_TAGS.length * 82 + 88 + 82,
            }}
          >
            {/* header row */}
            <div style={block(C.btn, { padding: 6, fontWeight: 700 })}>
              Module
            </div>
            {PERMISSION_TAGS.map((tag) => (
              <div
                key={tag}
                style={block(C.btn, {
                  padding: 6,
                  justifyContent: 'center',
                  fontWeight: 700,
                })}
              >
                {tag}
              </div>
            ))}
            <div
              style={block(C.btn, {
                padding: 6,
                justifyContent: 'center',
                fontWeight: 700,
              })}
            >
              Đã chọn
            </div>
            <div
              style={block(C.btn, {
                padding: 6,
                justifyContent: 'center',
                fontWeight: 700,
              })}
            >
              Action
            </div>
            {/* body rows + expandable detail rows */}
            {PERMISSION_MODULES.map((module) => (
              <ModuleRow
                key={module.code}
                expanded={expandedModules.includes(module.code)}
                module={module}
                onToggle={() => toggleModule(module.code)}
              />
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

      {isEditRoleOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            zIndex: 50,
          }}
          onClick={() => setIsEditRoleOpen(false)}
        >
          <div
            style={block('rgba(255,255,255,0.98)', {
              width: 420,
              maxWidth: '100%',
              flexDirection: 'column',
              gap: 8,
              padding: 12,
            })}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={block(C.header, {
                padding: 8,
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <span>DIALOG HEADER → Chỉnh sửa vai trò</span>
              <span
                style={block(C.btn, { padding: '2px 8px', cursor: 'pointer' })}
                onClick={() => setIsEditRoleOpen(false)}
              >
                Đóng
              </span>
            </div>
            <div
              style={block(C.leaf, {
                padding: 8,
                flexDirection: 'column',
                gap: 6,
              })}
            >
              <div style={block(C.btn, { padding: 8 })}>
                Tên vai trò * (Input)
              </div>
              <div
                style={block(C.btn, {
                  padding: 8,
                  minHeight: 72,
                  alignItems: 'flex-start',
                })}
              >
                Mô tả (Textarea)
              </div>
            </div>
            <div
              style={block(C.action, {
                padding: 8,
                justifyContent: 'flex-end',
                gap: 8,
              })}
            >
              <div
                style={block(C.btn, { padding: '6px 14px', cursor: 'pointer' })}
                onClick={() => setIsEditRoleOpen(false)}
              >
                Hủy
              </div>
              <div
                style={block(C.btnPrimary, {
                  padding: '6px 14px',
                  cursor: 'pointer',
                })}
                onClick={() => setIsEditRoleOpen(false)}
              >
                Lưu thông tin
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleRow({
  expanded,
  module,
  onToggle,
}: {
  expanded: boolean;
  module: PermissionModule;
  onToggle: () => void;
}) {
  const counts = countModulePermissions(module);

  return (
    <>
      <div
        style={block(C.leaf, {
          padding: 6,
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        })}
        onClick={onToggle}
      >
        <span>{expanded ? 'v' : '>'}</span>
        <span>{module.name}</span>
        <span style={{ fontWeight: 400, opacity: 0.65 }}>{module.note}</span>
      </div>
      {PERMISSION_TAGS.map((tag) => (
        <div
          key={tag}
          style={block(C.leaf, {
            padding: 6,
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          <SummaryCheckbox state={getTagSummary(module, tag)} />
        </div>
      ))}
      <div
        style={block(C.leaf, {
          padding: 6,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        {counts.selected}/{counts.total}
      </div>
      <div
        style={block(C.leaf, {
          padding: 6,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <span
          style={block(C.btn, {
            padding: '2px 8px',
            cursor: 'pointer',
          })}
          onClick={onToggle}
        >
          {expanded ? 'Đóng' : 'Mở'}
        </span>
      </div>
      {expanded && (
        <div
          style={block('rgba(59,130,246,0.05)', {
            gridColumn: '1 / -1',
            flexDirection: 'column',
            gap: 8,
            padding: 8,
          })}
        >
          <div style={{ opacity: 0.7 }}>
            DETAIL → grouped checkbox panel cho {module.name}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 8,
            }}
          >
            {module.groups.map((group) => (
              <PermissionGroupBlock key={group.name} group={group} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function PermissionGroupBlock({ group }: { group: PermissionGroup }) {
  const selected = countGroupPermissions(group);
  const hasSensitive = group.permissions.some(
    (permission) => permission.sensitive,
  );

  return (
    <div
      style={block(C.leaf, {
        flexDirection: 'column',
        gap: 6,
        padding: 8,
      })}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span>{group.name}</span>
        <span style={block(C.btn, { padding: '1px 6px' })}>
          {selected}/{group.permissions.length}
        </span>
      </div>
      {hasSensitive && (
        <div style={block(C.action, { padding: '2px 6px' })}>
          Có quyền nhạy cảm (Badge)
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {group.permissions.map((permission) => (
          <div
            key={permission.name}
            style={block(C.btn, {
              padding: 6,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            })}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                minWidth: 0,
              }}
            >
              <span>{permission.name}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {permission.tags.map((tag) => (
                  <span key={tag} style={block(C.leaf, { padding: '1px 5px' })}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              {permission.sensitive && (
                <span style={block(C.action, { padding: '1px 5px' })}>
                  nhạy cảm
                </span>
              )}
              <PermissionCheckbox on={permission.selected} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
