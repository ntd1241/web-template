import { z } from 'zod';

const IDENTIFIER = /^[a-zA-Z_$][\w$]*$/;

const identifier = z.string().regex(IDENTIFIER, 'phải là một định danh hợp lệ');

const seriesSchema = z.object({
  key: identifier,
  label: z.string().min(1),
  color: z.string().min(1),
  role: z.enum(['line', 'area', 'bar']).default('line'),
  stackId: z.string().min(1).optional(),
  dash: z.string().min(1).optional(),
});

export const chartSpecSchema = z
  .object({
    /** Entity type used by the chart data prop. */
    entity: identifier,
    modelImport: z.string().min(1),
    componentName: identifier,
    specPath: z.string().optional(),
    chartKind: z.enum([
      'line',
      'area',
      'bar',
      'composed',
      'pie',
      'donut',
      'radial',
      'radar',
      'scatter',
      'treemap',
      'funnel',
    ]),
    dataProp: identifier.default('data'),
    xField: identifier.default('name'),
    yField: identifier.default('value'),
    nameField: identifier.default('name'),
    valueField: identifier.default('value'),
    sizeField: identifier.optional(),
    series: z.array(seriesSchema).min(1),
    includeTooltip: z.boolean().default(true),
    includeLegend: z.boolean().default(false),
    interactive: z.boolean().default(false),
    tooltipStyle: z
      .enum(['default', 'line', 'dashed', 'compact', 'emphasis'])
      .default('default'),
    heightClassName: z.string().min(1).default('h-64 w-full aspect-auto'),
    showGrid: z.boolean().default(true),
  })
  .superRefine((spec, ctx) => {
    const keys = new Set<string>();
    spec.series.forEach((series, index) => {
      if (keys.has(series.key)) {
        ctx.addIssue({
          code: 'custom',
          message: `series key bị trùng: ${series.key}`,
          path: ['series', index, 'key'],
        });
      }
      keys.add(series.key);
    });

    if (
      spec.chartKind === 'composed' &&
      !spec.series.some((series) => series.role !== 'line')
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'composed chart cần ít nhất một series bar hoặc area',
        path: ['series'],
      });
    }

    if (spec.chartKind === 'scatter' && !spec.sizeField) {
      ctx.addIssue({
        code: 'custom',
        message:
          'scatter chart cần khai báo sizeField để biểu diễn kích thước điểm',
        path: ['sizeField'],
      });
    }
  });

export type ChartSeriesSpec = z.infer<typeof seriesSchema>;
export type ChartSpec = z.input<typeof chartSpecSchema>;
export type ResolvedChartSpec = z.output<typeof chartSpecSchema>;
