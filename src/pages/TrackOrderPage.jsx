import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';

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
    sublabel: 'On the way to your doorstep',
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
  const [cancelling, setCancelling] = useState(false);
  const [cancelModalError, setCancelModalError] = useState('');
  const [cancelToast, setCancelToast] = useState('');

  // Handle Customer Cancel Order (Pending only)
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    setCancelling(true);
    setCancelModalError('');

    try {
      const targetId = orderToCancel._id || orderToCancel.orderId;
      const res = await fetch(`${API_BASE_URL}/api/orders/${targetId}/customer-cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();

      if (data.success) {
        // Update local orders list to reflect cancelled status immediately
        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === orderToCancel.orderId || o._id === orderToCancel._id
              ? { ...o, status: 'cancelled' }
              : o
          )
        );
        setCancelToast(`Order #${orderToCancel.orderId} was successfully cancelled.`);
        setTimeout(() => setCancelToast(''), 5000);
        setOrderToCancel(null);
      } else {
        setCancelModalError(data.message || 'Unable to cancel this order.');
      }
    } catch {
      setCancelModalError('Failed to connect to the server. Please check your network and try again.');
    } finally {
      setCancelling(false);
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
                Mobile Phone Number
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
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
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
          )}

          {/* Empty State */}
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

          {/* Orders List */}
          <div className="space-y-5">
            {orders.map((order, idx) => {
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
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#A66D54] block">
                          Order Reference
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm sm:text-base font-bold text-[#411C10]">
                            #{order.orderId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyOrderId(order.orderId)}
                            className="p-1 rounded text-[#7C3F27] hover:bg-[#FEE5D2] transition-colors"
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
                          {order.category && ` • Category: ${order.category}`}
                        </p>

                        {/* Customer & Address Details */}
                        <div className="mt-3 p-3 rounded-2xl bg-[#FEEDDD]/40 border border-[#D29C83]/25 text-xs text-[#411C10] space-y-1">
                          <p>
                            <span className="text-[#A66D54]">Recipient:</span>{' '}
                            <strong>{order.customerName}</strong> ({order.customerPhone})
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
                        {/* Cancel button: STRICT RULE - ONLY shown if status is 'pending' */}
                        {statusKey === 'pending' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalError('');
                              setOrderToCancel(order);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-rose-600 text-xs font-semibold transition-all shadow-2xs hover:shadow cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Cancel Order</span>
                          </button>
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white border border-[#25D366]/40 text-xs font-semibold transition-all shadow-2xs hover:shadow cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Inquire on WhatsApp</span>
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

      {/* Cancel Order Confirmation Modal */}
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
                  Cancel Order #{orderToCancel.orderId}?
                </h3>
                <p className="text-xs text-[#7C3F27] mt-1 leading-relaxed">
                  Are you sure you want to cancel your order for{' '}
                  <strong className="text-[#411C10]">{orderToCancel.itemTitle}</strong> ({orderToCancel.selectedSize})?
                  This action cannot be undone once confirmed.
                </p>
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
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Yes, Cancel Order</span>
                  )}
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
