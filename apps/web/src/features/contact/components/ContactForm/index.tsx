import { FC, memo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { contactAnimations } from "../../animations";
import { FORM_VALIDATION } from "../../constants";
import { contactFormStyles } from "./styles";
import type { ContactFormProps, ContactFormData } from "../../types";

const ContactForm: FC<ContactFormProps> = memo(({ onSubmit, isLoading, className }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>();

  return (
    <motion.div
      className={`card-glow rounded-xl p-8 max-w-2xl mx-auto ${className}`}
      variants={contactAnimations.item}
    >
      <form className={contactFormStyles.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={contactFormStyles.inputGrid}>
          <div>
            <input
              {...register("name", FORM_VALIDATION.name)}
              placeholder="Name"
              className={contactFormStyles.input}
              disabled={isLoading}
            />
            {errors.name && (
              <span className={contactFormStyles.error}>
                {errors.name.message}
              </span>
            )}
          </div>
          <div>
            <input
              {...register("email", FORM_VALIDATION.email)}
              placeholder="Email"
              className={contactFormStyles.input}
              disabled={isLoading}
            />
            {errors.email && (
              <span className={contactFormStyles.error}>
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <input
            {...register("subject", FORM_VALIDATION.subject)}
            placeholder="Subject"
            className={contactFormStyles.input}
            disabled={isLoading}
          />
          {errors.subject && (
            <span className={contactFormStyles.error}>
              {errors.subject.message}
            </span>
          )}
        </div>

        <div>
          <textarea
            {...register("message", FORM_VALIDATION.message)}
            placeholder="Message"
            rows={4}
            className={contactFormStyles.textarea}
            disabled={isLoading}
          />
          {errors.message && (
            <span className={contactFormStyles.error}>
              {errors.message.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={contactFormStyles.button}
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </motion.div>
  );
});

ContactForm.displayName = "ContactForm";

export default ContactForm;
