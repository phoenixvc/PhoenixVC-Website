// features/layout/components/Layout.tsx
import { motion } from 'framer-motion';
import { LayoutProps } from '../types';
import { ThemeProvider } from '@/theme'; // Fix the import path
import { Header } from './Header';
import { Footer } from './Footer';
import { containerVariants } from '../animations';

const Layout = ({
    children,
    initialConfig = {
      colorScheme: 'blue',
      mode: 'light'
    },
}: LayoutProps) => {
  return (
    <ThemeProvider initialConfig={initialConfig}
    >
      <motion.div
        className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Header />
        <main className="flex-grow pt-20">
          {children}
        </main>
        <Footer />
      </motion.div>
    </ThemeProvider>
  );
};

export default Layout;
