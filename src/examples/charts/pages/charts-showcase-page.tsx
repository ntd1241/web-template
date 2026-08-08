import { useMemo, useState, type ComponentProps, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
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
  ChartTooltipStyleProvider,
  type ChartConfig,
  type ChartTooltipStyle,
} from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ChartCategory =
  | 'Line & Area'
  | 'Bar & Combo'
  | 'Pie & Radial'
  | 'Radar & Scatter'
  | 'Hierarchy'
  | 'Distribution & Funnel';

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

const divergingUsage = [
  { month: 'T1', increase: 18, decrease: -8 },
  { month: 'T2', increase: 26, decrease: -12 },
  { month: 'T3', increase: 14, decrease: -18 },
  { month: 'T4', increase: 32, decrease: -10 },
  { month: 'T5', increase: 22, decrease: -16 },
  { month: 'T6', increase: 38, decrease: -9 },
];

const histogramData = [
  { range: '0–10', count: 4 },
  { range: '11–20', count: 9 },
  { range: '21–30', count: 15 },
  { range: '31–40', count: 22 },
  { range: '41–50', count: 18 },
  { range: '51–60', count: 11 },
  { range: '61+', count: 6 },
];

const funnelData = [
  { name: 'Tổng nhu cầu', value: 100 },
  { name: 'Đã duyệt', value: 78 },
  { name: 'Đang xử lý', value: 54 },
  { name: 'Đã hoàn tất', value: 38 },
];

const nestedMix = [
  { name: 'Nội bộ', value: 62 },
  { name: 'Nhà cung cấp', value: 24 },
  { name: 'Điều chuyển', value: 14 },
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

const distributionConfig = {
  count: { label: 'Số lượng', color: COLORS.blue },
} satisfies ChartConfig;

const funnelConfig = {
  value: { label: 'Số lượng', color: COLORS.primary },
} satisfies ChartConfig;

const tooltipStyleOptions: Array<{
  value: ChartTooltipStyle;
  label: string;
  description: string;
}> = [
  {
    value: 'default',
    label: 'Dot mặc định',
    description: 'Chấm màu và nhãn đầy đủ',
  },
  {
    value: 'line',
    label: 'Line indicator',
    description: 'Vạch màu dọc, gọn cho nhiều series',
  },
  {
    value: 'dashed',
    label: 'Dashed indicator',
    description: 'Nét đứt cho mục tiêu hoặc mốc tham chiếu',
  },
  {
    value: 'compact',
    label: 'Compact',
    description: 'Ẩn indicator, tối ưu cho chart nhỏ',
  },
  {
    value: 'emphasis',
    label: 'Emphasis',
    description: 'Border primary và shadow mạnh hơn',
  },
];

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
  { id: 'line-step', title: 'Line step', category: 'Line & Area' },
  { id: 'line-brush', title: 'Line có zoom', category: 'Line & Area' },
  { id: 'area-gradient', title: 'Area gradient', category: 'Line & Area' },
  { id: 'area-stacked', title: 'Area stacked', category: 'Line & Area' },
  {
    id: 'area-percentage',
    title: 'Area 100% stacked',
    category: 'Line & Area',
  },
  { id: 'bar-grouped', title: 'Bar grouped', category: 'Bar & Combo' },
  { id: 'bar-stacked', title: 'Bar stacked', category: 'Bar & Combo' },
  { id: 'bar-horizontal', title: 'Bar ngang', category: 'Bar & Combo' },
  {
    id: 'bar-percentage',
    title: 'Bar 100% stacked',
    category: 'Bar & Combo',
  },
  { id: 'bar-diverging', title: 'Bar tăng giảm', category: 'Bar & Combo' },
  { id: 'combo-axis', title: 'Combo dual-axis', category: 'Bar & Combo' },
  { id: 'pie-basic', title: 'Pie có nhãn', category: 'Pie & Radial' },
  { id: 'donut', title: 'Donut', category: 'Pie & Radial' },
  { id: 'pie-nested', title: 'Pie lồng nhau', category: 'Pie & Radial' },
  { id: 'radial-progress', title: 'Radial KPI', category: 'Pie & Radial' },
  { id: 'radial-multi', title: 'Radial nhiều KPI', category: 'Pie & Radial' },
  { id: 'radial-gauge', title: 'Radial gauge', category: 'Pie & Radial' },
  { id: 'radar', title: 'Radar so sánh', category: 'Radar & Scatter' },
  { id: 'radar-single', title: 'Radar đơn', category: 'Radar & Scatter' },
  { id: 'scatter', title: 'Scatter tương quan', category: 'Radar & Scatter' },
  {
    id: 'scatter-bubble',
    title: 'Scatter bubble',
    category: 'Radar & Scatter',
  },
  { id: 'treemap', title: 'Treemap phân bổ', category: 'Hierarchy' },
  {
    id: 'histogram',
    title: 'Histogram phân phối',
    category: 'Distribution & Funnel',
  },
  {
    id: 'funnel',
    title: 'Funnel quy trình',
    category: 'Distribution & Funnel',
  },
  {
    id: 'funnel-conversion',
    title: 'Funnel conversion',
    category: 'Distribution & Funnel',
  },
];

