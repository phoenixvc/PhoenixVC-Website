// features/sidebar/constants.ts
import { Home, BookOpen, Palette, FileText, Code, Briefcase, Mail } from "lucide-react";
import { SidebarGroup, SidebarItemGroup, SidebarItemLink } from "../types";

// First, define the sidebar links with proper typing
export const SIDEBAR_LINKS: SidebarItemGroup[] = [
  {
    type: "group",
    label: "Navigation",
    title: "Navigation",
    active: false,
    children: [
      {
        type: "link",
        label: "Home",
        icon: <Home size={20} />,
        href: "/",
        active: false
      },
      {
        type: "link",
        label: "Portfolio",
        icon: <Briefcase size={20} />,
        href: "/#portfolio",
        active: false
      },
      {
        type: "link",
        label: "Blog",
        icon: <FileText size={20} />,
        href: "/blog",
        active: false
      },
      {
        type: "link",
        label: "Projects",
        icon: <Code size={20} />,
        href: "/projects",
        active: false
      },
      {
        type: "link",
        label: "Contact",
        icon: <Mail size={20} />,
        href: "/#contact",
        active: false
      }
    ]
  },
  {
    type: "group",
    label: "Resources",
    title: "Resources",
    active: false,
    children: [
      {
        type: "link",
        label: "Documentation",
        icon: <BookOpen size={20} />,
        href: "https://docs.example.com",
        active: false
      },
      {
        type: "link",
        label: "Theme Designer",
        icon: <Palette size={20} />,
        href: "/theme-designer",
        active: false
      }
    ]
  }
];

// Create sidebar groups from the links with proper type safety
export const DEFAULT_SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    title: "Main Navigation",
    items: SIDEBAR_LINKS.find(item => item.label === "Navigation")?.children.filter(
      child => child.type === "link"
    ) as SidebarItemLink[] || []
  },
  {
    title: "Resources",
    items: SIDEBAR_LINKS.find(item => item.label === "Resources")?.children.filter(
      child => child.type === "link"
    ) as SidebarItemLink[] || []
  }
];
