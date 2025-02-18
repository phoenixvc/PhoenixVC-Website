// features/contact/components/Contact/index.tsx
import { FC, memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ContactHeader from '../ContactHeader';
import ContactForm from '../ContactForm';
import { contactAnimations } from '../../animations';
import { DEFAULT_CONTACT_CONTENT } from '../../constants';
import { contactStyles } from './styles';
import type { ContactFormData, ContactState } from '../../types';

const Contact: FC = memo(() => {
  const [state, setState] = useState<ContactState>({
    isLoading: false,
    error: null
  });

  const handleSubmit = useCallback(async (data: ContactFormData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to submit form. Please try again.'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <section id="contact" className={contactStyles.section}>
      <div className={contactStyles.container}>
        <motion.div
          className={contactStyles.content}
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
            <motion.div
              className="text-red-400 mb-6"
              variants={contactAnimations.item}
            >
              {state.error}
            </motion.div>
          )}

          <ContactForm
            onSubmit={handleSubmit}
            isLoading={state.isLoading}
          />
        </motion.div>
      </div>
    </section>
  );
});

Contact.displayName = 'Contact';

export default Contact;
