import React, { useState } from 'react';
import { motion } from 'motion/react';
import { brandConfig } from '../data/brand';
import { Reveal } from '../components/Reveal';
import {
  MessageCircle,
  Mail,
  Phone,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export function Contact() {
  const [inquiryType, setInquiryType] = useState('Celebration Cake');
  const [occasionDate, setOccasionDate] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const buildCustomWhatsAppUrl = () => {
    let text = `Hello! I'd love to inquire about a custom order for Butter & Bloom.`;
    if (inquiryType) text += `\nType: ${inquiryType}`;
    if (occasionDate) text += `\nTarget Date: ${occasionDate}`;
    if (guestCount) text += `\nGuest Count: ${guestCount}`;
    if (customNotes) text += `\nDetails: ${customNotes}`;

    return `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  const defaultWhatsappUrl = `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
    brandConfig.contact.whatsappDefaultMessage
  )}`;

  return (
    <section
      id="contact"
      className="py-20 md:py-32 bg-[#411C10] text-[#FEEDDD] relative overflow-hidden"
    >
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C3F27]/30 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#F7B6A7]/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Invitation & Business Info */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <Reveal direction="down" duration={0.5}>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-6 bg-[#F7B6A7]" />
                <span className="text-xs sm:text-sm tracking-[0.25em] uppercase font-semibold text-[#F9C8B5]">
                  GET IN TOUCH
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1} duration={0.6}>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#FFF9F3] font-normal leading-[1.12]">
                Let's make something{' '}
                <span className="font-script text-5xl sm:text-6xl md:text-7xl text-[#F7B6A7] block sm:inline">
                  sweet together.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.2} duration={0.6}>
              <p className="mt-5 text-base sm:text-lg text-[#FDEADA]/85 leading-relaxed font-normal max-w-lg">
                Have an upcoming wedding, birthday, or private gathering? We would love to handcraft a custom centerpiece for your special day.
              </p>
            </Reveal>

            {/* Quick Contact Points */}
            <Reveal delay={0.3} duration={0.6}>
              <div className="mt-8 space-y-4 pt-6 border-t border-[#7C3F27]/60">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#7C3F27]/60 text-[#F9C8B5] mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#F7B6A7]">
                      Order Lead Time &amp; Hours
                    </h4>
                    <p className="text-sm text-[#FDEADA]/90 mt-0.5">
                      {brandConfig.contact.hours}
                    </p>
                    <p className="text-xs text-[#D29C83] mt-0.5">
                      Recommended 2–3 weeks advance notice for custom celebration cakes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-[#7C3F27]/60 text-[#F9C8B5] mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider font-semibold text-[#F7B6A7]">
                      Service &amp; Hand-Delivery Area
                    </h4>
                    <p className="text-sm text-[#FDEADA]/90 mt-0.5">
                      {brandConfig.contact.serviceArea}
                    </p>
                    <p className="text-xs text-[#D29C83] mt-0.5">
                      {brandConfig.contact.pickupLocation}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Direct Instant Channels */}
            <Reveal delay={0.4} duration={0.6}>
              <div className="mt-8 pt-6 border-t border-[#7C3F27]/60 flex flex-wrap items-center gap-4">
                <a
                  href={`mailto:${brandConfig.contact.email}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FEEDDD] hover:text-[#F7B6A7] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#F7B6A7]" />
                  <span>{brandConfig.contact.email}</span>
                </a>
                <span className="text-[#7C3F27] hidden sm:inline">•</span>
                <a
                  href={`tel:${brandConfig.contact.whatsappNumber}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#FEEDDD] hover:text-[#F7B6A7] transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#F7B6A7]" />
                  <span>{brandConfig.contact.phone}</span>
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right Column: Interactive WhatsApp Inquiry Planner */}
          <div className="lg:col-span-6">
            <Reveal direction="right" duration={0.8}>
              <div className="bg-[#FFF9F3] text-[#411C10] rounded-3xl p-7 sm:p-9 shadow-2xl border border-[#D29C83]/40 relative">
                <div className="flex items-center justify-between pb-5 border-b border-[#D29C83]/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#7C3F27]" />
                    <span className="text-xs uppercase tracking-widest font-semibold text-[#7C3F27]">
                      Bespoke Inquiry Helper
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A66D54] bg-[#FEEDDD] px-2.5 py-1 rounded-full">
                    Direct WhatsApp
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#7C3F27] mt-4 mb-6 leading-relaxed">
                  Fill in your details below to generate a formatted direct message, or click the direct inquiry button to chat with us immediately.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.open(buildCustomWhatsAppUrl(), '_blank');
                  }}
                  className="space-y-4"
                >
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] uppercase tracking-wider mb-2">
                      Occasion / Creation Type
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-[#FEEDDD]/60 border border-[#D29C83]/50 rounded-xl px-4 py-2.5 text-sm text-[#411C10] focus:ring-2 focus:ring-[#7C3F27] focus:outline-none transition-colors"
                    >
                      <option value="Celebration Cake (Chocolate, Biscoff, Red Velvet, Vanilla)">Celebration Cake (1/2 kg / 1 kg)</option>
                      <option value="Choco Lava Cake (₹99/- each)">Choco Lava Cake (₹99/- each)</option>
                      <option value="Brownies (Fudge, Nutella, Biscoff, Triple Choco)">Brownies (1/4 kg, 1/2 kg, 1 kg)</option>
                      <option value="Cupcakes (Vanilla, Chocolate, Red Velvet)">Cupcakes (Small, Medium, Large)</option>
                      <option value="Cookies Pack of 5 (₹60 / ₹70)">Cookies Pack of 5 (₹60 / ₹70)</option>
                      <option value="Tea Cake Loaf (Vanilla / Chocolate)">Tea Cake Loaf (1/2 kg / 1 kg)</option>
                      <option value="Custom Assorted Party Box">Custom Assorted Party Box</option>
                    </select>
                  </div>

                  {/* Date & Guest Count Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] uppercase tracking-wider mb-2">
                        Event Date (Approx)
                      </label>
                      <input
                        type="date"
                        value={occasionDate}
                        onChange={(e) => setOccasionDate(e.target.value)}
                        className="w-full bg-[#FEEDDD]/60 border border-[#D29C83]/50 rounded-xl px-4 py-2.5 text-sm text-[#411C10] focus:ring-2 focus:ring-[#7C3F27] focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] uppercase tracking-wider mb-2">
                        Estimated Servings
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 15–20 guests"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        className="w-full bg-[#FEEDDD]/60 border border-[#D29C83]/50 rounded-xl px-4 py-2.5 text-sm text-[#411C10] focus:ring-2 focus:ring-[#7C3F27] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Notes / Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] uppercase tracking-wider mb-2">
                      Inspiration or Flavor Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Peach tones with edible pressed florals, raspberry coulis..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-[#FEEDDD]/60 border border-[#D29C83]/50 rounded-xl px-4 py-2.5 text-sm text-[#411C10] focus:ring-2 focus:ring-[#7C3F27] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* WhatsApp Action Button */}
                  <div className="pt-2 space-y-3">
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-[#7C3F27] text-[#FEEDDD] px-6 py-3.5 rounded-full font-medium text-sm sm:text-base hover:bg-[#5E2B19] transition-all shadow-md active:scale-[0.98]"
                    >
                      <MessageCircle className="w-5 h-5 text-[#F9C8B5]" />
                      <span>Send Message via WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </button>

                    <a
                      href={defaultWhatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#FEE5D2] text-[#7C3F27] border border-[#D29C83]/40 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#F7B6A7]/40 transition-colors"
                    >
                      <span>Or click here for a quick open chat</span>
                    </a>
                  </div>
                </form>

                <p className="text-[11px] text-[#A66D54] text-center mt-4">
                  WhatsApp opens directly in your app or web browser with your message ready to send.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
