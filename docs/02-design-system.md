# Design System

This document owns shared UX decisions for Vietnamese admin applications. Component APIs belong in
[`docs/components/`](./components/); UI implementation flow belongs in
[`workflows/implement-ui.md`](./workflows/implement-ui.md).

## Product Character

- Dense, operational, and optimized for repeated desktop work.
- Table-first when users compare or act on many records.
- Quiet visual hierarchy with limited ornament and predictable placement.
- Vietnamese copy that is direct, specific, and consistent with domain vocabulary.
- Efficient at 1366px while making useful use of wider 1920px screens.

## Token Ownership

- Semantic colors, surfaces, borders, foregrounds, and spacing live in `src/styles/globals.css` and
  shared component defaults.
- Feature pages consume semantic classes; they do not hardcode hex colors or recreate shared styling.
- Status colors must preserve meaning across tables, badges, alerts, and forms.
- Shared visual changes are made once at the token or component root.

Use the live tokens as source of truth. This document does not duplicate a color palette that can drift.

## Density And Layout

- Prefer compact controls and spacing without reducing readability or target size.
- Page headers contain title, essential context, and primary actions; avoid marketing hero treatment.
- List pages prioritize filters, table, pagination, and bulk or row actions.
- Forms group related fields, use a predictable reading order, and avoid decorative containers.
- Dialog width follows task complexity; long or high-context workflows become a page or side panel.
- Fixed-format regions such as tables and toolbars use stable dimensions to prevent layout shift.

## Tables

- Use `DataGrid` for paginated management lists and the table builder for columns.
- Keep headers sticky when the table scrolls.
- Give action columns stable width and position when horizontal scrolling is possible.
- Expose loading, empty, error, and pagination behavior as applicable.
- Align numeric values for scanning and use Vietnamese formatting utilities.
- Keep row actions discoverable without flooding every row with text buttons.

Concrete APIs: [`components/data-grid.md`](./components/data-grid.md).

## Forms And Dialogs

- Labels remain visible; placeholders are examples or hints, not replacements for labels.
- Required state and Vietnamese validation messages are explicit.
- Default to a compact two-column desktop grid and one column on narrow screens.
- Place destructive actions away from the primary submit action.
- Disable duplicate submit while pending and keep user input on recoverable failure.
- Create/edit dialogs reset values each time their mode or selected record changes.

Builder workflow: [`builders/form-dialog.md`](./builders/form-dialog.md). Control APIs:
[`components/forms.md`](./components/forms.md).

## Actions And Feedback

- One clear primary action per task region.
- Use icon-only controls only for familiar actions and give them accessible labels or tooltips.
- Confirm destructive or difficult-to-reverse operations.
- Show progress near the initiating action when practical.
- Success feedback is concise; failure feedback explains the next useful action.
- Empty states explain what is absent and offer an action only when one is available.

## Navigation And Interaction

- Keep navigation placement stable across features.
- Preserve keyboard order, visible focus, Escape behavior, and focus return for overlays.
- Avoid surprise context menus or drag-and-drop as the only interaction path.
- The owning content region scrolls; avoid competing nested scroll containers.
- Responsive behavior preserves the workflow, not every desktop decoration.

## Accessibility

- Text and status indicators meet practical contrast requirements.
- Meaning is never communicated by color alone.
- Inputs, buttons, and icon controls have accessible names.
- Validation and async errors are announced or placed where assistive technology can associate them.
- Touch targets remain usable even in dense layouts.

## Shared Change Checklist

- Does the decision belong to a token or shared component rather than a page?
- Does it remain usable at 1366px and on the supported narrow layout?
- Are Vietnamese defaults correct without per-page translation props?
- Are loading, empty, error, disabled, and keyboard states coherent?
- Is the component guide updated without copying its API back into this document?
