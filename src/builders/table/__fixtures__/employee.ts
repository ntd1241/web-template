/**
 * Minimal entity type for the table-builder golden fixture. Self-contained so the
 * generated golden typechecks without depending on `src/examples`.
 */
export interface Employee {
  id: string;
  name: string;
  email: string;
  salary: number;
  performance: number;
  startDate: string;
  status: 'active' | 'locked';
}
