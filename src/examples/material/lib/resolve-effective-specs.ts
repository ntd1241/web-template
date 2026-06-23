/**
 * Hợp nhất `MaterialModel.specs` + override của thiết bị (`Material.specValues`)
 * ra danh sách thông số hiệu lực để hiển thị/sửa ở thiết bị thật.
 *
 * Quy tắc theo deviceMode:
 *  - fixed : value = model.modelValue (read-only, kế thừa)
 *  - input : value = device override ?? model.modelValue (default)
 *  - select: value = device override, ràng buộc trong allowedOptionIds
 */
import type { Material } from '../model/material';
import type { MaterialModel, SpecDeviceMode } from '../model/material-model';
import type { SpecDefinition, SpecValue } from '../model/spec-definition';
import { constrainSelectValue } from './spec-value';

export type EffectiveSpecSource = 'model' | 'device' | 'default';

export interface EffectiveSpec {
  specDefinitionId: string;
  definition: SpecDefinition | undefined;
  deviceMode: SpecDeviceMode;
  value: SpecValue | undefined;
  isReadOnly: boolean;
  isRequired: boolean;
  source: EffectiveSpecSource;
}

export function resolveEffectiveSpecs(
  model: MaterialModel,
  material: Pick<Material, 'specValues'>,
  definitions: SpecDefinition[],
): EffectiveSpec[] {
  const defById = new Map(definitions.map((d) => [d.id, d]));
  const overrideById = new Map(
    material.specValues.map((sv) => [sv.specDefinitionId, sv.value]),
  );

  return [...model.specs]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((spec) => {
      const definition = defById.get(spec.specDefinitionId);
      const override = overrideById.get(spec.specDefinitionId);

      let value: SpecValue | undefined;
      let source: EffectiveSpecSource;
      let isReadOnly = false;

      switch (spec.deviceMode) {
        case 'fixed':
          value = spec.modelValue;
          source = 'model';
          isReadOnly = true;
          break;
        case 'input':
          if (override !== undefined) {
            value = override;
            source = 'device';
          } else {
            value = spec.modelValue;
            source = 'default';
          }
          break;
        case 'select':
        default:
          value = definition
            ? constrainSelectValue(
                definition.dataType,
                override,
                spec.allowedOptionIds,
              )
            : override;
          source = 'device';
          break;
      }

      return {
        specDefinitionId: spec.specDefinitionId,
        definition,
        deviceMode: spec.deviceMode,
        value,
        isReadOnly,
        isRequired: spec.isRequired,
        source,
      };
    });
}
