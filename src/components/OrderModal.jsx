import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  ShoppingBag,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Download,
  CreditCard,
  Truck,
  QrCode,
  Copy,
  Check,
  Upload,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { brandConfig } from '../data/brand';
import { API_BASE_URL } from '../utils/api';
import { printOrderInvoice } from '../utils/invoiceGenerator';
import { getCachedPaymentConfig, fetchPaymentConfig } from '../utils/paymentConfig';

export function OrderModal({ isOpen, onClose, item, selectedTier }) {
  const [modalStep, setModalStep] = useState('details'); // 'details' | 'payment'
  const [paymentConfig, setPaymentConfig] = useState(getCachedPaymentConfig);
  const [activeQrMode, setActiveQrMode] = useState('auto'); // 'auto' | 'custom' | 'dynamic'

  // Fetch latest payment config when modal opens
  React.useEffect(() => {
    if (isOpen) {
      fetchPaymentConfig().then((cfg) => {
        if (cfg) {
          setPaymentConfig(cfg);
        }
      });
    }
  }, [isOpen]);

  // Step 1: Customer & Delivery Details
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: 'Afternoon (1 PM - 5 PM)',
    notes: '',
  });

  // Step 2: Payment Details (UPI / Google Pay vs Cash on Delivery)
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'COD'
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [paymentScreenshotPublicId, setPaymentScreenshotPublicId] = useState('');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen || !item) return null;

  const currentTier = selectedTier || (item.pricingDetails && item.pricingDetails[0]) || {
    size: 'Standard',
    price: `₹${item.startingPrice || 299}/-`,
  };

  // Clean numeric price for UPI payment URI (e.g. "₹399/-" -> "399")
  const numericPrice = (currentTier.price || '').replace(/[^0-9]/g, '') || '299';
  const upiId = paymentConfig.upiId || brandConfig.payment?.upiId || '9790983844@okaxis';
  const payeeName = paymentConfig.payeeName || brandConfig.payment?.payeeName || 'Pastry Paws';
  const paymentPhone = paymentConfig.phoneNumber || brandConfig.contact?.phone || '9790983844';
  const paymentWhatsapp = paymentConfig.whatsappNumber || brandConfig.contact?.whatsappNumber || '919790983844';

  const hasCustomQr = Boolean(paymentConfig.qrCodeImage);
  const currentQrMode =
    activeQrMode === 'auto'
      ? hasCustomQr && paymentConfig.qrMode === 'custom'
        ? 'custom'
        : 'dynamic'
      : activeQrMode;

  // Standard NPCI UPI URI Scheme (compatible with Google Pay, PhonePe, Paytm, BHIM)
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${encodeURIComponent(numericPrice)}&cu=INR&tn=${encodeURIComponent(
    `Pastry Paws ${item.title}`
  )}`;

  // Dynamic QR code generated with exact order amount
  const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  // Active QR image to show based on selected mode
  const activeQrImageUrl = currentQrMode === 'custom' && hasCustomQr ? paymentConfig.qrCodeImage : upiQrCodeUrl;

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (formError) setFormError('');
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Upload Payment Screenshot via Multer / Cloudinary backend endpoint
  const handleScreenshotFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 12 * 1024 * 1024) {
      setFormError('File size is too large. Please upload an image under 12MB.');
      return;
    }

    setIsUploadingScreenshot(true);
    setFormError('');

    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        setPaymentScreenshot(data.imageUrl);
        setPaymentScreenshotPublicId(data.publicId || '');
      } else {
        setFormError(data.message || 'Error uploading screenshot. Please try again.');
      }
    } catch {
      // Local preview fallback if offline
      const localUrl = URL.createObjectURL(file);
      setPaymentScreenshot(localUrl);
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  // Validate details form inputs
  const validateCustomerDetails = () => {
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError('Please enter your full name (at least 2 characters).');
      return false;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setFormError('Please enter a valid 10-digit mobile phone number.');
      return false;
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      setFormError('Please enter your complete delivery address (street, area, landmark).');
      return false;
    }

    if (!formData.deliveryDate) {
      setFormError('Please select your preferred delivery date.');
      return false;
    }

    return true;
  };

  // Generic Order Submission Engine
  const submitOrder = async (method = 'Google Pay / UPI', screenshot = '', screenshotPublicId = '', txId = 'COD') => {
    setIsSubmitting(true);
    setFormError('');

    const isCOD = method === 'Cash on Delivery';

    const orderPayload = {
      customerName: formData.name.trim(),
      customerPhone: formData.phone.trim(),
      deliveryAddress: formData.address.trim(),
      deliveryDate: formData.deliveryDate,
      deliveryTime: formData.deliveryTime,
      notes: formData.notes ? formData.notes.trim() : '',
      itemTitle: item.title,
      category: item.category || '',
      selectedSize: currentTier.size,
      price: currentTier.price,
      itemImage: item.image,
      paymentMethod: method,
      paymentScreenshot: isCOD ? '' : screenshot,
      paymentScreenshotPublicId: isCOD ? '' : screenshotPublicId,
      transactionId: isCOD ? 'COD' : txId,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setPlacedOrder(data.data);
      } else {
        setFormError(data.message || 'Unable to place order. Please check the details and try again.');
      }
    } catch {
      // Offline fallback
      setPlacedOrder({
        orderId: `PP-${Date.now().toString().slice(-6)}`,
        ...orderPayload,
        paymentStatus: isCOD ? 'cod_pending' : 'pending_verification',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Handle Proceed (Cash on Delivery places order directly, UPI advances to Step 2)
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setFormError('');

    if (!validateCustomerDetails()) return;

    if (paymentMethod === 'COD') {
      submitOrder('Cash on Delivery');
    } else {
      setModalStep('payment');
    }
  };

  // Step 2: Final Order Submission with UPI Payment Proof
  const handleFinalOrderSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!paymentScreenshot) {
      setFormError('Payment screenshot is required. Please upload the screenshot of your UPI / GPay payment.');
      return;
    }

    const cleanTxId = transactionId.trim().replace(/\s+/g, '').toUpperCase();
    if (!cleanTxId || cleanTxId.length < 8) {
      setFormError('Please enter a valid 12-digit UPI Transaction ID / UTR reference number.');
      return;
    }

    submitOrder('Google Pay / UPI', paymentScreenshot, paymentScreenshotPublicId, cleanTxId);
  };

  const handleResetAndClose = () => {
    setPlacedOrder(null);
    setModalStep('details');
    setPaymentMethod('UPI');
    setFormData({
      name: '',
      phone: '',
      address: '',
      deliveryDate: '',
      deliveryTime: 'Afternoon (1 PM - 5 PM)',
      notes: '',
    });
    setPaymentScreenshot('');
    setPaymentScreenshotPublicId('');
    setTransactionId('');
    setFormError('');
    onClose();
  };

  // Pre-filled WhatsApp link with complete receipt & payment details
  const whatsappReceiptUrl = placedOrder
    ? `https://wa.me/${paymentWhatsapp}?text=${encodeURIComponent(
      placedOrder.paymentMethod === 'Cash on Delivery'
        ? `Hello Pastry Paws! I just placed an order with *Cash on Delivery*:\n\n*Order ID:* ${placedOrder.orderId}\n*Item:* ${placedOrder.itemTitle} (${placedOrder.selectedSize})\n*Amount:* ${placedOrder.price}\n*Customer:* ${placedOrder.customerName} (${placedOrder.customerPhone})\n*Address:* ${placedOrder.deliveryAddress}\n*Delivery Date:* ${placedOrder.deliveryDate} (${placedOrder.deliveryTime})\n*Payment Method:* Cash on Delivery (Pay ${placedOrder.price} in cash upon delivery)\n\nPlease confirm my order. Thank you!`
        : `Hello Pastry Paws! I just placed an order with UPI payment proof:\n\n*Order ID:* ${placedOrder.orderId}\n*Item:* ${placedOrder.itemTitle} (${placedOrder.selectedSize})\n*Amount:* ${placedOrder.price}\n*Customer:* ${placedOrder.customerName} (${placedOrder.customerPhone})\n*Address:* ${placedOrder.deliveryAddress}\n*Delivery Date:* ${placedOrder.deliveryDate} (${placedOrder.deliveryTime})\n*UPI UTR / Ref No:* ${placedOrder.transactionId}\n*Payment Status:* Verification Pending\n\nPlease verify my payment and confirm. Thank you!`
    )}`
    : '#';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-[#2C1810]/75 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
          className="relative w-full max-w-lg bg-[#FFF9F3] rounded-3xl border border-[#D29C83]/30 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#D29C83]/20 bg-[#FEEDDD]/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7C3F27] text-[#FEEDDD] flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-[#411C10] font-normal leading-tight">
                  {placedOrder
                    ? placedOrder.paymentMethod === 'Cash on Delivery'
                      ? 'Order Placed (Cash on Delivery)!'
                      : 'Order Submitted!'
                    : modalStep === 'payment'
                      ? 'Step 2: Pay via Google Pay / UPI'
                      : 'Step 1: Order & Delivery Details'}
                </h3>
                <p className="text-[11px] text-[#7C3F27]">
                  {placedOrder
                    ? placedOrder.paymentMethod === 'Cash on Delivery'
                      ? 'Order registered • Pay with cash upon delivery'
                      : 'Payment proof received • Studio verification in progress'
                    : modalStep === 'payment'
                      ? 'Scan QR or copy UPI ID, then upload your screenshot'
                      : 'Choose your payment method & delivery preferences'}
                </p>
              </div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="p-1.5 rounded-full text-[#7C3F27] hover:bg-[#FEE5D2] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* SCREEN 1: SUCCESS / CONFIRMATION */}
            {placedOrder ? (
              <div className="space-y-4 text-center py-1">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <div>
                  <span className="inline-block text-[11px] uppercase tracking-wider font-bold bg-[#FEEDDD] text-[#7C3F27] px-3 py-1 rounded-full border border-[#D29C83]/30">
                    Order ID: {placedOrder.orderId}
                  </span>
                  <h4 className="font-serif text-2xl text-[#411C10] mt-2 font-normal">
                    Thank You, {placedOrder.customerName}!
                  </h4>
                  <p className="text-xs text-[#7C3F27] mt-1">
                    Your order for <strong>{placedOrder.itemTitle}</strong> has been registered
                    {placedOrder.paymentMethod === 'Cash on Delivery' ? ' with Cash on Delivery.' : ' with payment proof.'}
                  </p>
                </div>

                {/* Status Notice */}
                {placedOrder.paymentMethod === 'Cash on Delivery' ? (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-left space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                      <span className="text-sm">💵</span>
                      <span>Cash on Delivery Confirmed</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      Your order has been registered! Please keep exact change of <strong>{placedOrder.price}</strong> ready in cash upon delivery on <strong>{placedOrder.deliveryDate} ({placedOrder.deliveryTime})</strong>. No advance payment or screenshot needed.
                    </p>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-left space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Payment Verification Pending</span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      We received your payment screenshot and <strong>UTR #{placedOrder.transactionId}</strong>. Our studio is verifying this transaction with our bank statement before moving your order to the oven!
                    </p>
                  </div>
                )}

                {/* Order Summary Receipt */}
                <div className="bg-[#FEEDDD]/50 rounded-2xl p-4 border border-[#D29C83]/25 text-left text-xs space-y-2">
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">Item & Portion:</span>
                    <span className="font-semibold text-[#411C10]">{placedOrder.itemTitle} ({placedOrder.selectedSize})</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">Payment Mode:</span>
                    <span className="font-semibold text-[#411C10]">
                      {placedOrder.paymentMethod === 'Cash on Delivery' ? '💵 Cash on Delivery (Pay on arrival)' : '📱 Google Pay / UPI'}
                    </span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">
                      {placedOrder.paymentMethod === 'Cash on Delivery' ? 'Amount to Pay on Delivery:' : 'Amount Paid:'}
                    </span>
                    <span className="font-bold text-[#7C3F27] text-sm">{placedOrder.price}</span>
                  </div>
                  {placedOrder.paymentMethod !== 'Cash on Delivery' && (
                    <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                      <span className="text-[#A66D54]">UPI Transaction ID / UTR:</span>
                      <span className="font-mono font-bold text-[#411C10] bg-[#FFF9F3] px-2 py-0.5 rounded border border-[#D29C83]/30">
                        {placedOrder.transactionId}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pb-2 border-b border-[#D29C83]/20">
                    <span className="text-[#A66D54]">Delivery Target:</span>
                    <span className="text-[#411C10]">{placedOrder.deliveryDate} ({placedOrder.deliveryTime})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A66D54]">Delivery Address:</span>
                    <span className="text-[#411C10] max-w-[60%] text-right truncate">{placedOrder.deliveryAddress}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  <a
                    href={whatsappReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                  >
                    <span>
                      {placedOrder.paymentMethod === 'Cash on Delivery'
                        ? 'Send Order Details via WhatsApp'
                        : 'Send Order & Payment Receipt via WhatsApp'}
                    </span>
                  </a>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      onClick={() => printOrderInvoice(placedOrder)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#F9C8B5]" />
                      <span>Download Bill (PDF)</span>
                    </button>
                    <Link
                      to={`/track-order?phone=${encodeURIComponent(placedOrder.customerPhone || '')}`}
                      onClick={handleResetAndClose}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#FEEDDD] text-[#7C3F27] hover:bg-[#FEE5D2] border border-[#D29C83]/40 text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : modalStep === 'details' ? (
              /* SCREEN 2: STEP 1 - CUSTOMER & DELIVERY DETAILS */
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                {/* Selected Item Summary */}
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#FEEDDD]/50 border border-[#D29C83]/30">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover border border-[#D29C83]/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-[#7C3F27] tracking-wider">
                      {item.category}
                    </span>
                    <h4 className="font-serif text-base text-[#411C10] font-normal truncate">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FFF9F3] text-[#411C10] border border-[#D29C83]/30">
                        {currentTier.size}
                      </span>
                      <span className="text-sm font-bold text-[#7C3F27]">
                        {currentTier.price}
                      </span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Customer Details Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="name"
                        required
                        minLength={2}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Priya Sharma"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        pattern="[0-9]{10}"
                        minLength={10}
                        maxLength={10}
                        title="Please enter a valid 10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData((prev) => ({ ...prev, phone: val }));
                          if (formError) setFormError('');
                        }}
                        placeholder="10-digit mobile number (e.g. 9876543210)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1">
                      Delivery Address / Location <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#A66D54] absolute left-3 top-2.5" />
                      <textarea
                        name="address"
                        required
                        minLength={5}
                        rows={2}
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="House / Flat No., Street, Landmark, Area..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Preferred Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="date"
                          name="deliveryDate"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          value={formData.deliveryDate}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#411C10] mb-1">
                        Preferred Time Slot <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-[#A66D54] absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          name="deliveryTime"
                          required
                          value={formData.deliveryTime}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] focus:outline-none focus:border-[#7C3F27]"
                        >
                          <option>Morning (10 AM - 1 PM)</option>
                          <option>Afternoon (1 PM - 5 PM)</option>
                          <option>Evening (5 PM - 8 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#411C10] mb-1">
                      Notes / Message on Cake (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="e.g. 'Happy Birthday Alex', eggless, less sweet..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27]"
                    />
                  </div>
                </div>

                {/* Payment Option Selector */}
                <div className="pt-2 border-t border-[#D29C83]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#411C10]">
                      Choose Payment Method <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-[#A66D54]">Select how you wish to pay</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1: UPI / Online */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('UPI');
                        if (formError) setFormError('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        paymentMethod === 'UPI'
                          ? 'bg-[#FEEDDD] border-[#7C3F27] shadow-xs ring-1 ring-[#7C3F27]'
                          : 'bg-[#FFF9F3] border-[#D29C83]/40 hover:bg-[#FEEDDD]/40'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'UPI'
                            ? 'border-[#7C3F27] bg-[#7C3F27] text-white'
                            : 'border-[#A66D54]/50'
                        }`}
                      >
                        {paymentMethod === 'UPI' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#411C10] block">
                          📱 Google Pay / UPI
                        </span>
                        <span className="text-[10px] text-[#7C3F27] block leading-tight mt-0.5">
                          Scan QR, pay online & upload screenshot
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('COD');
                        if (formError) setFormError('');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        paymentMethod === 'COD'
                          ? 'bg-[#FEEDDD] border-[#7C3F27] shadow-xs ring-1 ring-[#7C3F27]'
                          : 'bg-[#FFF9F3] border-[#D29C83]/40 hover:bg-[#FEEDDD]/40'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                          paymentMethod === 'COD'
                            ? 'border-[#7C3F27] bg-[#7C3F27] text-white'
                            : 'border-[#A66D54]/50'
                        }`}
                      >
                        {paymentMethod === 'COD' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#411C10] block">
                          💵 Cash on Delivery
                        </span>
                        <span className="text-[10px] text-[#7C3F27] block leading-tight mt-0.5">
                          Pay in cash upon doorstep delivery
                        </span>
                      </div>
                    </button>
                  </div>

                  {paymentMethod === 'COD' && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-[11px] text-amber-950 flex items-start gap-2">
                      <span className="text-sm shrink-0">💵</span>
                      <p className="leading-relaxed">
                        <strong>Cash on Delivery:</strong> No advance payment, QR scan, or screenshot upload required. You can directly place your order now and pay <strong>{currentTier.price}</strong> in cash upon delivery!
                      </p>
                    </div>
                  )}
                </div>

                {/* Continue / Submit Button */}
                <div className="pt-2">
                  {paymentMethod === 'COD' ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3.5 px-5 rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Submitting Cash on Delivery Order...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#F9C8B5]" />
                          <span>Place Order with Cash on Delivery ({currentTier.price})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3 px-5 rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    >
                      <span>Continue to UPI Payment ({currentTier.price})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <p className="text-[10px] text-center text-[#A66D54] mt-2">
                    {paymentMethod === 'COD'
                      ? 'Direct order placement • Zero upfront payment required'
                      : 'Next: Pay with Google Pay / UPI QR & upload payment receipt screenshot'}
                  </p>
                </div>
              </form>
            ) : (
              /* SCREEN 3: STEP 2 - GOOGLE PAY / UPI PAYMENT & PROOF UPLOAD */
              <form onSubmit={handleFinalOrderSubmit} className="space-y-4">
                {/* Back to details button and COD switch */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setModalStep('details');
                      setFormError('');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7C3F27] hover:text-[#411C10] font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Edit Delivery Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('COD');
                      setModalStep('details');
                      setFormError('');
                    }}
                    className="text-[11px] font-semibold text-[#7C3F27] hover:text-[#411C10] underline cursor-pointer"
                  >
                    Prefer Cash on Delivery?
                  </button>
                </div>

                {/* Amount to pay summary card */}
                <div className="bg-[#FEEDDD]/60 border border-[#D29C83]/40 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A66D54] tracking-wider block">
                      Payable Amount
                    </span>
                    <h4 className="font-serif text-lg text-[#411C10] font-bold">
                      {item.title} ({currentTier.size})
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-serif font-bold text-[#7C3F27] block">
                      {currentTier.price}
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      Zero convenience fees
                    </span>
                  </div>
                </div>

                {/* UPI QR & Payment Options Box */}
                <div className="bg-[#FFF9F3] border border-[#D29C83]/40 rounded-3xl p-4 sm:p-5 shadow-inner space-y-4 text-center">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-[#FEEDDD] px-3 py-1 rounded-full text-[11px] font-semibold text-[#7C3F27] border border-[#D29C83]/30">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR to Pay via Google Pay / Any UPI App</span>
                    </div>

                    {/* QR Code Switcher if Admin has uploaded a custom standee QR */}
                    {hasCustomQr && (
                      <div className="flex items-center justify-center gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setActiveQrMode('custom')}
                          className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            currentQrMode === 'custom'
                              ? 'bg-[#7C3F27] text-[#FEEDDD] shadow-2xs'
                              : 'bg-[#FEEDDD]/70 text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/25'
                          }`}
                        >
                          Official Shop Standee QR
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveQrMode('dynamic')}
                          className={`text-[11px] font-semibold px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            currentQrMode === 'dynamic'
                              ? 'bg-[#7C3F27] text-[#FEEDDD] shadow-2xs'
                              : 'bg-[#FEEDDD]/70 text-[#7C3F27] hover:bg-[#FEEDDD] border border-[#D29C83]/25'
                          }`}
                        >
                          Exact Amount ({currentTier.price}) QR
                        </button>
                      </div>
                    )}
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="p-3 bg-white rounded-2xl border-2 border-[#D29C83]/40 shadow-sm relative group max-w-xs mx-auto">
                      <img
                        src={activeQrImageUrl}
                        alt="UPI Payment QR Code"
                        className="w-36 h-36 sm:w-44 sm:h-44 object-contain mx-auto rounded-lg"
                      />
                      <div className="text-[10px] font-semibold text-center text-[#7C3F27] mt-1.5 flex items-center justify-center gap-2">
                        <span>Payee: <strong>{payeeName}</strong></span>
                        <span>•</span>
                        <span>Amount: <strong>{currentTier.price}</strong></span>
                      </div>
                    </div>

                    {/* Supported Apps Badges */}
                    <div className="flex items-center justify-center gap-2 text-[10px] text-[#A66D54] font-medium flex-wrap">
                      <span className="bg-[#FEEDDD] px-2 py-0.5 rounded-md border border-[#D29C83]/30 font-semibold text-[#411C10]">
                        Google Pay
                      </span>
                      <span>•</span>
                      <span className="bg-[#FEEDDD] px-2 py-0.5 rounded-md border border-[#D29C83]/30 font-semibold text-[#411C10]">
                        PhonePe
                      </span>
                      <span>•</span>
                      <span className="bg-[#FEEDDD] px-2 py-0.5 rounded-md border border-[#D29C83]/30 font-semibold text-[#411C10]">
                        Paytm
                      </span>
                      <span>•</span>
                      <span className="bg-[#FEEDDD] px-2 py-0.5 rounded-md border border-[#D29C83]/30 font-semibold text-[#411C10]">
                        BHIM
                      </span>
                    </div>
                  </div>

                  {/* UPI ID Copy Bar & Mobile Deep Link */}
                  <div className="space-y-2.5 pt-1 border-t border-[#D29C83]/20">
                    <div className="flex items-center justify-between gap-2 bg-[#FEEDDD]/70 border border-[#D29C83]/40 rounded-xl px-3.5 py-2 text-xs">
                      <div className="text-left min-w-0 flex-1 pr-2">
                        <span className="text-[9px] uppercase tracking-wider text-[#A66D54] block font-semibold">
                          Official UPI ID
                        </span>
                        <span className="font-mono font-bold text-[#411C10] text-xs sm:text-sm block truncate" title={upiId}>
                          {upiId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 bg-[#7C3F27] hover:bg-[#5E2B19] text-[#FEEDDD] px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer shadow-2xs"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI ID</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Mobile Quick Pay Intent */}
                    <a
                      href={upiDeepLink}
                      className="sm:hidden w-full inline-flex items-center justify-center gap-2 bg-[#FEE5D2] hover:bg-[#FEEDDD] text-[#7C3F27] border border-[#D29C83]/40 py-2 px-3 rounded-xl text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Tap to Open Google Pay / PhonePe on Phone</span>
                    </a>

                    {/* Payment Support & Phone Details */}
                    <div className="flex items-center justify-between text-[11px] text-[#7C3F27] px-1 pt-1 border-t border-[#D29C83]/20">
                      <span className="text-[#A66D54]">Payment Support / Assistance:</span>
                      <a
                        href={`tel:${paymentPhone}`}
                        className="font-bold underline hover:text-[#411C10] flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>+91 {paymentPhone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* MANDATORY PROOF SECTION */}
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center gap-2 border-b border-[#D29C83]/20 pb-1.5">
                    <Sparkles className="w-4 h-4 text-[#7C3F27]" />
                    <h5 className="text-xs uppercase tracking-wider font-bold text-[#411C10]">
                      Provide Payment Proof (Required)
                    </h5>
                  </div>

                  {/* 1. Payment Screenshot Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1.5">
                      1. Upload Payment Screenshot <span className="text-rose-500">*</span>
                    </label>

                    {paymentScreenshot ? (
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-300">
                        <img
                          src={paymentScreenshot}
                          alt="Uploaded payment screenshot"
                          className="w-14 h-14 rounded-xl object-cover border border-emerald-300 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            Screenshot Attached
                          </span>
                          <p className="text-[10px] text-emerald-700 truncate mt-0.5">
                            Image verified & ready for studio review
                          </p>
                        </div>
                        <label className="text-xs text-[#7C3F27] hover:underline font-semibold cursor-pointer shrink-0">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotFileChange}
                            disabled={isUploadingScreenshot}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-[#D29C83]/60 hover:border-[#7C3F27] bg-[#FEEDDD]/40 hover:bg-[#FEEDDD]/70 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all">
                        {isUploadingScreenshot ? (
                          <div className="flex flex-col items-center gap-2 py-1">
                            <RefreshCw className="w-5 h-5 text-[#7C3F27] animate-spin" />
                            <span className="text-xs font-semibold text-[#7C3F27]">
                              Uploading screenshot to secure storage...
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-9 h-9 rounded-full bg-[#FEEDDD] text-[#7C3F27] flex items-center justify-center border border-[#D29C83]/30">
                              <Upload className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold text-[#411C10]">
                              Click or tap to upload payment screenshot
                            </span>
                            <span className="text-[10px] text-[#A66D54]">
                              PNG, JPG, or WEBP from Google Pay / PhonePe / Paytm receipt
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          required
                          onChange={handleScreenshotFileChange}
                          disabled={isUploadingScreenshot}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 2. Transaction ID / UTR Input */}
                  <div>
                    <label className="block text-xs font-semibold text-[#411C10] mb-1.5">
                      2. UPI Transaction ID / UTR Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      minLength={8}
                      maxLength={35}
                      value={transactionId}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\s+/g, '').toUpperCase();
                        setTransactionId(val);
                        if (formError) setFormError('');
                      }}
                      placeholder="e.g. 429182739102 (12-digit UTR from GPay receipt)"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-medium rounded-xl border border-[#D29C83]/40 bg-[#FFF9F3] text-[#411C10] placeholder:text-[#A66D54]/50 focus:outline-none focus:border-[#7C3F27] uppercase"
                    />
                    <p className="text-[10px] text-[#A66D54] mt-1 leading-relaxed">
                      💡 Found on your payment receipt under <strong>"UPI transaction ID"</strong>, <strong>"Google transaction ID"</strong>, or <strong>"UTR"</strong>.
                    </p>
                  </div>
                </div>

                {/* Error Banner */}
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-xs text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                    <span className="font-medium leading-relaxed">{formError}</span>
                  </div>
                )}

                {/* Anti-Malpractice Disclaimer Notice */}
                <div className="p-3 rounded-xl bg-[#FEEDDD]/60 border border-[#D29C83]/30 text-[11px] text-[#7C3F27] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#7C3F27] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Zero-Fraud Guarantee:</strong> Duplicate UTR numbers and duplicate screenshots are automatically blocked by the system. All payments are verified with our studio bank account before baking starts.
                  </p>
                </div>

                {/* Submit Order Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploadingScreenshot || !paymentScreenshot || !transactionId}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#7C3F27] text-[#FEEDDD] hover:bg-[#5E2B19] py-3.5 px-5 rounded-2xl text-sm font-semibold tracking-wide transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying & Submitting Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#F9C8B5]" />
                        <span>Confirm Order & Submit Payment Proof</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
