// features/layout/components/Footer.tsx
import { motion } from 'framer-motion';
import { Logo } from "@/features/navigation/components/Logo";
import { NAV_ITEMS, SOCIAL_LINKS } from '../constants';
import { FooterProps } from '../types';
import { containerVariants, itemVariants } from '../animations';

export const Footer = ({ colorScheme = 'blue' }: FooterProps) => {
  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-12 border-t border-white/10"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            className="md:col-span-2"
            variants={itemVariants}
          >
            <Logo colorScheme={colorScheme} />
            <p className="text-gray-400 max-w-md mt-4">
              Empowering visionary entrepreneurs and innovative startups to shape the future of technology.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={itemVariants}
                >
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              {SOCIAL_LINKS.map((link) => (
                <motion.li
                  key={link.href}
                  variants={itemVariants}
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400"
        >
          <p>&copy; {new Date().getFullYear()} Phoenix VC. All rights reserved.</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
