# Chart builder

Use `ChartSpec` and `npm run gen:chart -- <spec> <out>` to scaffold a Recharts
component backed by the shared `ChartContainer` primitive.

The spec supports line, area, bar, composed, pie, donut, radial, radar,
scatter, treemap, and funnel charts. Series define the data key, label, color,
optional stack, and composed-chart role. Generated output is scaffold-and-own:
wire the real data and callbacks after generation, and regenerate to a scratch
path before changing an owned component.

`interactive: true` emits an `onItemClick` callback for pie and other point-like
charts. `tooltipStyle` selects one of the shared tooltip presets for the
generated chart.
