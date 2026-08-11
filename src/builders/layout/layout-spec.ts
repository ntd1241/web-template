import { z } from 'zod';
import {
  layoutAreaHeightValues,
  layoutAreaSizeOptions,
  layoutAreaSizeValues,
} from './layout-area-size-options';

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;

const identifier = z.string().regex(IDENTIFIER, 'phải là một định danh hợp lệ');

const sizeValue = z.enum(layoutAreaSizeValues);
const heightValue = z.enum(layoutAreaHeightValues);

const defaultsSchema = z.object({
  navigationSize: sizeValue.default('md'),
  navigationMinSize: sizeValue.default('sm'),
  navigationMaxSize: sizeValue.default('xl'),
  navigationHeight: heightValue.default('fit'),
  contentHeight: heightValue.default('fit'),
  navigationResizable: z.boolean().default(false),
});

const DEFAULT_LAYOUT_SPEC_DEFAULTS = {
  navigationSize: 'md',
  navigationMinSize: 'sm',
  navigationMaxSize: 'xl',
  navigationHeight: 'fit',
  contentHeight: 'fit',
  navigationResizable: false,
} as const;

export const layoutSpecSchema = z
  .object({
    componentName: identifier,
    specPath: z.string().optional(),
    defaults: defaultsSchema.default(DEFAULT_LAYOUT_SPEC_DEFAULTS),
  })
  .superRefine((spec, ctx) => {
    const minWidth = layoutAreaSizeOptions.find(
      (option) => option.value === spec.defaults.navigationMinSize,
    )?.widthRem;
    const maxWidth = layoutAreaSizeOptions.find(
      (option) => option.value === spec.defaults.navigationMaxSize,
    )?.widthRem;

    if (
      minWidth !== undefined &&
      maxWidth !== undefined &&
      minWidth > maxWidth
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'navigationMinSize không được lớn hơn navigationMaxSize',
        path: ['defaults', 'navigationMinSize'],
      });
    }
  });

export type LayoutSpec = z.input<typeof layoutSpecSchema>;
export type ResolvedLayoutSpec = z.output<typeof layoutSpecSchema>;
