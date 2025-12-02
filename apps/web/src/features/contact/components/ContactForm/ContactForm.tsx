// features/contact/components/ContactForm/ContactForm.tsx
import { FC, memo, useState, useCallback } from "react";
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
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});

  const validateField = useCallback((name: keyof ContactFormData, value: string): string => {
    switch (name) {
      case "name":
        return !value.trim() ? "Name is required" : "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Please enter a valid email address";
        return "";
      case "message":
        return !value.trim() ? "Message is required" : "";
      default:
        return "";
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field was touched
    if (touched[name as keyof ContactFormData]) {
      const error = validateField(name as keyof ContactFormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    // Validate on blur
    const error = validateField(name as keyof ContactFormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    const newTouched: Partial<Record<keyof ContactFormData, boolean>> = {};

    (["name", "email", "message"] as const).forEach((field) => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
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
            <div className={styles.inputWrapper}>
              <label htmlFor="contact-name" className={styles.label}>
                Name <span className={styles.required}>*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                placeholder="Your Name"
                className={`${styles.input} ${errors.name && touched.name ? styles.inputError : ""}`}
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || isSuccess}
                aria-invalid={!!errors.name && touched.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                required
              />
              {errors.name && touched.name && (
                <div id="name-error" className={styles.error} role="alert">
                  {errors.name}
                </div>
              )}
            </div>

            <div className={styles.inputWrapper}>
              <label htmlFor="contact-email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                placeholder="Your Email"
                className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ""}`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading || isSuccess}
                aria-invalid={!!errors.email && touched.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                required
              />
              {errors.email && touched.email && (
                <div id="email-error" className={styles.error} role="alert">
                  {errors.email}
                </div>
              )}
            </div>
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor="contact-company" className={styles.label}>
              Company
            </label>
            <input
              id="contact-company"
              type="text"
              name="company"
              placeholder="Company (Optional)"
              className={styles.input}
              value={formData.company}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading || isSuccess}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label htmlFor="contact-message" className={styles.label}>
              Message <span className={styles.required}>*</span>
            </label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="Your Message"
              className={`${styles.textarea} ${errors.message && touched.message ? styles.inputError : ""}`}
              rows={5}
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading || isSuccess}
              aria-invalid={!!errors.message && touched.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              required
            />
            {errors.message && touched.message && (
              <div id="message-error" className={styles.error} role="alert">
                {errors.message}
              </div>
            )}
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
