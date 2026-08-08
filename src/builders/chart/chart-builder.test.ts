import { describe, expect, it } from 'vitest';
import { buildChartModule } from './chart-builder';
import { chartSpecSchema, type ChartSpec } from './chart-spec';

const baseSpec = {
  entity: 'MetricPoint',
  modelImport: '../metric-point',
  componentName: 'MetricChart',
  chartKind: 'line',
  xField: 'month',
  series: [
    { key: 'current', label: 'Hiện tại', color: 'var(--admin-primary)' },
    {
      key: 'target',
      label: 'Mục tiêu',
      color: 'var(--admin-amber-primary)',
      dash: '5 5',
    },
  ],
  includeLegend: true,
  interactive: true,
} satisfies ChartSpec;

describe('chart-builder', () => {
  it('emits a chart shell with config, tooltip, legend, and callback props', () => {
    const source = buildChartModule(baseSpec);

    expect(source).toContain('Scaffolded by chart-builder');
    expect(source).toContain('const chartConfig = {');
    expect(source).toContain('<LineChart data={data} onClick=');
    expect(source).toContain(
      '<ChartLegend content={<ChartLegendContent />} />',
    );
    expect(source).toContain(
      'onItemClick?: (item: MetricPoint, index: number) => void;',
    );
    expect(source).toContain("ChartTooltipStyleProvider style='default'");
  });

  it.each([
    ['area', '<AreaChart data={data} onClick='],
    ['bar', '<BarChart data={data} onClick='],
    ['composed', '<ComposedChart data={data} onClick='],
    ['pie', '<PieChart>'],
    ['donut', 'innerRadius={52}'],
    ['radial', '<RadialBarChart'],
    ['radar', '<RadarChart data={data}'],
    ['scatter', '<ScatterChart onClick='],
    ['treemap', '<Treemap data={data}'],
    ['funnel', '<FunnelChart onClick='],
  ] as const)('supports the %s chart branch', (chartKind, marker) => {
    const spec = {
      ...baseSpec,
      componentName: `${chartKind}Chart`,
      chartKind,
      series:
        chartKind === 'composed'
          ? [{ ...baseSpec.series[0], role: 'bar' as const }]
          : baseSpec.series,
      sizeField: chartKind === 'scatter' ? 'size' : undefined,
    } satisfies ChartSpec;

    expect(buildChartModule(spec)).toContain(marker);
  });

  it('rejects duplicate series and missing chart-specific fields', () => {
    expect(() =>
      chartSpecSchema.parse({
        ...baseSpec,
        series: [
          { key: 'same', label: 'Một', color: 'red' },
          { key: 'same', label: 'Hai', color: 'blue' },
        ],
      }),
    ).toThrow(/series key bị trùng/);

    expect(() =>
      chartSpecSchema.parse({
        ...baseSpec,
        chartKind: 'composed',
        series: [{ ...baseSpec.series[0], role: 'line' }],
      }),
    ).toThrow(/composed chart cần/);

    expect(() =>
      chartSpecSchema.parse({ ...baseSpec, chartKind: 'scatter' }),
    ).toThrow(/scatter chart cần/);
  });
});
