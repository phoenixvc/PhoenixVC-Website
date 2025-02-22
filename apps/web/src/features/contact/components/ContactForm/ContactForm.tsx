// ContactForm.tsx
import { FC, memo, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { contactAnimations } from "../../animations";
import { FORM_VALIDATION } from "../../constants";
import styles from "./ContactForm.module.css";
import type { ContactFormProps, ContactFormData } from "../../types";

const ContactForm: FC<ContactFormProps> = memo(({ onSubmit, isLoading }) => {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormData>();

  const onSubmitForm = async (data: ContactFormData) => {
    try {
      await onSubmit(data);
      setIsSuccess(true);
      reset();
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <motion.div
      className={styles.card}
      variants={contactAnimations.item}
    >
      <form className={styles.form} onSubmit={handleSubmit(onSubmitForm)}>
        <div className={styles.inputGrid}>
          <div>
            <input
              {...register("name", FORM_VALIDATION.name)}
              placeholder="Name"
              className={styles.input}
              disabled={isLoading}
            />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>
          <div>
            <input
              {...register("email", FORM_VALIDATION.email)}
              placeholder="Email"
              className={styles.input}
              disabled={isLoading}
            />
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </div>
        </div>

        <div>
          <input
            {...register("subject", FORM_VALIDATION.subject)}
            placeholder="Subject"
            className={styles.input}
            disabled={isLoading}
          />
          {errors.subject && <span className={styles.error}>{errors.subject.message}</span>}
        </div>

        <div>
          <textarea
            {...register("message", FORM_VALIDATION.message)}
            placeholder="Message"
            rows={4}
            className={styles.textarea}
            disabled={isLoading}
          />
          {errors.message && <span className={styles.error}>{errors.message.message}</span>}
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loading}>Sending...</span>
          ) : isSuccess ? (
            <span className={styles.success}>Message Sent!</span>
          ) : (
            "Send Message"
          )}
        </button>
      </form>
    </motion.div>
  );
});

ContactForm.displayName = "ContactForm";
export default ContactForm;
