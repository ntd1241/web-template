import { describe, expect, it } from 'vitest';
import { buildFormFieldControl } from './form-field-builder';
import {
  dateFieldControlSchema,
  selectFieldControlSchema,
} from './form-field-spec';

describe('form-field builder', () => {
  it('maps every form field kind to the shared UI control', () => {
    expect(buildFormFieldControl({ kind: 'text', surface: 'form' })).toContain(
      '<Input',
    );
    expect(
      buildFormFieldControl({ kind: 'number', surface: 'form' }),
    ).toContain('<Input type="number"');
    expect(buildFormFieldControl({ kind: 'date', surface: 'form' })).toContain(
      '<DatePickerInput',
    );
    expect(
      buildFormFieldControl({ kind: 'textarea', surface: 'form' }),
    ).toContain('<Textarea rows={3}');
    expect(
      buildFormFieldControl({
        kind: 'select',
        surface: 'form',
        optionsExpression: 'statusOptions',
      }),
    ).toContain('{statusOptions.map');
    expect(
      buildFormFieldControl({
        kind: 'combobox',
        surface: 'form',
        optionsExpression: 'regionOptions',
      }),
    ).toContain('options={regionOptions}');
    expect(
      buildFormFieldControl({
        kind: 'multiselect',
        surface: 'form',
        optionsExpression: 'tagOptions',
      }),
    ).toContain('<MultiSelect');
    expect(
      buildFormFieldControl({ kind: 'switch', surface: 'form' }),
    ).toContain('<Switch');
  });

  it('supports a controller-owned table cell without duplicating control markup', () => {
    const source = buildFormFieldControl({
      kind: 'number',
      surface: 'cell',
      fieldExpression: 'inputField',
      valueExpression: 'inputField.value',
      onChangeExpression: 'inputField.onChange',
      ariaInvalidExpression: '!!errors?.quantity',
      variant: 'sm',
    });

    expect(source).toContain('value={inputField.value}');
    expect(source).toContain('aria-invalid={!!errors?.quantity}');
    expect(source).toContain('Number.isNaN(event.target.valueAsNumber)');
    expect(source).not.toContain('<FormControl>');
  });

  it('allows higher-level builders to provide custom change handlers', () => {
    const source = buildFormFieldControl({
      kind: 'text',
      surface: 'cell',
      valueExpression: 'bulkValue',
      onChangeHandlerExpression: '(event) => setBulkValue(event.target.value)',
    });

    expect(source).toContain(
      'onChange={(event) => setBulkValue(event.target.value)}',
    );
  });

  it('validates shared control options before higher-level builders extend them', () => {
    expect(
      dateFieldControlSchema.safeParse({
        kind: 'date',
        format: 'iso',
      }).success,
    ).toBe(true);
    expect(
      selectFieldControlSchema.safeParse({
        kind: 'select',
        optionsFrom: 'prop',
      }).success,
    ).toBe(true);
    expect(
      dateFieldControlSchema.safeParse({
        kind: 'date',
        format: 'unsupported',
      }).success,
    ).toBe(false);
  });
});
