import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Phone,
  Package,
  Clock,
  CheckCircle2,
  Flame,
  Truck,
  XCircle,
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Download,
  AlertTriangle,
  Upload,
  Eye,
  QrCode,
  Maximize2,
  Filter,
  ArrowUpDown,
  RotateCcw,
  X,
} from 'lucide-react';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';
import { printOrderInvoice } from '../utils/invoiceGenerator';
import { getCachedPaymentConfig, fetchPaymentConfig } from '../utils/paymentConfig';

const STATUS_CONFIG = {
  pending: {
    label: 'Order Received',
    sublabel: 'Pending bakery confirmation',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    stepIndex: 0,
    icon: Clock,
  },
  confirmed: {
    label: 'Order Confirmed',
    sublabel: 'Scheduled for preparation',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    stepIndex: 1,
    icon: CheckCircle2,
  },
  baking: {
    label: 'Baking in Oven',
    sublabel: 'Freshly prepared from scratch',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    stepIndex: 2,
    icon: Flame,
  },
  out_for_delivery: {
    label: 'Out for Delivery / Ready',
    sublabel: 'Ready for studio pickup or courier handover',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    stepIndex: 3,
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    sublabel: 'Enjoy your sweet treats!',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stepIndex: 3,
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    sublabel: 'This order was cancelled',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    stepIndex: -1,
    icon: XCircle,
  },
};

