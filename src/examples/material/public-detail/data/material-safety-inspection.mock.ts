import type { MaterialSafetyInspectionItem } from '../model/material-safety-inspection';

export const materialSafetyInspectionItems: MaterialSafetyInspectionItem[] = [
  {
    id: 'safety-2026-06',
    inspectedAt: '2026-06-15',
    inspector: 'Phạm Anh Dũng',
    passedCriteria: 31,
    totalCriteria: 32,
    comment:
      'Tem kiểm định còn hạn, áp suất ổn định. Cần vệ sinh nhẹ phần quai xách và cập nhật ảnh hiện trạng.',
    result: 'passed',
    resultLabel: 'Đạt',
  },
  {
    id: 'safety-2026-03',
    inspectedAt: '2026-03-12',
    inspector: 'Lê Thị Mai',
    passedCriteria: 29,
    totalCriteria: 32,
    comment:
      'Bình đúng vị trí, niêm phong còn nguyên. Một số chỉ tiêu nhãn cảnh báo và khoảng trống tiếp cận cần bổ sung.',
    result: 'failed',
    resultLabel: 'Chưa đạt',
  },
  {
    id: 'safety-2025-12',
    inspectedAt: '2025-12-15',
    inspector: 'Nguyễn Văn Hùng',
    passedCriteria: 32,
    totalCriteria: 32,
    comment:
      'Hoàn tất kiểm tra sau nạp sạc, toàn bộ chỉ tiêu an toàn đạt yêu cầu vận hành.',
    result: 'passed',
    resultLabel: 'Đạt',
  },
];
