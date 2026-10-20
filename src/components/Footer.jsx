import { Link } from 'react-router-dom';
import { ArrowUp, Mail, Phone, MessageCircle, Heart, Package, MapPin, ExternalLink } from 'lucide-react';
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
          <div className="lg:col-span-4 space-y-4">
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
              Freshly baked with love by Pastry Paws. Cakes, brownies, gooey choco lava, cupcakes, and cookies crafted to make every celebration sweet and memorable.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7B6A7]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#FDEADA]/85">
              {brandConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="hover:text-[#FFF9F3] hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Studio & Service Details */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7B6A7]">
              Studio &amp; Inquiries
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-[#FDEADA]/85 leading-relaxed">
              <p className="text-[#FFF9F3] font-medium">{brandConfig.contact.hours}</p>
              <p>{brandConfig.contact.serviceArea}</p>
              <a
                href={brandConfig.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#F9C8B5] hover:text-[#FFF9F3] transition-colors group pt-0.5"
                title="View on Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-[#F7B6A7] shrink-0" />
                <span className="underline underline-offset-4 decoration-[#F7B6A7]/40 group-hover:decoration-[#FFF9F3]">
                  {brandConfig.contact.pickupLocation} • Avadi
                </span>
                <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
              </a>
            </div>

            {/* Social & Location Icons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-3">
              <a
                href={brandConfig.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="Google Maps Location"
                title="Pastry Paws on Google Maps"
              >
                <MapPin className="w-4 h-4" />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="WhatsApp Inquiry"
                title="WhatsApp Us"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={brandConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label={`Instagram Profile ${brandConfig.contact.instagramHandle}`}
                title="Instagram Profile"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${brandConfig.contact.email}`}
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="Send Email"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={`tel:${brandConfig.contact.whatsappNumber}`}
                className="p-2 rounded-full bg-[#7C3F27] text-[#FFF9F3] hover:bg-[#F7B6A7] hover:text-[#411C10] transition-colors"
                aria-label="Call Studio"
                title="Call Studio"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Track Order Status Quick Button */}
            <div className="pt-2">
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 bg-[#FEE5D2] hover:bg-[#FFF9F3] text-[#411C10] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all group"
              >
                <Package className="w-4 h-4 text-[#7C3F27] group-hover:scale-110 transition-transform" />
                <span>Track Order Status</span>
              </Link>
            </div>
          </div>

          {/* Interactive Google Map Window Box */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7B6A7] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F7B6A7]" />
                <span>Bakery Location</span>
              </h4>
              <a
                href={brandConfig.contact.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#F9C8B5] hover:text-[#FFF9F3] flex items-center gap-1 underline underline-offset-2 transition-colors"
              >
                <span>Full Map</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Embedded Map Window Container */}
            <div className="relative rounded-2xl overflow-hidden border border-[#7C3F27]/60 bg-[#2C130B] shadow-lg group">
              <iframe
                title="Pastry Paws Google Maps Location"
                src={brandConfig.contact.mapEmbedUrl}
                className="w-full h-40 border-0 opacity-95 group-hover:opacity-100 transition-opacity"
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />

              {/* Map Footer Bar with Location & Directions CTA */}
              <div className="p-2.5 bg-[#2C130B]/95 border-t border-[#7C3F27]/50 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-[#FFF9F3] truncate">
                    Pastry Paws
                  </p>
                  <p className="text-[10px] text-[#FDEADA]/70 truncate">
                    Avadi, Chennai, Tamil Nadu
                  </p>
                </div>

                <a
                  href={brandConfig.contact.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 bg-[#7C3F27] hover:bg-[#F7B6A7] hover:text-[#411C10] text-[#FFF9F3] px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all shrink-0 shadow-2xs"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
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

          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              state={{ fromAdminPortalLink: true }}
              className="text-[11px] text-[#D29C83] hover:text-[#FEEDDD] underline underline-offset-4 transition-colors"
            >
              Admin Portal
            </Link>

            <button
              type="button"
              onClick={scrollToTop}
              className="group flex items-center gap-2 hover:text-[#FFF9F3] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7B6A7] rounded-sm py-1 px-2 cursor-pointer"
            >
              <span>Back to top</span>
              <div className="p-1.5 rounded-full bg-[#7C3F27] text-[#FEEDDD] group-hover:bg-[#F7B6A7] group-hover:text-[#411C10] transition-colors">
                <ArrowUp className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
