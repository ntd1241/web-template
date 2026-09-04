/**
 * Calculates the width needed by an icon-only action column in a dense table.
 * The formula mirrors the shared table spacing: 28px buttons, 4px gaps, and
 * 20px of horizontal cell padding.
 */
export function getDataGridActionsColumnSize(actionCount: number): number {
  const count = Number.isFinite(actionCount)
    ? Math.max(1, Math.floor(actionCount))
    : 1;

  return count * 28 + Math.max(0, count - 1) * 4 + 20;
}
