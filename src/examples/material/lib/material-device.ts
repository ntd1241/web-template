import type {
  Material,
  MaterialGroupKey,
  MaterialSpecValue,
} from '../model/material';
import type { MaterialModel, MaterialModelSpec } from '../model/material-model';
import type { SpecDefinition } from '../model/spec-definition';
import {
  constrainSelectValue,
  isEmptySpecValue,
  isValidSpecValue,
} from './spec-value';

function optionIdsForSpec(
  definition: SpecDefinition,
  modelSpec: MaterialModelSpec,
): string[] | undefined {
  if (definition.dataType !== 'list') return undefined;
  if (definition.allowDynamicValues) {
    return modelSpec.dynamicOptions?.map((option) => option.id);
  }
  return modelSpec.allowedOptionIds;
}

export function legacyGroupFromModelGroupId(groupId: string): MaterialGroupKey {
  if (groupId === 'grp-kiem-ke') return 'kiem-ke';
  if (groupId === 'grp-an-toan' || groupId === 'grp-pccc') return 'an-toan';
  if (groupId === 'grp-cong-cu') return 'cong-cu';
  return 'van-phong';
}

export function getModelForMaterial(
  material: Pick<Material, 'modelId'>,
  models: MaterialModel[],
): MaterialModel | undefined {
  return models.find((model) => model.id === material.modelId);
}

export function getDerivedGroupIdForMaterial(
  material: Pick<Material, 'modelId'>,
  models: MaterialModel[],
): string | undefined {
  return getModelForMaterial(material, models)?.groupId;
}

export function buildMaterialSpecValues(
  model: MaterialModel,
  specValues: MaterialSpecValue[],
  definitions: SpecDefinition[],
): MaterialSpecValue[] {
  const defById = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );
  const valueById = new Map(
    specValues.map((specValue) => [
      specValue.specDefinitionId,
      specValue.value,
    ]),
  );

  return model.specs
    .filter((modelSpec) => modelSpec.deviceMode !== 'fixed')
    .flatMap((modelSpec) => {
      const definition = defById.get(modelSpec.specDefinitionId);
      if (!definition) return [];

      const rawValue = valueById.get(modelSpec.specDefinitionId);
      const value =
        modelSpec.deviceMode === 'select'
          ? constrainSelectValue(
              definition,
              rawValue,
              optionIdsForSpec(definition, modelSpec),
            )
          : rawValue;

      if (isEmptySpecValue(value) || !isValidSpecValue(definition, value)) {
        return [];
      }

      return [{ specDefinitionId: modelSpec.specDefinitionId, value }];
    });
}

export function validateMaterialSpecValues(
  model: MaterialModel,
  specValues: MaterialSpecValue[],
  definitions: SpecDefinition[],
): string[] {
  const defById = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );
  const valueById = new Map(
    buildMaterialSpecValues(model, specValues, definitions).map((specValue) => [
      specValue.specDefinitionId,
      specValue.value,
    ]),
  );

  return model.specs.flatMap((modelSpec) => {
    if (!modelSpec.isRequired || modelSpec.deviceMode === 'fixed') return [];
    const definition = defById.get(modelSpec.specDefinitionId);
    const value =
      valueById.get(modelSpec.specDefinitionId) ??
      modelSpec.modelValue ??
      definition?.defaultValue;
    if (
      !definition ||
      isEmptySpecValue(value) ||
      !isValidSpecValue(definition, value)
    ) {
      return [definition?.name ?? modelSpec.specDefinitionId];
    }
    return [];
  });
}