const PROGRESS_STEPS = [
  { id: 'placed', label: 'Order Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'baking', label: 'Baking' },
  { id: 'delivered', label: 'Delivered' },
];

export function TrackOrderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPhone = searchParams.get('phone') || '';

  const [phone, setPhone] = useState(
    urlPhone || localStorage.getItem('pastry_paws_saved_phone') || ''
  );
  const [searchedPhone, setSearchedPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Customer cancellation state
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancellationReasonInput, setCancellationReasonInput] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalError, setCancelModalError] = useState('');
  const [cancelToast, setCancelToast] = useState('');

  // Payment Proof Re-upload & Receipt Inspection state
  const [reuploadingOrder, setReuploadingOrder] = useState(null);
  const [newScreenshot, setNewScreenshot] = useState('');
  const [newScreenshotPublicId, setNewScreenshotPublicId] = useState('');
  const [newTransactionId, setNewTransactionId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [reuploadError, setReuploadError] = useState('');
  const [reuploadLoading, setReuploadLoading] = useState(false);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState(null);
  const [copiedUpiInTracker, setCopiedUpiInTracker] = useState(false);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(getCachedPaymentConfig);

  useEffect(() => {
    fetchPaymentConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    });
  }, []);

  // Tracked Orders Filter & Sort States
  const [trackerStatusFilter, setTrackerStatusFilter] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled' | 'action_needed'
  const [trackerPaymentFilter, setTrackerPaymentFilter] = useState('all'); // 'all' | 'verified' | 'pending_verification' | 'rejected'
  const [trackerSearchQuery, setTrackerSearchQuery] = useState('');
  const [trackerSortBy, setTrackerSortBy] = useState('newest'); // 'newest' | 'oldest' | 'amount_high' | 'amount_low'

  // Counts for quick filter pills
  const filterCounts = useMemo(() => {
    const total = orders.length;
    let active = 0;
    let delivered = 0;
    let cancelled = 0;
    let actionNeeded = 0;

    orders.forEach((o) => {
      const statusKey = o.status || 'pending';
      if (statusKey === 'delivered') delivered++;
      else if (statusKey === 'cancelled') cancelled++;
      else active++;

      if (o.paymentStatus === 'rejected') actionNeeded++;
    });

    return { total, active, delivered, cancelled, actionNeeded };
  }, [orders]);

  // Filtered and Sorted tracked orders
  const filteredTrackedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const statusKey = order.status || 'pending';
        const isCancelled = statusKey === 'cancelled';
        const isDelivered = statusKey === 'delivered';
        const isActive = !isCancelled && !isDelivered;
        const needsAction = order.paymentStatus === 'rejected';

        // Status Filter
        if (trackerStatusFilter === 'active' && !isActive) return false;
        if (trackerStatusFilter === 'delivered' && !isDelivered) return false;
        if (trackerStatusFilter === 'cancelled' && !isCancelled) return false;
        if (trackerStatusFilter === 'action_needed' && !needsAction) return false;

        // Payment Filter
        if (trackerPaymentFilter !== 'all') {
          if (trackerPaymentFilter === 'cod') {
            if (order.paymentMethod !== 'Cash on Delivery' && order.paymentMethod !== 'COD' && order.paymentStatus !== 'cod_pending') return false;
          } else if (trackerPaymentFilter === 'pending_verification') {
            if ((order.paymentStatus !== 'pending_verification' && order.paymentStatus) || order.paymentMethod === 'Cash on Delivery') return false;
          } else if (order.paymentStatus !== trackerPaymentFilter) {
            return false;
          }
        }

        // Search Query (Order ID, Item Title, Size, Transaction ID / UTR, Address, Payment Method)
        if (trackerSearchQuery.trim()) {
          const q = trackerSearchQuery.toLowerCase().trim();
          const matchId = (order.orderId || '').toLowerCase().includes(q) || (order._id || '').toLowerCase().includes(q);
          const matchTitle = (order.itemTitle || '').toLowerCase().includes(q);
          const matchSize = (order.selectedSize || '').toLowerCase().includes(q);
          const matchUtr = (order.transactionId || '').toLowerCase().includes(q);
          const matchAddr = (order.deliveryAddress || '').toLowerCase().includes(q);
          const matchMethod = (order.paymentMethod || '').toLowerCase().includes(q);
          if (!matchId && !matchTitle && !matchSize && !matchUtr && !matchAddr && !matchMethod) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        if (trackerSortBy === 'newest') return dateB - dateA;
        if (trackerSortBy === 'oldest') return dateA - dateB;

        const parsePrice = (priceStr) => {
          if (!priceStr) return 0;
          const num = String(priceStr).replace(/[^0-9.]/g, '');
          return parseFloat(num) || 0;
        };

        if (trackerSortBy === 'amount_high') return parsePrice(b.price) - parsePrice(a.price);
        if (trackerSortBy === 'amount_low') return parsePrice(a.price) - parsePrice(b.price);
        return dateB - dateA;
      });
  }, [orders, trackerStatusFilter, trackerPaymentFilter, trackerSearchQuery, trackerSortBy]);

  const handleDownloadInvoice = async (order) => {
    const targetId = order.orderId || order._id;
    setGeneratingInvoiceId(targetId);
    try {
      await printOrderInvoice(order);
    } catch (err) {
      console.error('Invoice generation error:', err);
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  // Handle Customer Cancellation Request (Pending only, requires reason)
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    if (!cancellationReasonInput.trim()) {
      setCancelModalError('Please enter a reason for your cancellation request.');
      return;
    }
    setCancelling(true);
    setCancelModalError('');

    try {
      const targetId = orderToCancel._id || orderToCancel.orderId;
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/request-cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: cancellationReasonInput.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        // Update local orders list to reflect pending review state
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderToCancel.orderId || o._id === orderToCancel._id
              ? {
                  ...o,
                  cancellationRequested: true,
                  cancellationStatus: 'pending',
                  cancellationReason: cancellationReasonInput.trim(),
                }
              : o
          )
        );
        setCancelToast(`Cancellation request for #${orderToCancel.orderId} submitted for bakery review.`);
        setTimeout(() => setCancelToast(''), 5000);
        setOrderToCancel(null);
        setCancellationReasonInput('');
      } else {
        setCancelModalError(data.message || 'Unable to submit cancellation request.');
      }
    } catch {
      setCancelModalError('Failed to connect to the server. Please check your network and try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyUpiInTracker = () => {
    const upiId = paymentConfig.upiId || brandConfig.payment?.upiId || '9790983844@okaxis';
    navigator.clipboard.writeText(upiId);
    setCopiedUpiInTracker(true);
    setTimeout(() => setCopiedUpiInTracker(false), 2500);
  };

  const handleReuploadScreenshotChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReuploadError('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setReuploadError('File size is too large (max 12MB).');
      return;
    }

    setIsUploading(true);
    setReuploadError('');

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        setNewScreenshot(data.imageUrl);
        setNewScreenshotPublicId(data.publicId || '');
      } else {
        setReuploadError(data.message || 'Image upload failed. Please try again.');
      }
    } catch {
      const localUrl = URL.createObjectURL(file);
      setNewScreenshot(localUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmReupload = async (e) => {
    e.preventDefault();
    if (!reuploadingOrder) return;

    if (!newScreenshot) {
      setReuploadError('Payment screenshot is required. Please upload the screenshot of your payment.');
      return;
    }

    const cleanTx = newTransactionId.trim().replace(/\s+/g, '').toUpperCase();
    if (!cleanTx || cleanTx.length < 8) {
      setReuploadError('Please enter a valid UPI Transaction ID / UTR (at least 8 characters).');
      return;
    }

    setReuploadLoading(true);
    setReuploadError('');

    try {
      const targetId = reuploadingOrder._id || reuploadingOrder.orderId;
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/update-payment-proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentScreenshot: newScreenshot,
          paymentScreenshotPublicId: newScreenshotPublicId,
          transactionId: cleanTx,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === reuploadingOrder.orderId || o._id === reuploadingOrder._id || o._id === targetId
              ? {
                  ...o,
                  paymentScreenshot: newScreenshot,
                  paymentScreenshotPublicId: newScreenshotPublicId,
                  transactionId: cleanTx,
                  paymentStatus: 'pending_verification',
                  paymentRejectedReason: '',
                }
              : o
          )
        );
        setCancelToast(`Payment proof for Order #${reuploadingOrder.orderId} submitted! Under bakery review.`);
        setTimeout(() => setCancelToast(''), 5000);
        setReuploadingOrder(null);
        setNewScreenshot('');
        setNewScreenshotPublicId('');
        setNewTransactionId('');
      } else {
        setReuploadError(data.message || 'Failed to update payment proof.');
      }
    } catch {
      setReuploadError('Network error. Please try again.');
    } finally {
      setReuploadLoading(false);
    }
  };

  // Handle Order Lookup
  const handleLookup = async (phoneToSearch) => {
    const rawNumber = (phoneToSearch || phone).trim();
    if (!rawNumber) {
      setErrorMsg('Please enter your mobile phone number.');
      return;
    }

    const digitsOnly = rawNumber.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 5) {
      setErrorMsg('Please enter a valid phone number (at least 5 digits).');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    setHasSearched(true);
    setSearchedPhone(rawNumber);

    // Save to local storage for quick subsequent visits
    localStorage.setItem('pastry_paws_saved_phone', rawNumber);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/orders/track?phone=${encodeURIComponent(rawNumber)}`
      );
      const json = await res.json();
      if (json.success) {
        setOrders(json.data || []);
      } else {
        setOrders([]);
        setErrorMsg(json.message || 'Could not fetch orders.');
      }
    } catch {
      setErrorMsg('Could not connect to server. Please try again in a moment.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if phone is present in URL
  useEffect(() => {
    if (urlPhone) {
      handleLookup(urlPhone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlPhone]);

  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWhatsAppInquiryUrl = (order) => {
    const msg = `Hello Pastry Paws! I am checking on my Order *#${order.orderId}* for *${order.itemTitle}* (${order.selectedSize}). Placed under phone *${order.customerPhone}*. Could you please update me?`;
    return `https://wa.me/${brandConfig.contact.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-[#FEEDDD] text-[#411C10] pt-6 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7C3F27] hover:text-[#411C10] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-xs text-[#7C3F27] hover:text-[#411C10] font-medium transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Menu</span>
          </Link>
        </div>

        {/* Hero Banner Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center gap-2 bg-[#FFF9F3] px-3.5 py-1.5 rounded-full border border-[#D29C83]/30 shadow-2xs">
            <Package className="w-4 h-4 text-[#7C3F27]" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#7C3F27]">
              Order Tracker
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#411C10] font-normal leading-tight">
            Track Your Fresh Bakes
          </h1>

          <p className="text-xs sm:text-sm text-[#7C3F27] max-w-md mx-auto leading-relaxed">
            Enter your mobile number to view the live status of all your current and past handcrafted orders.
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-xl mx-auto bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/35 shadow-lg p-5 sm:p-7">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(phone);
            }}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="phone-input"
                className="block text-xs font-semibold text-[#411C10] mb-1.5"
              >
                Mobile Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1.5 text-[#A66D54] pointer-events-none">
                  <Phone className="w-4 h-4 text-[#7C3F27]" />
                  <span className="text-xs font-semibold border-r border-[#D29C83]/40 pr-2">
                    +91
                  </span>
                </div>
                <input
                  id="phone-input"
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  minLength={10}
                  maxLength={10}
                  title="Please enter a valid 10-digit mobile number"
                  value={phone}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(cleaned);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Enter 10-digit number (e.g. 9876543210)"
                  className="w-full pl-20 pr-10 py-3 text-sm font-medium rounded-2xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27] focus:ring-2 focus:ring-[#7C3F27]/10 transition-all shadow-inner"
                />
                {phone && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhone('');
                      setOrders([]);
                      setHasSearched(false);
                    }}
                    className="absolute right-3 p-1 rounded-full text-[#A66D54] hover:text-[#411C10] hover:bg-[#FEEDDD] transition-colors"
                    aria-label="Clear phone input"
                  >
                    ×
                  </button>
                )}
              </div>
              {errorMsg && (
                <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3.5 px-6 rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching Pastry Paws orders...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Order Status</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Tip */}
          <p className="text-[11px] text-[#A66D54] text-center mt-3">
            💡 Use the exact mobile number provided during checkout.
          </p>
        </div>

        {/* Results Area */}
        <div className="space-y-6 max-w-3xl mx-auto">
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#D29C83]/30 pb-3">
                <h2 className="font-serif text-lg text-[#411C10] font-normal">
                  {orders.length > 0 ? (
                    <span>
                      Orders for <strong className="text-[#7C3F27]">{searchedPhone}</strong> ({orders.length})
                    </span>
                  ) : (
                    <span>No orders found</span>
                  )}
                </h2>
                {orders.length > 0 && (
                  <button
                    onClick={() => handleLookup(searchedPhone)}
                    className="text-xs text-[#7C3F27] hover:text-[#411C10] flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Refresh</span>
                  </button>
                )}
              </div>

              {/* Quick Status Filter Pills (Only shown when orders exist) */}
              {orders.length > 0 && (
                <div className="bg-[#FFF9F3] p-4 rounded-3xl border border-[#D29C83]/30 shadow-xs space-y-3">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setTrackerStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        trackerStatusFilter === 'all'
                          ? 'bg-[#7C3F27] text-white shadow-xs'
                          : 'bg-[#FEEDDD]/60 text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
                      }`}
                    >
                      All Orders ({filterCounts.total})
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrackerStatusFilter('active')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        trackerStatusFilter === 'active'
                          ? 'bg-[#7C3F27] text-white shadow-xs'
                          : 'bg-[#FEEDDD]/60 text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/30'
                      }`}
                    >
                      <span>In Progress ({filterCounts.active})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrackerStatusFilter('delivered')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        trackerStatusFilter === 'delivered'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <span>Delivered ({filterCounts.delivered})</span>
                    </button>

                    {filterCounts.actionNeeded > 0 && (
                      <button
                        type="button"
                        onClick={() => setTrackerStatusFilter('action_needed')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          trackerStatusFilter === 'action_needed'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300 animate-pulse'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Action Required ({filterCounts.actionNeeded})</span>
                      </button>
                    )}

                    {filterCounts.cancelled > 0 && (
                      <button
                        type="button"
                        onClick={() => setTrackerStatusFilter('cancelled')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          trackerStatusFilter === 'cancelled'
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <span>Cancelled ({filterCounts.cancelled})</span>
                      </button>
                    )}
                  </div>

                  {/* Search within tracked orders & Select Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-[#D29C83]/20">
                    {/* Search Input */}
                    <div className="relative sm:col-span-6">
                      <Search className="w-3.5 h-3.5 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={trackerSearchQuery}
                        onChange={(e) => setTrackerSearchQuery(e.target.value)}
                        placeholder="Filter by cake title, Order #ID, or UTR..."
                        className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/30 text-[#411C10] placeholder:text-[#A66D54]/60 focus:outline-none focus:border-[#7C3F27]"
                      />
                      {trackerSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setTrackerSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A66D54] hover:text-[#411C10] p-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Payment Status Dropdown */}
                    <div className="sm:col-span-3">
                      <select
                        value={trackerPaymentFilter}
                        onChange={(e) => setTrackerPaymentFilter(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                      >
                        <option value="all">All Payment States</option>
                        <option value="verified">Payment Verified ✅</option>
                        <option value="pending_verification">Review Pending ⏳</option>
                        <option value="rejected">Re-upload Needed ⚠️</option>
                      </select>
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="sm:col-span-3">
                      <select
                        value={trackerSortBy}
                        onChange={(e) => setTrackerSortBy(e.target.value)}
                        className="w-full text-xs px-2.5 py-2 rounded-xl border border-[#D29C83]/40 bg-[#FEEDDD]/40 text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="amount_high">Amount: High to Low</option>
                        <option value="amount_low">Amount: Low to High</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Summary & Reset */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-[#7C3F27]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-[#411C10]">
                        Showing {filteredTrackedOrders.length} of {orders.length} orders
                      </span>

                      {trackerStatusFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                          <span>Status: {trackerStatusFilter.replace('_', ' ')}</span>
                          <button
                            type="button"
                            onClick={() => setTrackerStatusFilter('all')}
                            className="hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {trackerPaymentFilter !== 'all' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                          <span>Payment: {trackerPaymentFilter.replace('_', ' ')}</span>
                          <button
                            type="button"
                            onClick={() => setTrackerPaymentFilter('all')}
                            className="hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {trackerSearchQuery && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 font-medium">
                          <span>Search: "{trackerSearchQuery}"</span>
                          <button
                            type="button"
                            onClick={() => setTrackerSearchQuery('')}
                            className="hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>

                    {(trackerStatusFilter !== 'all' ||
                      trackerPaymentFilter !== 'all' ||
                      trackerSearchQuery ||
                      trackerSortBy !== 'newest') && (
                      <button
                        type="button"
                        onClick={() => {
                          setTrackerStatusFilter('all');
                          setTrackerPaymentFilter('all');
                          setTrackerSearchQuery('');
                          setTrackerSortBy('newest');
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#7C3F27] hover:text-[#411C10] underline cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State when no orders exist at all */}
          {hasSearched && orders.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 px-6 bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-xs space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-[#FEEDDD] text-[#7C3F27] flex items-center justify-center mx-auto shadow-2xs">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl text-[#411C10]">
                  No orders found for this number
                </h3>
                <p className="text-xs text-[#7C3F27] max-w-md mx-auto leading-relaxed">
                  We couldn't find any orders matching <strong>"{searchedPhone}"</strong>. Please verify that the 10-digit number is correct, or place a fresh order today!
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2.5 px-6 rounded-xl text-xs font-semibold shadow-xs transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Fresh Bakery Menu</span>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Filter Empty State when orders exist but filters match 0 */}
          {hasSearched && orders.length > 0 && filteredTrackedOrders.length === 0 && (
            <div className="text-center py-12 px-6 bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-xs space-y-3">
              <Package className="w-10 h-10 text-[#D29C83] mx-auto mb-2" />
              <h3 className="font-serif text-xl text-[#411C10]">No orders match your filter criteria</h3>
              <p className="text-xs text-[#7C3F27] max-w-md mx-auto">
                Try searching for a different cake name, clearing the search query, or switching back to "All Orders".
              </p>
              <button
                type="button"
                onClick={() => {
                  setTrackerStatusFilter('all');
                  setTrackerPaymentFilter('all');
                  setTrackerSearchQuery('');
                  setTrackerSortBy('newest');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#D29C83]/30 text-xs font-semibold cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Order Filters</span>
              </button>
            </div>
          )}

          {/* Orders List */}
          <div className="space-y-5">
            {filteredTrackedOrders.map((order, idx) => {
              const statusKey = order.status || 'pending';
              const statusMeta = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
              const StatusIcon = statusMeta.icon;
              const isCancelled = statusKey === 'cancelled';

              return (
                <motion.div
                  key={order._id || order.orderId || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/35 shadow-md overflow-hidden"
                >
                  {/* Order Card Top Bar */}
                  <div className="bg-[#FEEDDD]/70 px-5 sm:px-6 py-3.5 border-b border-[#D29C83]/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#A66D54] block font-bold">
                          Order ID
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm sm:text-base font-bold text-[#411C10]">
                            #{order.orderId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(order.orderId)}
                            className="p-1 rounded text-[#7C3F27] hover:bg-[#FEE5D2] transition-colors cursor-pointer"
                            title="Copy Order ID"
                          >
                            {copiedId === order.orderId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Transaction ID / UTR prominently displayed in top bar */}
                      <div className="border-l border-[#D29C83]/40 pl-3 sm:pl-4">
                        <span className="text-[10px] uppercase tracking-wider text-[#A66D54] block font-bold">
                          UPI Transaction ID / UTR
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs sm:text-sm font-bold text-[#7C3F27] bg-[#FFF9F3] px-2.5 py-0.5 rounded-md border border-[#D29C83]/40 select-all">
                            {order.transactionId || 'Pending Verification'}
                          </span>
                          {order.transactionId && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(order.transactionId);
                                setCopiedId(order.transactionId);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 rounded text-[#7C3F27] hover:bg-[#FEE5D2] transition-colors cursor-pointer"
                              title="Copy UPI UTR Number"
                            >
                              {copiedId === order.transactionId ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${statusMeta.badgeClass}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{statusMeta.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Progress Stepper (if not cancelled) */}
                  {!isCancelled && (
                    <div className="px-5 sm:px-6 pt-5 pb-3 bg-[#FFFDF9] border-b border-[#D29C83]/15">
                      <div className="relative">
                        {/* Progress Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#D29C83]/30 -z-0" />
                        <div
                          className="absolute top-4 left-6 h-0.5 bg-[#7C3F27] transition-all duration-500 -z-0"
                          style={{
                            width: `${Math.min(
                              100,
                              (statusMeta.stepIndex / (PROGRESS_STEPS.length - 1)) * 100
                            )}%`,
                          }}
                        />

                        {/* Steps Icons */}
                        <div className="grid grid-cols-4 relative z-10 text-center">
                          {PROGRESS_STEPS.map((step, sIdx) => {
                            const isCompleted = sIdx <= statusMeta.stepIndex;
                            const isCurrent = sIdx === statusMeta.stepIndex;

                            return (
                              <div key={step.id} className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    isCurrent
                                      ? 'bg-[#7C3F27] text-[#FFF9F3] ring-4 ring-[#F7B6A7]/40 shadow-xs scale-105'
                                      : isCompleted
                                      ? 'bg-[#7C3F27] text-[#FFF9F3]'
                                      : 'bg-[#FEEDDD] text-[#A66D54] border border-[#D29C83]/40'
                                  }`}
                                >
                                  {isCompleted ? '✓' : sIdx + 1}
                                </div>
                                <span
                                  className={`text-[10px] sm:text-xs mt-1.5 font-medium ${
                                    isCurrent
                                      ? 'text-[#7C3F27] font-bold'
                                      : isCompleted
                                      ? 'text-[#411C10]'
                                      : 'text-[#A66D54]/70'
                                  }`}
                                >
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Product & Delivery Details Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      {/* Product Thumbnail */}
                      {order.itemImage ? (
                        <img
                          src={order.itemImage}
                          alt={order.itemTitle}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#D29C83]/30 bg-[#FEEDDD] shrink-0"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://res.cloudinary.com/ku59ko3p/image/upload/v1792430625/PastryPaws/hero-cake.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#FEEDDD] border border-[#D29C83]/30 flex items-center justify-center text-[#7C3F27] shrink-0">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal">
                            {order.itemTitle}
                          </h3>
                          <span className="font-serif text-base sm:text-lg font-bold text-[#7C3F27]">
                            {order.price}
                          </span>
                        </div>

                        <p className="text-xs text-[#7C3F27] font-medium mt-0.5">
                          Selected Size: <span className="text-[#411C10] font-semibold">{order.selectedSize}</span>
                          {order.quantity && order.quantity > 1 && (
                            <span className="text-[#7C3F27] font-bold"> • Qty: {order.quantity} units</span>
                          )}
                          {order.category && ` • Category: ${order.category}`}
                        </p>

                        {/* Selected Add-ons Display */}
                        {order.selectedAddons && order.selectedAddons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] text-[#A66D54] font-medium">Add-ons:</span>
                            {order.selectedAddons.map((addon, aIdx) => (
                              <span
                                key={aIdx}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#FEEDDD] text-[#7C3F27] px-2 py-0.5 rounded-md border border-[#D29C83]/30"
                              >
                                <span>+ {addon.name}</span>
                                <span className="opacity-75 font-normal">(₹{addon.price}/-)</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Customer & Address Details */}
                        <div className="mt-3 p-3 rounded-2xl bg-[#FEEDDD]/40 border border-[#D29C83]/25 text-xs text-[#411C10] space-y-1.5">
                          <p>
                            <span className="text-[#A66D54]">Recipient:</span>{' '}
                            <strong>{order.customerName}</strong> ({order.customerPhone})
                          </p>
                          <p>
                            <span className="text-[#A66D54]">UPI UTR / Transaction ID:</span>{' '}
                            <strong className="font-mono text-[#7C3F27] bg-[#FFF9F3] px-2 py-0.5 rounded border border-[#D29C83]/30 select-all">
                              {order.transactionId || 'Pending Verification'}
                            </strong>
                          </p>
                          <p className="line-clamp-2">
                            <span className="text-[#A66D54]">Delivery Address:</span>{' '}
                            {order.deliveryAddress}
                          </p>
                          {(order.deliveryDate || order.deliveryTime) && (
                            <p>
                              <span className="text-[#A66D54]">Scheduled:</span>{' '}
                              {[order.deliveryDate, order.deliveryTime].filter(Boolean).join(' • ')}
                            </p>
                          )}
                          {order.notes && (
                            <p className="italic text-[#7C3F27] pt-0.5">
                              <span className="text-[#A66D54]">Notes:</span> "{order.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PAYMENT DETAILS CARD (UPI vs CASH ON DELIVERY) */}
                    {order.paymentMethod === 'Cash on Delivery' ? (
                      <div className="mt-3.5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-[11px] border border-amber-300">
                              💵
                            </span>
                            <span className="font-bold text-[#411C10]">
                              Cash on Delivery (COD)
                            </span>
                          </div>

                          {/* COD Status Badge */}
                          {order.paymentStatus === 'verified' || order.status === 'delivered' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Cash Collected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-700" />
                              <span>Pay on Pickup / Handover ({order.price})</span>
                            </span>
                          )}
                        </div>

                        <div className="p-2.5 bg-[#FFF9F3] rounded-xl border border-amber-200 text-[#411C10] space-y-1">
                          {order.paymentStatus === 'verified' || order.status === 'delivered' ? (
                            <p className="font-medium text-xs text-emerald-900">
                              ✓ Cash payment of <strong>{order.price}</strong> was collected upon pickup / handover. Thank you!
                            </p>
                          ) : (
                            <>
                              <p className="font-medium text-xs text-amber-950">
                                💵 Please keep exact cash of <strong>{order.price}</strong> ready upon order pickup / handover on {order.deliveryDate || 'the scheduled date'}.
                              </p>
                              <p className="text-[11px] text-[#7C3F27]">
                                No advance transaction ID or screenshot proof required.
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3.5 p-3.5 rounded-2xl bg-[#FEEDDD]/40 border border-[#D29C83]/30 text-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-lg bg-[#FEEDDD] text-[#7C3F27] flex items-center justify-center font-bold text-[11px] border border-[#D29C83]/30">
                              ₹
                            </span>
                            <span className="font-bold text-[#411C10]">
                              Google Pay / UPI Payment
                            </span>
                          </div>

                          {/* Verification Badge */}
                          {order.paymentStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Payment Verified</span>
                            </span>
                          ) : order.paymentStatus === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Payment Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Verification Pending</span>
                            </span>
                          )}
                        </div>

                        {/* Transaction ID & Status message */}
                        {order.paymentStatus === 'verified' ? (
                          <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
                            <p className="font-medium text-xs">
                              ✓ Your payment has been verified by the studio! Preparation is proceeding.
                            </p>
                            {order.transactionId && (
                              <p className="text-[11px] text-emerald-700">
                                UPI Reference / UTR: <strong className="font-mono">{order.transactionId}</strong>
                              </p>
                            )}
                          </div>
                        ) : order.paymentStatus === 'rejected' ? (
                          <div className="p-3 bg-rose-50 rounded-xl border border-rose-300 text-rose-950 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-rose-800">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Action Needed: Payment Verification Issue</span>
                            </div>
                            <p className="text-xs text-[#411C10]">
                              <span className="text-[#A66D54]">Studio notice:</span>{' '}
                              <strong className="text-rose-900">"{order.paymentRejectedReason || 'Could not verify payment with bank statement.'}"</strong>
                            </p>
                            <p className="text-[11px] text-[#7C3F27]">
                              Please re-check your payment app receipt and upload the clear payment screenshot and genuine 12-digit UTR reference number.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setReuploadingOrder(order);
                                setNewScreenshot('');
                                setNewScreenshotPublicId('');
                                setNewTransactionId(order.transactionId || '');
                                setReuploadError('');
                              }}
                              className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-2 px-3.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Re-upload Payment Proof</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                            <p className="font-medium text-xs">
                              Your UPI payment proof is under review by our studio. We will confirm your order as soon as the transaction reflects in our account.
                            </p>
                            {order.transactionId && (
                              <p className="text-[11px] text-amber-800">
                                Submitted UTR: <strong className="font-mono">{order.transactionId}</strong>
                              </p>
                            )}
                          </div>
                        )}

                      {/* Customer can view their uploaded screenshot */}
                      {order.paymentScreenshot && (
                        <div className="flex items-center justify-between pt-1 text-[11px]">
                          <span className="text-[#A66D54]">Uploaded Receipt Proof:</span>
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(order.paymentScreenshot)}
                            className="text-[#7C3F27] hover:text-[#411C10] font-semibold underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Receipt Screenshot</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Cancellation Request Pending Review Banner */}
                      {order.cancellationStatus === 'pending' && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                            <span>Cancellation Request Under Review</span>
                          </div>
                          <p className="text-[#411C10]">
                            <span className="text-[#A66D54]">Reason provided:</span>{' '}
                            <strong className="text-amber-950">"{order.cancellationReason}"</strong>
                          </p>
                          <p className="text-[11px] text-[#A66D54]">
                            Our studio is reviewing your cancellation request. If approved, the order will be cancelled. If preparation has already begun, the order will proceed.
                          </p>
                        </div>
                      )}

                      {/* Cancellation Request Denied Banner */}
                      {order.cancellationStatus === 'denied' && (
                        <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-xs space-y-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-rose-900">
                            <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                            <span>Cancellation Request Declined by Bakery</span>
                          </div>
                          <p className="text-[#411C10]">
                            <span className="text-[#A66D54]">Reason from Studio:</span>{' '}
                            <strong className="text-rose-900">"{order.cancellationDeniedReason || 'Artisan ingredients already prepped and baking started.'}"</strong>
                          </p>
                          <p className="text-[11px] text-[#7C3F27]">
                            Your order remains active and is proceeding as scheduled.
                          </p>
                        </div>
                      )}

                      {/* Cancelled Order Banner */}
                      {isCancelled && (
                        <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-0.5">
                          <strong>Order Cancelled</strong>
                          {order.cancellationReason && (
                            <p className="text-[11px] text-rose-700">Reason: "{order.cancellationReason}"</p>
                          )}
                        </div>
                      )}

                    {/* Order Action Footer */}
                    <div className="pt-3 border-t border-[#D29C83]/20 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-[#A66D54]">
                        Placed on:{' '}
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </span>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Download Invoice PDF Button */}
                        <button
                          type="button"
                          disabled={generatingInvoiceId === (order.orderId || order._id)}
                          onClick={() => handleDownloadInvoice(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF9F3] hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/35 text-xs font-semibold transition-all shadow-2xs hover:shadow cursor-pointer disabled:opacity-60"
                          title="Dynamically fetch fresh invoice from database and download PDF"
                        >
                          {generatingInvoiceId === (order.orderId || order._id) ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C3F27]" />
                              <span>Fetching Bill...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Invoice (PDF)</span>
                            </>
                          )}
                        </button>

                        {/* Request Cancellation button: ONLY shown if status is 'pending' and not already requested */}
                        {statusKey === 'pending' && order.cancellationStatus !== 'pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalError('');
                              setCancellationReasonInput('');
                              setOrderToCancel(order);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-semibold transition-all shadow-2xs hover:shadow cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Request Cancel</span>
                          </button>
                        )}

                        {/* Cancellation Request Already Pending */}
                        {order.cancellationStatus === 'pending' && (
                          <span className="text-[11px] text-amber-800 bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-300 font-semibold">
                            ⏳ Cancel Requested
                          </span>
                        )}

                        {/* Strict Rule: For confirmed or baking, cancel is forbidden for users */}
                        {(statusKey === 'confirmed' || statusKey === 'baking') && (
                          <span className="text-[11px] text-[#7C3F27]/80 bg-[#FEEDDD]/60 px-2.5 py-1 rounded-lg border border-[#D29C83]/30">
                            🔒 In preparation (Cannot be cancelled)
                          </span>
                        )}

                        <a
                          href={getWhatsAppInquiryUrl(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/40 text-xs font-semibold transition-all shadow-2xs hover:shadow cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {cancelToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/30 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{cancelToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Cancellation Modal (Mandatory Reason) */}
      <AnimatePresence>
        {orderToCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#411C10]">
                  Request Cancellation #{orderToCancel.orderId}
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  You are requesting cancellation for <strong className="text-[#411C10]">{orderToCancel.itemTitle}</strong> ({orderToCancel.selectedSize}).
                  Your request will be submitted to the bakery for review and confirmation.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#411C10]">
                  Reason for Cancellation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancellationReasonInput}
                  onChange={(e) => {
                    setCancellationReasonInput(e.target.value);
                    if (cancelModalError) setCancelModalError('');
                  }}
                  placeholder="e.g. Ordered incorrect flavor/size, delivery date change needed, placed by mistake..."
                  className="w-full p-3 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                />
              </div>

              {cancelModalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {cancelModalError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => {
                    setOrderToCancel(null);
                    setCancellationReasonInput('');
                    setCancelModalError('');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={handleConfirmCancel}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Submit Cancellation Request</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RE-UPLOAD PAYMENT PROOF */}
      <AnimatePresence>
        {reuploadingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/50 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl space-y-4 my-auto"
            >
              <div className="flex items-center justify-between border-b border-[#D29C83]/25 pb-3">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl text-[#411C10]">
                    Re-upload Payment Proof
                  </h3>
                  <p className="text-xs text-[#7C3F27]">
                    Order #{reuploadingOrder.orderId} • {reuploadingOrder.itemTitle} ({reuploadingOrder.price})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setReuploadingOrder(null);
                    setReuploadError('');
                  }}
                  className="p-1.5 rounded-xl text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* UPI Payment Instructions Card */}
              <div className="p-3.5 bg-[#FEEDDD]/60 rounded-2xl border border-[#D29C83]/30 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[#7C3F27] font-medium">Bakery Official UPI ID:</span>
                  <button
                    type="button"
                    onClick={handleCopyUpiInTracker}
                    className="inline-flex items-center gap-1 bg-[#FFF9F3] hover:bg-[#FEEDDD] px-2.5 py-1 rounded-lg border border-[#D29C83]/35 text-xs font-mono font-bold text-[#411C10] transition-colors cursor-pointer"
                  >
                    <span>{paymentConfig.upiId || brandConfig.payment?.upiId || '9790983844@okaxis'}</span>
                    {copiedUpiInTracker ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-[#7C3F27]" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-[#A66D54] flex items-center justify-between">
                  <span>Payee Name: <strong>{paymentConfig.payeeName || brandConfig.payment?.payeeName || 'Pastry Paws'}</strong></span>
                  <span>Amount: <strong className="text-[#411C10] font-bold">{reuploadingOrder.price}</strong></span>
                </div>
              </div>

              <form onSubmit={handleConfirmReupload} className="space-y-4">
                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs font-bold text-[#411C10] mb-1.5">
                    1. Upload Payment Screenshot <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative border-2 border-dashed border-[#D29C83]/50 hover:border-[#7C3F27] rounded-2xl p-4 text-center bg-[#FFFDF9] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReuploadScreenshotChange}
                      disabled={isUploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center py-2 text-[#7C3F27]">
                        <RefreshCw className="w-6 h-6 animate-spin mb-1 text-[#7C3F27]" />
                        <span className="text-xs font-semibold">Uploading and optimizing screenshot...</span>
                      </div>
                    ) : newScreenshot ? (
                      <div className="flex items-center justify-center gap-3 py-1">
                        <img
                          src={newScreenshot}
                          alt="New receipt preview"
                          className="w-12 h-12 object-cover rounded-xl border border-[#D29C83]/40 shadow-xs"
                        />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Screenshot Selected</span>
                          </p>
                          <span className="text-[10px] text-[#A66D54]">Click or drop to replace</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-2 text-[#7C3F27]">
                        <Upload className="w-6 h-6 mb-1 text-[#7C3F27]/70" />
                        <span className="text-xs font-semibold">Upload clear screenshot of payment</span>
                        <span className="text-[10px] text-[#A66D54] mt-0.5">PNG, JPG, JPEG, WEBP up to 12MB</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 12-digit UTR Input */}
                <div>
                  <label className="block text-xs font-bold text-[#411C10] mb-1.5">
                    2. UPI Transaction ID / UTR Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={35}
                    value={newTransactionId}
                    onChange={(e) => {
                      setNewTransactionId(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
                      if (reuploadError) setReuploadError('');
                    }}
                    placeholder="Enter 12-digit UTR number (e.g. 429182739102)"
                    className="w-full px-4 py-3 rounded-xl border border-[#D29C83]/40 bg-white font-mono text-xs sm:text-sm font-bold text-[#411C10] tracking-wider placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27] focus:ring-1 focus:ring-[#7C3F27]"
                  />
                  <span className="text-[10px] text-[#A66D54] mt-1 block">
                    Found in Google Pay / PhonePe / Paytm receipt as "UPI Ref No" or "UTR".
                  </span>
                </div>

                {reuploadError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                    ⚠️ {reuploadError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={reuploadLoading}
                    onClick={() => {
                      setReuploadingOrder(null);
                      setReuploadError('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#D29C83]/40 text-xs font-semibold text-[#7C3F27] hover:bg-[#FEEDDD] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reuploadLoading || isUploading}
                    className="px-5 py-2.5 rounded-xl bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {reuploadLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Proof...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Payment Proof</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CUSTOMER RECEIPT LIGHTBOX */}
      <AnimatePresence>
        {previewReceiptUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#FFF9F3] border border-[#D29C83]/50 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
            >
              <div className="px-5 py-3.5 bg-[#FEEDDD] border-b border-[#D29C83]/30 flex items-center justify-between gap-3">
                <span className="font-serif text-sm font-semibold text-[#411C10]">
                  Your Submitted Payment Proof
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewReceiptUrl(null)}
                  className="p-1.5 rounded-xl text-[#7C3F27] hover:bg-[#FFF9F3] transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex items-center justify-center bg-[#2C1810]/5 flex-1">
                <img
                  src={previewReceiptUrl}
                  alt="Payment receipt"
                  className="max-h-[65vh] max-w-full rounded-2xl shadow-md border border-[#D29C83]/30 object-contain mx-auto"
                />
              </div>

              <div className="px-5 py-3 bg-[#FEEDDD]/70 border-t border-[#D29C83]/30 text-right">
                <button
                  type="button"
                  onClick={() => setPreviewReceiptUrl(null)}
                  className="px-4 py-2 rounded-xl bg-[#7C3F27] text-white text-xs font-semibold hover:bg-[#5E2B19] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TrackOrderPage;
