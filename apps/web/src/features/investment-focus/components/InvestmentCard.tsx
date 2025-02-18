// features/investment-focus/components/InvestmentCard.tsx
import { motion } from 'framer-motion';
import { FocusArea } from '../types';
import { investmentFocusAnimations } from '../animations/animations';

interface Props {
  area: FocusArea;
  index: number;
}

export const InvestmentCard = ({ area, index }: Props) => (
  <motion.div
    key={index}
    variants={investmentFocusAnimations.card}
    whileHover="hover"
    className="h-full card-glow rounded-xl p-6 text-center bg-black/20 backdrop-blur-sm"
  >
    <motion.div
      className="text-4xl mb-4"
      variants={investmentFocusAnimations.icon}
      role="img"
      aria-label={`${area.title} icon`}
    >
      {area.icon}
    </motion.div>
    <motion.h3 className="text-xl font-semibold mb-3 text-white/90" layout>
      {area.title}
    </motion.h3>
    <motion.p className="text-gray-400 text-sm leading-relaxed" layout>
      {area.description}
    </motion.p>
  </motion.div>
);
