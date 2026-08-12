import { z } from 'zod';
import {
  identifierSchema,
  tooltipStyleSchema,
} from '../shared/schema-primitives';

const identifier = identifierSchema;

export const tooltipSpecSchema = z.object({
  componentName: identifier,
  specPath: z.string().optional(),
  defaultStyle: tooltipStyleSchema.default('default'),
  hideLabel: z.boolean().default(false),
  hideIndicator: z.boolean().default(false),
  className: z.string().optional(),
  includeProvider: z.boolean().default(true),
});

export type TooltipSpec = z.input<typeof tooltipSpecSchema>;
export type ResolvedTooltipSpec = z.output<typeof tooltipSpecSchema>;
