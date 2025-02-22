import { FC, memo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import ContactHeader from "../ContactHeader/ContactHeader";
import ContactForm from "../ContactForm/ContactForm";
import { contactAnimations } from "../../animations";
import { DEFAULT_CONTACT_CONTENT } from "../../constants";
import styles from "./Contact.module.css"; // CSS module for contact section
import type { ContactFormData, ContactState } from "../../types";
import { useSectionObserver } from "@/hooks/useSectionObserver";

const Contact: FC = memo(() => {
  const [state, setState] = useState<ContactState>({
    isLoading: false,
    error: null,
  });

  // Use our observer hook and log when the section becomes visible
  // this shouldn't be needed with newer react versions
  const sectionRef = useSectionObserver("contact", (id) => {
    console.log(`[Contact] Section "${id}" is now visible`);
  });

  const handleSubmit = useCallback(async (data: ContactFormData) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", data);
    } catch (error) {
      console.error("Error submitting form:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to submit form. Please try again.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <section id="contact" ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <motion.div
          className={styles.content}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={contactAnimations.container}
        >
          <ContactHeader
            title={DEFAULT_CONTACT_CONTENT.title}
            subtitle={DEFAULT_CONTACT_CONTENT.subtitle}
          />

          {state.error && (
            <motion.div className={styles.error} variants={contactAnimations.item}>
              {state.error}
            </motion.div>
          )}

          <ContactForm onSubmit={handleSubmit} isLoading={state.isLoading} />
        </motion.div>
      </div>
    </section>
  );
});

Contact.displayName = "Contact";
export default Contact;
