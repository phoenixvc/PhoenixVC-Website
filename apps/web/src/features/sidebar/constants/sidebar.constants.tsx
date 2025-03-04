import { SidebarItemType } from "../types";
import { Home, BookOpen, Palette, FileText, Code, Briefcase, Mail } from "lucide-react";

export const SIDEBAR_LINKS: SidebarItemType[] = [
  {
    type: "group",
    label: "Navigation",
    children: [
      {
        type: "link",
        label: "Home",
        icon: <Home size={20} />,
        href: "/"
      },
      {
        type: "link",
        label: "Portfolio",
        icon: <Briefcase size={20} />,
        href: "/#portfolio"
      },
      {
        type: "link",
        label: "Blog",
        icon: <FileText size={20} />,
        href: "/blog"
      },
      {
        type: "link",
        label: "Projects",
        icon: <Code size={20} />,
        href: "/projects"
      },
      {
        type: "link",
        label: "Contact",
        icon: <Mail size={20} />,
        href: "/#contact"
      }
    ]
  },
  {
    type: "group",
    label: "Resources",
    children: [
      {
        type: "link",
        label: "Documentation",
        icon: <BookOpen size={20} />,
        href: "https://docs.{domainname}." //{//this actual domain - TODO< correct}
      },
      {
        type: "link",
        label: "Theme Designer",
        icon: <Palette size={20} />,
        href: "/theme-designer"
      }
    ]
  }
];
