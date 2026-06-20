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
      '<Combobox value={field.value} onChange={field.onChange} options={regionOptions}',
    ); // combobox
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
        },
      ],
    });

    expect(dateSource).toContain(
      "import { DatePickerInput } from '@/components/ui/inputs/date-picker-input';",
    );
    expect(dateSource).toContain('startDate: undefined,');
    expect(dateSource).toContain(
      '<DatePickerInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} calendarLabel="Chọn ngày vào làm" variant="md" />',
    );
  });

  it('hoists option consts (multiselect typed)', () => {
    expect(source).toContain('const groupOptions = [');
    expect(source).toContain('const tagsOptions: MultiSelectOption[] = [');
    expect(source).not.toContain('const regionOptions = [');
    expect(source).toContain('regionOptions: ComboboxOption[];');
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

  it('marks required fields and tree-shakes imports', () => {
    expect(source).toContain('<span className="text-destructive"> *</span>');
    expect(source).toContain(
      "import { Switch } from '@/components/ui/switch';",
    );
    expect(source).toContain(
      "import { Combobox } from '@/components/ui/combobox';",
    );
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
