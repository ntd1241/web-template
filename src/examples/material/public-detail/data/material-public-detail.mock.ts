import {
  AlertCircle,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Factory,
  Hammer,
  HardHat,
  History,
  ImageIcon,
  Info,
  MessageSquareWarning,
  PackageCheck,
  QrCode,
  ShieldCheck,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export type MaterialPublicTabValue =
  | 'general'
  | 'handover'
  | 'inventory'
  | 'repair'
  | 'feedback';

export interface MaterialPublicTab {
  value: MaterialPublicTabValue;
  label: string;
  icon: LucideIcon;
}

export const materialPublicTabs: MaterialPublicTab[] = [
  {
    value: 'general',
    label: 'Thông tin chung',
    icon: Info,
  },
  {
    value: 'handover',
    label: 'Lịch sử bàn giao',
    icon: History,
  },
  {
    value: 'inventory',
    label: 'Lịch sử kiểm kê',
    icon: ClipboardCheck,
  },
  {
    value: 'repair',
    label: 'Lịch sử sửa chữa',
    icon: Wrench,
  },
  {
    value: 'feedback',
    label: 'Phản ánh',
    icon: MessageSquareWarning,
  },
];

export const materialPublicInfo = {
  name: 'Bình chữa cháy bột ABC 4kg',
  location: 'Tòa nhà A - Tầng 1 - Sảnh thang máy',
  status: 'Đang sử dụng',
  serialNumber: 'MFZ4-24051867',
  code: 'PCCC-BC-00128',
  group: 'Thiết bị PCCC',
  department: 'Ban Quản lý tòa nhà',
  owner: 'Trần Quốc Bảo',
  nextMaintenanceDate: '15/12/2026',
  lastInventoryDate: '15/06/2026',
} as const;

/**
 * Ảnh mock không liên quan – thay bằng URL ảnh thật khi có.
 * Hiện dùng placeholder SVG (data-URI) để render được offline trong demo.
 */
function mockImage(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${color}"/>
      <stop offset="1" stop-color="#1f2937"/>
    </linearGradient></defs>
    <rect width="1200" height="900" fill="url(#g)"/>
    <text x="50%" y="50%" fill="#ffffff" font-family="sans-serif" font-size="64"
      font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface MaterialGalleryImage {
  id: string;
  label: string;
  url: string;
}

export const materialGalleryItems: MaterialGalleryImage[] = [
  {
    id: 'overview',
    label: 'Toàn cảnh',
    url: mockImage('Toàn cảnh', '#dc2626'),
  },
  {
    id: 'inspection',
    label: 'Tem kiểm định',
    url: mockImage('Tem kiểm định', '#2563eb'),
  },
  { id: 'gauge', label: 'Đồng hồ áp', url: mockImage('Đồng hồ áp', '#059669') },
  {
    id: 'safety-pin',
    label: 'Chốt an toàn',
    url: mockImage('Chốt an toàn', '#d97706'),
  },
  {
    id: 'location',
    label: 'Vị trí đặt',
    url: mockImage('Vị trí đặt', '#7c3aed'),
  },
  { id: 'qr', label: 'Mã QR', url: mockImage('Mã QR', '#0891b2') },
];

export const materialFacts = [
  {
    label: 'Mã vật tư',
    value: materialPublicInfo.code,
    icon: QrCode,
    imageSrc:
      'https://images.seeklogo.com/logo-png/21/2/qr-code-logo-png_seeklogo-217342.png',
    tone: 'primary',
  },
  {
    label: 'Nhóm vật tư',
    value: materialPublicInfo.group,
    icon: Boxes,
    tone: 'muted',
  },
  {
    label: 'Đơn vị quản lý',
    value: materialPublicInfo.department,
    icon: Factory,
    tone: 'primary',
  },
  {
    label: 'Người phụ trách',
    value: materialPublicInfo.owner,
    icon: UserRound,
    tone: 'muted',
  },
] as const;

export const publicDetailIcons = {
  AlertCircle,
  CalendarClock,
  ClipboardList,
  Hammer,
  HardHat,
  ImageIcon,
  Info,
  PackageCheck,
  ShieldCheck,
};
