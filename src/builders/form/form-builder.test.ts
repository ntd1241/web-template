import { describe, expect, it } from 'vitest';
import employeeSpec from './__fixtures__/supplier.form.fixture';
import { buildFormModule } from './form-builder';

describe('buildFormModule', () => {
  const source = buildFormModule(employeeSpec);

  it('emits the banner and the dialog component', () => {
    expect(source).toContain('Scaffolded by form-builder');
    expect(source).toContain('You own this file now');
    expect(source).toContain('export function SupplierForm({');
    expect(source).toContain('export function SupplierFormDialog({');
    expect(source).toContain('interface SupplierFormProps {');
    expect(source).toContain('interface SupplierFormDialogProps {');
    expect(source).toContain("mode: 'create' | 'edit';");
    expect(source).toContain('isSaving?: boolean;');
    expect(source).toContain('loading={isSaving}');
    expect(source).toContain('loadingText="Đang lưu..."');
    expect(source).toContain(
      "import { ConfirmDialog } from '@/components/ui/confirm-dialog';",
    );
    expect(source).toContain("if (mode === 'edit') {");
  });

  it('wires parent-owned react-hook-form + zodResolver from the schema', () => {
    expect(source).toContain('export function useSupplierForm(');
    expect(source).toContain('resolver: zodResolver(createSupplierFormSchema)');
    expect(source).toContain('defaultValues: supplierDefaultValues');
    expect(source).toContain('form: UseFormReturn<CreateSupplierFormValues>;');
    expect(source).toContain("} from './supplier-form.schema';");
  });

  it('lays fields on a responsive 12-col grid with width presets', () => {
    expect(source).toContain(
      'grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-12',
    );
    expect(source).toContain('className="md:col-span-6"'); // normal
    expect(source).toContain('className="md:col-span-8"'); // large
    expect(source).toContain('className="md:col-span-12"'); // full
  });

  it('can start a field on a new desktop grid row', () => {
    const source = buildFormModule({
      entity: 'Employee',
      schemaImport: './employee-form.schema',
      schemaName: 'employeeFormSchema',
      valuesType: 'EmployeeFormValues',
      title: 'Tạo nhân viên',
      fields: [
        { kind: 'text', name: 'name', label: 'Tên', width: 'normal' },
        {
          kind: 'text',
          name: 'code',
          label: 'Mã',
          width: 'normal',
          breakBefore: true,
        },
      ],
    });

    expect(source).toContain('className="md:col-span-6 md:col-start-1"');
  });

  it('binds each kind correctly', () => {
    expect(source).toContain(
      '<Input placeholder="vd: NCC-001" variant="md" {...field} />',
    ); // text spread
    expect(source).toContain('<Input type="number" variant="md" {...field} />'); // number
    expect(source).toContain('<Textarea rows={3} {...field} />'); // textarea
    expect(source).toContain(
      'value={field.value} onValueChange={field.onChange}',
    ); // select
    expect(source).toContain(
      '<SelectSearch value={field.value} onChange={field.onChange} options={regionOptions}',
    ); // local search select
    expect(source).toContain(
      '<MultiSelect value={field.value} onChange={field.onChange} options={tagsOptions}',
    ); // multiselect
    expect(source).toContain(
      '<Switch checked={field.value} onCheckedChange={field.onChange} />',
    ); // switch
  });

  it('renders date fields through the shared date picker input', () => {
    const dateSource = buildFormModule({
      entity: 'Employee',
      schemaImport: './employee-form.schema',
      schemaName: 'employeeFormSchema',
      valuesType: 'EmployeeFormValues',
      title: 'Tạo nhân viên',
      fields: [
        {
          kind: 'date',
          name: 'startDate',
          label: 'Ngày vào làm',
          required: true,
          format: 'iso',
        },
      ],
    });

    expect(dateSource).toContain(
      "import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';",
    );
    expect(dateSource).toContain('startDate: undefined,');
    expect(dateSource).toContain(
      '<DatePickerInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} calendarLabel="Chọn ngày vào làm" valueMode="iso-date" variant="md" />',
    );
    expect(dateSource).toContain('className="md:col-span-12"');
  });

  it('generates a compound input with a separately bound select field', () => {
    const compoundSource = buildFormModule({
      entity: 'ContractFee',
      schemaImport: './contract-fee.schema',
      schemaName: 'contractFeeSchema',
      valuesType: 'ContractFeeValues',
      title: 'Thêm khoản phí',
      fields: [
        {
          kind: 'inputSelect',
          name: 'billingInterval',
          selectName: 'billingUnit',
          label: 'Mỗi',
          inputType: 'number',
          selectPlaceholder: 'Chu kỳ',
          selectOptions: [
            { value: 'month', label: 'Tháng' },
            { value: 'quarter', label: 'Quý' },
          ],
          selectDefaultValue: 'month',
        },
      ],
    });

    expect(compoundSource).toContain(
      "import { InputSelect } from '@/components/ui/input-select';",
    );
    expect(compoundSource).toContain('const billingIntervalSelectOptions = [');
    expect(compoundSource).toContain("billingInterval: '',");
    expect(compoundSource).toContain("billingUnit: 'month',");
    expect(compoundSource).toContain('name="billingUnit"');
    expect(compoundSource).toContain(
      'fieldState.error?.message ?? selectFieldState.error?.message',
    );
    expect(compoundSource).toContain('selectField.value');
  });

  it('maps semantic number formats to NumericInput', () => {
    const formattedSource = buildFormModule({
      entity: 'Invoice',
      schemaImport: './invoice.schema',
      schemaName: 'invoiceSchema',
      valuesType: 'InvoiceValues',
      title: 'Tạo hóa đơn',
      fields: [
        {
          kind: 'number',
          name: 'total',
          label: 'Tổng tiền',
          format: 'currency',
        },
      ],
    });

    expect(formattedSource).toContain(
      "import { NumericInput } from '@/components/ui/inputs/numeric-input';",
    );
    expect(formattedSource).toContain('<NumericInput');
    expect(formattedSource).toContain('suffix=" ₫"');
    expect(formattedSource).not.toContain(
      "import { Input } from '@/components/ui/input';",
    );
  });

  it('hoists option consts (multiselect typed)', () => {
    expect(source).toContain('const groupOptions = [');
    expect(source).toContain('const tagsOptions: MultiSelectOption[] = [');
    expect(source).not.toContain('const regionOptions = [');
    expect(source).toContain('regionOptions: SearchSelectOption[];');
    expect(source).toContain("searchableText: 'Ưu tiên'");
  });

  it('derives defaultValues per kind', () => {
    expect(source).toContain(
      'export const supplierDefaultValues: CreateSupplierFormValues = {',
    );
    expect(source).toContain('debt: 0,');
    expect(source).toContain('tags: [],');
    expect(source).toContain('active: false,');
  });

  it('emits the edit mapper scaffold', () => {
    expect(source).toContain('type SupplierFormSource = unknown;');
    expect(source).toContain(
      'export function mapSupplierToFormValues(entity: SupplierFormSource): CreateSupplierFormValues',
    );
    expect(source).toContain(
      '// TODO(scaffold): map entity → form values for edit mode.',
    );
  });

  it('guards edit dialog close while leaving create close direct', () => {
    expect(source).toContain('const requestClose = (nextOpen: boolean) => {');
    expect(source).toContain('onClick={() => requestClose(false)}');
    expect(source).toContain('onOpenChange={requestClose}');
    expect(source).toContain('onConfirm={confirmClose}');
  });

  it('marks required fields and tree-shakes imports', () => {
    expect(source).toContain('<span className="text-destructive"> *</span>');
    expect(source).toContain(
      "import { Switch } from '@/components/ui/switch';",
    );
    expect(source).toContain(
      "import { SelectSearch } from '@/components/ui/select-search';",
    );
  });

  it('emits an API search select loader contract and selected option prop', () => {
    const apiSource = buildFormModule({
      entity: 'Invoice',
      schemaImport: './invoice.schema',
      schemaName: 'invoiceSchema',
      valuesType: 'InvoiceValues',
      title: 'Tạo hóa đơn',
      fields: [
        {
          kind: 'apiSearchSelect',
          name: 'customer',
          label: 'Khách hàng',
          searchPlaceholder: 'Tìm khách hàng...',
          minSearchLength: 2,
          debounceMs: 250,
        },
      ],
    });

    expect(apiSource).toContain(
      "import { ApiSelectSearch } from '@/components/ui/select-search';",
    );
    expect(apiSource).toContain(
      'import type { ApiSelectSearchLoadOptions, SearchSelectOption }',
    );
    expect(apiSource).toContain(
      'loadCustomerOptions: ApiSelectSearchLoadOptions;',
    );
    expect(apiSource).toContain('customerSelectedOption?: SearchSelectOption;');
    expect(apiSource).toContain(
      'loadOptions={loadCustomerOptions} selectedOption={customerSelectedOption}',
    );
    expect(apiSource).toContain('minSearchLength={2} debounceMs={250}');
  });

  it('records the spec path in the banner', () => {
    expect(source).toContain(
      'Scaffolded by form-builder from `src/builders/form/__fixtures__/supplier.form.fixture.ts`.',
    );
  });

  it('rejects an invalid spec', () => {
    expect(() =>
      buildFormModule({
        entity: 'Bad',
        schemaImport: './x',
        schemaName: 'schema',
        valuesType: 'Values',
        title: 'x',
        fields: [],
      } as never),
    ).toThrow();
  });

  it('matches the snapshot', () => {
    expect(source).toMatchSnapshot();
  });
});
