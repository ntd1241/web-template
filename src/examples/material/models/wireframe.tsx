/**
 * GREYBOX (Level 1) — Material Model Spec Editor redesign.
 *
 * Dev-only block-layout. KHÔNG đụng UI thật (`components/model-spec-editor.tsx`).
 * Mục tiêu: chốt bố cục "list 3 cột + side drawer cấu hình" thay cho mega-table
 * scroll ngang hiện tại, và tách "Value Sets" thành tab riêng.
 *
 * Chỉ inline-style, không design-system, borderRadius 0 = bản nháp.
 */
import { useEffect, useState } from 'react';

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

const C = {
  header: 'rgba(99,102,241,0.14)',
  tabs: 'rgba(245,158,11,0.16)',
  toolbar: 'rgba(16,185,129,0.14)',
  list: 'rgba(59,130,246,0.10)',
  add: 'rgba(59,130,246,0.18)',
  drawer: 'rgba(236,72,153,0.12)',
  footer: 'rgba(148,163,184,0.18)',
};

export function MaterialModelSpecWireframe() {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [tab, setTab] = useState<'specs' | 'valuesets'>('specs');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 8,
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      {/* PAGE HEADER — định danh mẫu */}
      <div style={block(C.header, { flexDirection: 'column', gap: 4 })}>
        <div>
          PAGE HEADER → tên mẫu + mã + nhóm + ảnh (MaterialModelForm header)
        </div>
        <div style={{ fontWeight: 400, opacity: 0.7 }}>
          breadcrumb · nút Lưu / Hủy ở FOOTER sticky dưới cùng
        </div>
      </div>

      {/* TABS — tách cấu trúc khỏi quản lý value */}
      <div style={block(C.tabs, { gap: 8, padding: 6 })}>
        <div
          style={block(tab === 'specs' ? '#fff' : 'transparent', {
            cursor: 'pointer',
            padding: '6px 12px',
          })}
          onClick={() => setTab('specs')}
        >
          {tab === 'specs' ? '▣' : '▢'} Thông số của mẫu
        </div>
        <div
          style={block(tab === 'valuesets' ? '#fff' : 'transparent', {
            cursor: 'pointer',
            padding: '6px 12px',
          })}
          onClick={() => setTab('valuesets')}
        >
          {tab === 'valuesets' ? '▣' : '▢'} Value Sets (bảng giá trị tái dùng)
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            font: '400 11px/1.4 ui-monospace',
            alignSelf: 'center',
            opacity: 0.6,
          }}
        >
          TabsList → @/components/ui/tabs
        </div>
      </div>

      {/* BODY */}
      {tab === 'specs' ? (
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flex: 1,
            minHeight: 0,
            gap: 8,
          }}
        >
          {/* MAIN — list 3 cột + add row */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minWidth: 0,
              gap: 8,
            }}
          >
            <div style={block(C.toolbar, { height: 44, alignItems: 'center' })}>
              SPEC LIST HEADER → cột: [Thông số] · [Nguồn giá trị] · [Cờ + ⚙]
            </div>
            <div
              style={block(C.list, {
                flex: 1,
                flexDirection: 'column',
                gap: 6,
                overflow: 'auto',
              })}
            >
              SPEC LIST → 3 cột, mỗi row 1 spec instance (Table/Card list)
              <div style={{ fontWeight: 400, opacity: 0.7 }}>
                ≈ 6 rows. Row trùng definition vẫn hợp lệ (Màu kính / Màu vỏ).
                Không còn scroll ngang — cấu hình sâu đẩy sang DRAWER →
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={block(C.drawer.replace('0.12', '0.25'), {
                  cursor: 'pointer',
                  width: 'fit-content',
                })}
                onClick={() => setDrawerOpen(true)}
              >
                (demo) click row bất kỳ → mở DRAWER cấu hình
              </div>
            </div>
            <div style={block(C.add, { height: 48, alignItems: 'center' })}>
              ADD SPEC ROW → + Thêm từ danh mục · + Thông số riêng (cho phép
              trùng definition)
            </div>
          </div>

          {/* DRAWER — cấu hình sâu per-row */}
          {drawerOpen &&
            (isMobile ? (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  zIndex: 50,
                }}
                onClick={() => setDrawerOpen(false)}
              >
                <div
                  style={block(C.drawer, {
                    width: 320,
                    height: '100%',
                    flexDirection: 'column',
                    gap: 6,
                  })}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DrawerBody onClose={() => setDrawerOpen(false)} />
                </div>
              </div>
            ) : (
              <div
                style={block(C.drawer, {
                  width: 340,
                  flexDirection: 'column',
                  gap: 6,
                })}
              >
                <DrawerBody onClose={() => setDrawerOpen(false)} />
              </div>
            ))}
        </div>
      ) : (
        /* VALUE SETS TAB */
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            gap: 8,
          }}
        >
          <div style={block(C.toolbar, { height: 44, alignItems: 'center' })}>
            VALUE SETS TOOLBAR → tìm + filter Kind (generic/color) + [+ Tạo bảng
            giá trị]
          </div>
          <div
            style={block(C.list, {
              flex: 1,
              flexDirection: 'column',
              overflow: 'auto',
            })}
          >
            VALUE SETS TABLE → cột: Tên/mã · Kind · Số option · Dùng bởi
            (spec/mẫu) · Trạng thái
            <div style={{ fontWeight: 400, opacity: 0.7, marginTop: 6 }}>
              ≈ 4 rows: Bảng màu cơ bản · Bảng màu nhuộm · Dung lượng · ... —
              row → mở OptionsEditor (code · label · swatch + bulk paste)
            </div>
          </div>
        </div>
      )}

      {/* FOOTER — actions sticky */}
      <div
        style={block(C.footer, {
          height: 52,
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
        })}
      >
        FOOTER (sticky) → Hủy · Lưu mẫu
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setIsMobile((v) => !v)}
          style={{ font: '600 11px ui-monospace' }}
        >
          toggle {isMobile ? 'desktop' : 'mobile'} view
        </button>
      </div>
    </div>
  );
}

function DrawerBody({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span>DRAWER → cấu hình spec instance (Sheet)</span>
        <div style={{ flex: 1 }} />
        <div
          style={{
            cursor: 'pointer',
            padding: '2px 8px',
            border: '1px solid rgba(0,0,0,0.3)',
          }}
          onClick={onClose}
        >
          ✕
        </div>
      </div>
      {[
        'labelOverride + partKey (vd: Màu kính / glass)',
        'selectionMode: Chọn 1 / Chọn nhiều (gate theo definition)',
        'value set picker (valueSetIdOverride)',
        'subset → chip toggle kéo từ value set đã chọn',
        'default value editor (theo effective mode + options)',
        'materialValueMode: khóa / vật tư nhập riêng · bắt buộc',
      ].map((label) => (
        <div key={label} style={block('#fff', { fontWeight: 400 })}>
          {label}
        </div>
      ))}
    </>
  );
}
