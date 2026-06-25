/**
 * Hợp nhất `MaterialModel.specs` + override của thiết bị (`Material.specValues`)
 * ra danh sách thông số hiệu lực để hiển thị/sửa ở thiết bị thật.
 *
 * Quy tắc theo materialValueMode:
 *  - locked: value = model.defaultValue ?? catalog.defaultValue, chỉ đọc
 *  - editable: value = material override ?? model/default catalog value
 */
import type { Material } from '../model/material';
import type { MaterialModel, MaterialModelSpec } from '../model/material-model';
import type {
  SpecDefinition,
  SpecOption,
  SpecValue,
} from '../model/spec-definition';
import { constrainSelectValue } from './spec-value';

export type EffectiveSpecSource = 'model' | 'device' | 'default';

export interface EffectiveSpec {
  materialModelSpecId: string;
  specDefinitionId?: string;
  definition: SpecDefinition | undefined;
  value: SpecValue | undefined;
  options?: SpecOption[];
  isReadOnly: boolean;
  isRequired: boolean;
  source: EffectiveSpecSource;
}

function definitionForSpec(
  defById: Map<string, SpecDefinition>,
  spec: MaterialModelSpec,
): SpecDefinition | undefined {
  if (spec.source === 'custom' && spec.customDefinition) {
    return {
      id: spec.id,
      ...spec.customDefinition,
      allowModelOverride: true,
    };
  }
  return spec.specDefinitionId ? defById.get(spec.specDefinitionId) : undefined;
}

function optionsForSpec(
  definition: SpecDefinition | undefined,
  spec: MaterialModelSpec,
): SpecOption[] | undefined {
  if (definition?.dataType !== 'list') return undefined;
  return spec.allowedOptions ?? definition.options;
}

export function resolveEffectiveSpecs(
  model: MaterialModel,
  material: Pick<Material, 'specValues'>,
  definitions: SpecDefinition[],
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
      const options = optionsForSpec(definition, spec);

      let value: SpecValue | undefined;
      let source: EffectiveSpecSource;

      if (spec.materialValueMode === 'locked') {
        value = spec.defaultValue ?? definition?.defaultValue;
        source = 'model';
      } else if (override !== undefined) {
        value = definition
          ? constrainSelectValue(
              definition,
              override,
              options?.map((option) => option.id),
            )
          : override;
        source = 'device';
      } else {
        value = definition
          ? constrainSelectValue(
              definition,
              spec.defaultValue ?? definition.defaultValue,
              options?.map((option) => option.id),
            )
          : spec.defaultValue;
        source = 'default';
      }

      return {
        materialModelSpecId: spec.id,
        specDefinitionId: spec.specDefinitionId,
        definition,
        value,
        options,
        isReadOnly: spec.materialValueMode === 'locked',
        isRequired: spec.isRequired,
        source,
      };
    });
}
