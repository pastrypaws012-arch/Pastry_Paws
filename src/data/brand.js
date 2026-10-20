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
    serviceArea: "Studio Self-Pickup from Avadi or customer-arranged parcel service (Dunzo / Porter / Swiggy Genie). We do not provide direct home delivery.",
    hours: "Mon –  sun: 24 Hr Available (Freshly baked to order)",
    pickupLocation: "Home Bakery Studio • Pastry Paws",
    address: "Avadi, Chennai, Tamil Nadu 600054",
    googleMapsUrl: "https://maps.app.goo.gl/NrA698fpTvKPwvKx6",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31831081.587738708!2d41.0694355!3d13.1226053!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5289882e7eadf5%3A0xf75e95e2c79bddfa!2sPastry%20Paws!5e0!3m2!1sen!2sin!4v1792509508148!5m2!1sen!2sin",
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
        description: "Custom handcrafted cakes and treats tailored to make every celebration special.",
      },
    ],
  },
};
