import {
  chartSpecSchema,
  type ChartSeriesSpec,
  type ChartSpec,
  type ResolvedChartSpec,
} from './chart-spec';

function quote(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function banner(specPath?: string): string {
  const source = specPath ? ` from \`${specPath}\`` : '';
  return `/**
 * Scaffolded by chart-builder${source}. Run \`npm run gen:chart\` — do NOT hand-write this file.
 * You own this file now — wire data and callbacks to screen logic or override the presentation.
 * To change chart kind, series, or config, edit the spec and re-gen to a scratch path first.
 */`;
}

function chartImports(spec: ResolvedChartSpec): string[] {
  const imports = new Set<string>();
  const add = (...names: string[]) =>
    names.forEach((name) => imports.add(name));

  switch (spec.chartKind) {
    case 'line':
      if (spec.showGrid) add('CartesianGrid');
      add('Line', 'LineChart', 'XAxis', 'YAxis');
      break;
    case 'area':
      if (spec.showGrid) add('CartesianGrid');
      add('Area', 'AreaChart', 'XAxis', 'YAxis');
      break;
    case 'bar':
      if (spec.showGrid) add('CartesianGrid');
      add('Bar', 'BarChart', 'XAxis', 'YAxis');
      break;
    case 'composed':
      if (spec.showGrid) add('CartesianGrid');
      add('Area', 'Bar', 'ComposedChart', 'Line', 'XAxis', 'YAxis');
      break;
    case 'pie':
    case 'donut':
      add('Cell', 'Pie', 'PieChart');
      break;
    case 'radial':
      add('PolarAngleAxis', 'RadialBar', 'RadialBarChart');
      break;
    case 'radar':
      add(
        'PolarAngleAxis',
        'PolarGrid',
        'PolarRadiusAxis',
        'Radar',
        'RadarChart',
      );
      break;
    case 'scatter':
      if (spec.showGrid) add('CartesianGrid');
      add('Scatter', 'ScatterChart', 'XAxis', 'YAxis', 'ZAxis');
      break;
    case 'treemap':
      add('Treemap');
      break;
    case 'funnel':
      add('Cell', 'Funnel', 'FunnelChart', 'LabelList');
      break;
  }

  return [...imports].sort();
}

function emitImports(spec: ResolvedChartSpec): string {
  const chartUi = ['ChartContainer', 'ChartTooltipStyleProvider'];
  if (spec.includeTooltip && spec.chartKind !== 'treemap') {
    chartUi.push('ChartTooltip', 'ChartTooltipContent');
  }
  if (spec.includeLegend && spec.chartKind !== 'treemap') {
    chartUi.push('ChartLegend', 'ChartLegendContent');
  }

  const lines = [
    `import { ${chartImports(spec).join(', ')} } from 'recharts';`,
    "import { cn } from '@/lib/utils';",
    `import {\n${chartUi.map((name) => `  ${name},`).join('\n')}\n  type ChartConfig,\n} from '@/components/ui/chart';`,
    `import type { ${spec.entity} } from ${quote(spec.modelImport)};`,
  ];

  return lines.join('\n');
}

function emitConfig(spec: ResolvedChartSpec): string {
  const entries = spec.series
    .map(
      (series) =>
        `  ${series.key}: { label: ${quote(series.label)}, color: ${quote(series.color)} },`,
    )
    .join('\n');

  return `const chartConfig = {\n${entries}\n} satisfies ChartConfig;`;
}

function emitTooltip(spec: ResolvedChartSpec): string {
  if (!spec.includeTooltip || spec.chartKind === 'treemap') return '';
  return '          <ChartTooltip content={<ChartTooltipContent />} />';
}

function emitLegend(spec: ResolvedChartSpec): string {
  if (!spec.includeLegend || spec.chartKind === 'treemap') return '';
  return '          <ChartLegend content={<ChartLegendContent />} />';
}

function emitInteractive(spec: ResolvedChartSpec): string {
  if (!spec.interactive) return '';
  return ` onClick={(_, index) => onItemClick?.(${spec.dataProp}[index], index)}`;
}

function emitGrid(spec: ResolvedChartSpec, horizontal = false): string {
  if (!spec.showGrid) return '';
  return horizontal
    ? '          <CartesianGrid horizontal={false} />'
    : '          <CartesianGrid vertical={false} />';
}

function emitAxes(spec: ResolvedChartSpec): string {
  return [
    `          <XAxis dataKey=${quote(spec.xField)} tickLine={false} axisLine={false} />`,
    '          <YAxis tickLine={false} axisLine={false} width={32} />',
  ].join('\n');
}

function emitSeries(
  spec: ResolvedChartSpec,
  series: ChartSeriesSpec,
  seriesIndex: number,
): string {
  const common = `dataKey=${quote(series.key)} ${series.stackId ? `stackId=${quote(series.stackId)} ` : ''}`;
  const color = `var(--color-${series.key})`;
  const hasSeriesAbove = Boolean(
    series.stackId &&
    spec.series
      .slice(seriesIndex + 1)
      .some((item) => item.stackId === series.stackId),
  );

  if (
    spec.chartKind === 'area' ||
    (spec.chartKind === 'composed' && series.role === 'area')
  ) {
    return [
      '          <Area',
      `            ${common.trim()}`,
      '            type="monotone"',
      `            stroke=${quote(color)}`,
      `            fill=${quote(color)}`,
      '            fillOpacity={0.24}',
      '          />',
    ].join('\n');
  }

  if (
    spec.chartKind === 'bar' ||
    (spec.chartKind === 'composed' && series.role === 'bar')
  ) {
    return [
      '          <Bar',
      `            ${common.trim()}`,
      `            fill=${quote(color)}`,
      `            radius={${hasSeriesAbove ? '[0, 0, 0, 0]' : '[4, 4, 0, 0]'}}`,
      '          />',
    ].join('\n');
  }

  return [
    '          <Line',
    `            ${common.trim()}`,
    '            type="monotone"',
    `            stroke=${quote(color)}`,
    '            strokeWidth={2}',
    series.dash ? `            strokeDasharray=${quote(series.dash)}` : '',
    '          />',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitCartesianChart(spec: ResolvedChartSpec): string {
  const Chart =
    spec.chartKind === 'line'
      ? 'LineChart'
      : spec.chartKind === 'area'
        ? 'AreaChart'
        : spec.chartKind === 'bar'
          ? 'BarChart'
          : 'ComposedChart';

  const series = spec.series
    .map((item, index) => emitSeries(spec, item, index))
    .join('\n');
  return [
    `        <${Chart} data={${spec.dataProp}}${emitInteractive(spec)}>`,
    emitGrid(spec),
    emitAxes(spec),
    emitTooltip(spec),
    emitLegend(spec),
    series,
    `        </${Chart}>`,
  ]
    .filter(Boolean)
    .join('\n');
}

function emitPieChart(spec: ResolvedChartSpec): string {
  const innerRadius = spec.chartKind === 'donut' ? 'innerRadius={52}' : '';
  const firstSeries = spec.series[0];

  return [
    '        <PieChart>',
    emitTooltip(spec),
    emitLegend(spec),
    `          <Pie data={${spec.dataProp}} dataKey=${quote(spec.valueField)} nameKey=${quote(spec.nameField)} outerRadius={84} ${innerRadius}${emitInteractive(spec)}>`,
    `            {${spec.dataProp}.map((entry, index) => (`,
    `              <Cell key={entry.${spec.nameField}} fill={entry.fill ?? ${quote(`var(--color-${firstSeries.key})`)}} />`,
    '            ))}',
    '          </Pie>',
    '        </PieChart>',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitRadialChart(spec: ResolvedChartSpec): string {
  const series = spec.series[0];
  return [
    `        <RadialBarChart innerRadius="60%" outerRadius="90%" startAngle={90} endAngle={-270} data={${spec.dataProp}}${emitInteractive(spec)}>`,
    '          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />',
    emitTooltip(spec),
    emitLegend(spec),
    `          <RadialBar dataKey=${quote(spec.valueField)} background={{ fill: 'var(--admin-neutral-100)' }} cornerRadius={8} fill=${quote(`var(--color-${series.key})`)} />`,
    '        </RadialBarChart>',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitRadarChart(spec: ResolvedChartSpec): string {
  const series = spec.series
    .map(
      (item) =>
        `          <Radar name=${quote(item.label)} dataKey=${quote(item.key)} stroke=${quote(`var(--color-${item.key})`)} fill=${quote(`var(--color-${item.key})`)} fillOpacity={0.24} />`,
    )
    .join('\n');

  return [
    `        <RadarChart data={${spec.dataProp}} outerRadius="72%"${emitInteractive(spec)}>`,
    '          <PolarGrid />',
    `          <PolarAngleAxis dataKey=${quote(spec.xField)} tickLine={false} />`,
    '          <PolarRadiusAxis angle={30} domain={[0, 100]} />',
    emitTooltip(spec),
    emitLegend(spec),
    series,
    '        </RadarChart>',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitScatterChart(spec: ResolvedChartSpec): string {
  const series = spec.series
    .map(
      (item) =>
        `          <Scatter name=${quote(item.label)} data={${spec.dataProp}} fill=${quote(`var(--color-${item.key})`)} />`,
    )
    .join('\n');

  return [
    `        <ScatterChart${emitInteractive(spec)}>`,
    emitGrid(spec),
    `          <XAxis type="number" dataKey=${quote(spec.xField)} tickLine={false} axisLine={false} />`,
    `          <YAxis type="number" dataKey=${quote(spec.yField)} tickLine={false} axisLine={false} />`,
    `          <ZAxis type="number" dataKey=${quote(spec.sizeField!)} range={[60, 240]} />`,
    emitTooltip(spec),
    emitLegend(spec),
    series,
    '        </ScatterChart>',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitTreemap(spec: ResolvedChartSpec): string {
  return [
    `        <Treemap data={${spec.dataProp}} dataKey=${quote(spec.valueField)} nameKey=${quote(spec.nameField)} stroke="var(--admin-surface)" aspectRatio={4 / 3}${emitInteractive(spec)} />`,
  ].join('\n');
}

function emitFunnel(spec: ResolvedChartSpec): string {
  return [
    `        <FunnelChart${emitInteractive(spec)}>`,
    emitTooltip(spec),
    emitLegend(spec),
    `          <Funnel dataKey=${quote(spec.valueField)} data={${spec.dataProp}} isAnimationActive>`,
    `            {${spec.dataProp}.map((entry, index) => (`,
    `              <Cell key={entry.${spec.nameField}} fill={entry.fill ?? ${quote(`var(--color-${spec.series[0].key})`)}} />`,
    '            ))}',
    `            <LabelList position="right" fill="var(--foreground)" stroke="none" dataKey=${quote(spec.nameField)} />`,
    '          </Funnel>',
    '        </FunnelChart>',
  ]
    .filter(Boolean)
    .join('\n');
}

function emitChartBody(spec: ResolvedChartSpec): string {
  switch (spec.chartKind) {
    case 'line':
    case 'area':
    case 'bar':
    case 'composed':
      return emitCartesianChart(spec);
    case 'pie':
    case 'donut':
      return emitPieChart(spec);
    case 'radial':
      return emitRadialChart(spec);
    case 'radar':
      return emitRadarChart(spec);
    case 'scatter':
      return emitScatterChart(spec);
    case 'treemap':
      return emitTreemap(spec);
    case 'funnel':
      return emitFunnel(spec);
  }
}

export function buildChartModule(input: ChartSpec): string {
  const spec = chartSpecSchema.parse(input);
  const clickProp = spec.interactive
    ? `\n  onItemClick?: (item: ${spec.entity}, index: number) => void;`
    : '';
  const clickDestructure = spec.interactive ? ', onItemClick' : '';
  const providerStart = `<ChartTooltipStyleProvider style=${quote(spec.tooltipStyle)}>\n`;
  const providerEnd = '\n</ChartTooltipStyleProvider>';
  const chartBody = emitChartBody(spec).replace(
    /onItemClick\?\./g,
    'onItemClick?.',
  );

  return [
    banner(spec.specPath),
    emitImports(spec),
    '',
    emitConfig(spec),
    '',
    `export interface ${spec.componentName}Props {`,
    `  ${spec.dataProp}: ${spec.entity}[];`,
    '  className?: string;' + clickProp,
    '}',
    '',
    `export function ${spec.componentName}({ ${spec.dataProp}, className${clickDestructure} }: ${spec.componentName}Props) {`,
    '  return (',
    `    ${providerStart}`,
    `      <ChartContainer config={chartConfig} className={cn(${quote(spec.heightClassName)}, className)}>`,
    chartBody,
    '      </ChartContainer>',
    `    ${providerEnd}`,
    '  );',
    '}',
    '',
  ].join('\n');
}

export { emitConfig };
