/**
 * Hợp nhất `MaterialModel.specs` + override của thiết bị (`Material.specValues`)
 * ra danh sách thông số hiệu lực để hiển thị/sửa ở thiết bị thật.
 */
import type { Material } from '../model/material';
import type { MaterialModel, MaterialModelSpec } from '../model/material-model';
import type {
  ListSelectionMode,
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../model/spec-definition';
import type { SpecValueSet } from '../model/spec-value-set';
import { constrainSelectValue } from './spec-value';

export type EffectiveSpecSource = 'model' | 'device' | 'default';

export interface EffectiveSpec {
  materialModelSpecId: string;
  specDefinitionId?: string;
  definition: SpecDefinition | undefined;
  label: string;
  selectionMode?: ListSelectionMode;
  valueSetId?: string;
  valueSet?: SpecValueSet;
  value: SpecValue | undefined;
  options?: SpecOption[];
  isReadOnly: boolean;
  isRequired: boolean;
  source: EffectiveSpecSource;
}

interface ResolveContext {
  definitions: SpecDefinition[];
  valueSets: SpecValueSet[];
}

function definitionForSpec(
  defById: Map<string, SpecDefinition>,
  spec: MaterialModelSpec,
): SpecDefinition | undefined {
  if (spec.source === 'custom' && spec.customDefinition) {
    return {
      id: spec.id,
      code: spec.customDefinition.code,
      name: spec.customDefinition.name,
      dataType: spec.customDefinition.dataType,
      unit: spec.customDefinition.unit,
      defaultSelectionMode: spec.customDefinition.defaultSelectionMode,
      allowModelSelectionOverride: true,
      allowModelValueSetOverride: true,
      defaultValue: spec.customDefinition.defaultValue,
      description: spec.customDefinition.description,
    };
  }
  return spec.specDefinitionId ? defById.get(spec.specDefinitionId) : undefined;
}

export function resolveEffectiveLabel(
  spec: MaterialModelSpec,
  definition: SpecDefinition | undefined,
): string {
  return spec.labelOverride?.trim() || definition?.name || spec.id;
}

export function resolveEffectiveSelectionMode(
  spec: MaterialModelSpec,
  definition: SpecDefinition | undefined,
): ListSelectionMode | undefined {
  if (definition?.dataType !== 'list') return undefined;
  if (definition.allowModelSelectionOverride) {
    return spec.selectionModeOverride ?? definition.defaultSelectionMode ?? 'single';
  }
  return definition.defaultSelectionMode ?? 'single';
}

export function resolveEffectiveValueSet(
  spec: MaterialModelSpec,
  definition: SpecDefinition | undefined,
  valueSets: SpecValueSet[],
): SpecValueSet | undefined {
  if (definition?.dataType !== 'list') return undefined;
  const valueSetId = definition.allowModelValueSetOverride
    ? spec.valueSetIdOverride ?? definition.defaultValueSetId
    : definition.defaultValueSetId;
  return valueSetId ? valueSets.find((set) => set.id === valueSetId) : undefined;
}

export function resolveEffectiveOptions(
  spec: MaterialModelSpec,
  definition: SpecDefinition | undefined,
  valueSets: SpecValueSet[],
): SpecOption[] | undefined {
  if (definition?.dataType !== 'list') return undefined;

  if (spec.source === 'custom') {
    return spec.customDefinition?.options ?? [];
  }

  const valueSet = resolveEffectiveValueSet(spec, definition, valueSets);
  const options = valueSet?.options ?? [];
  if (
    !definition.allowModelValueSetOverride ||
    spec.optionSource?.mode !== 'subset'
  ) {
    return options;
  }

  const allowed = new Set(spec.optionSource.optionIds);
  return options.filter((option) => allowed.has(option.id));
}

function optionIdsForSpec(
  spec: MaterialModelSpec,
  definition: SpecDefinition | undefined,
  valueSets: SpecValueSet[],
): string[] | undefined {
  return resolveEffectiveOptions(spec, definition, valueSets)?.map(
    (option) => option.id,
  );
}

export function resolveDefinitionForSpec(
  spec: MaterialModelSpec,
  context: ResolveContext,
): SpecDefinition | undefined {
  const defById = new Map(context.definitions.map((d) => [d.id, d]));
  return definitionForSpec(defById, spec);
}

export function resolveEffectiveSpecs(
  model: MaterialModel,
  material: Pick<Material, 'specValues'>,
  definitions: SpecDefinition[],
  valueSets: SpecValueSet[],
): EffectiveSpec[] {
  const defById = new Map(definitions.map((d) => [d.id, d]));
  const overrideById = new Map(
    material.specValues.map((sv) => [sv.materialModelSpecId, sv.value]),
  );

  return [...model.specs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((spec) => {
      const definition = definitionForSpec(defById, spec);
      const override = overrideById.get(spec.id);
      const selectionMode = resolveEffectiveSelectionMode(spec, definition);
      const valueSet = resolveEffectiveValueSet(spec, definition, valueSets);
      const options = resolveEffectiveOptions(spec, definition, valueSets);
      const allowedOptionIds = optionIdsForSpec(spec, definition, valueSets);

      let value: SpecValue | undefined;
      let source: EffectiveSpecSource;

      if (spec.materialValueMode === 'locked') {
        value = definition
          ? constrainSelectValue(
              definition,
              spec.defaultValue ?? definition.defaultValue,
              allowedOptionIds,
              selectionMode,
            )
          : spec.defaultValue;
        source = 'model';
      } else if (override !== undefined) {
        value = definition
          ? constrainSelectValue(
              definition,
              override,
              allowedOptionIds,
              selectionMode,
            )
          : override;
        source = 'device';
      } else {
        value = definition
          ? constrainSelectValue(
              definition,
              spec.defaultValue ?? definition.defaultValue,
              allowedOptionIds,
              selectionMode,
            )
          : spec.defaultValue;
        source = 'default';
      }

      return {
        materialModelSpecId: spec.id,
        specDefinitionId: spec.specDefinitionId,
        definition,
        label: resolveEffectiveLabel(spec, definition),
        selectionMode,
        valueSetId: valueSet?.id,
        valueSet,
        value,
        options,
        isReadOnly: spec.materialValueMode === 'locked',
        isRequired: spec.isRequired,
        source,
      };
    });
}
