import type { ReactNode } from "react";
import { motion } from "framer-motion";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  lightOnScroll?: boolean;
};

export const RevealOnScroll = ({
  children,
  className,
  delay = 0,
  lightOnScroll = false,
}: RevealOnScrollProps) => {
  const initial = lightOnScroll
    ? { opacity: 0.35, y: 34, filter: "blur(4px)" }
    : { opacity: 0, y: 34, filter: "blur(4px)" };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

export default RevealOnScroll;
