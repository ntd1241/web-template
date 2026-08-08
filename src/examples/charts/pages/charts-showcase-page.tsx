import { useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';

type ChartCategory =
  | 'Line & Area'
  | 'Bar & Combo'
  | 'Pie & Radial'
  | 'Radar & Scatter'
  | 'Hierarchy';

type ChartCardProps = {
  id: string;
  category: ChartCategory;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
};

const COLORS = {
  primary: 'var(--admin-primary)',
  blue: 'var(--admin-blue-primary)',
  green: 'var(--admin-success-dot)',
  amber: 'var(--admin-amber-primary)',
  violet: 'var(--admin-violet-primary)',
  red: 'var(--admin-red-primary)',
};

const monthlyTrend = [
  { month: 'T1', inbound: 128, outbound: 92, target: 110 },
  { month: 'T2', inbound: 146, outbound: 108, target: 118 },
  { month: 'T3', inbound: 132, outbound: 116, target: 126 },
  { month: 'T4', inbound: 178, outbound: 128, target: 134 },
  { month: 'T5', inbound: 164, outbound: 142, target: 142 },
  { month: 'T6', inbound: 196, outbound: 158, target: 150 },
];

const weeklyUsage = [
  { day: 'T2', internal: 42, external: 28 },
  { day: 'T3', internal: 56, external: 34 },
  { day: 'T4', internal: 48, external: 41 },
  { day: 'T5', internal: 72, external: 36 },
  { day: 'T6', internal: 64, external: 52 },
  { day: 'T7', internal: 38, external: 24 },
  { day: 'CN', internal: 22, external: 18 },
];

const categoryMix = [
  { name: 'Kiểm định', value: 42 },
  { name: 'Kiểm tra', value: 28 },
  { name: 'CCDC', value: 18 },
  { name: 'Khác', value: 12 },
];

const performance = [
  { subject: 'Độ phủ', current: 86, target: 72 },
  { subject: 'Tồn kho', current: 74, target: 80 },
  { subject: 'Bảo trì', current: 92, target: 78 },
  { subject: 'Kiểm định', current: 68, target: 75 },
  { subject: 'Sẵn sàng', current: 88, target: 82 },
];

const warehouseBlocks = [
  { name: 'Kho miền Bắc', size: 38, fill: COLORS.primary },
  { name: 'Kho miền Trung', size: 27, fill: COLORS.blue },
  { name: 'Kho miền Nam', size: 22, fill: COLORS.green },
  { name: 'Kho dự phòng', size: 13, fill: COLORS.amber },
];

const lineConfig = {
  inbound: { label: 'Nhập kho', color: COLORS.primary },
  outbound: { label: 'Xuất kho', color: COLORS.green },
  target: { label: 'Mục tiêu', color: COLORS.amber },
} satisfies ChartConfig;

const usageConfig = {
  internal: { label: 'Nội bộ', color: COLORS.primary },
  external: { label: 'Bên ngoài', color: COLORS.violet },
} satisfies ChartConfig;

const performanceConfig = {
  current: { label: 'Hiện tại', color: COLORS.primary },
  target: { label: 'Mục tiêu', color: COLORS.amber },
} satisfies ChartConfig;

const pieConfig = {
  value: { label: 'Tỷ trọng', color: COLORS.primary },
} satisfies ChartConfig;

const chartCatalog: Array<{
  id: string;
  title: string;
  category: ChartCategory;
}> = [
  { id: 'line-single', title: 'Line đơn', category: 'Line & Area' },
  { id: 'line-multi', title: 'Line nhiều chuỗi', category: 'Line & Area' },
  {
    id: 'line-target',
    title: 'Line so sánh mục tiêu',
    category: 'Line & Area',
  },
  { id: 'area-gradient', title: 'Area gradient', category: 'Line & Area' },
  { id: 'area-stacked', title: 'Area stacked', category: 'Line & Area' },
  { id: 'bar-grouped', title: 'Bar grouped', category: 'Bar & Combo' },
  { id: 'bar-stacked', title: 'Bar stacked', category: 'Bar & Combo' },
  { id: 'bar-horizontal', title: 'Bar ngang', category: 'Bar & Combo' },
  { id: 'combo-axis', title: 'Combo dual-axis', category: 'Bar & Combo' },
  { id: 'pie-basic', title: 'Pie có nhãn', category: 'Pie & Radial' },
  { id: 'donut', title: 'Donut', category: 'Pie & Radial' },
  { id: 'radial-progress', title: 'Radial KPI', category: 'Pie & Radial' },
  { id: 'radial-multi', title: 'Radial nhiều KPI', category: 'Pie & Radial' },
  { id: 'radar', title: 'Radar so sánh', category: 'Radar & Scatter' },
  { id: 'scatter', title: 'Scatter tương quan', category: 'Radar & Scatter' },
  { id: 'treemap', title: 'Treemap phân bổ', category: 'Hierarchy' },
];

const filterOptions: Array<{ value: 'all' | ChartCategory; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Line & Area', label: 'Line / Area' },
  { value: 'Bar & Combo', label: 'Bar / Combo' },
  { value: 'Pie & Radial', label: 'Pie / Radial' },
  { value: 'Radar & Scatter', label: 'Radar / Scatter' },
  { value: 'Hierarchy', label: 'Hierarchy' },
];

export function ChartsShowcasePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | ChartCategory>(
    'all',
  );
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  const selectedMeta = useMemo(
    () => chartCatalog.find((chart) => chart.id === selectedChart),
    [selectedChart],
  );
  const isVisible = (category: ChartCategory) =>
    activeCategory === 'all' || activeCategory === category;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <Card className="shrink-0">
        <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
          <CardHeading>
            <CardTitle>Showcase biểu đồ</CardTitle>
            <CardDescription>
              Catalog các loại chart dùng trong dashboard, báo cáo và màn hình
              quản trị.
            </CardDescription>
          </CardHeading>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" appearance="light">
              {chartCatalog.length} biến thể
            </Badge>
            {selectedMeta && (
              <Badge variant="primary" appearance="light" className="gap-1.5">
                <Check className="size-3.5" />
                Đang chọn: {selectedMeta.title}
              </Badge>
            )}
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              size="sm"
              variant={activeCategory === option.value ? 'primary' : 'outline'}
              onClick={() => setActiveCategory(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 pb-2 xl:grid-cols-2 2xl:grid-cols-3">
          {isVisible('Line & Area') && (
            <>
              <ChartCard
                id="line-single"
                category="Line & Area"
                title="Line đơn"
                description="Xu hướng một chỉ số theo thời gian."
                selected={selectedChart === 'line-single'}
                onSelect={() => setSelectedChart('line-single')}
              >
                <ChartFrame config={lineConfig}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="inbound"
                      stroke="var(--color-inbound)"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: 'var(--color-inbound)' }}
                    />
                  </LineChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="line-multi"
                category="Line & Area"
                title="Line nhiều chuỗi"
                description="So sánh nhiều series cùng một trục đo."
                selected={selectedChart === 'line-multi'}
                onSelect={() => setSelectedChart('line-multi')}
              >
                <ChartFrame config={lineConfig}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="inbound"
                      stroke="var(--color-inbound)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="outbound"
                      stroke="var(--color-outbound)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="line-target"
                category="Line & Area"
                title="Line so sánh mục tiêu"
                description="Series thực tế kết hợp đường mục tiêu nét đứt."
                selected={selectedChart === 'line-target'}
                onSelect={() => setSelectedChart('line-target')}
              >
                <ChartFrame config={lineConfig}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line
                      type="monotone"
                      dataKey="inbound"
                      stroke="var(--color-inbound)"
                      strokeWidth={2.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="var(--color-target)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="area-gradient"
                category="Line & Area"
                title="Area gradient"
                description="Nhấn mạnh độ lớn và xu hướng bằng vùng gradient."
                selected={selectedChart === 'area-gradient'}
                onSelect={() => setSelectedChart('area-gradient')}
              >
                <ChartFrame config={lineConfig}>
                  <AreaChart data={monthlyTrend}>
                    <defs>
                      <linearGradient
                        id="inboundGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-inbound)"
                          stopOpacity={0.32}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-inbound)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={32} />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="inbound"
                      stroke="var(--color-inbound)"
                      fill="url(#inboundGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="area-stacked"
                category="Line & Area"
                title="Area stacked"
                description="Tổng quan cơ cấu đóng góp theo thời gian."
                selected={selectedChart === 'area-stacked'}
                onSelect={() => setSelectedChart('area-stacked')}
              >
                <ChartFrame config={usageConfig}>
                  <AreaChart data={weeklyUsage}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={28} />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Area
                      type="monotone"
                      dataKey="internal"
                      stackId="1"
                      stroke="var(--color-internal)"
                      fill="var(--color-internal)"
                      fillOpacity={0.75}
                    />
                    <Area
                      type="monotone"
                      dataKey="external"
                      stackId="1"
                      stroke="var(--color-external)"
                      fill="var(--color-external)"
                      fillOpacity={0.75}
                    />
                  </AreaChart>
                </ChartFrame>
              </ChartCard>
            </>
          )}

          {isVisible('Bar & Combo') && (
            <>
              <ChartCard
                id="bar-grouped"
                category="Bar & Combo"
                title="Bar grouped"
                description="So sánh các nhóm cạnh nhau trong cùng kỳ."
                selected={selectedChart === 'bar-grouped'}
                onSelect={() => setSelectedChart('bar-grouped')}
              >
                <ChartFrame config={usageConfig}>
                  <BarChart data={weeklyUsage} barGap={6}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={28} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="internal"
                      fill="var(--color-internal)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="external"
                      fill="var(--color-external)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="bar-stacked"
                category="Bar & Combo"
                title="Bar stacked"
                description="Tổng và cơ cấu thành phần trong một cột."
                selected={selectedChart === 'bar-stacked'}
                onSelect={() => setSelectedChart('bar-stacked')}
              >
                <ChartFrame config={usageConfig}>
                  <BarChart data={weeklyUsage}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={28} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="internal"
                      stackId="a"
                      fill="var(--color-internal)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="external"
                      stackId="a"
                      fill="var(--color-external)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="bar-horizontal"
                category="Bar & Combo"
                title="Bar ngang"
                description="Xếp hạng danh mục với label dài dễ đọc."
                selected={selectedChart === 'bar-horizontal'}
                onSelect={() => setSelectedChart('bar-horizontal')}
              >
                <ChartFrame config={pieConfig}>
                  <BarChart
                    data={categoryMix}
                    layout="vertical"
                    margin={{ left: 16, right: 16 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={72}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="combo-axis"
                category="Bar & Combo"
                title="Combo dual-axis"
                description="Kết hợp volume và tỷ lệ trên hai trục đo."
                selected={selectedChart === 'combo-axis'}
                onSelect={() => setSelectedChart('combo-axis')}
              >
                <ChartFrame config={lineConfig}>
                  <ComposedChart data={monthlyTrend}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      yAxisId="left"
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      width={32}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      yAxisId="left"
                      dataKey="inbound"
                      fill="var(--color-inbound)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="target"
                      stroke="var(--color-target)"
                      strokeWidth={2.5}
                    />
                  </ComposedChart>
                </ChartFrame>
              </ChartCard>
            </>
          )}

          {isVisible('Pie & Radial') && (
            <>
              <ChartCard
                id="pie-basic"
                category="Pie & Radial"
                title="Pie có nhãn"
                description="Phân bổ tỷ trọng với nhãn trực tiếp trên lát cắt."
                selected={selectedChart === 'pie-basic'}
                onSelect={() => setSelectedChart('pie-basic')}
              >
                <ChartFrame config={pieConfig}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={categoryMix}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={84}
                      label
                    >
                      {categoryMix.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            [
                              COLORS.primary,
                              COLORS.blue,
                              COLORS.green,
                              COLORS.amber,
                            ][index]
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="donut"
                category="Pie & Radial"
                title="Donut"
                description="Tỷ trọng gọn cho dashboard và summary card."
                selected={selectedChart === 'donut'}
                onSelect={() => setSelectedChart('donut')}
              >
                <ChartFrame config={pieConfig}>
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={categoryMix}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={84}
                      paddingAngle={3}
                    >
                      {categoryMix.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={
                            [
                              COLORS.primary,
                              COLORS.blue,
                              COLORS.green,
                              COLORS.amber,
                            ][index]
                          }
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="radial-progress"
                category="Pie & Radial"
                title="Radial KPI"
                description="Tiến độ một chỉ số với mốc phần trăm rõ ràng."
                selected={selectedChart === 'radial-progress'}
                onSelect={() => setSelectedChart('radial-progress')}
              >
                <ChartFrame
                  config={{
                    value: { label: 'Hoàn thành', color: COLORS.primary },
                  }}
                >
                  <RadialBarChart
                    innerRadius="60%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={-270}
                    data={[{ value: 78 }]}
                  >
                    <RadialBar
                      dataKey="value"
                      background={{ fill: 'var(--admin-neutral-100)' }}
                      cornerRadius={8}
                      fill="var(--color-value)"
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-foreground text-2xl font-semibold"
                    >
                      78%
                    </text>
                  </RadialBarChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="radial-multi"
                category="Pie & Radial"
                title="Radial nhiều KPI"
                description="Nhiều vòng tiến độ cho bộ chỉ số tổng quan."
                selected={selectedChart === 'radial-multi'}
                onSelect={() => setSelectedChart('radial-multi')}
              >
                <ChartFrame config={performanceConfig}>
                  <RadialBarChart
                    innerRadius="20%"
                    outerRadius="90%"
                    barSize={12}
                    data={[
                      { name: 'Sẵn sàng', value: 88, fill: COLORS.primary },
                      { name: 'Bảo trì', value: 72, fill: COLORS.green },
                      { name: 'Tồn kho', value: 64, fill: COLORS.amber },
                    ]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" background cornerRadius={8} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </RadialBarChart>
                </ChartFrame>
              </ChartCard>
            </>
          )}

          {isVisible('Radar & Scatter') && (
            <>
              <ChartCard
                id="radar"
                category="Radar & Scatter"
                title="Radar so sánh"
                description="Đánh giá nhiều tiêu chí cùng lúc."
                selected={selectedChart === 'radar'}
                onSelect={() => setSelectedChart('radar')}
              >
                <ChartFrame config={performanceConfig}>
                  <RadarChart data={performance} outerRadius="72%">
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tickLine={false} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Radar
                      name="Hiện tại"
                      dataKey="current"
                      stroke="var(--color-current)"
                      fill="var(--color-current)"
                      fillOpacity={0.28}
                    />
                    <Radar
                      name="Mục tiêu"
                      dataKey="target"
                      stroke="var(--color-target)"
                      fill="var(--color-target)"
                      fillOpacity={0.08}
                    />
                  </RadarChart>
                </ChartFrame>
              </ChartCard>

              <ChartCard
                id="scatter"
                category="Radar & Scatter"
                title="Scatter tương quan"
                description="Tìm mối quan hệ giữa hai biến số."
                selected={selectedChart === 'scatter'}
                onSelect={() => setSelectedChart('scatter')}
              >
                <ChartFrame config={usageConfig}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Số lượng"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Chi phí"
                      tickLine={false}
                      axisLine={false}
                    />
                    <ZAxis type="number" range={[60, 240]} />
                    <ChartTooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      content={<ChartTooltipContent />}
                    />
                    <ReferenceLine
                      y={60}
                      stroke="var(--admin-amber-primary)"
                      strokeDasharray="4 4"
                    />
                    <Scatter
                      name="Kho vật tư"
                      data={[
                        { x: 12, y: 22 },
                        { x: 24, y: 34 },
                        { x: 31, y: 42 },
                        { x: 45, y: 58 },
                        { x: 56, y: 71 },
                        { x: 68, y: 88 },
                      ]}
                      fill="var(--color-internal)"
                    />
                  </ScatterChart>
                </ChartFrame>
              </ChartCard>
            </>
          )}

          {isVisible('Hierarchy') && (
            <ChartCard
              id="treemap"
              category="Hierarchy"
              title="Treemap phân bổ"
              description="Phân bổ nguồn lực theo nhóm phân cấp."
              selected={selectedChart === 'treemap'}
              onSelect={() => setSelectedChart('treemap')}
            >
              <ChartFrame config={pieConfig}>
                <Treemap
                  data={warehouseBlocks}
                  dataKey="size"
                  nameKey="name"
                  stroke="var(--admin-surface)"
                  aspectRatio={4 / 3}
                />
              </ChartFrame>
            </ChartCard>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function ChartCard({
  id,
  category,
  title,
  description,
  selected,
  onSelect,
  children,
}: ChartCardProps) {
  return (
    <Card
      data-chart-id={id}
      className={selected ? 'border-primary ring-1 ring-primary/20' : undefined}
    >
      <CardHeader className="items-start gap-3 p-4">
        <CardHeading>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" appearance="light" size="sm">
              {category}
            </Badge>
            {selected && (
              <Badge variant="primary" appearance="light" size="sm">
                Đã chọn
              </Badge>
            )}
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeading>
        <Button
          type="button"
          variant={selected ? 'primary' : 'outline'}
          size="sm"
          onClick={onSelect}
          aria-pressed={selected}
        >
          {selected ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
          {selected ? 'Đã chọn' : 'Chọn mẫu'}
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function ChartFrame({
  config,
  children,
}: {
  config: ChartConfig;
  children: ComponentProps<typeof ChartContainer>['children'];
}) {
  return (
    <ChartContainer config={config} className="h-64 w-full aspect-auto">
      {children}
    </ChartContainer>
  );
}
