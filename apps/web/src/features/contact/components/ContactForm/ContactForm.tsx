// features/contact/components/ContactForm/ContactForm.tsx
import { FC, memo, useState } from "react";
import { motion } from "framer-motion";
import { contactAnimations } from "../../animations";
import styles from "./ContactForm.module.css";
import type { ContactFormData } from "../../types";

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  isLoading: boolean;
  isSuccess: boolean;
  isDarkMode: boolean;
}

const ContactForm: FC<ContactFormProps> = memo(({
  onSubmit,
  isLoading,
  isSuccess,
  isDarkMode
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    company: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div variants={contactAnimations.item}>
      <div className={`${styles.card} ${isDarkMode ? styles.dark : ""}`}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGrid}>
            <div>
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                className={styles.input}
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
              />
              {errors.name && <div className={styles.error}>{errors.name}</div>}
            </div>

            <div>
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading || isSuccess}
              />
              {errors.email && <div className={styles.error}>{errors.email}</div>}
            </div>
          </div>

          <div>
            <input
              type="text"
              name="company"
              placeholder="Company (Optional)"
              className={styles.input}
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading || isSuccess}
            />
          </div>

          <div>
            <textarea
              name="message"
              placeholder="Your Message"
              className={styles.textarea}
              rows={5}
              value={formData.message}
              onChange={handleChange}
              disabled={isLoading || isSuccess}
            />
            {errors.message && <div className={styles.error}>{errors.message}</div>}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? (
              <span className={styles.loading}>Sending...</span>
            ) : isSuccess ? (
              <span className={styles.success}>Message Sent</span>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
});

ContactForm.displayName = "ContactForm";
export default ContactForm;
