# Segmented Control Builder

Use the segmented-control builder for a compact, mutually exclusive view or mode switcher rendered by
the shared ToggleGroup and ToggleGroupItem primitives.

## Workflow

Create a spec and generate the component:

    npm run gen:segmented-control -- <spec.ts> <out.tsx>

The generated component receives value, onValueChange, disabled, and className. Static specs emit
their options in the generated module; set optionsSource: 'prop' when options are supplied at runtime.

The builder guards empty values for single-selection controls by default, so clicking the active item
does not clear the page state. Set allowEmpty: true only when an empty selection is meaningful.

Use itemClassName for serializable state styling such as:

    itemClassName:
      'data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',

Use Tabs instead when the control navigates between separate content panels. Use this builder for
switching a view, mode, or filter while the surrounding surface remains the same.
