// features/contact/components/ContactHeader/index.tsx
import { FC } from 'react';
import { motion } from 'framer-motion';
import { contactAnimations } from '../../animations';
import { ContactHeaderProps } from '../../types';

// Use the props interface directly here
const ContactHeader: FC<ContactHeaderProps> = ({
  title,
  subtitle,
  className
}) => {
  return (
    <div className={className}>
      <motion.h2
        className="text-4xl font-bold mb-4"
        variants={contactAnimations.item}
      >
        {title}
      </motion.h2>
      <motion.p
        className="text-lg text-gray-300 mb-8"
        variants={contactAnimations.item}
      >
        {subtitle}
      </motion.p>
    </div>
  );
};

export default ContactHeader;
