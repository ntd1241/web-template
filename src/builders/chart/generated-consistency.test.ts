import { describe, expect, it } from 'vitest';
import { buildChartModule } from './chart-builder';

describe('chart-builder generated consistency', () => {
  it('keeps generated output marked as scaffold-and-own', () => {
    const generated = buildChartModule({
      entity: 'MetricPoint',
      modelImport: '../metric-point',
      componentName: 'MetricChart',
      chartKind: 'bar',
      series: [{ key: 'total', label: 'Tổng', color: 'var(--admin-primary)' }],
    });

    expect(generated).toContain('Scaffolded by chart-builder');
    expect(generated).toContain('ChartContainer');
    expect(generated).not.toContain(': any');
  });
});
