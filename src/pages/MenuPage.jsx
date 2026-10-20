import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Cake,
  Heart,
  MessageCircle,
} from 'lucide-react';
import { brandConfig } from '../data/brand';
import { MenuCard } from '../components/MenuCard';
import { ImageLightbox } from '../components/ImageLightbox';
import { OrderModal } from '../components/OrderModal';
import { AnimatedScriptWord } from '../components/AnimatedUnderline';
import { API_BASE_URL } from '../utils/api';

export function MenuPage() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [menuItems, setMenuItems] = useState([]);
  const [categoryList, setCategoryList] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Sync category when URL search parameter changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under250', 'under500', 'above500'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'priceAsc', 'priceDesc', 'name'
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [orderModal, setOrderModal] = useState({ isOpen: false, item: null, tier: null });

  // Fetch dynamic items & categories from backend with graceful offline fallback
  useEffect(() => {
    let isMounted = true;
    const fetchDynamicData = async () => {
      try {
        const [itemsRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/items`),
          fetch(`${API_BASE_URL}/api/categories`),
        ]);

        if (itemsRes.ok) {
          const itemsJson = await itemsRes.json();
          if (itemsJson.success && itemsJson.data && itemsJson.data.length > 0 && isMounted) {
            setMenuItems(itemsJson.data);
          }
        }

        if (catRes.ok) {
          const catJson = await catRes.json();
          if (catJson.success && catJson.data && catJson.data.length > 0 && isMounted) {
            const dynamicCats = ['All', ...catJson.data.map((c) => c.name)];
            setCategoryList(dynamicCats);
          }
        }
      } catch {
        // Keep static fallback
      }
    };

    fetchDynamicData();
    return () => { isMounted = false; };
  }, []);

  // Filter and sort items dynamically
  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        const matchCategory =
          selectedCategory === 'All' ||
          item.category === selectedCategory ||
          (selectedCategory === 'Brownies' && (item.category === 'Brownies' || item.category === 'Brownie')) ||
          (selectedCategory === 'Cakes' && item.category === 'Cakes');

        // Search query filter
        const query = searchQuery.trim().toLowerCase();
        const matchSearch =
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.tags?.some((t) => t.toLowerCase().includes(query));

        // Price range filter
        let matchPrice = true;
        if (priceRange === 'under250') {
          matchPrice = item.startingPrice <= 250;
        } else if (priceRange === 'under500') {
          matchPrice = item.startingPrice <= 500;
        } else if (priceRange === 'above500') {
          matchPrice = item.startingPrice > 500;
        }

        return matchCategory && matchSearch && matchPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.startingPrice - b.startingPrice;
        if (sortBy === 'priceDesc') return b.startingPrice - a.startingPrice;
        if (sortBy === 'name') return a.title.localeCompare(b.title);
        // Featured (default)
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [menuItems, selectedCategory, searchQuery, priceRange, sortBy]);

  // Lightbox navigation helpers
  const handleOpenLightbox = (item) => {
    const idx = filteredItems.findIndex((i) => i.id === item.id);
    setActiveLightboxIndex(idx !== -1 ? idx : 0);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const handlePrevLightbox = () => {
    setActiveLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : filteredItems.length - 1
    );
  };

  const handleNextLightbox = () => {
    setActiveLightboxIndex((prev) =>
      prev < filteredItems.length - 1 ? prev + 1 : 0
    );
  };

  const currentLightboxItem =
    activeLightboxIndex !== null ? filteredItems[activeLightboxIndex] : null;

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setPriceRange('all');
    setSortBy('featured');
  };

  return (
    <div className="min-h-screen bg-[#FEEDDD] pt-6 pb-20">
      {/* Breadcrumb & Back Nav */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-6">
        <nav className="flex items-center gap-2 text-xs text-[#7C3F27]" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#411C10] flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-[#D29C83]" />
          <span className="font-semibold text-[#411C10]">Our Menu</span>
        </nav>
      </div>

      {/* Page Header */}
      <header className="max-w-7xl mx-auto px-5 sm:px-8 text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="h-px w-6 bg-[#D29C83]" />
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-[#7C3F27]">
            FRESH FROM THE KITCHEN
          </span>
          <span className="h-px w-6 bg-[#D29C83]" />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#411C10] font-normal leading-tight">
          Handcrafted Treats for{' '}
          <AnimatedScriptWord
            underlineColor="#F7B6A7"
            delay={0.2}
            className="font-script text-4xl sm:text-5xl md:text-6xl text-[#7C3F27]"
          >
            Every Mood
          </AnimatedScriptWord>
        </h1>

        <p className="mt-3.5 text-sm sm:text-base text-[#7C3F27] max-w-2xl mx-auto font-normal leading-relaxed">
          Explore our complete artisan collection with exact prices by weight and size. Baked fresh to order using genuine ingredients and pure butter.
        </p>

        {/* Highlight Banner */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-[#FEE5D2]/70 border border-[#D29C83]/40 px-4 py-2 rounded-full text-xs text-[#411C10]">
          <span className="flex items-center gap-1.5 font-semibold text-[#7C3F27]">
            <Cake className="w-3.5 h-3.5 text-[#7C3F27]" />
            Birthday cakes include complimentary mini cookies
          </span>
          <span className="hidden sm:inline text-[#D29C83]">•</span>
          <span className="text-[#7C3F27] font-medium">Choco Lava Cake @ ₹99/-</span>
        </div>
      </header>

      {/* Controls & Filter Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 mb-8" aria-label="Menu Filters">
        <div className="bg-[#FFF9F3] rounded-2xl p-4 sm:p-6 border border-[#D29C83]/30 shadow-xs space-y-4 sm:space-y-5">
          {/* Top Row: Search Input + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-grow max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A66D54]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cakes, fudgy brownies, cupcakes, cookies..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-sm text-[#411C10] placeholder-[#A66D54] focus:outline-none focus:border-[#7C3F27] focus:ring-1 focus:ring-[#7C3F27] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#A66D54] hover:text-[#411C10]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <span className="text-xs text-[#7C3F27] font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-medium bg-[#FEEDDD]/50 border border-[#D29C83]/40 rounded-lg px-3 py-2 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
              >
                <option value="featured">Featured First</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="name">Alphabetical (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Middle Row: Category Tabs */}
          <div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {categoryList.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#7C3F27] text-[#FEEDDD] shadow-2xs font-semibold'
                        : 'bg-[#FEEDDD]/60 text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Row: Price Presets & Active Filters Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#D29C83]/20 text-xs">
            {/* Price Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[#A66D54] font-medium">Budget:</span>
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under250', label: 'Under ₹250' },
                { id: 'under500', label: 'Under ₹500' },
                { id: 'above500', label: '₹500+' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setPriceRange(pill.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    priceRange === pill.id
                      ? 'bg-[#FEE5D2] text-[#7C3F27] font-semibold border border-[#D29C83]'
                      : 'text-[#7C3F27] hover:bg-[#FEEDDD]/70 border border-[#D29C83]/20'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Results count & reset */}
            <div className="flex items-center gap-3 ml-auto text-xs text-[#7C3F27]">
              <span>
                Showing <strong className="text-[#411C10]">{filteredItems.length}</strong> items
              </span>
              {(selectedCategory !== 'All' || searchQuery || priceRange !== 'all' || sortBy !== 'featured') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-[#7C3F27] underline hover:text-[#411C10]"
                >
                  Reset filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Cards Grid */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <MenuCard
                  key={item.id || item._id}
                  item={item}
                  priority={index < 4}
                  onOpenLightbox={() => handleOpenLightbox(item)}
                  onOrderNow={(selectedItem, selectedTier) =>
                    setOrderModal({ isOpen: true, item: selectedItem, tier: selectedTier })
                  }
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 max-w-md mx-auto">
            <p className="font-serif text-xl text-[#411C10]">No creations match your filter</p>
            <p className="mt-2 text-xs text-[#7C3F27]">
              Try searching for another flavor or clearing the price range filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-full bg-[#7C3F27] text-[#FEEDDD] text-xs font-medium hover:bg-[#5E2B19] transition-colors"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Custom Order Special Callout */}
        <section className="mt-16 bg-[#411C10] text-[#FFF9F3] rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#F7B6A7] block mb-2">
              BESPOKE CELEBRATION CAKES
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-tight">
              Looking for a custom design or special dietary request?
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-[#FDEADA]/85 leading-relaxed">
              We specialize in custom tier cakes, personalized message decorations, eggless options, and curated party boxes. Send us your reference photos or theme on WhatsApp!
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={`https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(
                  "Hello Pastry Paws! I'd like to inquire about a custom celebration cake."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#F7B6A7] text-[#411C10] font-medium px-5 py-2.5 rounded-full text-xs sm:text-sm hover:bg-[#FEEDDD] transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 border border-[#F7B6A7]/40 text-[#FEEDDD] hover:bg-[#FFF9F3]/10 font-medium px-4 py-2.5 rounded-full text-xs sm:text-sm transition-all"
              >
                <span>View Contact Details</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Modal */}
      <ImageLightbox
        isOpen={activeLightboxIndex !== null}
        item={currentLightboxItem}
        items={filteredItems}
        onClose={handleCloseLightbox}
        onPrev={filteredItems.length > 1 ? handlePrevLightbox : undefined}
        onNext={filteredItems.length > 1 ? handleNextLightbox : undefined}
      />

      {/* Order Now Checkout Modal */}
      <OrderModal
        isOpen={orderModal.isOpen}
        onClose={() => setOrderModal({ isOpen: false, item: null, tier: null })}
        item={orderModal.item}
        selectedTier={orderModal.tier}
      />
    </div>
  );
}
