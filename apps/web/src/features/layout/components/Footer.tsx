import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import { NAV_ITEMS, SOCIAL_LINKS } from "../constants";
import { containerVariants, itemVariants } from "../animations";

export const Footer: React.FC = () => {

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-12 transition-colors"
      style={{ borderTop: "1px solid hsl(var(--color-border) / 0.1)" }}
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left section: Logo and description */}
          <motion.div className="md:col-span-2" variants={itemVariants}>
            <Logo />
            <p className="mt-4 max-w-md text-[hsl(var(--color-muted))]">
              Empowering visionary entrepreneurs and innovative startups to shape the future of technology.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-4 text-lg font-semibold text-[hsl(var(--color-text))]">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <a
                    href={link.href}
                    className="transition-colors hover:text-[hsl(var(--color-text))] text-[hsl(var(--color-muted))]"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div variants={itemVariants}>
            <h4 className="mb-4 text-lg font-semibold text-[hsl(var(--color-text))]">
              Connect
            </h4>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <motion.li key={link.href} variants={itemVariants}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-[hsl(var(--color-text))] text-[hsl(var(--color-muted))]"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Footer bottom */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t transition-colors text-center"
          style={{ borderTop: "1px solid hsl(var(--color-border) / 0.1)" }}
        >
          <p className="text-[hsl(var(--color-muted))]">
            &copy; {new Date().getFullYear()} Phoenix VC. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
