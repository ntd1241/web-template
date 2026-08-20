/**
 * Scaffolded by chart-builder from `src/project/contracts/charts/contract-fee-receivable.chart.fixture.ts`. Run `npm run gen:chart` — do NOT hand-write this file.
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
import type { ContractFeeReceivableChartPoint } from '../model/contract-chart';

const chartConfig = {
  paidAmount: { label: 'Đã thu', color: 'var(--admin-success-dot)' },
  outstandingAmount: {
    label: 'Còn phải thu',
    color: 'var(--admin-amber-primary)',
  },
} satisfies ChartConfig;

export interface ContractFeeReceivableChartProps {
  data: ContractFeeReceivableChartPoint[];
  className?: string;
  valueFormatter?: (value: number, name?: string) => ReactNode;
}

export function ContractFeeReceivableChart({
  data,
  className,
  valueFormatter,
}: ContractFeeReceivableChartProps) {
  return (
    <ChartTooltipStyleProvider style="line">
      <ChartContainer
        config={chartConfig}
        className={cn('h-72 w-full aspect-auto', className)}
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 16, right: 16 }}
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="feeName"
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <ChartTooltip
            content={<ChartTooltipContent valueFormatter={valueFormatter} />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar
            dataKey="paidAmount"
            stackId="receivable"
            fill="var(--color-paidAmount)"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="outstandingAmount"
            stackId="receivable"
            fill="var(--color-outstandingAmount)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </ChartTooltipStyleProvider>
  );
}
