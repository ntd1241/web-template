import type { MaterialSpecification } from '../model/material-specification';

export const MATERIAL_SPECIFICATIONS: MaterialSpecification[] = [
  { id: 'type', name: 'Loại bình', value: 'Bình chữa cháy bột ABC' },
  { id: 'agent', name: 'Chất chữa cháy', value: 'Bột ABC' },
  { id: 'agent-weight', name: 'Khối lượng chất chữa cháy', value: '4 kg' },
  { id: 'total-weight', name: 'Tổng khối lượng', value: '5,6 kg' },
  { id: 'working-pressure', name: 'Áp suất làm việc', value: '1,2 MPa' },
  { id: 'test-pressure', name: 'Áp suất thử', value: '2,5 MPa' },
  { id: 'discharge-range', name: 'Tầm phun hiệu quả', value: 'Từ 3 m' },
  { id: 'discharge-time', name: 'Thời gian phun', value: 'Từ 13 giây' },
  { id: 'temperature', name: 'Nhiệt độ hoạt động', value: '-20°C đến 55°C' },
  { id: 'fire-rating', name: 'Cấp chữa cháy', value: '2A, 55B, C' },
  { id: 'standard', name: 'Tiêu chuẩn áp dụng', value: 'TCVN 7026:2013' },
];
