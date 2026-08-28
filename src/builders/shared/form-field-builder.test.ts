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
    ).toContain('<OptionSelect');
    expect(
      buildFormFieldControl({
        kind: 'select',
        surface: 'cell',
        optionsExpression: 'statusOptions',
        selectLabel: 'Trạng thái',
      }),
    ).toContain('searchable={false}');
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
    expect(
      buildFormFieldControl({ kind: 'customerSelect', surface: 'form' }),
    ).toContain('<CustomerSelect');
  });

  it('uses ISO strings for form dates by default', () => {
    const source = buildFormFieldControl({
      kind: 'date',
      surface: 'form',
    });

    expect(source).toContain('valueMode="iso-date"');
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

  it('renders the API search select with its loader contract', () => {
    const source = buildFormFieldControl({
      kind: 'apiSearchSelect',
      surface: 'form',
      valueExpression: 'field.value',
      onChangeExpression: 'field.onChange',
      loadOptionsExpression: 'loadCustomerOptions',
      selectedOptionExpression: 'customerSelectedOption',
      searchPlaceholder: 'Tìm khách hàng...',
      minSearchLength: 2,
      debounceMs: 250,
    });

    expect(source).toContain('<ApiOptionSelect');
    expect(source).toContain('loadOptions={loadCustomerOptions}');
    expect(source).toContain('selectedOption={customerSelectedOption}');
    expect(source).toContain('minSearchLength={2} debounceMs={250}');
  });

  it('renders the compound input and trailing select bindings', () => {
    const source = buildFormFieldControl({
      kind: 'inputSelect',
      surface: 'form',
      inputType: 'number',
      valueExpression: 'field.value',
      onChangeExpression: 'field.onChange',
      selectFieldExpression: 'selectField',
      selectOptionsExpression: 'billingUnitOptions',
      selectPlaceholder: 'Chu kỳ',
      selectAriaInvalidExpression: '!!selectFieldState.error',
    });

    expect(source).toContain('<InputSelect input={');
    expect(source).toContain('<Input type="number"');
    expect(source).toContain('value={field.value}');
    expect(source).toContain(
      '<Select value={selectField.value} onValueChange={selectField.onChange}>',
    );
    expect(source).toContain('{billingUnitOptions.map');
    expect(source).toContain('placeholder="Chu kỳ"');
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
