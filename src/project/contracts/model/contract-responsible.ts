import type { ContractEmployeeOption } from './contract';

export interface ContractResponsibleEmployee extends ContractEmployeeOption {
  jobTitle: string;
  department: string;
  status: 'active' | 'inactive';
  defaultPermissionCodes: string[];
}

export interface ContractResponsiblePermissionDefinition {
  code: string;
  moduleCode: string;
  groupName: string;
  name: string;
  action: string;
  sensitive: boolean;
  sortOrder: number;
}

export interface ContractResponsibleAssignment {
  employeeId: string;
  assignedBy: string | null;
  createdAt: string;
  disabledPermissionCodes: string[];
}

export interface ContractResponsibleWorkspace {
  employees: ContractResponsibleEmployee[];
  assignments: ContractResponsibleAssignment[];
  permissionDefinitions: ContractResponsiblePermissionDefinition[];
}

export interface ContractResponsibleAssignmentInput {
  employeeId: string;
  disabledPermissionCodes: string[];
}
