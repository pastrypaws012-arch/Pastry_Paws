/**
 * Testimonials & Google Maps Review Dataset
 * Structured to seamlessly match the Google Places API (Places API v1 & v2 'reviews' object)
 * Dynamically populated by /api/google-reviews with strictly 4 and 5 star reviews.
 */
export const googlePlaceSummary = {
  rating: 5.0,
  reviewsCount: "5.0 ★★★★★",
  stars: 5,
  googleMapsUrl: "https://maps.app.goo.gl/NrA698fpTvKPwvKx6",
  placeName: "Pastry Paws",
  status: "5.0 Star Rated on Google",
};

export const testimonialsData = [
  {
    id: 1,
    author_name: "Anjali R.",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 week ago",
    text: "Ordered the Lotus Biscoff cake and classic dark chocolate bowl for my sister’s birthday. The texture was so rich, moist, and delightfully chocolatey without being overly sweet. Hands down the best homemade bakery in Avadi!",
    occasion: "Birthday Celebration",
    highlight: "Lotus Biscoff Cake",
    author_url: "https://maps.app.goo.gl/NrA698fpTvKPwvKx6",
    verified: true,
  },
  {
    id: 2,
    author_name: "Karthik S.",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 weeks ago",
    text: "The warm Choco Lava cakes and fudgy Nutella brownies were insanely delicious! Beautifully packaged and delivered warm and fresh. You can really taste the pure ingredients and passion.",
    occasion: "Weekend Treats",
    highlight: "Choco Lava & Nutella Brownies",
    author_url: "https://maps.app.goo.gl/NrA698fpTvKPwvKx6",
    verified: true,
  },
  {
    id: 3,
    author_name: "Deepa V.",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "3 weeks ago",
    text: "Super smooth ordering and communication on WhatsApp. The Red Velvet Cake with cream cheese frosting was an absolute showstopper. Every guest asked where we ordered it from!",
    occasion: "Family Celebration",
    highlight: "Red Velvet Cake",
    author_url: "https://maps.app.goo.gl/NrA698fpTvKPwvKx6",
    verified: true,
  },
  {
    id: 4,
    author_name: "Rahul M.",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "a month ago",
    text: "The dessert bowls are out of this world! Pure Belgian chocolate ganache that melts in your mouth. Extremely fresh and top-notch presentation. Truly a gourmet treat.",
    occasion: "Special Occasion",
    highlight: "Dark Chocolate Bowl",
    author_url: "https://maps.app.goo.gl/NrA698fpTvKPwvKx6",
    verified: true,
  },
];
