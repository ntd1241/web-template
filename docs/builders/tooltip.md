# Tooltip builder

Use `TooltipSpec` and `npm run gen:tooltip -- <spec> <out>` to scaffold a
tooltip wrapper around `ChartTooltipContent`.

The generated component can set default label/indicator visibility and an
optional class name. With `includeProvider: true`, it also emits a provider
that applies the shared `ChartTooltipStyle` preset to all charts rendered
inside it.
