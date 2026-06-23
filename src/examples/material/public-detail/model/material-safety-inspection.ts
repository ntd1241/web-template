export type MaterialSafetyInspectionResult = 'passed' | 'failed';

export interface MaterialSafetyInspectionItem {
  id: string;
  inspectedAt: string;
  inspector: string;
  passedCriteria: number;
  totalCriteria: number;
  comment: string;
  result: MaterialSafetyInspectionResult;
  resultLabel: string;
}
