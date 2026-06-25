import type { SpecOption } from './spec-definition';

export type SpecValueSetKind = 'generic' | 'color';

export const SPEC_VALUE_SET_KIND_LABELS: Record<SpecValueSetKind, string> = {
  generic: 'Chung',
  color: 'Màu sắc',
};

export interface SpecValueSet {
  id: string;
  code: string;
  name: string;
  kind: SpecValueSetKind;
  description?: string;
  options: SpecOption[];
  isActive: boolean;
}
