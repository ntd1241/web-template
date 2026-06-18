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
  name: 'Máy kiểm kê QR S-24',
  location: 'Kho trung tâm - Tầng 2 - Khu thiết bị kiểm kê',
  status: 'Đang sử dụng',
  serialNumber: 'S24-2026-0601',
  code: 'TB-QR-000601',
  group: 'Thiết bị kiểm kê',
  department: 'Phòng Hành chính',
  owner: 'Nguyễn Minh Anh',
  nextMaintenanceDate: '30/06/2026',
  lastInventoryDate: '15/06/2026',
} as const;

export const materialGalleryItems = [
  'Máy kiểm kho',
  'Tem QR',
  'Bàn giao',
  'Kiểm kê',
  'Bảo trì',
  'Hồ sơ',
];

export const materialFacts = [
  {
    label: 'Mã vật tư',
    value: materialPublicInfo.code,
    icon: QrCode,
    tone: 'primary',
  },
  {
    label: 'Nhóm thiết bị',
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
