// components/Layout/Layout.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutProps } from "../types";
import { Header } from "./Header/Header";
import { Footer } from "./Footer/Footer";
import { containerVariants } from "../animations";
import Sidebar from "@/features/sidebar/components/Sidebar";
import styles from "./layout.module.css";

const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <motion.div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className={styles.layoutContainer}>
        <Header onMenuClick={() => setIsSidebarOpen(prev => !prev)} />

        <div className={styles.layoutContentWrapper}>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className={`${styles.mainContent} ${isSidebarOpen ? styles.withSidebar : ""}`}>
            {children}
          </main>
        </div>

        <Footer />
      </div>
    </motion.div>
  );
};

export default Layout;
