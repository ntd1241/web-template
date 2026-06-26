import type { MaterialGroup } from '../model/material-group';

/** Cây nhóm vật tư mock — 3 nhánh: Kiểm định, Kiểm tra, CCDC. */
export const MATERIAL_GROUPS_MOCK: MaterialGroup[] = [
  // Nhóm Kiểm định
  {
    id: 'grp-kiem-dinh',
    code: 'NHOM-KD',
    name: 'Nhóm Kiểm Định',
    parentId: null,
    description: 'Thiết bị nâng hạ / áp lực phải kiểm định an toàn.',
    sortOrder: 1,
  },
  {
    id: 'grp-palang',
    code: 'NHOM-PALANG',
    name: 'Palang',
    parentId: 'grp-kiem-dinh',
    sortOrder: 1,
  },
  {
    id: 'grp-palang-dien',
    code: 'NHOM-PALANG-DIEN',
    name: 'Palang điện',
    parentId: 'grp-kiem-dinh',
    sortOrder: 2,
  },
  {
    id: 'grp-cau-truc',
    code: 'NHOM-CAU-TRUC',
    name: 'Cẩu trục',
    parentId: 'grp-kiem-dinh',
    sortOrder: 3,
  },
  {
    id: 'grp-xe-nang',
    code: 'NHOM-XE-NANG',
    name: 'Xe nâng',
    parentId: 'grp-kiem-dinh',
    sortOrder: 4,
  },
  {
    id: 'grp-khi-nen',
    code: 'NHOM-KHI-NEN',
    name: 'Khí nén',
    parentId: 'grp-kiem-dinh',
    sortOrder: 5,
  },
  {
    id: 'grp-thang-may',
    code: 'NHOM-THANG-MAY',
    name: 'Thang máy',
    parentId: 'grp-kiem-dinh',
    sortOrder: 6,
  },
  {
    id: 'grp-thiet-bi-ap-luc',
    code: 'NHOM-AP-LUC',
    name: 'Thiết bị áp lực',
    parentId: 'grp-kiem-dinh',
    sortOrder: 7,
  },
  {
    id: 'grp-xe-nang-nguoi',
    code: 'NHOM-XE-NANG-NGUOI',
    name: 'Xe nâng người',
    parentId: 'grp-kiem-dinh',
    sortOrder: 8,
  },
  {
    id: 'grp-can-truc',
    code: 'NHOM-CAN-TRUC',
    name: 'Cần trục',
    parentId: 'grp-kiem-dinh',
    sortOrder: 9,
  },

  // Nhóm Kiểm tra
  {
    id: 'grp-kiem-tra',
    code: 'NHOM-KT',
    name: 'Nhóm Kiểm Tra',
    parentId: null,
    sortOrder: 2,
  },
  {
    id: 'grp-co',
    code: 'NHOM-CO',
    name: 'Cơ',
    parentId: 'grp-kiem-tra',
    sortOrder: 1,
  },
  {
    id: 'grp-dien',
    code: 'NHOM-DIEN',
    name: 'Điện',
    parentId: 'grp-kiem-tra',
    sortOrder: 2,
  },

  // Nhóm CCDC
  {
    id: 'grp-ccdc',
    code: 'NHOM-CCDC',
    name: 'Nhóm CCDC',
    parentId: null,
    sortOrder: 3,
  },
  {
    id: 'grp-ccdc-cau-keo',
    code: 'NHOM-CCDC-CAU-KEO',
    name: 'Nhóm CCDC cẩu kéo',
    parentId: 'grp-ccdc',
    sortOrder: 1,
  },
  {
    id: 'grp-ccdc-do',
    code: 'NHOM-CCDC-DO',
    name: 'Nhóm CCDC đo',
    parentId: 'grp-ccdc',
    sortOrder: 2,
  },
  {
    id: 'grp-dung-cu-thao-lap',
    code: 'NHOM-DUNG-CU-THAO-LAP',
    name: 'Nhóm dụng cụ tháo lắp',
    parentId: 'grp-ccdc',
    sortOrder: 3,
  },
  {
    id: 'grp-cntt',
    code: 'NHOM-CNTT',
    name: 'Nhóm CNTT',
    parentId: 'grp-ccdc',
    sortOrder: 4,
  },
];
