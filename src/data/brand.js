export const brandConfig = {
  name: "Pastry Paws",
  baker: "Pastry Paws",
  tagline: "Baked with love • Cakes • Pastries • Happiness",
  eyebrow: "BAKED WITH LOVE",
  slogan: "Sweet treats for every mood",
  specialOffer: " ",
  year: new Date().getFullYear(),

  // Contact & Social
  contact: {
    whatsappNumber: "919790983844", // Digits only for wa.me link
    whatsappDisplay: "+91 9790983844",
    whatsappDefaultMessage: "Hello Pastry Paws! I'd love to order sweet treats.",
    instagramHandle: "@pastry_paws_06",
    instagramUrl: "https://www.instagram.com/pastry_paws_06/",
    email: "pastry.paws012@gmail.com",
    phone: "+91 9790983844",
    serviceArea: "Freshly baked & hand-delivered locally. Custom orders require advance notice.",
    hours: "Mon –  sun: 24 Hr Available (Freshly baked to order)",
    pickupLocation: "Home Bakery Studio • Pastry Paws"
  },

  // UPI & Google Pay Configuration
  payment: {
    upiId: "anjiasbeautylounge@okhdfcbank", // Google Pay / PhonePe / Paytm UPI ID
    payeeName: "Pastry Paws Bakery",
    phone: "9790983844",
    instructions: "Pay using Google Pay, PhonePe, Paytm, or BHIM. Take a screenshot of the successful payment screen and note down the 12-digit UPI UTR / Transaction ID.",
  },

  // Navigation Links (curated to keep navbar airy and elegant)
  navLinks: [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Our Story", href: "/#story" },
    { label: "Specialties", href: "/#specialties" },
    { label: "Reviews", href: "/#testimonials" },
  ],

  // Story & Values
  story: {
    eyebrow: "ABOUT PASTRY PAWS",
    headline: "Made by hand. Baked with love.",
    description:
      "Welcome to Pastry Paws! Our home bakery was born from a simple belief: every celebration, big or small, deserves something homemade and sweet. From our warm, gooey Choco Lava cakes and fudgy Nutella brownies to handcrafted celebration cakes and slow-baked cookies, every single recipe is prepared from scratch with pure ingredients and genuine love.",
    values: [
      {
        title: "Simple, Homemade Goodness",
        description: "Freshly baked in small batches without artificial shortcuts or preservatives.",
      },
      {
        title: "Bespoke Flavors for Every Mood",
        description: "Rich Belgian chocolate, Lotus Biscoff, red velvet, butterscotch, and pure vanilla.",
      },
      {
        title: "Celebration Specials",
        description: "Every birthday celebration cake comes with our signature complimentary mini cookies.",
      },
    ],
  },
};
