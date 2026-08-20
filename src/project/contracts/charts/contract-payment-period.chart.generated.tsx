/**
 * Scaffolded by chart-builder from `src/project/contracts/charts/contract-payment-period.chart.fixture.ts`. Run `npm run gen:chart` — do NOT hand-write this file.
 * You own this file now — wire data and callbacks to screen logic or override the presentation.
 * To change chart kind, series, or config, edit the spec and re-gen to a scratch path first.
 */
import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipStyleProvider,
  type ChartConfig,
} from '@/components/ui/chart';
import type { ContractPaymentPeriodChartPoint } from '../model/contract-chart';

const chartConfig = {
  paidAmount: { label: 'Đã thu', color: 'var(--admin-success-dot)' },
  currentOutstanding: {
    label: 'Còn phải thu',
    color: 'var(--admin-amber-primary)',
  },
  overdueOutstanding: { label: 'Quá hạn', color: 'var(--admin-red-primary)' },
} satisfies ChartConfig;

export interface ContractPaymentPeriodChartProps {
  data: ContractPaymentPeriodChartPoint[];
  className?: string;
  valueFormatter?: (value: number, name?: string) => ReactNode;
  axisValueFormatter?: (value: number) => string;
}

export function ContractPaymentPeriodChart({
  data,
  className,
  valueFormatter,
  axisValueFormatter,
}: ContractPaymentPeriodChartProps) {
  return (
    <ChartTooltipStyleProvider style="line">
      <ChartContainer
        config={chartConfig}
        className={cn('h-72 w-full aspect-auto', className)}
      >
        <BarChart data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="periodLabel"
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-22}
            textAnchor="end"
            height={58}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={88}
            tickFormatter={axisValueFormatter}
          />
          <ChartTooltip
            content={<ChartTooltipContent valueFormatter={valueFormatter} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="paidAmount"
            stackId="receivable"
            fill="var(--color-paidAmount)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="currentOutstanding"
            stackId="receivable"
            fill="var(--color-currentOutstanding)"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="overdueOutstanding"
            stackId="receivable"
            fill="var(--color-overdueOutstanding)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartTooltipStyleProvider>
  );
}
