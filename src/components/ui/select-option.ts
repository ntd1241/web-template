import type { ReactNode } from 'react';

/** Shared option contract for all data-driven single and multi selects. */
export interface SelectOption<T = unknown> {
  value: string;
  label: ReactNode;
  searchableText?: string;
  group?: string;
  data?: T;
  disabled?: boolean;
}