const filterOptions: Array<{ value: 'all' | ChartCategory; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Line & Area', label: 'Line / Area' },
  { value: 'Bar & Combo', label: 'Bar / Combo' },
  { value: 'Pie & Radial', label: 'Pie / Radial' },
  { value: 'Radar & Scatter', label: 'Radar / Scatter' },
  { value: 'Hierarchy', label: 'Hierarchy' },
  { value: 'Distribution & Funnel', label: 'Distribution / Funnel' },
];

export function ChartsShowcasePage() {
  const [activeCategory, setActiveCategory] = useState<'all' | ChartCategory>(
    'all',
  );
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [tooltipStyle, setTooltipStyle] =
    useState<ChartTooltipStyle>('default');

  const selectedMeta = useMemo(
    () => chartCatalog.find((chart) => chart.id === selectedChart),
    [selectedChart],
  );
  const isVisible = (category: ChartCategory) =>
    activeCategory === 'all' || activeCategory === category;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6">
      <ScrollArea className="min-h-0 flex-1">
        <ChartTooltipStyleProvider style={tooltipStyle}>
          <div className="space-y-4 pb-2">
            <Card>
              <CardHeader className="flex-col items-stretch gap-4 p-5 xl:flex-row xl:items-center xl:justify-between">
                <CardHeading>
                  <CardTitle>Showcase biểu đồ</CardTitle>
                  <CardDescription>
                    Catalog các loại chart dùng trong dashboard, báo cáo và màn
                    hình quản trị.
                  </CardDescription>
                </CardHeading>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={tooltipStyle}
                    onValueChange={(value) =>
                      setTooltipStyle(value as ChartTooltipStyle)
                    }
                  >
                    <SelectTrigger size="sm" className="w-[170px]">
                      <SelectValue aria-label="Kiểu tooltip" />
                    </SelectTrigger>
                    <SelectContent>
                      {tooltipStyleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Badge variant="secondary" appearance="light">
                    {chartCatalog.length} biến thể
                  </Badge>
                  {selectedMeta && (
                    <Badge
                      variant="primary"
                      appearance="light"
                      className="gap-1.5"
                    >
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
                    variant={
                      activeCategory === option.value ? 'primary' : 'outline'
                    }
                    onClick={() => setActiveCategory(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
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
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
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
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
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
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
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
                    id="line-step"
                    category="Line & Area"
                    title="Line step"
                    description="Thay đổi theo bậc, phù hợp với trạng thái hoặc SLA."
                    selected={selectedChart === 'line-step'}
                    onSelect={() => setSelectedChart('line-step')}
                  >
                    <ChartFrame config={lineConfig}>
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis tickLine={false} axisLine={false} width={32} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="stepAfter"
                          dataKey="outbound"
                          stroke="var(--color-outbound)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: 'var(--color-outbound)' }}
                        />
                      </LineChart>
                    </ChartFrame>
                  </ChartCard>

                  <ChartCard
                    id="line-brush"
                    category="Line & Area"
                    title="Line có zoom"
                    description="Theo dõi chuỗi dài và kéo vùng chọn để phóng to."
                    selected={selectedChart === 'line-brush'}
                    onSelect={() => setSelectedChart('line-brush')}
                  >
                    <ChartFrame config={lineConfig}>
                      <LineChart data={monthlyTrend} margin={{ bottom: 4 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis tickLine={false} axisLine={false} width={32} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="inbound"
                          stroke="var(--color-inbound)"
                          strokeWidth={2.5}
                        />
                        <Brush
                          dataKey="month"
                          height={18}
                          stroke="var(--admin-primary)"
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
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
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
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                        />
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

                  <ChartCard
                    id="area-percentage"
                    category="Line & Area"
                    title="Area 100% stacked"
                    description="Nhìn tỷ trọng thay đổi mà không phụ thuộc tổng số."
                    selected={selectedChart === 'area-percentage'}
                    onSelect={() => setSelectedChart('area-percentage')}
                  >
                    <ChartFrame config={usageConfig}>
                      <AreaChart data={weeklyUsage} stackOffset="expand">
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={34}
                          tickFormatter={(value) =>
                            `${Math.round(value * 100)}%`
                          }
                        />
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
                          fillOpacity={0.72}
                        />
                        <Area
                          type="monotone"
                          dataKey="external"
                          stackId="1"
                          stroke="var(--color-external)"
                          fill="var(--color-external)"
                          fillOpacity={0.72}
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
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                        />
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
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                        />
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
                    id="bar-percentage"
                    category="Bar & Combo"
                    title="Bar 100% stacked"
                    description="So sánh cơ cấu giữa các kỳ theo tỷ lệ phần trăm."
                    selected={selectedChart === 'bar-percentage'}
                    onSelect={() => setSelectedChart('bar-percentage')}
                  >
                    <ChartFrame config={usageConfig}>
                      <BarChart data={weeklyUsage} stackOffset="expand">
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="day"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={34}
                          tickFormatter={(value) =>
                            `${Math.round(value * 100)}%`
                          }
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="internal"
                          stackId="percentage"
                          fill="var(--color-internal)"
                        />
                        <Bar
                          dataKey="external"
                          stackId="percentage"
                          fill="var(--color-external)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartFrame>
                  </ChartCard>

                  <ChartCard
                    id="bar-diverging"
                    category="Bar & Combo"
                    title="Bar tăng giảm"
                    description="Hiển thị đóng góp dương và âm quanh đường mốc."
                    selected={selectedChart === 'bar-diverging'}
                    onSelect={() => setSelectedChart('bar-diverging')}
                  >
                    <ChartFrame
                      config={{
                        increase: { label: 'Tăng', color: COLORS.green },
                        decrease: { label: 'Giảm', color: COLORS.red },
                      }}
                    >
                      <BarChart data={divergingUsage}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis tickLine={false} axisLine={false} width={32} />
                        <ReferenceLine y={0} stroke="var(--admin-border)" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="increase"
                          fill="var(--color-increase)"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="decrease"
                          fill="var(--color-decrease)"
                          radius={[4, 4, 0, 0]}
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
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                        />
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
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel />}
                        />
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
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel />}
                        />
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
                    id="pie-nested"
                    category="Pie & Radial"
                    title="Pie lồng nhau"
                    description="Phân rã một tổng số theo hai cấp danh mục."
                    selected={selectedChart === 'pie-nested'}
                    onSelect={() => setSelectedChart('pie-nested')}
                  >
                    <ChartFrame config={pieConfig}>
                      <PieChart>
                        <ChartTooltip
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={categoryMix}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={54}
                          outerRadius={84}
                          paddingAngle={2}
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
                        <Pie
                          data={nestedMix}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={28}
                          outerRadius={48}
                          paddingAngle={2}
                        >
                          {nestedMix.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                [COLORS.violet, COLORS.red, COLORS.green][index]
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
                        <RadialBar
                          dataKey="value"
                          background
                          cornerRadius={8}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                      </RadialBarChart>
                    </ChartFrame>
                  </ChartCard>

                  <ChartCard
                    id="radial-gauge"
                    category="Pie & Radial"
                    title="Radial gauge"
                    description="Đồng hồ KPI có khoảng trống để nhấn mạnh mức đạt."
                    selected={selectedChart === 'radial-gauge'}
                    onSelect={() => setSelectedChart('radial-gauge')}
                  >
                    <ChartFrame
                      config={{
                        value: { label: 'Mức đạt', color: COLORS.blue },
                      }}
                    >
                      <RadialBarChart
                        innerRadius="64%"
                        outerRadius="92%"
                        startAngle={225}
                        endAngle={-45}
                        data={[{ value: 72 }]}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <RadialBar
                          dataKey="value"
                          background={{ fill: 'var(--admin-neutral-100)' }}
                          cornerRadius={10}
                          fill="var(--color-value)"
                        />
                        <text
                          x="50%"
                          y="48%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-2xl font-semibold"
                        >
                          72%
                        </text>
                        <text
                          x="50%"
                          y="62%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-muted-foreground text-[10px]"
                        >
                          mức đạt
                        </text>
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
                    id="radar-single"
                    category="Radar & Scatter"
                    title="Radar đơn"
                    description="Tóm tắt một hồ sơ năng lực trên nhiều tiêu chí."
                    selected={selectedChart === 'radar-single'}
                    onSelect={() => setSelectedChart('radar-single')}
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
                          fillOpacity={0.34}
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

                  <ChartCard
                    id="scatter-bubble"
                    category="Radar & Scatter"
                    title="Scatter bubble"
                    description="Thêm kích thước bong bóng để biểu diễn biến thứ ba."
                    selected={selectedChart === 'scatter-bubble'}
                    onSelect={() => setSelectedChart('scatter-bubble')}
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
                        <ZAxis type="number" dataKey="z" range={[80, 360]} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Scatter
                          name="Kho chính"
                          data={[
                            { x: 14, y: 30, z: 12 },
                            { x: 26, y: 42, z: 24 },
                            { x: 38, y: 54, z: 32 },
                            { x: 54, y: 72, z: 48 },
                          ]}
                          fill="var(--color-internal)"
                        />
                        <Scatter
                          name="Kho dự phòng"
                          data={[
                            { x: 18, y: 22, z: 8 },
                            { x: 34, y: 36, z: 18 },
                            { x: 46, y: 48, z: 28 },
                            { x: 62, y: 64, z: 40 },
                          ]}
                          fill="var(--color-external)"
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

              {isVisible('Distribution & Funnel') && (
                <>
                  <ChartCard
                    id="histogram"
                    category="Distribution & Funnel"
                    title="Histogram phân phối"
                    description="Đọc tần suất xuất hiện theo các khoảng giá trị."
                    selected={selectedChart === 'histogram'}
                    onSelect={() => setSelectedChart('histogram')}
                  >
                    <ChartFrame config={distributionConfig}>
                      <BarChart data={histogramData} barCategoryGap={2}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="range"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis tickLine={false} axisLine={false} width={28} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                          dataKey="count"
                          fill="var(--color-count)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartFrame>
                  </ChartCard>

                  <ChartCard
                    id="funnel"
                    category="Distribution & Funnel"
                    title="Funnel quy trình"
                    description="Theo dõi số lượng còn lại qua từng bước xử lý."
                    selected={selectedChart === 'funnel'}
                    onSelect={() => setSelectedChart('funnel')}
                  >
                    <ChartFrame config={funnelConfig}>
                      <FunnelChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Funnel
                          dataKey="value"
                          data={funnelData}
                          isAnimationActive
                        >
                          {funnelData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                [
                                  COLORS.primary,
                                  COLORS.blue,
                                  COLORS.violet,
                                  COLORS.green,
                                ][index]
                              }
                            />
                          ))}
                          <LabelList
                            position="right"
                            fill="var(--foreground)"
                            stroke="none"
                            dataKey="name"
                          />
                        </Funnel>
                      </FunnelChart>
                    </ChartFrame>
                  </ChartCard>

                  <ChartCard
                    id="funnel-conversion"
                    category="Distribution & Funnel"
                    title="Funnel conversion"
                    description="Biến thể compact, đặt giá trị trực tiếp trong từng bước."
                    selected={selectedChart === 'funnel-conversion'}
                    onSelect={() => setSelectedChart('funnel-conversion')}
                  >
                    <ChartFrame config={funnelConfig}>
                      <FunnelChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Funnel
                          dataKey="value"
                          data={funnelData}
                          isAnimationActive
                        >
                          {funnelData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={
                                [
                                  COLORS.blue,
                                  COLORS.primary,
                                  COLORS.green,
                                  COLORS.amber,
                                ][index]
                              }
                            />
                          ))}
                          <LabelList
                            position="inside"
                            fill="var(--admin-primary-foreground)"
                            stroke="none"
                            dataKey="value"
                          />
                        </Funnel>
                      </FunnelChart>
                    </ChartFrame>
                  </ChartCard>
                </>
              )}
            </div>
          </div>
        </ChartTooltipStyleProvider>
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
