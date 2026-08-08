const spec = {
  entity: 'MetricPoint',
  modelImport: '../metric-point',
  componentName: 'MetricChart',
  chartKind: 'composed',
  xField: 'month',
  series: [
    { key: 'total', label: 'Tổng', color: 'var(--admin-primary)', role: 'bar' },
    {
      key: 'target',
      label: 'Mục tiêu',
      color: 'var(--admin-amber-primary)',
      role: 'line',
      dash: '5 5',
    },
  ],
  includeLegend: true,
  interactive: true,
  tooltipStyle: 'emphasis',
};

export default spec;
