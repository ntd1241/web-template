import type { Employee } from '../model/employee';
import { EmployeeIdentity } from './employee-identity';

export function EmployeeCell({ employee }: { employee: Employee }) {
  return <EmployeeIdentity employee={employee} />;
}
