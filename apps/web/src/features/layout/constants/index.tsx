// constants.ts or where your SOCIAL_LINKS is defined
import { Linkedin, Twitter, Github } from "lucide-react"; // Import icons from lucide-react

export const SOCIAL_LINKS = [
  {
    href: "https://linkedin.com/company/phoenixvc",
    label: "LinkedIn",
    icon: <Linkedin size={18} />
  },
  {
    href: "https://twitter.com/phoenixvc",
    label: "Twitter",
    icon: <Twitter size={18} />
  },
  {
    href: "https://github.com/phoenixvc",
    label: "GitHub",
    icon: <Github size={18} />
  }
] as const;
