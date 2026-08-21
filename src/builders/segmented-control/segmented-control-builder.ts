import {
  segmentedControlSpecSchema,
  type ResolvedSegmentedControlSpec,
  type SegmentedControlSpec,
} from './segmented-control-spec';

function quote(value: string): string {
  return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
}

function banner(specPath?: string): string {
  const marker = specPath
    ? ' from ' + String.fromCharCode(96) + specPath + String.fromCharCode(96)
    : '';
  return [
    '/**',
    ' * Scaffolded by segmented-control-builder' +
      marker +
      '. Run npm run gen:segmented-control — do NOT hand-write this file.',
    ' * You own this file now — wire the generated control into the feature and keep domain state outside the component.',
    ' * To change options or control styling, edit the spec and re-gen to a scratch path first.',
    ' */',
  ].join('\n');
}

function emitStaticOptions(spec: ResolvedSegmentedControlSpec): string {
  if (spec.optionsSource !== 'static') return '';
  const optionsName = spec.componentName + 'Options';
  const options = spec.options ?? [];
  return [
    'const ' + optionsName + ': ' + spec.componentName + 'Option[] = [',
    ...options.map(
      (option) =>
        '  { value: ' +
        quote(option.value) +
        ', label: ' +
        quote(option.label) +
        ' },',
    ),
    '];',
  ].join('\n');
}

export function buildSegmentedControlModule(
  input: SegmentedControlSpec,
): string {
  const spec = segmentedControlSpecSchema.parse(input);
  const optionsName = spec.componentName + 'Options';
  const staticOptions = emitStaticOptions(spec);
  const optionsProp =
    spec.optionsSource === 'static'
      ? '  options?: ' + spec.componentName + 'Option[];'
      : '  options: ' + spec.componentName + 'Option[];';
  const optionsParameter =
    spec.optionsSource === 'static'
      ? '  options = ' + optionsName + ','
      : '  options,';
  const changeHandlerLines = spec.allowEmpty
    ? ['      onValueChange={onValueChange}']
    : [
        '      onValueChange={(nextValue) => {',
        '        if (nextValue) onValueChange(nextValue);',
        '      }}',
      ];
  const itemClassName = spec.itemClassName
    ? 'cn(' + quote(spec.itemClassName) + ')'
    : 'undefined';

  return [
    banner(spec.specPath),
    "import { cn } from '@/lib/utils';",
    "import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';",
    '',
    'export interface ' + spec.componentName + 'Option {',
    '  value: string;',
    '  label: string;',
    '}',
    '',
    staticOptions || null,
    staticOptions ? '' : null,
    'export interface ' + spec.componentName + 'Props {',
    '  value: string;',
    '  onValueChange: (value: string) => void;',
    optionsProp,
    '  disabled?: boolean;',
    '  className?: string;',
    '}',
    '',
    'export function ' + spec.componentName + '({',
    '  value,',
    '  onValueChange,',
    optionsParameter,
    '  disabled = false,',
    '  className,',
    '}: ' + spec.componentName + 'Props) {',
    '  return (',
    '    <ToggleGroup',
    '      type="single"',
    '      value={value}',
    ...changeHandlerLines,
    '      disabled={disabled}',
    '      variant=' + quote(spec.variant),
    '      size=' + quote(spec.size),
    "      className={cn('w-fit', className)}",
    '      aria-label=' + quote(spec.ariaLabel),
    '    >',
    '      {options.map((option) => (',
    '        <ToggleGroupItem',
    '          key={option.value}',
    '          value={option.value}',
    '          aria-label={option.label}',
    '          className={' + itemClassName + '}',
    '        >',
    '          {option.label}',
    '        </ToggleGroupItem>',
    '      ))}',
    '    </ToggleGroup>',
    '  );',
    '}',
    '',
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

export { banner, emitStaticOptions };
