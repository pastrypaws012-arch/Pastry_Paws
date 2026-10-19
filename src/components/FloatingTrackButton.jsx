import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingTrackButton() {
  const location = useLocation();

  // Hide the floating button if already on the track order or admin pages
  if (
    location.pathname === '/track-order' ||
    location.pathname === '/order-status' ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-40"
      >
        <Link
          to="/track-order"
          className="group flex items-center gap-2.5 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FFF9F3] pl-3 pr-4 py-2.5 sm:pl-3.5 sm:pr-4.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl border border-[#F9C8B5]/30 active:scale-95 transition-all duration-300"
          aria-label="Track your order status with mobile number"
        >
          {/* Icon Badge */}
          <span className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FEEDDD]/15 text-[#FFF9F3]">
            <motion.div
              animate={{
                x: [-0.5, 2, -0.5, 1.5, -0.5],
                y: [0, -1.2, 0.3, -0.8, 0],
                rotate: [0, -2, 1.5, -1, 0],
              }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center justify-center group-hover:scale-110 transition-transform"
            >
              <Truck className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.2]" />
            </motion.div>
          </span>

          {/* Text */}
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#F9C8B5] leading-none">
              Live Status
            </span>
            <span className="text-xs sm:text-[13px] font-semibold text-[#FFF9F3] tracking-wide leading-tight mt-0.5">
              Track Order
            </span>
          </div>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
}
