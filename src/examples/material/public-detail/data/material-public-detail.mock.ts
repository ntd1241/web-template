import {
  AlertCircle,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  ClipboardPenLine,
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
import { toAbsoluteUrl } from '@/lib/helpers';

export type MaterialPublicTabValue =
  | 'general'
  | 'handover'
  | 'inventory'
  | 'safety'
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
    value: 'safety',
    label: 'Quản lý an toàn',
    icon: ClipboardPenLine,
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
  issuedDate: '15/06/2026',
  nextMaintenanceDate: '15/12/2026',
  lastInventoryDate: '15/06/2026',
} as const;

export const materialQrLabel = {
  name: materialPublicInfo.name,
  code: materialPublicInfo.code,
  issuedDate: materialPublicInfo.issuedDate,
} as const;

export interface MaterialGalleryImage {
  id: string;
  label: string;
  url: string;
}

export const materialGalleryItems: MaterialGalleryImage[] = [
  {
    id: 'overview',
    label: 'Bình chữa cháy bột và CO₂',
    url: toAbsoluteUrl(
      '/media/images/ChatGPT Image Jun 30, 2026, 04_02_48 PM.png',
    ),
  },
  {
    id: 'co2-extinguisher',
    label: 'Bình chữa cháy CO₂ MT5 5kg',
    url: toAbsoluteUrl(
      '/media/images/ChatGPT Image Jun 30, 2026, 04_11_54 PM.png',
    ),
  },
];

export const materialFacts = [
  {
    label: 'Mã vật tư',
    value: materialPublicInfo.code,
    icon: QrCode,
    showQr: true,
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
  QrCode,
  ShieldCheck,
};
