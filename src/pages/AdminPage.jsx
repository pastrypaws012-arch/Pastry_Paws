import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Database,
  Cloud,
  CheckCircle,
  AlertCircle,
  ShoppingBag,
  Layers,
  Sparkles,
  ExternalLink,
  Search,
  RefreshCw,
  X,
  Eye,
  Check,
} from 'lucide-react';
import { categories as defaultCategories, creationsData as defaultCreations, specialtiesData as defaultOfferings } from '../data/creations';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'offerings', 'categories', 'orders', 'database'
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Notifications
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Item Form Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [itemForm, setItemForm] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    cloudinaryPublicId: '',
    badge: '',
    featured: false,
    pricingDetails: [{ size: '250gm', price: '₹199/-' }],
  });

  // Category Form Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Offering Form Modal State
  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState(null);
  const [offeringForm, setOfferingForm] = useState({
    number: '01',
    title: '',
    subtitle: '',
    description: '',
    price: '',
    image: '',
    cloudinaryPublicId: '',
    accent: '',
    link: '#contact',
  });

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes, ordersRes, offeringsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/items`),
        fetch(`${API_BASE_URL}/api/categories`),
        fetch(`${API_BASE_URL}/api/orders`),
        fetch(`${API_BASE_URL}/api/offerings`),
      ]);

      if (itemsRes.ok) {
        const data = await itemsRes.json();
        setItems(data.data || []);
      } else {
        // Fallback to local default if server not yet populated
        setItems(defaultCreations);
      }

      if (catsRes.ok) {
        const data = await catsRes.json();
        if (data.data && data.data.length > 0) {
          setCategories(data.data);
        } else {
          setCategories(defaultCategories.filter((c) => c !== 'All').map((name, i) => ({ name, order: i + 1 })));
        }
      } else {
        setCategories(defaultCategories.filter((c) => c !== 'All').map((name, i) => ({ name, order: i + 1 })));
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data || []);
      }

      if (offeringsRes.ok) {
        const data = await offeringsRes.json();
        if (data.data && data.data.length > 0) {
          setOfferings(data.data);
        } else {
          setOfferings(defaultOfferings);
        }
      } else {
        setOfferings(defaultOfferings);
      }
    } catch {
      // Offline fallback
      setItems(defaultCreations);
      setCategories(defaultCategories.filter((c) => c !== 'All').map((name, i) => ({ name, order: i + 1 })));
      setOfferings(defaultOfferings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Image Upload via Multer / Image endpoint
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setItemForm((prev) => ({
          ...prev,
          image: data.imageUrl,
          cloudinaryPublicId: data.publicId || '',
        }));
        showToast(
          data.storage === 'cloudinary'
            ? 'Uploaded and optimized on Cloudinary CDN!'
            : 'Image saved to uploads directory'
        );
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Could not connect to upload server', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Pricing tier row handlers
  const handleAddPricingTier = () => {
    setItemForm((prev) => ({
      ...prev,
      pricingDetails: [...prev.pricingDetails, { size: '', price: '' }],
    }));
  };

  const handleRemovePricingTier = (index) => {
    setItemForm((prev) => ({
      ...prev,
      pricingDetails: prev.pricingDetails.filter((_, i) => i !== index),
    }));
  };

  const handlePricingTierChange = (index, field, value) => {
    setItemForm((prev) => {
      const updated = [...prev.pricingDetails];
      updated[index][field] = value;
      return { ...prev, pricingDetails: updated };
    });
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `${API_BASE_URL}/api/items/${editingItem._id || editingItem.id}`
        : `${API_BASE_URL}/api/items`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemForm),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingItem ? 'Item updated successfully!' : 'New item created successfully!');
        setIsItemModalOpen(false);
        setEditingItem(null);
        fetchData();
      } else {
        showToast(data.message || 'Error saving item', 'error');
      }
    } catch {
      showToast('Backend offline - saved in local preview state', 'error');
      // Local update preview
      if (editingItem) {
        setItems((prev) => prev.map((item) => (item.id === editingItem.id ? { ...item, ...itemForm } : item)));
      } else {
        setItems((prev) => [{ ...itemForm, id: `local-${Date.now()}` }, ...prev]);
      }
      setIsItemModalOpen(false);
      setEditingItem(null);
    }
  };

  // Delete Item
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.title}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/items/${item._id || item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Item deleted successfully!');
        fetchData();
      } else {
        showToast(data.message || 'Error deleting item', 'error');
      }
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== item.id && i._id !== item._id));
      showToast('Item removed from local state', 'success');
    }
  };

  // Save Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        showToast('Category created!');
        setIsCategoryModalOpen(false);
        setCategoryName('');
        fetchData();
      } else {
        showToast(data.message || 'Error creating category', 'error');
      }
    } catch {
      setCategories((prev) => [...prev, { name: categoryName.trim(), order: prev.length + 1 }]);
      showToast('Category added to local preview', 'success');
      setIsCategoryModalOpen(false);
      setCategoryName('');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${cat._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted!');
        fetchData();
      }
    } catch {
      setCategories((prev) => prev.filter((c) => c.name !== cat.name));
      showToast('Category removed from local state');
    }
  };

  // Offering Handlers
  const handleOpenOfferingModal = (offering = null) => {
    if (offering) {
      setEditingOffering(offering);
      setOfferingForm({
        number: offering.number || '01',
        title: offering.title || '',
        subtitle: offering.subtitle || '',
        description: offering.description || '',
        price: offering.price || '',
        image: offering.image || '',
        cloudinaryPublicId: offering.cloudinaryPublicId || '',
        accent: offering.accent || '',
        link: offering.link || '#contact',
      });
    } else {
      setEditingOffering(null);
      setOfferingForm({
        number: `0${offerings.length + 1}`,
        title: '',
        subtitle: '',
        description: '',
        price: '',
        image: 'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg',
        cloudinaryPublicId: '',
        accent: '',
        link: '#contact',
      });
    }
    setIsOfferingModalOpen(true);
  };

  const handleOfferingImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setOfferingForm((prev) => ({
          ...prev,
          image: data.imageUrl,
          cloudinaryPublicId: data.publicId || '',
        }));
        showToast('Uploaded and optimized on Cloudinary CDN!');
      } else {
        showToast(data.message || 'Image upload failed', 'error');
      }
    } catch {
      showToast('Could not connect to upload server', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveOffering = async (e) => {
    e.preventDefault();
    if (!offeringForm.title.trim()) return;

    try {
      const url = editingOffering
        ? `${API_BASE_URL}/api/offerings/${editingOffering._id || editingOffering.id}`
        : `${API_BASE_URL}/api/offerings`;
      const method = editingOffering ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offeringForm),
      });

      const data = await res.json();
      if (data.success) {
        showToast(editingOffering ? 'Offering updated successfully!' : 'New offering created!');
        setIsOfferingModalOpen(false);
        setEditingOffering(null);
        fetchData();
      } else {
        showToast(data.message || 'Error saving offering', 'error');
      }
    } catch {
      showToast('Error connecting to server', 'error');
    }
  };

  const handleDeleteOffering = async (offering) => {
    if (!window.confirm(`Delete offering "${offering.title}"?`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/offerings/${offering._id || offering.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast('Offering deleted successfully!');
        fetchData();
      } else {
        showToast(data.message || 'Error deleting offering', 'error');
      }
    } catch {
      setOfferings((prev) => prev.filter((o) => (o._id || o.id) !== (offering._id || offering.id)));
      showToast('Offering removed from local state', 'success');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order status updated to ${newStatus}`);
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Status updated in local view`);
    }
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    const matchCat =
      selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;
    const matchQuery =
      !searchFilter ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="min-h-screen bg-[#FEEDDD]/30 text-[#411C10] font-sans antialiased pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs sm:text-sm font-medium ${toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFF9F3]/95 backdrop-blur-md border-b border-[#D29C83]/30 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3F27] hover:text-[#411C10] bg-[#FEEDDD] px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-[#D29C83]/40 transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to Menu</span>
              <span className="sm:hidden">Menu</span>
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-sm sm:text-xl text-[#411C10] font-normal leading-tight flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline">Pastry Paws Admin</span>
                <span className="sm:hidden font-medium">Admin</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#7C3F27] text-[#FFF9F3] shrink-0">
                  Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchData}
              title="Refresh Data"
              className="p-2 rounded-xl border border-[#D29C83]/30 text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/"
              className="text-xs text-[#7C3F27] hover:text-[#411C10] items-center gap-1 hidden md:flex"
            >
              <span>View Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5">
        <div className="flex items-center gap-2 border-b border-[#D29C83]/30 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'items'
                ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
                : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Menu Items ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
                : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offerings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'offerings'
                ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
                : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Our Offerings ({offerings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
                : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ml-auto ${
              activeTab === 'database'
                ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
                : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Database Status</span>
          </button>
        </div>

        {/* TAB 1: MENU ITEMS (CARD-BASED RESPONSIVE UI) */}
        {activeTab === 'items' && (
          <div className="pt-5 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by title or category..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="All">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setItemForm({
                    title: '',
                    category: categories[0]?.name || 'Cakes',
                    description: '',
                    image: '',
                    cloudinaryPublicId: '',
                    badge: '',
                    featured: false,
                    pricingDetails: [
                      { size: '250gm', price: '₹199/-' },
                      { size: '500gm', price: '₹399/-' },
                    ],
                  });
                  setIsItemModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Creation</span>
              </button>
            </div>

            {/* Responsive Card Grid (Nothing goes off-screen) */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 px-4">
                <ShoppingBag className="w-8 h-8 text-[#D29C83] mx-auto mb-2" />
                <p className="font-serif text-base text-[#411C10]">No creations match your search.</p>
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setSelectedCategoryFilter('All');
                  }}
                  className="mt-2 text-xs text-[#7C3F27] underline cursor-pointer"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id || item._id}
                    className="bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
                  >
                    <div>
                      {/* Top Row: Thumbnail + Title & Category */}
                      <div className="flex gap-3.5 items-start">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border border-[#D29C83]/30 bg-[#FEEDDD] shrink-0"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/30">
                              {item.category}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#7C3F27] text-white">
                                {item.badge}
                              </span>
                            )}
                            {item.featured && (
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                                Featured
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif font-medium text-base text-[#411C10] leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-[11px] text-[#7C3F27]/80 line-clamp-2 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pricing Tiers Container */}
                      <div className="mt-3 pt-3 border-t border-[#D29C83]/20">
                        <div className="text-[10px] uppercase tracking-wider text-[#A66D54] font-semibold mb-1.5">
                          Pricing Tiers:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.pricingDetails && item.pricingDetails.length > 0 ? (
                            item.pricingDetails.map((p, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] px-2 py-0.5 rounded-lg bg-[#FEEDDD]/70 border border-[#D29C83]/25 text-[#411C10]"
                              >
                                {p.size}: <strong className="text-[#7C3F27]">{p.price}</strong>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#7C3F27] font-semibold">
                              From ₹{item.startingPrice || '—'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions */}
                    <div className="mt-4 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#A66D54]">
                        Starting: <strong className="text-[#411C10]">₹{item.startingPrice || item.pricingDetails?.[0]?.price?.replace(/[^\d]/g, '') || '—'}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setItemForm({
                              title: item.title,
                              category: item.category,
                              description: item.description || '',
                              image: item.image || '',
                              cloudinaryPublicId: item.cloudinaryPublicId || '',
                              badge: item.badge || '',
                              featured: Boolean(item.featured),
                              pricingDetails:
                                item.pricingDetails && item.pricingDetails.length > 0
                                  ? item.pricingDetails
                                  : [{ size: 'Portion', price: `₹${item.startingPrice}/-` }],
                            });
                            setIsItemModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FEEDDD] hover:bg-[#7C3F27] text-[#7C3F27] hover:text-[#FEEDDD] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Edit creation"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                          title="Delete creation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="pt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#411C10]">Menu Categories</h3>
                <p className="text-xs text-[#7C3F27]">
                  Add or manage categories to organize chocolate bowls, brownies, cakes, and cookies.
                </p>
              </div>
              <button
                onClick={() => {
                  setCategoryName('');
                  setIsCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {categories.map((cat, idx) => (
                <div
                  key={cat.name}
                  className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 flex items-center justify-between shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#FEEDDD] text-[#7C3F27] text-xs font-bold flex items-center justify-center border border-[#D29C83]/30">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-sm text-[#411C10]">{cat.name}</h4>
                      <span className="text-[10px] text-[#A66D54]">
                        {items.filter((i) => i.category === cat.name).length} items listed
                      </span>
                    </div>
                  </div>
                  {cat._id && (
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: OUR OFFERINGS */}
        {activeTab === 'offerings' && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-[#411C10]">Our Offerings (Specialties)</h3>
                <p className="text-xs text-[#7C3F27]">
                  These are the featured specialty cards showcased in the homepage "OUR OFFERINGS" section.
                </p>
              </div>
              <button
                onClick={() => handleOpenOfferingModal()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Offering</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {offerings.map((off, idx) => (
                <div
                  key={off._id || off.id || idx}
                  className="p-4 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div className="flex gap-3.5 items-start">
                    <img
                      src={off.image}
                      alt={off.title}
                      className="w-20 h-20 rounded-xl object-cover border border-[#D29C83]/30 bg-[#FEEDDD] shrink-0"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold text-[#7C3F27] bg-[#FEEDDD] px-2 py-0.5 rounded border border-[#D29C83]/30">
                          {off.number || `0${idx + 1}`}
                        </span>
                        <h4 className="font-serif font-medium text-base text-[#411C10] truncate">
                          {off.title}
                        </h4>
                      </div>
                      {off.subtitle && (
                        <p className="text-[11px] text-[#A66D54] font-medium truncate">
                          {off.subtitle}
                        </p>
                      )}
                      {off.description && (
                        <p className="text-[11px] text-[#7C3F27]/85 mt-1 line-clamp-2 leading-relaxed">
                          {off.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {off.accent && (
                        <span className="text-[10px] bg-[#FEEDDD] text-[#7C3F27] px-2 py-0.5 rounded-full font-medium">
                          {off.accent}
                        </span>
                      )}
                      {off.price && (
                        <span className="text-xs font-bold text-[#411C10]">
                          {off.price}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenOfferingModal(off)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#FEEDDD] hover:bg-[#7C3F27] text-[#7C3F27] hover:text-[#FEEDDD] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        title="Edit offering"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteOffering(off)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete offering"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="pt-5 space-y-4">
            <div>
              <h3 className="font-serif text-lg text-[#411C10]">Customer Orders</h3>
              <p className="text-xs text-[#7C3F27]">
                Live orders submitted through the website, sorted by most recent.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 max-w-md mx-auto px-4">
                <ShoppingBag className="w-10 h-10 text-[#D29C83] mx-auto mb-2" />
                <p className="font-serif text-lg text-[#411C10]">No orders received yet</p>
                <p className="text-xs text-[#7C3F27] mt-1">
                  When customers click 'Order Now' on the menu, their order records will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((ord) => (
                  <div
                    key={ord._id || ord.orderId}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-[#7C3F27] bg-[#FEEDDD] px-2.5 py-0.5 rounded-md border border-[#D29C83]/30">
                          {ord.orderId}
                        </span>
                        <span className="text-[11px] text-[#A66D54]">
                          {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4 className="font-serif text-base text-[#411C10] leading-snug">
                        {ord.itemTitle} ({ord.selectedSize})
                      </h4>
                      <div className="text-sm font-bold text-[#7C3F27] mt-0.5">
                        {ord.price}
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#D29C83]/20 text-xs text-[#7C3F27] space-y-1">
                        <p>
                          <span className="text-[#A66D54]">Customer:</span>{' '}
                          <strong className="text-[#411C10]">{ord.customerName}</strong> ({ord.customerPhone})
                        </p>
                        <p className="break-words">
                          <span className="text-[#A66D54]">Delivery Address:</span>{' '}
                          <span className="text-[#411C10]">{ord.deliveryAddress}</span>
                        </p>
                        {ord.notes && (
                          <p className="text-[11px] text-[#A66D54] italic mt-1 bg-[#FEEDDD]/40 p-2 rounded-lg">
                            Note: "{ord.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#A66D54] font-medium">Status:</span>
                      <select
                        value={ord.status || 'pending'}
                        onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.status === 'baking'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-[#FEEDDD] text-[#7C3F27] border-[#D29C83]/40'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="baking">Baking in Oven</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DATABASE & Image STATUS */}
        {activeTab === 'database' && (
          <div className="pt-6 space-y-6 max-w-3xl">
            {/* MongoDB Atlas Card */}
            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-[#411C10]">MongoDB Atlas Database</h3>
                  <p className="text-xs text-[#7C3F27]">
                    Cloud document storage for dynamic categories, products, and customer orders.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FEEDDD]/40 rounded-xl text-xs space-y-1.5 border border-[#D29C83]/25">
                <div className="flex justify-between">
                  <span className="text-[#A66D54]">Connection String:</span>
                  <span className="font-mono text-[#411C10] truncate max-w-xs">
                    {process.env.MONGODB_URI ? 'Configured in .env' : 'Set MONGODB_URI in .env file'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A66D54]">Active Collections:</span>
                  <span className="font-semibold text-[#7C3F27]">categories, menuitems, orders</span>
                </div>
              </div>
            </div>

            {/* Cloudinary CDN Card */}
            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-[#411C10]">Cloudinary Image CDN</h3>
                  <p className="text-xs text-[#7C3F27]">
                    High-speed global image delivery, automatic WebP format conversion, and responsive optimization.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FEEDDD]/40 rounded-xl text-xs space-y-1.5 border border-[#D29C83]/25">
                <div className="flex justify-between">
                  <span className="text-[#A66D54]">Cloudinary Keys:</span>
                  <span className="font-semibold text-[#7C3F27]">
                    Configure CLOUDINARY_CLOUD_NAME, API_KEY, & API_SECRET in Backend/.env
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A66D54]">Fallback Storage:</span>
                  <span className="text-[#7C3F27]">Local uploads folder (works automatically offline)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ADD / EDIT MENU ITEM */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsItemModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D29C83]/20 bg-[#FEEDDD]/70">
                <h3 className="font-serif text-lg text-[#411C10]">
                  {editingItem ? 'Edit Creation' : 'Add New Creation'}
                </h3>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="p-1 rounded-full text-[#7C3F27] hover:bg-[#FEE5D2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="overflow-y-auto p-5 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Title / Dessert Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    placeholder="e.g. Nutella Brownie Bowl"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={itemForm.badge}
                      onChange={(e) => setItemForm({ ...itemForm, badge: e.target.value })}
                      placeholder="e.g. Bestseller, Must Try, New"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Describe flavor notes, ingredients, chocolate percentage..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>

                {/* Image Upload / Image */}
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Photo (Image / Upload / URL)
                  </label>
                  <div className="flex items-center gap-3">
                    {itemForm.image && (
                      <img
                        src={itemForm.image}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-[#D29C83]/40"
                      />
                    )}
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#FEE5D2] px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border border-[#D29C83]/30 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={itemForm.image}
                        onChange={(e) => setItemForm({ ...itemForm, image: e.target.value })}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Dynamic Price-by-Weight / Portion Builder */}
                <div className="pt-2 border-t border-[#D29C83]/20">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#411C10]">
                      Price by Weight / Size / Quantity
                    </label>
                    <button
                      type="button"
                      onClick={handleAddPricingTier}
                      className="text-xs text-[#7C3F27] hover:text-[#411C10] font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Tier</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {itemForm.pricingDetails.map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          required
                          value={tier.size}
                          onChange={(e) => handlePricingTierChange(idx, 'size', e.target.value)}
                          placeholder="Size (e.g. 250gm, 500gm, 1kg, 5 pcs)"
                          className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                        />
                        <input
                          type="text"
                          required
                          value={tier.price}
                          onChange={(e) => handlePricingTierChange(idx, 'price', e.target.value)}
                          placeholder="Price (e.g. ₹199/-)"
                          className="w-28 px-3 py-1.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                        />
                        {itemForm.pricingDetails.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePricingTier(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={itemForm.featured}
                    onChange={(e) => setItemForm({ ...itemForm, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#7C3F27] rounded"
                  />
                  <label htmlFor="featured" className="text-xs font-medium text-[#411C10]">
                    Feature on Homepage Showcase
                  </label>
                </div>

                <div className="pt-3 border-t border-[#D29C83]/20 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-medium text-[#7C3F27] hover:bg-[#FEEDDD]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7C3F27] text-white hover:bg-[#5E2B19] text-xs font-medium shadow-xs"
                  >
                    Save Creation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD CATEGORY */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl p-5"
            >
              <h3 className="font-serif text-lg text-[#411C10] mb-3">Add New Category</h3>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="e.g. Dessert Jars, Muffins"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-medium text-[#7C3F27]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7C3F27] text-white hover:bg-[#5E2B19] text-xs font-medium shadow-xs"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD / EDIT OFFERING */}
      <AnimatePresence>
        {isOfferingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOfferingModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl p-6 z-10 my-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-[#411C10]">
                  {editingOffering ? 'Edit Offering' : 'New Offering Card'}
                </h3>
                <button
                  onClick={() => setIsOfferingModalOpen(false)}
                  className="p-1 rounded-full text-[#A66D54] hover:bg-[#FEEDDD] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOffering} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Number
                    </label>
                    <input
                      type="text"
                      value={offeringForm.number}
                      onChange={(e) => setOfferingForm({ ...offeringForm, number: e.target.value })}
                      placeholder="01"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={offeringForm.title}
                      onChange={(e) => setOfferingForm({ ...offeringForm, title: e.target.value })}
                      placeholder="e.g. Celebration Cakes"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Subtitle / Flavors
                  </label>
                  <input
                    type="text"
                    value={offeringForm.subtitle}
                    onChange={(e) => setOfferingForm({ ...offeringForm, subtitle: e.target.value })}
                    placeholder="e.g. Chocolate • Biscoff • Red Velvet"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={offeringForm.description}
                    onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })}
                    placeholder="Short description of this offering..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Starting Price
                    </label>
                    <input
                      type="text"
                      value={offeringForm.price}
                      onChange={(e) => setOfferingForm({ ...offeringForm, price: e.target.value })}
                      placeholder="From ₹399/-"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Accent Pill Text
                    </label>
                    <input
                      type="text"
                      value={offeringForm.accent}
                      onChange={(e) => setOfferingForm({ ...offeringForm, accent: e.target.value })}
                      placeholder="e.g. Complimentary Mini Cookies"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Offering Image */}
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Offering Image (Cloudinary)
                  </label>
                  <div className="flex items-center gap-3">
                    {offeringForm.image && (
                      <img
                        src={offeringForm.image}
                        alt="Preview"
                        className="w-14 h-14 rounded-xl object-cover border border-[#D29C83]/40"
                      />
                    )}
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#FEE5D2] px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border border-[#D29C83]/30 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOfferingImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        value={offeringForm.image}
                        onChange={(e) => setOfferingForm({ ...offeringForm, image: e.target.value })}
                        placeholder="Cloudinary image URL"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D29C83]/20">
                  <button
                    type="button"
                    onClick={() => setIsOfferingModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-medium text-[#7C3F27]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#7C3F27] text-white hover:bg-[#5E2B19] text-xs font-medium shadow-xs"
                  >
                    {editingOffering ? 'Update Offering' : 'Create Offering'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
