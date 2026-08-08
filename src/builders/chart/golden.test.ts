import { describe, expect, it } from 'vitest';
import { buildChartModule } from './chart-builder';

describe('chart-builder golden fixture', () => {
  it('reproduces a line chart scaffold', () => {
    expect(
      buildChartModule({
        entity: 'MetricPoint',
        modelImport: '../metric-point',
        componentName: 'MetricChart',
        chartKind: 'line',
        xField: 'month',
        series: [
          { key: 'current', label: 'Hiện tại', color: 'var(--admin-primary)' },
        ],
        includeLegend: false,
      }),
    ).toMatchSnapshot();
  });
});
