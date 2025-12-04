// components/InvestmentFocus/InvestmentFocus.tsx
import { motion, AnimatePresence } from "framer-motion";
import { FOCUS_AREAS } from "../../constants";
import { investmentFocusAnimations } from "../../animations/animations";
import InvestmentCard from "../InvestmentCard/InvestmentCard";
import styles from "./InvestmentFocus.module.css";
import { useSectionObserver } from "@/hooks/useSectionObserver";
import { useTheme } from "@/theme";
import { FC, useState, useRef, useEffect } from "react";
import { FocusArea } from "../../types";
import { X } from "lucide-react";
import { logger } from "@/utils/logger";

interface InvestmentFocusProps {}

// Extended details for each focus area
const focusAreaDetails: Record<string, { longDescription: string; highlights: string[] }> = {
  "Fintech & Blockchain": {
    longDescription: "We invest in cutting-edge financial technology and decentralized solutions that are reshaping how we interact with money and digital systems. Our focus includes blockchain protocols, decentralized finance (DeFi), digital payments, neobanking, and Web3 infrastructure.",
    highlights: ["DeFi Protocols", "Digital Payments", "Smart Contracts", "Neobanking", "Web3 Infrastructure"]
  },
  "AI & Machine Learning": {
    longDescription: "We back breakthrough innovations in artificial intelligence and machine learning that have the potential to transform industries. Our focus includes generative AI, natural language processing, computer vision, and enterprise AI solutions.",
    highlights: ["Generative AI", "NLP & LLMs", "Computer Vision", "AI Infrastructure", "MLOps"]
  },
  "Defense & Security": {
    longDescription: "We back advanced security solutions that protect people, infrastructure, and digital assets. Our investments span counter-drone technology, digital access management, cybersecurity, and physical security solutions.",
    highlights: ["Counter-Drone Systems", "Access Control", "Cybersecurity", "IoT Security", "Threat Detection"]
  },
  "Mobility & Transportation": {
    longDescription: "We invest in innovative transportation technology that makes mobility safer, more efficient, and more accessible. Our focus includes ride-sharing, urban mobility, logistics optimization, and smart transportation infrastructure.",
    highlights: ["Ride-Sharing", "Urban Mobility", "Route Optimization", "Safety Technology", "Smart Transportation"]
  }
};

export const InvestmentFocus: FC<InvestmentFocusProps> = ({}) => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === "dark";
  const [selectedArea, setSelectedArea] = useState<FocusArea | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Use our observer hook and log when the section becomes visible
  const sectionRef = useSectionObserver("focus-areas", (id) => {
    logger.debug(`[Focus] Section "${id}" is now visible`);
  });

  // TODO: Production hardening:
  // 1. Replace this with a more robust, battle-tested focus-trapping library
  //    like `focus-trap-react` to handle all edge cases.
  // 2. Add focus management to return focus to the originally clicked card
  //    when the modal is closed.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCloseModal();
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (selectedArea) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArea]);

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
              key={area.title} // Use a unique identifier for the key
              area={area}
              index={index}
              onClick={() => handleCardClick(area)}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {selectedArea && (
          <motion.button
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
            aria-label="Close modal"
          >
            <motion.div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              tabIndex={-1}
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
