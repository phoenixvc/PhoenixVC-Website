import { motion } from "framer-motion"
import { LayoutProps } from "../types"
import { Header } from "./Header/Header"
import { Footer } from "./Footer"
import { containerVariants } from "../animations"

const Layout = ({ children }: LayoutProps) => {
  return (
    <motion.div
      className="min-h-screen flex flex-col transition-colors duration-200"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Header />
      <main className="flex-grow pt-20">{children}</main>
      <Footer />
    </motion.div>
  )
}

export default Layout
