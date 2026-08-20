const spec = {
  entity: 'ContractPaymentPeriodChartPoint',
  modelImport: '../model/contract-chart',
  componentName: 'ContractPaymentPeriodChart',
  chartKind: 'bar',
  xField: 'periodLabel',
  series: [
    {
      key: 'paidAmount',
      label: 'Đã thu',
      color: 'var(--admin-success-dot)',
      stackId: 'receivable',
    },
    {
      key: 'currentOutstanding',
      label: 'Còn phải thu',
      color: 'var(--admin-amber-primary)',
      stackId: 'receivable',
    },
    {
      key: 'overdueOutstanding',
      label: 'Quá hạn',
      color: 'var(--admin-red-primary)',
      stackId: 'receivable',
    },
  ],
  includeLegend: true,
  tooltipStyle: 'line',
  heightClassName: 'h-72 w-full aspect-auto',
};

export default spec;
