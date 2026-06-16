---
name: block-layout
description: 'Greybox/blockframe a new page BEFORE detailed design — lay out the major regions (roles panel, toolbar, table, filter panel, footer, detail panel…) as labeled colored blocks using plain divs + inline styles only, then iterate on structure and responsive behavior. Use whenever the user wants to "lên layout / block layout / wireframe / khối to / dựng bố cục" for a screen before building real components, or asks to plan a page''s structure, or says things like "trang này gồm những phần nào", "chia block trước rồi design sau". Always reach for this when starting a brand-new admin page so the layout + responsive is agreed before any real component work. Not for editing already-built pages.'
---

# Block Layout (greyboxing)

## Why this exists

Jumping straight into real components locks in a layout before anyone has seen it, so structural mistakes (wrong split, panel on the wrong side, a region that collapses badly on a laptop) get discovered late and cost a rewrite. A **greybox** — every major region drawn as a plain labeled block — makes the page's skeleton and its responsive behavior visible in seconds, for almost no effort. Agree on the bones first; invest in detail second.

This is intentionally **lower fidelity than a wireframe**: no real text, no icons, no spacing polish. Just "what are the big regions, how are they arranged, and how do they reflow". Think of it as a throwaway sketch that happens to run in the browser.

## When to use

Use it at the **start of a new page** (e.g. a new screen under `src/examples/` or `src/features/`), before writing any real component. Skip it for small tweaks to an existing page — there's nothing to block out.

## Levels of fidelity

Greyboxing has up to three passes — go only as deep as the decision you're trying to make needs.

- **Level 1 — region greybox.** One block per major region with a `REGION → component` label. Answers "what are the big parts and how are they arranged / reflow". This is usually enough to get the layout signed off.
- **Level 2 — detailed blockframe.** Once the regions are approved, fill each region with its real internal structure as smaller blocks: every list item, every table row/column, every matrix cell/checkbox, every button. Use real-ish placeholder content (role names, module names, column headers, a checkbox grid with some cells "ticked") so the **density and structure** are visible. Still inline-styled, still no design system — leaf blocks share a pale `leaf` fill with a thin border. This is the pass that surfaces "the matrix is too wide", "the action bar needs a second button", "each role row needs a count".
- **Level 3 — interactive blockframe (optional, light).** When the decision is about *flow/affordances* (does this collapse, what does this button open, is the drawer the right place), wire just enough interaction with **local `useState` only** — no real data, no API, no design-system components. Keep it light: a collapsible region toggles open/closed, a button toggles a selected/expanded state, a "dialog/drawer" is a plain absolutely-positioned overlay `<div>` (still unstyled blocks) you can open and close. The goal is to *feel the interaction*, not to build it for real.

All levels live in the same `wireframe.tsx`; deepen it in place. Annotate leaves with the component only where it's not obvious (e.g. the whole matrix `→ DataGrid`), not on every cell.

**Go one level at a time and get sign-off before deepening** — don't jump straight to detail or interaction. The region structure is the expensive decision; lock it, then add detail, then (only if useful) interaction. When the user asks to block-layout a new page, build Level 1 and stop for approval; move to Level 2/3 only once they're happy with the previous level.

### Adding interaction at Level 3 (keep it minimal)

```tsx
const [openModule, setOpenModule] = useState<string | null>(null);
const [showDialog, setShowDialog] = useState(false);

// collapsible region: a header block toggles a body block
<div style={block(C.leaf, { cursor: 'pointer' })} onClick={() => setOpenModule(openModule === m ? null : m)}>
  {openModule === m ? '▾' : '▸'} {m}
</div>
{openModule === m && <div style={block(C.matrix, { ... })}>…rows…</div>}

// button opens a plain overlay "dialog" (not the Dialog component)
<div style={block(C.btn, { cursor: 'pointer' })} onClick={() => setShowDialog(true)}>+ Thêm vai trò</div>
{showDialog && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
       onClick={() => setShowDialog(false)}>
    <div style={block('#fff', { width: 360, flexDirection: 'column', gap: 8 })} onClick={(e) => e.stopPropagation()}>
      DIALOG → Dialog (form thêm vai trò)
      <div style={block(C.btnPrimary, { justifyContent: 'center', cursor: 'pointer' })} onClick={() => setShowDialog(false)}>Đóng</div>
    </div>
  </div>
)}
```

## The workflow

Default cadence: **Level 1 → sign-off → Level 2 → sign-off → (optional Level 3) → real components.** Build Level 1 first and stop for approval; don't jump ahead to detail, interaction, or real components.

1. **List the regions.** Name the big parts of the screen and, for each, the real component it will eventually become. Example for an employees screen: `SIDEBAR → MainLayout sidebar`, `TOOLBAR → search + Button`, `TABLE → DataGrid`, `FILTER PANEL → Card form`, `FOOTER → DataGridPagination`.
2. **Pick the layout primitive** for how those regions sit together: a flex row (sidebar | content), a flex column (toolbar / table / footer stacked), or a grid. Decide this consciously — it's the one thing the greybox must get right, because it transfers directly to the real JSX.
3. **Build the Level-1 greybox** (one block per region) as one self-contained `.tsx` page (see rules below).
4. **Verify in the browser** at the desktop widths this template targets (1366px and 1920px) and at a mobile width (~390px). Use the preview tools; resize and screenshot.
5. **Get sign-off** on the region structure and responsive behavior. **Pause here** — don't deepen until the user is happy with the regions.
6. **Deepen to Level 2 in place:** fill each region with its internal blocks (list items, table rows/columns, matrix cells/checkboxes, buttons) + placeholder content, so density and structure are visible.
7. **Verify again** and get sign-off on the detailed structure/density.
8. **(Optional) Level 3 — light interaction** with local `useState` (collapsible, button toggles, overlay dialog) when the flow/affordances need validating. Verify and sign off.
9. **Replace blocks one-by-one** with real components per `docs/06`. Keeping the greybox afterwards is encouraged — it's dev-only (excluded from the production build) and documents the intended layout/responsive decision. Treat it as a sketch, not the source of truth; delete it only if it drifts and causes confusion.

