import { motion } from "framer-motion";
import { FOCUS_AREAS } from "../constants";
import { investmentFocusAnimations } from "../animations/animations";
import { InvestmentCard } from "./InvestmentCard";

export const InvestmentFocus = () => {
  return (
    <section
      id="investment"
      className="py-20 overflow-hidden bg-[hsl(var(--background))]"
    >
      <motion.div
        className="container mx-auto px-6 max-w-[1440px]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={investmentFocusAnimations.container}
      >
        <motion.h2
          variants={investmentFocusAnimations.header}
          className="text-4xl md:text-5xl font-bold text-center mb-16 gradient-text"
        >
          Investment Focus
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={investmentFocusAnimations.container}
        >
          {FOCUS_AREAS.map((area, index) => (
            <InvestmentCard key={index} area={area} index={index} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InvestmentFocus;
