// components/InvestmentFocus/InvestmentFocus.tsx
import { motion, AnimatePresence } from "framer-motion";
import { FOCUS_AREAS } from "../../constants";
import { investmentFocusAnimations } from "../../animations/animations";
import InvestmentCard from "../InvestmentCard/InvestmentCard";
import styles from "./InvestmentFocus.module.css";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { FC, useState } from "react";
import { FocusArea } from "../../types";
import { X } from "lucide-react";
import { logger } from "@/utils/logger";

interface InvestmentFocusProps {
  isDarkMode?: boolean;
}

// Extended details for each focus area
const focusAreaDetails: Record<string, { longDescription: string; highlights: string[] }> = {
  "Blockchain Technology": {
    longDescription: "We invest in cutting-edge decentralized solutions and Web3 infrastructure that are reshaping how we interact with digital systems. Our focus includes blockchain protocols, decentralized finance (DeFi), digital asset management, and enterprise blockchain solutions.",
    highlights: ["Smart Contract Platforms", "DeFi Protocols", "NFT Infrastructure", "Cross-chain Solutions", "Enterprise Blockchain"]
  },
  "Fintech": {
    longDescription: "We support innovative financial technology solutions that promote financial inclusion and transform traditional banking. Our investments span digital payments, neobanking, lending platforms, insurance technology, and regulatory technology.",
    highlights: ["Digital Payments", "Neobanking", "Lending Platforms", "InsurTech", "RegTech"]
  },
  "AI & Machine Learning": {
    longDescription: "We back breakthrough innovations in artificial intelligence and machine learning that have the potential to transform industries. Our focus includes generative AI, natural language processing, computer vision, and enterprise AI solutions.",
    highlights: ["Generative AI", "NLP & LLMs", "Computer Vision", "AI Infrastructure", "MLOps"]
  },
  "ESG": {
    longDescription: "We invest in companies and technologies that contribute to environmental sustainability, social responsibility, and good governance. Our focus includes clean energy, sustainable agriculture, circular economy solutions, and impact measurement tools.",
    highlights: ["Clean Energy", "Sustainable Agriculture", "Circular Economy", "Carbon Markets", "Impact Analytics"]
  }
};

export const InvestmentFocus: FC<InvestmentFocusProps> = ({ isDarkMode = true }) => {
  const [selectedArea, setSelectedArea] = useState<FocusArea | null>(null);

  // Use our observer hook and log when the section becomes visible
  const sectionRef = useSectionObserver("focus-areas", (id) => {
    logger.debug(`[Focus] Section "${id}" is now visible`);
  });

  const handleCardClick = (area: FocusArea) => {
    setSelectedArea(area);
  };

  const handleCloseModal = () => {
    setSelectedArea(null);
  };

  return (
    <section
      id="focus-areas"
      ref={sectionRef}
      className={`${styles.section} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
    >
      <motion.div
        className="container mx-auto px-6 max-w-6xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={investmentFocusAnimations.container}
      >
        {/* Section Heading */}
        <motion.h2
          variants={investmentFocusAnimations.header}
          className={styles.heading}
        >
          Focus Areas
        </motion.h2>

        {/* Grid of Focus Areas */}
        <motion.div
          className={styles.grid}
          variants={investmentFocusAnimations.container}
        >
          {FOCUS_AREAS.map((area, index) => (
            <InvestmentCard
              key={index}
              area={area}
              index={index}
              isDarkMode={isDarkMode}
              onClick={() => handleCardClick(area)}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedArea && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className={`${styles.modal} ${isDarkMode ? styles.darkMode : styles.lightMode}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeButton}
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </button>

              <div className={styles.modalIcon}>{selectedArea.icon}</div>
              <h3 className={styles.modalTitle}>{selectedArea.title}</h3>
              <p className={styles.modalDescription}>
                {focusAreaDetails[selectedArea.title]?.longDescription || selectedArea.description}
              </p>

              {focusAreaDetails[selectedArea.title]?.highlights && (
                <div className={styles.highlightsSection}>
                  <h4 className={styles.highlightsTitle}>Key Focus Areas</h4>
                  <div className={styles.highlightsTags}>
                    {focusAreaDetails[selectedArea.title].highlights.map((highlight, idx) => (
                      <span key={idx} className={styles.highlightTag}>
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a href="/#contact" className={styles.modalCta} onClick={handleCloseModal}>
                Discuss Opportunities
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default InvestmentFocus;
