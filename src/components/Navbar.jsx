import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MessageCircle } from 'lucide-react';
import { brandConfig } from '../data/brand';
import { MobileMenu } from './MobileMenu';
import { InstagramIcon } from './Icons';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const whatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    brandConfig.contact.whatsappDefaultMessage
  )}`;

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        {/* Top Announcement Bar */}
        <aside
          aria-label="Announcement"
          className="bg-[#7C3F27] text-[#FFF9F3] text-[11px] sm:text-xs tracking-widest uppercase py-2 text-center px-4 font-medium flex items-center justify-center gap-2 transition-all duration-300 border-b border-[#5E2B19]/30"
        >
          <span>🐾 Pastry Paws • Cakes &amp; Pastries</span>
          <span className="hidden sm:inline opacity-70">•</span>
          <span className="hidden sm:inline">Birthday cakes include complimentary mini cookies</span>
          <span className="hidden sm:inline opacity-70">•</span>
          <span className="hidden sm:inline">Choco Lava @ ₹99/-</span>
        </aside>

        {/* Main Navigation Bar */}
        <div
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-[#FEEDDD]/95 backdrop-blur-md py-3.5 shadow-sm border-b border-[#D29C83]/30'
              : 'bg-[#FEEDDD]/85 backdrop-blur-xs py-4 md:py-5 border-b border-[#D29C83]/15'
          }`}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
            {/* Brand Wordmark with Pastry Paw icon */}
            <Link
              to="/"
              className="group flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27] rounded-sm shrink-0"
              aria-label={`${brandConfig.name} - Home`}
            >
              {/* Pastry Paw Icon */}
              <div className="w-8 h-8 rounded-full bg-[#FEE5D2] border border-[#D29C83]/50 flex items-center justify-center text-[#7C3F27] group-hover:scale-105 transition-transform duration-300 shadow-2xs">
                <svg
                  className="w-5 h-5 fill-[#7C3F27]"
                  viewBox="0 0 24 24"
                >
                  {/* Central pad */}
                  <ellipse cx="12" cy="15" rx="5" ry="4" />
                  {/* Toes */}
                  <circle cx="6" cy="9.5" r="2.2" />
                  <circle cx="10" cy="6" r="2.2" />
                  <circle cx="14" cy="6" r="2.2" />
                  <circle cx="18" cy="9.5" r="2.2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-[1.65rem] font-medium tracking-tight text-[#411C10] group-hover:text-[#7C3F27] transition-colors leading-none">
                  {brandConfig.name}
                </span>
                <span className="text-[10px] tracking-[0.16em] uppercase text-[#A66D54] font-medium mt-1 whitespace-nowrap">
                  Artisan Bakery • Baked with Love
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-4" aria-label="Main Navigation">
              {brandConfig.navLinks.map((link) => {
                const isExactActive =
                  link.href === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(link.href) && !link.href.includes('#');

                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative text-sm tracking-wide transition-colors font-medium py-1 whitespace-nowrap group ${
                      isExactActive
                        ? 'text-[#7C3F27] font-semibold'
                        : 'text-[#411C10] hover:text-[#7C3F27]'
                    }`}
                  >
                    <span>{link.label}</span>
                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] bg-[#7C3F27] transition-all duration-300 ${
                        isExactActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* CTA & Mobile Toggle */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <a
                href={brandConfig.contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#FEE5D2] border border-[#D29C83]/50 text-[#7C3F27] hover:bg-[#7C3F27] hover:text-[#FEEDDD] hover:border-[#7C3F27] transition-all shadow-2xs shrink-0"
                aria-label={`Follow ${brandConfig.contact.instagramHandle} on Instagram`}
                title={`Follow ${brandConfig.contact.instagramHandle}`}
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 bg-[#7C3F27] text-[#FEEDDD] px-4.5 py-2.5 rounded-full text-xs md:text-sm font-medium tracking-wide whitespace-nowrap hover:bg-[#5E2B19] transition-all shadow-xs hover:shadow active:scale-[0.98] shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#F9C8B5]" />
                <span className="whitespace-nowrap">Inquire on WhatsApp</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2.5 rounded-full text-[#411C10] bg-[#FEE5D2]/80 hover:bg-[#FEE5D2] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3F27]"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
