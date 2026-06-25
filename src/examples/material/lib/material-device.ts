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

function definitionForSpec(
  defById: Map<string, SpecDefinition>,
  modelSpec: MaterialModelSpec,
): SpecDefinition | undefined {
  if (modelSpec.source === 'custom' && modelSpec.customDefinition) {
    return {
      id: modelSpec.id,
      ...modelSpec.customDefinition,
      allowModelOverride: true,
    };
  }
  return modelSpec.specDefinitionId
    ? defById.get(modelSpec.specDefinitionId)
    : undefined;
}

function optionIdsForSpec(
  definition: SpecDefinition,
  modelSpec: MaterialModelSpec,
): string[] | undefined {
  if (definition.dataType !== 'list') return undefined;
  return (modelSpec.allowedOptions ?? definition.options)?.map(
    (option) => option.id,
  );
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
      specValue.materialModelSpecId,
      specValue.value,
    ]),
  );

  return model.specs
    .filter((modelSpec) => modelSpec.materialValueMode === 'editable')
    .flatMap((modelSpec) => {
      const definition = definitionForSpec(defById, modelSpec);
      if (!definition) return [];

      const rawValue = valueById.get(modelSpec.id);
      const value = constrainSelectValue(
        definition,
        rawValue,
        optionIdsForSpec(definition, modelSpec),
      );

      if (isEmptySpecValue(value) || !isValidSpecValue(definition, value)) {
        return [];
      }

      return [{ materialModelSpecId: modelSpec.id, value }];
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
      specValue.materialModelSpecId,
      specValue.value,
    ]),
  );

  return model.specs.flatMap((modelSpec) => {
    if (!modelSpec.isRequired || modelSpec.materialValueMode === 'locked') {
      return [];
    }
    const definition = definitionForSpec(defById, modelSpec);
    const value =
      valueById.get(modelSpec.id) ??
      modelSpec.defaultValue ??
      definition?.defaultValue;
    if (
      !definition ||
      isEmptySpecValue(value) ||
      !isValidSpecValue(definition, value)
    ) {
      return [definition?.name ?? modelSpec.id];
    }
    return [];
  });
}
