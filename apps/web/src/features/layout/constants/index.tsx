// constants.ts or where your SOCIAL_LINKS is defined
import { Linkedin, Github, Newspaper } from "lucide-react"; // Import icons from lucide-react

export const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/company/101922781/",
    label: "LinkedIn",
    icon: <Linkedin size={18} />,
  },
  {
    href: "https://github.com/phoenixvc",
    label: "GitHub",
    icon: <Github size={18} />,
  },
  {
    href: "https://ebenmare.substack.com/",
    label: "Substack",
    icon: <Newspaper size={16} />,
  },
] as const;
