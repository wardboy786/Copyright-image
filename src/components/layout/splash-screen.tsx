'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';

const splashVariants = {
  initial: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.5, delay: 0.5 } },
};

const logoVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
      delay: 0.2,
    },
  },
};

const textVariants = {
  initial: { y: 20, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      delay: 0.5,
    },
  },
};

export function SplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 2000); // Total splash screen time before starting fade-out

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      <motion.div
        variants={splashVariants}
        initial="initial"
        exit="exit"
        className="fixed inset-0 z-[101] flex flex-col items-center justify-center bg-background"
      >
        <motion.div variants={logoVariants} initial="initial" animate="animate">
          <ShieldCheck className="w-24 h-24 text-primary" />
        </motion.div>
        <motion.h1
          variants={textVariants}
          initial="initial"
          animate="animate"
          className="text-3xl font-bold tracking-tight text-foreground mt-6"
        >
          ImageRights AI
        </motion.h1>
      </motion.div>
    </AnimatePresence>
  );
}
