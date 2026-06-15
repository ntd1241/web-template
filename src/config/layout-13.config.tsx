import {
  Bolt,
  Briefcase,
  ChartLine,
  Cog,
  Download,
  FileChartLine,
  Megaphone,
  Newspaper,
  SquareActivity,
  UserRoundCog,
  Users,
} from 'lucide-react';
import { MenuConfig } from '@/config/types';

export const MENU_SIDEBAR_MAIN: MenuConfig = [
  {
    title: 'General',
    children: [
      {
        title: 'Dashboards',
        path: '#',
        icon: Bolt,
      },
      {
        title: 'Public Profiles',
        path: '/layout-13',
        icon: Users,
      },
      {
        title: 'Account Settings',
        path: '#',
        icon: UserRoundCog,
      },
      {
        title: 'Network',
        path: '#',
        icon: Cog,
        badge: 'Beta',
      },
      {
        title: 'Authentication',
        path: '#',
        icon: ChartLine,
      },
    ],
  },
];

export const MENU_SIDEBAR_RESOURCES: MenuConfig = [
  {
    title: 'Resources',
    children: [
      {
        title: 'About Metronic',
        path: '#',
        icon: Download,
      },
      {
        title: 'Advertise',
        path: '#',
        icon: FileChartLine,
        badge: 'Pro',
      },
      {
        title: 'Help',
        path: '#',
        icon: SquareActivity,
      },
      {
        title: 'Blog',
        path: '#',
        icon: Newspaper,
      },
      {
        title: 'Careers',
        path: '#',
        icon: Briefcase,
      },
      {
        title: 'Press',
        path: '#',
        icon: Megaphone,
      },
    ],
  },
];
