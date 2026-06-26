/** Bảng kiểm định — mỗi bảng là một checklist tiêu chí. Mock-first, example-only. */
export interface InspectionCriterion {
  id: string;
  order: number;
  content: string;
}

export interface InspectionTable {
  id: string;
  code: string;
  name: string;
  description?: string;
  criteria: InspectionCriterion[];
}
