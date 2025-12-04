import { NavItem } from "@/types";
import { Home, Info, Target, Briefcase, FileText, Mail, BookOpen, Palette } from "lucide-react";

// Main navigation items used in both header and sidebar
// Section links (anchors on main page) come before page links
export const navItems: NavItem[] = [
  // Main page
  { label: "Home", href: "/", icon: <Home size={20} /> },
  // Section links (on main page)
  { label: "Focus Areas", href: "/#focus-areas", icon: <Target size={20} /> },
  { label: "Contact", href: "/#contact", icon: <Mail size={20} /> },
  // Separate page links
  { label: "About", href: "/about", icon: <Info size={20} /> },
  { label: "Portfolio", href: "/portfolio", icon: <Briefcase size={20} /> },
  { label: "Blog", href: "/blog", icon: <FileText size={20} /> },
];

// Resource items for sidebar only
export const resourceItems: NavItem[] = [
  { label: "Documentation", href: "https://docs.example.com", icon: <BookOpen size={20} /> },
  { label: "Theme Designer", href: "/theme-designer", icon: <Palette size={20} /> },
];

export const socialLinks = [
  { href: "https://www.linkedin.com/company/101922781/", label: "LinkedIn", icon: "linkedin" },
  { href: "https://ebenmare.substack.com/", label: "Substack", icon: "substack" },
];
