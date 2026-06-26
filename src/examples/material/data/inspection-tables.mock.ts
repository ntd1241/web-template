import type { InspectionTable } from '../model/inspection-table';

export const INSPECTION_TABLES_MOCK: InspectionTable[] = [
  {
    id: 'insp-palang',
    code: 'KD-PALANG',
    name: 'Tiêu chuẩn kiểm định palăng',
    description: 'Checklist kiểm định an toàn palăng xích/cáp.',
    criteria: [
      {
        id: 'pl-1',
        order: 1,
        content: 'Kết cấu khung dầm chịu lực không bị nứt, biến dạng, rỉ sét.',
      },
      {
        id: 'pl-2',
        order: 2,
        content: 'Bu lông, liên kết mối hàn chắc chắn, không bị lỏng/nứt.',
      },
      {
        id: 'pl-3',
        order: 3,
        content: 'Móc cẩu: Không nứt, độ mòn lòng móc không quá 10%.',
      },
      {
        id: 'pl-4',
        order: 4,
        content:
          'Chốt chặn an toàn (safety latch) tại miệng móc hoạt động tốt.',
      },
      {
        id: 'pl-5',
        order: 5,
        content: 'Móc cẩu tự xoay trơn tru quanh trục, không bị kẹt.',
      },
      {
        id: 'pl-6',
        order: 6,
        content:
          'Đối với palang cáp: Cáp không bị nổ, đứt sợi quá giới hạn, không bị dập hay xoắn thắt nút.',
      },
      {
        id: 'pl-7',
        order: 7,
        content:
          'Đối với palang xích: Xích không bị mòn mắt, không rạn nứt hay giãn dài quá mức cho phép.',
      },
      {
        id: 'pl-8',
        order: 8,
        content:
          'Tang cuốn cáp và puly dẫn hướng không bị mòn rãnh hoặc sứt mẻ.',
      },
      {
        id: 'pl-9',
        order: 9,
        content: 'Bộ phận xếp cáp (nếu có) hoạt động trơn tru, không kẹt cáp.',
      },
    ],
  },
  {
    id: 'insp-thang',
    code: 'KD-THANG',
    name: 'Tiêu chuẩn kiểm định thang nhôm',
    description: 'Checklist kiểm định an toàn thang/giàn giáo di động.',
    criteria: [
      {
        id: 'th-1',
        order: 1,
        content: 'Bậc thang không nứt, cong vênh, không lỏng mối ghép.',
      },
      {
        id: 'th-2',
        order: 2,
        content: 'Chân thang có đệm chống trượt, không mòn quá mức.',
      },
      {
        id: 'th-3',
        order: 3,
        content: 'Khớp khóa, bản lề hoạt động chắc chắn, không rơ lỏng.',
      },
    ],
  },
];
