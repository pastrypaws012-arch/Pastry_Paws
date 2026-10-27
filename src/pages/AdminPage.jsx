import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  EyeOff,
  Check,
  AlertTriangle,
  Download,
  FileText,
  Lock,
  LogOut,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  Copy,
  ShieldCheck,
  Maximize2,
  QrCode,
  Clock,
  Filter,
  Calendar,
  ArrowUpDown,
  Tag,
  Star,
  RotateCcw,
  ChevronDown,
  CheckCheck,
  ListFilter,
  CreditCard,
  Phone,
  Smartphone,
  Save,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';
import { printOrderInvoice } from '../utils/invoiceGenerator';
import {
  getCachedPaymentConfig,
  fetchPaymentConfig,
  savePaymentConfig,
} from '../utils/paymentConfig';

export function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Security gate: Must come through authorized portal link AND authenticate each time
  const [isPortalVerified, setIsPortalVerified] = useState(() => {
    return (
      Boolean(location.state?.fromAdminPortalLink) ||
      sessionStorage.getItem('pastry_admin_portal') === 'true'
    );
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('pastry_admin_authenticated') === 'true';
  });

  useEffect(() => {
    if (location.state?.fromAdminPortalLink) {
      sessionStorage.setItem('pastry_admin_portal', 'true');
      setIsPortalVerified(true);
    }
  }, [location.state]);

  const [adminIdInput, setAdminIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('items'); // 'items', 'offerings', 'categories', 'orders', 'database'
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);

  // TAB 5: Payment & QR Settings State
  const [paymentSettings, setPaymentSettings] = useState(getCachedPaymentConfig);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [uploadingQrImage, setUploadingQrImage] = useState(false);
  const [paymentFormError, setPaymentFormError] = useState('');
  const [copiedAdminUpi, setCopiedAdminUpi] = useState(false);

  // TAB 6: Google Reviews Management State
  const [googleReviews, setGoogleReviews] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState({
    placeName: 'Pastry Paws',
    rating: 5.0,
    reviewsCount: '5.0 ★★★★★ on Google',
    googleMapsUrl: 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6',
    placeId: 'ChIJ9a1uLoipUjoR-t29x-KVXvc',
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFilterRating, setReviewsFilterRating] = useState('all'); // 'all' | '5' | '4' | 'below4'
  const [reviewsFilterVisibility, setReviewsFilterVisibility] = useState('all'); // 'all' | 'visible' | 'hidden'
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    author_name: '',
    rating: 5,
    text: '',
    relative_time_description: 'Recently',
    occasion: '',
    highlight: '',
    author_url: 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6',
    isDisplayed: true,
  });
  const [savingReview, setSavingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(null);
  const [savingReviewsSummary, setSavingReviewsSummary] = useState(false);
  const [isEditSummaryModalOpen, setIsEditSummaryModalOpen] = useState(false);
  const [summaryForm, setSummaryForm] = useState({
    placeName: 'Pastry Paws',
    rating: 5.0,
    reviewsCount: '5.0 ★★★★★ on Google',
    googleMapsUrl: 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6',
    placeId: 'ChIJ9a1uLoipUjoR-t29x-KVXvc',
  });

  // TAB 1: Menu Items Filter & Sort States
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedBadgeFilter, setSelectedBadgeFilter] = useState('All');
  const [selectedFeaturedFilter, setSelectedFeaturedFilter] = useState('All');
  const [itemsSortBy, setItemsSortBy] = useState('default');

  // TAB 2: Categories Filter & Sort States
  const [categoriesSearchQuery, setCategoriesSearchQuery] = useState('');
  const [categoriesSortBy, setCategoriesSortBy] = useState('default');

  // TAB 3: Offerings Filter & Sort States
  const [offeringsSearchQuery, setOfferingsSearchQuery] = useState('');
  const [offeringsSortBy, setOfferingsSortBy] = useState('default');
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch Live System Status (Database & Cloudinary)
  const fetchSystemStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/status`);
      const json = await res.json();
      if (json.success) {
        setSystemStatus(json);
      }
    } catch (err) {
      console.error('System status error:', err);
    } finally {
      setStatusLoading(false);
    }
  };

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
    addons: [],
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

  // Admin Order Cancellation Review State
  const [approvingOrder, setApprovingOrder] = useState(null);
  const [denyingOrder, setDenyingOrder] = useState(null);
  const [adminDenialReason, setAdminDenialReason] = useState('');
  const [denialError, setDenialError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Admin UPI Payment & Order Verification State
  const [ordersPaymentFilter, setOrdersPaymentFilter] = useState('all'); // 'all' | 'pending_verification' | 'verified' | 'rejected'
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'baking' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'cancel_requested'
  const [ordersDateFilter, setOrdersDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | '7days' | 'month'
  const [ordersSortBy, setOrdersSortBy] = useState('newest'); // 'newest' | 'oldest' | 'price_high' | 'price_low' | 'customer'
  const [previewReceiptImage, setPreviewReceiptImage] = useState(null);
  const [previewReceiptOrder, setPreviewReceiptOrder] = useState(null);
  const [rejectingPaymentOrder, setRejectingPaymentOrder] = useState(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState('UTR / Transaction ID not found in bank statement');
  const [paymentRejectCustomReason, setPaymentRejectCustomReason] = useState('');
  const [paymentRejectError, setPaymentRejectError] = useState('');
  const [copiedTxId, setCopiedTxId] = useState(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState(null);

  // In-App Deletion Confirmation States (No blocked window.confirm)
  const [deletingOffering, setDeletingOffering] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

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
        setItems([]);
      }

      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(data.data || []);
      } else {
        setCategories([]);
      }

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.data || []);
      }

      if (offeringsRes.ok) {
        const data = await offeringsRes.json();
        setOfferings(data.data || []);
      } else {
        setOfferings([]);
      }

      // Fetch Payment Configuration
      try {
        const paymentRes = await fetch(`${API_BASE_URL}/api/payment-config`);
        if (paymentRes.ok) {
          const pData = await paymentRes.json();
          if (pData.success && pData.data) {
            setPaymentSettings(pData.data);
          }
        }
      } catch (pErr) {
        console.warn('Error fetching payment config in admin:', pErr);
      }

      // Fetch Google Reviews & Place Configuration
      try {
        const reviewsRes = await fetch(`${API_BASE_URL}/api/google-reviews/admin`);
        if (reviewsRes.ok) {
          const rData = await reviewsRes.json();
          if (rData.success) {
            setGoogleReviews(rData.reviews || []);
            if (rData.summary) {
              setReviewsSummary(rData.summary);
              setSummaryForm(rData.summary);
            }
          }
        }
      } catch (rErr) {
        console.warn('Error fetching google reviews in admin:', rErr);
      }
    } catch {
      setItems([]);
      setCategories([]);
      setOfferings([]);
    } finally {
      setLoading(false);
      fetchSystemStatus();
    }
  };

  // Handle Save Payment Settings
  const handleSavePaymentSettings = async (e) => {
    if (e) e.preventDefault();
    setPaymentFormError('');

    if (!paymentSettings.upiId || !paymentSettings.upiId.trim()) {
      setPaymentFormError('A valid UPI ID is required (e.g. 9790983844@okaxis).');
      return;
    }

    const cleanPhone = (paymentSettings.phoneNumber || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setPaymentFormError('Please enter a valid 10-digit mobile phone number for payment support.');
      return;
    }

    setSavingPayment(true);
    try {
      const updated = await savePaymentConfig({
        upiId: paymentSettings.upiId.trim(),
        payeeName: (paymentSettings.payeeName || 'Pastry Paws').trim(),
        phoneNumber: cleanPhone,
        whatsappNumber: (paymentSettings.whatsappNumber || '919790983844').trim(),
        qrCodeImage: paymentSettings.qrCodeImage || '',
        qrCodePublicId: paymentSettings.qrCodePublicId || '',
        qrMode: paymentSettings.qrMode || (paymentSettings.qrCodeImage ? 'custom' : 'dynamic'),
        instructions: (paymentSettings.instructions || '').trim(),
      });

      setPaymentSettings(updated);
      showToast('Payment QR & UPI settings updated across all checkout and tracking pages!', 'success');
    } catch (err) {
      setPaymentFormError(err.message || 'Failed to save payment settings.');
      showToast(err.message || 'Failed to update payment settings.', 'error');
    } finally {
      setSavingPayment(false);
    }
  };

  // Handle Standee QR Image Upload
  const handleUploadQrImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPaymentFormError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setPaymentFormError('File size is too large. Please upload an image under 12MB.');
      return;
    }

    setUploadingQrImage(true);
    setPaymentFormError('');

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setPaymentSettings((prev) => ({
          ...prev,
          qrCodeImage: data.imageUrl,
          qrCodePublicId: data.publicId || '',
          qrMode: 'custom',
        }));
        showToast('Standee QR code uploaded! Click "Save Payment Settings" to publish.', 'success');
      } else {
        setPaymentFormError(data.message || 'Failed to upload QR image.');
      }
    } catch (err) {
      setPaymentFormError('Error uploading QR code image: ' + err.message);
    } finally {
      setUploadingQrImage(false);
    }
  };

  // Remove Standee QR Image
  const handleRemoveQrImage = () => {
    setPaymentSettings((prev) => ({
      ...prev,
      qrCodeImage: '',
      qrCodePublicId: '',
      qrMode: 'dynamic',
    }));
    showToast('Standee QR removed. QR mode switched to Dynamic NPCI QR.', 'info');
  };

  // Filtered Google Reviews (Memoized)
  const filteredGoogleReviews = useMemo(() => {
    return googleReviews.filter((r) => {
      // Rating filter
      if (reviewsFilterRating === '5' && Number(r.rating) !== 5) return false;
      if (reviewsFilterRating === '4' && Number(r.rating) !== 4) return false;
      if (reviewsFilterRating === 'below4' && Number(r.rating) >= 4) return false;

      // Visibility filter
      if (reviewsFilterVisibility === 'visible' && !r.isDisplayed) return false;
      if (reviewsFilterVisibility === 'hidden' && r.isDisplayed) return false;

      // Search query
      if (reviewsSearchQuery.trim()) {
        const q = reviewsSearchQuery.toLowerCase();
        const matchesAuthor = r.author_name?.toLowerCase().includes(q);
        const matchesText = r.text?.toLowerCase().includes(q);
        const matchesHighlight = r.highlight?.toLowerCase().includes(q);
        const matchesOccasion = r.occasion?.toLowerCase().includes(q);
        if (!matchesAuthor && !matchesText && !matchesHighlight && !matchesOccasion) {
          return false;
        }
      }
      return true;
    });
  }, [googleReviews, reviewsFilterRating, reviewsFilterVisibility, reviewsSearchQuery]);

  // Toggle review visibility (Storefront visibility)
  const handleToggleReviewVisibility = async (review) => {
    try {
      const nextDisplayed = !review.isDisplayed;
      const res = await fetch(`${API_BASE_URL}/api/google-reviews/${review._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisplayed: nextDisplayed }),
      });
      const data = await res.json();
      if (data.success) {
        setGoogleReviews((prev) =>
          prev.map((r) => (r._id === review._id ? { ...r, isDisplayed: nextDisplayed } : r))
        );
        showToast(
          nextDisplayed
            ? 'Review is now visible on storefront!'
            : 'Review is now hidden from storefront.',
          'success'
        );
      } else {
        showToast(data.message || 'Failed to update visibility', 'error');
      }
    } catch {
      showToast('Network error updating review visibility', 'error');
    }
  };

  // Open modal to add or edit review
  const handleOpenReviewModal = (review = null) => {
    if (review) {
      setEditingReview(review);
      setReviewForm({
        author_name: review.author_name || '',
        rating: review.rating || 5,
        text: review.text || '',
        relative_time_description: review.relative_time_description || 'Recently',
        occasion: review.occasion || '',
        highlight: review.highlight || '',
        author_url: review.author_url || reviewsSummary.googleMapsUrl || 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6',
        isDisplayed: review.isDisplayed !== false,
      });
    } else {
      setEditingReview(null);
      setReviewForm({
        author_name: '',
        rating: 5,
        text: '',
        relative_time_description: 'Recently',
        occasion: '',
        highlight: '',
        author_url: reviewsSummary.googleMapsUrl || 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6',
        isDisplayed: true,
      });
    }
    setIsReviewModalOpen(true);
  };

  // Save review (create or update)
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.author_name.trim() || !reviewForm.text.trim()) {
      showToast('Author name and review text are required.', 'error');
      return;
    }
    setSavingReview(true);
    try {
      const url = editingReview
        ? `${API_BASE_URL}/api/google-reviews/${editingReview._id}`
        : `${API_BASE_URL}/api/google-reviews`;
      const method = editingReview ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          editingReview ? 'Review updated successfully!' : 'New review added successfully!',
          'success'
        );
        setIsReviewModalOpen(false);
        // Refresh reviews
        const refreshRes = await fetch(`${API_BASE_URL}/api/google-reviews/admin`);
        if (refreshRes.ok) {
          const rData = await refreshRes.json();
          if (rData.success) setGoogleReviews(rData.reviews || []);
        }
      } else {
        showToast(data.message || 'Failed to save review', 'error');
      }
    } catch {
      showToast('Network error saving review', 'error');
    } finally {
      setSavingReview(false);
    }
  };

  // Confirm delete review
  const handleConfirmDeleteReview = async () => {
    if (!deletingReview) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/google-reviews/${deletingReview._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setGoogleReviews((prev) => prev.filter((r) => r._id !== deletingReview._id));
        showToast('Review deleted successfully', 'success');
        setDeletingReview(null);
      } else {
        showToast(data.message || 'Failed to delete review', 'error');
      }
    } catch {
      showToast('Network error deleting review', 'error');
    }
  };

  // Save Google Place Summary configuration
  const handleSaveReviewsSummary = async (e) => {
    e.preventDefault();
    setSavingReviewsSummary(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/google-reviews/summary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summaryForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Google Place details updated successfully!', 'success');
        setReviewsSummary(data.data);
        setIsEditSummaryModalOpen(false);
      } else {
        showToast(data.message || 'Failed to update place details', 'error');
      }
    } catch {
      showToast('Network error updating place settings', 'error');
    } finally {
      setSavingReviewsSummary(false);
    }
  };

  // Only fetch sensitive database items once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Admin Login Verification Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const enteredId = adminIdInput.trim();
    const enteredPassword = passwordInput;

    const isIdValid = enteredId.toLowerCase() === 'pastrypaws';
    const isPasswordValid = enteredPassword === 'P@stry0123';

    if (isIdValid && isPasswordValid) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: enteredId, password: enteredPassword }),
        });
      } catch {
        // Safe continuation
      }

      sessionStorage.setItem('pastry_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setAuthLoading(false);
      showToast('Welcome back, Admin! Console unlocked.', 'success');
    } else {
      setAuthLoading(false);
      if (!isIdValid && !isPasswordValid) {
        setAuthError('Invalid Admin ID and Password. Access Denied.');
      } else if (!isIdValid) {
        setAuthError('Invalid Admin ID. Access Denied.');
      } else {
        setAuthError('Incorrect Password. Access Denied.');
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('pastry_admin_portal');
    sessionStorage.removeItem('pastry_admin_authenticated');
    setIsAuthenticated(false);
    setIsPortalVerified(false);
    setAdminIdInput('');
    setPasswordInput('');
    setAuthError('');
    navigate('/', { replace: true });
  };

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

  // Add-on row handlers (for optional product extras like toppings, candles, packaging)
  const handleAddAddon = () => {
    setItemForm((prev) => ({
      ...prev,
      addons: [...(prev.addons || []), { name: '', price: '' }],
    }));
  };

  const handleRemoveAddon = (index) => {
    setItemForm((prev) => ({
      ...prev,
      addons: (prev.addons || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddonChange = (index, field, value) => {
    setItemForm((prev) => {
      const updated = [...(prev.addons || [])];
      updated[index][field] = value;
      return { ...prev, addons: updated };
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

  // Delete Item Handler (via In-App Confirmation Modal)
  const handleConfirmDeleteItem = async () => {
    if (!deletingItem) return;
    const targetId = deletingItem._id || deletingItem.id;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/items/${targetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Item deleted successfully!');
        setItems((prev) => prev.filter((i) => i.id !== targetId && i._id !== targetId));
        setDeletingItem(null);
        fetchData();
      } else {
        showToast(data.message || 'Error deleting item', 'error');
      }
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== targetId && i._id !== targetId));
      setDeletingItem(null);
      showToast('Item removed from local state', 'success');
    } finally {
      setActionLoading(false);
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

  // Delete Category Handler (via In-App Confirmation Modal)
  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    const targetId = deletingCategory._id;
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${targetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted!');
        setCategories((prev) => prev.filter((c) => c._id !== targetId));
        setDeletingCategory(null);
        fetchData();
      } else {
        showToast(data.message || 'Error deleting category', 'error');
      }
    } catch {
      setCategories((prev) => prev.filter((c) => c._id !== targetId));
      setDeletingCategory(null);
      showToast('Category removed from local state');
    } finally {
      setActionLoading(false);
    }
  };

  // Offering Handlers
  const handleOpenOfferingModal = (offering = null) => {
    if (!offering && offerings.length >= 4) {
      showToast('Maximum 4 offerings limit reached (UI restriction). Please edit or delete an existing offering.', 'error');
      return;
    }

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

  // Delete Offering Handler (via In-App Confirmation Modal)
  const handleConfirmDeleteOffering = async () => {
    if (!deletingOffering) return;
    const targetId = deletingOffering._id || deletingOffering.id;
    if (!targetId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/offerings/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Offering "${deletingOffering.title}" deleted successfully!`);
        setOfferings((prev) =>
          prev.filter((o) => {
            if (targetId && (o._id === targetId || o.id === targetId)) return false;
            if (deletingOffering._id && o._id === deletingOffering._id) return false;
            if (deletingOffering.id && o.id === deletingOffering.id) return false;
            return true;
          })
        );
        setDeletingOffering(null);
        fetchData();
      } else {
        showToast(data.message || 'Error deleting offering', 'error');
      }
    } catch (err) {
      console.error('Delete offering error:', err);
      setOfferings((prev) =>
        prev.filter((o) => {
          if (targetId && (o._id === targetId || o.id === targetId)) return false;
          if (deletingOffering._id && o._id === deletingOffering._id) return false;
          if (deletingOffering.id && o.id === deletingOffering.id) return false;
          return true;
        })
      );
      setDeletingOffering(null);
      showToast('Offering removed from list', 'success');
    } finally {
      setActionLoading(false);
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

  // Admin Approve Customer Cancellation
  const handleConfirmApproveCancellation = async (order) => {
    if (!order) return;
    setActionLoading(true);
    try {
      const targetId = order._id || order.orderId;
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/approve-cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order #${order.orderId} cancellation approved.`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId || o._id === order._id || o._id === targetId
              ? { ...o, status: 'cancelled', cancellationStatus: 'approved' }
              : o
          )
        );
        setApprovingOrder(null);
        fetchData(); // Refresh everything from database
      } else {
        showToast(data.message || 'Error approving cancellation', 'error');
      }
    } catch (err) {
      console.error('Approve cancellation error:', err);
      showToast('Network error while approving cancellation', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin Deny Customer Cancellation
  const handleConfirmDenyCancellation = async (e) => {
    e.preventDefault();
    if (!denyingOrder) return;
    if (!adminDenialReason.trim()) {
      setDenialError('Please provide a reason for declining the cancellation request.');
      return;
    }
    setActionLoading(true);
    setDenialError('');
    try {
      const targetId = denyingOrder._id || denyingOrder.orderId;
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/deny-cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: adminDenialReason.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Cancellation declined for Order #${denyingOrder.orderId}. Customer will see this reason in Tracker.`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === denyingOrder.orderId || o._id === denyingOrder._id
              ? {
                ...o,
                cancellationStatus: 'denied',
                cancellationDeniedReason: adminDenialReason.trim(),
              }
              : o
          )
        );
        setDenyingOrder(null);
        setAdminDenialReason('');
      } else {
        setDenialError(data.message || 'Failed to decline cancellation.');
      }
    } catch {
      setDenialError('Network error while declining cancellation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Payment Verification Handlers
  const handleCopyTxId = (txId) => {
    if (!txId) return;
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2500);
  };

  const handleVerifyPayment = async (order) => {
    if (!order) return;
    const targetId = order._id || order.orderId;
    setVerifyingOrderId(targetId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/verify-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment for Order #${order.orderId} verified and confirmed!`, 'success');
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId || o._id === order._id || o._id === targetId
              ? {
                  ...o,
                  paymentStatus: 'verified',
                  paymentVerifiedAt: new Date().toISOString(),
                  paymentRejectedReason: '',
                  status: o.status === 'pending' ? 'confirmed' : o.status,
                }
              : o
          )
        );
      } else {
        showToast(data.message || 'Failed to verify payment', 'error');
      }
    } catch {
      showToast('Network error while verifying payment', 'error');
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleConfirmRejectPayment = async (e) => {
    e.preventDefault();
    if (!rejectingPaymentOrder) return;
    const finalReason =
      paymentRejectReason === 'custom'
        ? paymentRejectCustomReason.trim()
        : paymentRejectReason.trim();

    if (!finalReason) {
      setPaymentRejectError('Please provide a reason for rejecting the payment proof.');
      return;
    }

    const targetId = rejectingPaymentOrder._id || rejectingPaymentOrder.orderId;
    setActionLoading(true);
    setPaymentRejectError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/reject-payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: finalReason }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Payment for Order #${rejectingPaymentOrder.orderId} marked as rejected.`);
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === rejectingPaymentOrder.orderId || o._id === rejectingPaymentOrder._id || o._id === targetId
              ? {
                  ...o,
                  paymentStatus: 'rejected',
                  paymentRejectedReason: finalReason,
                }
              : o
          )
        );
        setRejectingPaymentOrder(null);
        setPaymentRejectReason('UTR / Transaction ID not found in bank statement');
        setPaymentRejectCustomReason('');
      } else {
        setPaymentRejectError(data.message || 'Failed to reject payment.');
      }
    } catch {
      setPaymentRejectError('Network error while rejecting payment.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        // Payment filter
        if (ordersPaymentFilter !== 'all') {
          if (ordersPaymentFilter === 'cod') {
            if (ord.paymentMethod !== 'Cash on Delivery' && ord.paymentMethod !== 'COD' && ord.paymentStatus !== 'cod_pending') return false;
          } else if (ordersPaymentFilter === 'pending_verification') {
            if ((ord.paymentStatus !== 'pending_verification' && ord.paymentStatus) || ord.paymentMethod === 'Cash on Delivery') return false;
          } else if (ord.paymentStatus !== ordersPaymentFilter) {
            return false;
          }
        }

        // Fulfillment status filter
        if (ordersStatusFilter !== 'all') {
          if (ordersStatusFilter === 'cancel_requested') {
            if (!ord.cancelRequested || ord.status === 'cancelled') return false;
          } else if (ord.status !== ordersStatusFilter) {
            return false;
          }
        }

        // Search Query (Order ID, Customer, Phone, Transaction ID / UTR, Item Title, Delivery Address, Payment Method)
        if (ordersSearchQuery.trim()) {
          const q = ordersSearchQuery.toLowerCase().trim();
          const matchId = (ord.orderId || '').toLowerCase().includes(q) || (ord._id || '').toLowerCase().includes(q);
          const matchCust = (ord.customerName || '').toLowerCase().includes(q);
          const matchPhone = (ord.customerPhone || '').includes(q);
          const matchUtr = (ord.transactionId || '').toLowerCase().includes(q);
          const matchItem = (ord.itemTitle || '').toLowerCase().includes(q);
          const matchAddr = (ord.deliveryAddress || '').toLowerCase().includes(q);
          const matchMethod = (ord.paymentMethod || '').toLowerCase().includes(q);
          if (!matchId && !matchCust && !matchPhone && !matchUtr && !matchItem && !matchAddr && !matchMethod) {
            return false;
          }
        }

        // Date filter
        if (ordersDateFilter !== 'all') {
          const ordDate = new Date(ord.createdAt || Date.now());
          const now = new Date();
          if (ordersDateFilter === 'today') {
            const isToday =
              ordDate.getDate() === now.getDate() &&
              ordDate.getMonth() === now.getMonth() &&
              ordDate.getFullYear() === now.getFullYear();
            if (!isToday) return false;
          } else if (ordersDateFilter === 'yesterday') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday =
              ordDate.getDate() === yesterday.getDate() &&
              ordDate.getMonth() === yesterday.getMonth() &&
              ordDate.getFullYear() === yesterday.getFullYear();
            if (!isYesterday) return false;
          } else if (ordersDateFilter === '7days') {
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (ordDate < sevenDaysAgo) return false;
          } else if (ordersDateFilter === 'month') {
            const isThisMonth =
              ordDate.getMonth() === now.getMonth() &&
              ordDate.getFullYear() === now.getFullYear();
            if (!isThisMonth) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        if (ordersSortBy === 'newest') return dateB - dateA;
        if (ordersSortBy === 'oldest') return dateA - dateB;

        const parsePrice = (priceStr) => {
          if (!priceStr) return 0;
          const num = String(priceStr).replace(/[^0-9.]/g, '');
          return parseFloat(num) || 0;
        };

        if (ordersSortBy === 'price_high') return parsePrice(b.price) - parsePrice(a.price);
        if (ordersSortBy === 'price_low') return parsePrice(a.price) - parsePrice(b.price);
        if (ordersSortBy === 'customer') return (a.customerName || '').localeCompare(b.customerName || '');
        return dateB - dateA;
      });
  }, [orders, ordersPaymentFilter, ordersStatusFilter, ordersSearchQuery, ordersDateFilter, ordersSortBy]);

  // Filtered & Sorted Items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchCat =
          selectedCategoryFilter === 'All' || item.category === selectedCategoryFilter;

        let matchQuery = true;
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase().trim();
          matchQuery =
            (item.title || '').toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.badge || '').toLowerCase().includes(q);
        }

        let matchBadge = true;
        if (selectedBadgeFilter !== 'All') {
          matchBadge = (item.badge || '').toLowerCase() === selectedBadgeFilter.toLowerCase();
        }

        let matchFeatured = true;
        if (selectedFeaturedFilter === 'featured') {
          matchFeatured = Boolean(item.featured);
        } else if (selectedFeaturedFilter === 'standard') {
          matchFeatured = !item.featured;
        }

        return matchCat && matchQuery && matchBadge && matchFeatured;
      })
      .sort((a, b) => {
        const getPrice = (it) => {
          if (it.startingPrice) return it.startingPrice;
          if (it.pricingDetails?.[0]?.price) {
            const num = String(it.pricingDetails[0].price).replace(/[^0-9.]/g, '');
            return parseFloat(num) || 0;
          }
          return 0;
        };

        if (itemsSortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        if (itemsSortBy === 'title_desc') return (b.title || '').localeCompare(a.title || '');
        if (itemsSortBy === 'price_asc') return getPrice(a) - getPrice(b);
        if (itemsSortBy === 'price_desc') return getPrice(b) - getPrice(a);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [items, selectedCategoryFilter, searchFilter, selectedBadgeFilter, selectedFeaturedFilter, itemsSortBy]);

  // Filtered & Sorted Categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (!categoriesSearchQuery.trim()) return true;
        return (cat.name || '').toLowerCase().includes(categoriesSearchQuery.toLowerCase().trim());
      })
      .sort((a, b) => {
        if (categoriesSortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (categoriesSortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (categoriesSortBy === 'items_high') {
          const countA = items.filter((i) => i.category === a.name).length;
          const countB = items.filter((i) => i.category === b.name).length;
          return countB - countA;
        }
        return 0;
      });
  }, [categories, categoriesSearchQuery, categoriesSortBy, items]);

  // Filtered & Sorted Offerings
  const filteredOfferings = useMemo(() => {
    return offerings
      .filter((off) => {
        if (!offeringsSearchQuery.trim()) return true;
        const q = offeringsSearchQuery.toLowerCase().trim();
        return (
          (off.title || '').toLowerCase().includes(q) ||
          (off.subtitle || '').toLowerCase().includes(q) ||
          (off.description || '').toLowerCase().includes(q) ||
          (off.accent || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (offeringsSortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        return (parseInt(a.number, 10) || 0) - (parseInt(b.number, 10) || 0);
      });
  }, [offerings, offeringsSearchQuery, offeringsSortBy]);

  // Security Guard 1: Direct URL access to /admin without clicking portal link is blocked
  if (!isPortalVerified && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDEADA] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-rose-700 bg-rose-100/80 px-2.5 py-1 rounded-full border border-rose-200">
              Access Restricted
            </span>
            <h1 className="font-serif text-2xl text-[#411C10] mt-3">
              403 • Access Denied
            </h1>
            <p className="text-xs text-[#7C3F27] mt-2 leading-relaxed">
              Direct access to this resource is restricted. You do not have permission to view this page directly.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Security Guard 2: Prompt for Admin ID (Pastrypaws) and Password (P@stry0123) every single time
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDEADA] flex items-center justify-center p-4">
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

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#A66D54] block">
              Authorized Personnel Only
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#411C10]">
              Admin Authentication
            </h1>
            <p className="text-xs text-[#7C3F27] leading-relaxed">
              Please enter your administrator ID and password to unlock the console.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            {authError && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#411C10] mb-1.5">
                Admin ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={adminIdInput}
                  onChange={(e) => {
                    setAdminIdInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter Admin ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-xs text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27] focus:ring-1 focus:ring-[#7C3F27]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#411C10] mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  placeholder="Enter Admin Password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-xs text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27] focus:ring-1 focus:ring-[#7C3F27]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Verify &amp; Enter Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center pt-2 border-t border-[#D29C83]/20">
            <Link
              to="/"
              className="text-xs text-[#A66D54] hover:text-[#411C10] inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
              className="p-2 rounded-xl border border-[#D29C83]/30 text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
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
            <button
              type="button"
              onClick={handleLogout}
              title="Lock Admin Console & Exit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout &amp; Lock</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-5">
        <div className="flex items-center gap-2 border-b border-[#D29C83]/30 pb-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${activeTab === 'items'
              ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
              : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Menu Items ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${activeTab === 'categories'
              ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
              : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
              }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offerings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${activeTab === 'offerings'
              ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
              : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
              }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Our Offerings ({offerings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${activeTab === 'orders'
              ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
              : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
              }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${activeTab === 'payment'
              ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
              : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
              }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment & QR Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ${activeTab === 'reviews'
              ? 'bg-[#7C3F27] text-[#FFF9F3] shadow-xs'
              : 'bg-[#FFF9F3] text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
              }`}
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>Google Reviews ({googleReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 whitespace-nowrap cursor-pointer ml-auto ${activeTab === 'database'
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
            {/* Enhanced Multi-Filter Action Bar */}
            <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs space-y-3">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Bar with Clear Button */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search creations by title, description, or badge..."
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/30 text-[#411C10] placeholder:text-[#A66D54]/60 focus:outline-none focus:border-[#7C3F27]"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Add New Creation CTA */}
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
                      addons: [],
                    });
                    setIsItemModalOpen(true);
                  }}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Creation</span>
                </button>
              </div>

              {/* Filter Controls Row */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D29C83]/20">
                <div className="inline-flex items-center gap-1.5 text-xs text-[#7C3F27] font-semibold mr-1">
                  <Filter className="w-3.5 h-3.5 text-[#7C3F27]" />
                  <span>Filters:</span>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="All">All Categories ({items.length})</option>
                  {categories.map((c) => {
                    const count = items.filter((i) => i.category === c.name).length;
                    return (
                      <option key={c.name} value={c.name}>
                        {c.name} ({count})
                      </option>
                    );
                  })}
                </select>

                {/* Badge Filter */}
                <select
                  value={selectedBadgeFilter}
                  onChange={(e) => setSelectedBadgeFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="All">All Badges</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Signature">Signature</option>
                  <option value="Chef's Special">Chef's Special</option>
                  <option value="Organic">Organic</option>
                  <option value="Gluten Free">Gluten Free</option>
                  <option value="Eggless">Eggless</option>
                </select>

                {/* Featured Status Filter */}
                <select
                  value={selectedFeaturedFilter}
                  onChange={(e) => setSelectedFeaturedFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="All">All Items</option>
                  <option value="featured">Featured Only ⭐</option>
                  <option value="standard">Standard Items</option>
                </select>

                {/* Sort By */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#A66D54]" />
                  <select
                    value={itemsSortBy}
                    onChange={(e) => setItemsSortBy(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  >
                    <option value="default">Featured First (Default)</option>
                    <option value="title_asc">Title: A to Z</option>
                    <option value="title_desc">Title: Z to A</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filter Pills & Results Count */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-[#7C3F27]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[#411C10]">
                    Showing {filteredItems.length} of {items.length} creations
                  </span>

                  {selectedCategoryFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40">
                      <span>Category: {selectedCategoryFilter}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryFilter('All')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedBadgeFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40">
                      <span>Badge: {selectedBadgeFilter}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBadgeFilter('All')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedFeaturedFilter !== 'All' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40">
                      <span>{selectedFeaturedFilter === 'featured' ? 'Featured Only' : 'Standard'}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFeaturedFilter('All')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {searchFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40">
                      <span>Search: "{searchFilter}"</span>
                      <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                {(selectedCategoryFilter !== 'All' ||
                  selectedBadgeFilter !== 'All' ||
                  selectedFeaturedFilter !== 'All' ||
                  searchFilter ||
                  itemsSortBy !== 'default') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFilter('');
                      setSelectedCategoryFilter('All');
                      setSelectedBadgeFilter('All');
                      setSelectedFeaturedFilter('All');
                      setItemsSortBy('default');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C3F27] hover:text-[#411C10] underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            </div>

            {/* Responsive Card Grid (Nothing goes off-screen) */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 px-4">
                <ShoppingBag className="w-8 h-8 text-[#D29C83] mx-auto mb-2" />
                <p className="font-serif text-base text-[#411C10]">No creations match your filter criteria.</p>
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setSelectedCategoryFilter('All');
                    setSelectedBadgeFilter('All');
                    setSelectedFeaturedFilter('All');
                    setItemsSortBy('default');
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#D29C83]/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All Filters</span>
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
                              addons: Array.isArray(item.addons) ? item.addons : [],
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
                          onClick={() => setDeletingItem(item)}
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

            {/* Category Search & Sort Bar */}
            <div className="bg-[#FFF9F3] p-3 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categoriesSearchQuery}
                  onChange={(e) => setCategoriesSearchQuery(e.target.value)}
                  placeholder="Search categories by name..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/30 text-[#411C10] placeholder:text-[#A66D54]/60 focus:outline-none focus:border-[#7C3F27]"
                />
                {categoriesSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategoriesSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A66D54]" />
                <select
                  value={categoriesSortBy}
                  onChange={(e) => setCategoriesSortBy(e.target.value)}
                  className="text-xs px-2.5 py-2 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="default">Default Order</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="items_high">Most Items First</option>
                </select>
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-10 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 px-4">
                <p className="font-serif text-base text-[#411C10]">No categories match your search.</p>
                <button
                  onClick={() => {
                    setCategoriesSearchQuery('');
                    setCategoriesSortBy('default');
                  }}
                  className="mt-2 text-xs text-[#7C3F27] underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {filteredCategories.map((cat, idx) => (
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
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
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
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {offerings.length >= 4 ? (
                  <div className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <span>Limit Reached (Max 4/4)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenOfferingModal()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2 px-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Offering ({offerings.length}/4)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Offerings Search & Sort Bar */}
            <div className="bg-[#FFF9F3] p-3 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={offeringsSearchQuery}
                  onChange={(e) => setOfferingsSearchQuery(e.target.value)}
                  placeholder="Search specialties by title, description, or accent..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/30 text-[#411C10] placeholder:text-[#A66D54]/60 focus:outline-none focus:border-[#7C3F27]"
                />
                {offeringsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOfferingsSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#A66D54]" />
                <select
                  value={offeringsSortBy}
                  onChange={(e) => setOfferingsSortBy(e.target.value)}
                  className="text-xs px-2.5 py-2 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="default">Sequence Order (01-04)</option>
                  <option value="title_asc">Title: A to Z</option>
                </select>
              </div>
            </div>

            {filteredOfferings.length === 0 ? (
              <div className="text-center py-10 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 px-4">
                <p className="font-serif text-base text-[#411C10]">No specialties match your search.</p>
                <button
                  onClick={() => {
                    setOfferingsSearchQuery('');
                    setOfferingsSortBy('default');
                  }}
                  className="mt-2 text-xs text-[#7C3F27] underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOfferings.map((off, idx) => (
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
                        onClick={() => setDeletingOffering(off)}
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
            )}
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-[#411C10]">Customer Orders</h3>
                <p className="text-xs text-[#7C3F27]">
                  Live orders submitted through the website, with UPI payment verification and status tracking.
                </p>
              </div>

              {/* Status Tabs Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setOrdersPaymentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    ordersPaymentFilter === 'all'
                      ? 'bg-[#7C3F27] text-white shadow-xs'
                      : 'bg-[#FFF9F3] text-[#7C3F27] border border-[#D29C83]/30 hover:bg-[#FEEDDD]'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersPaymentFilter('pending_verification')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    ordersPaymentFilter === 'pending_verification'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span>Verification Pending</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {orders.filter((o) => o.paymentStatus === 'pending_verification' || !o.paymentStatus).length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersPaymentFilter('verified')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    ordersPaymentFilter === 'verified'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                  }`}
                >
                  <span>Verified ({orders.filter((o) => o.paymentStatus === 'verified').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersPaymentFilter('cod')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    ordersPaymentFilter === 'cod'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  <span>💵 Cash on Delivery</span>
                  <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                    {orders.filter((o) => o.paymentMethod === 'Cash on Delivery' || o.paymentMethod === 'COD' || o.paymentStatus === 'cod_pending').length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrdersPaymentFilter('rejected')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    ordersPaymentFilter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  <span>Rejected ({orders.filter((o) => o.paymentStatus === 'rejected').length})</span>
                </button>
              </div>
            </div>

            {/* Comprehensive Orders Filter Toolbar */}
            <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs space-y-3">
              {/* Row 1: Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#A66D54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ordersSearchQuery}
                  onChange={(e) => setOrdersSearchQuery(e.target.value)}
                  placeholder="Search orders by Order ID (PP-...), Customer Name, Mobile Number, UTR / TxID, or Item..."
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/30 text-[#411C10] placeholder:text-[#A66D54]/60 focus:outline-none focus:border-[#7C3F27]"
                />
                {ordersSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setOrdersSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Row 2: Select Filters */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D29C83]/20">
                <div className="inline-flex items-center gap-1 text-xs text-[#7C3F27] font-semibold mr-1">
                  <Filter className="w-3.5 h-3.5 text-[#7C3F27]" />
                  <span>Filters:</span>
                </div>

                {/* Fulfillment Status */}
                <select
                  value={ordersStatusFilter}
                  onChange={(e) => setOrdersStatusFilter(e.target.value)}
                  className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                >
                  <option value="all">All Fulfillment Statuses</option>
                  <option value="pending">🕒 Order Received</option>
                  <option value="confirmed">📋 Confirmed</option>
                  <option value="baking">👨‍🍳 Baking in Oven</option>
                  <option value="out_for_delivery">🚚 Out for Delivery</option>
                  <option value="delivered">✅ Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
                  <option value="cancel_requested">⚠️ Cancellation Requested</option>
                </select>

                {/* Date Filter */}
                <div className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#A66D54]" />
                  <select
                    value={ordersDateFilter}
                    onChange={(e) => setOrdersDateFilter(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex items-center gap-1.5 ml-auto">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#A66D54]" />
                  <select
                    value={ordersSortBy}
                    onChange={(e) => setOrdersSortBy(e.target.value)}
                    className="text-xs px-2.5 py-1.5 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  >
                    <option value="newest">Newest Placed First</option>
                    <option value="oldest">Oldest Placed First</option>
                    <option value="price_high">Amount: High to Low</option>
                    <option value="price_low">Amount: Low to High</option>
                    <option value="customer">Customer Name: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Active Filters Summary & Reset */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-[#7C3F27]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-[#411C10]">
                    Showing {filteredOrders.length} of {orders.length} orders
                  </span>

                  {ordersPaymentFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                      <span>Payment: {ordersPaymentFilter.replace('_', ' ')}</span>
                      <button
                        type="button"
                        onClick={() => setOrdersPaymentFilter('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {ordersStatusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                      <span>Status: {ordersStatusFilter.replace('_', ' ')}</span>
                      <button
                        type="button"
                        onClick={() => setOrdersStatusFilter('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {ordersDateFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                      <span>Date: {ordersDateFilter}</span>
                      <button
                        type="button"
                        onClick={() => setOrdersDateFilter('all')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {ordersSearchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                      <span>Search: "{ordersSearchQuery}"</span>
                      <button
                        type="button"
                        onClick={() => setOrdersSearchQuery('')}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>

                {(ordersPaymentFilter !== 'all' ||
                  ordersStatusFilter !== 'all' ||
                  ordersDateFilter !== 'all' ||
                  ordersSearchQuery ||
                  ordersSortBy !== 'newest') && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrdersPaymentFilter('all');
                      setOrdersStatusFilter('all');
                      setOrdersDateFilter('all');
                      setOrdersSearchQuery('');
                      setOrdersSortBy('newest');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C3F27] hover:text-[#411C10] underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All Filters</span>
                  </button>
                )}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 max-w-md mx-auto px-4">
                <ShoppingBag className="w-10 h-10 text-[#D29C83] mx-auto mb-2" />
                <p className="font-serif text-lg text-[#411C10]">No orders match your filter criteria</p>
                <p className="text-xs text-[#7C3F27] mt-1">
                  Try adjusting your search query, status filters, or date range.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOrdersPaymentFilter('all');
                    setOrdersStatusFilter('all');
                    setOrdersDateFilter('all');
                    setOrdersSearchQuery('');
                    setOrdersSortBy('newest');
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#D29C83]/30 text-xs font-semibold cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((ord) => (
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

                      <h4 className="font-serif text-base text-[#411C10] leading-snug flex items-center flex-wrap gap-1.5">
                        <span>{ord.itemTitle} ({ord.selectedSize})</span>
                        {ord.quantity && ord.quantity > 1 && (
                          <span className="text-[11px] font-sans font-bold bg-[#7C3F27] text-[#FEEDDD] px-2 py-0.5 rounded-full">
                            ×{ord.quantity}
                          </span>
                        )}
                      </h4>
                      <div className="text-sm font-bold text-[#7C3F27] mt-0.5">
                        {ord.price}
                      </div>

                      {/* Selected Add-ons Display */}
                      {ord.selectedAddons && ord.selectedAddons.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {ord.selectedAddons.map((addon, aIdx) => (
                            <span
                              key={aIdx}
                              className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-[#FEEDDD] text-[#7C3F27] px-2 py-0.5 rounded-md border border-[#D29C83]/30"
                            >
                              <span>+ {addon.name}</span>
                              <span className="opacity-75 font-normal">(₹{addon.price}/-)</span>
                            </span>
                          ))}
                        </div>
                      )}

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

                      {/* PAYMENT PROOF & VERIFICATION CARD (UPI vs CASH ON DELIVERY) */}
                      {ord.paymentMethod === 'Cash on Delivery' ? (
                        <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[11px] border border-amber-300">
                                💵
                              </span>
                              <span className="text-xs font-bold text-[#411C10]">
                                Cash on Delivery (COD)
                              </span>
                            </div>

                            {/* Verification Badge */}
                            {ord.paymentStatus === 'verified' || ord.status === 'delivered' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Cash Collected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-200/80 text-amber-900 border border-amber-400">
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                <span>To Collect: {ord.price}</span>
                              </span>
                            )}
                          </div>

                          <div className="p-2.5 bg-[#FFFDF9] rounded-xl border border-amber-200/80 text-xs space-y-1">
                            <div className="flex justify-between items-center text-[#411C10]">
                              <span className="text-[#A66D54]">Amount to Collect:</span>
                              <span className="font-bold text-[#7C3F27] text-sm">{ord.price}</span>
                            </div>
                            <p className="text-[11px] text-[#7C3F27] leading-relaxed">
                              Customer selected <strong>Cash on Delivery</strong>. No advance payment screenshot or UTR needed. Collect cash upon studio pickup or courier handover.
                            </p>
                          </div>

                          {/* COD Collection Action Button */}
                          <div className="pt-1.5 border-t border-amber-200/70">
                            {ord.paymentStatus !== 'verified' && ord.status !== 'delivered' ? (
                              <button
                                type="button"
                                disabled={verifyingOrderId === (ord._id || ord.orderId)}
                                onClick={() => handleVerifyPayment(ord)}
                                className="w-full inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                              >
                                {verifyingOrderId === (ord._id || ord.orderId) ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                <span>Mark Cash as Collected & Confirm</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Cash Payment Collected & Confirmed</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3.5 p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#D29C83]/40 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-lg bg-[#FEEDDD] text-[#7C3F27] flex items-center justify-center font-bold text-[11px]">
                                ₹
                              </span>
                              <span className="text-xs font-bold text-[#411C10]">
                                UPI Payment Proof & Verification
                              </span>
                            </div>

                            {/* Verification Badge */}
                            {ord.paymentStatus === 'verified' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Verified</span>
                              </span>
                            ) : ord.paymentStatus === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Rejected</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Needs Review</span>
                              </span>
                            )}
                          </div>

                          {/* UTR & Copy Reference */}
                          <div className="p-2.5 bg-[#FEEDDD]/50 rounded-xl border border-[#D29C83]/30 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[10px] uppercase font-bold text-[#A66D54] tracking-wider block">
                                UPI Transaction ID / UTR
                              </span>
                              <span className="font-mono text-xs sm:text-sm font-bold text-[#411C10] break-all select-all">
                                {ord.transactionId || 'Not Provided'}
                              </span>
                            </div>
                            {ord.transactionId && (
                              <button
                                type="button"
                                onClick={() => handleCopyTxId(ord.transactionId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFF9F3] hover:bg-[#FEEDDD] border border-[#D29C83]/40 text-[11px] font-semibold text-[#7C3F27] transition-colors cursor-pointer shrink-0"
                                title="Copy UTR to verify against bank statement"
                              >
                                {copiedTxId === ord.transactionId ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy UTR</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {/* Screenshot Thumbnail Preview */}
                          {ord.paymentScreenshot ? (
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => {
                                  setPreviewReceiptImage(ord.paymentScreenshot);
                                  setPreviewReceiptOrder(ord);
                                }}
                                className="relative group w-20 h-20 rounded-xl overflow-hidden border border-[#D29C83]/40 bg-[#2C1810] cursor-pointer shrink-0 shadow-2xs"
                                title="Click to view full payment screenshot"
                              >
                                <img
                                  src={ord.paymentScreenshot}
                                  alt="Payment proof receipt"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Maximize2 className="w-5 h-5 drop-shadow" />
                                </div>
                              </div>

                              <div className="flex-1 text-xs space-y-1">
                                <p className="text-[#411C10] font-semibold flex items-center gap-1">
                                  <span>Receipt Screenshot</span>
                                </p>
                                <p className="text-[11px] text-[#7C3F27]">
                                  Order Total: <strong className="text-[#411C10]">{ord.price}</strong>
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewReceiptImage(ord.paymentScreenshot);
                                    setPreviewReceiptOrder(ord);
                                  }}
                                  className="text-[11px] text-[#7C3F27] hover:text-[#411C10] font-semibold underline cursor-pointer"
                                >
                                  View full receipt & inspect →
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                              ⚠️ No payment screenshot uploaded.
                            </div>
                          )}

                          {/* Rejection reason banner */}
                          {ord.paymentStatus === 'rejected' && ord.paymentRejectedReason && (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                              <span className="font-bold">Rejection Reason:</span> "{ord.paymentRejectedReason}"
                            </div>
                          )}

                          {/* Payment Verification Action Buttons */}
                          <div className="pt-2 border-t border-[#D29C83]/20 flex items-center gap-2">
                            {ord.paymentStatus !== 'verified' ? (
                              <>
                                <button
                                  type="button"
                                  disabled={verifyingOrderId === (ord._id || ord.orderId)}
                                  onClick={() => handleVerifyPayment(ord)}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                                >
                                  {verifyingOrderId === (ord._id || ord.orderId) ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Check className="w-3.5 h-3.5" />
                                  )}
                                  <span>Verify & Approve Payment</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingPaymentOrder(ord);
                                    setPaymentRejectReason('UTR / Transaction ID not found in bank statement');
                                    setPaymentRejectCustomReason('');
                                    setPaymentRejectError('');
                                  }}
                                  className="inline-flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              </>
                            ) : (
                              <div className="w-full flex items-center justify-between text-xs">
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  <span>Payment Confirmed & Verified</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRejectingPaymentOrder(ord);
                                    setPaymentRejectReason('Amount received does not match order total');
                                    setPaymentRejectCustomReason('');
                                    setPaymentRejectError('');
                                  }}
                                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                                >
                                  Revoke / Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Customer Cancellation Request Banner */}
                      {ord.cancellationStatus === 'pending' && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-2">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Cancellation Requested by Customer</span>
                          </div>
                          <div className="bg-white/90 p-2 rounded-lg border border-amber-200">
                            <span className="text-[10px] text-[#A66D54] uppercase tracking-wider block font-bold">
                              Customer Reason:
                            </span>
                            <p className="text-xs text-[#411C10] font-medium mt-0.5">
                              "{ord.cancellationReason || 'No reason provided'}"
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setApprovingOrder(ord)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Cancel</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDenyingOrder(ord);
                                setAdminDenialReason('');
                                setDenialError('');
                              }}
                              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Deny Cancel</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Denied Cancellation Notice */}
                      {ord.cancellationStatus === 'denied' && (
                        <div className="mt-2.5 p-2 rounded-lg bg-gray-50 border border-gray-200 text-[11px] text-[#7C3F27]">
                          <span className="font-semibold text-rose-700">Cancellation Declined by Studio:</span>{' '}
                          <span>"{ord.cancellationDeniedReason}"</span>
                        </div>
                      )}

                      {/* Cancelled Order Tag */}
                      {ord.status === 'cancelled' && (
                        <div className="mt-2.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800">
                          <span className="font-semibold">Order Cancelled</span>
                          {ord.cancellationReason && <span> • Reason: "{ord.cancellationReason}"</span>}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#D29C83]/20 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#A66D54] font-medium">Status:</span>
                        <select
                          value={ord.status || 'pending'}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : ord.status === 'baking'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : ord.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
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

                      <button
                        type="button"
                        onClick={() => printOrderInvoice(ord)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#D29C83]/30 text-xs font-medium text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                        title="Download or Print Invoice PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DATABASE & CLOUDINARY LIVE STATUS */}
        {activeTab === 'database' && (
          <div className="pt-5 space-y-5 max-w-4xl">
            {/* Header & Refresh */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-[#411C10]">System & Cloud Status</h3>
                <p className="text-xs text-[#7C3F27]">
                  Live connection health for MongoDB Atlas, Cloudinary CDN, and data collections.
                </p>
              </div>
              <button
                onClick={fetchSystemStatus}
                disabled={statusLoading}
                className="inline-flex items-center gap-1.5 bg-[#FFF9F3] hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${statusLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs text-center">
                <span className="text-xl sm:text-2xl font-bold text-[#7C3F27] font-serif block">
                  {systemStatus?.counts?.menuItems ?? items.length}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#A66D54] font-semibold">
                  Menu Items
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs text-center">
                <span className="text-xl sm:text-2xl font-bold text-[#7C3F27] font-serif block">
                  {systemStatus?.counts?.categories ?? categories.length}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#A66D54] font-semibold">
                  Categories
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs text-center">
                <span className="text-xl sm:text-2xl font-bold text-[#7C3F27] font-serif block">
                  {systemStatus?.counts?.offerings ?? offerings.length}/4
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#A66D54] font-semibold">
                  Offerings
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs text-center">
                <span className="text-xl sm:text-2xl font-bold text-[#7C3F27] font-serif block">
                  {systemStatus?.counts?.orders ?? orders.length}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#A66D54] font-semibold">
                  Live Orders
                </span>
              </div>
            </div>

            {/* MongoDB Atlas Card */}
            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-[#411C10]">MongoDB Atlas Database</h3>
                    <p className="text-xs text-[#7C3F27]">
                      Cloud database storing dynamic categories, products, offerings, and customer orders.
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${systemStatus?.database?.connected !== false
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${systemStatus?.database?.connected !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span>{systemStatus?.database?.status || 'Connected'}</span>
                </span>
              </div>

              <div className="p-3.5 bg-[#FEEDDD]/40 rounded-xl text-xs space-y-2 border border-[#D29C83]/25">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#A66D54] font-medium">Cluster Host:</span>
                  <span className="font-mono text-[#411C10] break-all">
                    {systemStatus?.database?.host || 'ac-cylwyxj-shard-00-00.60jtyl4.mongodb.net'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#A66D54] font-medium">Database Name:</span>
                  <span className="font-semibold text-[#7C3F27]">
                    {systemStatus?.database?.name || 'pastry_paws'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#A66D54] font-medium">Collections:</span>
                  <span className="text-[#411C10]">
                    categories, menuitems, orders, offerings
                  </span>
                </div>
              </div>
            </div>

            {/* Cloudinary CDN Card */}
            <div className="p-5 rounded-2xl bg-[#FFF9F3] border border-[#D29C83]/30 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-[#411C10]">Cloudinary Image CDN</h3>
                    <p className="text-xs text-[#7C3F27]">
                      High-speed media storage, WebP compression, and direct image upload pipeline.
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{systemStatus?.cloudinary?.configured ? 'Active' : 'Configured'}</span>
                </span>
              </div>

              <div className="p-3.5 bg-[#FEEDDD]/40 rounded-xl text-xs space-y-2 border border-[#D29C83]/25">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#A66D54] font-medium">Cloud Name:</span>
                  <span className="font-mono text-[#7C3F27] font-bold">
                    {systemStatus?.cloudinary?.cloudName || 'ku59ko3p'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#A66D54] font-medium">Default Folder:</span>
                  <span className="text-[#411C10]">
                    {systemStatus?.cloudinary?.folder || 'PastryPaws'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-[#A66D54] font-medium">Optimization:</span>
                  <span className="text-[#411C10]">
                    Auto-format (WebP / AVIF), dynamic thumbnail resizing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENT & UPI QR CONFIGURATION */}
        {activeTab === 'payment' && (
          <div className="pt-5 space-y-6 max-w-6xl">
            {/* Header with Title and Save Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FFF9F3] p-5 rounded-2xl border border-[#D29C83]/30 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#7C3F27] text-[#FEEDDD] flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-xl text-[#411C10]">Payment & UPI QR Settings</h3>
                </div>
                <p className="text-xs text-[#7C3F27] mt-1 max-w-2xl leading-relaxed">
                  Update your official bakery UPI ID, mobile phone number, and payment QR code. Changes sync instantly across the customer order checkout modal, order tracking, and customer PDF invoices.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={fetchData}
                  disabled={paymentLoading || savingPayment}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 bg-[#FEEDDD]/60 hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${paymentLoading ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </button>

                <button
                  type="button"
                  onClick={handleSavePaymentSettings}
                  disabled={savingPayment}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {savingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Payment Settings</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message if any */}
            {paymentFormError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{paymentFormError}</span>
              </div>
            )}

            {/* 2-Column Responsive Layout: Left Form, Right Live Customer Checkout Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: EDIT FORM (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* CARD 1: OFFICIAL UPI & CONTACT NUMBERS */}
                <div className="bg-[#FFF9F3] p-5 sm:p-6 rounded-2xl border border-[#D29C83]/30 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#D29C83]/20 pb-3">
                    <Smartphone className="w-4 h-4 text-[#7C3F27]" />
                    <h4 className="font-serif text-base text-[#411C10] font-medium">
                      Official UPI ID & Contact Details
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* UPI ID */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Bakery UPI ID <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={paymentSettings.upiId || ''}
                          onChange={(e) => {
                            setPaymentSettings({ ...paymentSettings, upiId: e.target.value });
                            if (paymentFormError) setPaymentFormError('');
                          }}
                          placeholder="e.g. 9790983844@okaxis or pastrypaws@oksbi"
                          className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-medium rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (paymentSettings.upiId) {
                              navigator.clipboard.writeText(paymentSettings.upiId);
                              setCopiedAdminUpi(true);
                              setTimeout(() => setCopiedAdminUpi(false), 2000);
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#7C3F27] hover:bg-[#FEEDDD] px-2 py-1 rounded-md transition-colors"
                        >
                          {copiedAdminUpi ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-[10px] text-[#A66D54] mt-1">
                        Payments from Google Pay, PhonePe, Paytm, and BHIM will be directed to this UPI handle.
                      </p>
                    </div>

                    {/* Payee / Merchant Name */}
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Payee / Business Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={paymentSettings.payeeName || ''}
                        onChange={(e) =>
                          setPaymentSettings({ ...paymentSettings, payeeName: e.target.value })
                        }
                        placeholder="e.g. Pastry Paws"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                      />
                      <p className="text-[10px] text-[#A66D54] mt-1">
                        The recipient name displayed in banking apps.
                      </p>
                    </div>

                    {/* Payment Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Payment Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={paymentSettings.phoneNumber || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPaymentSettings({ ...paymentSettings, phoneNumber: val });
                        }}
                        placeholder="e.g. 9790983844"
                        className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                      />
                      <p className="text-[10px] text-[#A66D54] mt-1">
                        Shown to customers if they need payment assistance.
                      </p>
                    </div>

                    {/* WhatsApp Business Number */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        WhatsApp Confirmation Number (with Country Code)
                      </label>
                      <input
                        type="tel"
                        value={paymentSettings.whatsappNumber || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPaymentSettings({ ...paymentSettings, whatsappNumber: val });
                        }}
                        placeholder="e.g. 919790983844"
                        className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                      />
                      <p className="text-[10px] text-[#A66D54] mt-1">
                        Customers receive pre-formatted order summary links targeting this WhatsApp chat.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CARD 2: QR CODE MODE & STANDEE IMAGE UPLOAD */}
                <div className="bg-[#FFF9F3] p-5 sm:p-6 rounded-2xl border border-[#D29C83]/30 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#D29C83]/20 pb-3">
                    <QrCode className="w-4 h-4 text-[#7C3F27]" />
                    <h4 className="font-serif text-base text-[#411C10] font-medium">
                      Payment QR Code Configuration
                    </h4>
                  </div>

                  {/* QR Mode Switcher */}
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-2">
                      Preferred QR Code Display Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentSettings({ ...paymentSettings, qrMode: 'custom' })}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentSettings.qrMode === 'custom'
                            ? 'bg-[#FEEDDD] border-[#7C3F27] shadow-xs'
                            : 'bg-[#FFFDF9] border-[#D29C83]/30 hover:bg-[#FEEDDD]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-[#411C10]">
                            Bakery Standee QR
                          </span>
                          <span
                            className={`w-3 h-3 rounded-full border ${
                              paymentSettings.qrMode === 'custom'
                                ? 'bg-[#7C3F27] border-[#7C3F27]'
                                : 'border-[#D29C83]'
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-[#7C3F27]/90 leading-tight">
                          Show the official physical GPay/PhonePe sticker image you upload below.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setPaymentSettings({ ...paymentSettings, qrMode: 'dynamic' })
                        }
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          paymentSettings.qrMode === 'dynamic'
                            ? 'bg-[#FEEDDD] border-[#7C3F27] shadow-xs'
                            : 'bg-[#FFFDF9] border-[#D29C83]/30 hover:bg-[#FEEDDD]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-[#411C10]">
                            Dynamic NPCI QR (Auto-Amount)
                          </span>
                          <span
                            className={`w-3 h-3 rounded-full border ${
                              paymentSettings.qrMode === 'dynamic'
                                ? 'bg-[#7C3F27] border-[#7C3F27]'
                                : 'border-[#D29C83]'
                            }`}
                          />
                        </div>
                        <p className="text-[11px] text-[#7C3F27]/90 leading-tight">
                          Automatically generates a QR code encoding the exact cake price per order.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Standee QR Image Upload & Preview Box */}
                  <div className="pt-2 border-t border-[#D29C83]/20 space-y-3">
                    <label className="block text-xs font-semibold text-[#411C10]">
                      Official Physical QR Standee Image
                    </label>

                    {paymentSettings.qrCodeImage ? (
                      <div className="p-4 rounded-2xl bg-[#FEEDDD]/40 border border-[#D29C83]/40 flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative group shrink-0">
                          <img
                            src={paymentSettings.qrCodeImage}
                            alt="Bakery Standee QR"
                            className="w-28 h-28 object-contain rounded-xl bg-white p-2 border border-[#D29C83]/40 shadow-xs"
                          />
                          <a
                            href={paymentSettings.qrCodeImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-[#2C1810]/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs gap-1"
                          >
                            <Maximize2 className="w-4 h-4" />
                            <span>View</span>
                          </a>
                        </div>

                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Official Standee QR Active</span>
                          </div>
                          <p className="text-[11px] text-[#7C3F27] leading-relaxed">
                            This QR sticker image is ready and will pop up for customers during checkout.
                          </p>

                          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                            <label className="inline-flex items-center gap-1.5 bg-[#FFF9F3] hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingQrImage ? 'Uploading...' : 'Replace Image'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadQrImage}
                                disabled={uploadingQrImage}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={handleRemoveQrImage}
                              className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#D29C83]/60 hover:border-[#7C3F27] bg-[#FFFDF9] hover:bg-[#FEEDDD]/40 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center">
                        {uploadingQrImage ? (
                          <div className="flex flex-col items-center gap-2 py-3">
                            <RefreshCw className="w-6 h-6 text-[#7C3F27] animate-spin" />
                            <span className="text-xs font-semibold text-[#7C3F27]">
                              Uploading and optimizing QR standee image...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-[#FEEDDD] text-[#7C3F27] flex items-center justify-center border border-[#D29C83]/30 shadow-2xs">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-[#411C10] block">
                                Click or tap to upload bakery QR code photo / standee
                              </span>
                              <span className="text-[10px] text-[#A66D54] block mt-0.5">
                                Google Pay, PhonePe, Paytm, BHIM, or bank QR sticker (PNG, JPG, WEBP)
                              </span>
                            </div>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadQrImage}
                          disabled={uploadingQrImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* CARD 3: CUSTOMER INSTRUCTIONS / NOTICE */}
                <div className="bg-[#FFF9F3] p-5 sm:p-6 rounded-2xl border border-[#D29C83]/30 shadow-2xs space-y-3">
                  <label className="block text-xs font-semibold text-[#411C10]">
                    Payment Instructions / Customer Guide
                  </label>
                  <textarea
                    rows={3}
                    value={paymentSettings.instructions || ''}
                    onChange={(e) =>
                      setPaymentSettings({ ...paymentSettings, instructions: e.target.value })
                    }
                    placeholder="e.g. Pay using Google Pay, PhonePe, Paytm, or BHIM. After paying, upload your payment receipt screenshot and enter your 12-digit UTR number."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                  <p className="text-[10px] text-[#A66D54]">
                    This note will be shown to customers right above the screenshot proof upload field.
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE REAL-TIME CHECKOUT MODAL PREVIEW (5 cols) */}
              <div className="lg:col-span-5 sticky top-24 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#7C3F27]" />
                    <span className="text-xs font-bold text-[#411C10] font-serif">
                      Live Customer Checkout Preview
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Real-time</span>
                  </span>
                </div>

                {/* Simulated Customer Checkout Popup Card */}
                <div className="bg-[#FFF9F3] rounded-3xl border-2 border-[#D29C83]/40 shadow-xl overflow-hidden text-center">
                  {/* Simulated Modal Header */}
                  <div className="bg-[#FEEDDD]/80 px-4 py-3 border-b border-[#D29C83]/20 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#7C3F27] text-[#FEEDDD] flex items-center justify-center text-xs">
                        <ShoppingBag className="w-3 h-3" />
                      </div>
                      <div>
                        <h5 className="font-serif text-xs font-semibold text-[#411C10]">
                          Step 2: Pay via Google Pay / UPI
                        </h5>
                        <p className="text-[9px] text-[#7C3F27]">
                          Scan QR or copy UPI ID, then upload your screenshot
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Payable Amount Bar */}
                  <div className="p-3.5 space-y-3">
                    <div className="bg-[#FEEDDD]/60 border border-[#D29C83]/40 rounded-xl p-2.5 flex items-center justify-between text-left">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-[#A66D54]">
                          Payable Amount
                        </span>
                        <div className="font-serif text-xs font-bold text-[#411C10]">
                          Sample Cake (500gm)
                        </div>
                      </div>
                      <span className="text-base font-serif font-bold text-[#7C3F27]">
                        ₹499/-
                      </span>
                    </div>

                    {/* QR Code Container in Preview */}
                    <div className="bg-white border border-[#D29C83]/30 rounded-2xl p-4 shadow-inner flex flex-col items-center justify-center gap-3 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 bg-[#FEEDDD] px-3 py-1 rounded-full text-[10px] font-semibold text-[#7C3F27] border border-[#D29C83]/30 mx-auto">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>
                          {paymentSettings.qrCodeImage && paymentSettings.qrMode === 'custom'
                            ? 'Bakery Standee QR'
                            : 'Scan & Pay ₹499'}
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-2xl border-2 border-[#D29C83]/40 shadow-sm flex items-center justify-center mx-auto max-w-[220px]">
                        <img
                          src={
                            paymentSettings.qrCodeImage && paymentSettings.qrMode === 'custom'
                              ? paymentSettings.qrCodeImage
                              : `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                                  `upi://pay?pa=${paymentSettings.upiId || '9790983844@okaxis'}&pn=${
                                    paymentSettings.payeeName || 'Pastry Paws'
                                  }&am=499&cu=INR`
                                )}`
                          }
                          alt="Live Preview QR"
                          className="w-36 h-36 object-contain rounded-lg mx-auto"
                        />
                      </div>

                      <div className="text-[11px] text-[#7C3F27] font-semibold text-center">
                        Payee: <strong>{paymentSettings.payeeName || 'Pastry Paws'}</strong>
                      </div>

                      {/* Supported Apps */}
                      <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#A66D54] flex-wrap">
                        <span className="bg-[#FEEDDD] px-2 py-0.5 rounded font-semibold text-[#411C10] border border-[#D29C83]/20">
                          GPay
                        </span>
                        <span>•</span>
                        <span className="bg-[#FEEDDD] px-2 py-0.5 rounded font-semibold text-[#411C10] border border-[#D29C83]/20">
                          PhonePe
                        </span>
                        <span>•</span>
                        <span className="bg-[#FEEDDD] px-2 py-0.5 rounded font-semibold text-[#411C10] border border-[#D29C83]/20">
                          Paytm
                        </span>
                        <span>•</span>
                        <span className="bg-[#FEEDDD] px-2 py-0.5 rounded font-semibold text-[#411C10] border border-[#D29C83]/20">
                          BHIM
                        </span>
                      </div>
                    </div>

                    {/* Live UPI Copy Bar */}
                    <div className="flex items-center justify-between gap-2 bg-[#FEEDDD]/70 border border-[#D29C83]/40 rounded-xl px-3.5 py-2 text-xs">
                      <div className="text-left min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-wider text-[#A66D54] block font-semibold">
                          UPI ID
                        </span>
                        <span
                          className="font-mono font-bold text-[#411C10] text-xs sm:text-sm block truncate"
                          title={paymentSettings.upiId || '9790983844@okaxis'}
                        >
                          {paymentSettings.upiId || '9790983844@okaxis'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (paymentSettings.upiId) {
                            navigator.clipboard.writeText(paymentSettings.upiId);
                            setCopiedAdminUpi(true);
                            setTimeout(() => setCopiedAdminUpi(false), 2000);
                          }
                        }}
                        className="inline-flex items-center gap-1 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedAdminUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Payment Phone row */}
                    <div className="flex items-center justify-between text-xs text-[#7C3F27] pt-2 px-1 border-t border-[#D29C83]/20">
                      <span className="text-[#A66D54]">Need Assistance:</span>
                      <a
                        href={`tel:${paymentSettings.phoneNumber || '9790983844'}`}
                        className="font-bold hover:text-[#411C10] flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>+91 {paymentSettings.phoneNumber || '9790983844'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GOOGLE REVIEWS MANAGEMENT */}
        {activeTab === 'reviews' && (
          <div className="pt-5 space-y-6 max-w-7xl">
            {/* Header with Title and Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-[#FFF9F3] p-5 sm:p-6 rounded-2xl border border-[#D29C83]/30 shadow-2xs">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center border border-amber-300">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-[#411C10] flex items-center gap-2">
                      <span>Google Reviews & Business Profile</span>
                      <span className="text-[11px] font-sans font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Verified Business Listing</span>
                      </span>
                    </h3>
                    <p className="text-xs text-[#7C3F27] mt-0.5">
                      Manage real customer testimonials linked to your verified Google Maps listing in Avadi.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <a
                  href={reviewsSummary.googleMapsUrl || 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#FFF9F3] hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                  <span>View Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-[#A66D54]" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setSummaryForm(reviewsSummary);
                    setIsEditSummaryModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#FEEDDD]/60 hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Place Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenReviewModal()}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Review</span>
                </button>
              </div>
            </div>

            {/* Important Rule Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
              <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-600 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-950">
                  Strict 4-Star & 5-Star Storefront Filter Active
                </p>
                <p className="mt-0.5 text-amber-800/90 leading-relaxed">
                  Only reviews with <strong className="text-amber-950">4 or 5 stars</strong> and enabled visibility are shown to customers on the website homepage. Any reviews below 4 stars or toggled off remain stored in your admin database and are automatically excluded from the public storefront.
                </p>
              </div>
            </div>

            {/* Key Metric Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg font-serif">
                  {reviewsSummary.rating || '5.0'}★
                </div>
                <div>
                  <span className="text-[11px] text-[#A66D54] uppercase tracking-wider block font-semibold">
                    Google Rating
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg">
                  {googleReviews.filter((r) => Number(r.rating) >= 4 && r.isDisplayed).length}
                </div>
                <div>
                  <span className="text-[11px] text-[#A66D54] uppercase tracking-wider block font-semibold">
                    Live on Website
                  </span>
                  <span className="text-xs font-semibold text-emerald-800">
                    4★ & 5★ Visible
                  </span>
                </div>
              </div>

              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FEEDDD] flex items-center justify-center text-[#7C3F27] font-bold text-lg">
                  {googleReviews.length}
                </div>
                <div>
                  <span className="text-[11px] text-[#A66D54] uppercase tracking-wider block font-semibold">
                    Total In Database
                  </span>
                  <span className="text-xs text-[#7C3F27] font-medium">
                    {googleReviews.filter((r) => !r.isDisplayed).length} Hidden
                  </span>
                </div>
              </div>

              <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] text-[#A66D54] uppercase tracking-wider block font-semibold">
                    Google Maps Business
                  </span>
                  <span className="text-xs font-bold text-[#411C10] truncate block">
                    {reviewsSummary.placeName || 'Pastry Paws'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-[#FFF9F3] p-4 rounded-2xl border border-[#D29C83]/30 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={reviewsSearchQuery}
                  onChange={(e) => setReviewsSearchQuery(e.target.value)}
                  placeholder="Search reviews by customer name, comments, or dessert highlight..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/30 text-[#411C10] placeholder:text-[#A66D54]/60 focus:outline-none focus:border-[#7C3F27]"
                />
                {reviewsSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setReviewsSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Rating Filter Pills */}
                <div className="flex items-center gap-1 bg-[#FEEDDD]/40 p-1 rounded-xl border border-[#D29C83]/30 text-xs">
                  <button
                    type="button"
                    onClick={() => setReviewsFilterRating('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      reviewsFilterRating === 'all'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    All Stars
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewsFilterRating('5')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      reviewsFilterRating === '5'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    <span>5★</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewsFilterRating('4')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                      reviewsFilterRating === '4'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    <span>4★</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewsFilterRating('below4')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      reviewsFilterRating === 'below4'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    &lt;4★
                  </button>
                </div>

                {/* Visibility Filter */}
                <div className="flex items-center gap-1 bg-[#FEEDDD]/40 p-1 rounded-xl border border-[#D29C83]/30 text-xs">
                  <button
                    type="button"
                    onClick={() => setReviewsFilterVisibility('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      reviewsFilterVisibility === 'all'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewsFilterVisibility('visible')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      reviewsFilterVisibility === 'visible'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    Visible
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewsFilterVisibility('hidden')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      reviewsFilterVisibility === 'hidden'
                        ? 'bg-[#7C3F27] text-white shadow-2xs'
                        : 'text-[#7C3F27] hover:bg-[#FEEDDD]'
                    }`}
                  >
                    Hidden
                  </button>
                </div>
              </div>
            </div>

            {/* Reviews Cards List */}
            {filteredGoogleReviews.length === 0 ? (
              <div className="bg-[#FFF9F3] p-12 text-center rounded-3xl border border-[#D29C83]/30 shadow-2xs space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-lg text-[#411C10]">No reviews found matching criteria</h4>
                <p className="text-xs text-[#7C3F27] max-w-md mx-auto">
                  Try adjusting your search query or rating filter, or click "Add Review" to record a new customer testimonial.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenReviewModal()}
                  className="inline-flex items-center gap-1.5 bg-[#7C3F27] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#5E2B19] transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Review</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGoogleReviews.map((rev) => {
                  const isStorefrontVisible = Number(rev.rating) >= 4 && rev.isDisplayed;

                  return (
                    <div
                      key={rev._id}
                      className="bg-[#FFF9F3] rounded-2xl border border-[#D29C83]/30 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-all relative overflow-hidden"
                    >
                      {/* Top Ribbon / Status */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#FEEDDD] text-[#7C3F27] font-bold text-xs flex items-center justify-center border border-[#D29C83]/40 shrink-0">
                              {(rev.author_name || 'G')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-semibold text-xs sm:text-sm text-[#411C10] truncate">
                                {rev.author_name}
                              </h5>
                              <span className="text-[10px] text-[#A66D54]">
                                {rev.relative_time_description || 'Recently'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={rev.author_url || reviewsSummary.googleMapsUrl || 'https://maps.app.goo.gl/NrA698fpTvKPwvKx6'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg hover:bg-[#FEEDDD] text-[#7C3F27] transition-colors"
                              title="Open in Google Maps"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-[#A66D54]" />
                            </a>
                          </div>
                        </div>

                        {/* Star Rating Display */}
                        <div className="flex items-center gap-1 mb-2.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Number(rev.rating)
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-zinc-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-[#411C10] ml-1.5">
                            {rev.rating}.0
                          </span>
                        </div>

                        {/* Occasion / Highlight Tags */}
                        {(rev.highlight || rev.occasion) && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {rev.highlight && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-[#FEEDDD] text-[#7C3F27] px-2 py-0.5 rounded-md border border-[#D29C83]/30">
                                <Sparkles className="w-3 h-3 text-[#C85A32]" />
                                <span>{rev.highlight}</span>
                              </span>
                            )}
                            {rev.occasion && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-rose-50 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200">
                                <Tag className="w-3 h-3 text-rose-600" />
                                <span>{rev.occasion}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Review Content */}
                        <p className="text-xs text-[#7C3F27] leading-relaxed italic line-clamp-4 mb-4">
                          "{rev.text}"
                        </p>
                      </div>

                      {/* Card Footer: Status and Actions */}
                      <div className="pt-3 border-t border-[#D29C83]/20 flex items-center justify-between gap-2">
                        <div>
                          {isStorefrontVisible ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Visible on Website</span>
                            </span>
                          ) : Number(rev.rating) < 4 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200" title="Only 4-5 stars are displayed publicly">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Filtered Out (&lt; 4★)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden by Admin</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleReviewVisibility(rev)}
                            className="p-1.5 rounded-lg text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                            title={rev.isDisplayed ? 'Hide from website' : 'Show on website'}
                          >
                            {rev.isDisplayed ? (
                              <Eye className="w-4 h-4 text-emerald-700" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(rev)}
                            className="p-1.5 rounded-lg text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit2 className="w-4 h-4 text-[#7C3F27]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingReview(rev)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                    Photo (Image / Upload / URL) <span className="text-rose-500">*</span>
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
                        required
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

                {/* Optional Add-ons Section for Item Customization */}
                <div className="space-y-2 pt-2 border-t border-[#D29C83]/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-[#411C10] block">
                        Product Add-ons &amp; Extras (Optional)
                      </label>
                      <span className="text-[10px] text-[#A66D54]">
                        Extras customers can select when ordering this creation
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAddon}
                      className="text-xs text-[#7C3F27] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Add-on</span>
                    </button>
                  </div>

                  {itemForm.addons && itemForm.addons.length > 0 ? (
                    <div className="space-y-2">
                      {itemForm.addons.map((addon, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={addon.name}
                            onChange={(e) => handleAddonChange(idx, 'name', e.target.value)}
                            placeholder="Add-on Name (e.g. Extra Ganache, Birthday Candle, Gift Box)"
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                          />
                          <div className="relative w-28 shrink-0">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#A66D54]">₹</span>
                            <input
                              type="number"
                              required
                              min="0"
                              value={addon.price}
                              onChange={(e) => handleAddonChange(idx, 'price', e.target.value)}
                              placeholder="Price"
                              className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAddon(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Remove Add-on"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#7C3F27]/70 italic bg-[#FEEDDD]/30 p-2.5 rounded-xl border border-dashed border-[#D29C83]/30">
                      No add-ons configured yet. Click "+ Add Add-on" above to offer extras like candles, greeting tags, or extra sauces!
                    </p>
                  )}
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
                    Category Name <span className="text-rose-500">*</span>
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
                      Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={offeringForm.number}
                      onChange={(e) => setOfferingForm({ ...offeringForm, number: e.target.value })}
                      placeholder="01"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Title <span className="text-rose-500">*</span>
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
                    Subtitle / Flavors <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={offeringForm.subtitle}
                    onChange={(e) => setOfferingForm({ ...offeringForm, subtitle: e.target.value })}
                    placeholder="e.g. Chocolate • Biscoff • Red Velvet"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={offeringForm.description}
                    onChange={(e) => setOfferingForm({ ...offeringForm, description: e.target.value })}
                    placeholder="Short description of this offering..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Starting Price <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={offeringForm.price}
                      onChange={(e) => setOfferingForm({ ...offeringForm, price: e.target.value })}
                      placeholder="From ₹399/-"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Accent Pill Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={offeringForm.accent}
                      onChange={(e) => setOfferingForm({ ...offeringForm, accent: e.target.value })}
                      placeholder="e.g. Freshly Baked to Order"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Offering Image */}
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Offering Image (Cloudinary) <span className="text-rose-500">*</span>
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
                        required
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

      {/* Admin Approve Cancellation Modal */}
      <AnimatePresence>
        {approvingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#411C10]">
                  Approve Cancellation #{approvingOrder.orderId}?
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  Customer <strong className="text-[#411C10]">{approvingOrder.customerName}</strong> has requested to cancel their order for{' '}
                  <strong className="text-[#411C10]">{approvingOrder.itemTitle}</strong> ({approvingOrder.selectedSize}).
                </p>
                {approvingOrder.cancellationReason && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#FEEDDD]/60 border border-[#D29C83]/30 text-xs">
                    <span className="text-[10px] uppercase font-bold text-[#A66D54] block">Reason Given:</span>
                    <p className="text-[#411C10] italic mt-0.5">"{approvingOrder.cancellationReason}"</p>
                  </div>
                )}
                <p className="text-[11px] text-[#A66D54] mt-2">
                  Once approved, this order will be permanently set to <strong className="text-rose-700">Cancelled</strong> and the customer's tracker will show the approved cancellation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setApprovingOrder(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  Keep Order Active
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleConfirmApproveCancellation(approvingOrder)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm & Approve Cancellation</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Deny Cancellation Modal */}
      <AnimatePresence>
        {denyingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#411C10]">
                  Decline Cancellation #{denyingOrder.orderId}
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  Customer requested cancellation stating: <strong className="text-[#411C10]">"{denyingOrder.cancellationReason || 'No reason provided'}"</strong>.
                </p>
                <p className="text-[11px] text-[#A66D54] mt-1">
                  Please provide the official reason for declining. This reason will be displayed directly to the customer on their order tracker page.
                </p>
              </div>

              <form onSubmit={handleConfirmDenyCancellation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Reason for Declining Cancellation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={adminDenialReason}
                    onChange={(e) => {
                      setAdminDenialReason(e.target.value);
                      if (denialError) setDenialError('');
                    }}
                    placeholder="e.g. Fresh ingredients have already been prepped and baking has commenced in the oven."
                    className="w-full p-3 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                  />
                  {denialError && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{denialError}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      setDenyingOrder(null);
                      setAdminDenialReason('');
                      setDenialError('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? 'Submitting...' : 'Confirm & Decline Cancellation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Offering Confirmation Modal */}
      <AnimatePresence>
        {deletingOffering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#411C10]">
                  Delete Offering "{deletingOffering.title}"?
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  Are you sure you want to remove this featured specialty card from the homepage "OUR OFFERINGS" section?
                </p>
                <div className="mt-3 p-3 rounded-xl bg-[#FEEDDD]/60 border border-[#D29C83]/30 flex items-center gap-3">
                  <img
                    src={deletingOffering.image}
                    alt={deletingOffering.title}
                    className="w-12 h-12 rounded-lg object-cover border border-[#D29C83]/30 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#411C10] truncate">{deletingOffering.title}</div>
                    <div className="text-[11px] text-[#A66D54] truncate">{deletingOffering.subtitle || deletingOffering.accent || 'Specialty Offering'}</div>
                    {deletingOffering.price && (
                      <div className="text-[11px] font-semibold text-[#7C3F27]">{deletingOffering.price}</div>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-[#A66D54] mt-2">
                  This action will permanently remove this offering from MongoDB Atlas.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeletingOffering(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDeleteOffering}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Offering</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Item Confirmation Modal */}
      <AnimatePresence>
        {deletingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#411C10]">
                  Delete "{deletingItem.title}"?
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  Are you sure you want to delete this menu creation? Customers will no longer be able to browse or order it.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-[#FEEDDD]/60 border border-[#D29C83]/30 flex items-center gap-3">
                  <img
                    src={deletingItem.image}
                    alt={deletingItem.title}
                    className="w-12 h-12 rounded-lg object-cover border border-[#D29C83]/30 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#411C10] truncate">{deletingItem.title}</div>
                    <div className="text-[11px] text-[#A66D54] truncate">{deletingItem.category}</div>
                    <div className="text-[11px] font-semibold text-[#7C3F27]">{deletingItem.priceDisplay || `₹${deletingItem.startingPrice || 0}`}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeletingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDeleteItem}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Item</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Category Confirmation Modal */}
      <AnimatePresence>
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#411C10]">
                  Delete Category "{deletingCategory.name}"?
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  Are you sure you want to delete this category? Items under this category may become uncategorized.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setDeletingCategory(null)}
                  className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmDeleteCategory}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Category</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: UPI PAYMENT RECEIPT LIGHTBOX */}
      <AnimatePresence>
        {previewReceiptImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/50 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 bg-[#FEEDDD] border-b border-[#D29C83]/30 flex items-center justify-between gap-3 shrink-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#7C3F27] bg-[#FFF9F3] px-2.5 py-0.5 rounded-md border border-[#D29C83]/30">
                      Order #{previewReceiptOrder?.orderId}
                    </span>
                    <span className="text-xs font-bold text-[#411C10]">
                      {previewReceiptOrder?.customerName}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      ({previewReceiptOrder?.price})
                    </span>
                  </div>
                  {previewReceiptOrder?.transactionId && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-[#A66D54]">UTR:</span>
                      <span className="font-mono text-xs font-bold text-[#411C10] select-all">
                        {previewReceiptOrder.transactionId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTxId(previewReceiptOrder.transactionId)}
                        className="text-[10px] text-[#7C3F27] hover:underline font-semibold cursor-pointer"
                      >
                        {copiedTxId === previewReceiptOrder.transactionId ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewReceiptImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-[#7C3F27] hover:bg-[#FFF9F3] transition-colors"
                    title="Open original image in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewReceiptImage(null);
                      setPreviewReceiptOrder(null);
                    }}
                    className="p-2 rounded-xl text-[#7C3F27] hover:bg-[#FFF9F3] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body - Scrollable Image View */}
              <div className="p-4 overflow-y-auto flex items-center justify-center bg-[#2C1810]/5 flex-1 min-h-[300px]">
                <img
                  src={previewReceiptImage}
                  alt="Full payment screenshot"
                  className="max-h-[60vh] max-w-full rounded-2xl shadow-md border border-[#D29C83]/40 object-contain mx-auto"
                />
              </div>

              {/* Modal Footer with quick approve/reject */}
              <div className="px-5 py-3.5 bg-[#FEEDDD]/70 border-t border-[#D29C83]/30 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <span className="text-xs text-[#7C3F27]">
                  Cross-check with your Google Pay or Bank account balance.
                </span>

                <div className="flex items-center gap-2">
                  {previewReceiptOrder && previewReceiptOrder.paymentStatus !== 'verified' && (
                    <button
                      type="button"
                      disabled={verifyingOrderId === (previewReceiptOrder._id || previewReceiptOrder.orderId)}
                      onClick={async () => {
                        await handleVerifyPayment(previewReceiptOrder);
                        setPreviewReceiptImage(null);
                        setPreviewReceiptOrder(null);
                      }}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Payment</span>
                    </button>
                  )}

                  {previewReceiptOrder && (
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingPaymentOrder(previewReceiptOrder);
                        setPaymentRejectReason('UTR / Transaction ID not found in bank statement');
                        setPaymentRejectCustomReason('');
                        setPaymentRejectError('');
                        setPreviewReceiptImage(null);
                        setPreviewReceiptOrder(null);
                      }}
                      className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject Payment</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewReceiptImage(null);
                      setPreviewReceiptOrder(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REJECT PAYMENT PROOF WITH REASON */}
      <AnimatePresence>
        {rejectingPaymentOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-rose-300 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#411C10]">
                    Reject Payment Proof for #{rejectingPaymentOrder.orderId}
                  </h3>
                  <p className="text-xs text-[#7C3F27]">
                    The customer will see this rejection reason in their Order Tracker so they can submit genuine proof.
                  </p>
                </div>
              </div>

              {/* Order Info Summary */}
              <div className="p-3 bg-[#FEEDDD]/60 rounded-xl border border-[#D29C83]/30 text-xs text-[#411C10] space-y-1">
                <p>
                  Customer: <strong>{rejectingPaymentOrder.customerName}</strong> ({rejectingPaymentOrder.customerPhone})
                </p>
                <p>
                  Item: <strong>{rejectingPaymentOrder.itemTitle}</strong> • Total: <strong className="text-[#7C3F27]">{rejectingPaymentOrder.price}</strong>
                </p>
                <p>
                  Submitted UTR: <strong className="font-mono">{rejectingPaymentOrder.transactionId || 'None'}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirmRejectPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#411C10] mb-2">
                    Select Reason for Rejection <span className="text-rose-600">*</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      'UTR / Transaction ID not found in bank statement',
                      'Payment amount received does not match order total',
                      'Payment screenshot is blurry, incomplete, or illegible',
                      'Duplicate or reused transaction reference detected',
                      'custom',
                    ].map((reasonKey) => {
                      const isCustom = reasonKey === 'custom';
                      const labelText = isCustom
                        ? 'Other custom reason (enter below)'
                        : reasonKey;

                      return (
                        <label
                          key={reasonKey}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            paymentRejectReason === reasonKey
                              ? 'bg-rose-50 border-rose-400 text-rose-950 font-medium'
                              : 'bg-white border-[#D29C83]/30 text-[#411C10] hover:bg-[#FEEDDD]/40'
                          }`}
                        >
                          <input
                            type="radio"
                            name="reject_reason"
                            value={reasonKey}
                            checked={paymentRejectReason === reasonKey}
                            onChange={(e) => setPaymentRejectReason(e.target.value)}
                            className="mt-0.5 text-rose-600 focus:ring-rose-500"
                          />
                          <span>{labelText}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {paymentRejectReason === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Specify Custom Reason <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={paymentRejectCustomReason}
                      onChange={(e) => setPaymentRejectCustomReason(e.target.value)}
                      placeholder="e.g. Received partial payment of ₹200 instead of ₹399..."
                      className="w-full p-3 rounded-xl border border-[#D29C83]/40 bg-white text-xs focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
                    />
                  </div>
                )}

                {paymentRejectError && (
                  <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    ⚠️ {paymentRejectError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      setRejectingPaymentOrder(null);
                      setPaymentRejectError('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Confirm Payment Rejection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: ADD / EDIT GOOGLE REVIEW */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col z-10"
            >
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D29C83]/20 bg-[#FEEDDD]/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-lg text-[#411C10]">
                    {editingReview ? 'Edit Google Review' : 'Add Google Review'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-1 rounded-xl text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReview} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Author Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Customer / Reviewer Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewForm.author_name}
                    onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                    placeholder="e.g. Anjali R. or Priya & Vikram"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>

                {/* Rating Selection (1-5 Stars) */}
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Rating ({reviewForm.rating} Star{reviewForm.rating > 1 ? 's' : ''}) <span className="text-rose-600">*</span>
                  </label>
                  <div className="flex items-center gap-2 bg-[#FEEDDD]/40 p-2.5 rounded-xl border border-[#D29C83]/30">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: starVal })}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= reviewForm.rating
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-zinc-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-[#7C3F27] ml-2">
                      {reviewForm.rating === 5 && '★★★★★ Excellent'}
                      {reviewForm.rating === 4 && '★★★★☆ Very Good'}
                      {reviewForm.rating === 3 && '★★★☆☆ Average'}
                      {reviewForm.rating === 2 && '★★☆☆☆ Fair'}
                      {reviewForm.rating === 1 && '★☆☆☆☆ Poor'}
                    </span>
                  </div>

                  {reviewForm.rating < 4 && (
                    <p className="mt-1.5 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-lg flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                      <span>Notice: Storefront only displays 4-star and 5-star reviews. This review will be saved in admin but won't be visible to customers.</span>
                    </p>
                  )}
                </div>

                {/* Highlight / Occasion in 2 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Cake / Dish Highlight
                    </label>
                    <input
                      type="text"
                      value={reviewForm.highlight}
                      onChange={(e) => setReviewForm({ ...reviewForm, highlight: e.target.value })}
                      placeholder="e.g. Lotus Biscoff Cake"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Occasion / Event
                    </label>
                    <input
                      type="text"
                      value={reviewForm.occasion}
                      onChange={(e) => setReviewForm({ ...reviewForm, occasion: e.target.value })}
                      placeholder="e.g. Birthday Celebration"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Customer Review Feedback <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                    placeholder="Write the full customer review from Google Maps..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>

                {/* Relative Time and Google Maps URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Date / Relative Time
                    </label>
                    <input
                      type="text"
                      value={reviewForm.relative_time_description}
                      onChange={(e) => setReviewForm({ ...reviewForm, relative_time_description: e.target.value })}
                      placeholder="e.g. 1 week ago, Recently"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Google Maps Link URL
                    </label>
                    <input
                      type="url"
                      value={reviewForm.author_url}
                      onChange={(e) => setReviewForm({ ...reviewForm, author_url: e.target.value })}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>
                </div>

                {/* Display Toggle */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FEEDDD]/40 border border-[#D29C83]/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewForm.isDisplayed}
                    onChange={(e) => setReviewForm({ ...reviewForm, isDisplayed: e.target.checked })}
                    className="w-4 h-4 text-[#7C3F27] rounded-sm focus:ring-[#7C3F27]"
                  />
                  <span className="text-xs font-semibold text-[#411C10]">
                    Enable visibility on public storefront (active if rating is 4 or 5 stars)
                  </span>
                </label>

                {/* Submit / Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D29C83]/20">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingReview}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {savingReview ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{editingReview ? 'Update Review' : 'Add Review'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: EDIT GOOGLE PLACE SUMMARY CONFIG */}
        {isEditSummaryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditSummaryModalOpen(false)}
              className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col z-10"
            >
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D29C83]/20 bg-[#FEEDDD]/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-lg text-[#411C10]">
                    Google Business Place Settings
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditSummaryModalOpen(false)}
                  className="p-1 rounded-xl text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveReviewsSummary} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Google Business Listing Name
                  </label>
                  <input
                    type="text"
                    required
                    value={summaryForm.placeName}
                    onChange={(e) => setSummaryForm({ ...summaryForm, placeName: e.target.value })}
                    placeholder="Pastry Paws"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Google Maps Short Link URL
                  </label>
                  <input
                    type="url"
                    required
                    value={summaryForm.googleMapsUrl}
                    onChange={(e) => setSummaryForm({ ...summaryForm, googleMapsUrl: e.target.value })}
                    placeholder="https://maps.app.goo.gl/NrA698fpTvKPwvKx6"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                  />
                  <p className="text-[10px] text-[#A66D54] mt-1">
                    Customers clicking "View on Google Maps" or "Review Pastry Paws" will be routed directly to this link.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Display Rating
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={summaryForm.rating}
                      onChange={(e) => setSummaryForm({ ...summaryForm, rating: parseFloat(e.target.value) || 5.0 })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Review Count Badge Text
                    </label>
                    <input
                      type="text"
                      value={summaryForm.reviewsCount}
                      onChange={(e) => setSummaryForm({ ...summaryForm, reviewsCount: e.target.value })}
                      placeholder="5.0 ★★★★★ on Google"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#411C10] mb-1">
                    Google Place ID
                  </label>
                  <input
                    type="text"
                    value={summaryForm.placeId}
                    onChange={(e) => setSummaryForm({ ...summaryForm, placeId: e.target.value })}
                    placeholder="ChIJ9a1uLoipUjoR-t29x-KVXvc"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFFDF9] text-[#411C10] font-mono focus:outline-none focus:border-[#7C3F27]"
                  />
                  <p className="text-[10px] text-[#A66D54] mt-1">
                    Resolved Place ID for Pastry Paws Avadi: <span className="font-mono text-[#7C3F27]">ChIJ9a1uLoipUjoR-t29x-KVXvc</span>
                  </p>
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D29C83]/20">
                  <button
                    type="button"
                    onClick={() => setIsEditSummaryModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingReviewsSummary}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    {savingReviewsSummary ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Place Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: DELETE REVIEW CONFIRMATION */}
        {deletingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingReview(null)}
              className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 p-6 shadow-2xl space-y-4 text-center z-10"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="font-serif text-lg text-[#411C10]">Delete Customer Review?</h4>
                <p className="text-xs text-[#7C3F27] mt-1.5 leading-relaxed">
                  Are you sure you want to remove the review by <strong className="text-[#411C10]">{deletingReview.author_name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingReview(null)}
                  className="px-4 py-2 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteReview}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Delete Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
