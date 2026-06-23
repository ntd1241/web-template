export type MaterialRepairStatus =
  | 'completed_success'
  | 'in_progress'
  | 'completed_failed';

export interface MaterialRepairHistoryItem {
  id: string;
  title: string;
  status: MaterialRepairStatus;
  statusLabel: string;
  reportedAt: string;
  finishedAt?: string;
  expectedFinishedAt?: string;
  repairType: string;
  issue: string;
  technician: string;
  vendor: string;
  cost: string;
  downtime: string;
  result: string;
  nextAction: string;
}
