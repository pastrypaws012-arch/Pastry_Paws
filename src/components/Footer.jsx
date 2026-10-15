import { ArrowUp, Mail, Phone, MessageCircle, Heart } from 'lucide-react';
import { InstagramIcon } from './Icons';
import { brandConfig } from '../data/brand';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    brandConfig.contact.whatsappDefaultMessage
  )}`;

  return (
    <footer className="bg-[#411C10] text-[#FEEDDD] pt-16 md:pt-20 pb-12 border-t border-[#7C3F27]/40 relative overflow-hidden">
      {/* Subtle background decorative glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#7C3F27]/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-[#7C3F27]/50">
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FEE5D2] flex items-center justify-center text-[#7C3F27]">
                <svg className="w-5 h-5 fill-[#7C3F27]" viewBox="0 0 24 24">
                  <ellipse cx="12" cy="15" rx="5" ry="4" />
                  <circle cx="6" cy="9.5" r="2.2" />
                  <circle cx="10" cy="6" r="2.2" />
                  <circle cx="14" cy="6" r="2.2" />
                  <circle cx="18" cy="9.5" r="2.2" />
                </svg>
              </div>
              <span className="font-serif text-3xl font-normal text-[#FFF9F3] tracking-tight">
                {brandConfig.name}
              </span>
            </div>

            <p className="font-serif italic text-lg text-[#F9C8B5] max-w-sm">
              "{brandConfig.slogan}"
            </p>

            <p className="text-xs text-[#FDEADA]/70 leading-relaxed max-w-md pt-2">
              Freshly baked with love by Pastry Paws. Cakes, brownies, gooey choco lava, cupcakes, and cookies crafted to make every celebration sweet. Birthday celebration cakes include complimentary mini cookies!
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7B6A7]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#FDEADA]/85">
              {brandConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-[#FFF9F3] hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Service Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7B6A7]">
              Studio &amp; Inquiries
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#FDEADA]/85 leading-relaxed">
              <p className="text-[#FFF9F3] font-medium">{brandConfig.contact.hours}</p>
              <p>{brandConfig.contact.serviceArea}</p>
              <p className="text-xs text-[#D29C83]">{brandConfig.contact.pickupLocation}</p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="WhatsApp Inquiry"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={brandConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7C3F27] text-xs text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label={`Instagram Profile ${brandConfig.contact.instagramHandle}`}
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>{brandConfig.contact.instagramHandle}</span>
              </a>
              <a
                href={`mailto:${brandConfig.contact.email}`}
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${brandConfig.contact.whatsappNumber}`}
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="Call Studio"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FDEADA]/60 gap-4">
          <p className="flex items-center gap-1.5">
            <span>© {brandConfig.year} {brandConfig.name}. Handcrafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#F7B6A7] fill-current" />
            <span>for sweet celebrations.</span>
          </p>

          <button
            type="button"
            onClick={scrollToTop}
            className="group flex items-center gap-2 hover:text-[#FFF9F3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7B6A7] rounded-sm py-1 px-2"
          >
            <span>Back to top</span>
            <div className="p-1.5 rounded-full bg-[#7C3F27] text-[#FEEDDD] group-hover:bg-[#F7B6A7] group-hover:text-[#411C10] transition-colors">
              <ArrowUp className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