## How to build a block

Each region is a plain `<div>` styled **only with inline `style`** — no Tailwind classes, no `cn()`, no imported CSS, no `admin-*` tokens, no shared components. The point is that the greybox is independent of the design system and obviously *not* the final look, so nobody mistakes it for finished work and nobody has to wait on tokens/components to exist.

Rules for every block:

- **Distinct muted color per region**, with a thin solid border for separation. Keep fills translucent/pale so the label stays readable. **No rounded corners** (`borderRadius: 0`) — sharp boxes read as "sketch", not "component".
- **Label = REGION NAME + the real component** it becomes, e.g. `TABLE → DataGrid`. Optionally add a tiny note about responsive behavior, e.g. `(mobile: full width)`.
- **Approximate the real proportions** — give the sidebar its real-ish width, the table the bulk of the space, the toolbar a short fixed height. Rough is fine; the relative sizes are what matter.
- **No real data, no logic, no state.** Structure only. A count like "≈ 10 rows" as plain text inside the table block is enough.

A tiny local helper keeps it readable (this is a local style object, not external CSS — allowed):

```tsx
function block(color: string, style: React.CSSProperties = {}): React.CSSProperties {
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
// usage: <div style={block('rgba(59,130,246,0.12)', { flex: 1 })}>TABLE → DataGrid</div>
```

## Responsive in the same greybox

The greybox is also where you decide reflow. Drive it with a width breakpoint and restructure the blocks — this is far cheaper to try here than in real components.

- **Desktop (1366–1920, primary):** the full multi-region layout (e.g. sidebar | [toolbar / table / footer], with an optional filter panel docked right).
- **Mobile/tablet fallback:** collapse to a single column — sidebar becomes a hidden drawer (drop the block or shrink it to a thin bar), filter panel moves below or behind a "Lọc" block, table becomes full width.

Use `window.matchMedia`/a resize listener or a simple `useState` width toggle so you can flip between desktop and mobile in the preview. Annotate blocks that change (`FILTER → drawer on mobile`).

## Output location & route (render inside MainLayout)

The app already has `MainLayout` (real sidebar + topbar). Reuse it: the greybox blocks out only the **page content area**, which is easier to picture in context and transfers directly to the real page. So the greybox root fills the content area (`height: 100%`, `padding: 24`) — do NOT block out the app sidebar/topbar yourself unless you specifically need to redesign the shell.

Put the greybox under the screen's folder, e.g. `src/examples/<domain>/wireframe.tsx`, named export `XxxWireframe`. Register it **nested inside the `MainLayout` group** in the DEV-gated block of `src/examples/example-routes.tsx`:

```tsx
if (import.meta.env.DEV) {
  const RolePermissionsWireframe = lazy(() =>
    import('./role-permissions/wireframe').then((m) => ({ default: m.RolePermissionsWireframe })),
  );
  exampleRoutes = (
    <Route element={<MainLayout />}>
      {/* ...existing example routes... */}
      <Route path="/example/role-permissions/wireframe" element={
        <Suspense fallback={<ScreenLoader />}><RolePermissionsWireframe /></Suspense>
      } />
    </Route>
  );
}
```

Living in `src/examples/` behind `import.meta.env.DEV` means it's excluded from the production build (DCE) and vanishes when you delete the file.

**Make it reachable from the sidebar.** Add an entry in `src/config/menu.config.tsx` with a `wireframePath` (and a `path` once the real page exists). Pages that only have a `wireframePath` are hidden until the user flips the **"Block layout"** switch in the sidebar — that's the intended way to browse greyboxes.

## Full example (content-area greybox, inside MainLayout)

```tsx
export function RolePermissionsWireframe() {
  const isMobile = /* useState + resize listener: window.innerWidth < 768 */ false;
  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100%', gap: 8, padding: 24, boxSizing: 'border-box' }}>
      {/* ROLES PANEL — page content, not the app sidebar */}
      <div style={block('rgba(99,102,241,0.14)', { flexDirection: 'column', width: isMobile ? 'auto' : 260, height: isMobile ? 48 : 'auto' })}>
        {isMobile ? 'ROLES → Select/Drawer' : 'ROLES PANEL → role list (Card nav)'}
      </div>

      {/* MAIN COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 8, minWidth: 0, minHeight: 0 }}>
        <div style={block('rgba(16,185,129,0.14)', { height: 64 })}>
          MATRIX HEADER → role name + description + “unsaved” state
        </div>
        <div style={block('rgba(59,130,246,0.12)', { flex: 1, overflow: 'auto' })}>
          MATRIX → permission grid by module (Table + Checkbox)
        </div>
        <div style={block('rgba(236,72,153,0.14)', { height: 56, justifyContent: 'flex-end', position: 'sticky', bottom: 0 })}>
          ACTION BAR (sticky) → Reset · Save
        </div>
      </div>
    </div>
  );
}
```

## Checklist before handing off

- [ ] Every major region is a labeled block (name → real component).
- [ ] Inline styles only; no Tailwind/`cn()`/imported CSS/shared components.
- [ ] Distinct muted colors, thin borders, `borderRadius: 0`.
- [ ] Proportions roughly match intent; no real data/logic.
- [ ] Desktop layout verified at 1366px and 1920px; mobile fallback verified ~390px.
- [ ] Registered DEV-gated in `example-routes.tsx`; absent from production build.
- [ ] User has approved the structure before any real component work begins.
