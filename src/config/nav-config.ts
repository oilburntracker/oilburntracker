import { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Live Map',
    url: '/dashboard/overview',
    icon: 'map',
    isActive: false,
    items: []
  },
  {
    title: 'Impact',
    url: '/dashboard/impact',
    icon: 'receipt',
    isActive: false,
    items: []
  },
  {
    title: 'Fire List',
    url: '/dashboard/fires',
    icon: 'fire',
    isActive: false,
    items: []
  },
  {
    title: 'Emissions',
    url: '/dashboard/timeline',
    icon: 'timeline',
    isActive: false,
    items: []
  },
  {
    title: 'What We Lost',
    url: '/dashboard/lost',
    icon: 'heart',
    isActive: false,
    items: []
  },
  {
    title: 'About',
    url: '/dashboard/about',
    icon: 'about',
    isActive: false,
    items: []
  }
];
