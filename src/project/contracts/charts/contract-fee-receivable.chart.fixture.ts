const spec = {
  entity: 'ContractFeeReceivableChartPoint',
  modelImport: '../model/contract-chart',
  componentName: 'ContractFeeReceivableChart',
  chartKind: 'bar',
  xField: 'feeName',
  series: [
    {
      key: 'paidAmount',
      label: 'Đã thu',
      color: 'var(--admin-success-dot)',
      stackId: 'receivable',
    },
    {
      key: 'outstandingAmount',
      label: 'Còn phải thu',
      color: 'var(--admin-amber-primary)',
      stackId: 'receivable',
    },
  ],
  includeLegend: true,
  tooltipStyle: 'line',
  heightClassName: 'h-72 w-full aspect-auto',
};

export default spec;
