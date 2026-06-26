import type { MaterialGroup } from '../model/material-group';

/** Cây nhóm vật tư mock — giữ các nhóm legacy làm nhánh để bảng cũ không vỡ. */
export const MATERIAL_GROUPS_MOCK: MaterialGroup[] = [
  {
    id: 'grp-kiem-dinh',
    code: 'NHOM-KD',
    name: 'Vật tư kiểm định',
    parentId: null,
    description: 'Thiết bị nâng hạ phải kiểm định an toàn.',
    sortOrder: 0,
  },
  {
    id: 'grp-palang',
    code: 'NHOM-PALANG',
    name: 'Palăng',
    parentId: 'grp-kiem-dinh',
    sortOrder: 1,
  },
  {
    id: 'grp-mobile',
    code: 'NHOM-DD',
    name: 'Thiết bị di động',
    parentId: null,
    description: 'Điện thoại, máy tính bảng',
    sortOrder: 1,
  },
  {
    id: 'grp-phone',
    code: 'NHOM-DT',
    name: 'Điện thoại',
    parentId: 'grp-mobile',
    sortOrder: 1,
  },
  {
    id: 'grp-kiem-ke',
    code: 'NHOM-KK',
    name: 'Thiết bị kiểm kê',
    parentId: null,
    sortOrder: 2,
  },
  {
    id: 'grp-van-phong',
    code: 'NHOM-VP',
    name: 'Văn phòng',
    parentId: null,
    sortOrder: 3,
  },
  {
    id: 'grp-an-toan',
    code: 'NHOM-AT',
    name: 'An toàn lao động',
    parentId: null,
    sortOrder: 4,
  },
  {
    id: 'grp-pccc',
    code: 'NHOM-PCCC',
    name: 'Thiết bị PCCC',
    parentId: 'grp-an-toan',
    sortOrder: 1,
  },
  {
    id: 'grp-cong-cu',
    code: 'NHOM-CC',
    name: 'Công cụ - dụng cụ',
    parentId: null,
    sortOrder: 5,
  },
];
