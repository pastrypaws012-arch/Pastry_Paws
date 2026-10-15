/**
 * Testimonials & Google Maps Review Dataset
 * Structured to seamlessly match the Google Places API (Places API v1 & v2 'reviews' object)
 * When dynamic fetching is enabled in the future, the API response can directly populate this state.
 */
export const googlePlaceSummary = {
  rating: 5.0,
  reviewsCount: "48+",
  stars: 5,
  googleMapsUrl: "https://maps.google.com/?q=Pastry+Paws",
  placeName: "Pastry Paws",
  status: "Excellent",
};

export const testimonialsData = [
  {
    id: 1,
    author_name: "Clara & Julian M.",
    profile_photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    relative_time_description: "3 weeks ago",
    text: "Our wedding cake wasn't just visually breathtaking—it tasted even more incredible than it looked! Our guests are still raving about the champagne sponge and wild raspberry layers.",
    occasion: "Autumn Wedding Celebration",
    highlight: "Champagne & Raspberry Cake",
    author_url: "https://maps.google.com/?q=Pastry+Paws",
    verified: true,
  },
  {
    id: 2,
    author_name: "Eleanor S.",
    profile_photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    relative_time_description: "a month ago",
    text: "The attention to detail on the vintage piped cake was extraordinary. The soft peach hues and delicate frills felt like something out of a European fairytale.",
    occasion: "30th Birthday Garden Party",
    highlight: "Vintage Lambeth Cake",
    author_url: "https://maps.google.com/?q=Pastry+Paws",
    verified: true,
  },
  {
    id: 3,
    author_name: "Marcus T.",
    profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    relative_time_description: "2 months ago",
    text: "Ordering through WhatsApp was effortless. The sea salt brownies and bespoke cupcake box were packaged like a luxury gift. The flavors were deeply comforting and rich.",
    occasion: "Anniversary Dinner",
    highlight: "Nutella Brownies & Cupcakes",
    author_url: "https://maps.google.com/?q=Pastry+Paws",
    verified: true,
  },
  {
    id: 4,
    author_name: "Sophie V.",
    profile_photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    rating: 5,
    relative_time_description: "2 months ago",
    text: "Working with Pastry Paws was an absolute joy from start to finish. She captured our botanical theme with pressed edible flowers so effortlessly. Truly edible art.",
    occasion: "Intimate Baby Shower",
    highlight: "Botanical Pressed Flower Cake",
    author_url: "https://maps.google.com/?q=Pastry+Paws",
    verified: true,
  },
];
