// constants/navigation.ts
import { NavigationItem } from "../types";

// constants/navigation.ts
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    path: '/',
    label: 'Home',
    type: 'section',
    reference: 'home', // matches <div id="home">
    icon: 'home'
  },
  {
    path: '/#focus-areas',
    label: 'Focus Areas',
    type: 'section',
    reference: 'focus' // matches <div id="focus-areas">
  },
  {
    path: '/portfolio',
    label: 'Portfolio',
    type: 'page'
  },
  {
    path: '/blog',
    label: 'Blog',
    type: 'page'
  },
  {
    path: '/projects',
    label: 'Projects',
    type: 'page'
  },
  {
    path: '/#contact',
    label: 'Contact',
    type: 'section',
    reference: 'contact' // matches <div id="contact">
  }
];
