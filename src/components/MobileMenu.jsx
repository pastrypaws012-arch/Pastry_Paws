import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { brandConfig } from '../data/brand';

export function MobileMenu({ isOpen, onClose }) {
  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const whatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    brandConfig.contact.whatsappDefaultMessage
  )}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#411C10]/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#FEEDDD] border-l border-[#D29C83]/30 shadow-2xl flex flex-col justify-between p-6 sm:p-8 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#D29C83]/20">
                <a
                  href="#"
                  onClick={onClose}
                  className="group flex flex-col"
                >
                  <span className="font-serif text-2xl font-normal tracking-tight text-[#411C10]">
                    {brandConfig.name}
                  </span>
                  <span className="text-[11px] uppercase tracking-widest text-[#A66D54] font-medium mt-0.5">
                    Artisan Home Bakery
                  </span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full text-[#411C10] hover:bg-[#FEE5D2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27]"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-8 flex flex-col gap-4">
                {brandConfig.navLinks.map((link, idx) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    className="font-serif text-2xl text-[#411C10] hover:text-[#7C3F27] py-2 transition-colors flex items-center justify-between group"
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-[#D29C83] tracking-widest font-sans opacity-0 group-hover:opacity-100 transition-opacity">
                      0{idx + 1}
                    </span>
                  </motion.a>
                ))}
              </nav>
            </div>

            {/* Footer and Quick Contact */}
            <div className="pt-8 border-t border-[#D29C83]/20 mt-8 space-y-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] px-5 py-3.5 rounded-full font-medium text-sm hover:bg-[#5E2B19] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-[#F9C8B5]" />
                <span>Message on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4 ml-1 opacity-70" />
              </a>

              <div className="pt-2 text-xs text-[#7C3F27] space-y-1">
                <p className="font-medium text-[#411C10]">{brandConfig.contact.hours}</p>
                <p>{brandConfig.contact.serviceArea}</p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <a
                  href={brandConfig.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-[#FEE5D2] text-[#7C3F27] hover:bg-[#F7B6A7] transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${brandConfig.contact.email}`}
                  className="p-2.5 rounded-full bg-[#FEE5D2] text-[#7C3F27] hover:bg-[#F7B6A7] transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href={`tel:${brandConfig.contact.whatsappNumber}`}
                  className="p-2.5 rounded-full bg-[#FEE5D2] text-[#7C3F27] hover:bg-[#F7B6A7] transition-colors"
                  aria-label="Phone"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
