import React from 'react';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from '../hooks/useReducedMotionPreference';

export function Reveal({
  children,
  delay = 0,
  duration = 0.6,
  direction = 'up',
  className = '',
  amount = 0.2,
}) {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = 24;
  const initialVariants = {
    up: { opacity: 0, y: offset },
    down: { opacity: 0, y: -offset },
    left: { opacity: 0, x: offset },
    right: { opacity: 0, x: -offset },
    none: { opacity: 0 },
  };

  return (
    <motion.div
      initial={initialVariants[direction] || initialVariants.up}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren,
            delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  yOffset = 20,
}) {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: yOffset },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: [0.21, 0.47, 0.32, 0.98],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
