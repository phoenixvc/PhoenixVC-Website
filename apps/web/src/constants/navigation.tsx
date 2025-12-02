import { NavItem } from "@/types";
import { Home, Info, Target, Briefcase, FileText, Mail, BookOpen, Palette } from "lucide-react";

// Main navigation items used in both header and sidebar
export const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: <Home size={20} /> },
  { label: "About", href: "/about", icon: <Info size={20} /> },
  { label: "Focus Areas", href: "/#focus-areas", icon: <Target size={20} /> },
  { label: "Portfolio", href: "/portfolio", icon: <Briefcase size={20} /> },
  { label: "Blog", href: "/blog", icon: <FileText size={20} /> },
  { label: "Contact", href: "/#contact", icon: <Mail size={20} /> },
];

// Resource items for sidebar only
export const resourceItems: NavItem[] = [
  { label: "Documentation", href: "https://docs.example.com", icon: <BookOpen size={20} /> },
  { label: "Theme Designer", href: "/theme-designer", icon: <Palette size={20} /> },
];

export const socialLinks = [
  { href: "#", label: "LinkedIn", icon: "linkedin" },
  { href: "#", label: "Twitter", icon: "twitter" },
  { href: "#", label: "Medium", icon: "medium" },
];
