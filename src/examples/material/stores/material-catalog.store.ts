import { useEffect, useState } from 'react';
import { INSPECTION_TABLES_MOCK } from '../data/inspection-tables.mock';
import { MATERIAL_MODELS_MOCK } from '../data/material-models.mock';
import { MATERIALS_MOCK } from '../data/materials.mock';
import type { InspectionTable } from '../model/inspection-table';
import type { Material } from '../model/material';
import type { MaterialModel } from '../model/material-model';

let inspectionTables = [...INSPECTION_TABLES_MOCK];
let materials = [...MATERIALS_MOCK];
let materialModels = [...MATERIAL_MODELS_MOCK];
let inspectionTableSeq = 0;
let materialSeq = 0;
let materialModelSeq = 0;

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function nextMaterialId() {
  materialSeq += 1;
  return `material-new-${materialSeq}`;
}

export function nextMaterialModelId() {
  materialModelSeq += 1;
  return `model-new-${materialModelSeq}`;
}

export function nextInspectionTableId() {
  inspectionTableSeq += 1;
  return `insp-new-${inspectionTableSeq}`;
}

export function useMaterialCatalogStore() {
  const [, setVersion] = useState(0);

  useEffect(() => subscribe(() => setVersion((version) => version + 1)), []);

  return {
    inspectionTables,
    materials,
    materialModels,
    upsertInspectionTable(table: InspectionTable) {
      inspectionTables = inspectionTables.some((item) => item.id === table.id)
        ? inspectionTables.map((item) => (item.id === table.id ? table : item))
        : [...inspectionTables, table];
      emitChange();
    },
    removeInspectionTable(id: string) {
      inspectionTables = inspectionTables.filter((table) => table.id !== id);
      emitChange();
    },
    upsertMaterial(material: Material) {
      materials = materials.some((item) => item.id === material.id)
        ? materials.map((item) => (item.id === material.id ? material : item))
        : [material, ...materials];
      emitChange();
    },
    removeMaterial(id: string) {
      materials = materials.filter((material) => material.id !== id);
      emitChange();
    },
    upsertMaterialModel(model: MaterialModel) {
      materialModels = materialModels.some((item) => item.id === model.id)
        ? materialModels.map((item) => (item.id === model.id ? model : item))
        : [model, ...materialModels];
      emitChange();
    },
    removeMaterialModel(id: string) {
      materialModels = materialModels.filter((model) => model.id !== id);
      emitChange();
    },
  };
}
